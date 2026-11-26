# CobraFlux — Android operacional (F9, prévia técnica)

Módulo **novo** na feature branch, separado da antiga `android-webview-demo-debug`. Não embute credenciais, sites demo ou URL de produção. **Não homologado para Play Store nem integrado a um staging real.**

Android 9+ (minSdk 28); compileSdk/targetSdk 36; Gradle 8.13, AGP 8.9.2, Java 17. O applicationId provisório `com.cobraflux.app` precisa verificação de titularidade antes de publicação.

A configuração opcional `COBRAFLUX_ANDROID_ORIGIN` aceita somente endereço HTTPS de origem canônica sem caminho nem credenciais. O endereço é **público no APK**; não é um lugar para segredos. Sem origem, o APK debug não acessa rede e apresenta uma tela informativa. Exemplo apenas após aprovação: `COBRAFLUX_ANDROID_ORIGIN=https://staging.seu-dominio-aprovado.com gradle :app:assembleDebug`.

WebView restringe navegação a primeira parte HTTPS; bloqueia arquivo local, acesso ao conteúdo, cleartext, cookies de terceiros, JavaScript bridge, múltiplas janelas e SSL inválido. Links externos com gesto explícito abrem outro app. Upload, download autenticado, notificações, deep links e billing continuam BLOQUEADOS até requisitos e testes próprios.

O CI pode gerar um APK **debug** com assinatura efêmera do runner, não AAB de release nem assinatura Play. Sem Android Studio local. A API Express/PostgreSQL real depende de staging F8 e 12 gates externos; nenhuma conta/pagamento real testado.
