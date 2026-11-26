import 'dotenv/config';
import {randomUUID} from 'node:crypto';
import {pool} from './db';
import {runWhatsAppBatch,whatsappQueuedCount} from './whatsapp-worker';
const args=process.argv.slice(2);
const dry=args.includes('--dry-run'),once=args.includes('--once');
const limitFlag=args.find(a=>a.startsWith('--limit='));
const limit=limitFlag?Number(limitFlag.slice(8)):10;
try{
  if(dry===once||!Number.isInteger(limit)||limit<1||limit>50||
     args.some(a=>!['--dry-run','--once'].includes(a)&&!a.startsWith('--limit='))){
    console.error('Usage: npm run whatsapp:run -- --dry-run | --once --limit=10');
    process.exitCode=2;
  }else if(dry){
    console.log(JSON.stringify({queued:await whatsappQueuedCount(),dryRun:true,deliveryEnabled:false}));
  }else{
    const id=randomUUID();
    await pool.query('INSERT INTO whatsapp_send_runs(id) VALUES($1)',[id]);
    const result=await runWhatsAppBatch(limit);
    await pool.query('UPDATE whatsapp_send_runs SET completed_at=now(),examined=$2,accepted=$3,'+
      'blocked=$4,unknown_count=$5,failed=$6 WHERE id=$1',
      [id,result.examined,result.accepted,result.blocked,result.unknown,result.failed]);
    console.log(JSON.stringify(result));
    if(result.unknown>0||result.failed>0)process.exitCode=1;
  }
}catch(e){
  console.error('whatsapp_runner_failed',e instanceof Error?e.message:'unknown');
  process.exitCode=1;
}
await pool.end();
