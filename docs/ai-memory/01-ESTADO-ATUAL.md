# 01 — Estado atual e ponto exato de retomada

**Atualizado em:** 21/11/2026, após implementação e validação do incremento de suporte da Fase 7. **Snapshot documental**, não serviço de telemetria. Os **12 arquivos originais do handoff** já estão preservados com hash exato em [originais/](originais/), sem depender do chat.

| Item | Última evidência |
| --- | --- |
| Repositório | https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas |
| Branch permitida | feat/production-foundation |
| **Último commit de código validado** | [42f7eecf6aa5ee25adb3d135930d73befbeaa6b8](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/42f7eecf6aa5ee25adb3d135930d73befbeaa6b8) |
| Base main verificada | 95aba9c27c363c8b24c2f34c65a28c2f3b011b3b — não alterada por esses incrementos |
| PR #2 | Aberta, em draft, não mesclada no último exame |
| Fase atual | **7 — Administração e Relatórios** |
| Último incremento concluído tecnicamente | Fase 7 nº 05: caixa de alertas internos vencidos e ciência auditável, preservados incrementos 2–4 |
| Backend/integração/migrações | [Actions #44928047228](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047228) — success para commit 42f7eec |
| Browser desktop/mobile | [Actions #44928047306](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047306) — success para commit 42f7eec |
| Release/merge/deploy | **Nenhum** |
| PSP live/Meta live | **Não habilitados nem homologados** |
| Próximo marco | Fase 7 — política comercial SLA, notificações externas/automáticas, LGPD jurídica, relatórios/exportação, governança e paridade |

**Atenção:** commits posteriores podem alterar só documentação e mudar o HEAD; isso não apaga o SHA do último **incremento de código** com CI verde. O próximo agente precisa verificar ambos.

## O que a última entrega adicionou — incremento F7 #5
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
- O núcleo da Fase 7 está **incompleto**, apesar de cinco incrementos de código testados.
- Homologação externa foi **adiada para antes do lançamento**, não dispensada; existem dívidas de Fases 0–7.
- A base de conhecimento não substitui revisões de código, segurança, política legal nem licença para mexer na main.

**Estado machine-readable:** [estado.json](estado.json). **Verificações:** [06-EVIDENCIAS.md](06-EVIDENCIAS.md).
