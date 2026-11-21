# Fase 8 — Homologação e segurança operacional

**Estado documental em 21/11/2026:** PENDENTE

## Implementação identificada
Workflows de CI, testes iniciais e scripts de manutenção são preparação técnica; **não** configuram homologação operacional.

## Evidência de verificação
Somente testes automáticos em ambiente efêmero, não teste de restauração/infra live.

## Pendências (ainda NÃO entregues)
HTTPS/staging, segurança externa/E2E, carga, alertas, PITR, restore, piloto, rollback, PSP real de teste, Meta/Resend, fiscal e LGPD.

## Próxima ação autorizada ou necessária
Executar somente depois de infraestrutura/autorização; registrar prova, ambiente e responsável de cada gate.

## Risco de interpretação
CI verde não substitui aprovação de release.

## Fonte técnica primária
docs/EXECUCAO_PRODUCAO_FUNDACAO.md, Issue #3

## Referências cruzadas
- [Estado atual](../01-ESTADO-ATUAL.md)
- [Decisões](../03-DECISOES.md)
- [Backlog](../04-BACKLOG.md)
- [Diário](../05-DIARIO-DE-DESENVOLVIMENTO.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)


## Como continuar esta fase
Antes de marcar qualquer item como completo: conferir branch e SHA no GitHub, revisar implementação presente, estabelecer testes de aceitação, não duplicar funcionalidade, criar registro em **../entregas/**, atualizar esta fase e **estado.json**. Distinguir código testado, homologação externa e publicação.
