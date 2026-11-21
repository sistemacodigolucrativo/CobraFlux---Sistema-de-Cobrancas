import test from 'node:test';
import assert from 'node:assert/strict';
import {
 isoDate,advanceRecurrence,monthlyDate,isAlignedFirstDue,
 skipPastCycles,previewCycles,calendarCycleKey,localBillingDate
} from './recurrence-calendar';
test('month-end recurrence retains intended 31st across 28/29/30/31 day months',()=>{
 assert.deepEqual(previewCycles('2027-01-31','monthly',31,6),
   ['2027-01-31','2027-02-28','2027-03-31','2027-04-30','2027-05-31','2027-06-30']);
 assert.deepEqual(previewCycles('2028-01-31','monthly',31,4),
   ['2028-01-31','2028-02-29','2028-03-31','2028-04-30']);
 assert.equal(monthlyDate(2028,2,30),'2028-02-29');
 assert.equal(advanceRecurrence('2026-12-31','monthly',31),'2027-01-31');
 assert.equal(isAlignedFirstDue('2028-02-29','monthly',31),true);
 assert.equal(isAlignedFirstDue('2028-02-28','monthly',31),false);
 assert.equal(calendarCycleKey('2028-02-29','monthly'),'2028-02');
});
test('weekly cycles are seven calendar days independent of DST offsets',()=>{
 assert.deepEqual(previewCycles('2027-02-25','weekly',1,4),
 ['2027-02-25','2027-03-04','2027-03-11','2027-03-18']);
 assert.equal(calendarCycleKey('2027-03-04','weekly'),'2027-03-04');
});
test('pausing and resuming explicitly skips missed dates without retroactive draft creation',()=>{
 assert.deepEqual(skipPastCycles('2028-01-31','monthly',31,'2028-03-01'),
   {nextDue:'2028-03-31',skipped:2});
 assert.deepEqual(skipPastCycles('2027-05-05','weekly',1,'2027-05-20'),
   {nextDue:'2027-05-26',skipped:3});
});
test('strict Gregorian validation rejects rollovers, out-of-range anchors and invalid first dates',()=>{
 for(const s of ['2027-02-29','2027-13-01','2027-04-31','2030-2-1','2027-00-20'])
   assert.throws(()=>isoDate(s));
 assert.throws(()=>monthlyDate(2027,1,32));
 assert.equal(isAlignedFirstDue('2027-04-30','monthly',31),true);
 assert.equal(isAlignedFirstDue('2027-04-29','monthly',31),false);
});
test('calendar uses São Paulo business day instead of UTC date in boundary hours',()=>{
 assert.equal(localBillingDate(new Date('2026-11-22T01:10:00.000Z')),'2026-11-21');
});
