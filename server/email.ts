const required=['RESEND_API_KEY','RESET_EMAIL_FROM','PUBLIC_APP_URL'] as const;
export function canSendTransactionalEmail():boolean{
  return required.every(k=>Boolean(process.env[k]));
}
export async function sendTransactionalEmail(to:string, subject:string, text:string):Promise<boolean>{
  if(!canSendTransactionalEmail())return false;
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',signal:AbortSignal.timeout(8000),
    headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({from:process.env.RESET_EMAIL_FROM,to:[to],subject,text})
  });
  if(!response.ok){console.error('transactional_email_failed',response.status);return false;}
  return true;
}
export function publicLink(hashRoute:string,token:string):string{
  const url=process.env.PUBLIC_APP_URL;
  if(!url)throw new Error('PUBLIC_APP_URL is not configured');
  return url.replace(/\/$/,'')+'/#/'+hashRoute+'?token='+encodeURIComponent(token);
}
