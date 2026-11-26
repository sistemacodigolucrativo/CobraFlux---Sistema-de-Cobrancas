# Fase 5 — WhatsApp Meta Cloud API

**Estado documental em 21/11/2026:** NÚCLEO TESTADO; ENVIO DESATIVADO

## Implementação identificada
Migrações 012–014; adapter Meta Graph v27.0, templates UTILITY, token criptografado, consentimento versionado, STOP/PARAR, outbox, webhooks HMAC, buffering/dedup, lembretes de vencimento enfileirados.

## Evidência de verificação
Mocks de transporte, autenticação de webhook, regras de consentimento, idempotência e fila.

## Pendências (ainda NÃO entregues)
Meta WABA, templates e remetente habilitados, scheduler HTTPS, entrega/custos reais, avaliação de retenção/LGPD.

## Próxima ação autorizada ou necessária
Testar opt-outs, webhook e entrega reais apenas após permissão e configuração.

## Risco de interpretação
Checkbox legado não prova opt-in. Nunca repetir POST após timeout incerto.

## Fonte técnica primária
docs/FASE_5_WHATSAPP_META.md

## Referências cruzadas
- [Estado atual](../01-ESTADO-ATUAL.md)
- [Decisões](../03-DECISOES.md)
- [Backlog](../04-BACKLOG.md)
- [Diário](../05-DIARIO-DE-DESENVOLVIMENTO.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)


## Como continuar esta fase
Antes de marcar qualquer item como completo: conferir branch e SHA no GitHub, revisar implementação presente, estabelecer testes de aceitação, não duplicar funcionalidade, criar registro em **../entregas/**, atualizar esta fase e **estado.json**. Distinguir código testado, homologação externa e publicação.
