# CobraFlux Demo — Android WebView

Versão de testes. Android 9.0+ (API 28), incluindo dispositivos Xiaomi com MIUI 10 quando executam Android 9 ou posterior.

**Compilação:** Gradle 8.13, Android Gradle Plugin 8.9.2 e Android SDK 36. `gradle :app:assembleDebug` executado em `mobile/android/`.

**APK:** `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

Inclui central de quatro ambientes, WebView, perfis demonstrativos e botão para copiar credenciais. Exclusivamente demonstrativo; não realiza Pix reais.

**Privacidade:** permite páginas externas somente via navegador/outros apps, mantém navegação do domínio demo em WebView. A validade dos links depende do servidor remoto. Nenhum segredo de produção está embutido.

O APK debug é assinado com chave gerada pelo ambiente de compilação. Não serve como build de produção/loja.
