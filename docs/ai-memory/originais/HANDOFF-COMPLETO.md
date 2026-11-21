# COBRAFLUX — HANDOFF COMPLETO / VERSÃO CONSOLIDADA

Este arquivo reúne literalmente o conteúdo dos documentos 00–09 para facilitar o envio a outro agente. Os arquivos separados são a forma canônica de edição; cada seção conserva seu título e referências. **Snapshot Git:** `9c8544730b47059f4f8977bd950e46227784c9c0` · **Data:** 21/11/2026.

# 00 — LEIA PRIMEIRO · Knowledge Handoff CobraFlux

**Corte documental:** 21/11/2026, última verificação remota do commit `9c8544730b47059f4f8977bd950e46227784c9c0` (2026-11-21 13:45:54 UTC). **Natureza:** auditoria de fontes acessíveis, somente leitura; não é laudo de segurança nem comprovação de produção.

## Identidade e proposta

**Projeto vigente:** CobraFlux — Sistema de Cobranças. **Nome documental anterior:** *Golden Billing SaaS* (documentação da versão demonstrativa ainda presente no repositório). SaaS brasileiro para profissionais autônomos e pequenos prestadores de serviços: clientes, serviços, cobranças, Pix, recorrências, lembretes WhatsApp, relatórios, assinaturas SaaS e painel de operação. O modelo original é um **mockup React com IndexedDB e dados simulados**; o objetivo de desenvolvimento autorizado é convertê-lo em um produto real, persistente e seguro, **preservando a demonstração isolada**.

> **O que nunca confundir:** (1) demo com produção; (2) Pix **Asaas Sandbox** com dinheiro real; (3) receitas das assinaturas vendidas pelo CobraFlux (**MRR SaaS**) com dinheiro processado para profissionais (**GPV**); (4) código implementado/CI verde com homologação em infraestrutura real.

## Estado Git confirmado em 21/11/2026

| Referência | Estado verificado |
|---|---|
| Repositório | [`sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas`](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas) — público |
| Branch autorizada para desenvolvimento | `feat/production-foundation` — `9c8544730b47059f4f8977bd950e46227784c9c0` |
| `main` | `95aba9c27c363c8b24c2f34c65a28c2f3b011b3b` — **não modificada** durante esta sequência |
| Branch Android demonstrativa | `android-webview-demo-debug` — `326c326e445f3b0338ba3a8eb39db864a2aa1453` |
| PR | [#2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2): aberta como **draft**, **não mesclada** |
| Roadmap | [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3) |
| Backend e integrações no commit atual | [GitHub Actions #44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191) — **success** |
| Navegador desktop/mobile no commit atual | [GitHub Actions #44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168) — **success** |

**Regra de trabalho atual:** preservar `main`, trabalhar somente na branch da PR, comparar solicitação com código antes de alterar, validar a cada avanço, não mesclar/publicar nem ativar operações financeiras externas sem autorização específica. A pessoa responsável decidiu continuar implementando **sem hospedagem neste momento**; staging HTTPS, e-mail real, backup/restauração, provedores externos e testes físicos ficam **adiados para homologação**, não dispensados.

## Último marco e ponto de retomada

- **Último núcleo de fase tecnicamente concluído em código:** **Fase 6, monetização SaaS**; há *pendências substanciais* de checkout/PSP da própria plataforma, pagamento verificado, tributação e homologação. Não dizer «Fase 6 operacionalmente concluída».
- **Fase corrente:** **Fase 7, Administração e Relatórios**, já **iniciada e com primeiro incremento testado** no commit `9c854473`: relatórios por tenant, painel superadmin com MFA, suspensão/reativação de organizações, auditoria, suporte, triagem LGPD e exportações CSV protegidas. **A Fase 7 não foi encerrada.**
- **Próxima ação autorizada pelo roadmap:** **continuar a Fase 7**, primeiro verificando HEAD e CI, depois concluir o que ainda falta em atendimento de suporte, governança/LGPD, relatórios e paridade visual. Não avançar automaticamente para Fase 8 nem executar operações destrutivas.
- **Última ação desta auditoria:** inspeção remota **somente leitura**. Nenhum commit, migração, deploy ou alteração de servidor executado pelo handoff.

## Principais bloqueios sem infraestrutura

Servidor de staging/produção HTTPS e PostgreSQL gerenciado; envio Resend validado; MFA provisionado em terminal seguro; backups off-site criptografados com restauração realmente testada; contas e webhooks **Asaas Sandbox**, **Meta WhatsApp Cloud API** e PSP **SaaS da plataforma**; credenciais protegidas; políticas LGPD, fiscal, ant fraude; cron e observabilidade; Android físico, assinatura AAB e revisão Play Store. A inexistência de hospedagem impede **homologação**, não o desenvolvimento de código com CI.

## Regras inegociáveis de continuidade

1. **Não modificar `main`**, não mesclar PR #2, não publicar sem autorização expressa de release.
2. Nenhuma ação de browser, CSV, operador ou webhook não verificado deve definir cobrança como `paid` ou liberar plano SaaS pago.
3. **Não utilizar dados demonstrativos como dinheiro real.** O modo demo e a API PostgreSQL são aplicações intencionalmente distintas.
4. Em toda rota protegida, tenant deve ser derivado **da sessão autorizada**, nunca de identificador arbitrário enviado no corpo da requisição.
5. Segredos somente no servidor/gerenciador seguro, nunca em frontend, repositório, arquivos de handoff ou logs publicados.
6. Provedores externos e workers continuam desabilitados por padrão até homologação e aprovação.
7. **Read-only por padrão ao retomar:** verificar a branch, commits, PR, issue, arquivos e CI antes de propor/escrever mudanças.

## Fontes e limitações

**Acessado/verificado:** repositório GitHub (árvore, branch, commits, componentes, migrações, documentação, package/scripts e CI), [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2), [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), mensagens recentes visíveis e resumos históricos recuperáveis de conversas anteriores.

**Não acessado integralmente:** várias centenas de mensagens antigas desta própria conversa aparecem compactadas/omitidas; nenhum link individual está disponível para essas mensagens. Pesquisa de anexos nesta conversa retornou **nenhum arquivo disponível**. Não foi possível inspecionar servidor de staging, dashboard de Asaas/Meta/Resend, backups reais, ambiente Android físico ou conta de publicação. O handoff **não reivindica cobertura de 100% das solicitações históricas**; requisitos ausentes desse material devem ser recuperados do usuário ou de fontes adicionais antes de serem inventados.

## Sequência de leitura dos artefatos

`00` → `01-HANDOFF-MESTRE` → `03-REGISTRO-DE-DECISOES` → `02-MATRIZ-DE-REQUISITOS` → `04-BACKLOG-CONSOLIDADO` → `05-ARQUITETURA-E-ESTADO-TECNICO` → `06-ROADMAP-E-MARCOS` → `07-EVIDENCIAS-E-LACUNAS` → `08-PROTOCOLO-DE-RETOMADA` → **`09-PROMPT-AUTONOMO-DE-RETOMADA`**.

**Não substitua evidências de teste/estado do repositório por afirmações da conversa.** O snapshot é datado e deve ser revalidado quando outra IA assumir.

---

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

---

# 02 — Matriz de Requisitos e Solicitações (consolidação individual)

**Corte:** 21/11/2026 · `feat/production-foundation` `9c854473`. Cada requisito tem origem, decisão, execução e qualidade de evidência separadas.

**Limite:** não foi recuperado integralmente o conteúdo de centenas de mensagens antigas compactadas. A matriz indexa **requisitos identificáveis no pedido do usuário, documentos/Issue #3 e código**, não alega ser transcrição integral de todo o histórico. Não foram encontradas “ANOTAÇÃO Nº 01/02…” específicas do CobraFlux nas fontes consultadas; numeração de outros projetos não foi importada. Identificadores REQ são índices auxiliares novos.

**Estados de execução:** `IMPLEMENTADA — TESTADA` significa código + teste automatizado adequado observado, **não** publicação/homologação; `BLOQUEADA` significa dependência externa/documental ainda não satisfeita; `EM DESENVOLVIMENTO` = entrega parcial; `PLANEJADA` = roadmap sem implementação comprovada. **Estados de decisão** incluem decisões de plano geral; não significam que o usuário aprovou preços, fornecedor live ou mudanças jurídicas concretas.

**Referências globais:** [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2), [HEAD fixo](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0), [CI backend](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191), [CI browser](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168).

## Índice e distribuição por origem temática

| Grupo | Origem/fase | Quantidade |
|---|---|---:|
| GOV | Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2 | 11 |
| DEMO | Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2 | 9 |
| SEC | Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md` | 12 |
| OPS | Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md` | 12 |
| PIX | Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md` | 13 |
| REC | Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md` | 9 |
| META | Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md` | 12 |
| SAAS | Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md` | 12 |
| ADM | Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md` | 15 |
| OPSREL | Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação | 8 |
| ANDROID | Issue #3 Fase 9; histórico do workflow CobraFlux demonstrativo; branch Android | 6 |

**Total de itens individualizados:** **119**. Esse total mede apenas itens localizados e indexados, **não percentual de cobertura do histórico**.

## Inventário completo

---

## Grupo GOV — Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2

### REQ-001 — Escopo CobraFlux SaaS
- **TÍTULO:** Escopo CobraFlux SaaS.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Transformar o demonstrativo Golden Billing/CobraFlux em SaaS real para profissionais.
- **LOCAL AFETADO:** Projeto inteiro.
- **CRITÉRIOS DE ACEITAÇÃO:** Funcionalidades principais operacionais usam backend real e segurança; mockup continua isolado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** Todas as fases; validação global.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Não confundir mockup com produto homologado.

### REQ-002 — Preservar main
- **TÍTULO:** Preservar main.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Não alterar a branch `main` até autorização específica.
- **LOCAL AFETADO:** Git.
- **CRITÉRIOS DE ACEITAÇÃO:** HEAD de main permanece imutável em relação ao snapshot 95aba9c.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** PR #2; CI.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Restrição de desenvolvimento, não implementação de frontend.

### REQ-003 — Branch e PR draft
- **TÍTULO:** Branch e PR draft.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Trabalhar em `feat/production-foundation` com PR #2 em rascunho.
- **LOCAL AFETADO:** GitHub.
- **CRITÉRIOS DE ACEITAÇÃO:** Commits de produção só na branch autorizada; PR não mesclada.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Main preservada.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Revalidar HEAD antes de qualquer escrita.

### REQ-004 — Auditar antes de alterar
- **TÍTULO:** Auditar antes de alterar.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Consultar remota, estado existente e testes para evitar reimplementação.
- **LOCAL AFETADO:** Fluxo de engenharia.
- **CRITÉRIOS DE ACEITAÇÃO:** Cada mudança indica arquivos encontrados, lacunas e evidência posterior.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** GitHub e CI.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Regra de processo, não função de produto.

### REQ-005 — Seguir fases na ordem
- **TÍTULO:** Seguir fases na ordem.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Desenvolver segundo fases 0–9 e cumprir critérios de passagem técnica.
- **LOCAL AFETADO:** Roadmap.
- **CRITÉRIOS DE ACEITAÇÃO:** Nenhuma fase é publicada sem gates; etapa seguinte não salta pendências críticas.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** Issue #3.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Fase 7 está aberta.

### REQ-006 — Continuar sem hospedagem
- **TÍTULO:** Continuar sem hospedagem.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Seguir implementação em código usando GitHub Actions, adiando staging real.
- **LOCAL AFETADO:** Planejamento/ambientes.
- **CRITÉRIOS DE ACEITAÇÃO:** CI por commit aprovada; pendências externas registradas e não declaradas resolvidas.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** ADR-003; Fases 1–9.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Substitui o gate antigo que bloqueava Fase 2; não dispensa homologação.

### REQ-007 — Nenhum Pix live prematuro
- **TÍTULO:** Nenhum Pix live prematuro.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Não ativar dinheiro real até PSP, HTTPS, auditoria e autorização de go-live.
- **LOCAL AFETADO:** Financeiro/release.
- **CRITÉRIOS DE ACEITAÇÃO:** Ausência de rotas live habilitadas; gate de release explícito.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F3; F8.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Regra de segurança; autorização de live ainda não dada.

### REQ-008 — CI em cada incremento
- **TÍTULO:** CI em cada incremento.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Validar typecheck, migrações, domínio, integração, builds e Playwright.
- **LOCAL AFETADO:** GitHub Actions.
- **CRITÉRIOS DE ACEITAÇÃO:** Sucesso nos workflows do commit de referência, não em commit antigo.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** GitHub Actions.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** CI atual `44910490191` e `44910490168` success.

### REQ-009 — Não guardar segredos no Git
- **TÍTULO:** Não guardar segredos no Git.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** API keys, tokens, senhas e TOTP apenas em ambiente privado do servidor.
- **LOCAL AFETADO:** Git/infra/API.
- **CRITÉRIOS DE ACEITAÇÃO:** Nenhuma credencial no repositório/handoff; rotas não devolvem segredos.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** F1/F3/F5; segurança externa.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Cobertura CI parcial; auditoria de segredos externa pendente.

### REQ-010 — Separar projetos independentes
- **TÍTULO:** Separar projetos independentes.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Não transportar requisitos de Bitdeer, LinkFree, FreePremium e Universal Build para CobraFlux.
- **LOCAL AFETADO:** Governança de escopo.
- **CRITÉRIOS DE ACEITAÇÃO:** Solicitações de projetos separados só entram mediante aprovação explícita.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** Handoff, instrução usuário 20/11.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Regra documental de continuidade, não feature.

### REQ-011 — Evitar relatórios falsos
- **TÍTULO:** Evitar relatórios falsos.
- **ORIGEM:** Solicitações do usuário de 20–21/11/2026; Issue #3; PR #2.
- **DESCRIÇÃO:** Distinguir decisão aprovada, código, CI e publicação/homologação.
- **LOCAL AFETADO:** Gestão de projeto.
- **CRITÉRIOS DE ACEITAÇÃO:** Status com 3 dimensões, evidência adequada e bloqueios declarados.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** Todas as fases.
- **EVIDÊNCIAS:** Git: branches, PR #2 e Issue #3; `src/App.tsx`; logs CI.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Núcleo F6 testado não implica cobrança comercial validada.

## Grupo DEMO — Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2

### REQ-012 — Preservar website demonstrativo
- **TÍTULO:** Preservar website demonstrativo.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Manter landing e navegação antiga sem interferir no modo operacional.
- **LOCAL AFETADO:** `src/pages/institutional/*`, `src/App.tsx`.
- **CRITÉRIOS DE ACEITAÇÃO:** Build demo continua navegável com dados fictícios.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F0; build Vite demo.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Build/testes CI não equivalem à auditoria completa do mockup.

### REQ-013 — Preservar profissional demo
- **TÍTULO:** Preservar profissional demo.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Manter telas simuladas e IndexedDB isolados da produção.
- **LOCAL AFETADO:** `src/pages/professional/*`, `src/services/demoService.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Pagamentos simulados nunca alcançam DB financeiro real.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** ADR-004.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Documento legado chama o produto Golden Billing SaaS.

### REQ-014 — Site institucional funcional em produção
- **TÍTULO:** Site institucional funcional em produção.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Converter landing, FAQ, planos, onboarding, termos e suporte do demo para serviços de produção conforme escopo aprovado.
- **LOCAL AFETADO:** `src/pages/institutional/*` e `ProductionApp`.
- **CRITÉRIOS DE ACEITAÇÃO:** Fluxos reais e consentimentos verificados, sem usar dados fictícios.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** F1/F2/F6/F7; deploy.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Paridade completa não comprovada na Issue #3.

### REQ-015 — Paridade painel profissional
- **TÍTULO:** Paridade painel profissional.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Migrar telas e cards completos do demo sem sobreposições ou itens ocultos, em desktop/mobile.
- **LOCAL AFETADO:** `src/pages/professional/*` -> `src/pages/production/*`.
- **CRITÉRIOS DE ACEITAÇÃO:** Comparação elemento a elemento documentada e automatizada onde viável.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** F2–F7; baseline F0.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Shell e módulos existem; revisão pixel/função integral não concluída.

### REQ-016 — Página pública de cobrança segura
- **TÍTULO:** Página pública de cobrança segura.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Disponibilizar detalhes mínimos por token imprevisível, QR apenas sandbox durante teste.
- **LOCAL AFETADO:** `/api/public/charges/:publicToken`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem PII sensível, confirmação falsa nem pagamento live.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F2/F3.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Página pública do demo tem QR ilustrativo; não reutilizar como comprovante real.

### REQ-017 — Painel global demonstrativo
- **TÍTULO:** Painel global demonstrativo.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Conservar AdminView do modo demo sem misturar painel real.
- **LOCAL AFETADO:** `src/pages/admin/AdminView.tsx`.
- **CRITÉRIOS DE ACEITAÇÃO:** Admin demo segue sandbox/IndexedDB; operações globais reais só pelo backend.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Menu/admin real só superadmin MFA.

### REQ-018 — Interface responsiva real
- **TÍTULO:** Interface responsiva real.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Sidebar desktop, drawer e bottom bar mobile, com acessibilidade básica.
- **LOCAL AFETADO:** `ProductionShell.tsx`.
- **CRITÉRIOS DE ACEITAÇÃO:** Fluxos móveis e desktop exercitados no Playwright; sem clipping significativo.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F2/F7; Android físico.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Testes de browser emulado não equivalem a Android físico.

### REQ-019 — Estética e marca
- **TÍTULO:** Estética e marca.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Reutilizar logo, paleta escura/dourado, componentes de UI e identidade CobraFlux.
- **LOCAL AFETADO:** `Primitives.tsx`, `index.css`.
- **CRITÉRIOS DE ACEITAÇÃO:** Modo operacional coerente com marca, sem perder legibilidade.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** Paridade visual.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Não existe aprovação final pixel a pixel.

### REQ-020 — Notificações reais completas
- **TÍTULO:** Notificações reais completas.
- **ORIGEM:** Documento legado `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; solicitação de converter o mockup; Issue #3 F0/F2.
- **DESCRIÇÃO:** Migrar notificações e estados do mockup para backend e permissões reais.
- **LOCAL AFETADO:** Demo Notifications e painel operacional.
- **CRITÉRIOS DE ACEITAÇÃO:** Eventos por tenant sem dados fictícios, cancelamento por pagamento verificado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** F3/F5/F7.
- **EVIDÊNCIAS:** Demo `src/pages/{institutional,professional,admin,public}`; `src/App.tsx`; docs F2.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Parte WhatsApp implementada; inbox/central de notificações integral não comprovada.

## Grupo SEC — Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`

### REQ-021 — Cadastro usuário e organização
- **TÍTULO:** Cadastro usuário e organização.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Registrar titular e organização em transação, e-mail normalizado.
- **LOCAL AFETADO:** `/api/auth/register`.
- **CRITÉRIOS DE ACEITAÇÃO:** Criação atômica com papel owner, sem conta parcialmente salva.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** PostgreSQL; validação email.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Cadastro real requer envio transacional operacional em produção.

### REQ-022 — Hash de senha
- **TÍTULO:** Hash de senha.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Armazenar senha protegida, nunca plaintext.
- **LOCAL AFETADO:** `server/security.ts`, `users`.
- **CRITÉRIOS DE ACEITAÇÃO:** Login verifica hash bcrypt, sem retornar hash ao frontend.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Não publicar credenciais de teste como reais.

### REQ-023 — Login e cookies seguros
- **TÍTULO:** Login e cookies seguros.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Sessão HttpOnly, SameSite, Secure com HTTPS, tenant ativo.
- **LOCAL AFETADO:** `/api/auth/login`, `sessions`.
- **CRITÉRIOS DE ACEITAÇÃO:** Cookies e expiração/revogação testados; HTTPS real validado antes do go-live.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1, staging.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Secure em produção por configuração, não comprovado em site público.

### REQ-024 — CSRF e rate limit
- **TÍTULO:** CSRF e rate limit.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Exigir token CSRF em mutações autenticadas e limitar abuso.
- **LOCAL AFETADO:** `server/index.ts`, middleware.
- **CRITÉRIOS DE ACEITAÇÃO:** Requisições sem CSRF são rejeitadas e limites persistidos.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1; Postgres.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** A revisão de ataques distribuídos e headers completos ainda falta.

### REQ-025 — Isolamento entre organizações
- **TÍTULO:** Isolamento entre organizações.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Ninguém pode ler/alterar registro de tenant não autorizado.
- **LOCAL AFETADO:** Todas as APIs.
- **CRITÉRIOS DE ACEITAÇÃO:** Cross-tenant retorna 403/404 sem vazamento, testes de integração.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Sessões/memberships.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Testar também cenários concorrentes em staging.

### REQ-026 — Verificação de e-mail
- **TÍTULO:** Verificação de e-mail.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Token único com expiração de 24h, bloquear login não verificado.
- **LOCAL AFETADO:** `/api/auth/verify-email`.
- **CRITÉRIOS DE ACEITAÇÃO:** Fluxo código testado e entrega Resend validada em staging.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Resend real.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** **Homologação de entrega real pendente**.

### REQ-027 — Recuperação de senha
- **TÍTULO:** Recuperação de senha.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Token de redefinição de uso único, expirável e revogação de sessões.
- **LOCAL AFETADO:** `/api/auth/request-reset`, `/reset-password`.
- **CRITÉRIOS DE ACEITAÇÃO:** Senha troca com invalidação dos tokens de sessão.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Resend e staging.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Entrega real de e-mail pendente.

### REQ-028 — MFA TOTP superadmin
- **TÍTULO:** MFA TOTP superadmin.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Exigir TOTP válido e prevenir replay em login administrativo.
- **LOCAL AFETADO:** `server/totp.ts`, `/api/auth/login`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem MFA/secret enrollment login admin recusa; cada TOTP só uma vez.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Provisionamento seguro; chave no servidor.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** **Provisionamento de superadmin real ainda não confirmado**.

### REQ-029 — Provisionamento admin seguro
- **TÍTULO:** Provisionamento admin seguro.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Executar CLI de enrollment somente em terminal confiável e conta pré-verificada.
- **LOCAL AFETADO:** `server/enroll-admin.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Verificação no ambiente real, segredo não registrado em logs persistentes.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Staging/segredos.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Não executar por simples leitura deste handoff.

### REQ-030 — Gerenciar sessões
- **TÍTULO:** Gerenciar sessões.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Listar, revogar individualmente ou todas e desconectar dispositivos.
- **LOCAL AFETADO:** `/api/auth/sessions*`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sessão revogada não autentica, inclusive após senha alterada.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Fluxo de UI/sessão implementado.

### REQ-031 — RBAC por papel
- **TÍTULO:** RBAC por papel.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Owner/operator/super_admin no backend e proteção de menus.
- **LOCAL AFETADO:** `server/index.ts`, team, Fase 7.
- **CRITÉRIOS DE ACEITAÇÃO:** Operador não aumenta privilégio, superadmin exige sessão MFA.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1/F2/F7.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Menus não substituem checagem backend.

### REQ-032 — Segredos de integração criptografados
- **TÍTULO:** Segredos de integração criptografados.
- **ORIGEM:** Issue #3 Fase 1; `docs/FASE_1_SEGURANCA_OPERACAO.md`.
- **DESCRIÇÃO:** Proteger chaves Asaas/Meta com chaves mestras server-side e AAD tenant.
- **LOCAL AFETADO:** `asaas-sandbox.ts`, `whatsapp-cloud.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Banco guarda ciphertext e API não devolve segredo; ambiente seguro configurado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F3/F5; envs.
- **EVIDÊNCIAS:** `server/index.ts`, `security.ts`, `totp.ts`, `email.ts`, migrações 001–003; CI backend #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Rotação real de chaves não validada.

## Grupo OPS — Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`

### REQ-033 — Clientes CRUD
- **TÍTULO:** Clientes CRUD.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Criar, listar, editar, buscar, arquivar e restaurar cliente.
- **LOCAL AFETADO:** `ClientsOperationsView.tsx`, `/api/clients*`.
- **CRITÉRIOS DE ACEITAÇÃO:** Persistência tenant, validação, audit e histórico vinculados.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1; banco.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Arquivamento lógico, sem apagar histórico.

### REQ-034 — Campos de cliente
- **TÍTULO:** Campos de cliente.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Código interno, telefone DDI, e-mail, serviço, mensalidade centavos, vencimento, notas.
- **LOCAL AFETADO:** `clients`, migração 004.
- **CRITÉRIOS DE ACEITAÇÃO:** Campos persistidos, constraints e normalização telefone.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** REQ de clientes.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Telefone exige formato +DDI.

### REQ-035 — Importação CSV com prévia
- **TÍTULO:** Importação CSV com prévia.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Prévia por linha, detectar inválidos e duplicatas, transação de importação.
- **LOCAL AFETADO:** `server/csv.ts`, `/api/clients/import*`.
- **CRITÉRIOS DE ACEITAÇÃO:** Erros detectáveis, nenhuma importação parcial invisível.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F2; quotas F6.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Revisar o modo strict e concorrência antes de carga muito grande.

### REQ-036 — Serviços CRUD
- **TÍTULO:** Serviços CRUD.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Criar, editar, definir preço/frequência, arquivar sem perda.
- **LOCAL AFETADO:** `/api/services*`, `ServicesOperationsView`.
- **CRITÉRIOS DE ACEITAÇÃO:** Saldos/históricos preservados e novos registros respeitam limites.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F2/F6.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Preços em centavos.

### REQ-037 — Cobranças em rascunho
- **TÍTULO:** Cobranças em rascunho.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Criar/editar/duplicar/cancelar cobrança, link e histórico.
- **LOCAL AFETADO:** `/api/charges*`, `ChargesOperationsView`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem modificar estado para pago pelo cliente; link minimizado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F3 para Pix.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Cancelamento de draft preserva trilha.

### REQ-038 — Perfil e dados comerciais
- **TÍTULO:** Perfil e dados comerciais.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Editar perfil, trocar senha, contatos organizacionais owner-only.
- **LOCAL AFETADO:** `AccountOperationsView.tsx`, `/api/profile*`.
- **CRITÉRIOS DE ACEITAÇÃO:** Dados pessoais/empresa persistem com RBAC.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1/F2.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Foto e paridade fina do demo pendentes.

### REQ-039 — Suporte do profissional
- **TÍTULO:** Suporte do profissional.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Abrir e acompanhar tickets por tenant.
- **LOCAL AFETADO:** `/api/support/tickets`.
- **CRITÉRIOS DE ACEITAÇÃO:** Tickets privados; status persistente.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7 triagem.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Resposta real e SLA admin não implementados.

### REQ-040 — Convite individual de equipe
- **TÍTULO:** Convite individual de equipe.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Owner envia convite de operador para e-mail, expiração 48h e token único.
- **LOCAL AFETADO:** `server/team.ts`, `TeamOperationsView`.
- **CRITÉRIOS DE ACEITAÇÃO:** Convite reutilizado/revogado expira, e-mail de convite não expõe token.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Envio e-mail externo.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Entrega real Resend pendente.

### REQ-041 — Aceite de convite
- **TÍTULO:** Aceite de convite.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Novo usuário ativa com nome/senha; existente somente com e-mail autenticado igual.
- **LOCAL AFETADO:** `/api/team/accept`, `/activate`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem replay, sem acesso indevido ao tenant.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Convites; RBAC.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Conferir fluxo remoto após configurar e-mail.

### REQ-042 — Alternância de organização
- **TÍTULO:** Alternância de organização.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Usuário com múltiplas memberships alterna tenant protegido por CSRF.
- **LOCAL AFETADO:** `/api/auth/organizations`, `/switch-organization`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sessão passa a tenant permitido, sem mistura de dados.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1/F2.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** UI de seleção/login testada.

### REQ-043 — Revogação de operador
- **TÍTULO:** Revogação de operador.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Owner remove operador, revogando sessões vinculadas sem afetar outras orgs.
- **LOCAL AFETADO:** `/api/team/members/:userId`.
- **CRITÉRIOS DE ACEITAÇÃO:** Login anterior do operador não funciona no tenant removido.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** RBAC; sessões.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Owner não pode remover a si mesmo.

### REQ-044 — Paridade integral de formulários
- **TÍTULO:** Paridade integral de formulários.
- **ORIGEM:** Issue #3 Fase 2; `docs/FASE_2_CADASTROS_OPERACAO.md` e `FASE_2_EQUIPE_PERMISSOES_UI.md`.
- **DESCRIÇÃO:** Revisar foco, scroll, cards, filtros, menus e design com mockup.
- **LOCAL AFETADO:** Toda UI Production.
- **CRITÉRIOS DE ACEITAÇÃO:** Auditoria visual comparativa por telas e Android real.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** F2/F7/F9.
- **EVIDÊNCIAS:** `server/operations.ts`, `team.ts`, `csv.ts`, migrações 004–005, telas Production; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Pendência explícita no roadmap.

## Grupo PIX — Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`

### REQ-045 — Adapter Asaas exclusivamente sandbox
- **TÍTULO:** Adapter Asaas exclusivamente sandbox.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Host fixo Asaas Sandbox, sem troca arbitrária para live.
- **LOCAL AFETADO:** `server/asaas-sandbox.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Nenhuma chamada live feita pelo código.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Credenciais de teste.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Não seleciona fornecedor comercial definitivo.

### REQ-046 — Credenciais Pix por tenant
- **TÍTULO:** Credenciais Pix por tenant.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** API key criptografada e token webhook só hash, isolados por organização.
- **LOCAL AFETADO:** `sandbox_payment_accounts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Credencial não vaza por rota/cross-tenant.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Criptografia server-side.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Validação da chave real depende de PSP.

### REQ-047 — Emissão de Pix Sandbox
- **TÍTULO:** Emissão de Pix Sandbox.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Reservar emissão única, cliente PSP e externalReference estável.
- **LOCAL AFETADO:** `sandbox-payments.ts`, `sandbox_issuances`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem segundo POST após timeout e sem emissão em tenant errado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Conta Asaas Sandbox externa.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Testes são mocks de API PSP.

### REQ-048 — QR e copia-cola sandbox
- **TÍTULO:** QR e copia-cola sandbox.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Exibir payload/QR apenas de cobrança de teste identificada.
- **LOCAL AFETADO:** Página pública sandbox QR.
- **CRITÉRIOS DE ACEITAÇÃO:** Um cliente não vê segredo de outro.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Emissão teste.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** QR de teste não é dinheiro real.

### REQ-049 — Webhook Asaas autenticado
- **TÍTULO:** Webhook Asaas autenticado.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Validar authToken, idempotência evento e valor em centavos.
- **LOCAL AFETADO:** `/api/webhooks/asaas-sandbox/:accountId`.
- **CRITÉRIOS DE ACEITAÇÃO:** Forjado ou repetido não altera caixa; fora de ordem não rebaixa status.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** HTTPS público para homologação.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Não validado com webhook Asaas remoto.

### REQ-050 — Estados de pagamento conservadores
- **TÍTULO:** Estados de pagamento conservadores.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Recebimento só após evento permitido e valor correto, não por PAYMENT_CONFIRMED isolado.
- **LOCAL AFETADO:** `asaas-events.ts`, charges.
- **CRITÉRIOS DE ACEITAÇÃO:** Dinheiro simulado segregado; não duplica paid.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Webhook PSP.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Precisa conciliação com API real de sandbox.

### REQ-051 — Estorno Pix parcial e total
- **TÍTULO:** Estorno Pix parcial e total.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Reservar devoluções únicas e permitir várias parciais até valor.
- **LOCAL AFETADO:** `sandbox-refunds.ts`, migração 007.
- **CRITÉRIOS DE ACEITAÇÃO:** Valor original imutável; sem refund > limite.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Conta PSP Sandbox.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Solicitar somente em teste.

### REQ-052 — Confirmar estorno DONE
- **TÍTULO:** Confirmar estorno DONE.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Somente resposta externa DONE confirma devolução, não mero webhook.
- **LOCAL AFETADO:** `sandbox-reconciliation.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** `refunded_cents` corresponde a refunds DONE, não pedido aberto.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Homologação PSP.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Reembolso real não testado.

### REQ-053 — Reconciliação após timeout
- **TÍTULO:** Reconciliação após timeout.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Consulta recupera estado sem repetir solicitação externa.
- **LOCAL AFETADO:** `sandbox-reconciliation-worker.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Operação ambígua exige consulta e tratamento auditável.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Worker CLI e staging.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Cron real não ativo.

### REQ-054 — Comprovantes sandbox oficiais
- **TÍTULO:** Comprovantes sandbox oficiais.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Preservar links HTTPS do provedor verificados e associados ao tenant.
- **LOCAL AFETADO:** Migrações 008–009.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem forjar comprovantes de pagamento real.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** PSP Sandbox.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Teste remoto faltante.

### REQ-055 — Cancelamento seguro de Pix sandbox
- **TÍTULO:** Cancelamento seguro de Pix sandbox.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Registrar intenção única, DELETE condicional e confirmar via GET.
- **LOCAL AFETADO:** `sandbox-cancellation.ts`, migração 010.
- **CRITÉRIOS DE ACEITAÇÃO:** Concorrência pagamento/cancelamento não gera transição indevida.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** PSP Sandbox.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Cobertura mockada.

### REQ-056 — Homologar conta Asaas Sandbox
- **TÍTULO:** Homologar conta Asaas Sandbox.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Usar conta e credenciais reais de testes, callback HTTPS e transações controladas.
- **LOCAL AFETADO:** Staging+Asaas Sandbox.
- **CRITÉRIOS DE ACEITAÇÃO:** Evidência de QR, webhook, estorno, cancelamento e logs reais.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Hospedagem HTTPS, conta PSP.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Nenhuma conta configurada comprovada.

### REQ-057 — Integração de dinheiro real autorizada
- **TÍTULO:** Integração de dinheiro real autorizada.
- **ORIGEM:** Issue #3 Fase 3; `docs/FASE_3_PIX_ASAAS_SANDBOX.md`.
- **DESCRIÇÃO:** Provider live com governança, conciliação e revisão antifraude, somente após gate.
- **LOCAL AFETADO:** Futuro adapter Pix real.
- **CRITÉRIOS DE ACEITAÇÃO:** Sucesso em ambiente live controlado e autorização explícita de go-live.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** F3, F8, contratos.
- **EVIDÊNCIAS:** `server/sandbox-*.ts`, `asaas-*.ts`, migrações 006–010, integração mockada; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Não ativar automaticamente por alteração de env.

## Grupo REC — Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`

### REQ-058 — Plano recorrente semanal
- **TÍTULO:** Plano recorrente semanal.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** Regra semanal tenant/cliente com snapshot financeiro.
- **LOCAL AFETADO:** `recurrences.ts`, migração 011.
- **CRITÉRIOS DE ACEITAÇÃO:** Ocorrências em datas civis avançam 7 dias.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F2; status cliente.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Somente draft.

### REQ-059 — Plano recorrente mensal
- **TÍTULO:** Plano recorrente mensal.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** Preservar dia âncora 29/30/31 e usar último dia quando inexistente.
- **LOCAL AFETADO:** `recurrence-calendar.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** 31/jan, 28/29/fev, 31/mar sem drift.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Timezone America/Sao_Paulo.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Testes de calendário existem.

### REQ-060 — Snapshot por ciclo
- **TÍTULO:** Snapshot por ciclo.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** Novos ciclos usam valores da regra no momento de geração; antigos inalterados.
- **LOCAL AFETADO:** `recurrence_cycles`, charges.
- **CRITÉRIOS DE ACEITAÇÃO:** Editar regra afeta apenas futuro.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Histórico; transações.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Sem retroatividade silenciosa.

### REQ-061 — Idempotência/leases
- **TÍTULO:** Idempotência/leases.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** Impedir ciclos duplicados em worker concorrente.
- **LOCAL AFETADO:** `recurrence-worker.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Constraint cycle_key e lease guardam geração atômica.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** DB transactions.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Sem cron externo.

### REQ-062 — Pausar e cancelar regra
- **TÍTULO:** Pausar e cancelar regra.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** Pausa futura, cancelamento definitivo com histórico preservado.
- **LOCAL AFETADO:** `/api/recurrences/:id/pause|cancel`.
- **CRITÉRIOS DE ACEITAÇÃO:** Não deleta cobranças existentes.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F4.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Sem Pix automático.

### REQ-063 — Retomar seguro
- **TÍTULO:** Retomar seguro.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** skip_missed por padrão; catch_up explícito limitado a 12 ciclos.
- **LOCAL AFETADO:** `/api/recurrences/:id/resume`.
- **CRITÉRIOS DE ACEITAÇÃO:** Não cria atrasados sem comando do titular.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F4.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Respeitar limites de plano.

### REQ-064 — Prévia e UI recorrência
- **TÍTULO:** Prévia e UI recorrência.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** Mostrar seis ciclos, criar, editar futuros e histórico.
- **LOCAL AFETADO:** `RecurrencesOperationsView.tsx`.
- **CRITÉRIOS DE ACEITAÇÃO:** UI desktop/mobile e API integradas.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F4.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Paridade fina com demo pendente.

### REQ-065 — Scheduler real
- **TÍTULO:** Scheduler real.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** Agendar worker com monitoramento, alertas e idempotência.
- **LOCAL AFETADO:** Infra/`recurrence-cli.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Execução recorrente comprovada sem duplicações.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Staging/Pg/observabilidade.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** CLI one-shot existe, cron não instalado.

### REQ-066 — Lembretes vinculados a recorrências
- **TÍTULO:** Lembretes vinculados a recorrências.
- **ORIGEM:** Issue #3 Fase 4; `docs/FASE_4_RECORRENCIAS.md`.
- **DESCRIÇÃO:** Após geração de rascunhos, selecionar cobranças aptas à fila Meta, respeitando consentimentos.
- **LOCAL AFETADO:** `whatsapp-enqueue.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Nenhum envio sem opt-in real e template válido.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **EM DESENVOLVIMENTO**.
- **DEPENDÊNCIAS:** F5, cron, Meta real.
- **EVIDÊNCIAS:** `server/recurrences.ts`, `recurrence-worker.ts`, `recurrence-calendar.ts`, migração 011; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** EVIDÊNCIA PARCIAL; verificar antes de elevar status.
- **OBSERVAÇÕES:** Fila em código, delivery real não homologado.

## Grupo META — Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`

### REQ-067 — Meta Cloud API oficial
- **TÍTULO:** Meta Cloud API oficial.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Adapter Graph v27.0, sem automação WhatsApp Web.
- **LOCAL AFETADO:** `whatsapp-cloud.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Host e endpoints oficiais fixos no código.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Conta WABA Meta.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Mudança de versão requer verificação atual.

### REQ-068 — Conexão Meta criptografada
- **TÍTULO:** Conexão Meta criptografada.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** WABA/phone ID e token criptografado por organização.
- **LOCAL AFETADO:** `whatsapp-routes.ts`, migração 012.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem expor token ao browser.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Segredos envs.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Sem credenciais real de Meta.

### REQ-069 — Templates UTILITY aprovados
- **TÍTULO:** Templates UTILITY aprovados.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Sincronizar catálogo aprovado; não criar/autorizar template fictício.
- **LOCAL AFETADO:** `whatsapp_templates`.
- **CRITÉRIOS DE ACEITAÇÃO:** Somente UTILITY com três variáveis em envio preparado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Aprovação Meta real.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** A sincronização não prova aprovação externa sem conta.

### REQ-070 — Consentimento versionado
- **TÍTULO:** Consentimento versionado.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Armazenar opt-in com tipo de prova/referência/telefone/versão.
- **LOCAL AFETADO:** `whatsapp_consents`.
- **CRITÉRIOS DE ACEITAÇÃO:** Checkbox legado isolado não autoriza envio.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Política LGPD.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Prova externa não autenticada pelo sistema.

### REQ-071 — Revogação STOP/PARAR
- **TÍTULO:** Revogação STOP/PARAR.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Cancelar fila pendente e invalidar consentimento após STOP/SAIR/PARAR.
- **LOCAL AFETADO:** `whatsapp-webhook.ts`, consent events.
- **CRITÉRIOS DE ACEITAÇÃO:** Pedido de opt-out acatado sem papel administrativo.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Webhook Meta.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Envio real pendente.

### REQ-072 — Fila PostgreSQL idempotente
- **TÍTULO:** Fila PostgreSQL idempotente.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Enfileirar lembretes com consentimento e template, sem disparo imediato.
- **LOCAL AFETADO:** `whatsapp_outbox`.
- **CRITÉRIOS DE ACEITAÇÃO:** Duplicações por cobrança/motivo evitadas.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F5; quotas SaaS.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Status accept não equivale delivered.

### REQ-073 — Webhooks Meta HMAC
- **TÍTULO:** Webhooks Meta HMAC.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Verificar assinatura sobre raw body e deduplicar callbacks fora de ordem.
- **LOCAL AFETADO:** `/api/webhooks/meta-whatsapp`.
- **CRITÉRIOS DE ACEITAÇÃO:** Assinatura inválida não altera estado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** HTTPS e app secret.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Webhook externo não homologado.

### REQ-074 — Estados de envio e resultado desconhecido
- **TÍTULO:** Estados de envio e resultado desconhecido.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Enviado/entregue/lido/falha, timeout unknown sem POST repetido.
- **LOCAL AFETADO:** `whatsapp-worker.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Não marca delivered só com aceite HTTP 200.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Meta remota.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Sem envios live.

### REQ-075 — Janela e throttle
- **TÍTULO:** Janela e throttle.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Respeitar horário São Paulo e limites por tenant/cliente.
- **LOCAL AFETADO:** `whatsapp-worker.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Seg–sáb 09h–18h59; quotas e rate limit no código.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F5/F6.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Revalidar fuso e políticas atuais Meta.

### REQ-076 — Lembretes automáticos por vencimento
- **TÍTULO:** Lembretes automáticos por vencimento.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Owner seleciona template, fila de due reminders sem send.
- **LOCAL AFETADO:** `whatsapp-enqueue.ts`, migração 014.
- **CRITÉRIOS DE ACEITAÇÃO:** Enfileirar uma vez, revisar consentimento atual.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Cron e template aprovado.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Flag OFF por padrão.

### REQ-077 — Configurar envio teste restrito
- **TÍTULO:** Configurar envio teste restrito.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Allowlist de destinatários em escopo test e aprovação para production.
- **LOCAL AFETADO:** Flags WHATSAPP_SEND_*.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem autorização real, nenhuma mensagem sai.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Credenciais Meta.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Config de produção não habilitada.

### REQ-078 — Homologar Meta externa
- **TÍTULO:** Homologar Meta externa.
- **ORIGEM:** Issue #3 Fase 5; `docs/FASE_5_WHATSAPP_META.md`.
- **DESCRIÇÃO:** Conta Meta, app, número, templates, webhook, delivery, custos e opt-out real.
- **LOCAL AFETADO:** Staging+Meta.
- **CRITÉRIOS DE ACEITAÇÃO:** Testar números autorizados e consentimento legítimo.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** HTTPS/WABA/segredos/validação legal.
- **EVIDÊNCIAS:** `server/whatsapp-*.ts`, migrações 012–014; CI #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Não publicar até revisão.

## Grupo SAAS — Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`

### REQ-079 — Plano Free automático
- **TÍTULO:** Plano Free automático.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Provisionar assinatura gratuita por organização existente/nova.
- **LOCAL AFETADO:** `saas_subscriptions`, trigger 015.
- **CRITÉRIOS DE ACEITAÇÃO:** Novo tenant inicia Free sem concessionária de pagamento.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Banco; migração 015.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Não pressupor preço dos planos pagos.

### REQ-080 — Catálogo Starter/Business
- **TÍTULO:** Catálogo Starter/Business.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Planos pagos existem sem preço inicial e não publicados.
- **LOCAL AFETADO:** `saas_plans`, `SaasBillingView`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem preços inventados nem compra aparente.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Configuração comercial.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Preços permanecem INDEFINIDOS.

### REQ-081 — Limites por plano
- **TÍTULO:** Limites por plano.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Checar clientes, serviços, cobranças/mês, recorrências, equipe, mensagens.
- **LOCAL AFETADO:** `saas-domain.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Bloqueios server-side sob lock organizacional; dados preservados.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F2–F5.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Quotas iniciais Free são provisórias.

### REQ-082 — Restrições em reativação/importação
- **TÍTULO:** Restrições em reativação/importação.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Quota também cobre reativação e CSV, não só criação simples.
- **LOCAL AFETADO:** `operations.ts`, `team.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem bypass de limite por reativação ou lote.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F6.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Parte fluxo worker/tenant precisa stress test.

### REQ-083 — Cotação e cupons
- **TÍTULO:** Cotação e cupons.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Calcular descontos centavos sem tornar plano pago gratuito.
- **LOCAL AFETADO:** `saas-routes.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Quote não concede benefício; cupom validado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Planos e tarifas.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Utilização definitiva de cupom após pagamento ainda falta.

### REQ-084 — Pedido idempotente de upgrade
- **TÍTULO:** Pedido idempotente de upgrade.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Criar pedido e invoice draft sem duplicatas nem mudanças de escopo.
- **LOCAL AFETADO:** `saas_change_requests`, API.
- **CRITÉRIOS DE ACEITAÇÃO:** Mesmo request ID retorna recurso original; preço conforme catálogo; não ativar paid.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** PSP SaaS futuro.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Um pending por organização.

### REQ-085 — Livro financeiro próprio
- **TÍTULO:** Livro financeiro próprio.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** `saas_invoices` distinto de `charges` dos profissionais.
- **LOCAL AFETADO:** Migração 015.
- **CRITÉRIOS DE ACEITAÇÃO:** GPV e MRR não se misturam.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7 relatórios.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Sem PSP SaaS real.

### REQ-086 — Ciclo inadimplência
- **TÍTULO:** Ciclo inadimplência.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** past_due, grace period 7 dias, restricted e cancelamento de ciclo.
- **LOCAL AFETADO:** `saas-worker.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem cobrança automática/falso paid; preservar dados.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** Webhook PSP SaaS futuro.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Scheduler externo não ativo.

### REQ-087 — Cancelamento ao final do período
- **TÍTULO:** Cancelamento ao final do período.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Owner agenda/reverte cancelamento sem reembolso automático.
- **LOCAL AFETADO:** `/api/saas/cancellation`.
- **CRITÉRIOS DE ACEITAÇÃO:** Permissão e período confirmados, sem apagar dados.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F6.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Contrato/preços pendentes.

### REQ-088 — Integração checkout SaaS real
- **TÍTULO:** Integração checkout SaaS real.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Contratar PSP próprio para cobrar assinaturas da plataforma.
- **LOCAL AFETADO:** Futuro backend payment SaaS.
- **CRITÉRIOS DE ACEITAÇÃO:** Checkout seguro, recibo financeiro e conta da plataforma separados do tenant merchant.
- **STATUS DA DECISÃO:** **INDEFINIDA**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** Hospedagem; PSP escolhido; fiscal.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Provedor de pagamento SaaS não escolhido/contratado.

### REQ-089 — Webhook verificado para ativar Premium
- **TÍTULO:** Webhook verificado para ativar Premium.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Somente recebimento real verificado libera plano/renovação.
- **LOCAL AFETADO:** Futuro webhook plataforma.
- **CRITÉRIOS DE ACEITAÇÃO:** Assinaturas não sobem via browser, invoice draft ou recibo não verificado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** Checkout; antifraude; PSP.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Sem código live de ativação ainda.

### REQ-090 — Definir preços, impostos e cupons comerciais
- **TÍTULO:** Definir preços, impostos e cupons comerciais.
- **ORIGEM:** Issue #3 Fase 6; `docs/FASE_6_SAAS_MONETIZACAO.md`.
- **DESCRIÇÃO:** Tarifas, limites e termos aprovados; resgate/reembolso financeiro após confirmação.
- **LOCAL AFETADO:** Admin SaaS; faturamento.
- **CRITÉRIOS DE ACEITAÇÃO:** Regras de cobrança/reembolso/fiscal homologadas.
- **STATUS DA DECISÃO:** **INDEFINIDA**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Decisão comercial/PSP/fiscal.
- **EVIDÊNCIAS:** `server/saas-*.ts`, migração 015, `SaasBillingView.tsx`; CI #44870002881 e #44910490191.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Nenhuma tarifa comercial aprovada, não inventar.

## Grupo ADM — Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`

### REQ-091 — Visão global superadmin MFA
- **TÍTULO:** Visão global superadmin MFA.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Painel Administração somente super_admin MFA, não por rota client-side.
- **LOCAL AFETADO:** `AdminOperationsView.tsx`, `/api/admin/*`.
- **CRITÉRIOS DE ACEITAÇÃO:** Owner/operator 403, MFA admin verificado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F1; TOTP.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Primeiro incremento F7, não F7 encerrada.

### REQ-092 — Listar organizações e estados
- **TÍTULO:** Listar organizações e estados.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Listagem paginada, busca status, plano, clientes ativos.
- **LOCAL AFETADO:** `/api/admin/organizations`.
- **CRITÉRIOS DE ACEITAÇÃO:** Dados de conta sem segredos ou acesso arbitrário a PII de clientes.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Busca e escopo devem passar revisão UX.

### REQ-093 — Suspender/bloquear organização
- **TÍTULO:** Suspender/bloquear organização.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Superadmin altera status com motivo e auditoria.
- **LOCAL AFETADO:** `/api/admin/organizations/:id/status`.
- **CRITÉRIOS DE ACEITAÇÃO:** Revogar sessões, desabilitar WhatsApp; impedir suspensão da própria org.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7; tenant auth.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Testar corridas em workers em staging.

### REQ-094 — Reativar organização
- **TÍTULO:** Reativar organização.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Superadmin restaura status sem restaurar sessões ou envios.
- **LOCAL AFETADO:** Mesma rota.
- **CRITÉRIOS DE ACEITAÇÃO:** Novo login obrigatório, WhatsApp não rearmado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Sem envio automático.

### REQ-095 — Indicadores administrativos de organizações
- **TÍTULO:** Indicadores administrativos de organizações.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Totais de organizações ativas/restritas, usuários, tickets e pedidos LGPD.
- **LOCAL AFETADO:** `/api/admin/reports/overview`.
- **CRITÉRIOS DE ACEITAÇÃO:** Dados vêm de PG com contagem objetiva.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Sem analytics externos.

### REQ-096 — MRR verificado separado de GPV
- **TÍTULO:** MRR verificado separado de GPV.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Somente invoice SaaS live e período vigente; GPV merchant distinto.
- **LOCAL AFETADO:** `phase7-routes.ts`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sandbox excluído de métricas reais.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F6/PSP live futuro.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Critérios de MRR precisam revisão quando houver ciclo anual/descontos.

### REQ-097 — Relatórios tenant
- **TÍTULO:** Relatórios tenant.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Clientes/serviços/recorrências/cobranças e histórico mensal de criação.
- **LOCAL AFETADO:** `/api/reports/summary`.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem misturar criação com liquidação e sem dados de outras orgs.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Somente count por mês, não receita mensal.

### REQ-098 — Exportar CSV de cliente/cobrança
- **TÍTULO:** Exportar CSV de cliente/cobrança.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Owner autorizado faz POST CSRF e baixa CSV seguro e auditado.
- **LOCAL AFETADO:** `/api/reports/exports/:dataset`.
- **CRITÉRIOS DE ACEITAÇÃO:** Limite 1000, campos permitidos e anti-fórmulas.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Portabilidade integral futura é diferente de CSV parcial.

### REQ-099 — Auditoria global/tenant
- **TÍTULO:** Auditoria global/tenant.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Trilha por papel com metadata PII omitida, append-only no DB.
- **LOCAL AFETADO:** `audit_logs`, APIs audit, trigger 016.
- **CRITÉRIOS DE ACEITAÇÃO:** Eventos e ator visíveis, update/delete rejeitados pelo DB.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7; política retenção.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Trigger não substitui governança de admins DB.

### REQ-100 — Triagem de suporte
- **TÍTULO:** Triagem de suporte.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Admin lista tickets, registra novo estado e motivo com evento.
- **LOCAL AFETADO:** `support_ticket_events`, Admin UI.
- **CRITÉRIOS DE ACEITAÇÃO:** Sem afirmar resposta por e-mail não enviada.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Suporte real com respostas/SLA pendente.

### REQ-101 — Respostas de suporte verificadas
- **TÍTULO:** Respostas de suporte verificadas.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Enviar resposta real e permitir acompanhamento com SLA/notificações.
- **LOCAL AFETADO:** Futuro suporte admin+tenant.
- **CRITÉRIOS DE ACEITAÇÃO:** Entrega e histórico comprobatórios; controle PII e permissões.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** E-mail real; política SLA.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Não existe rota completa de resposta.

### REQ-102 — Registrar solicitações LGPD
- **TÍTULO:** Registrar solicitações LGPD.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Owner abre acesso, correção, portabilidade e exclusão com justificativa.
- **LOCAL AFETADO:** `privacy_requests`, tenant UI.
- **CRITÉRIOS DE ACEITAÇÃO:** Pedido criado sem executar delete; tenant isolado.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Registro não equivale atendimento.

### REQ-103 — Triagem LGPD administrativa
- **TÍTULO:** Triagem LGPD administrativa.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Admin muda para em revisão/aguardando prova/indeferida fundamentada.
- **LOCAL AFETADO:** `/api/admin/privacy/requests`.
- **CRITÉRIOS DE ACEITAÇÃO:** Não permite marcar como concluída sem processo real de cumprimento.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — TESTADA**.
- **DEPENDÊNCIAS:** F7.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (código + suíte CI adequada, não homologação externa).
- **OBSERVAÇÕES:** Atendimento final legal ainda falta.

### REQ-104 — Atender direitos LGPD de ponta a ponta
- **TÍTULO:** Atender direitos LGPD de ponta a ponta.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Apurar base legal, retenção, exportação completa, retificação e evidências da resposta.
- **LOCAL AFETADO:** Privacidade/admin/DB.
- **CRITÉRIOS DE ACEITAÇÃO:** Fluxo auditado e validado por revisão jurídica.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** F7, DPO/retenção/infra.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Sem exclusão automática de financeiros.

### REQ-105 — Monitoramento de saúde/SLA
- **TÍTULO:** Monitoramento de saúde/SLA.
- **ORIGEM:** Issue #3 Fase 7; `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`.
- **DESCRIÇÃO:** Logs estruturados, alertas, incidentes e métricas, rota saúde.
- **LOCAL AFETADO:** Infra/admin.
- **CRITÉRIOS DE ACEITAÇÃO:** Alertas funcionam em staging e protegem PII.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Hospedagem e ferramentas.
- **EVIDÊNCIAS:** `server/phase7-*.ts`, migração 016, `ReportsOperationsView.tsx`, `AdminOperationsView.tsx`; CI #44910490191/#44910490168.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Health básico existe; observabilidade completa não.

## Grupo OPSREL — Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação

### REQ-106 — Staging HTTPS
- **TÍTULO:** Staging HTTPS.
- **ORIGEM:** Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação.
- **DESCRIÇÃO:** Configurar ambiente isolado com domínio HTTPS, PostgreSQL e segredos.
- **LOCAL AFETADO:** Infra.
- **CRITÉRIOS DE ACEITAÇÃO:** Cadastro, cookies e webhooks testados em origem real.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Hospedagem ainda inexistente.
- **EVIDÊNCIAS:** CI e scripts `scripts/backup-db.sh`, `restore-drill.sh`; não há confirmação de staging.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Adiado por decisão vigente, não cancelado.

### REQ-107 — E-mail transacional real
- **TÍTULO:** E-mail transacional real.
- **ORIGEM:** Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação.
- **DESCRIÇÃO:** Configurar Resend/remetente e validar registro, recuperação e convite.
- **LOCAL AFETADO:** Resend/infra.
- **CRITÉRIOS DE ACEITAÇÃO:** E-mails entregues a contas de teste e tokens expirados corretamente.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Staging e conta verificada.
- **EVIDÊNCIAS:** CI e scripts `scripts/backup-db.sh`, `restore-drill.sh`; não há confirmação de staging.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** CI não envia e-mail externo.

### REQ-108 — Backup off-site criptografado
- **TÍTULO:** Backup off-site criptografado.
- **ORIGEM:** Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação.
- **DESCRIÇÃO:** Rotina automática de backup com retenção, monitoramento e menor privilégio.
- **LOCAL AFETADO:** `scripts/backup-db.sh` + infra.
- **CRITÉRIOS DE ACEITAÇÃO:** Cópias válidas e armazenadas fora do host.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Staging/Pg/PITR.
- **EVIDÊNCIAS:** CI e scripts `scripts/backup-db.sh`, `restore-drill.sh`; não há confirmação de staging.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Script existe, automação remota não.

### REQ-109 — Restore de backup comprovado
- **TÍTULO:** Restore de backup comprovado.
- **ORIGEM:** Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação.
- **DESCRIÇÃO:** Restaurar dump em DB isolado `_restore_drill`, medir tempo e integridade.
- **LOCAL AFETADO:** `scripts/restore-drill.sh`.
- **CRITÉRIOS DE ACEITAÇÃO:** Restauração real documentada com RPO/RTO.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Backup válido, ambiente gerenciado.
- **EVIDÊNCIAS:** CI e scripts `scripts/backup-db.sh`, `restore-drill.sh`; não há confirmação de staging.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Script lido; nenhum exercício externo confirmado.

### REQ-110 — PITR e plano de recuperação
- **TÍTULO:** PITR e plano de recuperação.
- **ORIGEM:** Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação.
- **DESCRIÇÃO:** Definir recuperação point-in-time, rollback, contingência.
- **LOCAL AFETADO:** PostgreSQL/ops.
- **CRITÉRIOS DE ACEITAÇÃO:** Ensaio completo de falha/restart e reversão.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Pg gerenciado, storage.
- **EVIDÊNCIAS:** CI e scripts `scripts/backup-db.sh`, `restore-drill.sh`; não há confirmação de staging.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Sem prova atual.

### REQ-111 — Testes carga e segurança E2E
- **TÍTULO:** Testes carga e segurança E2E.
- **ORIGEM:** Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação.
- **DESCRIÇÃO:** Verificar carga, concorrência, OWASP, limites e isolamento.
- **LOCAL AFETADO:** Fase 8.
- **CRITÉRIOS DE ACEITAÇÃO:** Resultados reprodutíveis, correção de vulnerabilidades críticas.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** Staging/release.
- **EVIDÊNCIAS:** CI e scripts `scripts/backup-db.sh`, `restore-drill.sh`; não há confirmação de staging.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** CI unitária não cobre toda segurança.

### REQ-112 — Piloto e observabilidade
- **TÍTULO:** Piloto e observabilidade.
- **ORIGEM:** Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação.
- **DESCRIÇÃO:** Monitorar logs, alertas, telemetria, custos e piloto controlado.
- **LOCAL AFETADO:** Fase 8.
- **CRITÉRIOS DE ACEITAÇÃO:** SLO e taxa de falhas aprovados em ambiente real.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **BLOQUEADA**.
- **DEPENDÊNCIAS:** Hospedagem, contas externas.
- **EVIDÊNCIAS:** CI e scripts `scripts/backup-db.sh`, `restore-drill.sh`; não há confirmação de staging.
- **QUALIDADE DA EVIDÊNCIA:** DECLARAÇÃO HISTÓRICA + confirmação da ausência de configuração externa no projeto; sem inspeção da infraestrutura.
- **OBSERVAÇÕES:** Sem publicação comercial.

### REQ-113 — Plano de rollback e go-live
- **TÍTULO:** Plano de rollback e go-live.
- **ORIGEM:** Issue #3 Fases 1/8; docs fundação/segurança; decisão de adiar homologação.
- **DESCRIÇÃO:** Checklist assinada, autorização separada para cobrança/envio reais e revert.
- **LOCAL AFETADO:** Release.
- **CRITÉRIOS DE ACEITAÇÃO:** Nenhum dinheiro real antes da homologação e aprovação.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** Todas as fases; segurança/fiscal.
- **EVIDÊNCIAS:** CI e scripts `scripts/backup-db.sh`, `restore-drill.sh`; não há confirmação de staging.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Sem autorização atual.

## Grupo ANDROID — Issue #3 Fase 9; histórico do workflow CobraFlux demonstrativo; branch Android

### REQ-114 — Preservar WebView demo
- **TÍTULO:** Preservar WebView demo.
- **ORIGEM:** Issue #3 Fase 9; histórico do workflow CobraFlux demonstrativo; branch Android.
- **DESCRIÇÃO:** Manter branch de APK demonstrativo separada do produto web real.
- **LOCAL AFETADO:** `android-webview-demo-debug`.
- **CRITÉRIOS DE ACEITAÇÃO:** Demo não é distribuído como app real.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **IMPLEMENTADA — NÃO VALIDADA**.
- **DEPENDÊNCIAS:** Git branch Android.
- **EVIDÊNCIAS:** Árvore `android-webview-demo-debug`, workflow `android-cobraflux-demo.yml`; release real não inspecionado.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA POR EVIDÊNCIA TÉCNICA (existência de código); validação específica insuficiente.
- **OBSERVAÇÕES:** Existência do código verificada; APK específico não baixado nesta auditoria.

### REQ-115 — Integrar web real no Android
- **TÍTULO:** Integrar web real no Android.
- **ORIGEM:** Issue #3 Fase 9; histórico do workflow CobraFlux demonstrativo; branch Android.
- **DESCRIÇÃO:** Abrir versão operacional autenticada em embalagem Android adequada.
- **LOCAL AFETADO:** Fase 9 `mobile/android` futuro.
- **CRITÉRIOS DE ACEITAÇÃO:** Todos módulos funcionam com cookies, downloads e segurança.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** F1–F8 e HTTPS.
- **EVIDÊNCIAS:** Árvore `android-webview-demo-debug`, workflow `android-cobraflux-demo.yml`; release real não inspecionado.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Não importar Universal Build sem autorização.

### REQ-116 — Compatibilidade Android API 36+
- **TÍTULO:** Compatibilidade Android API 36+.
- **ORIGEM:** Issue #3 Fase 9; histórico do workflow CobraFlux demonstrativo; branch Android.
- **DESCRIÇÃO:** Target Android 15/16 exigido pelo roadmap, revisar versões/SDK.
- **LOCAL AFETADO:** Gradle/manifest Android.
- **CRITÉRIOS DE ACEITAÇÃO:** Build aponta target atual e atende políticas Play vigentes.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** F9, revisão Play atual.
- **EVIDÊNCIAS:** Árvore `android-webview-demo-debug`, workflow `android-cobraflux-demo.yml`; release real não inspecionado.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Meta API 36+ registrada no roadmap; revalidar no release.

### REQ-117 — AAB release assinado
- **TÍTULO:** AAB release assinado.
- **ORIGEM:** Issue #3 Fase 9; histórico do workflow CobraFlux demonstrativo; branch Android.
- **DESCRIÇÃO:** Gerar bundle assinado e cadeia de chaves seguras.
- **LOCAL AFETADO:** GitHub Actions Android.
- **CRITÉRIOS DE ACEITAÇÃO:** Bundle release testado em Play internal, segredos protegidos.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** F9; Play Console.
- **EVIDÊNCIAS:** Árvore `android-webview-demo-debug`, workflow `android-cobraflux-demo.yml`; release real não inspecionado.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** APK debug/demo não satisfaz.

### REQ-118 — Testar fabricantes e WebView
- **TÍTULO:** Testar fabricantes e WebView.
- **ORIGEM:** Issue #3 Fase 9; histórico do workflow CobraFlux demonstrativo; branch Android.
- **DESCRIÇÃO:** Validar MIUI, One UI e outros dispositivos Android físicos.
- **LOCAL AFETADO:** Fase 9.
- **CRITÉRIOS DE ACEITAÇÃO:** Navegação, permissões e desempenho em aparelhos reais.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** APK/AAB e hosting.
- **EVIDÊNCIAS:** Árvore `android-webview-demo-debug`, workflow `android-cobraflux-demo.yml`; release real não inspecionado.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Aparelho físico não verificado.

### REQ-119 — Verificação políticas Google Play
- **TÍTULO:** Verificação políticas Google Play.
- **ORIGEM:** Issue #3 Fase 9; histórico do workflow CobraFlux demonstrativo; branch Android.
- **DESCRIÇÃO:** Política de dados, transparência financeira, SDK target, permissões e publicação.
- **LOCAL AFETADO:** Play Console.
- **CRITÉRIOS DE ACEITAÇÃO:** Aprovação de submissão sem violação de políticas.
- **STATUS DA DECISÃO:** **APROVADA — roadmap/execução geral**.
- **STATUS DE IMPLEMENTAÇÃO:** **PLANEJADA**.
- **DEPENDÊNCIAS:** F9; legal.
- **EVIDÊNCIAS:** Árvore `android-webview-demo-debug`, workflow `android-cobraflux-demo.yml`; release real não inspecionado.
- **QUALIDADE DA EVIDÊNCIA:** CONFIRMADA EM ROADMAP/DOCUMENTAÇÃO COMO PENDÊNCIA; não há prova de execução.
- **OBSERVAÇÕES:** Conta Play do CobraFlux não verificada nesta auditoria.

---

## Auditoria da matriz

- Este inventário é um **índice de requisitos**, não cronograma de liberação de produção. Consulte `04-BACKLOG-CONSOLIDADO.md` para pendências sem duplicar todos os requisitos já implementados.
- Nenhum item `IMPLEMENTADA — TESTADA` recebeu estado `PUBLICADA — VALIDADA`: não existem comprovações de deploy/provedores externos em produção.
- Campos marcados `INDEFINIDA` referem-se a preço, PSP SaaS e decisões comerciais/jurídicas que **não foram aprovadas explicitamente** no material acessível.
- Assuntos identificados apenas em outros projetos do usuário não aparecem como demandas CobraFlux.
- Requisitos de paridade visual/documentação histórica precisam de revisão ponto a ponto quando o histórico original puder ser recuperado, sem adivinhar “anotações numeradas”.

---

# 03 — Registro de Decisões (ADR) e Reconciliação Histórica

**Referência temporal:** 21/11/2026. **STATUS** significa decisão vigente, não validação de produção. **Fonte de evidência:** `docs/`, código no SHA `9c854473`, Issue #3, PR #2 e solicitações historicamente recuperáveis. A ausência de alternativas na fonte é indicada; não se inventou processo deliberativo.

## ADR-001 · Converter demonstrativo em plataforma funcional

- **Contexto:** Golden Billing/CobraFlux navegável como mockup, IndexedDB, Pix/WhatsApp simulados; usuário solicitou auditoria e conversão de *cada* recurso do mockup.
- **Alternativas registradas:** permanecer somente demo (condição de origem); converter para SaaS real (pedido). Não há comparação formal de stacks externos.
- **Decisão:** evoluir em fases 0–9 com backend real; preservar demo para demonstração.
- **Justificativa conhecida:** transformar apresentação/fluxos simulados em operação multi-tenant verificável.
- **Consequências:** coexistência de dois modos, necessidade de reconciliação funcional/visual, custos de provedores e de operação.
- **Estado:** **ACEITA**, execução parcial; homologação futura.
- **Fontes:** solicitação do usuário de 20/11; `docs/DOCUMENTACAO_GOLDEN_BILLING.md`; Issue #3.

## ADR-002 · Proteger `main`; desenvolver em PR draft

- **Contexto:** mockup original estava em `main`; alterações importantes e riscos financeiros.
- **Alternativas:** não foi registrado processo formal de comparação entre feature-branch e commit direto.
- **Decisão:** somente `feat/production-foundation`; PR #2 draft; `main` preservada até autorização e release gate.
- **Justificativa:** rastreabilidade, CI isolada, prevenção de deploy/merge prematuro.
- **Consequências:** o ZIP/checkout padrão da `main` não contém funcionalidades da branch; cada novo agente precisa selecionar a branch explícita.
- **Estado:** **ACEITA E VIGENTE**.
- **Fontes:** Issue #3, PR #2, branches/commits Git verificados.

## ADR-003 · Gate de infraestrutura da Fase 1 substituído por gate pré-lançamento

- **Contexto:** o plano original exigia staging HTTPS, e-mail real e exercício de restore **antes da Fase 2**; o usuário informou **não possuir hospedagem**.
- **Anterior:** bloquear avanço a fases seguintes enquanto staging/backup não estivessem validados (`docs/FASE_1_SEGURANCA_OPERACAO.md`, seção “Gates antes da Fase 2”).
- **Posterior:** avançar implementação de código com CI verde, **adiar** verificações que precisam de infraestrutura para a homologação pré-lançamento (mensagem explícita do usuário; Issue #3 “Decisão sobre homologação sem hospedagem”).
- **Decisão vigente:** **seguir Fase 7 em código sem hosting**, mantendo todos os gates externos como pendentes reais.
- **Consequência:** nunca marcar “publicada/operando”; não ativar Pix, WhatsApp ou SaaS real só por CI verde.
- **Estado:** **SUBSTITUI decisão anterior**; anterior preservada neste registro. **Confiança:** alta.

## ADR-004 · Demo e modo operacional isolados por build

- **Contexto:** preservar o mockup e evitar que dados de simulação contaminem finanças verdadeiras.
- **Alternativa documentada em plano antigo:** `src/services/httpApiService.ts` implementando `IGoldenBillingService`, com `VITE_USE_REAL_API` (apenas proposta histórica no documento legado).
- **Arquitetura implementada:** `VITE_APP_MODE=production` seleciona `ProductionApp` e `productionApi.ts`; demo usa `AppProvider`/`demoService`/IndexedDB.
- **Justificativa:** isolamento explícito demo versus operação em banco.
- **Consequências:** duplicação temporária de UI e paridade visual ainda incompleta; não seguir instrução legada `VITE_USE_REAL_API` como se fosse atual.
- **Estado:** **DECISÃO IMPLEMENTADA EM CÓDIGO**; não foi localizada mensagem explícita do usuário aprovando *essa técnica específica*. **Fontes:** `src/App.tsx`, docs original e de Fase 2.

## ADR-005 · Backend TypeScript/Express e PostgreSQL multi-tenant

- **Contexto:** IndexedDB não serve de fonte de verdade entre múltiplos usuários/dispositivos.
- **Alternativas:** nenhuma avaliação documentada de Laravel/Supabase/MongoDB etc.; não presumir rejeição.
- **Decisão:** API Express 4 + TS, driver `pg`, PostgreSQL 16+, migrações 001–016, transações e org-scoped SQL.
- **Justificativa:** persistência central, integridade transacional e isolamento por organização.
- **Consequências:** banco obrigatório e deploy próprio; migrations como gate antes da execução.
- **Estado:** **ACEITA / IMPLEMENTADA — TESTADA EM CI**; banco gerenciado ainda não escolhido.

## ADR-006 · Tenant e autorização exclusivamente pelo servidor

- **Contexto:** perfis titular/operador/admin não podem acessar dados cruzados.
- **Decisão:** `membership` e sessão autenticada definem `organization_id`; `owner`, `operator`, `super_admin`; autorização no backend, CSRF em mutações.
- **Consequências:** o usuário não escolhe tenant de operação por parâmetro confiável no corpo; alternância exige autenticação e autorização.
- **Estado:** **ACEITA / TESTADA**. **Fontes:** `server/index.ts`, `server/team.ts`, integração.

## ADR-007 · Segurança da identidade

- **Contexto:** usuário real necessita verificar e-mail, recuperar senha e impedir reutilização de credenciais/sessões.
- **Decisão:** senha hash (bcrypt), cookie HttpOnly/SameSite/Secure em produção, CSRF, rate limit, reset e verificação de e-mail por tokens expiráveis/uso único, revogação de sessões.
- **Consequências:** exige Resend/remetente em ambiente real; testes CI simulam verificação no DB, não entrega de e-mail.
- **Estado:** **ACEITA / TESTADA EM CI**, entrega real pendente.

## ADR-008 · Superadmin requer TOTP verificado, sem autoativação

- **Contexto:** operações globais podem suspender contas ou definir planos, portanto elevadas.
- **Decisão:** provisionamento administrativo de uso único via `server/enroll-admin.ts`, TOTP criptografado, proteção antirreplay, sessão MFA exigida por `sessions` para `super_admin`.
- **Consequências:** não revelar segredo de TOTP ao navegador/PR; executar somente em terminal confiável quando houver ambiente.
- **Estado:** **ACEITA / TESTADA EM CI**, provisionamento operacional real pendente.

## ADR-009 · Valores em centavos e estado financeiro originado no PSP

- **Contexto:** risco de arredondamentos, falsos pagamentos e divergências de recibos.
- **Decisão:** centavos inteiros; criação em `draft`; apenas eventos PSP autenticados, consistentes e reconciliados alteram estados relevantes; nenhum clique simulador conta como pagamento.
- **Consequências:** diferença explícita entre API sandbox e dinheiro real; duplicação protegida por chaves/leases.
- **Estado:** **ACEITA / IMPLEMENTADA NO ESCOPO SANDBOX**.

## ADR-010 · Asaas **Sandbox** primeiro, live proibido até homologação

- **Contexto:** integração Pix de teste antes de faturamento real.
- **Alternativas mencionadas no documento original:** Asaas, Mercado Pago, Efí (como possíveis provedores); **não há registro comprovado de avaliação formal/rejeição definitiva de cada um**.
- **Decisão operacional:** adapter inicial exclusivamente `https://api-sandbox.asaas.com/v3`, credencial por tenant criptografada, webhook autenticado, deduplicação, QR sandbox.
- **Consequências:** não há provedor live, testes de domínio não comprovam PSP externo.
- **Estado:** **ACEITA / TESTADA COM MOCK**, homologação remota pendente.

## ADR-011 · Nunca repetir automaticamente requisição financeira inconclusiva

- **Contexto:** timeout/erro de rede pode ocorrer após PSP ter recebido POST.
- **Decisão:** reservar operação em Postgres; procurar por `externalReference`; conciliar antes de novo envio; estorno contabilizado somente `DONE` verificado; cancelamento confirma via consulta externa.
- **Consequências:** rotas e worker de reconciliação; pode exigir intervenção humana quando status permanece desconhecido.
- **Estado:** **ACEITA / TESTADA EM CI**, não validada PSP real.

## ADR-012 · Recorrências só geram rascunhos

- **Contexto:** risco de cobranças automáticas sem consentimento do profissional.
- **Decisão:** frequências mensal/semanal, calendário `America/Sao_Paulo`, snapshot, `cycle_key` e leases; não chamar Pix nem Meta automaticamente.
- **Consequências:** cron externo separado, geração de rascunhos, retomada sem cobranças retroativas por padrão; `catch_up` só com ação explícita e limite.
- **Estado:** **ACEITA / TESTADA EM CI**; scheduler real pendente.

## ADR-013 · WhatsApp oficial Meta, opt-in versionado

- **Contexto:** lembretes exigem consentimento, idempotência e políticas da Meta.
- **Alternativas:** nenhum benchmark registrado; canal escolhido: Cloud API oficial, não WhatsApp Web automatizado.
- **Decisão:** Graph v27.0, template aprovado `UTILITY`, consentimento com prova/revogação, webhook HMAC raw-body, outbox/lease, opt-out STOP/PARAR; não confiar em checkbox legado.
- **Consequências:** dependência de Meta App/WABA, aprovação de template e escopo de destinatários.
- **Estado:** **ACEITA / TESTADA COM MOCK**, envios live não homologados.

## ADR-014 · Workers não são serviços contínuos por padrão

- **Contexto:** não existe infraestrutura de cron/monitoramento; não iniciar cobrança ou envio sem controle.
- **Decisão:** comandos `--dry-run` e `--once`; flags desligadas por padrão; nenhuma execução externa automática no startup.
- **Consequências:** automações ainda não ocorrem por si sós sem agendador; ativação futura exige aprovação e observabilidade.
- **Estado:** **ACEITA / IMPLEMENTADA — TESTADA COMO CÓDIGO**.

## ADR-015 · Receita do CobraFlux distinta das cobranças dos profissionais

- **Contexto:** a plataforma recebe assinaturas SaaS, mas seus clientes profissionais cobram terceiros.
- **Decisão:** `saas_invoices` e `saas_subscriptions` segregadas de `charges`; MRR não pode ser GPV, sandbox não é receita real.
- **Consequências:** dois fluxos de integração PSP/contabilização, dois conjuntos de segredos/conciliadores; relatórios devem identificar explicitamente origem e período.
- **Estado:** **ACEITA / TESTADA EM CI**; PSP live pendente.

## ADR-016 · Plano Free default e upgrade bloqueado sem liquidação

- **Contexto:** não havia preço comercial nem PSP SaaS habilitado.
- **Decisão:** Free automático, Starter/Business inicialmente não publicados e sem preço, quotas por tenant, pedido idempotente com `invoice draft`; **nenhum upgrade apenas por pedido ou cupom**.
- **Consequências:** limites Free provisórios e necessitam aprovação comercial; resgate de cupom e faturamento live incompletos.
- **Estado:** **ACEITA COMO IMPLEMENTAÇÃO DE PLANO, TESTADA EM CI**; preços comerciais não definidos/aprovados.

## ADR-017 · Downgrade e inadimplência preservam os dados

- **Contexto:** bloqueio financeiro não deve destruir clientes/serviços ou pagamentos anteriores.
- **Decisão:** grace period de sete dias para inadimplência no código; exceder plano restringe novas criações, não apaga recursos; cancelamento na data de ciclo, sem concessão retroativa.
- **Consequências:** precisa política contratual/comercial no lançamento; dados existentes visíveis sob limites novos.
- **Estado:** **IMPLEMENTADA — TESTADA**; termos de uso/cobrança comercial pendentes.

## ADR-018 · Administração global por MFA, auditoria e menor exposição

- **Contexto:** Fase 7: controle global e relatórios administrativos.
- **Decisão:** endpoints e menu só para `super_admin`, alteração de status requer motivo, revoga sessões e desabilita fila WhatsApp; auditoria sem metadados livres, trigger append-only.
- **Consequências:** suporte e governança precisam fluxos de revisão/retencão; operadores sem acesso global.
- **Estado:** **IMPLEMENTADA — TESTADA EM CI 21/11**; fase 7 permanece aberta.

## ADR-019 · Exportações CSV sensíveis protegidas

- **Contexto:** dados de clientes podem conter PII e texto interpretável como fórmula em planilhas.
- **Decisão:** `POST` com CSRF e owner/admin, limite 1000 registros, rate limit e escaping CSV de fórmulas, campos explicitamente permitidos, log de exportação.
- **Consequências:** lotes adicionais e portabilidade LGPD completa ainda precisam processo. Não extrair dump direto de dados em navegador.
- **Estado:** **IMPLEMENTADA — TESTADA EM CI**.

## ADR-020 · LGPD por triagem; exclusão não automática

- **Contexto:** pedidos de titulares podem afetar obrigações legais/contábeis.
- **Decisão:** registrar `access`, `rectification`, `erasure`, `portability` e revisão humana; não excluir registros financeiros automaticamente, não marcar atendimento como cumprido sem evidência.
- **Consequências:** requer retenção legal, prazo, processo real de resposta, minimização e verificação jurídica.
- **Estado:** **IMPLEMENTADA EM PARTE — TESTADA**, conformidade LGPD não comprovada.

## ADR-021 · Android após web operacional estável

- **Contexto:** existe protótipo WebView e workflow Android demonstrativo; metas de publicação Play.
- **Decisão:** preservar branch demo; integrar a aplicação real futuramente; planejar target Android API 36+, AAB release assinado, testes internos e conformidade com Play.
- **Consequências:** branch demo não equivale a release; trabalho do repositório separado Universal Build não foi importado.
- **Estado:** **PLANEJADA**; implementação Android real não iniciada no roadmap atual.

## ADR-022 · Processo de entrega incremental, CI obrigatória, comunicação resumida

- **Contexto:** o usuário pediu executar as próximas etapas em sequência e posteriormente disse não precisar de feedback contínuo, preferindo entrega na conclusão.
- **Decisão vigente para desenvolvimento:** passos incrementais, testar, atualizar PR/issue; intervenção do usuário somente quando essencial, sem ultrapassar aprovações e gates. O protocolo específico **deste handoff** exige documentação extensa e não deve ser lido como autorização de commit.
- **Estado:** **instrução de trabalho do usuário**, limitada ao contexto do desenvolvimento; não substitui requisitos de segurança nem autorização para go-live.

## ADR-023 · Backup e restore não validados por simples existência de scripts

- **Contexto:** procedimentos de backup necessários para um SaaS com dados financeiros e pessoais.
- **Decisão:** usar `pg_dump` custom + `pg_restore` em banco separado com nome `_restore_drill`; implementar storage off-site criptografado, PITR, RPO/RTO e alertas antes do release.
- **Consequências:** só sintaxe dos scripts, migração CI e checagens locais estão confirmadas; ainda não existe evidência de restore em infraestrutura real.
- **Estado:** **PARCIAL; DEPENDÊNCIA EXTERNA**.

## ADR-024 · Segurança de logs/segredos e fechamento por evidência

- **Contexto:** dados sensíveis (credenciais PSP/Meta, PII, autenticação) e risco de declarar implementação sem validação.
- **Decisão:** servidor guarda segredos, chaves não vão ao cliente ou handoff, status por **decisão/executado/testado/publicado** separados; releases somente após validação adequada.
- **Estado:** **ACEITA / VIGENTE**, amplo escopo.

## Reconciliação de divergências identificadas

| ID | Anterior | Posterior / evidência | Vigência e impacto |
|---|---|---|---|
| CF-001 | Gate de Fase 1 impedia avançar sem staging (doc F1). | Decisão posterior explícita do usuário e Issue #3 permitem avançar código antes do hosting. | **Posterior vigente**; gates externos continuam obrigatórios antes de produção. |
| CF-002 | Golden Billing propunha trocar `IGoldenBillingService` por `httpApiService.ts` e `VITE_USE_REAL_API`. | Código atual usa `ProductionApp` e `VITE_APP_MODE=production` (`src/App.tsx`). | **Código atual prevalece como fato técnico**; falta prova de deliberação formal sobre a mudança. Não reimplementar proposta antiga sem autorização. |
| CF-003 | Documentos de Fases 2/3 mais antigos dizem que recorrências/WhatsApp/SaaS/relatórios ainda faltam. | Commits e migrações posteriores 011–016 implementaram núcleos correspondentes. | Atualizar leitura pelo **HEAD e roadmap mais recente**, sem apagar histórico anterior. |
| CF-004 | «Fase 6 concluída» dito no diálogo. | Issue #3 ainda contém checkout, webhook e fiscal pendentes; CI só cobre núcleo sem PSP. | **Conclusão técnica do núcleo**, nunca fase comercial/homologação concluída. |
| CF-005 | O mockup possuía administração, relatórios e pagamentos simulados. | Modo operacional tem módulos próprios; paridade visual fina ainda está pendente. | **Demo não é prova de recurso operacional**. |
| CF-006 | Branch Android poderia ser confundida com distribuição oficial. | `android-webview-demo-debug` contém WebView demo; Fase 9 permanece aberta. | **Não tratar APK demo como app real homologado**. |
| CF-007 | Planos pagos Starter/Business têm quotas maiores. | Não têm preço publicado nem PSP SaaS conectado. | **Sem produto comercial liberado** até decisão de precificação e pagamento confirmado. |
| CF-008 | Conta suspensa poderia voltar a acessar após reativação. | Fase 7 revoga as sessões antigas; novo login obrigatório; envio WhatsApp não reativa automaticamente. | **Vigente como regra de segurança**, implementada/testada em CI. |

## Alternativas não decididas e limites de aprovação

- O histórico disponível **não aprova** definitivamente PSP SaaS comercial, fornecedor de hosting, plataforma de monitoração, serviço fiscal, modelo de cobrança de assinaturas, tarifa paga ou escopo de dados LGPD elegíveis à destruição.
- Mercado Pago/Efí foram **mencionados como possibilidades** no documento demo; não há prova de rejeição formal. Asaas foi escolhido como **adapter inicial de sandbox**, não fornecedor universal obrigatório.
- Não há avaliação formal de performance, acesso global com múltiplas organizações ou revisões legais/antifraude concluídas.
- O uso histórico de um construtor Universal Build **é outro projeto**: não confundir suas decisões com as deste ADR.

---

# 04 — Backlog Consolidado, Único e Priorizado

**Corte:** 21/11/2026, HEAD `9c854473`. Este backlog contém **somente trabalho aberto, parcial ou decisão pendente**. Funcionalidades já implementadas/testadas constam na matriz `02` e não são repetidas como tarefas independentes. IDs `BL-*` não existiam previamente; são índices deste handoff.

**Priorização:** **P0** = bloqueio de segurança, integridade/obrigações antes de dinheiro real ou lançamento (não significa que deve ser executado antes do próximo commit de F7); **P1** = conclusão da fase ativa ou dependência substantiva; **P2** = melhoria/escopo futuro relevante; **P3** = cosmético ou opção ainda sem autorização. Prioridades propostas aqui são **classificação da auditoria**, não substituem prioridades explícitas do usuário no roadmap.

**Regra:** itens dependentes de hospedagem/PSP têm execução adiada por decisão explícita, **não cancelada**. «Não validado» não é «defeituoso». Recomendações novas estão marcadas como propostas, não comandos autorizados.

## Índice de itens por categoria

| Grupo | Categoria | Itens |
|---|---|---:|
| A | Correções críticas e bloqueios de segurança/integridade para release | 5 |
| B | Funcionalidades aprovadas ainda não concluídas | 6 |
| C | Implementações parciais que precisam ser fechadas | 7 |
| D | Validações externas pendentes | 9 |
| E | Refinamentos e melhorias (com indicação de recomendações novas) | 6 |
| F | Ideias/opções não aprovadas ou indefinidas | 5 |

**Total:** 38 itens únicos. Não converter em percentual de completude.


## A — Correções críticas e bloqueios de segurança/integridade para release

### BL-001 — Gate anti-live obrigatório
- **Título/descrição:** Proibir merge/deploy, cobranças real e mensagens Meta a clientes sem autorização formal; não há bug confirmado de bypass na CI, é gate crítico de release.
- **Origem e rastreabilidade:** Issue #3; REQ-002,007,011,057,113.
- **Prioridade:** **P0 — risco de movimentação financeira/envios não autorizados**.
- **Aprovação:** **APROVADA (proibição explícita)**.
- **Implementação:** **EM DESENVOLVIMENTO (guardas de código; governança de liberação faltante)**.
- **Dependências:** Homologação de PSP/Meta, F8, revisão segurança.
- **Critérios de aceitação:** Nenhum live habilitado sem checklist assinada, credenciais segregadas, consentimento/validação e rollback.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Criar checklist release com prova do PSP, autorização explícita, teste de feature flags e rollback; mantê-lo bloqueado.

### BL-002 — Governança de segredos e chaves em produção
- **Título/descrição:** Garantir gestão de chaves, rotação, revogação e acesso mínimo a segredos administrativos/Meta/PSP.
- **Origem e rastreabilidade:** Issue #3; REQ-009,032,029; docs F1/F3/F5.
- **Prioridade:** **P0 — vazamento de dados financeiros e privilégios**.
- **Aprovação:** **APROVADA (princípio)**.
- **Implementação:** **IMPLEMENTADA PARCIALMENTE — criptografia código testada, operação de segredos não configurada**.
- **Dependências:** Provedor de secrets, staging, MFA, contas externas.
- **Critérios de aceitação:** Teste de não exposição em UI/log; chaves rotacionáveis e segredos não publicados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Definir política segura de secrets e teste de rotação em staging; NÃO criar/distribuir valores agora.

### BL-003 — Proteção LGPD antes de dados reais em produção
- **Título/descrição:** Fechar bases legais, retenção, exclusão/anonimização controlada e resposta verificável a titulares.
- **Origem e rastreabilidade:** Issue #3 F7/F8; REQ-102–104; LGPD.
- **Prioridade:** **P0 antes do go-live — dados pessoais/financeiros e obrigações legais**.
- **Aprovação:** **APROVADA (necessidade de conformidade)**.
- **Implementação:** **EM DESENVOLVIMENTO (intake/triagem testados; cumprimento final não)**.
- **Dependências:** Revisão jurídica, staging, backups, suporte.
- **Critérios de aceitação:** Retenção e atendimento documentados/aprovados, prova por caso, nunca deletar financeiro indevidamente.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Projetar e revisar o fluxo completo com profissional jurídico, distinguir requisitos legais de sugestões técnicas.

### BL-004 — Verificar suspensão segura em execução concorrente
- **Título/descrição:** Testar se workers em voo e sessões paralelas obedecem bloqueio de organização; risco inferido, sem defeito confirmado.
- **Origem e rastreabilidade:** Recomendação da auditoria sobre REQ-093/094.
- **Prioridade:** **P1 — potencial envio indevido durante mudança de status**.
- **Aprovação:** **PROPOSTA DA AUDITORIA (não aprovada)**.
- **Implementação:** **NÃO INICIADA como bateria de teste de concorrência externa**.
- **Dependências:** F7, staging, workers, eventos.
- **Critérios de aceitação:** Nenhum job novo ou finalizado após suspensão onde regra proíba, sessão revogada imediatamente.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Adicionar testes concorrentes e threat model, só após aceite; não afirmar vulnerabilidade sem reprodução.

### BL-005 — Revisar modelagem de receita e contabilização antes de habilitar live
- **Título/descrição:** Impedir que filtros de status/provider gerem reconhecimento de receita sem cadeia de confirmação externa.
- **Origem e rastreabilidade:** Docs F6/F7; REQ-096,089.
- **Prioridade:** **P0 para finanças live — falso reconhecimento de receita**.
- **Aprovação:** **APROVADA como requisito de integridade**.
- **Implementação:** **EM DESENVOLVIMENTO — métricas restritivas em código, PSP real ausente**.
- **Dependências:** PSP SaaS e merchant live, conciliação, fiscal.
- **Critérios de aceitação:** Eventos verificados, reembolsos, períodos/annualização corretos, GPV/MRR separados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Especificar e testar critérios com contabilidade/PSP antes de ativar qualquer live.


## B — Funcionalidades aprovadas ainda não concluídas

### BL-006 — Respostas administrativas de suporte e SLA
- **Título/descrição:** Adicionar mensagens de resposta real, histórico acessível, notificação comprovável, SLA e gestão de estado.
- **Origem e rastreabilidade:** Issue #3 F7; REQ-039/100/101.
- **Prioridade:** **P1 — fechamento do escopo funcional da F7**.
- **Aprovação:** **APROVADA — roadmap F7**.
- **Implementação:** **PLANEJADA (triagem já testada; resposta não)**.
- **Dependências:** Email real ou canal escolhido, RBAC, retention.
- **Critérios de aceitação:** Ticket possui resposta auditada e cliente sabe se foi entregue; não marcar envio fictício.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Desenhar contrato de mensagens/entregas com status idempotentes e testes, sem enviar agora.

### BL-007 — Atendimento LGPD de ponta a ponta
- **Título/descrição:** Executar acesso, retificação, portabilidade e decisões fundamentadas sem excluir registros retidos legalmente.
- **Origem e rastreabilidade:** Issue #3 F7; REQ-104.
- **Prioridade:** **P1 para desenvolvimento F7, P0 release**.
- **Aprovação:** **APROVADA — fase 7**.
- **Implementação:** **PLANEJADA (intake/triagem implementados)**.
- **Dependências:** Acordo jurídico, DPO, retenção, auditoria, exportação.
- **Critérios de aceitação:** Cada pedido percorre fluxo verificável e é resolvido com evidência e restrições legais.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Mapear processo e estados de cumprimento; implementar apenas após revisão do escopo legal.

### BL-008 — Relatórios financeiros e exportações completos
- **Título/descrição:** Ampliar filtros, intervalos, paginação/portabilidade e explicitar dados consolidados vs estimados.
- **Origem e rastreabilidade:** Issue #3 F7; REQ-096–099.
- **Prioridade:** **P1 — qualidade de gestão e fechamento F7**.
- **Aprovação:** **APROVADA — roadmap relatórios**.
- **Implementação:** **EM DESENVOLVIMENTO — sumários e CSV 1000 itens testados**.
- **Dependências:** PSP para renda real; tenant; performance.
- **Critérios de aceitação:** Filtros corretos, totais reconciliados, download por páginas com data lineage.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Comparar demo e relatórios operacionais, especificar métricas e testes de acúmulo.

### BL-009 — Centro de notificações funcional
- **Título/descrição:** Completar o módulo de notificações do mockup com eventos do servidor, permissões e opt-out.
- **Origem e rastreabilidade:** Doc Golden Billing; REQ-020.
- **Prioridade:** **P2 — paridade funcional, sem comprometer segurança**.
- **Aprovação:** **APROVADA no objetivo de converter mockup; detalhamento indefinido**.
- **Implementação:** **EM DESENVOLVIMENTO — existe fila WhatsApp, centro geral não comprovado**.
- **Dependências:** F3/F5, preferências, consentimentos.
- **Critérios de aceitação:** Eventos do DB renderizados, diferenciação mensagem enviada/entregue e pagamento verificado.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Inventariar componentes demo e decidir comportamento de notificações antes de codar.

### BL-010 — Site institucional e onboarding de produção
- **Título/descrição:** Revisar registro, confirmação, recuperação, páginas públicas, planos, termos e FAQ reais.
- **Origem e rastreabilidade:** Doc Golden Billing; REQ-014.
- **Prioridade:** **P2 — UX onboarding e conformidade pré-publicação**.
- **Aprovação:** **APROVADA como conversão geral do mockup**.
- **Implementação:** **EM DESENVOLVIMENTO — auth real existe, paridade global não comprovada**.
- **Dependências:** F1/F6/F7, texto legal, deploy.
- **Critérios de aceitação:** Landing real não anuncia funcionalidades inexistentes, autentica na API e mostra termos corretos.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Executar inventário de páginas demo e produção; abrir tarefas específicas.

### BL-011 — Android real de publicação
- **Título/descrição:** Converter WebView demo para cliente do web app operacional, depois build AAB assinado e Play interno.
- **Origem e rastreabilidade:** Issue #3 F9; REQ-115–119.
- **Prioridade:** **P2 agora, P0 antes do release Android**.
- **Aprovação:** **APROVADA no roadmap F9**.
- **Implementação:** **PLANEJADA — branch demo não integrada**.
- **Dependências:** F8, HTTPS, Play Console, API 36+.
- **Critérios de aceitação:** Login, cookies, downloads, notificações e UX passam em aparelhos físicos; bundle assinado.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Manter separado até F8 e inspecionar branch Android antes de iniciar.


## C — Implementações parciais que precisam ser fechadas

### BL-012 — Fase 7: integração final da UI de relatórios/admin
- **Título/descrição:** Revisar formulários, tratamento de erro, navegação por papel, acessibilidade e paridade do painel real.
- **Origem e rastreabilidade:** Issue #3; REQ-091–105; commit 9c854473.
- **Prioridade:** **P1 — F7 atual**.
- **Aprovação:** **APROVADA**.
- **Implementação:** **EM DESENVOLVIMENTO — primeira entrega implementada/testada em CI**.
- **Dependências:** Catálogo de UX do demo, revisão cross-device.
- **Critérios de aceitação:** Testes visuais/controlados para status, lista vazia, falha de rede, tokens expirados, foco/scroll.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Auditar cada tela F7 em navegador e escrever testes de fluxos específicos.

### BL-013 — Fase 2: paridade visual funcional integral
- **Título/descrição:** Comparar todos os cards, menus, formulários e páginas do demo com modo real.
- **Origem e rastreabilidade:** Issue #3 F0/F2; REQ-015,019,044.
- **Prioridade:** **P1 — requisito expresso e dívida transversal**.
- **Aprovação:** **APROVADA**.
- **Implementação:** **EM DESENVOLVIMENTO — navegação e smoke testados; paridade fina não**.
- **Dependências:** Screenshots e fluxos demo/real, CSS, Android.
- **Critérios de aceitação:** Inventário sem lacunas nem elementos escondidos, regressão em viewport mobile.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Produzir checklist por componente e testes de screenshots, sem copiar simuladores financeiros.

### BL-014 — Fase 6: PSP de assinatura da plataforma
- **Título/descrição:** Completar checkout, webhooks autenticados, reembolsos, reconciliação, ativação pós-pagamento e cupons.
- **Origem e rastreabilidade:** Issue #3 F6; REQ-088–090.
- **Prioridade:** **P1 para fechamento do produto, P0 antes do preço comercial**.
- **Aprovação:** **APROVADA como fase; fornecedor e preços INDEFINIDOS**.
- **Implementação:** **EM DESENVOLVIMENTO — ledger/quote/draft testados, PSP live ausente**.
- **Dependências:** Fornecedor SaaS, preços, ambiente sandbox, legal.
- **Critérios de aceitação:** Nenhuma elevação por invoice draft; somente evento verificado e conciliação ativa o plano.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Elaborar especificação neutra ao PSP, levantar decisões comerciais, esperar contratação para homologar.

### BL-015 — Fase 3: levar adapter de testes à homologação real
- **Título/descrição:** Adapter existe com mocks, mas falta provar Pix/QR/evento/refund/cancelamento no Asaas Sandbox remoto.
- **Origem e rastreabilidade:** Issue #3 F3; REQ-056/057.
- **Prioridade:** **P1 para preparar operação financeira, P0 para ativar live**.
- **Aprovação:** **APROVADA como etapa sandbox**.
- **Implementação:** **EM DESENVOLVIMENTO — código/CI testados, exterior não**.
- **Dependências:** Asaas Sandbox, HTTPS, credenciais e consentimento.
- **Critérios de aceitação:** Logs/redações PSP reais reconciliados; sem dinheiro live.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Preparar plano de testes externos, sem ativar live nem inserir segredos no Git.

### BL-016 — Fase 5: lembretes automáticos e notificações finais
- **Título/descrição:** Fila e scheduler desligado por padrão; precisa teste real de opt-out/template e entrega.
- **Origem e rastreabilidade:** Issue #3 F4/F5; REQ-066,076,078.
- **Prioridade:** **P1 antes de automação de lembretes**.
- **Aprovação:** **APROVADA — arquitetura de Meta oficial**.
- **Implementação:** **EM DESENVOLVIMENTO — queue e worker com mocks, sem envio remoto**.
- **Dependências:** Meta WABA, templates, consentimento, HTTPS, cron.
- **Critérios de aceitação:** Nenhum destinatário sem prova; delivery/status verificáveis e fallback de erro.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Documentar casos de teste e autorização de envio teste, somente após contas.

### BL-017 — Fase 1: operacionalização de MFA e e-mail
- **Título/descrição:** Fluxos implementados com testes; faltam e-mail entregue e provisioning de superadmin em staging.
- **Origem e rastreabilidade:** Issue #3 F1; REQ-026–029,107.
- **Prioridade:** **P1 para readiness e P0 go-live**.
- **Aprovação:** **APROVADA**.
- **Implementação:** **EM DESENVOLVIMENTO — código validado, operação não**.
- **Dependências:** Resend, HTTPS, chave MFA, conta verificada.
- **Critérios de aceitação:** Login real, recuperações e revogações com evidência sem segredo.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Preparar runbook privado e testá-lo quando houver staging.

### BL-018 — Plano de deploy e restore
- **Título/descrição:** Dockerfile/scripts existentes mas não há rotina externa de backup, PITR, monitoramento, rollback.
- **Origem e rastreabilidade:** Issue #3 F1/F8; REQ-108–113.
- **Prioridade:** **P0 pré-lançamento**.
- **Aprovação:** **APROVADA**.
- **Implementação:** **EM DESENVOLVIMENTO — scripts versionados sem operação remota**.
- **Dependências:** PostgreSQL gerenciado, storage, secret manager, hosted server.
- **Critérios de aceitação:** Backup restaurável, alertas e rollback demonstrados com evidências.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Criar plano operacional/homologação, sem executar deploy até aprovação.


## D — Validações externas pendentes

### BL-019 — Validar e-mail Resend externo
- **Título/descrição:** Confirmar fluxo end-to-end de registro, recuperação e convite, com remetente autorizado.
- **Origem e rastreabilidade:** Issue #3 F1/F2; REQ-026/027/040/107.
- **Prioridade:** **P0 release — autenticação e suporte dependem do transporte**.
- **Aprovação:** **APROVADA; adiada por usuário**.
- **Implementação:** **BLOQUEADA (sem conta/hosting comprovados)**.
- **Dependências:** Staging/Resend.
- **Critérios de aceitação:** E-mails de teste recebidos e tokens expiram; logs sem conteúdo sigiloso.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Quando houver staging, executar suite externa controlada e anexar evidência redigida.

### BL-020 — Validar Asaas Sandbox com webhooks e refunds
- **Título/descrição:** Confirmar adapter host, callback, QR, evento fora de ordem, refunds DONE e timeout.
- **Origem e rastreabilidade:** Issue #3 F3; REQ-045–056.
- **Prioridade:** **P0 antes de transação live**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Asaas Sandbox/HTTPS.
- **Critérios de aceitação:** Cenários de integração reais aprovados e conciliados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Abrir conta de homologação sob custódia e testar sem money live.

### BL-021 — Validar Meta WABA e templates reais
- **Título/descrição:** Verificar HMAC, opt-out, entrega/read, custos e throttling com números autorizados.
- **Origem e rastreabilidade:** Issue #3 F5; REQ-067–078.
- **Prioridade:** **P0 antes de envio real**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Meta WABA/HTTPS/consentimento válido.
- **Critérios de aceitação:** Evidência de template UTILITY aprovado e destinatário consentido.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Quando houver infraestrutura, testar escopo test e deixar live fechado.

### BL-022 — Habilitar agendador de recorrências sob observabilidade
- **Título/descrição:** Executar cron e validar idempotência sob concorrência real e reinício.
- **Origem e rastreabilidade:** Issue #3 F4; REQ-065.
- **Prioridade:** **P1 operação sem cron não automatiza**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Staging/DB/alertas.
- **Critérios de aceitação:** Cada ciclo tem único draft e runs monitorados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Criar job de scheduler depois de staging e backup.

### BL-023 — Habilitar scheduler SaaS e WhatsApp enqueue de teste
- **Título/descrição:** Validar jobs one-shot recorrentes com locks/retentativas, sem ativar envio live.
- **Origem e rastreabilidade:** Issue #3 F5/F6; REQ-076/086.
- **Prioridade:** **P1 operação automatizada**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Cron/Meta e DB.
- **Critérios de aceitação:** Estados e filas evoluem sem duplicação ou PII vazada.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Planejar horário, observabilidade e feature gates por job.

### BL-024 — Validar restauração PostgreSQL off-site
- **Título/descrição:** Executar backup + restore drill e registrar consistência, RPO/RTO.
- **Origem e rastreabilidade:** Issue #3 F1/F8; REQ-108–110.
- **Prioridade:** **P0 segurança de dados de clientes**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** DB gerenciado/backup.
- **Critérios de aceitação:** Restore real em base separada, logs e hash íntegros.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Executar teste somente após provisionamento seguro autorizado.

### BL-025 — Homologar UX em Android físico
- **Título/descrição:** Testar login, cookies, navegação, uploads, exports e performance, inclusive MIUI/One UI.
- **Origem e rastreabilidade:** Issue #3 F2/F9; REQ-018/118.
- **Prioridade:** **P1 antes de distribuir Android**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** APK real, HTTPS, dispositivos.
- **Critérios de aceitação:** Checklist em modelos e APIs relevantes, sem bugs bloqueantes.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Estabelecer matriz de devices e execução física após F8.

### BL-026 — Homologar RGPD/LGPD e obrigações fiscais
- **Título/descrição:** Verificar bases legais, prazos, notas, retenção e suporte jurídico/fiscal brasileiro.
- **Origem e rastreabilidade:** Issue #3 F6/F7/F8; REQ-090/104.
- **Prioridade:** **P0 go-live por risco regulatório**.
- **Aprovação:** **APROVADA como necessidade, decisão específica indefinida**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Especialistas e modelo comercial.
- **Critérios de aceitação:** Parecer/revisão assinada e implementação correspondente.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Preparar tópicos para revisão jurídica/fiscal, sem afirmar conformidade.

### BL-027 — Teste de carga, segurança e rollback
- **Título/descrição:** Avaliar limites sob carga, reconciliação e segurança do SaaS live em staging.
- **Origem e rastreabilidade:** Issue #3 F8; REQ-111–113.
- **Prioridade:** **P0 release**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **PLANEJADA**.
- **Dependências:** Staging e ambiente de backup.
- **Critérios de aceitação:** Nenhum P0/P1 aberto, relatórios de stress e rollback.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Planejar casos OWASP/concurrency, executar após staging.


## E — Refinamentos e melhorias (com indicação de recomendações novas)

### BL-028 — Revisar naming/package e README
- **Título/descrição:** `package.json` ainda usa `react-example`, README não encontrado no HEAD; padronizar quando autorizado.
- **Origem e rastreabilidade:** Inspeção de `package.json`/árvore; recomendação auditoria.
- **Prioridade:** **P3 — documentação e manutenção**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Revisão branding e workflow.
- **Critérios de aceitação:** Nome coerente e README que aponta aos docs vigentes.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Solicitar aceite e alterar em commit pequeno após F7 se priorizado.

### BL-029 — Formalizar política de migração e rollback
- **Título/descrição:** Documentar rollback forward-only, backups, ensaio de migrações com DDL não reversível.
- **Origem e rastreabilidade:** Inspeção de `migrate.ts`, F8; recomendação auditoria.
- **Prioridade:** **P2 — manutenção de esquema e recuperação**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Backups/DB, staging.
- **Critérios de aceitação:** Guia testado de upgrade/rollback preserva dados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Escrever runbook e ensaiar em BD isolado quando permitido.

### BL-030 — Cobertura de acessibilidade e testes visuais
- **Título/descrição:** Formalizar WCAG, teclado, foco, leitores e regressões de screenshot por viewport.
- **Origem e rastreabilidade:** Issue #3 F2; recomendação auditoria; REQ-015/018.
- **Prioridade:** **P2 — evita regressões de UX**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **PLANEJADA como revisão visual, sem auditoria WCAG confirmada**.
- **Dependências:** UI F7, devices.
- **Critérios de aceitação:** Relatório de foco, contraste, sem clipping e navegação teclado.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Levantar baseline e escopo sem inventar conformidade.

### BL-031 — Verificar desempenho de exports e analytics grandes
- **Título/descrição:** Avaliar paginação e índices com volume elevado e memória ao gerar CSV.
- **Origem e rastreabilidade:** Inspeção F7; recomendação auditoria.
- **Prioridade:** **P2 — evitar lentidão em tenants grandes**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **NÃO INICIADA como benchmark**.
- **Dependências:** Staging/datasets sintéticos, métricas.
- **Critérios de aceitação:** Export e consultas dentro de SLO mensurável sob carga.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Elaborar benchmark e plano de streaming/paginação se necessário.

### BL-032 — Revisar metodologia de MRR e reembolsos
- **Título/descrição:** Definir tratamento anual, trials, descontos, cancelamento, refunds, impostos sem inflar MRR.
- **Origem e rastreabilidade:** Inspeção `phase7-routes.ts`; recomendação auditoria.
- **Prioridade:** **P1 antes da monetização real**.
- **Aprovação:** **PROPOSTA DA AUDITORIA — definição comercial ainda indefinida**.
- **Implementação:** **NÃO INICIADA para edge cases comerciais**.
- **Dependências:** PSP SaaS, fiscal, métricas.
- **Critérios de aceitação:** Fórmulas auditadas reconciliadas com ledger live.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Propor especificação e validar com equipe financeira antes do provider.

### BL-033 — Auditoria da qualidade de logs e PII
- **Título/descrição:** Verificar minimização de payload em eventos/audit, anonimização, políticas de acesso/retention.
- **Origem e rastreabilidade:** Inspeção F7; recomendação auditoria.
- **Prioridade:** **P1 por privacidade e compliance**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **NÃO INICIADA como revisão independente**.
- **Dependências:** LGPD/observabilidade.
- **Critérios de aceitação:** Logs sem tokens/PII desnecessária e retenção aprovada.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Conduzir threat model e inventário de campos com aprovação.


## F — Ideias/opções não aprovadas ou indefinidas

### BL-034 — Fornecedor de checkout SaaS e condições comerciais
- **Título/descrição:** Escolher PSP da plataforma, precificação Starter/Business, desconto, ciclo, regras de chargeback/taxas.
- **Origem e rastreabilidade:** Docs F6; REQ-088–090.
- **Prioridade:** **P1 decisão de produto para concluir F6 live**.
- **Aprovação:** **INDEFINIDA — nenhum fornecedor/preço aprovado**.
- **Implementação:** **PLANEJADA**.
- **Dependências:** Pesquisa atual/contrato/contabilidade.
- **Critérios de aceitação:** Decisão registrada em ADR, API/ambientes separados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Apresentar opções com custos/regras e solicitar aprovação, não contratar por conta própria.

### BL-035 — Fornecedor de hosting e domínio
- **Título/descrição:** Escolher serviço gerenciado e domínio HTTPS de staging/produção.
- **Origem e rastreabilidade:** Docs fundação; REQ-106/112.
- **Prioridade:** **P1 para homologação**.
- **Aprovação:** **INDEFINIDA — usuário afirmou não ter hospedagem**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Custos, região, DB, compliance.
- **Critérios de aceitação:** Contrato/ambiente escolhidos com critérios explícitos.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Preparar comparativo após definição de orçamento e restrições.

### BL-036 — Refatoração para contrato `IGoldenBillingService`
- **Título/descrição:** Documento demo sugeria `httpApiService.ts` e `VITE_USE_REAL_API`; runtime atual usa ProductionApp.
- **Origem e rastreabilidade:** ADR-004; docs Golden Billing.
- **Prioridade:** **P3 — alternativa arquitetural não adotada**.
- **Aprovação:** **PROPOSTA HISTÓRICA, NÃO APROVADA COMO MUDANÇA ATUAL**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Arquitetura operacional vigente, testes.
- **Critérios de aceitação:** Somente realizar se houver decisão e razão concretas.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Não reintroduzir contrato legado automaticamente; registrar divergência.

### BL-037 — Mercado Pago/Efí como alternativas PSP
- **Título/descrição:** Documento original cita provedores, mas adapter inicial escolhido é Asaas Sandbox.
- **Origem e rastreabilidade:** Documento Golden Billing; ADR-010.
- **Prioridade:** **P3 — opção de arquitetura, não tarefa pendente**.
- **Aprovação:** **INDEFINIDA; NÃO REJEITADA FORMALMENTE**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Comparativo PSP e decisão comercial.
- **Critérios de aceitação:** Provedor escolhido após auditoria de custos, sem mudança clandestina de gateway.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Não implementar providers alternativos sem escolha.

### BL-038 — Utilizar Universal Build para CobraFlux
- **Título/descrição:** Projeto Android universal apareceu em conversa separada; integração não solicitada de forma conclusiva neste escopo.
- **Origem e rastreabilidade:** Histórico de outra conversa, fronteira de escopo.
- **Prioridade:** **P3 — evita mistura entre repositórios**.
- **Aprovação:** **NÃO APROVADA PARA O COBRAFLUX**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Decisão específica F9.
- **Critérios de aceitação:** Se desejado, definir interface/repo com autorização explícita.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Manter Universal Build independente; não importar regras dele.

---

## Verificação de ausência de duplicação e autorização
- Cada `BL-*` possui um único agrupamento principal; referências à mesma dependência em outros itens são **vínculos**, não ordens para executar duas vezes.
- A primeira sequência operacional autorizada é **continuar Fase 7** (`BL-006`, `BL-007`, `BL-008` e `BL-012` conforme o conjunto acima), após checar HEAD/CI, não operar serviços externos.
- Ideias do grupo F exigem decisão explícita; não se deve tratar alternativas antigas como backlog aprovado.
- Ausência de bugs P0 reproduzidos no HEAD atual: o grupo A mapeia **gates/riscos críticos de pré-lançamento**, não afirma falhas de produção.
- Itens ligados a Fase 8 e Fase 9 não estão autorizados a publicar/mergear apenas porque o roadmap existe.

---

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

---

# 06 — Roadmap, Marcos, Dependências e Critérios de Aceitação

**Fonte mestra:** [GitHub Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), criada para acompanhar auditoria de 20/11/2026; docs F1–F7 no HEAD do repositório. Corte técnico confirmado: `9c854473` em 21/11/2026, CI backend/Postgres e Playwright aprovadas.

## Como interpretar as quatro etapas de entrega

**PLANEJADO** = escopo aceito/registrado; **EXECUTADO** = código, SQL ou procedimento produzido; **VALIDADO** = evidência de testes adequada ao escopo declarado; **ENTREGUE OPERACIONALMENTE** = deploy, provedor externo, usuários/dispositivos e homologação comprovados. Nenhuma fase foi demonstrada como *operacionalmente entregue em produção* neste histórico.

A decisão vigente permite **avançar implementação em código**, testando no GitHub Actions, **antes** de haver staging. Isso não apaga gates nem autoriza serviços live. Deve haver duas colunas distintas para **núcleo técnico** e **homologação externa**.

## Panorama completo de fases 0–9

| Fase | Meta e principais entregáveis | Planejado | Execução/código | Validação técnica observada | Operação/homologação |
|---|---|---|---|---|---|
| **0 — Preparação** | Auditoria do demo, branch feature, PR draft, CI, baseline completo | Sim | Branch/PR/CI existentes; baseline integral não | CI funcionando no HEAD | Não |
| **1 — Segurança/base** | PostgreSQL, auth, CSRF, MFA, e-mail, sessões, backup | Sim | Núcleo implementado; scripts de backup/restore; integração email preparada | CI/PG/código aprovado | **Não:** staging, Resend, MFA real, restore off-site |
| **2 — Cadastros/operação** | Clientes, serviços, drafts, CSV, equipe, perfil/suporte e UI responsiva | Sim | Núcleo implementado; paridade visual fina não | CI e browser desktop/mobile | **Não:** convite email real, revisão completa Android |
| **3 — Pix Asaas** | Adaptação **sandbox** de Pix, QR, webhooks, estorno, cancelamento, conciliação | Sim | Código e mock tests implementados | CI sandbox/mock e Postgres | **Não:** Asaas Sandbox externo, HTTPS, Pix live proibido |
| **4 — Recorrências** | Regras semanais/mensais, calendário civil, worker de rascunhos idempotentes | Sim | Núcleo implementado | Testes de calendário/integridade/CI | **Não:** cron em hosting e carga real |
| **5 — WhatsApp** | Meta Cloud API, consentimento versionado, fila, callbacks, lembretes | Sim | Núcleo implementado, envio desativado | Testes mockados/webhook/unitários/CI | **Não:** Meta externa/entrega/custos/consentimentos auditados |
| **6 — Monetização SaaS** | Planos/cotas, faturas próprias, upgrade draft, coupons e dunning | Sim | **Núcleo técnico concluído**, último commit de referência `e79c829d` | CI aprovada nesse núcleo, revalidada em HEAD posterior | **Não:** PSP SaaS, cobrança, NFSe/preços/recebimento real |
| **7 — Admin/relatórios** | MFA/RBAC global, status de contas, suporte, LGPD, KPIs e exportações | Sim | **INICIADA**: 1º incremento com migração 016, telas/APIs | **Sim no incremento:** CI `9c854473` aprovada | **Não:** F7 integral, LGPD plena, suporte de resposta, staging |
| **8 — Homologação** | Segurança externa, carga, PITR, backup real, alertas, piloto e rollback | Sim | Scripts/CI de apoio disponíveis | Somente testes automatizados, não homologação | **Pendente** |
| **9 — Android Play** | Integrar aplicação real, target API 36+, assinar AAB, testes Play | Sim | Branch Android demo separada, sem app real integrado | Histórico de demo reportado; app real não testado | **Pendente** |

**Métrica de andamento:** não se deve calcular percentual de conclusão com `[x]` da Issue #3, pois diferentes itens envolvem testes de naturezas distintas, homologação externa e requisitos legais. Não há baseline ponderado aprovado.

## Marcos verificáveis do desenvolvimento

### M0 — Fundação do repositório

- `main` no commit `95aba9c27c363c8b24c2f34c65a28c2f3b011b3b`, criado em 13/11/2026 a partir da demo Golden Billing.
- Branch `feat/production-foundation` preserva conteúdo do mockup original e adiciona backend operacional.
- **Entrega:** fonte versionada e projeto demonstrativo; sem produção homologada.

### M1 — Fundação de backend/auth

- Código Express, migrações, PostgreSQL, sessão, MFA, email, CSRF, rate limits, teste de isolamento.
- A entrega de e-mail real, staging HTTPS e exercício restore eram gates originais. Decisão posterior do usuário **adiou**, não removeu, esses gates.
- **Aceite técnico:** testes de auth/segurança e migration no CI; **aceite operacional:** envio real, MFA provisionado, backup restaurável.

### M2 — Operações de profissionais

- `004_operations.sql`, `005_team_invitations.sql`, telas reais, arquivos CSV, CRUD, histórico, convites e painel responsivo.
- CI histórico navegador commit `6dd1798`; no HEAD atual, suite de regressão permanece aprovada.
- **Falta:** comparação exaustiva de todos os cards/campos/interações de demo, email real de convites, Android físico.

### M3 — Pix sob controle de sandbox

- `006` a `010`: emissões Asaas Sandbox, webhooks, comprovantes/estornos/reconciliação/cancelamento.
- **Não** usar para cobrar cliente em produção; mockações não são chamadas a conta Asaas externa.
- **Aceite futuro:** conta PSP de homologação, webhook HTTPS, transações de teste com prova externa, conciliação, antifraude, homologação e autorização de live **separada**.

### M4 — Recorrências sem débito automático

- `011_recurring_plans.sql`, regras, calendário `America/Sao_Paulo`, geração de `draft`, dedup e lease, CLI.
- **Aceite técnico:** calendário e integridade testados; **aceite operacional futuro:** cron/monitoramento, backup e carga sem duplicação.

### M5 — Mensageria sem disparo real

- `012` a `014`, Meta Cloud API v27.0, consentimento atual, STOP/PARAR, outbox, webhook HMAC, enfileiramento por vencimento e UI.
- **Aceite técnico:** flags default OFF, callbacks/idempotência/consentimentos testados; **aceite operacional futuro:** WABA, número autorizado, template UTILITY aprovado, custos, envio e opt-out reais.

### M6 — SaaS financeiro separado

- Migração `015_saas_billing.sql`, cotação/quotas/cupom/request idempotente, fatura `draft`, pagina Meu Plano; sem PSP próprio.
- **Último commit do núcleo técnico:** `e79c829de377fa816468ab409b9d4d233b019021`, 21/11/2026 05:15 UTC.
- **Critério válido:** código e CI aprovados; **não** se pode declarar a **Fase 6 inteira financeiramente concluída** sem checkout/PSP/live e fiscal.

### M7 — Fase atual: Administração/Relatórios, primeiro incremento

- Iniciada a partir de `d552e99f7eb1e7e4d6484b76035d7c8ec91c9245` (migração 016), 21/11/2026 13:36 UTC.
- Entre essa alteração e `9c8544730b47059f4f8977bd950e46227784c9c0` foram incorporados endpoints, telas, migração LGPD/tickets, relatórios, CSV protegido, auditoria e testes.
- Correções de testes intermediários: TypeScript da asserção audit (`79c45622`) e normalização de BOM CSV por Fetch (`9c854473`).
- **CI FINAL VERIFICADA:** backend Postgres [#44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191) **success**; browser [#44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168) **success**.
- **Importante:** primeiro incremento **testado**, **Fase 7 ainda aberta**.

## Próxima etapa autorizada — não implementar durante auditoria

**Objetivo:** concluir os elementos *funcionais e de governança* da **Fase 7** que podem ser feitos sem hospedagem, respeitando os bloqueios reais.

1. **Revalidar HEAD** de `feat/production-foundation`, PR #2, Issue #3, CI e migrações atuais. Não confundir `main` e branch feature.
2. **Auditar paridade** `src/pages/admin/AdminView.tsx` (demo) versus `AdminOperationsView.tsx` (real); `ReportsView.tsx` versus `ReportsOperationsView.tsx`; status, filtros, formulários, cards, fluxos vazios, erros e papéis. Preservar recursos demo sem contaminar DB operacional.
3. **Escolher próximo item F7 aprovado, não ideia nova:** 
   - acompanhamento e resposta de suporte com histórico, status de entrega e SLA, evitando afirmar entrega de e-mail sem envio real; **ou**
   - especificar e implementar fluxo LGPD de cumprimento e evidências que possa ser testado com dados fictícios, **sem apagar automaticamente registros financeiros** e sujeito a revisão legal; **ou**
   - completar relatórios autorizados/queries, paginação, integridade e tratamento de exportações e estados de UI.
4. Adicionar migração numerada nova quando necessária, teste multi-tenant e papel, testes de valores/segurança, UI SSR e Playwright desktop/mobile.
5. Só alterar `IMPLEMENTADA — TESTADA` depois de CI **verde no commit escrito**. Manter documentação e Issue #3 sincronizadas sem criar conclusão fictícia.
6. Não avançar Fase 8/Android antes do momento previsto nem iniciar PSP/Meta live sem gate.

**Resultado mínimo para declarar núcleo de Fase 7 tecnicamente encerrado futuramente:** cada subitem F7 de código implementado com testes específicos e sem bugs críticos de auth/tenant; avaliação de paridade visual; tickets respondidos ou status corretamente documentado; exportações/relatórios consistentes; direitos LGPD com processo revisável; documentação atualizada. **Mesmo então, homologação externa e revisão legal permanecem gates do release.**

## Caminho para produção depois do desenvolvimento

```text
Fase 7 (fechar funcionalidades e testes)
   -> Fase 8 (infraestrutura HTTPS, PG gerenciado, e-mail, backups/restore/PITR,
             PSP sandbox + SaaS PSP test, Meta autorizada, threat model,
             performance, privacidade, fiscal, piloto, rollback)
   -> aprovação expressa separada para cada recurso de dinheiro/envio live
   -> Fase 9 (app Android real, target/API Play compatível, AAB assinado,
             Play internal testing, testes aparelhos, políticas Google Play)
```

Este diagrama **não é autorização automática** de provisionar contas, alterar chaves, publicar, fazer merge ou processar pagamentos. Exige decisão do usuário e verificação das pré-condições.

## Itens que não devem ser elevados artificialmente de status

- **Fase 1:** scripts não significam backup restaurado e Postgres temporário não é staging.
- **Fase 2:** menu e smoke tests não são paridade pixel/funcional completa com o mockup.
- **Fase 3:** adapter e mocks de Asaas não significam Pix real ou homologação Asaas externa.
- **Fase 4/5:** worker one-shot e filas não significam cron/agendamento em produção, nem envio Meta.
- **Fase 6:** invoice draft não é invoice paga, cupom sem resgate não é plano pago ativo.
- **Fase 7:** triagem de ticket não é resposta enviada; pedido LGPD criado não é direito atendido; query de MRR não prova receita live.
- **Fase 8/9:** CI Chromium mobile não é instalação Android real nem autorização Play.

## Referências para retomar cada marco

- [Roadmap Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)
- [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2)
- [Código fixo do HEAD auditado](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0)
- [Fase 7 técnica](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/blob/9c8544730b47059f4f8977bd950e46227784c9c0/docs/FASE_7_ADMIN_RELATORIOS_LGPD.md)

---

# 07 — Evidências, Cobertura, Conflitos, Riscos e Lacunas

**Data de corte:** 21/11/2026. **Metodologia:** fontes em leitura apenas (GitHub via conexão autorizada; busca de arquivos nesta conversa; histórico visível e resumos recuperáveis). **Não** se clonou, compilou localmente, executou banco ou visitou serviços externos durante este handoff. O verificador GitHub Actions já executado por trabalhos anteriores fornece evidência de testes, em ambiente **efêmero**.

## 1. Inventário e classificação de fontes

### ACESSADO — conteúdo efetivamente examinado

| Fonte-ID | Conteúdo efetivo | Base da confirmação |
|---|---|---|
| **E-001** | Mensagens recentes visíveis deste diálogo: pedido de avançar fases, não exigir staging atual, revisão de roadmap e handoff atual | Texto no histórico acessível desta conversa |
| **E-002** | Resumos de contexto anterior, recuperáveis de conversas de 20/11, sobre pedido de auditar CobraFlux e converter mockup em sistema real | Recuperação de histórico pessoal, **não equivalente à transcrição integral** |
| **E-003** | Repositório GitHub, metadados, branches, SHA e árvore recursiva de `9c854473` | [Repository](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas), [commit/tree](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0) |
| **E-004** | PR #2: número, título, branch base/head, estado `draft=true`, `merged=false`, escopo, limitações | [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2) |
| **E-005** | Issue #3: checklist 0–9, decisão sobre hospedagem, registro de execução e bloqueios | [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3) |
| **E-006** | Últimos commits, autores/datas e mudanças semânticas na feature; três commits iniciais da `main` | [Histórico da branch](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commits/feat/production-foundation/) |
| **E-007** | CI de backend/PG e browser para o HEAD, ambas concluídas `success` | [#44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191), [#44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168) |
| **E-008** | Docs originais e atuais: `DOCUMENTACAO_GOLDEN_BILLING.md`, `EXECUCAO_PRODUCAO_FUNDACAO.md`, `FASE_1_*`, dois docs `FASE_2_*`, `FASE_3_*`, `FASE_4_*`, `FASE_5_*`, `FASE_6_*`, `FASE_7_*` | [Pasta docs no HEAD fixo](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0/docs) |
| **E-009** | `package.json`, `.env.example` (**somente nomes de variáveis**), Dockerfile, `playwright.config.ts`, `.github/workflows/production-foundation.yml`, `server/db.ts`, `server/migrate.ts` | [Package](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/blob/9c8544730b47059f4f8977bd950e46227784c9c0/package.json) e arquivos da árvore |
| **E-010** | `server/index.ts`, `operations.ts`, `saas-routes.ts`, `src/App.tsx`, `src/pages/production/ProductionApp.tsx`, `ProductionShell.tsx`, `productionApi.ts` | [Código operacional HEAD](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0/src/pages/production) |
| **E-011** | Migrações com conteúdo efetivamente lido: **001**, **004**, **006**, **007**, **015**, **016**; de **002,003,005,008–014** examinou-se a árvore e descrições no documento correspondente, mas **não necessariamente cada linha SQL** neste handoff | [Pasta de migrações](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0/server/migrations) |
| **E-012** | Testes de integração F1, F6, F7, SSR de menu, Playwright e logs de CI de falhas anteriores e correções | [Arquivos testes](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0/server) |
| **E-013** | Branch Android demo: SHA, árvore com workflow, `mobile/android/README.md`, Gradle e configurações Android (listagem), **não** APK executado | [Branch Android](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/android-webview-demo-debug) |
| **E-014** | Scripts `scripts/backup-db.sh` e `restore-drill.sh`: conteúdo dos shells e guards de destino | [Scripts](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0/scripts) |
| **E-015** | Pesquisa de anexos da conversa por tema CobraFlux/roadmap | Resultado da ferramenta de arquivos: **nenhum arquivo presente nesta conversa** |

**Referências aos commits são identificadores Git reais verificados; nomes E-001…E-015 são etiquetas desta auditoria, não IDs de mensagens nem referências GitHub.**

### REFERENCIADO — conhecido, mas não auditado diretamente como sistema/arquivo operacional

- Arquivos de todas as rotas e testes além dos módulos lidos individualmente; suas **existência na árvore** e descrição nos docs foram observadas, porém esta auditoria **não fez revisão exaustiva linha a linha**.
- Alguns detalhes de arquitetura antiga em `src/pages/professional/*` e `src/pages/admin/AdminView.tsx` vieram do documento Golden Billing e da árvore; não se levantaram todas as ações/posições UI por screenshot.
- Scripts/flags `--once` são descritos nos docs e vistos no `package.json`; não foram executados.
- Histórico anterior de Android APK e suas execuções foi recuperado como resumo e lista de branch/workflow, sem download/inspeção do APK.
- Plano Android boilerplate e “Universal Build” são de contextos **separados**; citados só para evitar mistura.

### INDISPONÍVEL

- Transcrição integral de várias centenas de turnos compactados/omitidos; a IA **não pode certificar que todas as microanotações históricas foram recuperadas**.
- Links/permalinks por mensagem antiga; nenhuma referência individual de mensagem foi inventada.
- Uploads e documentos anexos da conversa: busca retornou **zero**; não há arquivo fornecido atualmente para extração adicional.
- Segredos, painel de hospedagem, conta Resend, Meta WABA, PSP Asaas real/Sandbox e conta PSP SaaS própria; intencionalmente não foram procurados nem solicitados.
- Banco PostgreSQL real e seus registros, jobs de cron, backups, PITR, registros de auditoria de produção e logs de produção.
- APK/AAB executável, testes físicos e Play Console do aplicativo real.

### NÃO VERIFICADO

- Que o sistema esteja implantado em domínio HTTPS e recebendo usuários reais.
- Entrega de e-mails reais, fluxo de recuperação em hospedagem, superadmin provisionado fora da CI.
- Pix Asaas externo, recebimentos live, devoluções bancárias reais, webhook provido por terceiros.
- Qualquer envio WhatsApp real, aprovação Meta e opt-outs em números autorizados.
- Cobrança real de assinatura SaaS, MRR de caixa, regra fiscal aplicada ou NFSe emitida.
- Restore/PITR, retenção e procedimentos legais LGPD concluídos.
- Aceite de todos os detalhes minúsculos das centenas de mensagens históricas que não foram recuperadas.

## 2. Último commit e sequência de evidências de correção

| Identificador | Data UTC | Marco verificado |
|---|---|---|
| `95aba9c27c36` | 13/11/2026 15:22 | HEAD estável da `main`, demo; sem merge da feature |
| `e79c829de377` | 21/11/2026 05:15 | Último commit de núcleo F6, correção SQL fixture de quota |
| `d552e99f7eb1` | 21/11/2026 13:36 | Início F7, migração `016_admin_reporting_privacy.sql` |
| `5f9348ba2295` | 21/11/2026 13:38 | Endpoints administração/reports/LGPD/export |
| `4da9fbcb1c97` | 21/11/2026 13:39 | Teste PostgreSQL multi-tenant de F7 |
| `c6fd0c866967` | 21/11/2026 13:41 | Navegação/UI F7 e testes SSR/Playwright |
| `d84eeaafeb6e` | 21/11/2026 13:43 | Guia F7, correções ainda em curso |
| `79c45622277e` | 21/11/2026 13:44 | Correção de tipo TS num teste de auditoria |
| **`9c8544730b47`** | **21/11/2026 13:45** | **HEAD confirmado; correção de teste CSV/BOM; CI backend e browser `success`** |

No histórico de validação, CI backend de `d84eeaaf` falhou por erro TypeScript em uma asserção de teste; CI de `79c45622` falhou por asserção equivocada de BOM depois do `fetch.text()`; as mudanças seguintes corrigiram esses **testes**. O fato de terem existido falhas intermediárias **não** contradiz a CI verde do HEAD. A auditoria não afirma que essas falhas eram bugs operacionais graves.

## 3. Evidência técnica versus declaração histórica

| Afirmação | Qualificação | Motivo |
|---|---|---|
| Branch feature em `9c854473`; main em `95aba9c`; PR #2 draft | **FATO VERIFICADO — confiança alta** | Branch API, PR e commit consultados diretamente |
| Códigos de auth, tenants, quota, SaaS, F7 disponíveis | **FATO VERIFICADO — confiança alta para existência** | Arquivos no HEAD, amostras inspecionadas |
| Testes backend/PG e Playwright no HEAD passaram | **FATO VERIFICADO — confiança alta no escopo dos workflows** | Execuções específicas `success` |
| Sistema inteiro funciona sem defeitos | **NÃO VERIFICADO** | Testes não cobrem todos os casos e infraestrutura real |
| “Fase 6 concluída” | **DECLARAÇÃO HISTÓRICA, qualificada** | Núcleo de código testado; checkout real permanece pendente |
| “Fase 7 iniciada/testada” | **FATO VERIFICADO** | Migração, APIs, UI, testes e CI com SHA atual |
| “Fases 0–6 publicadas” | **SEM EVIDÊNCIA SUFICIENTE** | Não há deploy comercial demonstrado |
| Staging adiado por decisão do usuário | **DECLARAÇÃO HISTÓRICA sustentada em Issue #3** | Registro explícito de mudança de gate |
| Dados dos clientes reais estão seguros em operação | **NÃO VERIFICADO** | Não existe auditoria de staging, backup ou pentest externo |
| UI inteira tem paridade com a demo | **NÃO VERIFICADO** | Issue #3 deixa essa tarefa aberta |
| MRR e GPV segregados no código | **FATO VERIFICADO, escopo de consulta** | Ledger separado, queries filtram provedores live/sandbox |
| MRR real auditado com gateway externo | **NÃO VERIFICADO** | PSP SaaS da plataforma não integrado |

## 4. Registro de riscos e dívidas técnicas

**Severidade:** crítica = risco de vazamento/dinheiro/publicação; alta = bloqueio funcional; média = limitação de evolução/qualidade; baixa = higiene de código. Um risco não confirmado é explicitamente marcado como **risco**, não bug reproduzido.

| Risco-ID | Severidade | Evidência | Impacto, mitigação e estado |
|---|---|---|---|
| RSK-001 | Crítica para lançamento | F1/F8, issue, scripts | **Sem prova de backup restaurável.** Implantar off-site/PITR, exercitar restore e registrar RPO/RTO; **aberto**. |
| RSK-002 | Crítica para lançamento | F3, F6 | **PSP externo não homologado.** Nenhuma movimentação real autorizada; mocks não garantem API real; **aberto**. |
| RSK-003 | Crítica para lançamento | F5, env flags | **Envio WhatsApp real não homologado.** Meta compliance e opt-in externo, custos, webhook; **aberto**. |
| RSK-004 | Alta | F1, `.env.example` | Envio de confirmação e recuperação sem Resend real; e-mail de convite indisponível; **aberto**. |
| RSK-005 | Alta | docs F2, issue | **Paridade UI/UX com mockup incompleta.** Testar telas/inputs/responsividade, sem copiar simulações; **aberto**. |
| RSK-006 | Alta | código F7, docs F7 | **Solicitação LGPD não equivale cumprimento.** Revisão legal de exclusão, portabilidade, correção, retenção e prova; **aberto**. |
| RSK-007 | Média/alta | `phase7-routes.ts` | **MRR/GPV dependem de origem financeira verificada.** Não extrapolar para contabilidade real sem PSP/ciclos; **aberto como homologação**. |
| RSK-008 | Média/alta | F7, `support_ticket_events` | **Triagem de tickets não envia respostas.** Serviço de comunicação/SLA não concluído; **aberto**. |
| RSK-009 | Alta (inferência) | Alteração de status F7 e workers | **Corrida de worker ao suspender tenant não testada em ambiente real.** Não afirmar bug; propor testes de concorrência e travas se necessárias; **recomendação da auditoria**. |
| RSK-010 | Alta (inferência) | `audit_logs`, trigger 016 | **Retenção/auditoria append-only pode conflitar com obrigações de privacidade sem governança.** Política de logs, criptografia/retenção, acesso DBA e minimização; **recomendação**. |
| RSK-011 | Média | `phase7-routes.ts` | CSV limitado a 1000 registros por arquivo, sem portabilidade LGPD integral; benchmark de volume ausente; **aberto**. |
| RSK-012 | Média | docs Golden Billing + `src/App.tsx` | Estratégia arquitetural histórica diverge do código implementado; risco de nova IA refatorar o caminho errado; **mitigado pelo ADR-004**. |
| RSK-013 | Média | `package.json` e árvore | Metadados `react-example`, README ausente; documentação operacional pode ficar pouco descobrível; **refinamento não aprovado**. |
| RSK-014 | Alta pré-release | Issue F9, branch Android | **Android de produção não existe comprovadamente.** API 36+, AAB release e Play ainda pendentes; **aberto**. |
| RSK-015 | Alta pré-release | F8 | Sem carga, threat model externo, pentest, alertas, piloto, rollback demonstrado; **aberto**. |
| RSK-016 | Média | Playwright Chromium | Emulação mobile não comprova comportamento WebView/MIUI/One UI, nem acessibilidade integral; **aberto**. |
| RSK-017 | Alta operacional | CLIs `--once`, nenhuma hospedagem | Workers de reconciliação/recorrência/Meta/SaaS não têm cron real/monitoramento; automações não estão entregues operacionalmente; **aberto**. |
| RSK-018 | Média | `015_saas_billing.sql`, docs F6 | Preços/limites de planos pagos e contrato de desconto/reembolso não foram aprovados comercialmente; **indefinido**. |

## 5. Contradições históricas e solução adotada

| Conflito | Evidências | Reconciliação sem inventar decisão |
|---|---|---|
| Gate F1 antes da F2 versus avanço para F7 sem staging | Doc F1 antigo; declaração do usuário; Issue #3 | Substituído explicitamente: desenvolvimento avança com CI, homologação real obrigatória pré-release. |
| `httpApiService` e `VITE_USE_REAL_API` no doc Golden Billing versus `ProductionApp` isolado no HEAD | Docs demo; `src/App.tsx` | Código atual demonstra implementação diferente; autorização técnica exata não recuperada, não reverter automaticamente. |
| “Fase 6 concluída” versus F6 PSP SaaS ainda pendente | Mensagens anteriores; Issue #3 | Interpretar como núcleo de desenvolvimento testado, não ciclo comercial finalizado. |
| Documentos F2/F3 antigos dizem que fases 4–7 não existem | Docs antigas versus migrações 011–016 e código novo | Histórico da época permanece válido; **HEAD e Issue atual** prevalecem para estado presente. |
| Android APK já teve build mas F9 não começou | Resumo de conversa anterior; árvore branch Android; Issue F9 | Build **demonstrativo**, diferente de app operacional real para Play. |
| Nome Golden Billing em docs versus CobraFlux no repositório/fluxo atual | Doc inicial e `main`; nome repositório/PR | Nome vigente CobraFlux; não inferir data exata do rebranding nem apagar histórico do produto. |
| Planos Free/Starter/Business com códigos mas preço desconhecido | Migração 015 e F6 docs | Catálogo implementado, **sem aprovação de preço nem checkout real**. |

## 6. Auditoria de completude cruzada

Este pacote executou **duas passagens documentais** com bases distintas: (1) mensagens/contexto recuperável + Issue/PR/roadmap; (2) HEAD Git, migrações/rotas testadas/CI, comparados à matriz e backlog. O alcance é qualificado abaixo:

- **Identidade/objetivos/arquitetura:** documentados em `00`, `01`, `03`, `05` com fontes diretas.
- **Requisitos extraídos:** 119 registros REQ, identificáveis em Issue/docs/código. Número é inventário **do que se localizou**, não quantidade de pedidos históricos integrais.
- **Backlog:** 38 itens BL agrupados A–F; itens já validados não geram tarefas duplicadas; dependências repetidas aparecem por referência cruzada.
- **Decisões:** 24 ADRs; conflitos antigos/substituídos registrados sem reativar propostas antigas.
- **Marcos:** fases 0–9 com status de execução, CI e homologação separados.
- **Fontes não revisadas integralmente:** centenas de turnos compactados e grande parte de código secundário, logs de produção, todos os anexos (nenhum montável) e providers externos.
- **Lacuna inevitável:** não existe evidência para afirmar que **todas** as solicitações pequenas mencionadas no histórico completo foram recuperadas. A próxima IA deve reconciliar novos documentos/mensagens quando surgirem.
- **Segredos:** nenhum token, senha, chave de API ou seed de TOTP foi incluído neste pacote; apenas nomes de variáveis.
- **Status conservador:** nenhuma fase `PUBLICADA — VALIDADA` foi marcada; “testado” limita-se ao escopo GitHub Actions identificado.

## 7. Checklist de verificações posteriores (apenas quando autorizadas)

1. GitHub: conferir HEAD da branch, PR/Issue, workflow CI e comparativo diff contra este snapshot.
2. Código: conferir todas as rotas/listagens e migrações 002/003/005/008–014 linha a linha para revisão de contrato; complementar matriz se surgirem novos fatos.
3. UI: comparar demo vs produção por módulo, estados e acessibilidade; gerar screenshots reais somente quando navegador/ambiente disponível.
4. Infra: quando houver staging, configurar segredos, HTTPS, PostgreSQL, entrega de e-mail, MFA do admin e backups off-site com restore real e logs minimizados.
5. PSP/WhatsApp: executar testes autorizados com contas/test numbers oficiais e transações estritamente sandbox, rastrear eventos/devoluções/webhooks.
6. Direito/finanças: validar LGPD, tarifa contratual, MRR/GPV, pagamentos da plataforma, impostos, NFSe e política de retenção.
7. Android: verificar branch demo e build real, WebView, API target, AAB assinado e testes físicos.

**Proibido executar os itens acima durante a presente auditoria.** Eles integram documentação de continuidade e checklist de futuras autorizações.

---

# 08 — Protocolo de Retomada para Nova IA / Agente de Desenvolvimento

**Propósito:** permitir continuidade segura sem depender da memória da conversa antiga. **Documento normativo de processo**, condicionado ao escopo aceito pelo usuário, não é autorização para deploy, merge, cobrança live ou exclusão de dados.

## 0. Primeiro contato com o pacote

1. Ler `00-LEIA-PRIMEIRO.md` por inteiro.
2. Ler `01-HANDOFF-MESTRE.md` e `03-REGISTRO-DE-DECISOES.md`, especialmente ADR-002, ADR-003, ADR-004, ADR-010, ADR-015, ADR-018 e ADR-020.
3. Abrir `02-MATRIZ-DE-REQUISITOS.md` e observar que **decisão, implementação e qualidade de evidência são campos independentes**.
4. Ler `04-BACKLOG-CONSOLIDADO.md` **antes** de escolher uma tarefa; itens F são propostas/indefinidos, **não** instruções de implementar.
5. Ler `05-ARQUITETURA-E-ESTADO-TECNICO.md`, `06-ROADMAP-E-MARCOS.md` e `07-EVIDENCIAS-E-LACUNAS.md`. Os documentos `docs/` da branch são fontes adicionais, não substitutos do estado Git atual.

## 1. Verificação obrigatória antes de qualquer alteração

**Repositório:** `https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas`.

1. Consultar repositório remoto real com conector GitHub autorizado (ou `git` em clone autorizado). Não adivinhar HEAD.
2. Identificar `main` e **branch de trabalho autorizada** `feat/production-foundation`.
3. Registrar HEAD de cada uma, SHA da PR #2, estado draft/merge e data de commit.
4. Conferir Issue #3: checklist, alterações posteriores, dependências e eventuais novas decisões expressas.
5. Conferir status dos **workflows vinculados ao HEAD atual** (não de commit antigo). O snapshot do handoff é `9c854473` (21/11), mas pode ter avançado.
6. Para cada arquivo que será editado, **ler conteúdo atual**; não copiar cegamente os exemplos deste pacote nem reconstruir código apenas pelo resumo.
7. Se informações atuais divergirem do snapshot, registrar **diferença e evidência**, preservar o que foi deliberado posteriormente e atualizar os docs.
8. Não interpretar alteração de `main` por terceiros como autorização para atuar nela.

**Somente comandos de leitura recomendados** (quando houver clone e permissão; não executar como parte do handoff):

```bash
git remote -v
git status --short --branch
git fetch origin
git rev-parse origin/main
git rev-parse origin/feat/production-foundation
git log -n 15 --oneline origin/feat/production-foundation
git diff --stat origin/main..origin/feat/production-foundation
```

Após confirmar branch, extensão da tarefa e permissão de edição, usar `git switch feat/production-foundation`. **Não** `git switch main` para implementar, `git push main`, `git merge`, `git reset --hard`, `git branch -D`, `npm run migrate` em DB de usuário ou deploy sem autorização.

## 2. Estado inicial que o novo agente deve esperar — sujeito a rechecagem

- `main` `95aba9c27c363c8b24c2f34c65a28c2f3b011b3b`;
- `feat/production-foundation` `9c8544730b47059f4f8977bd950e46227784c9c0`;
- PR #2 `draft=true`, não mesclada; Issue #3 roadmap;
- backend Express/TS/PostgreSQL migrações 001–016;
- último incremento novo: **Fase 7 admin/relatórios, primeira entrega com CI verde**;
- backend CI [#44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191), browser [#44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168);
- `main` intacta; integração financeira live e Meta envio real desativados;
- hospedagem HTTPS, prova real de backup/restauração, Resend externo, PSP Asaas Sandbox, PSP SaaS, Meta e Android release **não homologados**.

Uma falha de CI em commit novo deve ser reportada e corrigida; não repetir «tudo verde» a partir do SHA antigo.

## 3. Definição precisa da próxima tarefa

**Fase corrente aprovada para desenvolvimento:** **Fase 7 — Administração e Relatórios**.

**Marco seguinte recomendado:** fechar um bloco funcional incompleto da F7, precedido de auditoria de equivalência com o demo, com cobertura específica de autorização e persistência. Sequência sugerida:

1. Auditar `src/pages/admin/AdminView.tsx` e `src/pages/professional/ReportsView.tsx` (demo) contra `AdminOperationsView.tsx` e `ReportsOperationsView.tsx` (real). A transição para `ProductionApp` e `productionApi` é a arquitetura vigente; não transferir armazenamento IndexedDB para dados reais.
2. Inspecionar `server/phase7-routes.ts`, migração `016_admin_reporting_privacy.sql`, `server/phase7.integration.test.ts`, `ProductionShell`, `productionApi.ts` e a doc F7.
3. Selecionar tarefa **já aprovada no roadmap**: suporte com respostas e histórico; processamento auditável das solicitações LGPD **com revisão legal**; filtros/exportações/relatórios com integridade; ou refinamento de UI/paridade. Escolher com base no impacto e dependências, não por preferência arbitrária.
4. Descrever aceitação antes de editar, mapear risco cross-tenant, role owner/operator/admin, CSRF, idempotência, privacidade e erro de rede.
5. Implementar **somente na feature branch**; adicionar migração incremental em vez de alterar silenciosamente migrações já aplicadas.
6. Criar/revisar testes e validar no CI; atualizar status apenas quando houver evidência do commit correspondente.
7. Registrar o que ficou fora do escopo (PSP/Meta, hosting, atendimento jurídico real etc.) e o próximo marco.

**Nunca supor que o usuário aprovou:** fornecedor PSP SaaS, preços Starter/Business, contratação de hosting, credenciais, eliminação de dados, emissão fiscal, envio de e-mail real, publicação Play ou liberação financeira. Esses itens exigem decisão/condição própria.

## 4. Checklist técnico para cada incremento de código

### Antes

- [ ] HEAD/branch/PR/Issue verificados com referência.
- [ ] Arquivos e testes existentes lidos; não duplicar implementações.
- [ ] REQ/BL/ADR relevantes selecionados, decisão `APROVADA`.
- [ ] Dados pessoais, estado financeiro e superfície de autorização inventariados.
- [ ] Infraestrutura externa necessária separada da lógica implementável com mocks.

### Durante

- [ ] Validação Zod de todo input não confiável.
- [ ] Organization ID derivado de sessão/autorização, e não aceito como autoridade via body.
- [ ] MFA e RBAC no servidor; CSRF em rotas mutáveis.
- [ ] SQL parametrizado, transações e locks quando há limite/idempotência.
- [ ] PII minimizada nas respostas, eventos, logs e exportações; segredos jamais expostos.
- [ ] Dinheiro: centavos inteiros, nenhum status `paid` por clique/admin manual sem PSP verificado.
- [ ] Promoção/precificação SaaS não credita acesso a partir de draft/checkout não confirmado.
- [ ] Em caso de rede incerta com PSP/Meta, não repetir POST automaticamente.
- [ ] Fila de WhatsApp não usa checkbox legado como prova de consentimento.
- [ ] UI responsiva, estados loading/empty/error, navegação role-based e acessibilidade básica.

### Depois

- [ ] `npm run lint` (TypeScript).
- [ ] `npm run test:server`, `npm run test:domain`, `npm run test:ui`.
- [ ] Migrations aplicadas **duas vezes** em PostgreSQL isolado, sem tocar DB externo.
- [ ] `npm run test:integration` com testes multi-tenant, 403/404 de acesso indevido, CSRF.
- [ ] `npm run build` e `VITE_APP_MODE=production npm run build`.
- [ ] `npm run test:e2e` em Chromium desktop/mobile quando UI afetada.
- [ ] GitHub Actions verde no **novo** commit/branch; se falhar, não declarar concluído.
- [ ] PR #2 continua draft; Issue #3 e docs atualizados com o que está tecnicamente comprovado.
- [ ] Nenhum merge, release ou provisionamento sem autorização específica.

**Exceção:** falta de hospedagem/credenciais não autoriza omitir testes de código; os testes externos passam ao checklist de **homologação pendente**, não `pass`.

## 5. Política de evidência e comunicação

Para cada entrega registrar:

```text
Escopo/REQ/BL:
Branch e SHA base:
Arquivos lidos:
Mudanças feitas (arquivos + commit):
Teste executado e URL/ID do job:
Decisão aprovada? (origem):
Implementação: NÃO INICIADA | PLANEJADA | EM DESENVOLVIMENTO |
  IMPLEMENTADA — NÃO VALIDADA | IMPLEMENTADA — TESTADA | ...
Homologação externa: PENDENTE | VALIDADA (citar evidência)
Faltantes e riscos:
Próxima ação permitida:
Estado da main e PR:
```

Uma afirmação da IA de que «concluiu» é **declaração**, não substitui SHA+diff/teste. Não declarar «publicado» sem implantação observada. Não copiar tokens de log para Markdown; citar IDs de job e resumo de erros redigido.

## 6. Atualização incremental obrigatória do handoff

- **Nova solicitação:** criar `REQ-120+` ou próximo ID livre na `02`, preservando número da anotação **original** se existir; preencher origem, decisão, execução, evidência, aceite e dependências.
- **Nova decisão:** criar `ADR-025+` na `03`, com alternativas *apenas se documentadas*, status e regra anterior substituída explicitamente. Não apagar ADR antigo.
- **Novo trabalho aprovado ainda aberto:** criar `BL-039+` no `04`, vinculando REQ/ADR; evitar duplicação de backlog.
- **Novo commit/CI:** atualizar `05` e `06` com SHA, data, arquivos, teste no commit correspondente e gate externo; atualizar `07` com fonte permanente.
- **Nova evidência de homologação:** atualizar status operacional somente quando houver referência a teste real, ambiente, responsável e resultado (sem segredos).
- **Mudança de escopo:** preservar histórico/contradição, apontar decisão mais recente, não reativar itens cancelados.
- **Novo handoff:** reconciliar mudanças incrementais com este pacote antes de reescrever, mantendo trilha de origem.

Os identificadores futuros acima valem **se nenhum outro agente já tiver ocupado esses números**; consultar o documento atual e escolher próximo livre. Não converter automaticamente o snapshot em verdade permanente.

## 7. Quando parar e pedir informação

Pedir somente o indispensável quando o fluxo *não possa ser executado com segurança* (ex.: contratação de PSP, conta Meta, pagamento real, merge/main, deploy, eliminação legal de dados, preço comercial e consentimento). Para dúvidas não bloqueantes, registrar hipótese e seguir apenas com implementação permitida pelo roadmap; **nunca preencher preço/credenciais ou fornecedor por suposição**.

Ao usuário, relatar conclusão técnica resumida e rastreável; a preferência de acompanhar o desenvolvimento com pouco feedback não permite prometer processamento em background, nem ocultar problemas de segurança/limitações.

## 8. Rotas de documentação e referências

- [`docs/EXECUCAO_PRODUCAO_FUNDACAO.md`](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/blob/9c8544730b47059f4f8977bd950e46227784c9c0/docs/EXECUCAO_PRODUCAO_FUNDACAO.md)
- [`docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/blob/9c8544730b47059f4f8977bd950e46227784c9c0/docs/FASE_7_ADMIN_RELATORIOS_LGPD.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)
- [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2)
- [CI backend HEAD](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191)
- [CI browser HEAD](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168)

**Resumo operacional:** preservar `main`; validar HEAD/CI; continuar Fase 7; não executar operações externas não homologadas; documentar evidência e atualizar pacote.

---

# 09 — PROMPT AUTÔNOMO DE RETOMADA DO COBRAFLUX

> **Finalidade:** copiar integralmente o texto abaixo para outra conversa ou agente de desenvolvimento **junto com os documentos `00` a `08`**. Não é substituto dos anexos do pacote. A nova IA **não precisa acessar a conversa original** para entender o estado histórico conhecido, mas deverá confirmar o estado atual remoto antes de qualquer mudança.

---

## PROMPT PARA A NOVA IA (copiar a partir daqui)

Você é meu **Principal Software Architect, Senior Full Stack Engineer, especialista em segurança SaaS multi-tenant, PostgreSQL, React/TypeScript, pagamentos, mensageria e gestão de continuidade técnica**.

Sua missão é **retomar o desenvolvimento do projeto CobraFlux — Sistema de Cobranças**, preservar integralmente o conhecimento de origem e continuar **somente as tarefas previamente aprovadas**, com verificação do código e dos testes, sem redefinir decisões por preferência própria.

### 1. O projeto

Repositório: `https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas`.

O CobraFlux é um SaaS de gestão de clientes, serviços, cobranças Pix, recorrências, mensagens WhatsApp, planos da própria plataforma, relatórios e administração para profissionais autônomos e prestadores de serviços brasileiros. Deriva de um mockup **Golden Billing SaaS** em React/TypeScript/IndexedDB com transações fictícias. O desenvolvimento preserva o demo e adiciona **modo operacional** usando React 19/Vite/TypeScript, backend Express/TypeScript e PostgreSQL 16+ com 16 migrações numeradas no snapshot inicial, autenticação real, controle de tenant e workers seguros de execução pontual.

**Não confunda** simulação no navegador/IndexedDB, Pix do **Asaas Sandbox**, dinheiro dos profissionais e assinatura SaaS paga à plataforma. Nenhum pagamento ou envio WhatsApp real foi homologado no último snapshot conhecido.

### 2. Arquivos de conhecimento obrigatórios

Receberá um ZIP ou arquivos Markdown separados. Leia nesta ordem:

1. `00-LEIA-PRIMEIRO.md` — resumo executivo, estado do repositório e restrições.
2. `01-HANDOFF-MESTRE.md` — história, produto, arquitetura e contexto.
3. `03-REGISTRO-DE-DECISOES.md` — decisões atuais, substituídas e conflitos.
4. `02-MATRIZ-DE-REQUISITOS.md` — 119 registros com decisão/implementação/validação separados.
5. `04-BACKLOG-CONSOLIDADO.md` — 38 itens pendentes por prioridade/autorizações.
6. `05-ARQUITETURA-E-ESTADO-TECNICO.md` — stack, API, banco, scripts e qualidade.
7. `06-ROADMAP-E-MARCOS.md` — fases 0–9 e dependências.
8. `07-EVIDENCIAS-E-LACUNAS.md` — evidências, riscos, limites de cobertura.
9. `08-PROTOCOLO-DE-RETOMADA.md` — procedimento de retomada e atualização incremental.

O pacote foi criado em **21/11/2026** com base no que pôde ser efetivamente consultado; partes antigas da conversa estavam compactadas e nem todos os arquivos de código foram examinados linha por linha. Portanto, **não trate o pacote como prova de cobertura histórica absoluta**. Não invente mensagens, aprovações, erros ou resultados.

### 3. Estado Git no último snapshot VERIFICADO (pode ter mudado)

- `main` em `95aba9c27c363c8b24c2f34c65a28c2f3b011b3b`, preservada.
- **Única branch de trabalho autorizada:** `feat/production-foundation`, HEAD `9c8544730b47059f4f8977bd950e46227784c9c0`.
- [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2) em **draft**, **sem merge**.
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3) contém roadmap.
- Última CI confirmada, no SHA acima: [backend/PG `success` #44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191), [Playwright Chromium `success` #44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168).
- Branch `android-webview-demo-debug` existe, mas é de demo e não o release Android real.

**Antes de editar qualquer arquivo:** use conector GitHub ou ferramentas Git autorizadas para confirmar os três estados atuais (HEAD, PR, Issue), ler os arquivos e ver a CI vinculada ao commit atual. Se mudou, reconcilie diferenças. Não confiar em SHA desatualizado nem presumir que `main` contém as features.

### 4. Último marco e a fase autorizada para continuar

**Último núcleo de fase declarado tecnicamente concluído:** **Fase 6 — monetização SaaS**, com plano Free/Starter/Business, quotas, ledger financeiro separado, invoice `draft`, descontos/cotações e manutenção de inadimplência; **checkout/PSP SaaS real e confirmação de pagamento ainda não existem**, logo Fase 6 não está comercialmente concluída.

**Fase atual:** **Fase 7 — Administração e Relatórios**, **iniciada e com primeiro incremento tecnicamente testado** no commit `9c854473`: endpoints globais limitados a `super_admin` MFA, listagem/suspensão/reativação de organização, revogação de sessões, bloqueio de WhatsApp pendente, triagem de tickets, registro/revisão LGPD, indicadores MRR ≠ GPV, CSV auditado e UI admin/reports desktop/mobile.

**O que continua pendente na Fase 7:** atendimento de suporte com respostas reais/histórico/SLA; fluxo integral de direitos LGPD com evidência e revisão jurídica, sem eliminação financeira automática; relatórios/exports completos e paridade UI; governança/observabilidade, revisão de segurança e métricas com PSP real. A Fase 7 **não deve ser anunciada como encerrada**.

**Próxima ação autorizada por este histórico:** continuar a **Fase 7 em código**, sem contratar hospedagem nem ativar pagamentos ou envio externo. Comece por confrontar `src/pages/admin/AdminView.tsx`/`src/pages/professional/ReportsView.tsx` (demo) com as telas `AdminOperationsView.tsx`/`ReportsOperationsView.tsx` (reais) e a API `server/phase7-routes.ts`. Identifique lacunas aprovadas no backlog, escolha e implemente o próximo incremento concreto, com testes. Se há recurso aprovado não implementado, **não repita funcionalidade já concluída**. Se a tarefa exige decisão legal/comercial ou infraestrutura, documente o bloqueio e implemente apenas a parte segura já autorizada.

### 5. Restrições absolutas

- **Nunca alterar `main`**, fazer merge da PR draft, push de release ou deploy sem autorização expressa.
- **Nunca** marcar cobrança `paid` por ação do navegador; apenas PSP autenticado e conciliação real podem confirmar dinheiro. Asaas continua **Sandbox** até homologação e autorização específica de go-live.
- **Nunca** usar valores de IndexedDB/demo, QR ilustrativo ou webhooks mockados como receitas reais.
- **Separar SaaS platform invoices (`saas_invoices`) de merchant charges (`charges`), MRR de GPV e Sandbox de live.** Invoice `draft` não ativa Premium.
- **Nunca** permitir `organization_id` arbitrário como fonte de permissão: tenant deve vir da sessão e das memberships; aplicar RBAC e CSRF no backend.
- Proteger credenciais de PSP, Meta, DB, MFA e e-mail somente no servidor; **não expor segredos em conversas, logs, frontend, código ou PR**.
- WhatsApp **somente Meta Cloud API oficial**, opt-in versionado/documentado; checkbox legado não equivale consentimento, STOP/PARAR revoga. Sem reenvio cego de mensagens com resultado desconhecido.
- Recorrências geram **apenas drafts**, sem Pix nem envio automático. Workers usam flags default OFF e execução pontual.
- Exclusão/portabilidade LGPD requer processo humano e retenção legal; **não apagar automaticamente registros financeiros** por pedido.
- A pessoa responsável ainda não dispunha de hosting: **desenvolvimento em código e CI podem avançar**, mas HTTPS, email real, backup/restauração, PSP/Meta externos e Android físico são gates de homologação pré-lançamento, não requisitos dispensados.
- Não importar demandas de projetos separados (Bitdeer, LinkFree, FreePremium, Universal Build) para CobraFlux.

### 6. Ambiente e teste — conhecer, não executar desnecessariamente

- `npm install --no-package-lock`, `npm run migrate`, `npm run lint`, `npm run test:domain`, `npm run test:server`, `npm run test:ui`, `npm run test:integration`, `npm run test:e2e`.
- `VITE_APP_MODE=production npm run build` e `npm run server` para operação, `npm run build` para demo isolada.
- PostgreSQL/segredos necessários: observar `.env.example`, sem copiar valores sensíveis. `Dockerfile` não executa migrações automaticamente.
- CI usa PostgreSQL 16 temporário, Node 22 e Playwright Chromium desktop/mobile; verificar **CI verde do novo commit**. O sucesso de CI **não** equivale a staging, PSP, Meta ou Android físico.
- Backup/restore e workers são procedimentos de operação; **NÃO EXECUTAR sem infraestrutura e autorização apropriadas**.

### 7. Protocolo de execução e documentação

1. Inventariar solicitação aprovada e o código correspondente; registrar a lacuna e critérios de aceitação.
2. Implementar no menor escopo seguro, com testes unitários, integração Postgres multi-tenant, CSRF/RBAC, UI desktop/mobile se houver interface.
3. Fazer commits **somente** na branch autorizada, manter PR draft e `main` intacta.
4. Aguardar/verificar CI do SHA exato; corrigir erros antes de declarar implementação testada.
5. Atualizar `docs/FASE_7_ADMIN_RELATORIOS_LGPD.md`, Issue #3, PR #2 e os registros do handoff incrementalmente: REQ, ADR, backlog, roadmap e evidências.
6. Informar resultados e pendências claramente; sem prometer trabalho posterior assíncrono, sem esconder falhas ou depender de suposições.
7. Não iniciar a Fase 8 ou Fase 9 por conta própria quando a Fase 7 ainda não foi concluída no escopo técnico.

### 8. Como lidar com decisões faltantes

Se for necessária escolha de **PSP SaaS, preço pago, hosting, apagamento legal, cobrança real, e-mail real, credenciais, publicação Play ou merge**, não assuma nem invente. Registrar como **INDEFINIDA ou BLOQUEADA** e só pedir autorização quando isso for indispensável para o trabalho selecionado. Para lacunas não bloqueantes, continuar com o código autorizado e deixar claras as limitações.

### 9. Primeira resposta esperada da nova IA

Depois de ler os anexos e verificar o GitHub, informe objetivamente: **branch+HEAD atual, última CI, fase atual, próxima tarefa F7 já aprovada, arquivos existentes a reutilizar e riscos**. Em seguida execute o incremento de desenvolvimento autorizado, quando as ferramentas e permissões estiverem disponíveis, sem reconfirmar decisões históricas claras. Se não houver acesso ao GitHub, **não alegue implementação**, documente a restrição e produza um plano verificável sem alterar arquivos arbitrários.

**Compromisso central:** fidelidade de continuidade, rastreabilidade, desenvolvimento por evidência e separação rígida entre código, CI, homologação e publicação.

## FIM DO PROMPT

---

**Nota para o responsável:** este prompt contém o estado **no corte de 21/11/2026**. Forneça junto todo o pacote `.md` ou ZIP; o novo agente deverá confirmar os SHAs e atualizar as referências após cada incremento. O protocolo **não autoriza implementação durante a auditoria documental que o produziu**.
