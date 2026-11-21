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
