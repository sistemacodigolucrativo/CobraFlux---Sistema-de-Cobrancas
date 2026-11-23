# Fase 9 — Android e Google Play

**Estado em 23/11/2026:** **EM DESENVOLVIMENTO — F9 #01 BASE ANDROID API36 VALIDADA EM CI; F8 OPERACIONAL E PLAY AINDA NÃO HOMOLOGADAS**

## Implementação identificada
Branch android-webview-demo-debug documentada, baseada em demonstração; não há app de produção homologado.

## Evidência de verificação
Histórico da branch demo não comprova build AAB do sistema real.

## Pendências (ainda NÃO entregues)
Conectar à API real segura; cookies/downloads/notifications/responsividade; target API exigido pela Play, AAB assinado, internal testing, políticas Play e dispositivos físicos.

## Próxima ação autorizada ou necessária
Somente após web operacional e F8; auditar branch Android atual antes de alterar.

## Risco de interpretação
WebView de demo não é release Android.

## Fonte técnica primária
Issue #3 e branch android-webview-demo-debug

## Referências cruzadas
- [Estado atual](../01-ESTADO-ATUAL.md)
- [Decisões](../03-DECISOES.md)
- [Backlog](../04-BACKLOG.md)
- [Diário](../05-DIARIO-DE-DESENVOLVIMENTO.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)


## Como continuar esta fase
Antes de marcar qualquer item como completo: conferir branch e SHA no GitHub, revisar implementação presente, estabelecer testes de aceitação, não duplicar funcionalidade, criar registro em **../entregas/**, atualizar esta fase e **estado.json**. Distinguir código testado, homologação externa e publicação.

## Incremento nº 01 — shell Android seguro e GitHub Actions (23/11/2026)

- Código [7208ae2f](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/7208ae2f96e27d7873294d7fe47caa72401ef5a7): **8 workflows success no mesmo SHA**, incluindo Android/JUnit/APK [CI #45218842168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842168), backend [CI #45218842365](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842365), Chromium [CI #45218842181](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842181), restore PostgreSQL sintético [CI #45218842496](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842496), supply chain/9 workflows [CI #45218842917](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842917), audit/SBOM [CI #45218842200](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842200), release gates F8 [CI #45218842473](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842473) e memória [CI #45218842739](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842739).
- Projeto `mobile/android/` com `minSdk 28`, `targetSdk/compileSdk 36`, WebView de origem HTTPS exata, bloqueio do protocolo cleartext e conteúdo de arquivo local, 3 testes JUnit, política source-check offline e build debug por GitHub Actions.
- O APK do CI é **debug**, com assinatura temporária e **sem endereço de staging**, portanto mostra “Ambiente não configurado”. Não contém as credenciais/links do ramo Android demo. Registro do hash e artefato na [entrega](../entregas/2026-11-23-f9-01-android-debug.md).
- Requisitos Play sobre target API e política de pagamentos revisados; AAB, signing, preço e Billing ainda **não autorizados**.
- **F8 ainda tem 12 gates não cumpridos e quatro avisos moderate**, F7 ADR-026 ainda está adiada. Proibido marcar Android operacional, app publicado, backend conectado ou testes físicos aprovados.
- [Plano técnico F9](../../FASE_9_ANDROID_PLAY.md); próximo escopo seguro: downloads/upload, sessões e testes via emulador sem provedores, após análise de PII.
