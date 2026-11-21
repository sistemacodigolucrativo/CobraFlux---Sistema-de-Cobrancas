# Entrega Fase 7 — respostas de suporte no portal autenticado

**Data:** 21/11/2026. **Escopo:** implementar parte aprovada de BL-006 (respostas e histórico); **não** SLA, notificação externa ou anexo.
**Branch:** feat/production-foundation. **SHA base:** 9c8544730b47059f4f8977bd950e46227784c9c0. **SHA validado:** 4dcbb80f2ebfa817b3d512c94502d697d4077842.

## Mudanças
- server/migrations/017_support_portal_replies.sql — resposta append-only, tenant, autor, chave idempotente (ticket + clientRequestId).
- server/phase7-routes.ts — administrador autenticado com MFA/CSRF para POST; leitura de histórico admin e tenant; 404 para cross-tenant; ticket público sem canal de retorno verificado não recebe resposta; tickets fechados bloqueiam novas respostas.
- src/services/productionApi.ts — tipos e endpoints; src/pages/production/AdminOperationsView.tsx e AccountOperationsView.tsx — editor e histórico acessíveis apenas no portal.
- server/phase7.integration.test.ts — valida autorização, CSRF, idempotência, mensagens públicas/fechadas e isolamento de organizações.
- docs/FASE_7_ADMIN_RELATORIOS_LGPD.md, Issue #3 — documentação incrementada.

## Evidências
- Commit: https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4dcbb80f2ebfa817b3d512c94502d697d4077842
- GitHub Actions backend: https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915970990 — success, TypeScript, migração duas vezes, domínio, segurança, integração e builds.
- GitHub Actions Chromium: https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915971125 — success, desktop/mobile.
- Primeiro CI de uma revisão intermediária falhou TypeScript; corrigido no SHA final. Não houve deploy ou merge.

## Limites
Respostas **portal_only**, emailSent=false; não há delivery real por e-mail/WhatsApp, SLA/alertas, anexos e abertura/verificação pública. Revisão LGPD de retenção e testes externos ainda pendentes.
**Resultado:** IMPLEMENTADA — TESTADA EM CI; FASE 7 CONTINUA EM DESENVOLVIMENTO.
**Próxima ação sugerida:** SLA interno e observabilidade ou LGPD/export, conforme priorização do backlog aprovado.
