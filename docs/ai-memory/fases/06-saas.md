# Fase 6 — Monetização SaaS da plataforma

**Estado documental em 21/11/2026:** NÚCLEO TÉCNICO TESTADO; MONETIZAÇÃO REAL INCOMPLETA

## Implementação identificada
Migração 015; Free padrão, cotas de recursos, Starter/Business sem preços inventados, quotes, cupons, solicitações idempotentes, faturas draft, período de tolerância/downgrade, página Meu Plano.

## Evidência de verificação
Commit e79c829de377fa816468ab409b9d4d233b019021; GitHub Actions 44870002881 backend e 44870002890 navegador aprovados.

## Pendências (ainda NÃO entregues)
PSP de cobrança próprio da plataforma, checkout, preços, invoice paga verificada, reembolsos, questões fiscais/NFSe, homologação financeira.

## Próxima ação autorizada ou necessária
Preparar especificação neutra de PSP, aguardar escolha comercial para integração/validação.

## Risco de interpretação
Não confundir MRR SaaS com GPV; draft não ativa plano pago.

## Fonte técnica primária
docs/FASE_6_SAAS_MONETIZACAO.md

## Referências cruzadas
- [Estado atual](../01-ESTADO-ATUAL.md)
- [Decisões](../03-DECISOES.md)
- [Backlog](../04-BACKLOG.md)
- [Diário](../05-DIARIO-DE-DESENVOLVIMENTO.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)
- [Evidência associada](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44870002881)

## Como continuar esta fase
Antes de marcar qualquer item como completo: conferir branch e SHA no GitHub, revisar implementação presente, estabelecer testes de aceitação, não duplicar funcionalidade, criar registro em **../entregas/**, atualizar esta fase e **estado.json**. Distinguir código testado, homologação externa e publicação.
