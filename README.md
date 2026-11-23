# CobraFlux — Sistema de Cobranças

O **CobraFlux** está sendo convertido de um demonstrativo **Golden Billing SaaS** para uma aplicação web de cobrança para profissionais, com backend Express/TypeScript e PostgreSQL. **O projeto não está publicado como operação financeira real.**

## Para continuar o desenvolvimento com outra IA
- **Leia primeiro:** [AGENTS.md](AGENTS.md) e [docs/ai-memory/00-LEIA-PRIMEIRO.md](docs/ai-memory/00-LEIA-PRIMEIRO.md).
- **Ponto de retomada:** [docs/ai-memory/01-ESTADO-ATUAL.md](docs/ai-memory/01-ESTADO-ATUAL.md), [estado.json](docs/ai-memory/estado.json).
- **Handoff histórico integral:** [docs/ai-memory/originais/](docs/ai-memory/originais/), incluindo 119 requisitos, ADRs e backlog.
- **Fases 0–9:** [docs/ai-memory/fases/](docs/ai-memory/fases/).
- **Histórico:** [docs/ai-memory/05-DIARIO-DE-DESENVOLVIMENTO.md](docs/ai-memory/05-DIARIO-DE-DESENVOLVIMENTO.md), [entregas](docs/ai-memory/entregas/).
- **Roadmap oficial:** [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3); implementação em [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2).

**Branch de implementação autorizada:** feat/production-foundation. **main preservada**, sem merge/deploy sem autorização.

**Atualizado em 23/11/2026:** Fase 8 nº 04 de segurança de supply chain concluída tecnicamente e validada no código `4d43aa6c`: `package-lock.json` npm v3 (674 entradas), `npm ci`, seis workflows com permissões somente leitura e Actions SHA pinadas; `docker build` local aprovado **sem publicação**. [Documentação](docs/ai-memory/entregas/2026-11-23-f8-04-ci-reprodutivel.md) e [runbook](docs/security/phase8-supply-chain-runbook.md). **F8 não homologada**: sem staging externo, TLS/DB/backup real, CVE scan completo, PSP/Meta/Resend, deploy ou Play. F7 ADR-026 mantém [requisitos adiados — NÃO concluídos](docs/ai-memory/pendencias/2026-11-23-f7-adiados.md).

Essa memória é **persistente via commits**: futuras IAs precisam atualizar os documentos a cada entrega, revalidar a HEAD real e nunca confundir documentação histórica com estado operacional.
