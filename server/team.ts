import { randomUUID } from 'node:crypto';
import type { Express, Request, Response, RequestHandler } from 'express';
import { z } from 'zod';
import { pool, transaction } from './db';
import { canSendTransactionalEmail, publicLink, sendTransactionalEmail } from './email';
import { normalizeEmail, passwordHash, randomSecret, sha256 } from './security';

type Principal = { userId:string; orgId:string; role:string; email:string; name:string; token:string };
type Deps = {
  sessions:RequestHandler;
  csrf:RequestHandler;
  who:(req:Request)=>Principal;
  route:(handler:(req:Request,res:Response)=>Promise<unknown>)=>RequestHandler;
  rateLimit:(key:string,max:number,minutes:number)=>Promise<boolean>;
  ip:(req:Request)=>string;
};
type Accepted = { organizationId:string; organizationName:string };
const invitationToken = z.string().min(30).max(150);
const emailSchema = z.email().transform(normalizeEmail);
const invitationParam = z.object({id:z.uuid()});
const ownerRequired=(req:Request,res:Response,who:Deps['who']):boolean=>{
  if(['owner','super_admin'].includes(who(req).role))return true;
  res.status(403).json({error:'owner_role_required'});
  return false;
};
async function audit(db:{query:Function},p:Principal,action:string,entityId:string,details:object={}){
  await db.query('INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)',
    [randomUUID(),p.orgId,p.userId,action,'team',entityId,JSON.stringify(details)]);
}
async function acceptInvitation(db:{query:Function},token:string,email:string,userId:string):Promise<Accepted|null>{
  const q=await db.query(
    "SELECT i.id,i.organization_id,i.email,o.name AS organization_name FROM team_invitations i " +
    "JOIN organizations o ON o.id=i.organization_id WHERE i.token_hash=$1 AND i.accepted_at IS NULL " +
    "AND i.revoked_at IS NULL AND i.expires_at>now() AND o.status='active' FOR UPDATE OF i",
    [sha256(token)]
  );
  if(!q.rowCount)return null;
  const entry=q.rows[0];
  if(entry.email!==email)return null;
  const inserted=await db.query(
    "INSERT INTO memberships(user_id,organization_id,role) VALUES($1,$2,'operator') ON CONFLICT DO NOTHING RETURNING user_id",
    [userId,entry.organization_id]
  );
  if(!inserted.rowCount)return null;
  await db.query('UPDATE team_invitations SET accepted_at=now() WHERE id=$1',[entry.id]);
  await db.query(
    "INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) " +
    "VALUES ($1,$2,$3,'TEAM_INVITATION_ACCEPTED','team',$3,$4::jsonb)",
    [randomUUID(),entry.organization_id,userId,JSON.stringify({invitationId:entry.id})]
  );
  return {organizationId:entry.organization_id,organizationName:entry.organization_name};
}
export function registerTeamRoutes(app:Express,{sessions,csrf,who,route,rateLimit,ip}:Deps):void{
  // Email address and role are never inferred from client-provided organization IDs.
  app.get('/api/team',sessions,route(async(req,res)=>{
    if(!ownerRequired(req,res,who))return;
    const p=who(req);
    const [members,invites]=await Promise.all([
      pool.query("SELECT u.id,u.name,u.email,m.role,m.organization_id FROM memberships m JOIN users u ON u.id=m.user_id " +
        "WHERE m.organization_id=$1 ORDER BY CASE WHEN m.role='owner' THEN 0 ELSE 1 END,u.name LIMIT 200",[p.orgId]),
      pool.query('SELECT id,email,role,created_at,expires_at,accepted_at,revoked_at FROM team_invitations '+
        'WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 100',[p.orgId])
    ]);
    res.json({members:members.rows,invitations:invites.rows});
  }));

  app.post('/api/team/invitations',sessions,csrf,route(async(req,res)=>{
    if(!ownerRequired(req,res,who))return;
    const p=who(req);
    if(!(await rateLimit('team-invites:'+p.orgId,20,60))){
      res.status(429).json({error:'invite_rate_limited'});return;
    }
    if(!canSendTransactionalEmail()){
      res.status(503).json({error:'email_delivery_not_configured'});return;
    }
    const {email}=z.object({email:emailSchema}).strict().parse(req.body);
    if(email===p.email){res.status(409).json({error:'already_member'});return;}
    const token=randomSecret();
    const invitationId=randomUUID();
    const data=await transaction(async db=>{
      const member=await db.query('SELECT 1 FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.organization_id=$1 AND u.email=$2',
        [p.orgId,email]);
      if(member.rowCount)return {error:'already_member'} as const;
      await db.query("UPDATE team_invitations SET revoked_at=now() WHERE organization_id=$1 AND email=$2 " +
        'AND accepted_at IS NULL AND revoked_at IS NULL',[p.orgId,email]);
      const row=await db.query("INSERT INTO team_invitations(id,organization_id,invited_by,email,token_hash,expires_at) " +
        "VALUES($1,$2,$3,$4,$5,now()+interval '48 hours') RETURNING id,expires_at",
        [invitationId,p.orgId,p.userId,email,sha256(token)]);
      const organization=await db.query('SELECT name FROM organizations WHERE id=$1',[p.orgId]);
      await audit(db,p,'TEAM_INVITATION_CREATED',invitationId,{email});
      return {id:row.rows[0].id,expiresAt:row.rows[0].expires_at,organizationName:organization.rows[0].name};
    });
    if('error' in data){res.status(409).json({error:data.error});return;}
    let delivered=false;
    try{
      delivered=await sendTransactionalEmail(email,'Convite para a equipe CobraFlux',
        'Você foi convidado(a) para colaborar em '+data.organizationName+'.\n' +
        'Para aceitar, acesse '+publicLink('convite',token)+'\nEste convite é individual e expira em 48 horas.');
    }catch(e){console.error('team_invite_delivery_error',e instanceof Error?e.message:'transport_error');}
    if(!delivered){
      await pool.query('UPDATE team_invitations SET revoked_at=now() WHERE id=$1 AND accepted_at IS NULL',[invitationId]);
      res.status(502).json({error:'invite_delivery_failed'});return;
    }
    res.status(201).json({id:data.id,email,role:'operator',expiresAt:data.expiresAt});
  }));

  app.post('/api/team/invitations/:id/revoke',sessions,csrf,route(async(req,res)=>{
    if(!ownerRequired(req,res,who))return;
    const {id}=invitationParam.parse(req.params),p=who(req);
    const row=await transaction(async db=>{
      const result=await db.query('UPDATE team_invitations SET revoked_at=now() '+
        'WHERE id=$1 AND organization_id=$2 AND accepted_at IS NULL AND revoked_at IS NULL RETURNING id',
        [id,p.orgId]);
      if(result.rowCount)await audit(db,p,'TEAM_INVITATION_REVOKED',id);
      return result.rowCount;
    });
    if(!row){res.status(404).json({error:'invitation_not_pending'});return;}
    res.json({ok:true});
  }));

  app.delete('/api/team/members/:userId',sessions,csrf,route(async(req,res)=>{
    if(!ownerRequired(req,res,who))return;
    const {userId}=z.object({userId:z.uuid()}).parse(req.params),p=who(req);
    if(userId===p.userId){res.status(403).json({error:'cannot_remove_self'});return;}
    const result=await transaction(async db=>{
      const member=await db.query('DELETE FROM memberships WHERE organization_id=$1 AND user_id=$2 AND role=$3 RETURNING user_id',
        [p.orgId,userId,'operator']);
      if(!member.rowCount)return false;
      // Immediate revocation for this tenant, without disconnecting unrelated organizations.
      await db.query('UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1 AND organization_id=$2 AND revoked_at IS NULL',
        [userId,p.orgId]);
      await audit(db,p,'TEAM_MEMBER_REVOKED',userId);
      return true;
    });
    if(!result){res.status(404).json({error:'operator_not_found'});return;}
    res.json({ok:true});
  }));

  // High-entropy bearer invitation only reveals this invite's organization/email.
  app.get('/api/team/invitation/:token',route(async(req,res)=>{
    const token=invitationToken.parse(req.params.token);
    if(!(await rateLimit('team-preview:'+ip(req),40,60))){res.status(429).json({error:'rate_limited'});return;}
    const q=await pool.query('SELECT i.email,i.expires_at,o.name AS organization_name FROM team_invitations i '+
      "JOIN organizations o ON o.id=i.organization_id WHERE i.token_hash=$1 AND i.accepted_at IS NULL "+
      "AND i.revoked_at IS NULL AND i.expires_at>now() AND o.status='active'",[sha256(token)]);
    if(!q.rowCount){res.status(404).json({error:'invite_expired_or_invalid'});return;}
    res.json({email:q.rows[0].email,organizationName:q.rows[0].organization_name,expiresAt:q.rows[0].expires_at});
  }));

  // New account: no demo organization is created; invite proves ownership of mailbox.
  app.post('/api/team/activate',route(async(req,res)=>{
    if(!(await rateLimit('team-activate:'+ip(req),8,60))){res.status(429).json({error:'rate_limited'});return;}
    const body=z.object({token:invitationToken,name:z.string().trim().min(2).max(120),
      password:z.string().min(12).max(128)}).strict().parse(req.body);
    const password=await passwordHash(body.password);
    const result=await transaction(async db=>{
      const invite=await db.query("SELECT i.email FROM team_invitations i JOIN organizations o ON o.id=i.organization_id " +
        "WHERE i.token_hash=$1 AND i.revoked_at IS NULL AND i.accepted_at IS NULL AND i.expires_at>now() "+
        "AND o.status='active' FOR UPDATE OF i",[sha256(body.token)]);
      if(!invite.rowCount)return {error:'invite_expired_or_invalid'} as const;
      const email=invite.rows[0].email;
      const existing=await db.query('SELECT 1 FROM users WHERE email=$1',[email]);
      if(existing.rowCount)return {error:'existing_account_login_required'} as const;
      const userId=randomUUID();
      await db.query('INSERT INTO users(id,name,email,password_hash,email_verified_at) VALUES($1,$2,$3,$4,now())',
        [userId,body.name,email,password]);
      const accepted=await acceptInvitation(db,body.token,email,userId);
      if(!accepted)throw new Error('invite_accept_race');
      return {...accepted,email};
    });
    if('error' in result){res.status(result.error==='existing_account_login_required'?409:404).json(result);return;}
    res.status(201).json({...result,ok:true,message:'Conta criada. Entre com sua senha para acessar a equipe.'});
  }));

  // Existing verified account: must sign in as the *invited email address*.
  app.post('/api/team/accept',sessions,csrf,route(async(req,res)=>{
    const body=z.object({token:invitationToken}).strict().parse(req.body),p=who(req);
    const accepted=await transaction(async db=>acceptInvitation(db,body.token,p.email,p.userId));
    if(!accepted){res.status(404).json({error:'invite_expired_invalid_or_wrong_account'});return;}
    res.json({...accepted,ok:true});
  }));

  app.get('/api/auth/organizations',sessions,route(async(req,res)=>{
    const p=who(req);
    const q=await pool.query('SELECT m.organization_id AS id,o.name,m.role FROM memberships m JOIN organizations o ' +
      "ON o.id=m.organization_id WHERE m.user_id=$1 AND o.status='active' ORDER BY o.name",[p.userId]);
    res.json({items:q.rows,currentOrganizationId:p.orgId});
  }));

  app.post('/api/auth/switch-organization',sessions,csrf,route(async(req,res)=>{
    const {organizationId}=z.object({organizationId:z.uuid()}).strict().parse(req.body),p=who(req);
    const updated=await pool.query('UPDATE auth_sessions s SET organization_id=$1 FROM memberships m '+
      "JOIN organizations o ON o.id=m.organization_id AND o.status='active' WHERE s.token_hash=$2 AND s.user_id=$3 "+
      "AND m.user_id=$3 AND m.organization_id=$1 AND (m.role<>'super_admin' OR s.mfa_verified IS TRUE) RETURNING s.organization_id",
      [organizationId,sha256(p.token),p.userId]);
    if(!updated.rowCount){res.status(403).json({error:'organization_not_accessible'});return;}
    res.json({ok:true,organizationId});
  }));
}
