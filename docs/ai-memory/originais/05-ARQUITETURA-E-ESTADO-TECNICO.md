# 05 — Arquitetura e Estado Técnico Verificado

**Snapshot Git imutável para consulta:** [commit `9c854473`](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0). **Fonte:** árvore e arquivos GitHub consultados diretamente; código não foi executado fora dos resultados CI registrados.

## 1. Repositório, Git e convenções

- **Repositório:** `sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas`; visibilidade pública verificada; descrição “CobraFlux - Sistema de Cobrancas”. GitHub registrou criação em **2026-11-13 14:45:09 UTC**.
- **Branch default:** `main`, SHA `95aba9c27c363c8b24c2f34c65a28c2f3b011b3b`. Nela reside essencialmente o mockup/documentação original; **não equivale à feature atual**.
- **Branch autorizada de trabalho:** `feat/production-foundation`, SHA `9c8544730b47059f4f8977bd950e46227784c9c0` em 21/11/2026. Não alterar `main` antes de autorização explícita.
- **Branch demonstrativa Android:** `android-webview-demo-debug`, SHA `326c326e445f3b0338ba3a8eb39db864a2aa1453`; árvore consultada com `mobile/android/...` e workflow `.github/workflows/android-cobraflux-demo.yml`.
- **Pull request:** [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2), `draft=true`, `merged=false`; base `main`, head `feat/production-foundation`.
- **Issue principal:** [#3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3) reúne fases 0–9 e bloqueios de release.
- **Histórico de merges:** nenhum merge da PR #2 foi identificado; `main` permaneceu no SHA anterior no corte. Não inferir situação de merges de outros PRs sem inspeção específica.
- **README:** `README.md` ausente no HEAD da branch auditada (404 em tentativa de leitura), portanto não presumir instruções de bootstrap ali.
- **Package:** `package.json` ainda tem `"name":"react-example"` e `"version":"0.0.0"`; há identidade técnica legada a revisar, sem implicar erro de aplicação.

## 2. Stack exata observada

| Camada | Tecnologias no manifesto/código | Evidência |
|---|---|---|
| UI | React `^19.0.1`, ReactDOM, TypeScript `^7.0.2` | `package.json`, `src/App.tsx` |
| Builder | Vite `^8.3.0`, `@vitejs/plugin-react`, Node 22 no Docker/CI | `vite.config.ts`, `Dockerfile`, workflows |
| UI/layout | Tailwind CSS `^4.3.3`, Lucide `^0.546.0`, primitivos próprios; bibliotecas também instaladas: Motion, Recharts, jsPDF, vite-plugin-pwa | `src/index.css`, `src/components/ui/Primitives.tsx`, package |
| Backend | Express `^4.21.2`, TypeScript/TSX, Zod `^4.6.7` | `server/index.ts`, `server/operations.ts` |
| DB | PostgreSQL 16 (CI), `pg` `^8.16.3`; scripts/migrações SQL | `server/db.ts`, workflow |
| Autenticação | `bcryptjs`, sessões em DB/cookie, tokens, SHA-256, TOTP criptografado | `server/security.ts`, `totp.ts`, `index.ts` |
| Tests | Node `node:test` com TSX; Playwright `1.65.1` Chromium desktop e modo mobile via emulação | `server/*.test.ts`, `src/domain/finance.test.ts`, `e2e/phase2.spec.ts` |
| Android | Gradle/Java/Android WebView em branch separada | árvore branch Android; não inspecionado APK físico |

**Cuidado:** listar uma dependência não equivale a declarar que uma funcionalidade específica está ativa em produção.

## 3. Diagrama de fluxo real (em texto)

```text
[navegador — demo]                  [navegador — modo operacional]
  src/App.tsx                           src/App.tsx
  AppProvider                           VITE_APP_MODE=production
  demoService / IndexedDB              ProductionApp -> ProductionShell
  pagamentos fictícios                  productionApi.ts -> /api/*
                                                |
                                   Express / server/index.ts
                                  sessões, MFA, CSRF, RBAC, rate-limit
                                                |
                                        PostgreSQL 16+
                                          migrações 001–016
                                   /       |        |          \
                              SaaS ledger  tenant    outbox      audit/privacidade
                               separado    charges  WhatsApp
                                   |
        Asaas SANDBOX adapter, workers one-shot, Meta Cloud API (desabilitada sem flags/credenciais)

Nunca: IndexedDB/demo -> pagamentos reais | Asaas Sandbox -> MRR/GPV real
```

O build Vite demo e o build operacional são **alternativas de compilação**, não simples seleção de dados de exemplo dentro de uma mesma sessão. O servidor está preparado para servir `/api/*` e `dist/` pela mesma origem. O frontend operacional usa API tipada, não o contrato legado sugerido no documento Golden Billing.

## 4. Estrutura efetivamente verificada

```text
.github/workflows/
  production-foundation.yml      # typecheck, domínio, servidor, UI, migração idempotente, integração, builds
  phase2-browser.yml             # Playwright Chromium desktop/mobile, PostgreSQL efêmero
server/
  index.ts                       # Express, auth, sessão, CSRF, health, registro de módulos
  db.ts                          # Pool e transaction do pg
  migrate.ts                     # advisory lock + schema_migrations
  security.ts, totp.ts, email.ts, enroll-admin.ts
  operations.ts, csv.ts, team.ts
  asaas-sandbox.ts, asaas-events.ts
  sandbox-payments.ts, sandbox-refunds.ts, sandbox-cancellation.ts
  sandbox-reconciliation.ts, sandbox-reconciliation-worker.ts
  recurrences.ts, recurrence-calendar.ts, recurrence-worker.ts
  whatsapp-routes.ts, whatsapp-cloud.ts, whatsapp-webhook.ts
  whatsapp-delivery.ts, whatsapp-worker.ts, whatsapp-enqueue.ts
  saas-domain.ts, saas-routes.ts, saas-worker.ts
  phase7-domain.ts, phase7-routes.ts
  [diversos arquivos *.test.ts e *.integration.test.ts]
  migrations/001_core.sql .. 016_admin_reporting_privacy.sql
src/
  App.tsx                        # seletor de build demo/operacional
  components/ui/Primitives.tsx
  context/AppContext.tsx
  domain/{money,recurrence,finance}.ts
  services/{db,demoService,productionApi,contracts}.ts
  pages/institutional/*
  pages/professional/*          # módulos do demo
  pages/admin/AdminView.tsx     # admin demonstrativo
  pages/public/PublicPaymentPage.tsx
  pages/production/ProductionApp.tsx, ProductionShell.tsx,
    ClientsOperationsView.tsx, ServicesOperationsView.tsx,
    ChargesOperationsView.tsx, AccountOperationsView.tsx,
    TeamOperationsView.tsx, TeamInvitationPage.tsx,
    RecurrencesOperationsView.tsx, SandboxConnectionView.tsx,
    SandboxRefundPanel.tsx, WhatsAppOperationsView.tsx,
    SaasBillingView.tsx, ReportsOperationsView.tsx,
    AdminOperationsView.tsx
scripts/
  backup-db.sh, restore-drill.sh
Dockerfile
.env.example
playwright.config.ts
package.json
docs/DOCUMENTACAO_GOLDEN_BILLING.md
     EXECUCAO_PRODUCAO_FUNDACAO.md
     FASE_1_SEGURANCA_OPERACAO.md
     FASE_2_CADASTROS_OPERACAO.md
     FASE_2_EQUIPE_PERMISSOES_UI.md
     FASE_3_PIX_ASAAS_SANDBOX.md
     FASE_4_RECORRENCIAS.md
     FASE_5_WHATSAPP_META.md
     FASE_6_SAAS_MONETIZACAO.md
     FASE_7_ADMIN_RELATORIOS_LGPD.md
```

O projeto também possui assets de marca, imagens JPEG e manifesto/assets PWA; não foram tratados como prova de implantação. **A branch Android é uma árvore separada e não se encontra integralmente nesta listagem do HEAD operacional.**

## 5. Persistência e esquema PostgreSQL

### 5.1 Migrações identificadas

| Migração | Responsabilidade principal | Evidência |
|---|---|---|
| `001_core.sql` | organizations, users, memberships, auth_sessions, password_resets, rate_limits, clients, services, charges, payment_events, audit_logs, support_tickets | Código lido |
| `002_identity.sql` | verificação de e-mail, configuração MFA | docs F1, código historicamente verificado |
| `003_session_ids.sql` | identificadores/revogação de sessão, vínculo organizacional | docs F1 |
| `004_operations.sql` | campos cliente, índices de duplicatas, serviço, importações e histórico de cobrança | código lido |
| `005_team_invitations.sql` | convites de operadores e aceite | docs F2 |
| `006_asaas_sandbox.sql` | contas e emissões Sandbox Asaas, IDs externos, webhook/eventos | código lido |
| `007_sandbox_refunds.sql` | devoluções/estornos Sandbox com histórico próprio | código lido |
| `008_reconciliation_worker.sql` | leases/incidentes de reconciliação | docs F3 |
| `009_sandbox_payment_receipt.sql` | comprovantes do sandbox | docs F3 |
| `010_sandbox_pix_cancellation.sql` | cancelamento/consultas de Pix Sandbox | docs F3 |
| `011_recurring_plans.sql` | recorrências, ciclos e workers | docs F4 |
| `012_whatsapp_business.sql` | conexão Meta, consentimentos, templates, outbox | docs F5 |
| `013_whatsapp_delivery_buffer.sql` | eventos de entrega antecipados/buffer | docs F5 |
| `014_whatsapp_due_reminders.sql` | lembretes automáticos agendáveis | docs F5 |
| `015_saas_billing.sql` | plans, subscriptions, coupons, invoices, change requests, história SaaS; trigger Free | código lido |
| `016_admin_reporting_privacy.sql` | privacy_requests, support_ticket_events, trigger append-only em audit_logs | código lido |

`server/migrate.ts` usa **advisory lock** Postgres e `schema_migrations`, aplicando SQL em ordem lexical e em transações. Os workflows rodam `npm run migrate` **duas vezes** para verificar repetição segura. Não editar uma migração já aplicada em produção futuramente: preferir migração nova revisada.

### 5.2 Entidades e invariantes

- `organizations`: tenant; estado `active | suspended | blocked`. Sessão exige organização ativa.
- `users`: e-mail normalizado, senha hash e verificação de e-mail.
- `memberships`: composição `user_id`/`organization_id` e papel; usuário pode ter múltiplas organizações.
- `auth_sessions`: hash de token/sessão, vínculo user/tenant, expiração/revogação/MFA.
- `clients`: dados de PII (nome, telefone, e-mail, notas), status active/archive, service/frequência preferida, código interno; telefone normalizado com índice único de ativos por tenant.
- `services`: nome/descrição/preço em centavos/frequência e status ativo.
- `charges`: `organization_id`, `client_id`, `service_id`, token público imprevisível, valor bruto, desconto, `paid_cents`, `refunded_cents`, prazo, status/PSP; registros financeiros não podem ser criados como pagos pelo frontend.
- `payment_events`, `sandbox_issuances`, `sandbox_refund_requests`, tabelas de reconciliação/cancelamento: trilha das operações de teste; retorno inconclusivo não gera repetição cega.
- `recurrence_plans`, `recurrence_cycles`, worker runs: avanço de datas civis, uniqueness de `cycle_key`, snapshots por ciclo.
- `whatsapp_consents`, `whatsapp_consent_events`, `whatsapp_templates`, `whatsapp_outbox`, callbacks/buffer: consentimento com prova, revogação e estados de entrega.
- `saas_plans`, `saas_subscriptions`, `saas_invoices`, `saas_change_requests`, `saas_coupons`, `saas_subscription_history`: receita da própria plataforma **segregada** das cobranças de usuários; Free provisionado automaticamente.
- `audit_logs`: ator, organização, ação, entidade, metadata; Fase 7 instala trigger contra UPDATE/DELETE de suas linhas. APIs de consulta não retornam metadata livre.
- `support_tickets` e `support_ticket_events`: mensagens e alterações de estado com motivo.
- `privacy_requests`: requerimentos de acesso/retificação/exclusão/portabilidade; triagem humana e sem exclusão automática.

**Atenção:** índices de privacidade e retenção, política de minimização e testes de concorrência sob cargas reais ainda precisam governança. Alguns atributos são historicamente descritos na documentação sem transcrição integral do DDL nesta auditoria; verifique a migração correspondente antes de criar SQL novo.

## 6. Backend, sessões, segurança e limites

### 6.1 Principal de sessão

`server/index.ts` usa cookie `cf_session` HttpOnly (Secure em `NODE_ENV=production`, SameSite Lax), token com hash SHA-256 persistido, sessão expirada/revogada e membership em organização ativa. E-mail verificado obrigatório. Para `super_admin`, `mfa_verified=true` na sessão. `csrfForSession` calcula token CSRF, retornado por `/api/auth/me` e exigido em mutações autenticadas. A API recusa `Origin` distinto de `APP_ORIGIN` quando informado, com regras estritas em produção. `rate_limits` no banco.

**Operador:** pode consultar e trabalhar cadastros autorizados; não gerencia equipe, plano global, status de conta ou exportação sensível. **Owner:** dados da organização, CSV, equipe, conexões/assinatura e gestão. **Superadmin:** funções globais com sessão MFA. O acesso é aplicado na rota; menu é só apresentação.

### 6.2 Endpoints principais (sem prometer documentação Swagger)

| Área | Rotas verificadas / documentadas | Acesso especial |
|---|---|---|
| Health | `GET /api/health` | Query DB simples, sem negócio |
| Auth | `/api/auth/register`, `/login`, `/verify-email`, `/resend-verification`, `/request-reset`, `/reset-password`, `/me`, `/logout`, `/sessions`, `/sessions/revoke-all`, `/sessions/:id` | tokens, CSRF, MFA superadmin |
| Equipe e tenant | `/api/team`, `/api/team/invitations`, `/api/team/activate`, `/api/team/accept`, `/api/auth/organizations`, `/api/auth/switch-organization` | owner e vínculo de convite |
| Clientes/CSV | `/api/clients`, `/api/clients/:id`, `/api/clients/:id/charges`, `/api/clients/import/preview`, `/api/clients/import`, `/api/clients/imports` | tenant; limite de plano |
| Serviços | `/api/services`, `/api/services/:id` | tenant; arquivo lógico |
| Cobranças | `/api/charges`, `/api/charges/:id`, `/api/charges/:id/duplicate`, `/api/charges/:id/cancel`, `/api/charges/:id/history` | `draft` e histórico; financeiro bloqueado até PSP |
| Perfil/suporte | `/api/profile`, `/api/profile/change-password`, `/api/organization`, `/api/support/tickets`, `/api/public/contact` | owner em dados corporativos |
| Pagamento público | `/api/public/charges/:publicToken`, `/api/public/charges/:publicToken/sandbox-qr` | informação minimizada; QR **sandbox** |
| Asaas Sandbox | `/api/sandbox/connection`, `/api/sandbox/charges/:id/issue`, `/reconcile`, `/refunds`, `/reconcile-financial`, `/cancellation`, etc. | owner + CSRF, PSP isolado em sandbox |
| Asaas webhook | `/api/webhooks/asaas-sandbox/:accountId` | authToken validado |
| Recorrências | `/api/recurrences`, `/preview`, `/overview`, `/:id`, `/:id/pause`, `/:id/resume`, `/:id/cancel`, `/:id/cycles` | owner para mutações, tenant |
| WhatsApp | rotas registradas em `server/whatsapp-routes.ts`, webhook `/api/webhooks/meta-whatsapp` | consentimento, HMAC e flags de envio |
| SaaS | `/api/saas/plans`, `/subscription`, `/invoices`, `/quote`, `/change-requests`, `/cancellation`; `/api/admin/saas/plans/:code`, `/coupons` | owner e admin MFA |
| Relatórios F7 | `GET /api/reports/summary`, `GET /api/reports/audit`, `POST /api/reports/exports/:dataset` | tenant; audit/CSV owner, CSRF export |
| Admin F7 | `/api/admin/reports/overview`, `/organizations`, `/organizations/:id/status`, `/audit`, `/support/tickets`, `/privacy/requests` | superadmin MFA |
| Privacidade F7 | `/api/privacy/requests` | owner, tenant; revisão humana |

Os caminhos abreviados com `/:id` dependem de método `GET/PATCH/POST/DELETE` específico, conferir código antes de qualquer integração. Não declarar endpoints não listados como públicos disponíveis.

## 7. Fluxos de dados e regras por domínio

### 7.1 Clientes e serviços

Operações criam/lêem/editam registros de um tenant. Arquivamento é lógico e preserva históricos; reativação confere cota ativa do plano. CSV de entrada tem prévia, normalização de telefone DDI, erros por linha, importação validada e limite transacional. `clients.whatsapp_opt_in` é **legado e não vale como consentimento atual para envio**. Serviços podem receber preço e frequência. Valores em centavos no backend.

### 7.2 Cobrança de profissional e Pix Sandbox

Rascunho nasce `draft`; pode ser editado, duplicado, cancelado e compartilhado com token público, sem Pix live. Com credenciais **do próprio profissional no Asaas Sandbox** e flag de conexão adequada, emissão reserva idempotência, obtém `externalReference`, faz lookup antes de POST e recupera QR, webhooks validam token e IDs. Estornos parciais/total só em sandbox; `refund DONE` reconciliado independentemente. Cobranças e GPV do sandbox permanecem segregados.

### 7.3 Recorrências

Worker cria **rascunhos** em calendário civil, com snapshots não retroativos, lease transacional, token, retry e uniqueness; não cria Pix nem envia WhatsApp. Ao pausar, não apagar ciclos. Retomada `skip_missed` padrão, `catch_up` explícito limitado. Sem cron hospedado não executa periodicamente.

### 7.4 WhatsApp Meta

Conexão por organização: credencial criptografada, WABA e número autorizados; templates `UTILITY` aprovados e recentes, com três parâmetros. Consentimentos versionados com prova e telefone; revogações STOP/PARAR invalidam envios não processados. Outbox com idempotência, HMAC de webhook, eventos antecipados/fora de ordem, `accepted != delivered`. Timeout sem reenvio cego. Envio apenas com flags e escopo autorizados, por padrão **desligado**; organização suspensa desativa conexão/fila pendente.

### 7.5 Monetização SaaS do CobraFlux

Free com limites iniciais **provisionais**: 250 clientes ativos, 60 serviços, 300 cobranças/mês, 50 recorrências, 3 membros e 100 lembretes/mês; Starter/Business têm parâmetros maiores, mas preço `NULL` e `published=false` por padrão. Pedido upgrade cria apenas `saas_invoice` `draft`, não efetiva assinatura. Dunning move estados e impõe limites Free após tolerância; dados permanecem. **Nenhum gateway SaaS live configurado**; não chamar invoice draft de fatura paga.

### 7.6 Fase 7

O painel profissional usa relatório tenant de registros e fornece CSV de clientes/cobranças sob role owner, CSRF, limite de registros, escaping de fórmulas e auditoria; solicitações LGPD não destroem dados. O console admin exige `super_admin` MFA para KPIs globais, gestão de status com revogação de sessões, triagem de tickets, privacidade e auditoria com metadata ocultada. `MRR` considera fatura `platform_live` paga e assinatura ativa dentro de período; `GPV real` filtra `asaas_live` e nunca mistura `asaas_sandbox`.

## 8. Variáveis de ambiente — **apenas nomes, sem valores**

| Área | Variáveis identificadas em `.env.example` |
|---|---|
| Server/DB | `DATABASE_URL`, `DATABASE_SSL`, `SESSION_SECRET`, `APP_ORIGIN`, `PUBLIC_APP_URL`, `APP_URL`, `PORT`, `TRUST_PROXY` |
| E-mail | `RESEND_API_KEY`, `RESET_EMAIL_FROM` |
| MFA e provisioning | `MFA_ENCRYPTION_KEY`, `ADMIN_USER_EMAIL` |
| PSP Sandbox | `PAYMENT_CREDENTIAL_ENCRYPTION_KEY`, `SANDBOX_RECONCILIATION_ENABLED` |
| Recorrência | `RECURRENCE_SCHEDULER_ENABLED` |
| WhatsApp | `WHATSAPP_CREDENTIAL_ENCRYPTION_KEY`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_SEND_ENABLED`, `WHATSAPP_SEND_SCOPE`, `WHATSAPP_TEST_RECIPIENT_ALLOWLIST`, `WHATSAPP_GO_LIVE_APPROVED`, `WHATSAPP_ENQUEUE_ENABLED` |
| SaaS estados | `SAAS_MAINTENANCE_ENABLED` |
| Legado/extra | `GEMINI_API_KEY` — presente no exemplo, **não inferir uso atual no modo operacional** |

**Nunca** colocar valor secreto em variável `VITE_*`, GitHub Issue, PR, screenshot ou arquivo de handoff. `ADMIN_USER_EMAIL` é nome de configuração, não um endereço confidencial fornecido no material.

## 9. Scripts e procedimentos — referência documental, não execução

Pré-requisitos documentados: Node.js 22, npm, PostgreSQL 16+, servidor seguro para envs, HTTPS em produção; `psql`, `pg_dump`, `pg_restore` nos exercícios de DB.

```bash
# Primeiro: consultar HEAD e preparar variáveis seguras fora do Git.
npm install --no-package-lock
npm run migrate
npm run lint
npm run test:domain
npm run test:server
npm run test:ui
npm run test:integration
npm run test:e2e

# Build do modo operacional (sem ativar PSP real)
VITE_APP_MODE=production npm run build
npm run server

# Build demo isolado
npm run build

# Health (servidor iniciado e DB disponível)
# GET /api/health
```

- `npm run dev` inicia Vite na porta 3000/host 0.0.0.0; sem API de produção essa execução não substitui servidor Express.
- `Dockerfile` usa Node 22-alpine e **não executa migrations automaticamente**; executar `npm run migrate` antes do release.
- `npm run admin:enroll` é provisioning de segredo TOTP; **não executar** a partir de agente sem autorização/terminal privado.
- Scripts de inspeção sem efeito financeiro: `npm run reconcile:sandbox -- --dry-run`, `npm run recurring:run -- --dry-run`, `npm run whatsapp:run -- --dry-run`, `npm run whatsapp:enqueue -- --dry-run`, `npm run saas:reconcile -- --dry-run`; cada CLI pode exigir DB/envs. Confirmar sintaxe em cada arquivo CLI antes de usar.
- **Somente quando autorizado:** versões `--once` com flags de habilitação. Não confundir com cron ativo.
- **Backup:** `bash scripts/backup-db.sh` requer `DATABASE_URL`/`BACKUP_DIR`, usa dump custom, verifica índice de archive com `pg_restore --list`; deve criptografar e armazenar off-site.
- **Restore drill:** `bash scripts/restore-drill.sh` requer `RESTORE_DRILL_DATABASE_URL`/`BACKUP_FILE`; recusa alvo cujo nome não termina `_restore_drill`, banco não vazio, e falha se o arquivo estiver ausente. **Nunca executar contra DB principal**.
- **Rollback:** procedimento formal ainda não está documentado/validado para todas as migrações. Reverter código via Git não desfaz mudanças de esquema; planejar rollback e backup antes de release.

## 10. CI/CD e alcance de testes

### Workflow backend: `.github/workflows/production-foundation.yml`

- Trigger por PR/push na branch e/ou caminhos configurados; GitHub Actions com Node 22 e Postgres 16 **efêmero**.
- `npm install --no-package-lock --no-audit`; TypeScript `npm run lint`; testes domínio, segurança e UI; sintaxe de scripts de backup/restore; migrations em dobro; integração multi-tenant; `npm run build` demo e `VITE_APP_MODE=production npm run build`.
- **Sucesso no HEAD:** [run #44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191).

### Browser: `.github/workflows/phase2-browser.yml` + `playwright.config.ts`

- Playwright `chromium` em desktop e emulação de viewport mobile, app operacional servido por Express, Postgres temporário e URL loopback HTTP **em CI**.
- Cobertura observada: login, cadastro de cliente, serviço, recorrência, rascunho, menu, assinaturas, relatórios e controles de visibilidade. **Não prova Android WebView físico, acessibilidade integral, network/PSP reais ou diferenças de fabricantes.**
- **Sucesso no HEAD:** [run #44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168).

### Execução dos novos testes Fase 7

- `server/phase7-domain.test.ts` verifica defesa contra fórmula em CSV e distinção financeiro.
- `server/phase7.integration.test.ts` verifica autenticação MFA/admin, CSRF, cross-tenant, relatórios com sandbox isolado, alteração de contas/sessões, eventos de suporte, privacidade e audit append-only.
- `src/pages/production/ProductionShell.test.tsx` verifica menu por papel e renderização operacional (SSR).
- A sequência de correção registrou falhas iniciais de TypeScript/asserção de BOM CSV; **ambas foram corrigidas no HEAD**, cujo backend e browser passaram. Veja commits no `07-EVIDENCIAS-E-LACUNAS.md`.

## 11. Infraestrutura real, deploy e monitoramento — lacunas

**Não confirmado/indisponível:** servidor VPS/cloud atual, domínio HTTPS, certidões DNS, storage off-site, transporte Resend verificado, PostgreSQL gerenciado/PITR, Meta App/WABA/números aprovados, Asaas Sandbox real, conta PSP SaaS, observabilidade/alertas, API live, política operacional de rotação e distribuição Play. Logo, o documento **não contém comando de deploy verdadeiro** nem URL de produção inventada.

**Staging mínimo futuro (proposta técnica, não execução aprovada para agora):** PostgreSQL gerenciado com menor privilégio, envs em secret manager, HTTPS e origem única, email provider testado, backup off-site + restore real isolado, migração auditada, logs/alertas, PSP Sandbox e Meta de teste, plano de rollback. Avaliar responsabilidade LGPD e emissão fiscal com especialista.

## 12. Compatibilidade, acessibilidade e pendências de qualidade

- Navegação **responsiva** no código: sidebar desktop, drawer mobile, bottom bar e cards, com smoke Playwright. Nenhuma medição formal de WCAG ou teste de leitor de tela físico foi identificada.
- Idioma das telas observadas: **pt-BR**. Não há requisito aprovado/conclusão de internacionalização global para CobraFlux no material acessível; o pedido multilíngue associado a outro projeto não deve ser importado.
- Aparência: estética escura com dourado/esmeralda e componentes de marca `GoldenLogo`. Paridade funcional/visual completa do mockup ainda está pendente na Issue #3.
- Performance/carga: nenhum benchmark de produção, SLO, RPO/RTO efetivo ou teste volumétrico confiável foi localizado.
- Segurança: CI testa algumas propriedades; auditoria pentest, threat model, logs/segredos, retencão e avaliação externa ainda faltam.
- Mobile: Playwright em emulação não cobre MIUI/One UI, Android API 36+ nem restrições de WebView; a branch demo é separada.

## 13. Estado de publicação

**Não publicado em ambiente comercial**; nenhum endpoint público de produção/live foi demonstrado. `main` preservada; PR #2 draft; testes aprovados **em ambiente efêmero do GitHub Actions**, não em servidor do usuário. Nenhum usuário real de produção, receita, transação financeira, disparo WhatsApp ou backup restaurado foi comprovado.
