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
