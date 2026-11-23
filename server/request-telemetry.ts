// F8 #07: privacy-preserving structured API telemetry without raw URLs, token, body or IP.
// No third-party endpoint or telemetry provider; transport is controlled stdout/stderr.
export type AccessEvent={
 requestId:string;method:string;statusCode:number;durationMs:number;
};
function safeRequestId(id:string):string{
 return /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)?
 id:'invalid';
}
function safeMethod(method:string):string{
 return /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(method)?method:'OTHER';
}
export function formatApiAccess(event:AccessEvent):string{
 const status=Number.isInteger(event.statusCode)&&event.statusCode>=100&&event.statusCode<=599?
 event.statusCode:500;
 const duration=Number.isFinite(event.durationMs)&&event.durationMs>=0?
 Math.round(Math.min(event.durationMs,3600_000)):0;
 return JSON.stringify({event:'http_api',requestId:safeRequestId(event.requestId),
  method:safeMethod(event.method),status,durationMs:duration});
}
export function formatApiError(requestId:string):string{
 return JSON.stringify({event:'api_unhandled_error',requestId:safeRequestId(requestId),
  errorCategory:'internal_error'});
}
