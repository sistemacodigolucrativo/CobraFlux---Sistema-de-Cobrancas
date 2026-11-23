# 06 — Evidências verificáveis e lacunas

Este registro separa **evidência do código no GitHub** de homologação externa. O estado de um workflow pertence ao SHA executado; um sucesso antigo não prova que um commit novo passou.

## F8 #03 — contrato de env e riscos (23/11/2026)
- F8 #03: inventário estático de 33 variáveis, CI de nomes e classificações, threat model e runbook. Código [c210b5d2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/c210b5d2ead0f25d469fb3ad38b8d5d9bb34c280), backend [Actions #45200150015](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200150015), Chromium [Actions #45200150042](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200150042), preflight/restore [Actions #45200149826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149826) e memória [Actions #45200149781](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149781), todos **success** no mesmo SHA. A auditoria não lê valores de segredos nem acessa rede; staging real permanece não homologado.
- Log do preflight [Actions #45200149826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149826): **33 classified / 33 referenced variable names**, 3 testes específicos, sem falha.
- `GEMINI_API_KEY` e `APP_URL` aparecem apenas no exemplo legado; valores e uso operacional não verificados. [Entrega](entregas/2026-11-23-f8-03-inventario-segredos.md).

## F8 #02 — endurecimento de configuração de produção (23/11/2026)
- Código [afb04d84](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/afb04d84f28e3adbe628b40cc0c2f3b28ce92a27), CI backend [CI #45194516204](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194516204), browser [CI #45194517814](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194517814), F8 preflight/restore [CI #45194517198](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194517198) e memória [CI #45194516118](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194516118): **success**, todos no mesmo SHA.
- Testes negativos de URL com credenciais, origem local, protocolo inadequado, path/query/fragment, TLS não exigido, segredos de exemplo, e conservação do modo local. Erros de validação não reproduzem segredos.
- Não prova entropia real, HTTPS/certificado externo, staging, backup offsite nem deploy. [Entrega](entregas/2026-11-23-f8-02-configuracao-producao.md).

## F8 #01 — início técnico verificado (23/11/2026)
- Código [309e28ef](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/309e28ef2ce67e45e2954d465426e84ec0eab359): preflight offline (zero conexões) e restore de backup **sintético** em PostgreSQL 16 descartável. [Workflow F8 #45190560236](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560236) — **success** com dois jobs; [backend #45190560285](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560285), [Chromium #45190560282](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560282) e [memória #45190560470](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190560470) — success no mesmo SHA.
- Teste de restore: migrações 001–021 executadas duas vezes na origem efêmera; organização/cliente artificiais, backup formato custom, restore em destino `*_restore_drill`, verificação de registros e rejeição de origem/target não vazio.
- **Falhas históricas preservadas:** [#45189656787](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45189656787) `internal_code` omitido na fixture; [#45189936453](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45189936453) versão de pg_restore incompatível; [#45190199472](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45190199472) pacote postgresql-client-16 ausente. Corrigidas com fixture válida e cliente em contêiner oficial 16.
- **Ausente:** staging HTTPS, restore real/backup offsite criptografado, PITR, serviços externos, controles legais fiscais e release; [F8](../FASE_8_HOMOLOGACAO.md).
- **Decisão ADR-026:** [requisitos F7 adiados](pendencias/2026-11-23-f7-adiados.md) **não** foram implementados/homologados; continuidade autorizada em F8 somente técnica e isolada.

## F7 — evidências 23/11/2026
- #08: [1fbc06a7](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/1fbc06a7e22f2f9d548daa1e52a7b1654b4c0aa5), benchmark [CI #45183457088](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45183457088) success, 100k clientes/100k cobranças sintéticos, quatro índices usados, 0,359–0,568ms; backend [CI #45183470817](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45183470817), browser [CI #45183471036](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45183471036) e memória [CI #45183470932](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45183470932) success. Não significa produção.
- #09: [49d134a5](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/49d134a5e76d6697c5b0138d6efa537cd225281b), backend [CI #45184164223](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184164223), browser [CI #45184164450](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184164450), memória [CI #45184164277](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184164277) success; trilha de privacidade imutável e separação de notas internas.
- #10: [1c16c6ad](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/1c16c6ad0798b6c77543679738e2a57fb9e831ea), backend [CI #45184992979](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184992979), browser [CI #45184993002](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184993002), memória [CI #45184992978](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184992978) success; vínculo HMAC de pedido ao lote e auditoria sem quitação legal.
- Ainda não há prova de portabilidade integral, erasure legal, SLA externo, anexos seguros, staging, export snapshot ou validação em produção. [Gates de encerramento](fases/07-gates-de-encerramento-2026-11-23.md).

## Incremento anterior — exportação keyset/cursor assinado (21/11/2026)

- **SHA final:** [e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2); [backend/PG #44935128670](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128670), [browser #44935128826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128826), [memória #44935128710](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128710) — todos **success** no mesmo commit.
- **Testado:** MFA/RBAC via sessão/owner, CSRF, cursor assinado HMAC, tentativa de uso cross-tenant, filtros e datasets diferentes, adulteração de token, paginação com timestamp idêntico (precisão µs), exclusão de novos inserts após corte.
- **Registro de falha:** commit 2c94972131cf337c5a96ef83add784f8ac7a0f79: [CI backend #44934990819](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44934990819) **failure** em teste de autenticação com GET indevido retornando 404 no lugar de 401; corrigido em e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2 com GET=404 e POST anônimo=401, CI verde posterior.
- **Lacunas:** sem snapshot de dados modificados/excluídos, sem teste de carga 100 mil+, limite de export 12/h e token expira 30 minutos; sem deploy.

## Incremento anterior — CSV filtrada e paginada (21/11/2026)
- Commit [a157e6f832f5180f7824d3836394b6fabbde5677](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/a157e6f832f5180f7824d3836394b6fabbde5677), [backend/PostgreSQL #44930963112](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963112), [Chromium #44930963010](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963010) e [memória #44930963018](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963018), todos **success** no mesmo SHA.
- Cobertura: prévia contagem por organização sem PII, owner/superadmin, filtro válido/inválido, 400/401/403, limite 1000, offset máximo, dois lotes distintos, metadados de página e CSRF.
- Não comprova snapshot entre páginas, processamento de volumes acima de 100000 de offset, homologação financeira ou infra externa.

## Incremento F7 anterior — alertas internos e ciência auditável (21/11/2026)
- Código [42f7eecf6aa5ee25adb3d135930d73befbeaa6b8](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/42f7eecf6aa5ee25adb3d135930d73befbeaa6b8) com CI [backend/PostgreSQL #44928047228](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047228), [Chromium #44928047306](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047306), [memória #44928047281](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047281): **success** no mesmo SHA.
- Testado: autorização admin/MFA, CSRF, 401/403/404/400/409, ausência de alertas antecipados, reconhecimento de atraso, versão de prazo, repetição bloqueada, evento imutável, não exposição do corpo de tickets, retorno no-store e ausência de alegação de entrega externa.
- Limites: consulta sob demanda no painel, sem push/cron/comunicação externa, política SLA comercial ou homologação de produção.

## Incremento F7 anterior — SLA interno manual (21/11/2026)
- Código [472b0bd84885e1463c5c5b660bb800bf498994d8](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/472b0bd84885e1463c5c5b660bb800bf498994d8) com backend [#44922044208](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044208), browser [#44922044209](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044209) e memória [#44922044232](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044232), todos **success** e vinculados ao SHA.
- Testado: MFA/RBAC, 401/403/404/400/409, CSRF, ISO com fuso, filtros, prazo vencido, remoção, imutabilidade de eventos e ticket encerrado.
- Limites: prazos configurados manualmente sem SLA padrão, sem alertas/entrega externa e sem homologação operacional.

## Incremento F7 anterior — timeline interna de status
- Código: [96e58848cb696489560fa14fcbceaf19357d2566](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/96e58848cb696489560fa14fcbceaf19357d2566).
- GitHub Actions backend/Postgres/integration/builds: [#44920626498](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44920626498) — **success**.
- GitHub Actions browser Chromium desktop/mobile: [#44920626428](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44920626428) — **success**.
- Integridade da memória: [#44920626521](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44920626521) — **success** (12 fontes originais e 10 fases).
- Negativos cobertos: 401 anon, 403 owner/operator, 404 ticket inexistente, 400 paginação inválida, no-store.
- Não foi enviada nenhuma notificação externa; não equivale a SLA.
 
## Incremento F7 anterior — respostas no portal (21/11/2026)
- **Código:** [4dcbb80f2ebfa817b3d512c94502d697d4077842](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4dcbb80f2ebfa817b3d512c94502d697d4077842).
- **CI backend/migrações/integração:** [#44915970990](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915970990) — **success**, com instalação, typecheck, domain, security, UI, PostgreSQL migrações duas vezes, multi-tenant integration e builds demo/produção.
- **CI navegador:** [#44915971125](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915971125) — **success**, Chromium desktop/mobile.
- **Antes da correção:** workflow do commit **fbe9b34** falhou na checagem TypeScript: a rota de resposta possuía retorno com possível HTTP code undefined; corrigido no commit 4dcbb80. **Não apagar registro de falha**.
- **Cobertura nova em server/phase7.integration.test.ts:** login, MFA, proprietário sem autorização admin, CSRF, read cross-tenant 404, idempotência chave/corpo, mensagens de contato público impedidas e ticket encerrado.

## Incremento anterior F7
- Commit [9c8544730b47059f4f8977bd950e46227784c9c0](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/9c8544730b47059f4f8977bd950e46227784c9c0).
- Backend/PG [#44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191) **success**; browser [#44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168) **success**.
- Escopo: migração 016, gestão superadmin/MFA, auditoria, triagem de tickets LGPD, relatórios MRR/GPV, CSV protegido e UI.

## Outras evidências pontuais
- F2: [browser #44817066812](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44817066812), commit 6dd1798, testado.
- F6: [backend #44870002881](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44870002881) e [browser #44870002890](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44870002890), commit e79c829de377fa816468ab409b9d4d233b019021, testados.
- Dados operacionais, preços reais, token Meta/PSP e estados financeiros **não** são evidenciados por esses runs.

## Evidências que NÃO existem no snapshot
**Nenhuma comprovação de:** deployment HTTPS; delivery Resend; backup restaurado off-site/PITR; transações Asaas Sandbox externas e Pix live; Meta WABA/entrega; pagamento de assinatura SaaS real; políticas de retenção LGPD juridicamente validadas; pilotos; distribuição Android assinado/AAB/Play. Manter **PENDENTE** até prova legítima.

## O que exigir de um novo agente
Para cada entrega: SHA, diff, arquivos lidos/alterados, nome do comando/CI, workflow ID, conclusão específica, resultado de testes negativos, ambiente e dados de teste, alcance e limites. Se CI falhar ou não houver acesso ao job, declarar **IMPLEMENTADA — NÃO VALIDADA**, não **testada**.
