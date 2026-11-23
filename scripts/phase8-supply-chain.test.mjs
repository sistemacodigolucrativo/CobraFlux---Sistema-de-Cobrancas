import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLock,validateWorkflow,validateDocker,inspect} from './phase8-supply-chain.mjs';
test('lock root dependencies must exactly match package manifest',()=>{
 const pkg={name:'test',version:'1',dependencies:{foo:'^1'},devDependencies:{bar:'2'}};
 const lock={name:'test',version:'1',lockfileVersion:3,packages:{'':{dependencies:{foo:'^1'},devDependencies:{bar:'2'}},'node_modules/foo':{}}};
 assert.deepEqual(validateLock(pkg,lock),[]);
 assert.ok(validateLock({...pkg,dependencies:{foo:'^2'}},lock).some(x=>x.includes('Runtime')));
 assert.ok(validateLock({...pkg,devDependencies:{bar:'3'}},lock).some(x=>x.includes('Dev')));
 assert.ok(validateLock(pkg,{...lock,lockfileVersion:2}).some(x=>x.includes('v3')));
});
test('mutable actions, non-frozen installs and write permissions are rejected',()=>{
 const prefix='permissions:\n  contents: read\njobs:\n  t:\n    steps:\n';
 const valid=prefix+'      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4\n      - run: npm ci --no-audit --no-fund\n';
 assert.deepEqual(validateWorkflow(valid,'test.yml'),[]);
 assert.ok(validateWorkflow(prefix+'      - uses: actions/checkout@v4\n','test.yml')
  .some(x=>x.includes('unpinned')));
 assert.ok(validateWorkflow(valid.replace('npm ci','npm install'),'test.yml')
  .some(x=>x.includes('npm install')));
 assert.ok(validateWorkflow(valid.replace('contents: read','contents: write'),'test.yml')
  .some(x=>x.includes('write')));
});
test('container cannot install outside committed lockfile',()=>{
 const good='FROM node:22-alpine\nCOPY package.json package-lock.json ./\nRUN npm ci --no-audit --no-fund\n';
 assert.deepEqual(validateDocker(good),[]);
 assert.ok(validateDocker(good.replace('npm ci','npm install')).length>0);
});
test('all live CI workflows are read-only and pinned; package lock consistent',async()=>{
 const r=await inspect();
 assert.deepEqual(r.failures,[]);
 assert.ok(r.workflows>=6);
 assert.ok(r.packages>100);
});
