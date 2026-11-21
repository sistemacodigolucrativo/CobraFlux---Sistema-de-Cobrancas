import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';

const root=resolve(process.cwd());
const at=relative=>resolve(root,relative);
const file=relative=>{assert.ok(existsSync(at(relative)), 'Arquivo de memoria ausente: '+relative);return readFileSync(at(relative));};
const base='docs/ai-memory/';
file('AGENTS.md');
const canonical=['00-LEIA-PRIMEIRO.md','01-ESTADO-ATUAL.md','02-ARQUITETURA-E-SEGURANCA.md',
'03-DECISOES.md','04-BACKLOG.md','05-DIARIO-DE-DESENVOLVIMENTO.md',
'06-EVIDENCIAS.md','07-FONTES-E-INTEGRIDADE.md','08-PROTOCOLO-DE-CONTINUIDADE.md',
'09-MODELO-DE-REGISTRO.md','10-REQUISITOS-RECENTES.md'];
for(const name of canonical)file(base+name);
const state=JSON.parse(file(base+'estado.json').toString('utf8'));
assert.equal(state.schemaVersion,1);
assert.equal(state.repository,'sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas');
assert.equal(state.authorizedBranch,'feat/production-foundation');
assert.equal(state.totalPhases,10);
assert.ok(Number.isInteger(state.currentPhase)&&state.currentPhase>=0&&state.currentPhase<10);
assert.match(state.lastVerifiedCodeCommit,/^[0-9a-f]{40}$/);
assert.ok(Array.isArray(state.lastValidatedCi)&&state.lastValidatedCi.length>=1);
assert.equal(state.sourceDocumentsUploadedToRepository,true);
assert.equal(state.sourceDocumentsVerifiedExactGitBlobs,12);
const names=['00-LEIA-PRIMEIRO.md','01-HANDOFF-MESTRE.md','02-MATRIZ-DE-REQUISITOS.md',
'03-REGISTRO-DE-DECISOES.md','04-BACKLOG-CONSOLIDADO.md','05-ARQUITETURA-E-ESTADO-TECNICO.md',
'06-ROADMAP-E-MARCOS.md','07-EVIDENCIAS-E-LACUNAS.md','08-PROTOCOLO-DE-RETOMADA.md',
'09-PROMPT-AUTONOMO-DE-RETOMADA.md','HANDOFF-COMPLETO.md','MANIFESTO-DE-INTEGRIDADE.md'];
const expected=['faf2c4cc8cc497745576e22a4303b2e850a417e792a3a3790aa19739179abe26',
'991f4817ff8c2518316cd7467b7e8e1a0a6dc98ef0786eade01d024891b6b6c1',
'937bc586b9f42d6271a65c0b9fd5d1fefcc08ebc802c0d3fc77b7aa8f422e06e',
'acf3ef493d547edcc1d6e22ccced50744c30342cd9c4e802121862c60d5f129b',
'f0b041b031899c17cca401aaa5f00471f6cda1cc525708fe7d8a247aee577cbf',
'e867d2b80e6d5425487b9ed8f22fb8eff3f9c230c8af928bdd798067e1f93c8c',
'd69330ee56a937cf49ceac5623296442046776db7fe7ff9927ff7a93fb495555',
'9ce671cefd746794c50ddecc3e95f8b8018ccd0df180fe57cd1cba86cca209f7',
'709643b104ad37a3aea56a6a434ce02e90d0e75b643a26e99442939c9041a0a0',
'dcca9f5d702e632350002f81b8f61464af49f2eead1ab655f4990ef318476d9a',
'87fe58b2ff532d81e5c9c0efff18110e08c45b516f77efba95859f363e1ec7b7',
'89d4b06156f2d7ecb8924905b2120b6ad198d6a45076501917154310f49f5ef7'];
for(let i=0;i<names.length;i++){
 const bytes=file(base+'originais/'+names[i]);
 const checksum=createHash('sha256').update(bytes).digest('hex');
 assert.equal(checksum,expected[i],'Fonte original alterada: '+names[i]);
}
file(base+'fases/README.md');
const slugs=['00-preparacao','01-seguranca','02-operacoes','03-pix-sandbox','04-recorrencias',
'05-whatsapp','06-saas','07-admin-relatorios-lgpd','08-homologacao','09-android-play'];
for(const phase of slugs)file(base+'fases/'+phase+'.md');
file(base+'entregas/README.md');
assert.ok(readdirSync(at(base+'entregas')).some(x=>/^\d{4}-\d\d-\d\d-.*\.md$/.test(x)),
 'Nenhuma entrega versionada');
console.log('Memória CobraFlux válida: 10 fases, 12 originais SHA-256 exatos, estado JSON e entradas históricas.');
