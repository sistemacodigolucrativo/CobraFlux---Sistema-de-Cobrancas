import 'dotenv/config';
import {pool} from './db';
import {eligibleDueCount,enqueueDueReminders} from './whatsapp-enqueue';
import {localBillingDate,isoDate} from './recurrence-calendar';
const args=process.argv.slice(2);
const dry=args.includes('--dry-run'),once=args.includes('--once');
const limitValue=args.find(a=>a.startsWith('--limit=')),dateValue=args.find(a=>a.startsWith('--date='));
const limit=limitValue?Number(limitValue.slice(8)):100;
const date=dateValue?dateValue.slice(7):localBillingDate();
try{
  if(dry===once||!Number.isInteger(limit)||limit<1||limit>100||
      args.some(a=>!['--dry-run','--once'].includes(a)&&!a.startsWith('--limit=')&&!a.startsWith('--date='))){
    console.error('Usage: npm run whatsapp:enqueue -- --dry-run | --once [--limit=100] [--date=YYYY-MM-DD]');
    process.exitCode=2;
  }else{
    isoDate(date);
    if(date>localBillingDate())throw new Error('cannot_enqueue_future_business_dates');
    if(dry)console.log(JSON.stringify({eligible:await eligibleDueCount(date),dryRun:true,sends:0}));
    else{
      if(process.env.WHATSAPP_ENQUEUE_ENABLED!=='true')throw new Error('whatsapp_enqueue_disabled');
      console.log(JSON.stringify(await enqueueDueReminders(limit,date)));
    }
  }
}catch(err){
  console.error('whatsapp_due_enqueue_failed',err instanceof Error?err.message:'unknown');
  process.exitCode=1;
}
await pool.end();
