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
