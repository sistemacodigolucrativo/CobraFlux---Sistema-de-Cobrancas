# CobraFlux — Fase 9: Android e Google Play

**Estado em 23/11/2026:** **EM DESENVOLVIMENTO — F9 #01 implementação de base Android segura validada em CI; SEM HOMOLOGAÇÃO PLAY, SEM STAGING REAL**.

## Escopo e arquitetura
- Android como shell WebView **para site operacional real**, no futuro servido pela mesma origem HTTPS de React+Express; API usa cookie seguro e sessão no backend. Não criar ledger, pagamentos, credenciais ou dados de clientes no app nativo.
- Reaproveitamento da antiga branch Android limitado à avaliação e a ícones vetoriais; **não** usar URLs e contas demonstrativas.
- `minSdk 28`, `targetSdk/compileSdk 36`, Gradle/AGP/Java com CI GitHub Actions, sem depender de Android Studio local.
- Todo conteúdo de navegador restrito a uma origem de build configurada e pública. API real/staging requer autorização e verificação externa primeiro.

## Implementação #01
Código [7208ae2f](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/7208ae2f96e27d7873294d7fe47caa72401ef5a7): **8 workflows success no mesmo SHA**, incluindo Android/JUnit/APK [CI #45218842168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842168), backend [CI #45218842365](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842365), Chromium [CI #45218842181](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842181), restore PostgreSQL sintético [CI #45218842496](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842496), supply chain/9 workflows [CI #45218842917](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842917), audit/SBOM [CI #45218842200](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842200), release gates F8 [CI #45218842473](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842473) e memória [CI #45218842739](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842739).
- Detalhes técnicos, riscos, testes e hash do APK: [entrega F9 #01](ai-memory/entregas/2026-11-23-f9-01-android-debug.md).
- Código Android: [mobile/android](../mobile/android/README.md), policy de navegação `OriginPolicy.java`, testes JUnit; guard de fonte `scripts/phase9-android-contract.mjs`.
- A prévia sem origem definida não conecta a servidores, sendo inadequada para validar fluxos financeiros, usuários ou APIs.

## Critérios para próximos incrementos
| Módulo | Estado | Critério de aceitação |
| --- | --- | --- |
| Origem HTTPS e API real | PENDENTE — bloqueio F8 | domínio/proxy/cookies/CSRF em staging autorizado e E2E |
| Navegação segura | TESTADA em unidade/compilação | QA real de links/redirects, back e rede indisponível |
| Downloads CSV/PDF | BLOQUEADOS | autorização de sessão, Content-Disposition, redirecionamentos, MIME e armazenamento seguro |
| File chooser/upload | BLOQUEADO | picker Android seguro, tipos/tamanho, controle LGPD/F7 e permissões |
| Push e notificações | NÃO IMPLEMENTADOS | consentimento, Firebase/Meta e política, testes com destinatário QA |
| Android OEM/MIUI | NÃO HOMOLOGADO | testes em aparelhos e emuladores por versões/temas |
| Loja e faturamento | NÃO IMPLEMENTADOS | revisar Google Play Payments, escolha de modelo e backend de verificação de compras |
| AAB/signing/Play | NÃO AUTORIZADO | package name e keystore aprovados, App Signing, Play Console, internal testing, data safety/privacy |
| F8 operacional | NÃO HOMOLOGADA | 12 gates externos + 4 avisos moderate tratados |
| F7 ADR-026 | ADIADA, NÃO CONCLUÍDA | direitos LGPD, suporte/SLA, export, acessibilidade e segurança aprovados |

## Regra de continuidade
A fase 9 prossegue **apenas em preparação técnica** até que staging e demais gates F8/F7 obtenham evidências e autorizações. Debug APK não equivale a publicação; App Signing e monetização devem ser deliberados antes de criar release. O código de demo Android não autoriza novas permissões ou destinos.
