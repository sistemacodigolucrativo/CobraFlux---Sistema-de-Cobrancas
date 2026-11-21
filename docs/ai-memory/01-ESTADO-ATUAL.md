# 01 — Estado atual e ponto exato de retomada

**Atualizado em:** 21/11/2026, após implementação e validação do incremento de suporte da Fase 7. **Snapshot documental**, não serviço de telemetria. Os **12 arquivos originais do handoff** já estão preservados com hash exato em [originais/](originais/), sem depender do chat.

| Item | Última evidência |
| --- | --- |
| Repositório | https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas |
| Branch permitida | feat/production-foundation |
| **Último commit de código validado** | [96e58848cb696489560fa14fcbceaf19357d2566](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/96e58848cb696489560fa14fcbceaf19357d2566) |
| Base main verificada | 95aba9c27c363c8b24c2f34c65a28c2f3b011b3b — não alterada por esses incrementos |
| PR #2 | Aberta, em draft, não mesclada no último exame |
| Fase atual | **7 — Administração e Relatórios** |
| Último incremento concluído tecnicamente | Fase 7: timeline administrativa de status de tickets (histórico de respostas no portal continua disponível) |
| Backend/integração/migrações | [Actions #44920626498](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44920626498) — success para commit 96e58848 |
| Browser desktop/mobile | [Actions #44920626428](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44920626428) — success para commit 96e58848 |
| Release/merge/deploy | **Nenhum** |
| PSP live/Meta live | **Não habilitados nem homologados** |
| Próximo marco | Fase 7 — suporte incompleto (SLA/notificações), fluxo LGPD com revisão jurídica, relatórios/exportação, governança, auditoria de paridade |

**Atenção:** commits posteriores podem alterar só documentação e mudar o HEAD; isso não apaga o SHA do último **incremento de código** com CI verde. O próximo agente precisa verificar ambos.

## O que a última entrega adicionou — incremento F7 #3
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
- O núcleo da Fase 7 está **incompleto**, apesar de três incrementos de código testados.
- Homologação externa foi **adiada para antes do lançamento**, não dispensada; existem dívidas de Fases 0–7.
- A base de conhecimento não substitui revisões de código, segurança, política legal nem licença para mexer na main.

**Estado machine-readable:** [estado.json](estado.json). **Verificações:** [06-EVIDENCIAS.md](06-EVIDENCIAS.md).
