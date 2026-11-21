import test from 'node:test';
import assert from 'node:assert/strict';
import { splitCsv, previewClientsCsv, normalizePhone, parseCurrencyCents } from './csv';

test('semicolon, quoted separator, escaped quotes and BOM',()=>{
 const csv='\uFEFFnome;telefone;email;serviço;mensalidade;dia vencimento\r\n"Ana; Maria";11977776666;a@example.com;"Aula ""VIP""";1.250,50;31';
 const rows=previewClientsCsv(csv);
 assert.equal(rows.length,1);
 assert.equal(rows[0].name,'Ana; Maria');
 assert.equal(rows[0].serviceName,'Aula "VIP"');
 assert.equal(rows[0].phone,'+5511977776666');
 assert.equal(rows[0].monthlyFeeCents,125050);
 assert.equal(rows[0].preferredDueDay,31);
 assert.equal(rows[0].valid,true);
});
test('CSV validation detects duplicate phones, invalid amount and day',()=>{
 const csv='nome;telefone;email;serviço;valor;vencimento\nAna Silva;11999998888;;Plano;50,00;10\nBia Silva;11999998888;;Plano;-5;40';
 const rows=previewClientsCsv(csv);
 assert.equal(rows[0].valid,true);
 assert.equal(rows[1].valid,false);
 assert.ok(rows[1].errors.includes('telefone_duplicado_no_csv'));
 assert.ok(rows[1].errors.includes('valor_invalido'));
 assert.ok(rows[1].errors.includes('vencimento_invalido'));
});
test('limits and quoting',()=>{
 assert.deepEqual(splitCsv('a,b\n"c,d",e'),[['a','b'],['c,d','e']]);
 assert.throws(()=>splitCsv('"not closed'),/unterminated/);
 assert.throws(()=>splitCsv('a'.repeat(180001)),/too_large/);
 assert.equal(normalizePhone('5511988887777'),'+5511988887777');
 assert.equal(parseCurrencyCents('R$ 1.000,25'),100025);
});
