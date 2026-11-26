# CobraFlux — Fase 6: assinaturas e faturamento SaaS (desenvolvimento)

**Escopo:** contrato de planos da própria plataforma, quotas multi-tenant, cotações, cupons, pedidos de upgrade e faturas financeiras do CobraFlux. **Não confundir com cobranças dos clientes**, que permanecem na tabela \`charges\` e no PSP Asaas Sandbox contratado pelo profissional.

**Status:** implementação em \`feat/production-foundation\`; \`main\` intacta, PR #2 draft. Não há ambiente de staging HTTPS nem credenciais para um PSP **da plataforma**. Uma solicitação gera fatura **em rascunho**, mas **não realiza checkout real e não concede acesso premium**.

## Arquitetura e isolamento financeiro

- Migração 015 cria \`saas_plans\`, \`saas_subscriptions\`, \`saas_coupons\`, \`saas_invoices\`, \`saas_change_requests\` e \`saas_subscription_history\`.
- Assinaturas são relacionadas **apenas à organização**. Cada organização existente é migrada para um registro \`free\`; novas organizações o recebem automaticamente por trigger transacional, sem depender do frontend.
- Faturas da plataforma usam tabela própria, valores inteiros em centavos e moeda BRL. Não integram \`charges\`, \`payment_events\`, \`sandbox_issuances\` ou KPIs de receitas dos clientes.
- Planos pagos Starter e Business nascem sem preço (\`NULL\`) e não publicados. Somente administrador global com sessão protegida por MFA pode definir valores e limites; nenhum preço comercial foi presumido.
- Quotas técnicas iniciais do plano Free são provisionais e podem ser revistas antes do lançamento: **250 clientes ativos, 60 serviços ativos, 300 rascunhos/mês, 50 regras de recorrência, 3 membros e 100 lembretes/mês**. Os planos pagos possuem limites maiores, mas sem preço ou habilitação comercial por padrão.
- O painel Meu Plano mostra catálogo, consumo/limites, estado da assinatura, pedidos de alteração e faturas. A API nunca devolve segredos de pagamento.

## Pedido de mudança de plano — sem cobrança automática

1. O titular consulta planos e cotação. Descontos por cupom são calculados em centavos, arredondados para baixo. Cupons nunca transformam um plano pago em gratuito.
2. O titular solicita mudança com um identificador de idempotência. Somente **um pedido pendente por organização** é permitido. A transação grava uma fatura em rascunho (\`saas_invoices.status='draft'\`) e um pedido vinculado.
3. A assinatura permanece Free, ou permanece no plano pago atual, até que exista confirmação segura e verificável de um pagamento feito **à própria plataforma**.
4. O usuário pode cancelar uma solicitação ainda não enviada ao provedor; a fatura correspondente é anulada (\`void\`) e a assinatura não se altera.
5. Um cliente não pode enviar parâmetros de status \`paid\`, valores de confirmação ou \`provider_invoice_id\` para elevar seus privilégios. **A integração de checkout e webhook do PSP SaaS ainda é um marco pendente da Fase 6.**

O sistema não oferece endpoint de pagamento manual administrativo, crédito virtual nem caminho público que marque assinatura como paga. Um cupom só terá utilização contabilizada ao integrar confirmação financeira real, com controle transacional de limites e reembolso.

## Direitos e inadimplência

O acesso premium exige assinatura ativa dentro do período pago ou estado \`past_due\` dentro de prazo de tolerância. O status é verificado **no backend**, nunca em localStorage. Acesso a recursos básicos permanece disponível para clientes com assinatura vencida; novos registros acima do limite Free são impedidos e nenhum dado anterior é excluído.

- Rotas protegidas de clientes, serviços, cobranças, convites de equipe, recorrências e filas WhatsApp conferem quotas em uma transação que bloqueia a linha da organização, para evitar excesso sob concorrência.
- Reativar um cliente ou serviço arquivado também exige capacidade, não apenas novos cadastros.
- A geração de recorrências pausa a regra, com auditoria, se a quota de cobrança mensal for atingida.
- O gerador de lembretes automáticos revalida as condições e a quota imediatamente antes do INSERT; não manda mensagens.
- O worker \`saas-worker.ts\` somente faz manutenção de estados: fatura pendente vencida → \`past_due\`; prazo de tolerância de sete dias → \`restricted\`; período pago encerrado com cancelamento solicitado → plano Free; período expirado sem renovação verificada → \`restricted\`.
- Nenhum worker marca \`paid\`, cria PIX, capta cartão, reembolsa ou solicita cobrança em nome do cliente.

## Interfaces e endpoints

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| GET | \`/api/saas/plans\` | Catálogo público da sessão |
| GET | \`/api/saas/subscription\` | Entitlements, uso e estado do tenant |
| GET | \`/api/saas/invoices\` | Faturas da plataforma, apenas titular |
| GET | \`/api/saas/change-requests\` | Pedidos da organização |
| POST | \`/api/saas/quote\` | Cotação, cupom sem resgate |
| POST | \`/api/saas/change-requests\` | Solicitar upgrade, sem pagamento real |
| POST | \`/api/saas/change-requests/:id/cancel\` | Anular pedido de draft |
| POST | \`/api/saas/cancellation\` | Agendar/reverter cancelamento de assinatura ativa |
| PATCH | \`/api/admin/saas/plans/:code\` | Ajustar preço/limites, somente admin global MFA |
| POST | \`/api/admin/saas/coupons\` | Cadastrar cupom, somente admin global MFA |

Todas as alterações exigem sessão, papel autorizado e CSRF. Não existe endpoint público de override ou simulação de pagamento de SaaS.

## Execução quando houver PostgreSQL

Sem alterar estado:

\`\`\`bash
npm run migrate
npm run saas:reconcile -- --dry-run
\`\`\`

Uma execução pontual de manutenção, **somente após autorização operacional**:

\`\`\`bash
SAAS_MAINTENANCE_ENABLED=true npm run saas:reconcile -- --once --limit=25
\`\`\`

Não há cron ativo, hospedagem, PSP SaaS cadastrado, API de checkout real nem webhook financeiro de SaaS em uso. A \`main\` e a PR não são publicadas por essa execução.

## Testes e critérios de aceite

- Testes unitários: período pago, expiração, grace period, estados restritos, descontos percentuais e fixos sem cobrança zero.
- Testes PostgreSQL: trigger Free para novas organizações, consulta e cotações, ausência de upgrade sem PSP, fatura isolada, idempotência, tenant, limite de clientes, arquivamento/reativação e manutenção de inadimplência.
- Smoke/UI E2E desktop/mobile: navegação Meu Plano, catálogo sem preços inventados, visualização de quotas e nenhuma cobrança direta.
- **Faltante para concluir faturamento real**: definir e contratar PSP da plataforma, tokenização segura, ambiente sandbox e staging HTTPS, checkout, cancelamento/estorno, idempotência e webhook autenticado da conta **da plataforma**, conciliação e verificação de recibo; testes de chargeback; tributos/NFSe; faturamento legal; alertas, restore PostgreSQL e piloto.
- **Faltante operacional**: configuração de preço/cupom pela administração com revisão comercial, execução real de backups e staging, aprovação de go-live.

## Referências e princípios

As transições \`past_due\`, \`unpaid\`, cancelamento e recuperação separam acesso e recebimento, refletindo a arquitetura de ciclo de assinaturas descrita na documentação oficial de plataformas de faturamento.
- PostgreSQL: https://www.postgresql.org/docs/16/explicit-locking.html
- Stripe Billing lifecycle (referência conceitual, **Stripe não está integrado**): https://docs.stripe.com/billing/subscriptions/overview

**Aviso técnico:** testes automatizados com PostgreSQL local em CI não comprovam cobrança real em PSP nem comportamento de uma conta hospedada.
