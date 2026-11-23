# 01 — Estado atual e ponto exato de retomada

**Atualizado em:** 23/11/2026, após F7 incremento nº 10 validado, com auditoria dos gates de encerramento. **Snapshot documental**, não serviço de telemetria. Os **12 arquivos originais do handoff** já estão preservados com hash exato em [originais/](originais/), sem depender do chat.

| Item | Última evidência |
| --- | --- |
| Repositório | https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas |
| Branch permitida | feat/production-foundation |
| **Último commit de código validado** | [1c16c6ad0798b6c77543679738e2a57fb9e831ea](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/1c16c6ad0798b6c77543679738e2a57fb9e831ea) |
| Base main verificada | 95aba9c27c363c8b24c2f34c65a28c2f3b011b3b — não alterada por esses incrementos |
| PR #2 | Aberta, em draft, não mesclada no último exame |
| Fase atual | **7 — Administração e Relatórios** |
| Último incremento concluído tecnicamente | Fase 7 nº 10: CSV vinculado a pedido LGPD auditável; incrementos 1–9 preservados |
| Backend/integração/migrações | [CI #45184992979](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184992979) — success no commit 1c16c6ad |
| Browser desktop/mobile | [CI #45184993002](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184993002) — success no commit 1c16c6ad |
| Release/merge/deploy | **Nenhum** |
| PSP live/Meta live | **Não habilitados nem homologados** |
| Próximo marco | F7 AINDA ABERTA: revisão LGPD, SLA/notificações/anexos, exportação consistente, acessibilidade e homologação; ver matriz de gates |

**Atenção:** commits posteriores podem alterar só documentação e mudar o HEAD; isso não apaga o SHA do último **incremento de código** com CI verde. O próximo agente precisa verificar ambos.

## Novas entregas técnicas F7 #08–10 (23/11/2026)
- #08: índices compostos e benchmark sintético 100k clientes/100k cobranças, [CI #45183457088](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45183457088) verde; não é medição de produção.
- #09: histórico LGPD append-only e notas internas ocultas ao owner, [49d134a5](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/49d134a5e76d6697c5b0138d6efa537cd225281b), [CI #45184164223](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184164223) / [CI #45184164450](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184164450) verdes.
- #10: vinculação de pedido LGPD access/portability ao CSV por cursor, sem cumprimento legal presumido, [1c16c6ad](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/1c16c6ad0798b6c77543679738e2a57fb9e831ea), [CI #45184992979](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184992979) / [CI #45184993002](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184993002) / [CI #45184992978](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184992978) verdes.
- **F7 NÃO encerrada; F8 NÃO iniciada.** [Matriz de gates](fases/07-gates-de-encerramento-2026-11-23.md).

## Entrega anterior — incremento F7 #7

- Exportação adicional por cursor HMAC assinado, vinculado ao tenant, dataset e filtro, com 30 minutos de validade e sem limite de offset, mantendo a exportação anterior compatível.
- Paginação por `(created_at,id)` preservando microssegundos do PostgreSQL e corte temporal inicial; UI de lotes com navegação e download individual.
- CI: [backend #44935128670](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128670), [Chromium #44935128826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128826) e [memória #44935128710](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128710) aprovados no commit e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2.
- **Falha histórica:** no commit 2c94972 um teste da rota usou GET em vez de POST e falhou; corrigido em e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2.
- **Limite:** não é snapshot de dados durante edições/exclusões, ainda há rate limit de 12 arquivos/hora, e testes de carga grandes não foram realizados. Fase 7 continua aberta.

## Incremento anterior — F7 #6

- Exportação CSV de clientes/cobranças com filtro por status e navegação manual de páginas de 100/250/1000 registros.
- Prévia **somente de contagem** por organização, sem dados pessoais; proteção por papel, sessão, CSRF no download, rate limit, sanitização CSV e auditoria.
- CI: [backend #44930963112](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963112), [Chromium #44930963010](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963010) e [memória #44930963018](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963018) com **success** no código a157e6f832f5180f7824d3836394b6fabbde5677.
- Limitação: paginação por offset (0–100000), não é snapshot consistente; ainda faltam keyset, testes de grandes volumes e melhorias dos relatórios. **F7 permanece aberta.**

## Incremento anterior — F7 #5
- Migração **019**: revisão crescente do prazo e ciência auditável/imodificável por versão do SLA.
- Alertas de atraso aparecem quando o superadministrador **consulta o painel**; não há background job nem notificações externas.
- Ciência interna exige MFA/CSRF, motivo válido, registra autoria, impede duplicatas e é invalidada para a revisão corrente quando o prazo muda.
- CI: [backend/PostgreSQL #44928047228](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047228), [Chromium #44928047306](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047306), [memória #44928047281](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047281), todos **success** no commit 42f7eecf6aa5ee25adb3d135930d73befbeaa6b8.
- **Não concluído:** políticas comerciais de SLA, alerta assíncrono, e-mail/WhatsApp, anexos, LGPD legal e homologação externa. Fase 7 permanece em desenvolvimento.

## Entrega anterior — incremento F7 #4
- Migração **018**: prazo de atendimento opcional com histórico imutável e justificativa.
- Administração (MFA/CSRF) define/remove prazo, filtra vencidos/sem prazo e visualiza auditoria. Ausência de prazo NÃO é SLA cumprido.
- Backend [#44922044208](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044208), navegador [#44922044209](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044209) e integridade [#44922044232](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044232) aprovados no código 472b0bd84885e1463c5c5b660bb800bf498994d8.
- **Não há SLA automático, política comercial, alertas, envio de e-mail/Meta nem deploy. F7 aberta.**

## Entrega anterior — incremento F7 #3
- API de histórico de mudanças de estado: GET /api/admin/support/tickets/:id/events, somente super_admin com MFA, paginação Zod, campos minimizados e no-store.
- Interface administrativa exibe ator, mudança de status, data e justificativa, separados das respostas visíveis ao profissional.
- Testes negativos de 401, 403, 404, 400 e paginação/privacidade; CI backend #44920626498 e navegador #44920626428 verdes no commit 96e58848cb696489560fa14fcbceaf19357d2566.
- Não envia e-mail, WhatsApp ou notificações. **Fase 7 não concluída**.

## O que a entrega anterior adicionou — incremento F7 #2
- Migração **017_support_portal_replies.sql**: respostas vinculadas a ticket/organização/ator, índice, histórico somente acréscimo e chave de idempotência por chamado.
- Rotas de superadmin MFA + CSRF para criar resposta, rotas admin e tenant para visualizar histórico, sem permitir acesso entre organizações.
- Interfaces **AdminOperationsView** e **AccountOperationsView** com mensagens no painel autenticado.
- Integração testada para RBAC, CSRF, acesso cross-tenant, repetição de chave, ticket público não autenticado e ticket encerrado.
- **Não** envia e-mail, WhatsApp ou confirma recebimento/leitura; **delivery_state=portal_only**.
- Documentação técnica em **docs/FASE_7_ADMIN_RELATORIOS_LGPD.md**, Issue #3 atualizada.

## Não esquecer
- O núcleo da Fase 6 está tecnicamente implementado, mas **não há checkout financeiro live do SaaS**, aprovação comercial, tributação ou cobrança homologada.
- O núcleo da Fase 7 está **incompleto**, apesar de dez incrementos de código testados.
- Homologação externa foi **adiada para antes do lançamento**, não dispensada; existem dívidas de Fases 0–7.
- A base de conhecimento não substitui revisões de código, segurança, política legal nem licença para mexer na main.

**Estado machine-readable:** [estado.json](estado.json). **Verificações:** [06-EVIDENCIAS.md](06-EVIDENCIAS.md).
