import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverInText,validateInventory,inspect} from './phase8-secrets-audit.mjs';
test('only variable names are discovered from runtime, build and required shell syntax',()=>{
 assert.deepEqual(discoverInText("process.env.RESEND_API_KEY;process.env['DATABASE_URL'];import.meta.env.VITE_APP_MODE",
  'server/demo.ts'),['DATABASE_URL','RESEND_API_KEY','VITE_APP_MODE']);
 const shell='echo "$'+'{BACKUP_FILE:?missing}" "$'+'{STAMP}"';
 assert.deepEqual(discoverInText(shell,'scripts/backup-db.sh'),['BACKUP_FILE']);
 assert.deepEqual(discoverInText("env.SESSION_SECRET;env.DATABASE_SSL",'server/production-config.ts'),
  ['DATABASE_SSL','SESSION_SECRET']);
});
test('unclassified, duplicate, browser-secret and values are rejected',()=>{
 const entry={name:'RESEND_API_KEY',kind:'secret',when:'staging',storage:'secret-manager',handling:'restricted'};
 const inventory={schemaVersion:1,allowedKinds:['secret','browser-public'],items:[entry]};
 assert.deepEqual(validateInventory(inventory,new Set(['RESEND_API_KEY'])),[]);
 assert.ok(validateInventory(inventory,new Set(['RESEND_API_KEY','UNKNOWN_SECRET']))
  .some(x=>x.includes('UNKNOWN_SECRET')));
 const bad={...inventory,items:[entry,{...entry,name:'VITE_SECRET_KEY',value:'must-never-be-here',storage:'environment'}]};
 const result=validateInventory(bad,new Set(['RESEND_API_KEY','VITE_SECRET_KEY']));
 assert.ok(result.some(x=>x.includes('VITE_')));
 assert.ok(result.some(x=>x.includes('Unexpected field')));
 assert.ok(result.some(x=>x.includes('not in secret-manager')));
});
test('repository variable inventory matches source files without loading real env values',async()=>{
 const r=await inspect();
 assert.equal(r.errors.length,0,r.errors.join('\n'));
 assert.ok(r.observed.size>=20);
 assert.ok(r.references.SESSION_SECRET.includes('server/index.ts'));
 assert.ok(r.references.VITE_APP_MODE.includes('src/App.tsx'));
 assert.ok(r.observed.has('PAYMENT_CREDENTIAL_ENCRYPTION_KEY'));
 assert.ok(r.observed.has('WHATSAPP_GO_LIVE_APPROVED'));
});
