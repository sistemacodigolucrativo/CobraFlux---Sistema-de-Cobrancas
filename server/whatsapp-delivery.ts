import {randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
export type MetaStatus='sent'|'delivered'|'read'|'failed';
const rank:Record<string,number>={queued:0,sending:0,unknown:0,accepted:1,sent:2,delivered:3,read:4,failed:-1};
export function nextDeliveryStatus(current:string,next:MetaStatus):string {
  if(['blocked','cancelled'].includes(current))return current;
  if(next==='failed'){
    if(['read','delivered'].includes(current))return current;
    return 'failed';
  }
  if(current==='failed')return current; // conflicting evidence needs manual investigation, not silent revival
  return (rank[next]??0)>(rank[current]??0)?next:current;
}
export async function applyDeliveryStatus(db:PoolClient,orgId:string,providerId:string,status:MetaStatus,timestamp:number,errorCode:string|null){
  const q=await db.query(
    'SELECT id,state FROM whatsapp_outbox WHERE organization_id=$1 AND provider_message_id=$2 FOR UPDATE',
    [orgId,providerId]);
  if(!q.rowCount)return false;
  const row=q.rows[0];
  const inserted=await db.query(
    'INSERT INTO whatsapp_delivery_events(id,organization_id,outbox_id,provider_message_id,status,provider_timestamp,error_code) '+
    'VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(provider_message_id,status,provider_timestamp) DO NOTHING RETURNING id',
    [randomUUID(),orgId,row.id,providerId,status,timestamp,errorCode]);
  if(inserted.rowCount){
    const next=nextDeliveryStatus(row.state,status);
    if(next!==row.state)
      await db.query('UPDATE whatsapp_outbox SET state=$2,updated_at=now(),last_error=$3 WHERE id=$1',
        [row.id,next,next==='failed'?'meta_delivery_failed':null]);
  }
  return true;
}
export async function replayBufferedStatuses(db:PoolClient,orgId:string,providerId:string){
  const pending=await db.query(
    'SELECT id,status,provider_timestamp,error_code FROM whatsapp_callback_buffer '+
    'WHERE organization_id=$1 AND provider_message_id=$2 ORDER BY provider_timestamp,id FOR UPDATE',
    [orgId,providerId]);
  for(const event of pending.rows){
    await applyDeliveryStatus(db,orgId,providerId,event.status,Number(event.provider_timestamp),event.error_code);
    await db.query('DELETE FROM whatsapp_callback_buffer WHERE id=$1',[event.id]);
  }
}
