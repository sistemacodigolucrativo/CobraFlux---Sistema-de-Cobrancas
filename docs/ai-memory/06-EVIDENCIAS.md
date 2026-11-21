# 06 — Evidências verificáveis e lacunas

Este registro separa **evidência do código no GitHub** de homologação externa. O estado de um workflow pertence ao SHA executado; um sucesso antigo não prova que um commit novo passou.

## Último incremento F7 validado — SLA interno manual (21/11/2026)
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
