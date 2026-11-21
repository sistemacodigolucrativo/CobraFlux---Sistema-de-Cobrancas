import test from 'node:test';
import assert from 'node:assert/strict';
import {discountFor,entitlementPlan} from './saas-domain';
test('only free or externally-verified active period may grant paid entitlements',()=>{
 const base={plan_code:'starter' as const,status:'active' as const,
 grace_until:null,current_period_end:'2026-12-31'};
 assert.equal(entitlementPlan(base,'2026-11-21'),'starter');
 assert.equal(entitlementPlan({...base,current_period_end:'2026-10-31'},'2026-11-21'),'free');
 assert.equal(entitlementPlan({...base,status:'past_due',grace_until:'2026-11-27'},'2026-11-21'),'starter');
 assert.equal(entitlementPlan({...base,status:'past_due',grace_until:'2026-11-20'},'2026-11-21'),'free');
 assert.equal(entitlementPlan({...base,status:'restricted'},'2026-11-21'),'free');
 assert.equal(entitlementPlan({...base,status:'cancelled'},'2026-11-21'),'free');
});
test('coupons always leave positive paid invoice; deterministic integer arithmetic',()=>{
 assert.equal(discountFor(10001,20,null),2000);
 assert.equal(discountFor(10000,null,2500),2500);
 assert.equal(discountFor(100,null,100000),99);
 assert.throws(()=>discountFor(0,10,null));
});
