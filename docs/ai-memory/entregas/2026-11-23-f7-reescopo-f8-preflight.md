# Transição F7→F8 e primeiro incremento técnico de homologação (23/11/2026)

**Solicitação:** registrar requisitos de F7 para estudo posterior; concluir escopo não adiado; avançar F8 sem alegar homologação. **Decisão:** ADR-026. **Branch:** `feat/production-foundation`, PR #2 draft, `main` protegida.

## Conclusão com ressalva — Fase 7
Os dez incrementos da F7 estão implementados e testados em CI. O restante é **ADIADO PARA ANÁLISE**, não executado: SLAs/notificações/anexos, LGPD integral/retention, exportação consistente sob mutações, paridade/acessibilidade, revisão de segurança e staging. [Registro exaustivo dos adiamentos](../pendencias/2026-11-23-f7-adiados.md) com decisões, critérios de aceite e gates. Encerramento apenas do **escopo técnico não adiado**; F7 **não homologada integralmente**.

## F8 #01 — o que de fato foi realizado
- [Código 309e28ef](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/309e28ef2ce67e45e2954d465426e84ec0eab359): `scripts/phase8-readiness.mjs`, testes Node, workflow de restore sintético com PostgreSQL 16. Nenhum deploy, alteração em bancos externos, dados reais, disparo ou pagamento.
- Teste offline verifica presença de scripts e contratos de prontidão, sem rede/segredos. `--staging` sempre conserva gates externos pendentes; nunca concede autorização de release.
- Teste backup-restore cria banco e registros sintéticos em serviço PostgreSQL 16 do GitHub Actions, usa cliente 16 em contêiner efêmero, restaura em `cobraflux_restore_drill` e comprova migrações, fixture e recusas de destino inseguro.
- **Falhas recuperadas:** [#45189656787](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45189656787) campo `internal_code` ausente, [#45189936453](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45189936453) cliente PG incompatível, [#45190199472](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190199472) pacote 16 não disponível. Corrigidas e documentadas.
- **Validação final, mesmo SHA:** [F8 45190560236](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560236), [backend 45190560285](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560285), [Chromium 45190560282](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560282) e [memória 45190560470](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560470) — **success**.

## Pendências que impedem aceite operacional
Sem staging HTTPS, backup externo/PITR real, monitoramento real, aprovação jurídica/fiscal, PSP sandbox externo, Meta, Resend, piloto em aparelhos físicos e rollback de produção. Também não foram liberados os itens adiados na ADR-026. [Runbook F8](../../FASE_8_HOMOLOGACAO.md).

**Situação de retomada:** fase atual 8 — preparação técnica iniciada; fase 7 escopo não adiado encerrado por decisão; nenhum gate operacional de F8 declarado cumprido. `main` intacta, PR #2 em draft.
