/** Pure Phase 7 CSV and reporting formatters. Values never become spreadsheet formulas. */
export function safeCsvCell(value:unknown):string{
  const input=String(value??'').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g,' ');
  // Excel/Calc may interpret whitespace-prefixed =,+,-,@ as formulae.
  const formula=/^[\s\uFEFF\u200B]*[=+\-@]/u.test(input);
  const safe=formula?"'"+input:input;
  return '"'+safe.replace(/"/g,'""')+'"';
}
export function csvRows(headers:readonly string[],rows:ReadonlyArray<ReadonlyArray<unknown>>):string{
 if(!headers.length||headers.some(h=>!h||h.length>90))throw new Error('invalid_csv_headers');
 if(rows.some(row=>row.length!==headers.length))throw new Error('csv_column_mismatch');
 return '\uFEFF'+[headers,...rows].map(row=>row.map(safeCsvCell).join(',')).join('\r\n')+'\r\n';
}
export const MERCHANT_REAL_PROVIDER='asaas_live';
export const PLATFORM_REAL_PROVIDER='platform_live';
export function isVerifiedPlatformInvoice(invoice:{
 status:string;provider:string|null;payment_verified_at:string|null;provider_invoice_id:string|null
}):boolean{
 return invoice.status==='paid'&&invoice.provider===PLATFORM_REAL_PROVIDER&&
  Boolean(invoice.payment_verified_at&&invoice.provider_invoice_id);
}
export function moneyString(amount:unknown):string{
 const s=String(amount??'0');
 if(!/^\d+$/.test(s))throw new Error('invalid_money_amount');
 return s; // transmit exact cents as decimal string; no float rounding.
}
