import test from 'node:test';
import assert from 'node:assert/strict';
import {formatApiAccess,formatApiError} from './request-telemetry';
const id='11111111-1111-4111-8111-111111111111';
test('operational logs expose only safe fields, never URLs, cookies, PII or tokens',()=>{
 const event={requestId:id,method:'POST',statusCode:403,durationMs:11.8,
  url:'/api/public/charges/PRIVATE_PAYMENT_TOKEN',ip:'192.0.2.55',
  cookie:'cf_session=PRIVATE_SECRET',email:'person@example.com',body:{password:'PRIVATE_SECRET'}};
 const result=formatApiAccess(event);
 assert.deepEqual(JSON.parse(result),{event:'http_api',requestId:id,method:'POST',status:403,durationMs:12});
 for(const secret of ['PRIVATE_PAYMENT_TOKEN','PRIVATE_SECRET','person@example.com','192.0.2.55'])
  assert.ok(!result.includes(secret));
});
test('untrusted method, invalid tracing and duration cannot inject arbitrary log content',()=>{
 const x=JSON.parse(formatApiAccess({requestId:'token-secret',method:'POST\\nAuthorization: xxx',
  statusCode:9999,durationMs:Infinity}));
 assert.equal(x.requestId,'invalid');
 assert.equal(x.method,'OTHER');assert.equal(x.status,500);assert.equal(x.durationMs,0);
 assert.deepEqual(JSON.parse(formatApiError('access-token-123')),
  {event:'api_unhandled_error',requestId:'invalid',errorCategory:'internal_error'});
});
test('known UUID and safe methods retained for incident correlation',()=>{
 const x=JSON.parse(formatApiAccess({requestId:id,method:'GET',statusCode:200,durationMs:100}));
 assert.equal(x.requestId,id);
 assert.equal(x.status,200);
});
