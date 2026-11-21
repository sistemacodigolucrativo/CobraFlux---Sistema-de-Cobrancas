import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {eligibleUtilityTemplates,verifyMetaSignature,inBusinessHours,
  encryptWhatsAppToken,decryptWhatsAppToken,WhatsAppCloud,GRAPH_ORIGIN} from './whatsapp-cloud';
test('Meta callback HMAC uses raw bytes and rejects wrong key, malformed hex, changed body',()=>{
  const b=Buffer.from('{"entry":[{"id":"123"}]}');
  const sig='sha256='+createHmac('sha256','app_secret_test').update(b).digest('hex');
  assert.equal(verifyMetaSignature(b,sig,'app_secret_test'),true);
  assert.equal(verifyMetaSignature(Buffer.from('x'),sig,'app_secret_test'),false);
  assert.equal(verifyMetaSignature(b,'sha256=nothex','app_secret_test'),false);
  assert.equal(verifyMetaSignature(b,sig,'wrong'),false);
});
test('per-organization AES-GCM token encryption cannot cross tenant boundaries',()=>{
  process.env.WHATSAPP_CREDENTIAL_ENCRYPTION_KEY='ab'.repeat(32);
  const cipher=encryptWhatsAppToken('EAA_very_long_meta_token_for_test','11111111-1111-4111-8111-111111111111');
  assert.equal(decryptWhatsAppToken(cipher,'11111111-1111-4111-8111-111111111111'),'EAA_very_long_meta_token_for_test');
  assert.throws(()=>decryptWhatsAppToken(cipher,'22222222-2222-4222-8222-222222222222'));
});
test('template approval comes from Meta; only 3-argument approved UTILITY templates accepted',()=>{
  const valid={name:'cobranca_lembrete',language:'pt_BR',status:'APPROVED',category:'UTILITY',
    components:[{type:'BODY',text:'Olá {{1}}, referente {{2}} com vencimento {{3}}.'}]};
  assert.deepEqual(eligibleUtilityTemplates({data:[valid,{...valid,status:'PAUSED'},
    {...valid,category:'MARKETING'},{...valid,name:'broken',components:[{type:'BODY',text:'{{1}}'}]}]}),
    [{name:'cobranca_lembrete',language:'pt_BR',category:'UTILITY',parameterCount:3}]);
  assert.throws(()=>eligibleUtilityTemplates({data:[valid],paging:{next:'https://graph.facebook.com/next'}}));
});
test('Meta API send is pinned to official origin and sends only approved template body',async()=>{
  const calls:Array<{url:string;init:RequestInit}>=[];
  const mock=(async(url:string,init:RequestInit)=>{
    calls.push({url,init});
    return new Response(JSON.stringify({messages:[{id:'wamid.12345678'}]}),{status:200});
  }) as typeof fetch;
  const adapter=new WhatsAppCloud('EAA_testing_long_lived_token',mock);
  const mid=await adapter.sendApprovedReminder({
    phoneNumberId:'123456789000',recipient:'5511999999999',name:'cobranca_lembrete',
    language:'pt_BR',values:['Maria','Assinatura','2026-12-31']
  });
  assert.equal(mid,'wamid.12345678');
  assert.equal(calls[0].url,GRAPH_ORIGIN+'/123456789000/messages');
  const body=JSON.parse(String(calls[0].init.body));
  assert.equal(body.type,'template');
  assert.equal(body.template.components[0].parameters.length,3);
});
test('quiet hours follow São Paulo rather than server time',()=>{
  assert.equal(inBusinessHours(new Date('2026-11-23T13:00:00Z')),true);
  assert.equal(inBusinessHours(new Date('2026-11-23T23:00:00Z')),false);
  assert.equal(inBusinessHours(new Date('2026-11-22T13:00:00Z')),false);
});
