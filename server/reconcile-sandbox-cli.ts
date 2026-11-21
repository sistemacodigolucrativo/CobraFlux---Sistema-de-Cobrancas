import 'dotenv/config';
import {pool} from './db';
import {reconcileSandboxBatch,sandboxReconciliationDueCount} from './sandbox-reconciliation-worker';

/** One-shot only: run via external cron/scheduler after hosting, never as a hidden perpetual process. */
const args=process.argv.slice(2);
const dry=args.includes('--dry-run');
const once=args.includes('--once');
const limitArg=args.find(a=>a.startsWith('--limit='));
const limit=limitArg?Number(limitArg.slice(8)):20;
if((dry===once)||args.some(a=>!['--dry-run','--once'].includes(a)&&!a.startsWith('--limit='))){
  console.error('Usage: npm run reconcile:sandbox -- --dry-run [--limit=20] | --once [--limit=20]');
  process.exitCode=2;
}else if(process.env.SANDBOX_RECONCILIATION_ENABLED!=='true'&&!dry){
  console.error('SANDBOX_RECONCILIATION_ENABLED=true is required; commercial payment processing stays disabled.');
  process.exitCode=2;
}else{
  try{
    if(dry){
      const count=await sandboxReconciliationDueCount();
      console.log(JSON.stringify({due:count,sandboxOnly:true,dryRun:true}));
    }else{
      const result=await reconcileSandboxBatch(limit);
      console.log(JSON.stringify(result));
      if(result.failed>0)process.exitCode=1;
    }
  }catch(e){
    console.error('sandbox_reconciliation_worker_error',e instanceof Error?e.message:'unknown');
    process.exitCode=1;
  }
}
await pool.end();
