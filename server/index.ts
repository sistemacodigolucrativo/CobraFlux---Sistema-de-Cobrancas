import 'dotenv/config';
import express, { type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z, ZodError } from 'zod';
import { pool, transaction } from './db';
import { canSendTransactionalEmail, publicLink, sendTransactionalEmail } from './email';
import { decryptTotpSecret, matchTotpStep } from './totp';
import { registerOperations } from './operations';
import { registerTeamRoutes } from './team';
import { registerSandboxPayments } from './sandbox-payments';
import { registerSandboxRefunds } from './sandbox-refunds';
import { registerSandboxCancellation } from './sandbox-cancellation';
import { registerRecurrences } from './recurrences';
import { registerWhatsApp } from './whatsapp-routes';
import { registerMetaWebhook } from './whatsapp-webhook';
import { csrfForSession, getCookie, normalizeEmail, passwordHash, passwordMatches, randomSecret, secureEquals, sha256 } from './security';

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
const appSecret = process.env.SESSION_SECRET ?? '';
if (appSecret.length < 32) throw new Error('SESSION_SECRET must have at least 32 characters.');
const prod = process.env.NODE_ENV === 'production';
const origin = process.env.APP_ORIGIN;
if (prod && (!origin || !origin.startsWith('https://'))) throw new Error('APP_ORIGIN must be an HTTPS origin in production.');
app.use(express.json({limit:'256kb',verify:(req,_res,bytes)=>{
  if(req.path==='/api/webhooks/meta-whatsapp'){
    (req as Request & {metaRawBody?:Buffer}).metaRawBody=Buffer.from(bytes);
  }
}}));
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use('/api', (req, res, next) => {
  const browserOrigin = req.headers.origin;
  if (browserOrigin && origin && browserOrigin !== origin) {
    res.status(403).json({ error: 'origin_not_allowed' });
    return;
  }
  if (browserOrigin && !origin && prod) {
    res.status(403).json({ error: 'origin_not_allowed' });
    return;
  }
  next();
});

type Principal = { userId: string; orgId: string; role: string; name: string; email: string; token: string };
type PrivateRequest = Request & { principal: Principal };
const who = (req: Request): Principal => (req as PrivateRequest).principal;
const route = (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { Promise.resolve(fn(req, res)).catch(next); };

const sessions: RequestHandler = (req, res, next) => {
  Promise.resolve().then(async () => {
    const token = getCookie(req.headers.cookie, 'cf_session');
    if (!token || token.length < 30 || token.length > 200) {
      res.status(401).json({ error: 'unauthorized' }); return;
    }
    const q = await pool.query(
      'SELECT u.id, u.name, u.email, m.organization_id, m.role FROM auth_sessions s ' +
      'JOIN users u ON u.id=s.user_id JOIN memberships m ON m.user_id=u.id AND m.organization_id=s.organization_id ' +
      'JOIN organizations o ON o.id=m.organization_id ' +
      "WHERE s.token_hash=$1 AND s.expires_at>now() AND s.revoked_at IS NULL AND o.status='active' " +
      "AND u.email_verified_at IS NOT NULL AND (m.role<>'super_admin' OR s.mfa_verified IS TRUE) " +
      'LIMIT 1',
      [sha256(token)]
    );
    if (!q.rowCount) { res.status(401).json({ error: 'unauthorized' }); return; }
    const data = q.rows[0];
    (req as PrivateRequest).principal = {
      userId: data.id, orgId: data.organization_id, role: data.role,
      name: data.name, email: data.email, token,
    };
    next();
  }).catch(next);
};
const csrf: RequestHandler = (req, res, next) => {
  const expected = csrfForSession(who(req).token, appSecret);
  const supplied = req.get('X-CF-CSRF') ?? '';
  if (!secureEquals(supplied, expected)) {
    res.status(403).json({ error: 'csrf_invalid' }); return;
  }
  next();
};
function sessionCookie(res: Response, token: string) {
  res.cookie('cf_session', token, { httpOnly: true, secure: prod, sameSite: 'lax', path: '/', maxAge: 7 * 86400000 });
}
function clearSession(res: Response) {
  res.clearCookie('cf_session', { httpOnly: true, secure: prod, sameSite: 'lax', path: '/' });
}
async function audit(orgId: string, actorId: string, action: string, kind: string, entityId: string) {
  await pool.query(
    'INSERT INTO audit_logs (id,organization_id,actor_id,action,entity_type,entity_id) VALUES ($1,$2,$3,$4,$5,$6)',
    [randomUUID(), orgId, actorId, action, kind, entityId]
  );
}
async function rateLimit(key: string, max: number, minutes: number): Promise<boolean> {
  const q = await pool.query(
    'INSERT INTO rate_limits (key,hits,window_started_at) VALUES ($1,1,now()) ' +
    "ON CONFLICT (key) DO UPDATE SET hits=CASE WHEN rate_limits.window_started_at < now()-($2 * interval '1 minute') THEN 1 ELSE rate_limits.hits+1 END, " +
    "window_started_at=CASE WHEN rate_limits.window_started_at < now()-($2 * interval '1 minute') THEN now() ELSE rate_limits.window_started_at END " +
    'RETURNING hits',
    [sha256(key), minutes]
  );
  return q.rows[0].hits <= max;
}
function ip(req: Request): string { return req.ip ?? req.socket.remoteAddress ?? 'unknown'; }
const credential = z.object({ email: z.email(), password: z.string().min(8).max(128), totpCode: z.string().regex(/^\d{6}$/).optional(), organizationId: z.uuid().optional() }).strict();
const name = z.string().trim().min(2).max(120);

async function issueVerification(userId:string,email:string):Promise<boolean>{
  if(!canSendTransactionalEmail())return false;
  const token=randomSecret();
  await transaction(async db=>{
    await db.query('UPDATE email_verifications SET consumed_at=now() WHERE user_id=$1 AND consumed_at IS NULL',[userId]);
    await db.query("INSERT INTO email_verifications(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '24 hours')",[sha256(token),userId]);
  });
  try{return await sendTransactionalEmail(email,'Confirme seu e-mail no CobraFlux',
    'Confirme sua conta pelo link: '+publicLink('verificar',token)+'\nEste link expira em 24 horas.');}
  catch(e){console.error('verify_email_delivery_failed',e instanceof Error?e.message:'transport_error');return false;}
}

const requireAdmin:RequestHandler=(req,res,next)=>{
  if(who(req).role!=='super_admin'){res.status(403).json({error:'admin_role_required'});return;}
  next();
};

app.get('/api/health', route(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true, service: 'cobraflux-api' });
}));
app.post('/api/auth/register', route(async (req, res) => {
  if (!(await rateLimit('register:' + ip(req), 8, 60))) { res.status(429).json({ error: 'rate_limited' }); return; }
  const body = z.object({ name, businessName: name, email: z.email(), password: z.string().min(12).max(128) }).strict().parse(req.body);
  if(prod && !canSendTransactionalEmail()){res.status(503).json({error:'email_delivery_not_configured'});return;}
  const email = normalizeEmail(body.email);
  const pwHash = await passwordHash(body.password);
  const orgId = randomUUID();
  const userId = randomUUID();
  await transaction(async (db) => {
    await db.query('INSERT INTO organizations(id,name) VALUES($1,$2)', [orgId, body.businessName]);
    await db.query('INSERT INTO users(id,name,email,password_hash) VALUES($1,$2,$3,$4)', [userId, body.name, email, pwHash]);
    await db.query("INSERT INTO memberships(user_id,organization_id,role) VALUES($1,$2,'owner')", [userId, orgId]);
    await db.query("INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id) VALUES($1,$2,$3,'REGISTER','organization',$2)", [randomUUID(),orgId,userId]);
  });
  await issueVerification(userId,email);
  res.status(201).json({ ok: true, message: 'Conta criada. Verifique seu e-mail antes de entrar.' });
}));
app.post('/api/auth/verify-email', route(async (req,res)=>{
  const body=z.object({token:z.string().min(20).max(200)}).strict().parse(req.body);
  if(!(await rateLimit('verify:'+ip(req),10,30))){res.status(429).json({error:'rate_limited'});return;}
  const changed=await transaction(async db=>{
    const found=await db.query(
      'UPDATE email_verifications SET consumed_at=now() WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>now() RETURNING user_id',
      [sha256(body.token)]
    );
    if(!found.rowCount)return false;
    await db.query('UPDATE users SET email_verified_at=coalesce(email_verified_at,now()) WHERE id=$1',[found.rows[0].user_id]);
    return true;
  });
  if(!changed){res.status(400).json({error:'verification_token_expired_or_invalid'});return;}
  res.json({ok:true});
}));
app.post('/api/auth/resend-verification', route(async(req,res)=>{
  const body=z.object({email:z.email()}).strict().parse(req.body);
  if(!(await rateLimit('resend-verification:'+ip(req)+':'+normalizeEmail(body.email),3,60))){
    res.status(429).json({error:'rate_limited'});return;
  }
  const generic={ok:true,message:'Se houver conta pendente e o serviço estiver configurado, enviaremos um novo link.'};
  if(canSendTransactionalEmail()){
    const user=await pool.query('SELECT id,email FROM users WHERE email=$1 AND email_verified_at IS NULL',[normalizeEmail(body.email)]);
    if(user.rowCount)await issueVerification(user.rows[0].id,user.rows[0].email);
  }
  res.json(generic);
}));

app.post('/api/auth/login', route(async (req, res) => {
  const body = credential.parse(req.body);
  const email = normalizeEmail(body.email);
  const key = 'login:' + ip(req) + ':' + email;
  if (!(await rateLimit(key, 6, 15))) { res.status(429).json({ error: 'rate_limited' }); return; }
  const rows = await pool.query(
    'SELECT u.id, u.password_hash, u.email_verified_at, m.organization_id, m.role, o.status, o.name AS organization_name FROM users u ' +
    'JOIN memberships m ON m.user_id=u.id JOIN organizations o ON o.id=m.organization_id ' +
    'WHERE u.email=$1 ORDER BY m.organization_id LIMIT 200', [email]
  );
  const first = rows.rows[0];
  if (!first || !(await passwordMatches(body.password, first.password_hash))) {
    res.status(401).json({ error: 'invalid_credentials' }); return;
  }
  if(!first.email_verified_at){
    res.status(403).json({error:'email_unverified',message:'Confirme seu endereço de e-mail antes de entrar.'});return;
  }
  const active = rows.rows.filter(m=>m.status==='active');
  if(!active.length){res.status(403).json({error:'account_unavailable'});return;}
  if(active.length>1&&!body.organizationId){
    res.status(409).json({
      error:'organization_selection_required',
      organizations:active.map(m=>({id:m.organization_id,name:m.organization_name,role:m.role}))
    });return;
  }
  const found = body.organizationId
    ? active.find(m=>m.organization_id===body.organizationId)
    : active[0];
  if(!found){res.status(403).json({error:'organization_not_accessible'});return;}
  let mfaVerified=false;
  if (found.role === 'super_admin') {
    if(!body.totpCode){res.status(401).json({error:'admin_mfa_required',message:'Informe o código MFA do autenticador.'});return;}
    const config=await pool.query('SELECT secret_encrypted FROM admin_mfa WHERE user_id=$1',[found.id]);
    if(!config.rowCount){res.status(403).json({error:'admin_mfa_not_enrolled'});return;}
    const step=matchTotpStep(decryptTotpSecret(config.rows[0].secret_encrypted),body.totpCode);
    if(step===null){res.status(401).json({error:'invalid_mfa_code'});return;}
    const used=await pool.query('UPDATE admin_mfa SET last_used_step=$2 WHERE user_id=$1 AND last_used_step<$2 RETURNING user_id',[found.id,step]);
    if(!used.rowCount){res.status(401).json({error:'mfa_code_already_used'});return;}
    mfaVerified=true;
  }
  const token = randomSecret();
  await pool.query(
    "INSERT INTO auth_sessions(token_hash,user_id,organization_id,mfa_verified,expires_at) VALUES($1,$2,$3,$4,now()+interval '7 days')",
    [sha256(token),found.id,found.organization_id,mfaVerified]
  );
  sessionCookie(res,token);
  res.json({ ok: true });
}));
app.get('/api/auth/me', sessions, (req, res) => {
  const p = who(req);
  res.json({
    user: { id: p.userId, name: p.name, email: p.email, role: p.role },
    organizationId: p.orgId,
    csrfToken: csrfForSession(p.token, appSecret),
  });
});
app.post('/api/auth/logout', sessions, csrf, route(async (req, res) => {
  await pool.query('UPDATE auth_sessions SET revoked_at=now() WHERE token_hash=$1', [sha256(who(req).token)]);
  clearSession(res);
  res.json({ ok: true });
}));
app.post('/api/auth/request-reset', route(async (req, res) => {
  const body = z.object({ email: z.email() }).strict().parse(req.body);
  if (!(await rateLimit('reset:' + ip(req), 4, 60))) { res.status(429).json({ error: 'rate_limited' }); return; }
  const response = { ok: true, message: 'Se a conta existir e o e-mail estiver configurado, você receberá instruções.' };
  if (!canSendTransactionalEmail()) { res.json(response); return; }
  const found = await pool.query('SELECT id,email FROM users WHERE email=$1', [normalizeEmail(body.email)]);
  if (found.rowCount) {
    const token = randomSecret();
    await pool.query(
      "INSERT INTO password_resets(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')",
      [sha256(token), found.rows[0].id]
    );
    try {
      await sendTransactionalEmail(found.rows[0].email,'Redefinição de senha CobraFlux',
        'Para redefinir sua senha, acesse: '+publicLink('recuperar',token)+'\\nEste link expira em 30 minutos.');
    }catch(e){console.error('reset_email_delivery_failed',e instanceof Error?e.message:'transport_error');}
  }
  res.json(response);
}));
app.post('/api/auth/reset-password', route(async (req, res) => {
  const body = z.object({ token: z.string().min(20).max(200), password: z.string().min(12).max(128) }).strict().parse(req.body);
  if (!(await rateLimit('reset-submit:' + ip(req), 8, 60))) { res.status(429).json({ error: 'rate_limited' }); return; }
  const hash = await passwordHash(body.password);
  const changed = await transaction(async (db) => {
    const q = await db.query(
      'UPDATE password_resets SET consumed_at=now() WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>now() RETURNING user_id',
      [sha256(body.token)]
    );
    if (!q.rowCount) return false;
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash,q.rows[0].user_id]);
    await db.query('UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1', [q.rows[0].user_id]);
    return true;
  });
  if (!changed) { res.status(400).json({ error: 'token_expired_or_invalid' }); return; }
  res.json({ ok: true });
}));

// Role-based gate: never authorize administrative actions based on a client-side hash route.
app.get('/api/admin/overview',sessions,requireAdmin,route(async(_req,res)=>{
  const q=await pool.query('SELECT (SELECT count(*)::int FROM organizations) AS organizations, (SELECT count(*)::int FROM users) AS users');
  res.json(q.rows[0]);
}));
app.get('/api/auth/sessions',sessions,route(async(req,res)=>{
  const p=who(req);
  const q=await pool.query(
    'SELECT id,created_at,expires_at,token_hash=$2 AS current FROM auth_sessions WHERE user_id=$1 AND revoked_at IS NULL AND expires_at>now() ORDER BY created_at DESC',
    [p.userId,sha256(p.token)]
  );
  res.json({items:q.rows});
}));
app.post('/api/auth/sessions/revoke-all',sessions,csrf,route(async(req,res)=>{
  const p=who(req);
  await pool.query('UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1',[p.userId]);
  clearSession(res);
  res.json({ok:true});
}));
app.delete('/api/auth/sessions/:id',sessions,csrf,route(async(req,res)=>{
  const p=who(req);
  const result=await pool.query(
    'UPDATE auth_sessions SET revoked_at=now() WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL RETURNING token_hash',
    [req.params.id,p.userId]
  );
  if(!result.rowCount){res.status(404).json({error:'not_found'});return;}
  if(secureEquals(result.rows[0].token_hash,sha256(p.token)))clearSession(res);
  res.json({ok:true});
}));

// Tenant-scoped operations and team access; independent of the demo's client-side navigation.
registerOperations(app, { sessions, csrf, route, who });
registerTeamRoutes(app, { sessions, csrf, route, who, rateLimit, ip });
registerSandboxPayments(app, { sessions, csrf, route, who });
registerSandboxRefunds(app, { sessions, csrf, route, who });
registerSandboxCancellation(app, { sessions, csrf, route, who });
registerRecurrences(app, { sessions, csrf, route, who });
registerWhatsApp(app, { sessions, csrf, route, who });
registerMetaWebhook(app);

app.get('/api/public/charges/:publicToken', route(async (req,res)=>{
  if (req.params.publicToken.length<20 || req.params.publicToken.length>120) { res.status(404).json({error:'not_found'}); return; }
  const q=await pool.query(
    'SELECT ch.description,ch.amount_cents,ch.discount_cents,ch.due_date,ch.status,o.name AS merchant, ' +
    'ch.pix_payload,ch.provider FROM charges ch JOIN organizations o ON o.id=ch.organization_id WHERE ch.public_token=$1',
    [req.params.publicToken]
  );
  if (!q.rowCount) { res.status(404).json({error:'not_found'}); return; }
  const r=q.rows[0];
  res.json({ description:r.description, amountCents:Number(r.amount_cents)-Number(r.discount_cents),
    dueDate:r.due_date, status:r.status, merchant:r.merchant,
    pixPayload: r.status==='pending' && r.provider==='asaas_sandbox' ? r.pix_payload : null,
    sandboxOnly:r.provider==='asaas_sandbox',
    paymentEnabled:r.status==='pending' && r.provider==='asaas_sandbox' && Boolean(r.pix_payload) });
}));
app.get('/api/reports/overview', sessions, route(async (req,res)=>{
  const p=who(req);
  const q=await pool.query(
    'SELECT count(*)::int AS total_charges, ' +
    "count(*) FILTER (WHERE status IN ('paid','partially_refunded') AND provider IS DISTINCT FROM 'asaas_sandbox')::int AS paid_charges, " +
    "coalesce(sum(paid_cents) FILTER (WHERE status IN ('paid','partially_refunded') AND provider IS DISTINCT FROM 'asaas_sandbox'),0)::text AS total_paid_cents, " +
    "count(*) FILTER (WHERE status IN ('paid','partially_refunded') AND provider='asaas_sandbox')::int AS sandbox_paid_charges, " +
    "coalesce(sum(paid_cents) FILTER (WHERE status IN ('paid','partially_refunded') AND provider='asaas_sandbox'),0)::text AS sandbox_paid_cents " +
    'FROM charges WHERE organization_id=$1',[p.orgId]
  );
  res.json(q.rows[0]);
}));
app.post('/api/public/contact', route(async (req,res)=>{
  if (!(await rateLimit('contact:' + ip(req), 5, 60))) { res.status(429).json({error:'rate_limited'}); return; }
  const body=z.object({name,email:z.email(),subject:z.string().trim().min(2).max(200),message:z.string().trim().min(8).max(4000)}).strict().parse(req.body);
  await pool.query(
    'INSERT INTO support_tickets(id,name,email,subject,message) VALUES ($1,$2,$3,$4,$5)',
    [randomUUID(),body.name,normalizeEmail(body.email),body.subject,body.message]
  );
  res.status(201).json({ok:true});
}));
app.use('/api', (_req,res) => res.status(404).json({error:'api_route_not_found'}));
const staticDir = resolve(process.cwd(), 'dist');
app.use(express.static(staticDir, { index: false, setHeaders: (res, file) => {
  if (file.includes('/assets/')) res.setHeader('Cache-Control','public,max-age=31536000,immutable');
} }));
app.get('*', (_req,res) => {
  const htmlPath=resolve(staticDir,'index.html');
  if (!existsSync(htmlPath)) {res.status(503).send('Frontend has not been built.');return;}
  res.setHeader('Cache-Control','no-cache');
  res.sendFile(htmlPath);
});
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) { res.status(400).json({error:'validation_error',issues:err.issues}); return; }
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as {code?:string}).code;
    if (code === '23505') { res.status(409).json({error:'already_exists'}); return; }
    if (code === '22P02' || code === '22007' || code === '22008' || code === '23503') {
      res.status(400).json({error:'invalid_reference_or_date'}); return;
    }
  }
  console.error('unhandled_api_error', err instanceof Error ? err.message : err);
  res.status(500).json({error:'server_error'});
});
const port=Number(process.env.PORT ?? 8080);
if (process.env.CF_NO_LISTEN !== 'true') {
  app.listen(port, '0.0.0.0', () => console.log('CobraFlux API ready on port ' + port));
}
export { app };
