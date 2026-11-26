/** Calendar-only recurring dates. All values are ISO YYYY-MM-DD, never timestamps. */
export type RecurrenceFrequency='monthly'|'weekly';
const isoPattern=/^\d{4}-\d{2}-\d{2}$/;
export function isoDate(value:string):Date{
  if(!isoPattern.test(value))throw new Error('invalid_calendar_date');
  const [year,month,day]=value.split('-').map(Number);
  if(year<2000||year>2099||month<1||month>12||day<1||day>31)
    throw new Error('invalid_calendar_date');
  const date=new Date(Date.UTC(year,month-1,day));
  if(date.toISOString().slice(0,10)!==value)throw new Error('invalid_calendar_date');
  return date;
}
export function asIsoDate(date:Date):string{return date.toISOString().slice(0,10);}
export function localBillingDate(now:Date=new Date()):string{
  const parts=new Intl.DateTimeFormat('en-US',{
    timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(now);
  const part=(key:string)=>parts.find(item=>item.type===key)?.value??'';
  return part('year')+'-'+part('month')+'-'+part('day');
}
export function monthlyDate(year:number,month:number,anchorDay:number):string{
  if(!Number.isInteger(anchorDay)||anchorDay<1||anchorDay>31)throw new Error('invalid_monthly_anchor');
  const last=new Date(Date.UTC(year,month,0)).getUTCDate();
  return asIsoDate(new Date(Date.UTC(year,month-1,Math.min(anchorDay,last))));
}
export function advanceRecurrence(date:string,frequency:RecurrenceFrequency,anchorDay:number):string{
  const source=isoDate(date);
  if(frequency==='weekly')return asIsoDate(new Date(source.getTime()+7*86400000));
  if(frequency!=='monthly')throw new Error('invalid_recurrence_frequency');
  const year=source.getUTCFullYear(),month=source.getUTCMonth()+1;
  const nextYear=month===12?year+1:year;
  const nextMonth=month===12?1:month+1;
  const result=monthlyDate(nextYear,nextMonth,anchorDay);
  isoDate(result);
  return result;
}
export function isAlignedFirstDue(firstDue:string,frequency:RecurrenceFrequency,anchorDay:number):boolean{
  const d=isoDate(firstDue);
  if(frequency==='weekly')return true;
  if(frequency!=='monthly')return false;
  return d.toISOString().slice(0,10)===monthlyDate(d.getUTCFullYear(),d.getUTCMonth()+1,anchorDay);
}
export function calendarCycleKey(dueDate:string,frequency:RecurrenceFrequency):string{
  isoDate(dueDate);
  return frequency==='monthly'?dueDate.slice(0,7):dueDate;
}
export function skipPastCycles(
  nextDue:string,frequency:RecurrenceFrequency,anchorDay:number,asOf:string,
  maxSkips=1800
):{nextDue:string;skipped:number}{
  isoDate(asOf);
  let next=nextDue,skipped=0;
  while(next<asOf){
    if(++skipped>maxSkips)throw new Error('too_many_skipped_cycles');
    next=advanceRecurrence(next,frequency,anchorDay);
  }
  return {nextDue:next,skipped};
}
export function previewCycles(firstDue:string,frequency:RecurrenceFrequency,anchorDay:number,count=6):string[]{
  if(!Number.isInteger(count)||count<1||count>24||!isAlignedFirstDue(firstDue,frequency,anchorDay))
    throw new Error('invalid_recurrence_preview');
  const dates=[firstDue];
  while(dates.length<count)dates.push(advanceRecurrence(dates.at(-1)!,frequency,anchorDay));
  return dates;
}
