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

**Atualizado em 23/11/2026:** Fase 9 iniciada com módulo Android API36 seguro em `mobile/android/` e build APK debug/JUnit via GitHub Actions. Código [7208ae2f](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/7208ae2f96e27d7873294d7fe47caa72401ef5a7): **8 workflows success no mesmo SHA**, incluindo Android/JUnit/APK [CI #45218842168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842168), backend [CI #45218842365](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842365), Chromium [CI #45218842181](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842181), restore PostgreSQL sintético [CI #45218842496](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842496), supply chain/9 workflows [CI #45218842917](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842917), audit/SBOM [CI #45218842200](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842200), release gates F8 [CI #45218842473](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842473) e memória [CI #45218842739](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842739). [Entrega F9](docs/ai-memory/entregas/2026-11-23-f9-01-android-debug.md), [plano](docs/FASE_9_ANDROID_PLAY.md). O APK não possui origem HTTPS configurada nem contas demo, **não funciona com backend real por enquanto e não está homologado para Google Play**. F8 tem 12 gates externos e 4 avisos moderate não resolvidos; F7 ADR-026 permanece adiada/não concluída. Sem AAB assinado, merge ou deploy.

Essa memória é **persistente via commits**: futuras IAs precisam atualizar os documentos a cada entrega, revalidar a HEAD real e nunca confundir documentação histórica com estado operacional.
