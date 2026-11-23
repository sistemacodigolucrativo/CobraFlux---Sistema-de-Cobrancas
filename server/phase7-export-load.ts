// F7 BL-031: disposable PostgreSQL EXPLAIN evidence with synthetic 100k clients + 100k charges.
// No customer data, no changes to live DB; intentionally not an MVCC snapshot or production SLO.
import {randomUUID,createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const target=new URL(process.env.DATABASE_URL??'postgresql://invalid.invalid/invalid');
if(process.env.CF_EXPORT_LOAD_ISOLATED!=='true'||
 !['127.0.0.1','localhost'].includes(target.hostname)||
 target.port!=='5432'||target.pathname!=='/cobraflux_load_test')
 throw new Error('Refusing test unless explicit isolation flag and localhost/cobraflux_load_test');
const n=Number(process.env.CF_EXPORT_LOAD_ROWS??100000);
if(!Number.isSafeInteger(n)||n<100000||n>150000)throw new Error('100k–150k synthetic rows required');
const {pool}=await import('./db');
const db=await pool.connect();
const org=randomUUID(),other=randomUUID(),seed=randomUUID();
const all:Array<Record<string,unknown>>=[];
const uuidMd5=(s:string)=>{
 const h=createHash('md5').update(s).digest('hex');
 return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');
};
function planNodes(node:any):string[]{
 return [String(node['Node Type'])+(node['Index Name']?' '+node['Index Name']:''),...
 (node.Plans??[]).flatMap(planNodes)];
}
async function probe(dataset:'clients'|'charges',status:string|null,position:number){
 const alias=dataset==='clients'?'c':'ch';
 const afterAt=position?new Date(Date.parse('2026-11-20T12:00:00.000Z')-position*1000).toISOString():null;
 const afterId=position?uuidMd5(seed+':'+(dataset==='clients'?'client':'charge')+':'+position):null;
 const sql='EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT '+alias+'.id FROM '+dataset+' '+alias+
  ' WHERE '+alias+'.organization_id=$1 AND ($2::text IS NULL OR '+alias+'.status=$2)'+
  ' AND '+alias+'.created_at<=$3::timestamptz'+
  ' AND ($4::timestamptz IS NULL OR ('+alias+'.created_at,'+alias+'.id)<($4::timestamptz,$5::uuid))'+
  ' ORDER BY '+alias+'.created_at DESC,'+alias+'.id DESC LIMIT $6';
 const r=await db.query(sql,[org,status,'2026-11-21T00:00:00Z',afterAt,afterId,1000]);
 const report=r.rows[0]['QUERY PLAN'][0],steps=planNodes(report.Plan);
 assert.equal(Number(report.Plan['Actual Rows']),1000,'expected 1000 returned from '+dataset);
 assert.ok(steps.some(x=>/Index (Only )?Scan|Bitmap Index Scan/.test(x)),
  'missing index access in '+dataset+': '+JSON.stringify(steps));
 const metric={dataset,status:status??'all',location:position?'deep':'first',
  rows:n,executionMs:report['Execution Time'],plan:steps,
  sharedHit:report.Plan['Shared Hit Blocks'],sharedRead:report.Plan['Shared Read Blocks']};
 all.push(metric);
 process.stdout.write(JSON.stringify(metric)+'\n');
}
try{
 await db.query('BEGIN');
 await db.query("SET LOCAL statement_timeout='60000ms'");
 await db.query("SET LOCAL lock_timeout='3000ms'");
 await db.query('INSERT INTO organizations(id,name) VALUES($1,$2),($3,$4)',
  [org,'Synthetic load bench',other,'Synthetic isolation sentinel']);
 await db.query(
  'INSERT INTO clients(id,organization_id,name,phone,internal_code,created_at) '+
  "SELECT md5($2::text||':client:'||g::text)::uuid,$1::uuid,'Synthetic client '||g::text,"+
  "'+55'||lpad(g::text,11,'0'),'LOAD-'||g::text,"+
  "'2026-11-20T12:00:00Z'::timestamptz-g*interval '1 second' "+
  'FROM generate_series(1,$3::int) g',[org,seed,n]);
 await db.query(
  'INSERT INTO charges(id,public_token,organization_id,client_id,description,'+
  'amount_cents,discount_cents,due_date,created_at) '+
  "SELECT md5($2::text||':charge:'||g::text)::uuid,'SYNTHETIC-'||$2::text||'-'||g::text,"+
  "$1::uuid,md5($2::text||':client:'||g::text)::uuid,"+
  "'Synthetic charge '||g::text,1000,0,'2026-12-20'::date,"+
  "'2026-11-20T12:00:00Z'::timestamptz-g*interval '1 second' "+
  'FROM generate_series(1,$3::int) g',[org,seed,n]);
 await db.query('ANALYZE clients');await db.query('ANALYZE charges');
 await probe('clients',null,0);
 await probe('clients','active',50000);
 await probe('charges',null,0);
 await probe('charges','draft',50000);
 const q=await db.query('SELECT count(*)::int AS n FROM clients WHERE organization_id=$1',[other]);
 assert.equal(q.rows[0].n,0,'tenant separation');
 process.stdout.write(JSON.stringify({summary:'Synthetic load completed',clients:n,charges:n,
  probes:all.length,noSnapshot:true,productionLoadNotMeasured:true})+'\n');
}finally{
 try{await db.query('ROLLBACK');}finally{db.release();await pool.end();}
}
