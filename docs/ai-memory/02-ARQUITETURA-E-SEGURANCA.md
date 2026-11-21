# 02 — Arquitetura vigente, invariantes e riscos

**Escopo:** resume as descobertas do handoff original **05-ARQUITETURA-E-ESTADO-TECNICO** e do código remoto até 21/11/2026. Antes de alterar, ler arquivos atuais no GitHub.

## Tecnologias e modos isolados
- Frontend React 19 + TypeScript 7 + Vite 8 + Tailwind 4, com telas demonstrativas existentes.
- Modo de demonstração: lógica/armazenamento demonstrativo em IndexedDB; somente referência de UX, não banco real nem fonte de autorização/pagamento.
- Modo operacional: **VITE_APP_MODE=production**, **ProductionApp**, cliente **src/services/productionApi.ts**, backend Express/TypeScript e PostgreSQL 16+ com migrações versionadas; sem depender de valores simulados de browser.
- Papéis: **owner / operator / super_admin**; titularidade de organização derivada da sessão e membership. Superadmin exige MFA TOTP.
- Credenciais/segredos apenas no backend/ambiente seguro; jamais commitar ou copiar para docs/logs.
- Versões e dependências são snapshot: conferir package.json antes de recomendar atualização.

## Domínios reais do servidor
- Segurança: **server/index.ts**, sessões revogáveis, verificação de e-mail, tokens de recuperação, MFA TOTP, rate limits e CSRF.
- Operações: **server/operations.ts**, **server/team.ts**, clientes/serviços/drafts/CSV/equipe.
- Pix em Asaas **sandbox**: emissão, webhook, estornos, recibos, conciliação e cancelamento; nunca afirmar dinheiro real.
- Recorrências: geram apenas rascunhos; worker idempotente por ciclo (não cobra Pix sozinho).
- WhatsApp Meta: credenciais criptografadas, consentimento versionado, opt-out STOP/PARAR, fila, webhook validado e backoff. Envio live OFF.
- SaaS: contas, quotas, planos Free/Starter/Business, faturas **draft** e lifecycle; **receita da plataforma não é GPV de profissionais**.
- Admin/reports: **server/phase7-routes.ts**, métricas multi-tenant, suspensão/reativação, tickets, triagem LGPD, relatórios CSV e painel superadmin.
- Migração **016**: direitos LGPD, eventos de status de ticket e audit_logs append-only. Migração **017**: respostas no portal com retenção ainda dependente de revisão legal.
- Android: branch demonstrativa **android-webview-demo-debug**, não app operacional Play.

## Invariantes de segurança
1. **Organization ID do token/sessão, nunca trust no body/query para autorização.** Todo acesso de cliente/ticket/export tem isolamento por tenant.
2. **MFA+RBAC no servidor**, além de menus condicionais. Toda mutação autenticada protegida contra CSRF; Zod em entradas não confiáveis.
3. Dinheiro em **centavos inteiros**, sem botão/API admin que defina paid arbitrariamente; provider verificado e idempotência transacional antes de qualquer reconhecimento.
4. Não repetir automaticamente POST financeiro ou Meta sob timeout incerto. Reconciliar por consulta segura.
5. Dados pessoais minimizados em payloads, logs, exportações e auditoria; evitar fórmulas CSV no Excel.
6. Retenção, exclusão e portabilidade LGPD exigem processo auditável e revisão legal; não eliminar automaticamente registros fiscais/financeiros.
7. Backup scripts não comprovam restauração real; CI usa PostgreSQL efêmero. Workflows / documentação não são staging.
8. Status de entrega **portal_only** nunca implica e-mail enviado ou lido.

## Verificações e build
Node.js 22; npm run lint; npm run test:domain; npm run test:server; npm run test:ui; migrações em PostgreSQL isolado **duas vezes**; npm run test:integration; npm run build; VITE_APP_MODE=production npm run build; npm run test:e2e (Chromium). Confirmar comandos atuais no package.json.

## Fontes internas
- docs/EXECUCAO_PRODUCAO_FUNDACAO.md
- docs/FASE_1_SEGURANCA_OPERACAO.md até docs/FASE_7_ADMIN_RELATORIOS_LGPD.md
- server/migrations/001_core.sql até 017_support_portal_replies.sql no último incremento
- .github/workflows/production-foundation.yml e .github/workflows/phase2-browser.yml

**Não fazer:** merge, release, configuração de PSP/META live, deploy, exclusão irreversível, cobrança/planos pagos ou alteração de preços sem autorização específica.
