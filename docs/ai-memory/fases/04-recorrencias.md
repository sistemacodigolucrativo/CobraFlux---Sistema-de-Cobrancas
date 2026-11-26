# Fase 4 — Recorrências

**Estado documental em 21/11/2026:** NÚCLEO TESTADO; SCHEDULER EXTERNO PENDENTE

## Implementação identificada
Migração 011; planos semanais/mensais, calendário civil America/Sao_Paulo, snapshots por ciclo, idempotência, lease, pausa, retomada e cancelamento; worker cria só rascunhos.

## Evidência de verificação
Testes de calendário 28/29/30/31, deduplicação e integração PostgreSQL em CI.

## Pendências (ainda NÃO entregues)
Scheduler/cron real, observabilidade, restore e carga em staging.

## Próxima ação autorizada ou necessária
Homologar cron/recovery e comportamento concorrente em ambiente autorizado.

## Risco de interpretação
Recorrência não emite Pix nem envia notificações automaticamente.

## Fonte técnica primária
docs/FASE_4_RECORRENCIAS.md

## Referências cruzadas
- [Estado atual](../01-ESTADO-ATUAL.md)
- [Decisões](../03-DECISOES.md)
- [Backlog](../04-BACKLOG.md)
- [Diário](../05-DIARIO-DE-DESENVOLVIMENTO.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)


## Como continuar esta fase
Antes de marcar qualquer item como completo: conferir branch e SHA no GitHub, revisar implementação presente, estabelecer testes de aceitação, não duplicar funcionalidade, criar registro em **../entregas/**, atualizar esta fase e **estado.json**. Distinguir código testado, homologação externa e publicação.
