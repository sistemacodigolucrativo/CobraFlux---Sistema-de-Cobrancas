# Fase 8 — Homologação e segurança operacional

**Estado em 23/11/2026:** **EM DESENVOLVIMENTO — F8 #04 CI REPRODUTÍVEL E SUPPLY CHAIN VALIDADO EM CI.** Sem staging real, sem serviços externos, sem lançamento nem homologação operacional. F7: reescopo ADR-026, pendências registradas.

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

## Incremento nº 02 — validação fail-closed de configuração (23/11/2026)
- `server/production-config.ts` implementa validação rigorosa e pura da origem HTTPS em modo produção, e exige TLS do banco e segredo não exemplo. `server/index.ts` usa origem canonizada.
- Testes unitários e preflight offline abrangem configurações perigosas; não utilizam credenciais nem contatam servidores.
- Código [afb04d84](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/afb04d84f28e3adbe628b40cc0c2f3b28ce92a27), CI backend [CI #45194516204](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194516204), Chromium [CI #45194517814](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194517814), F8 offline/restore [CI #45194517198](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194517198), memória [CI #45194516118](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194516118): **success**.
- **Não comprova:** qualidade entrópica real de segredos, HTTPS/certificado/proxy hospedados, staging, backup offsite ou conformidade legal. [Registro completo](../entregas/2026-11-23-f8-02-configuracao-producao.md).

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

## Incremento nº 03 — inventário e ameaça (23/11/2026)
F8 #03: inventário estático de 33 variáveis, CI de nomes e classificações, threat model e runbook. Código [c210b5d2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/c210b5d2ead0f25d469fb3ad38b8d5d9bb34c280), backend [Actions #45200150015](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200150015), Chromium [Actions #45200150042](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200150042), preflight/restore [Actions #45200149826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149826) e memória [Actions #45200149781](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149781), todos **success** no mesmo SHA. A auditoria não lê valores de segredos nem acessa rede; staging real permanece não homologado.
- `docs/security/staging-config-inventory.json`: inventário 33/33; scanner `scripts/phase8-secrets-audit.mjs` e três testes; workflow de preflight.
- [Modelo STRIDE](../../security/staging-threat-model.md) e [runbook](../../security/staging-secrets-runbook.md) com riscos residuais, segredos e aprovações futuras.
- [Registro de entrega](../entregas/2026-11-23-f8-03-inventario-segredos.md). Não houve acesso a segredo ou rede externa.

## Incremento nº 04 — npm lockfile e pipeline seguro (23/11/2026)

- F8 #04 — dependências npm com lockfile, CI em modo read-only, Actions fixadas por SHA e build Docker local. Código [4d43aa6c](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4d43aa6c5cd8623d2ee0fe403ca016bfb51353cc); backend [CI #45205396845](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396845), navegador [CI #45205396796](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396796), F8 preflight/restore [CI #45205396813](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396813), política da cadeia de dependências e Docker [CI #45205396857](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396857), memória [CI #45205396804](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396804) — **success** no mesmo SHA. Não houve deploy nem publicação de imagem.
- Lock v3 com 674 entradas, remoção de `bun.lock` desatualizado e workflow temporário, seis workflows `contents: read`, Actions pinadas e `npm ci` CI/Docker.
- Auditor `scripts/phase8-supply-chain.mjs` garante contratos, workflow dedicado faz build Docker local **sem publicação**.
- Pendente: varredura CVEs/SBOM, imagens base Docker por digest e provedores/staging externos. [Entrega](../entregas/2026-11-23-f8-04-ci-reprodutivel.md).
