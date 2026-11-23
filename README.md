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

**Atualizado em 23/11/2026:** controles locais F8 #01–09 desenvolvidos/testados, Código [aa155cb8](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/aa155cb880f72c99d972fa58de758a810880b50f): backend [CI #45210349937](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349937), navegador [CI #45210349834](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349834), restore sintético [CI #45210349944](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349944), supply chain/Docker [CI #45210349882](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349882), npm audit/SBOM [CI #45210350161](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210350161), gates/smoke simulados [CI #45210350118](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210350118), memória [CI #45210349835](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349835) — **7 success no mesmo SHA**. Auditoria npm encontrou **4 vulnerabilidades moderadas não resolvidas**, SBOM 673; 12 gates externos em aberto, telemetria mínima, contêineres pinados e rollback somente offline. [Entrega](docs/ai-memory/entregas/2026-11-23-f8-05-09.md), [runbook F8](docs/security/phase8-homologation-runbook.md). **F8 operacional não homologada, nenhum staging real, dinheiro/Meta live, merge/deploy, nem conclusão dos requisitos F7 adiados por ADR-026.**

Essa memória é **persistente via commits**: futuras IAs precisam atualizar os documentos a cada entrega, revalidar a HEAD real e nunca confundir documentação histórica com estado operacional.
