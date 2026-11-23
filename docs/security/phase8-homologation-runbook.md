# Fase 8 — Manual de homologação externa, segurança e recuperação

**Data:** 23/11/2026. **Situação:** controles locais desenvolvidos e testados; **não existe homologação externa comprovada, nem autorização de merge/deploy**. Branch `feat/production-foundation`.

## Entregas técnicas testadas
- F8 #01–04: backend seguro, PostgreSQL e restore sintético, inventário de nomes de segredos, threat model, lockfile npm reprodutível, SHA das GitHub Actions e Docker build sem publicação.
- F8 #05: `npm audit` real completo e de produção + CycloneDX: **4 vulnerabilidades moderadas não remediadas** (`glob`, `minimatch`, `vite-plugin-pwa`, `workbox-build`); 0 high/critical no snapshot; **673 componentes** no SBOM. [CI #45210350161](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210350161).
- F8 #06: **12 gates externos pendentes** em `docs/security/phase8-acceptance-gates.json`, script `scripts/phase8-release-gate.mjs`; smoke HTTPS opt-in `scripts/phase8-staging-smoke.mjs` sem conexão automática no CI.
- F8 #07: `X-CF-Request-Id` aleatório na API e telemetria em produção só com UUID/método/status/duração. Sem body, cookie, token, IP ou URL de usuário. **Não** é monitoramento hospedado.
- F8 #08: imagens oficiais pinadas com digests do registry verificados por [CI #45209584530](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45209584530): `node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a` e `postgres:16@sha256:3950ad7c3148ca2175ef1b6c36c9efbf78957ae8fbe8b3a5d7c35af50500382f`. Digests **não** garantem ausência de CVEs; atualizar com revisão.
- F8 #09: `docs/security/phase8-rollback-plan.json` + `scripts/phase8-rollback-preflight.mjs`: checklist de backup, versão anterior, compatibilidade de migrations, aprovação de dois operadores e RPO/RTO **não definidos**; ferramenta não executa rollback.
- Código [aa155cb8](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/aa155cb880f72c99d972fa58de758a810880b50f): backend [CI #45210349937](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349937), navegador [CI #45210349834](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349834), restore sintético [CI #45210349944](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349944), supply chain/Docker [CI #45210349882](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349882), npm audit/SBOM [CI #45210350161](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210350161), gates/smoke simulados [CI #45210350118](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210350118), memória [CI #45210349835](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349835) — **7 success no mesmo SHA**.

## Gates obrigatórios ainda pendentes
| ID no contrato | Evidência que falta antes da aprovação |
| --- | --- |
| staging_https_dns_proxy | DNS/HTTPS, certificado confiável, proxy/firewall e cabeçalhos em staging real |
| database_tenant_segregation_tls | banco isolado/menor privilégio, TLS CA verificada, tenant isolation com testes |
| offsite_backup_restore_pitr | backup criptografado offsite, restore real isolado, PITR, RPO/RTO aprovados |
| monitoring_alerting_incidents | coleta real de logs seguros, alertas/plantão, resposta a incidentes |
| asaas_sandbox_external | Asaas Sandbox externo, webhooks, idempotência, estorno e falhas |
| meta_test_delivery_consent | Meta templates/consentimento/opt-out, callback, whitelist e entrega teste |
| resend_test_delivery | domínio remetente, e-mails reais de QA, bounce e falhas |
| security_review_cve | tratar 4 CVEs moderados + revisão independente, SCA de contêiner |
| privacy_fiscal_review | LGPD, retenção, impostos/NFSe e responsáveis jurídico/fiscal |
| phase7_deferred_requirements | todos os requisitos adiados pela ADR-026 antes de go-live |
| accessibility_real_devices | acessibilidade, Android físico, teclado, leitores de tela e QA |
| rollback_pilot_release_approval | piloto, rollback real ensaiado, dupla autorização e aprovação explícita |

## Comandos seguros / somente leitura
```bash
node scripts/phase8-release-gate.mjs --check
node scripts/phase8-rollback-preflight.mjs --check
node scripts/phase8-staging-smoke.mjs
node scripts/phase8-readiness.mjs --offline
```
**Somente após autorização do ambiente e domínio:** `node scripts/phase8-staging-smoke.mjs --origin https://DOMINIO-DE-STAGING-AUTORIZADO`. A sonda apenas faz GET de `/api/health`; aprovação externa ainda é manual.

## Procedimento operacional futuro, NÃO executado
1. Aprovar responsável, domínio/hosting, custos, secret manager e chaves separadas por ambiente. Não colar segredos em Git.
2. Validar DNS/HTTPS, CA PostgreSQL, privilégios, firewall, dados sintéticos e isolamento do staging.
3. Configurar alarmes e logging sem PII; testar falhas, limite de requisições e incident response.
4. Configurar backup criptografado offsite e restaurar em DB isolado `*_restore_drill`, nunca sobre produção; medir PITR/RPO/RTO com autorização.
5. Provar integrações Asaas, Meta e Resend **apenas em ambientes/contatos autorizados**, sem pagamentos ou envio live.
6. Resolver LGPD/fiscal, acessibilidade e 4 avisos moderados; reabrir itens de F7 ADR-026.
7. Testar piloto e plano de retorno: versão/digest anterior, operadores, parada dos workers, compatibilidade do schema e logs. Não executar rollback destrutivo via SQL ou `git reset --hard` sem plano validado.
8. Só considerar release após evidências rastreáveis, revisão independente e autorização expressa de publicação e merge.

**Limitação deliberada:** nem JSON versionado nem CI são assinatura do responsável; a Fase 8 OPERACIONAL continua **PENDENTE**, e a Fase 9 não é liberada automaticamente.
