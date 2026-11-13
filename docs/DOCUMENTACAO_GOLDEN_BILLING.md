# Documentação Técnica e Operacional — Golden Billing SaaS (v1.0 Demo)

## 1. Visão Geral do Projeto
O **Golden Billing SaaS** é uma plataforma de gestão financeira, cobranças recorrentes e lembretes para profissionais autônomos e pequenos prestadores de serviços no Brasil (personal trainers, nutricionistas, professores particulares, consultores e clínicas de estética).

Esta versão **1.0 Demonstrativa** é 100% navegável e persistente localmente via **IndexedDB**, sem realizar movimentações financeiras reais ou envios verdadeiros de WhatsApp.

## 2. Quatro Ambientes Isolados
1. **Site Institucional (`src/pages/institutional/`)**: Apresentação comercial, demonstração interativa, comparação de planos, cadastro/login/recuperação, FAQ, suporte e termos LGPD.
2. **Painel do Profissional (`src/pages/professional/`)**: 10 módulos completos (Início, Clientes, Cobranças, Recorrências, Pagamentos, Mensagens e Lembretes, Relatórios, Notificações, Minha Assinatura e Configurações) isolados por `organizationId`.
3. **Página Pública de Pagamento (`src/pages/public/PublicPaymentPage.tsx`)**: Acessível por `#/pagar/:publicId` sem necessidade de login do pagador, com QR Code ilustrativo, código copia-e-cola demonstrativo, simulador de eventos e comprovante demonstrativo.
4. **Painel Administrativo Geral (`src/pages/admin/AdminView.tsx`)**: Gestão SaaS (MRR separado estritamente do GPV dos profissionais), bloqueio/suspensão de contas, edição de planos, central de simulação temporal, monitoramento de mensagens, auditoria, configurações globais e suporte.

## 3. Arquitetura e Estrutura de Pastas
- `src/types/domain.ts`: Todas as 20 entidades principais (Users, Organizations, Clients, Services, Charges, RecurrenceRules, Payments, PaymentEvents, Subscriptions, SubscriptionPlans, MessageTemplates, MessageJobs, MessageEvents, Notifications, PushSubscriptions, ProviderConnections, AuditLogs, UserPreferences, ConsentRecords, GlobalSettings).
- `src/domain/money.ts`: Aritmética financeira exclusiva em centavos inteiros (`integer cents`), taxas e descontos.
- `src/domain/recurrence.ts`: Cálculo de ciclos no calendário brasileiro (`America/Sao_Paulo`), ajuste seguro de dias 29/30/31 e proteção por `cycleKey`.
- `src/domain/finance.ts`: Máquina de estados de cobranças, chave de idempotência contra pagamento duplicado, abatimento parcial, estorno preservando histórico, limites de planos, validação CSV com Zod e métricas determinísticas.
- `src/services/contracts.ts`: Contrato estável `IGoldenBillingService` desacoplando a UI da camada de dados.
- `src/services/demoService.ts`: Implementação demonstrativa conectada ao `IndexedDB` (`src/services/db.ts`) e à semente inicial (`src/services/seed.ts`).

## 4. Plano de Substituição por Backend Real
Para migrar para produção sem reconstruir as páginas React:
1. Criar `src/services/httpApiService.ts` implementando `IGoldenBillingService` apontando para uma API REST/GraphQL autenticada com PostgreSQL.
2. Trocar a exportação em `src/services/demoService.ts` (ou via variável de ambiente `VITE_USE_REAL_API=true`).
3. Mover segredos de provedores (Asaas, Mercado Pago, Efí, WhatsApp Business Cloud API, Web Push VAPID) exclusivamente para o servidor backend e validar assinaturas de webhooks no servidor.

## 5. Regras Financeiras e Critérios de Aceite
- Valores monetários armazenados em centavos inteiros.
- Um mesmo `idempotencyKey` nunca liquida uma cobrança duas vezes.
- Reduzir (downgrade) um plano nunca apaga clientes existentes; apenas bloqueia novas inclusões acima da cota.
- Pagamentos confirmados cancelam automaticamente lembretes pendentes daquela cobrança.
- Testes unitários automatizados em `src/domain/finance.test.ts` executados via `npx --yes tsx --test`.
