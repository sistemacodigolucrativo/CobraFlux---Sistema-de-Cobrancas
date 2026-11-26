# Fase 7, incremento 5 — alertas de prazos vencidos internos, ciência auditável

**Data:** 21/11/2026. **Escopo:** BL-006 / REQ-039/100/101, continuação técnica previamente aprovada. **Branch:** feat/production-foundation.
**SHA base:** fe2c5ad9653d13dad12f471737fcc943feecc1f4. **SHA código validado:** [42f7eecf6aa5ee25adb3d135930d73befbeaa6b8](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/42f7eecf6aa5ee25adb3d135930d73befbeaa6b8).

## Diagnóstico e estratégia
Antes do incremento 5, a migração 018 permitia atribuir prazos internos manuais e filtrar vencidos, mas não existia acompanhamento de ciência por operador administrativo. Não definir SLA padrão, horário útil nem qualquer canal de disparo. Critério: notificar **visualmente apenas ao consultar o painel**, histórico de ciência imutável, reabrir alerta ao mudar a versão do prazo, sem expor mensagens de tickets na caixa de alertas.

## Arquivos alterados
- `server/migrations/019_support_sla_alert_ack.sql`: coluna `revision` no SLA atual e tabela de reconhecimentos por `(ticket_id,sla_revision)`, com trilha append-only.
- `server/phase7-routes.ts`: GET /api/admin/support/sla-alerts (somente prazos vencidos de tickets não encerrados, filtragem/paginação), POST /api/admin/support/sla-alerts/:id/acknowledge (MFA, CSRF, motivo, transação e idempotência por revisão), incremento de revisão na alteração de prazo.
- `src/services/productionApi.ts`: tipos e API tipados.
- `src/pages/production/AdminOperationsView.tsx`: caixa de alertas internos, estados pendente/reconhecido, registro de ciência auditável, mensagens informativas de limites.
- `server/phase7.integration.test.ts`: cenários de papel/CSRF, entradas inválidas, alertas antecipados, atraso, repetição, mudança de prazo, auditoria imutável, paginação e ticket encerrado.

## Evidência de CI no mesmo SHA
- Backend/PG e builds: [#44928047228](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047228) — **success**.
- Chromium desktop/mobile: [#44928047306](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047306) — **success**.
- Memória: [#44928047281](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047281) — **success**.

## Limites e retomada
**IMPLEMENTADA — TESTADA EM CI; não homologada externamente.** Nada é entregue ao usuário fora da interface do superadmin, nem há alerta em segundo plano, e-mail, push ou Meta. Reconhecer alerta não encerra ticket e não significa cumprir SLA. Continuam pendentes: política comercial de SLA, integração externa controlada, LGPD integral, anexos, relatórios e staging. Sem merge, deploy, PSP live ou mudança na main.
