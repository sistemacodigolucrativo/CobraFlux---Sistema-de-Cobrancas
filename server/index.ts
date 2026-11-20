import 'dotenv/config';
import express, { type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { pool, transaction } from './db';
import { csrfForSession, getCookie, normalizeEmail, passwordHash, passwordMatches, randomSecret, secureEquals, sha256 } from './security';

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
const appSecret = process.env.SESSION_SECRET ?? '';
if (appSecret.length < 32) throw new Error('SESSION_SECRET must have at least 32 characters.');
const prod = process.env.NODE_ENV === 'production';
const origin = process.env.APP_ORIGIN;
if (prod && (!origin || !origin.startsWith('https://'))) throw new Error('APP_ORIGIN must be an HTTPS origin in production.');
app.use(express.json({ limit: '64kb' }));
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
      'JOIN users u ON u.id=s.user_id JOIN memberships m ON m.user_id=u.id ' +
      'JOIN organizations o ON o.id=m.organization_id ' +
      "WHERE s.token_hash=$1 AND s.expires_at>now() AND s.revoked_at IS NULL AND o.status='active' " +
      'ORDER BY m.organization_id LIMIT 1',
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
const credential = z.object({ email: z.email(), password: z.string().min(8).max(128) }).strict();
const name = z.string().trim().min(2).max(120);

app.get('/api/health', route(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true, service: 'cobraflux-api' });
}));
app.post('/api/auth/register', route(async (req, res) => {
  if (!(await rateLimit('register:' + ip(req), 8, 60))) { res.status(429).json({ error: 'rate_limited' }); return; }
  const body = z.object({ name, businessName: name, email: z.email(), password: z.string().min(12).max(128) }).strict().parse(req.body);
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
  res.status(201).json({ ok: true, message: 'Conta criada. Faça login para continuar.' });
}));
app.post('/api/auth/login', route(async (req, res) => {
  const body = credential.parse(req.body);
  const email = normalizeEmail(body.email);
  const key = 'login:' + ip(req) + ':' + email;
  if (!(await rateLimit(key, 6, 15))) { res.status(429).json({ error: 'rate_limited' }); return; }
  const rows = await pool.query(
    'SELECT u.id, u.password_hash, m.role, o.status FROM users u ' +
    'JOIN memberships m ON m.user_id=u.id JOIN organizations o ON o.id=m.organization_id ' +
    'WHERE u.email=$1 LIMIT 1', [email]
  );
  const found = rows.rows[0];
  if (!found || !(await passwordMatches(body.password, found.password_hash))) {
    res.status(401).json({ error: 'invalid_credentials' }); return;
  }
  if (found.status !== 'active') { res.status(403).json({ error: 'account_unavailable' }); return; }
  if (found.role === 'super_admin') {
    res.status(403).json({ error: 'admin_mfa_not_configured', message: 'Login administrativo bloqueado até implantação de MFA.' }); return;
  }
  const token = randomSecret();
  await pool.query(
    "INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",
    [sha256(token),found.id]
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
  const emailApiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESET_EMAIL_FROM;
  const publicUrl = process.env.PUBLIC_APP_URL;
  if (!emailApiKey || !sender || !publicUrl) { res.json(response); return; }
  const found = await pool.query('SELECT id,email FROM users WHERE email=$1', [normalizeEmail(body.email)]);
  if (found.rowCount) {
    const token = randomSecret();
    await pool.query(
      "INSERT INTO password_resets(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')",
      [sha256(token), found.rows[0].id]
    );
    const link = publicUrl.replace(/\/$/, '') + '/#/recuperar?token=' + encodeURIComponent(token);
    const responseEmail = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + emailApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from:sender, to:[found.rows[0].email], subject:'Redefinição de senha CobraFlux',
        text:'Para redefinir sua senha, acesse: ' + link + '\nEste link expira em 30 minutos.' }),
    });
    if (!responseEmail.ok) console.error('reset_email_delivery_failed', responseEmail.status);
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

app.get('/api/clients', sessions, route(async (req, res) => {
  const q = z.object({ search: z.string().max(80).optional(), status: z.enum(['active','archived']).optional() }).parse(req.query);
  const rows = await pool.query(
    'SELECT id,name,phone,email,notes,status,whatsapp_opt_in,created_at,updated_at FROM clients ' +
    'WHERE organization_id=$1 AND ($2::text IS NULL OR name ILIKE $2) AND ($3::text IS NULL OR status=$3) ' +
    'ORDER BY created_at DESC LIMIT 200',
    [who(req).orgId, q.search ? '%' + q.search + '%' : null, q.status ?? null]
  );
  res.json({ items: rows.rows });
}));
app.post('/api/clients', sessions, csrf, route(async (req, res) => {
  const body = z.object({
    name, phone:z.string().trim().min(7).max(24), email:z.union([z.email(),z.literal('')]).optional(),
    notes:z.string().max(2000).default(''), whatsappOptIn:z.boolean().default(false)
  }).strict().parse(req.body);
  const p=who(req); const id=randomUUID();
  const row=await pool.query(
    'INSERT INTO clients(id,organization_id,name,phone,email,notes,whatsapp_opt_in) VALUES($1,$2,$3,$4,$5,$6,$7) ' +
    'RETURNING id,name,phone,email,notes,status,whatsapp_opt_in',
    [id,p.orgId,body.name,body.phone,body.email || null,body.notes,body.whatsappOptIn]
  );
  await audit(p.orgId,p.userId,'CLIENT_CREATED','client',id);
  res.status(201).json(row.rows[0]);
}));
app.patch('/api/clients/:id', sessions, csrf, route(async (req, res) => {
  const body = z.object({
    name:name.optional(), phone:z.string().trim().min(7).max(24).optional(),
    email:z.union([z.email(),z.literal('')]).optional(),
    notes:z.string().max(2000).optional(), status:z.enum(['active','archived']).optional(),
    whatsappOptIn:z.boolean().optional()
  }).strict().parse(req.body);
  if (!Object.keys(body).length) { res.status(400).json({ error: 'empty_patch' }); return; }
  const p=who(req);
  const row=await pool.query(
    'UPDATE clients SET name=coalesce($3,name),phone=coalesce($4,phone),' +
    "email=CASE WHEN $5::boolean THEN NULLIF($6::text,'') ELSE email END," +
    'notes=coalesce($7,notes),status=coalesce($8,status),whatsapp_opt_in=coalesce($9,whatsapp_opt_in),updated_at=now() ' +
    'WHERE organization_id=$1 AND id=$2 RETURNING id,name,phone,email,notes,status,whatsapp_opt_in',
    [p.orgId,req.params.id,body.name??null,body.phone??null,body.email!==undefined,body.email??null,body.notes??null,body.status??null,body.whatsappOptIn??null]
  );
  if (!row.rowCount) { res.status(404).json({ error: 'not_found' }); return; }
  await audit(p.orgId,p.userId,'CLIENT_UPDATED','client',req.params.id);
  res.json(row.rows[0]);
}));
app.get('/api/services', sessions, route(async (req, res) => {
  const rows=await pool.query(
    'SELECT id,name,description,price_cents,active,created_at FROM services WHERE organization_id=$1 ORDER BY created_at DESC',
    [who(req).orgId]
  );
  res.json({ items:rows.rows });
}));
app.post('/api/services', sessions, csrf, route(async (req, res) => {
  const body=z.object({ name,description:z.string().max(1000).default(''),priceCents:z.number().int().min(0).max(10000000000) }).strict().parse(req.body);
  const p=who(req); const id=randomUUID();
  const q=await pool.query(
    'INSERT INTO services(id,organization_id,name,description,price_cents) VALUES($1,$2,$3,$4,$5) RETURNING id,name,description,price_cents,active',
    [id,p.orgId,body.name,body.description,body.priceCents]
  );
  await audit(p.orgId,p.userId,'SERVICE_CREATED','service',id);
  res.status(201).json(q.rows[0]);
}));
app.get('/api/charges', sessions, route(async (req, res) => {
  const q=await pool.query(
    'SELECT ch.id,ch.public_token,ch.description,ch.amount_cents,ch.discount_cents,ch.due_date,ch.status,' +
    'cl.name AS client_name,ch.created_at FROM charges ch JOIN clients cl ON cl.id=ch.client_id ' +
    'WHERE ch.organization_id=$1 ORDER BY ch.created_at DESC LIMIT 200', [who(req).orgId]
  );
  res.json({ items:q.rows });
}));
app.post('/api/charges', sessions, csrf, route(async (req, res) => {
  const body=z.object({
    clientId:z.uuid(), description:z.string().trim().min(2).max(300),
    amountCents:z.number().int().positive().max(10000000000),
    discountCents:z.number().int().min(0).default(0),
    dueDate:z.iso.date()
  }).strict().parse(req.body);
  if (body.discountCents>=body.amountCents) { res.status(400).json({ error: 'invalid_discount' }); return; }
  const p=who(req); const id=randomUUID(); const pub=randomSecret(24);
  const q=await pool.query(
    "INSERT INTO charges(id,public_token,organization_id,client_id,description,amount_cents,discount_cents,due_date,status) " +
    "SELECT $1,$2,$3,id,$5,$6,$7,$8,'draft' FROM clients WHERE id=$4 AND organization_id=$3 AND status='active' RETURNING id,public_token,status",
    [id,pub,p.orgId,body.clientId,body.description,body.amountCents,body.discountCents,body.dueDate]
  );
  if (!q.rowCount) { res.status(404).json({ error: 'client_not_found' }); return; }
  await audit(p.orgId,p.userId,'CHARGE_DRAFT_CREATED','charge',id);
  res.status(201).json({ ...q.rows[0], message:'Rascunho persistido. Emissão Pix desabilitada até conectar PSP verificado.' });
}));
app.post('/api/charges/:id/cancel', sessions, csrf, route(async (req,res)=>{
  const p=who(req);
  const q=await pool.query(
    "UPDATE charges SET status='cancelled',updated_at=now() WHERE id=$1 AND organization_id=$2 AND status='draft' RETURNING id,status",
    [req.params.id,p.orgId]
  );
  if (!q.rowCount) { res.status(409).json({ error:'charge_not_cancellable' }); return; }
  await audit(p.orgId,p.userId,'CHARGE_CANCELLED','charge',req.params.id);
  res.json(q.rows[0]);
}));
app.get('/api/public/charges/:publicToken', route(async (req,res)=>{
  if (req.params.publicToken.length<20 || req.params.publicToken.length>120) { res.status(404).json({error:'not_found'}); return; }
  const q=await pool.query(
    'SELECT ch.description,ch.amount_cents,ch.discount_cents,ch.due_date,ch.status,o.name AS merchant, ' +
    'ch.pix_payload FROM charges ch JOIN organizations o ON o.id=ch.organization_id WHERE ch.public_token=$1',
    [req.params.publicToken]
  );
  if (!q.rowCount) { res.status(404).json({error:'not_found'}); return; }
  const r=q.rows[0];
  res.json({ description:r.description, amountCents:Number(r.amount_cents)-Number(r.discount_cents),
    dueDate:r.due_date, status:r.status, merchant:r.merchant,
    pixPayload: r.status==='pending' ? r.pix_payload : null,
    paymentEnabled:r.status==='pending' && Boolean(r.pix_payload) });
}));
app.get('/api/reports/overview', sessions, route(async (req,res)=>{
  const p=who(req);
  const q=await pool.query(
    'SELECT count(*)::int AS total_charges, ' +
    "count(*) FILTER (WHERE status='paid')::int AS paid_charges, " +
    "coalesce(sum(paid_cents) FILTER (WHERE status='paid'),0)::text AS total_paid_cents " +
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
app.listen(port, '0.0.0.0', () => console.log('CobraFlux API ready on port ' + port));
