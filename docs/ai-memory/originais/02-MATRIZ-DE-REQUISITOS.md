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
