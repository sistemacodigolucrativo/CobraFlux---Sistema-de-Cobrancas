import test from 'node:test';
import assert from 'node:assert/strict';
import {safeCsvCell,csvRows,isVerifiedPlatformInvoice,moneyString} from './phase7-domain';
test('CSV quoted and spreadsheet formula injection is neutralized',()=>{
 for(const bad of ['=HYPERLINK("https://example.com","x")','+SUM(1,2)','-1+2','@SUM(1,2)',' \t=1+1','\uFEFF=2+2'])
  assert.ok(safeCsvCell(bad).startsWith('"\\''),bad);
 assert.equal(safeCsvCell('João, "Santos"'),'"João, ""Santos"""');
 assert.equal(safeCsvCell('regular'),'"regular"');
 const csv=csvRows(['Nome','Contato'],[['=1+1','+5511999999999']]);
 assert.match(csv,/^\uFEFF"Nome","Contato"\r\n"'/);
 assert.match(csv,/'\+5511999999999/);
 assert.throws(()=>csvRows(['A'],[['a','b']]));
});
test('only external verified SaaS payments can count toward live revenue',()=>{
 const base={status:'paid',provider:'platform_live',payment_verified_at:'2026-11-21',
  provider_invoice_id:'saas-live-abc'};
 assert.equal(isVerifiedPlatformInvoice(base),true);
 assert.equal(isVerifiedPlatformInvoice({...base,provider:'asaas_sandbox'}),false);
 assert.equal(isVerifiedPlatformInvoice({...base,status:'draft'}),false);
 assert.equal(isVerifiedPlatformInvoice({...base,payment_verified_at:null}),false);
 assert.equal(moneyString('9007199254740993'),'9007199254740993');
 assert.throws(()=>moneyString('-1'));
});
