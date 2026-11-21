import 'dotenv/config';
import { pool, transaction } from './db';
import { createTotpSecret, encryptTotpSecret } from './totp';
import { normalizeEmail } from './security';

/** Privileged one-time enrollment. Run directly on trusted operator shell, never CI or client. */
const email=normalizeEmail(process.env.ADMIN_USER_EMAIL??'');
if(!email || !process.env.MFA_ENCRYPTION_KEY){
  throw new Error('ADMIN_USER_EMAIL and MFA_ENCRYPTION_KEY must be configured on operator shell.');
}
const secret=createTotpSecret();
try{
  const result=await transaction(async db=>{
    const q=await db.query('SELECT id,email_verified_at FROM users WHERE email=$1 FOR UPDATE',[email]);
    if(!q.rowCount)throw new Error('Admin user must already exist.');
    if(!q.rows[0].email_verified_at)throw new Error('Admin e-mail must already be verified.');
    const userId=q.rows[0].id;
    const membership=await db.query('SELECT organization_id,role FROM memberships WHERE user_id=$1 FOR UPDATE',[userId]);
    if(membership.rowCount!==1)throw new Error('Admin requires exactly one membership during bootstrap.');
    if(membership.rows[0].role==='super_admin')throw new Error('Admin MFA is already provisioned.');
    await db.query('INSERT INTO admin_mfa(user_id,secret_encrypted) VALUES ($1,$2)',[userId,encryptTotpSecret(secret)]);
    await db.query("UPDATE memberships SET role='super_admin' WHERE user_id=$1",[userId]);
    await db.query('UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1',[userId]);
    return userId;
  });
  console.log('Admin role provisioned for',email,'user',result);
  console.log('ENROLL THIS TOTP SECRET NOW, THEN REMOVE IT FROM TERMINAL HISTORY: ',secret);
  console.log('Issuer: CobraFlux; account:',email);
}catch(e){console.error('MFA provisioning failed:',e instanceof Error?e.message:e);process.exitCode=1;}
finally{await pool.end();}
