import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProductionConfig} from './production-config';

const secret='unit-test-password-does-not-go-to-production-123'; // synthetic test value
const good=()=>({
 NODE_ENV:'production',APP_ORIGIN:'https://staging.example.org',
 DATABASE_SSL:'require',SESSION_SECRET:secret
});
test('strict HTTPS origin and required TLS configuration: no network',()=>{
 assert.deepEqual(validateProductionConfig(good()),{origin:'https://staging.example.org'});
 assert.deepEqual(validateProductionConfig({...good(),APP_ORIGIN:'https://staging.example.org/'}),
  {origin:'https://staging.example.org'});
 assert.deepEqual(validateProductionConfig({...good(),APP_ORIGIN:'https://staging.example.org:444'}),
  {origin:'https://staging.example.org:444'});
});
test('unsafe production origins rejected, including local, path and embedded credentials',()=>{
 for(const origin of [
  'http://staging.example.org','https://evil.example.org@staging.example.org',
  'https://user:password@staging.example.org','https://staging.example.org/path',
  'https://staging.example.org/?x=1','https://staging.example.org/#fragment',
  'https://localhost','https://app.localhost','https://127.0.0.1:443',
  'https://[::1]','https://0.0.0.0',' https://staging.example.org',
  'https://staging.example.org:443','not a url'
 ]){
  assert.throws(()=>validateProductionConfig({...good(),APP_ORIGIN:origin}),/APP_ORIGIN/,origin);
 }
});
test('production requires database TLS verification and non-placeholder secret',()=>{
 assert.throws(()=>validateProductionConfig({...good(),DATABASE_SSL:undefined}),/DATABASE_SSL/);
 assert.throws(()=>validateProductionConfig({...good(),DATABASE_SSL:'disable'}),/DATABASE_SSL/);
 for(const bad of ['short','ci-test-secret-change-me-not-production-123456789',
  'ci-only-f8-drill-not-for-any-real-application-12345',
  'abc-change-me-123456789012345678901234']){
  assert.throws(()=>validateProductionConfig({...good(),SESSION_SECRET:bad}),/SESSION_SECRET/);
 }
});
test('no secret disclosure and test-mode compatibility',()=>{
 const injected='ci-test-secret-VERY-SENSITIVE-DO-NOT-LOG-0987654321';
 assert.throws(()=>validateProductionConfig({...good(),SESSION_SECRET:injected}),e=>{
  assert.equal(e instanceof Error,true);
  assert.equal(String(e).includes(injected),false);
  return true;
 });
 assert.deepEqual(validateProductionConfig({NODE_ENV:'test',APP_ORIGIN:'http://localhost:3000',
  DATABASE_SSL:undefined,SESSION_SECRET:'short'}),{origin:'http://localhost:3000'});
});
