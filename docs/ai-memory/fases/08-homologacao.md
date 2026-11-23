# Fase 8 — Homologação e segurança operacional

**Estado em 23/11/2026:** **EM DESENVOLVIMENTO — F8 #01 PREPARAÇÃO TÉCNICA VALIDADA EM CI.** Sem staging real, sem serviços externos, sem lançamento nem homologação operacional. F7: reescopo ADR-026, pendências registradas.

## Implementação identificada
Workflows de CI, testes iniciais e scripts de manutenção são preparação técnica; **não** configuram homologação operacional.

## Evidência de verificação
Somente testes automáticos em ambiente efêmero, não teste de restauração/infra live.

## Pendências (ainda NÃO entregues)
HTTPS/staging, segurança externa/E2E, carga, alertas, PITR, restore, piloto, rollback, PSP real de teste, Meta/Resend, fiscal e LGPD.

## Incremento nº 01 — pré-homologação segura (23/11/2026)

- `scripts/phase8-readiness.mjs` e `scripts/phase8-readiness.test.mjs`: validação **offline** de contratos locais de health, backup e guardas do restore, com checagem opcional de variáveis de staging **sem contatar provedores nem imprimir segredos**; o modo staging nunca autocertifica aprovação externa.
- `.github/workflows/phase8-preflight.yml`: teste de backup e restauração **no PostgreSQL 16 descartável** com fixture sintética, migrações idempotentes, prova de contagem e rejeição de banco de origem/target não vazio.
- Primeiras tentativas registradas: erro de fixture sem internal_code (#45189656787), incompatibilidade de cliente PG com servidor 16 (#45189936453), pacote PG16 indisponível no runner (#45190199472); corrigidas usando o contêiner oficial PG16 efêmero.
- **Commit de código validado:** [309e28ef2ce67e45e2954d465426e84ec0eab359](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/309e28ef2ce67e45e2954d465426e84ec0eab359); [preflight + restore #45190560236](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560236), [backend #45190560285](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560285), [browser #45190560282](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560282), [memória #45190560470](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560470) — **success**.
- **Fora do alcance:** backup offsite, PITR, restore com dados reais, hosting, DNS/HTTPS, mensagens, gateways de pagamento, auditoria legal, SLA e go-live.

## Próxima ação autorizada ou necessária
Continuar somente com planejamento/testes sintéticos offline enquanto não houver infraestrutura autorizada. Para staging real, segredos, restore de backup real, PSP/Meta/Resend, piloto e lançamento, obter aprovação explícita, registrar prova, ambiente, responsável e rollback.

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
