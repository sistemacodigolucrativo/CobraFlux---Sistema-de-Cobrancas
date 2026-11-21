import 'dotenv/config';
import {pool} from './db';
import {reconcileSaasBilling,pendingBillingTransitions} from './saas-worker';
import {localBillingDate} from './recurrence-calendar';
const args=process.argv.slice(2),dry=args.includes('--dry-run'),once=args.includes('--once');
const n=args.find(x=>x.startsWith('--limit=')),limit=n?Number(n.slice(8)):25;
try{
 if(dry===once||!Number.isInteger(limit)||limit<1||limit>100||
   args.some(a=>!['--dry-run','--once'].includes(a)&&!a.startsWith('--limit='))){
  console.error('Usage: npm run saas:reconcile -- --dry-run | --once --limit=25');
  process.exitCode=2;
 }else if(dry)console.log(JSON.stringify({due:await pendingBillingTransitions(),
   dryRun:true,providerCalls:0,merchantChargeOperations:0}));
 else{
  if(process.env.SAAS_MAINTENANCE_ENABLED!=='true')throw new Error('saas_maintenance_disabled');
  console.log(JSON.stringify(await reconcileSaasBilling(limit)));
 }
}catch(e){
 console.error('saas_maintenance_failed',e instanceof Error?e.message:'unknown');process.exitCode=1;
}
await pool.end();
