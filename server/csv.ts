/** Shared pure CSV parsing/validation: no browser APIs, no database writes. */
export interface ClientImportRow {
  rowNumber: number;
  name: string;
  phone: string;
  email: string;
  serviceName: string;
  monthlyFeeCents: number;
  preferredDueDay: number;
  valid: boolean;
  errors: string[];
}
const HEADER_ALIASES: Record<string,string> = {
  nome:'name', name:'name', cliente:'name',
  telefone:'phone', celular:'phone', phone:'phone', whatsapp:'phone',
  email:'email', correio:'email',
  servico:'serviceName', servicos:'serviceName', atividade:'serviceName',
  valor:'monthlyFeeCents', mensalidade:'monthlyFeeCents',
  valormensal:'monthlyFeeCents', preco:'monthlyFeeCents',
  diavencimento:'preferredDueDay', vencimento:'preferredDueDay', dia:'preferredDueDay',
};
function canonicalHeader(s:string): string {
  return s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
}
/** RFC 4180-like delimited rows, including escaped double quotes and newlines inside quoted cells. */
export function splitCsv(text:string):string[][] {
  if(text.length>180000)throw new Error('csv_too_large');
  const input=text.replace(/^\uFEFF/,'');
  const firstLine=input.split(/\r?\n/,1)[0];
  let semicolons=0,commas=0,inQuotes=false;
  for(let i=0;i<firstLine.length;i++){
    const c=firstLine[i];
    if(c==='"'){if(inQuotes&&firstLine[i+1]==='"'){i++;continue;}inQuotes=!inQuotes;}
    if(!inQuotes&&c===';')semicolons++;
    if(!inQuotes&&c===',')commas++;
  }
  const sep=semicolons>=commas?';':',';
  const rows:string[][]=[]; let row:string[]=[],field='',quoted=false;
  for(let i=0;i<input.length;i++){
    const c=input[i];
    if(c==='"'){
      if(quoted&&input[i+1]==='"'){field+='"';i++;}
      else if(quoted){quoted=false;}
      else if(!field.trim()){quoted=true;}
      else throw new Error('csv_invalid_quotes');
    }else if(c===sep&&!quoted){
      row.push(field.trim());field='';
    }else if((c==='\n'||c==='\r')&&!quoted){
      if(c==='\r'&&input[i+1]==='\n')i++;
      row.push(field.trim());field='';
      if(row.some(x=>x.length>0))rows.push(row);
      row=[];
      if(rows.length>502)throw new Error('csv_too_many_rows');
    }else{field+=c;}
  }
  if(quoted)throw new Error('csv_unterminated_quote');
  row.push(field.trim());
  if(row.some(x=>x.length>0))rows.push(row);
  if(rows.length>502)throw new Error('csv_too_many_rows');
  return rows;
}
export function normalizePhone(raw:string):string {
  const digits=raw.replace(/[^\d+]/g,'');
  if(digits.startsWith('+')&&/^\+[1-9]\d{9,14}$/.test(digits))return digits;
  if(/^\d{10,11}$/.test(digits))return '+55'+digits;
  if(/^55\d{10,11}$/.test(digits))return '+'+digits;
  return digits;
}
export function parseCurrencyCents(raw:string):number {
  const s=raw.replace(/\s|R\$/gi,'');
  if(!s||!/^[0-9.,]+$/.test(s))return NaN;
  let normalized=s;
  if(s.includes(','))normalized=s.replace(/\./g,'').replace(',','.');
  else if((s.match(/\./g)??[]).length>1)normalized=s.replace(/\./g,'');
  const n=Number(normalized);
  if(!Number.isFinite(n)||n<0||!Number.isSafeInteger(Math.round(n*100)))return NaN;
  return Math.round(n*100);
}
export function previewClientsCsv(csv:string):ClientImportRow[] {
  const records=splitCsv(csv);
  if(!records.length)return [];
  const first=records[0].map(c=>HEADER_ALIASES[canonicalHeader(c)]??null);
  const hasHeader=first.includes('name')&&first.includes('phone');
  const keys=['name','phone','email','serviceName','monthlyFeeCents','preferredDueDay'];
  const mapping=hasHeader?first:keys;
  const seenPhones=new Set<string>();
  return records.slice(hasHeader?1:0).map((columns,i)=>{
    const get=(field:string):string=>{
      const index=mapping.indexOf(field);
      return index>=0?(columns[index]??'').trim():'';
    };
    const errors:string[]=[];
    const name=get('name');
    const phone=normalizePhone(get('phone'));
    const email=get('email').toLowerCase();
    const serviceName=get('serviceName');
    const monthlyFeeCents=parseCurrencyCents(get('monthlyFeeCents'));
    const dayRaw=get('preferredDueDay');
    const preferredDueDay=dayRaw?Number(dayRaw):10;
    if(name.length<2||name.length>120)errors.push('nome_invalido');
    if(!/^\+[1-9]\d{9,14}$/.test(phone))errors.push('telefone_invalido');
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))errors.push('email_invalido');
    if(serviceName.length>120)errors.push('servico_longo');
    if(!Number.isSafeInteger(monthlyFeeCents)||monthlyFeeCents<0||monthlyFeeCents>10000000000)errors.push('valor_invalido');
    if(!Number.isInteger(preferredDueDay)||preferredDueDay<1||preferredDueDay>31)errors.push('vencimento_invalido');
    if(seenPhones.has(phone))errors.push('telefone_duplicado_no_csv');
    if(/^\+[1-9]\d{9,14}$/.test(phone))seenPhones.add(phone);
    return {
      rowNumber:i+(hasHeader?2:1),name,phone,email,serviceName,monthlyFeeCents,preferredDueDay,
      valid:errors.length===0,errors,
    };
  });
}
