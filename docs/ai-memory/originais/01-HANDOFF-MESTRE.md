# 01 — HANDOFF MESTRE · CobraFlux

**Versão documental:** 2026-11-21 · **Snapshot do código:** `9c8544730b47059f4f8977bd950e46227784c9c0` · **Estado:** Fase 7 iniciada/testada em código; operação pública ainda não homologada. Documento para continuidade, não substitui auditoria do HEAD.

## 1. Sumário executivo e escopo

O **CobraFlux — Sistema de Cobranças** é um SaaS destinado a profissionais autônomos, consultores, professores, personal trainers, clínicas de estética e outros pequenos prestadores de serviços no Brasil. Seu caso de uso é organizar o cadastro de clientes/serviços, gerar cobranças e recorrências, apresentar acompanhamento financeiro, preparar comunicações WhatsApp e permitir administração e suporte da plataforma. **Receita das assinaturas da plataforma e valores faturados pelos profissionais pertencem a fluxos econômicos distintos.**

O ponto de partida foi um produto demonstrativo identificado no repositório como **Golden Billing SaaS (v1.0 Demo)**, com frontend React/TypeScript, persistência **IndexedDB**, simuladores de pagamento, mensagens, administração, relatórios e pagamentos ilustrativos. Em 20/11/2026 o responsável pediu uma auditoria do CobraFlux no GitHub e um roadmap para converter o mockup em sistema funcional. A execução autorizada manteve o modo demo, criou um **modo operacional separado** usando PostgreSQL, backend Express/TypeScript e migrações versionadas. O produto **não está implantado em produção** e **não processa dinheiro real**.

**Escopo confirmado do projeto:** website institucional demonstrativo; autenticação e membros profissionais; organizações e operadores; clientes, serviços, cobranças; Pix em Asaas Sandbox inicialmente; recorrência de rascunhos; WhatsApp Business Cloud API; assinaturas da própria plataforma; administração central e relatórios; requisitos de segurança, LGPD e futura publicação Android. Há uma branch Android de **demo** que não deve ser confundida com um aplicativo de produção.

### 1.1 Fronteira entre projetos

- **Dentro do escopo:** CobraFlux e seu ancestral documental Golden Billing; branch `feat/production-foundation`, branch demo Android e PR #2.
- **Projeto separado:** “Universal Build” / sistema universal de build Android, discutido noutra conversa; mesmo que possa compilar o CobraFlux futuramente, não incorpora requisitos de build universal neste repositório.
- **Outros projetos independentes:** FreePremium/Free-Ptemium, LinkFree/LinkStack, Bitdeer-BTC e boilerplate Android genérico. Suas anotações numeradas, políticas de dados, branches e regras de interface **não se transferem automaticamente para o CobraFlux**.
- **Lacuna:** não foi possível recuperar o texto de todas as mensagens antigas do projeto; propostas nelas eventualmente contidas e ausentes do GitHub não são tratadas como decisões existentes.

## 2. Fontes usadas e classificação de confiabilidade

**FATO VERIFICADO:** leitura não destrutiva do repositório público, árvore de arquivos, configuração de scripts, `src/App.tsx`, `server/index.ts`, migrações 001–016, módulos da Fase 7, documento antigo, docs de Fase 1–7, issue #3, PR #2, lista de branches, histórico de commits e workflows. Para cada afirmação técnica, verificar [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2) e [árvore fixa](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0).

**FATO VERIFICADO – CI no HEAD:** workflow backend/PostgreSQL [#44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191) `success`; workflow Playwright Chromium desktop/mobile [#44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168) `success`. Isso comprova sucesso das verificações **automatizadas definidas nesses workflows**, não ausência geral de vulnerabilidades nem funcionamento contra PSP/Meta externos.

**DECLARAÇÃO HISTÓRICA:** a pessoa responsável informou não dispor de hospedagem para staging e aprovou continuar o desenvolvimento em código antes da homologação real. Esse aceite foi também registrado na Issue #3 sob “Decisão sobre homologação sem hospedagem”.

**LACUNA:** mensagens antigas compactadas; anexos inexistentes na superfície de arquivos desta conversa; nenhuma prova da execução de backup/restauração, e-mail real, credenciais PSP ou Meta, AAB Play ou testes em aparelho Android físico.

## 3. Cronologia reconstituída

| Data conhecida | Marco | Evidência / consequência |
|---|---|---|
| **13/11/2026** | Repositório criado. Commit inicial e inicialização “Golden Billing SaaS”, depois páginas de status/navegação. | GitHub: `773fb4d`, `525dc9c`, HEAD da `main` `95aba9c` (13/11). Não implica que a marca comercial tenha sido renomeada nesse dia. |
| **19/11/2026** | Há histórico de build demonstrativo Android (conversa recuperável); branch `android-webview-demo-debug`. | Histórico do usuário/IA; existência atual da branch e de `mobile/android/...` e workflow foi confirmada. O build histórico específico não foi inspecionado como APK nesta auditoria. |
| **20/11/2026** | Solicitação do usuário: auditar GitHub e converter mockup em produto real mediante plano/roadmap; evitar misturar com FreePremium. | Resumo recuperado da conversa e Issue #3 “auditoria de 20/11/2026”. |
| **20/11/2026** | Fundação: branch `feat/production-foundation`; API Express/TS, PostgreSQL, segurança, cadastros, links não financeiros; PR #2 draft. | Código e histórico de commits; confirmação retrospectiva do estado antigo em conversas. |
| **20/11–21/11/2026** | Fase 1: verificação de e-mail, TOTP MFA, sessões, scripts de backup. Gate externo inicialmente exigido antes da Fase 2. | `docs/FASE_1_SEGURANCA_OPERACAO.md`; Issue #3; código/testes. |
| **21/11/2026, ordem lógica registrada** | Mudança de decisão: sem hospedagem no momento, avançar código fase a fase; manter homologações externas para pré-lançamento. | Pedido visível do usuário e seção explícita na Issue #3. **Decisão vigente**. |
| **21/11/2026** | Fase 2: CRUD completo operacional, CSV, perfis, suporte, equipe, convites, shell responsivo; paridade visual integral pendente. | Migrações 004–005, docs Fase 2, CI histórica. |
| **21/11/2026** | Fase 3: Asaas **Sandbox** com Pix/QR, webhooks, estornos, reconciliação, comprovantes, cancelamentos. **Sem conta PSP real**. | Migrações 006–010, docs Fase 3, testes mockados. |
| **21/11/2026** | Fase 4: recorrências semanais/mensais, calendário civil São Paulo, workers geradores de *drafts*. | Migração 011, docs Fase 4, código, CI. Sem cron em infraestrutura real. |
| **21/11/2026** | Fase 5: Meta Cloud API em código, consentimento versionado, opt-out, fila, HMAC webhook e workers desligados. | Migrações 012–014, docs Fase 5, código e testes. |
| **21/11/2026 05:04–05:15 UTC** | Fase 6: SaaS ledger separado, planos, cotações/cupons, quotas, dunning e frontend Meu Plano; último commit do núcleo técnico `e79c829d`. | Histórico Git, `015_saas_billing.sql`, Fase 6, CI histórica. Checkout real continua pendente. |
| **21/11/2026 13:36–13:45 UTC** | **Fase 7 iniciada**: migração 016; administração, auditoria, privacidade, relatórios MRR/GPV, exportações e interfaces; correções dos testes. | Commits `d552e99f` → `9c854473`; CI atual verde. |
| **21/11/2026, após 13:45 UTC** | Usuário solicitou auditoria documental/handoff; auditoria apenas leu fontes e criou pacote local de Markdown/ZIP, sem alterar código. | Pedido atual, sem qualquer commit de auditoria. |

**Nota de integridade:** a cronologia das fases foi conferida com logs Git e docs; não atribuímos datas/horas às solicitações intermediárias sem registros. Não há garantia de leitura de todas as mensagens compactadas.

## 4. Arquitetura vigente — resumo

**Demo legado:** `src/App.tsx` seleciona `AppProvider` e `src/pages/institutional`, `professional`, `public`, `admin` quando `VITE_APP_MODE` não é `production`; serviços `src/services/demoService.ts` e `src/services/db.ts` persistem no IndexedDB. Esse ambiente pode simular pagamentos, mensagens e cobranças **sem efeitos bancários**.

**Modo operacional real (não publicado):** `VITE_APP_MODE=production` renderiza `src/pages/production/ProductionApp.tsx`; componentes em `src/pages/production/`; API tipada em `src/services/productionApi.ts`; backend `server/index.ts` em Express 4/TypeScript; dados em PostgreSQL 16+; scripts de migração em `server/migrate.ts`, 16 arquivos SQL versionados. Numa mesma origem HTTP(S), o backend serve API `/api/*` e build Vite `dist/`. `Dockerfile` usa Node 22 e compila o modo produção, mas não aplica migrações automaticamente.

**Dependências observadas:** React 19, ReactDOM, Vite 8, TypeScript 7, Tailwind CSS 4, Lucide, Zod 4, Express 4, `pg`, `bcryptjs`, `tsx`, Playwright Chromium, `vite-plugin-pwa`; bibliotecas de demonstração/visualização adicionais Recharts, `motion` e `jspdf`. **Não presumir que toda dependência esteja em uso no modo real.**

**Autenticação:** registro de organização e titular; e-mail verificado obrigatório; senha com hash; cookie HttpOnly SameSite e `Secure` com NODE_ENV produção; sessões com expiração/revogação; CSRF em mutações; rate limits no banco; papéis `owner`, `operator`, `super_admin`; TOTP obrigatório ao super_admin, com prevenção de replay. Tenant derivado de sessão+membership; isolamento no SQL. Não se deve conferir autorização apenas por esconder menus.

**Dinheiro:** unidades em **centavos inteiros**; cobranças começam como `draft`; não há endpoint legítimo para marcar `paid` com input arbitrário; Asaas está fixado no host Sandbox; recibo de estorno exige confirmação DONE; dinheiro sandbox não entra em KPIs reais; assinatura SaaS tem **ledger e estado separados**. **MRR != GPV**. A Fase 7 consulta parâmetros `platform_live` e `asaas_live` como condições estritas de relatório, **não** como integrações live existentes.

**Mensageria:** Meta WhatsApp Cloud API v27.0, credenciais criptografadas por tenant, webhooks assinados com HMAC e assinatura do corpo bruto, opt-in versionado; estado de envio desconhecido após timeout não pode causar reenvio cego. Trabalhadores/cron não são iniciados automaticamente pelo servidor.

## 5. Mapa de módulos com estado atual

| Área → módulo / arquivo | Comportamento em código | Estado e restrições |
|---|---|---|
| Institucional/demo: `src/pages/institutional/*` | Landing, autenticação demonstrativa, status | Demo preservada, não representa site público real implantado |
| Profissional/demo: `src/pages/professional/*` | Múltiplas telas e fluxos simulados, IndexedDB | Referência visual/funcional; não usar em pagamentos reais |
| API de autenticação: `server/index.ts` | Cadastro, verificação, login/sessões, recuperação, superadmin MFA, health | Testada em CI; e-mail real/MFA provisionado em staging não testados |
| Operações: `server/operations.ts` + `Clients/Services/ChargesOperationsView` | Clientes, CSV, serviços, cobranças em drafts, alterações, histórico e suporte | Testada; paridade visual total com demo não comprovada |
| Equipe: `server/team.ts` + `TeamOperationsView` | Convites, aceites, papéis, troca de organização, revogação | Implementada/testada; envio de convite real depende de e-mail |
| Pix: `server/asaas-sandbox.ts`, `sandbox-payments/refunds/cancellation/reconciliation` | Emissão, QR, eventos, estorno, reconciliar e cancelar **em sandbox** | Mock/CI testado; não homologado no PSP remoto |
| Recorrências: `server/recurrences.ts` + `recurrence-worker.ts` | Regras semanais/mensais, rascunhos idempotentes, pausa/cancelamento | Código e CI; cron hospedado não ativo |
| WhatsApp: `server/whatsapp-*.ts` | Configuração, consentimentos, templates UTILITY, outbox, HMAC, opt-out | Envio real desativado; conta Meta/token/homologação pendentes |
| SaaS: `server/saas-*.ts` + `SaasBillingView` | Free/Starter/Business, cotação, cupom, quotas, invoices `draft`, dunning | Núcleo de código testado; PSP SaaS live ausente |
| Fase 7: `server/phase7-routes.ts` + `ReportsOperationsView` | Sumários tenant, exportações CSV e trilha de auditoria | **Primeiro incremento testado**, fase aberta |
| Superadmin: `AdminOperationsView` | MRR/GPV, organizações, suporte, LGPD, eventos; MFA server-side | **Primeiro incremento testado**; respostas reais e governança pendentes |
| Segurança/privacidade: `server/migrations/016_admin_reporting_privacy.sql` | Tickets com eventos, pedidos LGPD, audit append-only | Testado em CI; **não significa conformidade legal completa** |
| Android: `android-webview-demo-debug`, `mobile/android/*` | WebView demonstrativo/build de testes em branch independente | **Não integrado** ao modo real; não é AAB release da Play Store |

Mapa completo, rotas e tabelas no `05-ARQUITETURA-E-ESTADO-TECNICO.md`.

## 6. Decisões vigentes (resumo das ADRs)

1. **Git preservado:** criar/executar somente na branch `feat/production-foundation` e manter `main` congelada; PR #2 draft.
2. **Desenvolver antes de hospedar:** validação CI permite avançar fases; homologações externas ficam como gates reais pré-lançamento, não são falsamente aprovadas.
3. **Preservar a demo** e operar API real em build específico por `VITE_APP_MODE=production` — fato do código; o documento original sugeria usar um serviço substituto `IGoldenBillingService`, mas essa implementação específica não foi seguida.
4. **PostgreSQL multi-tenant** e acesso por membership/sessão; nunca localStorage para saldo/cobrança reais.
5. **Finanças restritas ao sandbox** por enquanto; não transformar simulações em movimentações verificadas.
6. **Evitar cobrança/envio duplicado:** idempotência, leases e reconciliação; resultado de rede incerto não habilita retry financeiro cego.
7. **Meta oficial** e consentimento versionado; UI legado de opt-in não constitui prova de autorização.
8. **SaaS separado de GPV** e upgrade após confirmação externa; preços pagos ainda não configurados.
9. **Retenção/privacidade:** pedido de exclusão inicia revisão; não elimina dados contábeis sem base legal e fluxo comprovado.
10. **Android depois da estabilidade do web real**, sem confundir build demonstrativo com distribuição de produção.

Detalhamento, status e alternativas documentadas em `03-REGISTRO-DE-DECISOES.md`.

## 7. Estado da execução e roadmap

| Fase | Produto/código | Verificação conhecida | Falta operacional/funcional |
|---|---|---|---|
| 0 Preparação | CI, branch e PR | CI atual verde | baseline visual integral do demo |
| 1 Segurança | Auth, MFA, sessões, banco, scripts backup | CI unitária/integração | HTTPS/e-mail/restore real; observabilidade |
| 2 Operações | CRUD/CSV/equipe/UI | CI/Chromium | paridade visual fina, e-mail convite |
| 3 Pix | Asaas Sandbox, QR, refunds, reconciliação | testes mockados, CI | PSP real de homologação, live vetado |
| 4 Recorrências | regras e worker rascunho | CI + calendário | cron e homologação externa |
| 5 WhatsApp | Meta API, consentimento, fila e webhooks | CI com mocks | Meta real, entrega/custos e revisão legal |
| **6 SaaS** | planos, quotas, drafts, dunning | CI no commit `e79c829d` | PSP SaaS, webhook financeiro, preços, fiscal |
| **7 Admin/reports** | **primeiro incremento implementado** | **CI `9c854473` verde** | suporte completo, LGPD, governança, refinamentos |
| 8 Homologação | scripts/CI parcial | testes automáticos | staging, carga, PITR, piloto, rollback |
| 9 Android | branch demo existente | histórico de workflow demonstrativo | integração real, API 36+, AAB assinado, Play |

**Conclusão conservadora:** o **último marco novo tecnicamente confirmado é a primeira entrega da Fase 7 em 21/11/2026**, mas **a última fase cujo núcleo de desenvolvimento foi declarado tecnicamente concluído é a Fase 6**. O produto inteiro **não está pronto nem publicado**.

## 8. Dívidas, riscos e pontos que exigem avaliação

**Bloqueios já reconhecidos no roadmap:** ausência de hospedagem, backup PITR/restauração, transações externas reais, credenciais Asaas/Meta/Resend, avaliações LGPD/fiscais/antifraude, compatibilidade Android física e distribuição. Ver `04-BACKLOG-CONSOLIDADO.md` para tratamento sem duplicações.

**Possíveis preocupações inferidas da inspeção, não bugs confirmados:**

- A antiga documentação `docs/DOCUMENTACAO_GOLDEN_BILLING.md` descreve uma estratégia de `IGoldenBillingService`/`httpApiService.ts`; o código em produção escolhe `ProductionApp` isolado. Não tratar documento legado como arquitetura operacional atual.
- O relatório de MRR do primeiro incremento usa condição estrita de fatura SaaS paga dentro do período ativo. **Não comprova** conciliação com PSP real, receita líquida, impostos ou anualização confiável para todos os ciclos. Revisão financeira é pendente.
- A trigger append-only em `audit_logs` precisa de política explícita para retenção/segregação de dados e tratamento de eventos sensíveis, não deve ser removida sem revisão.
- Uma suspensão pode ter consequências em workers já em voo; CI cobre revogação de sessões e filas básicas, não prova ausência de todas as corridas possíveis em operação distribuída. Exigir testes de concorrência específicos em staging.
- A UI Fase 7 foi testada no escopo dos smoke/E2E existentes; **não significa teste visual pixel-a-pixel** de todos os formulários/estados de erro.
- A API de exportação limita a 1000 itens por arquivo; **não é portabilidade LGPD integral** nem relatório contábil certificado.
- Métricas denominadas “real” devem ser revisadas após existir provedor live, sob acompanhamento de compliance; um rótulo de `provider` no banco, isoladamente, não prova recebimento sem cadeia de origem. O roadmap exige essa cadeia.

## 9. Operação — apenas referência, NÃO executada na auditoria

**Preparar local:** Node.js 22, npm, PostgreSQL 16+, envs de servidor. Copiar do exemplo com valores seguros; nunca publicar segredos. `npm install --no-package-lock`; preparar `DATABASE_URL`, `SESSION_SECRET`, `APP_ORIGIN`, `PUBLIC_APP_URL` conforme `docs/EXECUCAO_PRODUCAO_FUNDACAO.md`; `npm run migrate`; build operacional `VITE_APP_MODE=production npm run build`; `npm run server` (servidor + build). Demo: `npm run dev`/build sem `VITE_APP_MODE=production`, isolado.

**Comandos de verificação:** `npm run lint`, `npm run test:domain`, `npm run test:server`, `npm run test:ui`, `npm run test:integration`, `npm run test:e2e`, `npm run build`; `GET /api/health`. Testes de integração exigem Postgres e env de teste. Workflows fazem migração duas vezes para testar idempotência. **Não rode um worker com `--once` em ambiente de produção por mera leitura deste handoff.**

**Backups:** `scripts/backup-db.sh`, `scripts/restore-drill.sh`; scripts foram examinados, **não executados** na infraestrutura do usuário. Restauração somente em banco vazio de teste com sufixo `_restore_drill` de acordo com script, sem tocar o banco principal. Consultar `05` e `08` antes de qualquer tentativa.

**Provedores:** PSP sandbox, WhatsApp, SaaS maintenance e recorrência usam flags desligadas por padrão (`SANDBOX_RECONCILIATION_ENABLED`, `RECURRENCE_SCHEDULER_ENABLED`, `WHATSAPP_SEND_ENABLED`, `WHATSAPP_ENQUEUE_ENABLED`, `SAAS_MAINTENANCE_ENABLED`); nenhuma integração deve sair do modo seguro sem gate formal.

## 10. Próxima ação mandatória de continuidade

1. **Não iniciar mudança ao ler o handoff.** Abrir HEAD, confirmar a PR/CI e ler docs Fase 7 e Issue #3.
2. Fazer inventário de tela/rota real versus mockup e mapear lacunas da Fase 7; considerar também experiência do operador e acessibilidade.
3. Continuar a **Fase 7**, na mesma branch, com solução verificável de suporte (registro e resposta segura, sem envio fictício), governança de auditoria e execução de pedidos LGPD com fluxo de prova legal — **sem apagar informações financeiras por presunção**.
4. Submeter testes de unidade/integração, autorização, migração e Chromium no novo commit; só atualizar status para “implementada—testada” após sucesso apropriado.
5. Atualizar ADR/matriz/backlog/roadmap e PR/issue. Manter fatos não verificados como não verificados.
6. Deixar deploy, PSP externo, e-mail e backups reais para etapa de homologação autorizada, sem maquiar pendências.

## 11. Índices de consulta

- `02-MATRIZ-DE-REQUISITOS.md`: índice individual REQ, origem, decisão/execução/qualidade, critérios e dependências.
- `03-REGISTRO-DE-DECISOES.md`: ADRs e conflitos, incluindo mudança de gate por ausência de hospedagem.
- `04-BACKLOG-CONSOLIDADO.md`: pendências com prioridade e próxima ação concreta.
- `05-ARQUITETURA-E-ESTADO-TECNICO.md`: estrutura Git/API/DB/ambiente/testes.
- `06-ROADMAP-E-MARCOS.md`: etapas e dependências, inclusive condições para publicação.
- `07-EVIDENCIAS-E-LACUNAS.md`: evidências fixas, nível de confiança, inconsistências e limitações.
- `08-PROTOCOLO-DE-RETOMADA.md` e `09-PROMPT-AUTONOMO-DE-RETOMADA.md`: continuidade de outro agente.
