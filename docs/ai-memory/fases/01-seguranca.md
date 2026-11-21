# Fase 1 — Segurança, autenticação e infraestrutura base

**Estado documental em 21/11/2026:** NÚCLEO TESTADO; HOMOLOGAÇÃO PENDENTE

## Implementação identificada
PostgreSQL versionado; registro e verificação de e-mail; bcrypt; sessão HttpOnly e revogação; recuperação; TOTP/MFA de superadmin; CSRF; rate limits e regras de tenant; scripts de backup/restore.

## Evidência de verificação
Testes automáticos de auth, MFA, replay, permissão e isolamento em CI; não equivalem a MFA provisionado em staging.

## Pendências (ainda NÃO entregues)
Staging HTTPS, Resend real, backups off-site restaurados, logs/alertas e governança de chaves.

## Próxima ação autorizada ou necessária
Registrar homologação real de e-mail/MFA/restore após infraestrutura autorizada.

## Risco de interpretação
Scripts não comprovam backup restaurado.

## Fonte técnica primária
docs/FASE_1_SEGURANCA_OPERACAO.md

## Referências cruzadas
- [Estado atual](../01-ESTADO-ATUAL.md)
- [Decisões](../03-DECISOES.md)
- [Backlog](../04-BACKLOG.md)
- [Diário](../05-DIARIO-DE-DESENVOLVIMENTO.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)
- [Evidência associada](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/blob/feat/production-foundation/docs/FASE_1_SEGURANCA_OPERACAO.md)

## Como continuar esta fase
Antes de marcar qualquer item como completo: conferir branch e SHA no GitHub, revisar implementação presente, estabelecer testes de aceitação, não duplicar funcionalidade, criar registro em **../entregas/**, atualizar esta fase e **estado.json**. Distinguir código testado, homologação externa e publicação.
