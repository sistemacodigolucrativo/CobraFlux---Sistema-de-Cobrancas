import {test,expect,type APIRequestContext} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
const password='SenhaDeTesteSegura#2026';

async function makeOwner(request:APIRequestContext){
  const code=randomUUID().slice(0,10);
  const email='browser'+code+'@example.com',business='Studio Browser '+code;
  const registered=await request.post('/api/auth/register',{data:{
    name:'Ana Browser',businessName:business,email,password
  }});
  expect(registered.status()).toBe(201);
  // Test-only verification because no hosted email provider is configured in CI.
  const pool=new Pool({connectionString:process.env.DATABASE_URL});
  try{await pool.query('UPDATE users SET email_verified_at=now() WHERE email=$1',[email]);}
  finally{await pool.end();}
  return {email,business};
}
async function login(page:import('@playwright/test').Page,email:string){
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Acessar CobraFlux'})).toBeVisible();
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page.getByText('Olá, Ana Browser')).toBeVisible();
}

test('desktop: login, client records, service catalog, charge draft and team access',async({page,request})=>{
  const owner=await makeOwner(request);
  await login(page,owner.email);
  const nav=page.getByRole('navigation',{name:'Menu profissional'});
  await expect(nav.getByRole('button',{name:'Clientes'})).toBeVisible();
  await nav.getByRole('button',{name:'Clientes'}).click();
  await page.getByRole('button',{name:'Novo cliente'}).click();
  await page.getByLabel('Nome completo').fill('Cliente Playwright');
  await page.getByLabel('Telefone com DDI (+55)').fill('+5511988882222');
  await page.getByRole('button',{name:'Salvar cliente'}).click();
  await expect(page.getByText('Cliente Playwright')).toBeVisible();

  await nav.getByRole('button',{name:'Serviços'}).click();
  await page.getByRole('button',{name:'Novo serviço'}).click();
  await page.getByLabel('Nome do serviço').fill('Consulta Playwright');
  await page.getByRole('button',{name:'Salvar serviço'}).click();
  await expect(page.getByText('Consulta Playwright')).toBeVisible();

  await nav.getByRole('button',{name:'Cobranças'}).click();
  await expect(page.getByRole('button',{name:'Nova cobrança'})).toBeEnabled();
  await page.getByRole('button',{name:'Nova cobrança'}).click();
  await page.getByRole('textbox',{name:'Descrição',exact:true}).fill('Sessão Playwright');
  await page.getByRole('button',{name:'Salvar rascunho'}).click();
  await expect(page.getByText('Sessão Playwright')).toBeVisible();
  await expect(page.getByText(/Emissão Pix Asaas disponível somente no SANDBOX/)).toBeVisible();
  await nav.getByRole('button',{name:'Equipe e permissões'}).click();
  await expect(page.getByRole('heading',{name:'Equipe e permissões'})).toBeVisible();
  await expect(page.getByText(owner.email)).toBeVisible();
  await nav.getByRole('button',{name:'Configurações'}).click();
  await expect(page.getByRole('heading',{name:'Asaas Pix · SANDBOX'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Gerar token seguro'})).toBeVisible();

  const query=await request.get('/api/health');
  expect(query.status()).toBe(200);
});

test('mobile: bottom navigation, accessible drawer and owner-only team menu',async({page,request})=>{
  const owner=await makeOwner(request);
  await page.setViewportSize({width:390,height:844});
  await login(page,owner.email);
  const bottom=page.getByRole('navigation',{name:'Navegação rápida mobile'});
  await expect(bottom).toBeVisible();
  await bottom.getByRole('button',{name:'Clientes'}).click();
  await expect(page.getByRole('heading',{name:'Clientes'})).toBeVisible();
  await page.getByRole('button',{name:'Abrir menu completo'}).click();
  const drawer=page.getByRole('dialog',{name:'Menu completo'});
  await expect(drawer).toBeVisible();
  await drawer.getByRole('button',{name:'Equipe e permissões'}).click();
  await expect(page.getByRole('heading',{name:'Equipe e permissões'})).toBeVisible();
  await expect(drawer).toBeHidden();
});
