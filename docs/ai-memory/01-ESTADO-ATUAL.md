# 01 — Estado atual e ponto exato de retomada

**Atualizado em:** 21/11/2026, após implementação e validação do incremento de suporte da Fase 7. **Snapshot documental**, não serviço de telemetria. Os **12 arquivos originais do handoff** já estão preservados com hash exato em [originais/](originais/), sem depender do chat.

| Item | Última evidência |
| --- | --- |
| Repositório | https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas |
| Branch permitida | feat/production-foundation |
| **Último commit de código validado** | [4dcbb80f2ebfa817b3d512c94502d697d4077842](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4dcbb80f2ebfa817b3d512c94502d697d4077842) |
| Base main verificada | 95aba9c27c363c8b24c2f34c65a28c2f3b011b3b — não alterada por esses incrementos |
| PR #2 | Aberta, em draft, não mesclada no último exame |
| Fase atual | **7 — Administração e Relatórios** |
| Último incremento concluído tecnicamente | Fase 7: histórico e respostas de suporte **exclusivamente no portal** |
| Backend/integração/migrações | [Actions #44915970990](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915970990) — success para commit 4dcbb80 |
| Browser desktop/mobile | [Actions #44915971125](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915971125) — success para commit 4dcbb80 |
| Release/merge/deploy | **Nenhum** |
| PSP live/Meta live | **Não habilitados nem homologados** |
| Próximo marco | Fase 7 — suporte incompleto (SLA/notificações), fluxo LGPD com revisão jurídica, relatórios/exportação, governança, auditoria de paridade |

**Atenção:** commits posteriores podem alterar só documentação e mudar o HEAD; isso não apaga o SHA do último **incremento de código** com CI verde. O próximo agente precisa verificar ambos.

## O que a última entrega adicionou
- Migração **017_support_portal_replies.sql**: respostas vinculadas a ticket/organização/ator, índice, histórico somente acréscimo e chave de idempotência por chamado.
- Rotas de superadmin MFA + CSRF para criar resposta, rotas admin e tenant para visualizar histórico, sem permitir acesso entre organizações.
- Interfaces **AdminOperationsView** e **AccountOperationsView** com mensagens no painel autenticado.
- Integração testada para RBAC, CSRF, acesso cross-tenant, repetição de chave, ticket público não autenticado e ticket encerrado.
- **Não** envia e-mail, WhatsApp ou confirma recebimento/leitura; **delivery_state=portal_only**.
- Documentação técnica em **docs/FASE_7_ADMIN_RELATORIOS_LGPD.md**, Issue #3 atualizada.

## Não esquecer
- O núcleo da Fase 6 está tecnicamente implementado, mas **não há checkout financeiro live do SaaS**, aprovação comercial, tributação ou cobrança homologada.
- O núcleo da Fase 7 está **incompleto**, apesar de dois incrementos de código testados.
- Homologação externa foi **adiada para antes do lançamento**, não dispensada; existem dívidas de Fases 0–7.
- A base de conhecimento não substitui revisões de código, segurança, política legal nem licença para mexer na main.

**Estado machine-readable:** [estado.json](estado.json). **Verificações:** [06-EVIDENCIAS.md](06-EVIDENCIAS.md).
