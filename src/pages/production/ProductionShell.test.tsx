import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {ProductionShell} from './ProductionShell';
import {TeamOperationsView} from './TeamOperationsView';
import {ClientsOperationsView} from './ClientsOperationsView';
import {ServicesOperationsView} from './ServicesOperationsView';
import {ChargesOperationsView} from './ChargesOperationsView';
import {AccountOperationsView} from './AccountOperationsView';
import {RecurrencesOperationsView} from './RecurrencesOperationsView';
import {WhatsAppOperationsView} from './WhatsAppOperationsView';
import {SaasBillingView} from './SaasBillingView';
import {ReportsOperationsView} from './ReportsOperationsView';
import {AdminOperationsView} from './AdminOperationsView';
import type {Session,OrganizationChoice} from '../../services/productionApi';

const session:Session={
 user:{id:'a',name:'Ana Silva',email:'ana@example.com',role:'owner'},
 organizationId:'org-a',csrfToken:'csrf'
};
const orgs:OrganizationChoice[]=[
 {id:'org-a',name:'Estúdio Ana',role:'owner'},
 {id:'org-b',name:'Clínica B',role:'operator'}
];
const render=(role:'owner'|'operator'|'super_admin'= 'owner')=>renderToStaticMarkup(
 <ProductionShell session={{...session,user:{...session.user,role}}} organizations={orgs}
 tab="clientes" onTabChange={()=>{}} onSwitch={()=>{}} onLogout={()=>{}}>
   <p>Conteúdo isolado do painel</p>
 </ProductionShell>);
test('paridade do shell: sidebar, mobile bottom bar e drawer acessível',()=>{
 const html=render();
 assert.match(html,/Menu profissional/);
 assert.match(html,/Navegação rápida mobile/);
 assert.match(html,/Abrir menu completo/);
 assert.match(html,/Trocar organização/);
 assert.match(html,/Estúdio Ana/);
 assert.match(html,/Clientes/);
 assert.match(html,/Cobranças/);
 assert.match(html,/Recorrências/);
 assert.match(html,/WhatsApp Business/);
 assert.match(html,/Meu Plano/);
 assert.match(html,/Relatórios/);
 assert.doesNotMatch(html,/Administração da plataforma/);
 assert.doesNotMatch(html,/>Administração</);
 assert.match(html,/Configurações/);
 assert.match(html,/Equipe e permissões/);
 assert.match(html,/aria-current="page"/);
 assert.match(html,/Conteúdo isolado do painel/);
 assert.doesNotMatch(html,/Alternar conta demo|Avançar \+5 dias|Simular pagamento/);
});
test('operador não enxerga menu da administração de equipe',()=>{
 const html=render('operator');
 assert.doesNotMatch(html,/Equipe e permissões/);
 assert.doesNotMatch(html,/>Administração</);
 assert.match(html,/Painel profissional|Cliente|Estúdio Ana/);
});
test('administração global só aparece no shell de superadministrador',()=>{
 const admin=render('super_admin');
 assert.match(admin,/>Administração</);
 assert.doesNotMatch(render('owner'),/>Administração</);
 assert.doesNotMatch(render('operator'),/>Administração</);
});
test('componentes operacionais renderizam sem contexto ou dados de demo',()=>{
 const onChanged=async()=>{};
 const html=[
  renderToStaticMarkup(<ClientsOperationsView onChanged={onChanged}/>),
  renderToStaticMarkup(<ChargesOperationsView onChanged={onChanged}/>),
  renderToStaticMarkup(<RecurrencesOperationsView canManage={true} onChanged={onChanged}/>),
  renderToStaticMarkup(<WhatsAppOperationsView canManage={true}/>),
  renderToStaticMarkup(<SaasBillingView canManage={true} isPlatformAdmin={false}/>),
  renderToStaticMarkup(<ReportsOperationsView canManage={true}/>),
  renderToStaticMarkup(<AdminOperationsView/>),
  renderToStaticMarkup(<ServicesOperationsView onChanged={onChanged}/>),
  renderToStaticMarkup(<TeamOperationsView session={session}/>),
  renderToStaticMarkup(<AccountOperationsView session={session} onSessionChange={()=>{}}/>),
 ].join('\n');
 assert.match(html,/Clientes/);
 assert.match(html,/Cobranças/);
 assert.match(html,/Serviços/);
 assert.match(html,/Equipe e permissões/);
 assert.match(html,/Carregando configurações/);
 assert.doesNotMatch(html,/Simular pagamento|Dados fictícios.*pagos/);
});
