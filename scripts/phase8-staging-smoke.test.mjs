import test from 'node:test';
import assert from 'node:assert/strict';
import {stagingOrigin,probe} from './phase8-staging-smoke.mjs';
test('accept only explicit canonical public HTTPS staging origin',()=>{
 assert.equal(stagingOrigin('https://staging.example.org/'),'https://staging.example.org');
 for(const input of ['http://staging.example.org','https://localhost','https://127.0.0.1',
  'https://192.168.1.1','https://10.0.0.1','https://[::1]',
  'https://user:password@staging.example.org','https://staging.example.org/private',
  'https://staging.example.org?redirect=1','https://staging.example.org#hash']){
  assert.throws(()=>stagingOrigin(input),input);
 }
});
test('mocked healthy endpoint checks headers but cannot approve deploy',async()=>{
 let calls=0;
 const fetchFn=async(url,options)=>{
  calls++;
  assert.equal(url,'https://staging.example.org/api/health');
  assert.equal(options.redirect,'error');
  return {status:200,headers:{get:k=>({
   'content-type':'application/json','cache-control':'no-store',
   'x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'
  }[k]||null)},json:async()=>({ok:true,service:'cobraflux-api'})};
 };
 const r=await probe('https://staging.example.org',{fetchFn});
 assert.equal(calls,1);assert.equal(r.passed,true);
 assert.equal(r.operationallyHomologated,false);assert.equal(r.releaseApproved,false);
});
test('bad response or redirect is never green',async()=>{
 const r=await probe('https://example.org',{fetchFn:async()=>({
  status:302,headers:{get:()=>null},json:async()=>({ok:false})})});
 assert.equal(r.passed,false);
 assert.equal(r.releaseApproved,false);
});
