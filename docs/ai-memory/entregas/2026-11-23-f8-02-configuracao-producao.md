# F8 — incremento 02: validação fail-closed de configuração de produção

**Data:** 23/11/2026. **Escopo:** Fase 8, segurança operacional sem acesso a provedor/servidor real. **Branch:** `feat/production-foundation`. **Código validado:** [afb04d84](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/afb04d84f28e3adbe628b40cc0c2f3b28ce92a27). **Base antes do código:** `6fd6c03cc98dea7e1c843c9b5e7a11907714a52f`.

## Diagnóstico
`server/index.ts` usava somente `APP_ORIGIN.startsWith('https://')` para produção. Isso não garante origem canônica e poderia aceitar informações adicionais indesejadas. O pool PostgreSQL já tinha `rejectUnauthorized:true` quando `DATABASE_SSL=require`, porém startup não exigia essa opção.

## Implementação
- Novo `server/production-config.ts`: para `NODE_ENV=production`, valida HTTPS canônico sem credenciais, path/query/hash ou loopback/localhost; exige `DATABASE_SSL=require` e SESSION_SECRET com 32+ caracteres sem padrões de CI/exemplo comuns. **Não mede entropia** nem imprime o segredo.
- `server/index.ts`: valida antes de servir API e usa origem canonizada para checagem Origin.
- Novo `server/production-config.test.ts` com cenários positivos/negativos, ausência de vazamento de segredo e preservação do modo teste local.
- `package.json`: segurança adicionada a `test:server`.
- `scripts/phase8-readiness.mjs` e testes: regras offline alinhadas às de startup.
- `.github/workflows/phase8-preflight.yml`: novo código participa da validação.

## Evidências no mesmo commit
- Backend/TypeScript/segurança/integrations/build: [CI #45194516204](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194516204) — **success**.
- Navegador Chromium desktop/mobile: [CI #45194517814](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194517814) — **success**.
- Preflight F8 e restore PostgreSQL 16 sintético isolado: [CI #45194517198](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194517198) — **success**.
- Memória: [CI #45194516118](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194516118) — **success**.

## Limitações
**Não houve deploy, staging HTTPS real, teste de certificado externo, domínio, segredo de produção, revisão independente ou serviço live.** O validador rejeita exemplos conhecidos, mas comprimento não substitui geração criptograficamente segura e armazenamento em secret manager. É preciso configurar o certificado CA de PostgreSQL e TRUST_PROXY de acordo com infraestrutura aprovada. F7 ADR-026 permanece com requisitos adiados e não concluídos.

**Estado:** IMPLEMENTADO E TESTADO EM CI; F8 continua em desenvolvimento, sem homologação operacional. **Próximo recorte seguro:** inventário de secrets e threat model sem credenciais reais.
