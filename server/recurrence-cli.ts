import 'dotenv/config';
import {randomUUID} from 'node:crypto';
import {pool} from './db';
import {generateRecurrenceBatch,recurrenceDueCount} from './recurrence-worker';
import {localBillingDate,isoDate} from './recurrence-calendar';

const args=process.argv.slice(2);
const dry=args.includes('--dry-run'),once=args.includes('--once');
const limitFlag=args.find(a=>a.startsWith('--limit='));
const throughFlag=args.find(a=>a.startsWith('--through='));
const limit=limitFlag?Number(limitFlag.slice('--limit='.length)):20;
const through=throughFlag?throughFlag.slice('--through='.length):localBillingDate();
if(dry===once||args.some(a=>!['--dry-run','--once'].includes(a)&&
  !a.startsWith('--limit=')&&!a.startsWith('--through='))){
 console.error('Usage: npm run recurring:run -- --dry-run | --once --limit=20 [--through=YYYY-MM-DD]');
 process.exitCode=2;
}else if(!dry&&process.env.RECURRENCE_SCHEDULER_ENABLED!=='true'){
 console.error('RECURRENCE_SCHEDULER_ENABLED=true required. No automatic billing or Pix issuance.');
 process.exitCode=2;
}else{
 try{
  isoDate(through);
  if(through>localBillingDate())throw new Error('cannot_generate_future_cycles');
  if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('invalid_recurrence_batch_limit');
  if(dry){
    console.log(JSON.stringify({through,due:await recurrenceDueCount(through),
      dryRun:true,onlyDrafts:true,financialProviderCalls:0}));
  }else{
    const runId=randomUUID();
    await pool.query('INSERT INTO recurrence_worker_runs(id,through_date) VALUES($1,$2::date)',[runId,through]);
    const result=await generateRecurrenceBatch(limit,through);
    await pool.query('UPDATE recurrence_worker_runs SET completed_at=now(),examined=$2,'+
      'generated=$3,failed=$4,paused=$5 WHERE id=$1',
      [runId,result.examined,result.generated,result.failed,result.paused]);
    console.log(JSON.stringify({...result,onlyDrafts:true,financialProviderCalls:0}));
    if(result.failed)process.exitCode=1;
  }
 }catch(e){
  console.error('recurrence_worker_failed',e instanceof Error?e.message:'unknown');
  process.exitCode=1;
 }
}
await pool.end();
