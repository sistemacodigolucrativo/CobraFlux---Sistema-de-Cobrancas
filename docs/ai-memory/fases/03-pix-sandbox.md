# Fase 3 — Pix Asaas — somente sandbox

**Estado documental em 21/11/2026:** CÓDIGO TESTADO COM MOCKS; PSP EXTERNO PENDENTE

## Implementação identificada
Migrações 006–010; adapter Asaas sandbox e credenciais criptografadas; QR/Pix sandbox, webhooks, estornos parciais/integral, reconciliação, cancelamento e comprovantes verificados pelo adapter.

## Evidência de verificação
Unitário e integração PostgreSQL com adapters mockados, idempotência, falhas e cenário fora de ordem.

## Pendências (ainda NÃO entregues)
Conta Asaas Sandbox externa, webhooks HTTPS reais de teste, documentos, negações, antifraude; proibição de Pix live permanece.

## Próxima ação autorizada ou necessária
Planejar e depois homologar transações de teste externas com evidência do PSP.

## Risco de interpretação
Nenhuma simulação representa dinheiro real.

## Fonte técnica primária
docs/FASE_3_PIX_ASAAS_SANDBOX.md

## Referências cruzadas
- [Estado atual](../01-ESTADO-ATUAL.md)
- [Decisões](../03-DECISOES.md)
- [Backlog](../04-BACKLOG.md)
- [Diário](../05-DIARIO-DE-DESENVOLVIMENTO.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)


## Como continuar esta fase
Antes de marcar qualquer item como completo: conferir branch e SHA no GitHub, revisar implementação presente, estabelecer testes de aceitação, não duplicar funcionalidade, criar registro em **../entregas/**, atualizar esta fase e **estado.json**. Distinguir código testado, homologação externa e publicação.
