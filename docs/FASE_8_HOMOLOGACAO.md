# Fase 8 — homologação e segurança operacional

**Início técnico documentado:** 23/11/2026. **Status:** EM DESENVOLVIMENTO — apenas preparativos isolados validados, **sem staging operacional homologado**. Branch autorizada: `feat/production-foundation`. `main` intacta; PR #2 draft.

## Origem e escopo
A fase segue o roteiro 0–9 do handoff original. A ADR-026 encerra **somente o escopo de desenvolvimento NÃO ADIADO da Fase 7** e transfere seus gates para [análise posterior](ai-memory/pendencias/2026-11-23-f7-adiados.md), sem considerá-los atendidos. F8 pode iniciar por testes offline sem provedores, rede externa ou dados reais. Não há autorização para alterar infraestrutura, fazer deploy, enviar mensagens, usar PSP/Meta live, testar dados pessoais de produção ou publicar release.

## F8 #01 — ensaio de backup/restore e verificação de staging
**Código:** [309e28ef2ce67e45e2954d465426e84ec0eab359](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/309e28ef2ce67e45e2954d465426e84ec0eab359). **CI validado no SHA:** [GitHub Actions #45190560236](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560236) (2 jobs: offline readiness e isolated-restore), [GitHub Actions #45190560285](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560285) (backend/PostgreSQL/migrações), [GitHub Actions #45190560282](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560282) (Chromium desktop/mobile) e [GitHub Actions #45190560470](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560470) (memória), todos **success**.

Arquivos:
- `scripts/phase8-readiness.mjs`: verificação offline de contratos locais (health, scripts de backup/restore, documento da fase). `--offline` não usa segredos/rede. `--staging` apenas valida formato de configurações como `APP_ORIGIN` HTTPS, `DATABASE_SSL=require`, sessão, proxy controlado e ambiente production; **mesmo com valores válidos não dá aceite operacional**.
- `scripts/phase8-readiness.test.mjs`: testes unitários do comportamento de segurança; nenhum segredo é impresso e configuração simulada não cria aceite de staging.
- `.github/workflows/phase8-preflight.yml`: PostgreSQL 16 local, migrações executadas duas vezes, inclusão de organização e cliente **sintéticos**, `pg_dump` e `pg_restore` via contêiner oficial PostgreSQL 16, destino separado `*_restore_drill`, verificação de contagens e de recusas a restaurar na origem ou em banco não vazio.

**Execuções com falha preservadas (corrigidas antes do sucesso):**
1. CI #45189656787 — fixture sintética omitiu `internal_code` obrigatório.
2. CI #45189936453 — ferramenta pg_dump/pg_restore de versão incompatível com servidor PostgreSQL 16.
3. CI #45190199472 — pacote `postgresql-client-16` indisponível no runner; resolvido usando contêiner oficial 16.
4. Execução final [GitHub Actions #45190560236](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560236) — dois jobs concluídos com **success**, preservando todos os testes de recusa.

## Como executar apenas o verificador offline
```bash
node --test scripts/phase8-readiness.test.mjs
node scripts/phase8-readiness.mjs --offline
```
O comando `node scripts/phase8-readiness.mjs --staging` inspeciona somente variáveis presentes **sem rede** e retorna código não zero deliberadamente até homologação operacional independente. **Não** passar credenciais ou URLs contendo senhas como argumentos CLI; use secret manager no ambiente autorizado. As variáveis nunca são publicadas no GitHub por este verificador.

## Checklist para homologação real (AINDA PENDENTE)
| Gate | Aceite necessário | Estado |
| --- | --- | --- |
| HTTPS e infraestrutura | Ambiente staging distinto de produção, domínio/SSL válidos, proxy confiável, firewall, rotas e headers testados | **PENDENTE — requer aprovação/infra** |
| PostgreSQL e migrações | DB gerenciado com TLS/cadeia validada, permissões mínimas, migrações em janela segura (índices 020), métricas e sem dados reais desnecessários | **PENDENTE** |
| Backup/restore | Backup **criptografado e offsite**, retenção, teste de restauração em banco real de staging isolado e exercícios PITR com metas RPO/RTO aprovadas | **PENDENTE** |
| Segurança/monitoramento | Revisão independente, varredura de dependências, logs sem PII, alarmes e incident response, verificação OWASP, rotas MFA/CSRF/RBAC | **PENDENTE** |
| Provedores externos | Asaas Sandbox real, Resend, Meta Cloud API (templates/consentimento), webhooks HTTPS, fluxos negativos, sem uso live | **PENDENTE — não autorizado** |
| Financeiro e LGPD | Revisão fiscal/legal, termos, direitos e retention; requisitos adiados de F7 reabertos e aceitos antes de lançamento | **PENDENTE** |
| Piloto, rollback e release | Plano aprovado, smoke tests por papel, consentimento, rollback ensaiado, aceite responsável e evidências rastreáveis | **PENDENTE** |

## Regras de progressão
Uma etapa de CI bem-sucedida **não** significa que o sistema está homologado externamente. O teste sintético de restauração **não** valida backup real, PITR ou política de retenção. Registrar cada ambiente, responsável, data, commit, comando, evidência e falha; jamais marcar gate operacional por demonstração. Não usar chaves live, provedores, dados pessoais, deploy, merge ou alteração em `main` sem autorização específica.

**Próximo passo seguro:** planejar staging, inventário de secrets, threat model e gates, mantendo pendentes os itens que exigem recursos externos. Fonte de continuidade: [F8](ai-memory/fases/08-homologacao.md), [ADR-026](ai-memory/03-DECISOES.md), [estado.json](ai-memory/estado.json) e [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3).
