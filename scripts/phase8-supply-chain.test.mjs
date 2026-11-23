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
 const good='FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a\nCOPY package.json package-lock.json ./\nRUN npm ci --no-audit --no-fund\n';
 assert.deepEqual(validateDocker(good),[]);
 assert.ok(validateDocker(good.replace('npm ci','npm install')).length>0);
});
test('all live CI workflows are read-only and pinned; package lock consistent',async()=>{
 const r=await inspect();
 assert.deepEqual(r.failures,[]);
 assert.ok(r.workflows>=6);
 assert.ok(r.packages>100);
});

test('unreviewed mutable PostgreSQL and Node image references are rejected',()=>{
 const valid='permissions:\n  contents: read\njobs:\n  t:\n    services:\n      postgres:\n        image: postgres:16@sha256:3950ad7c3148ca2175ef1b6c36c9efbf78957ae8fbe8b3a5d7c35af50500382f\n    steps:\n      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262\n';
 assert.deepEqual(validateWorkflow(valid,'ci.yml'),[]);
 assert.ok(validateWorkflow(valid.replace('postgres:16@sha256:3950ad7c3148ca2175ef1b6c36c9efbf78957ae8fbe8b3a5d7c35af50500382f','postgres:16'),'ci.yml')
  .some(x=>x.includes('reviewed digest')));
 const docker='FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a\nCOPY package.json package-lock.json ./\nRUN npm ci --no-audit --no-fund\n';
 assert.deepEqual(validateDocker(docker),[]);
 assert.ok(validateDocker(docker.replace('node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a','node:22-alpine'))
  .some(x=>x.includes('reviewed digest')));
});
