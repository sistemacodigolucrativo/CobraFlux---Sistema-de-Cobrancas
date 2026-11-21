# CobraFlux — Fase 7 · Administração, relatórios e LGPD (incremento inicial)

**Branch:** \`feat/production-foundation\` · **PR #2:** rascunho · **main:** intacta.

A Fase 6 foi concluída em **código** com CI verde, mas a implementação do PSP SaaS e a homologação financeira permanecem pendentes. Por decisão do projeto, testes reais em infraestrutura são adiados para homologação; eles não se tornam concluídos por existir código. Esta entrega inicia a **Fase 7**, com controles administrativos e relatórios reais de PostgreSQL.

## Permissões e segurança

- Painel "Administração" e endpoints sob \`/api/admin/*\`: **somente \`super_admin\`**, cujo acesso já depende de MFA TOTP validado no login. A navegação esconder um menu NÃO substitui a validação de papel no servidor.
- Relatórios de operação (\`/api/reports/summary\`): operador, titular e superadmin só enxergam dados da **organização da sessão**.
- Trilha de auditoria e exportação CSV do tenant: só \`owner\` ou \`super_admin\` da sessão, com \`organization_id\` sempre derivado do cookie de sessão.
- Exportação por POST protegida por CSRF, limitada a 1000 registros por arquivo e 12 exportações/hora por usuário e organização. \`Content-Disposition: attachment\`, \`Cache-Control: no-store\`. Registro de auditoria para cada arquivo.
- CSV sanitiza os prefixos \`=\`, \`+\`, \`-\`, \`@\`, mesmo quando precedidos de caracteres em branco; evita fórmulas ao importar em planilhas.
- Exportações trazem colunas explicitamente permitidas, **não** contêm credenciais do PSP/Meta, QR/Pix, sessões, senhas, tokens públicos ou corpo bruto dos webhooks.
- Auditoria retorna ator, ação, tipo, ID e horário, **sem \`audit_logs.metadata\`**, que pode conter dados pessoais. Trigger impede atualização/deleção acidental das linhas de auditoria já existentes. **O banco continua exigindo governança, backups e controle de acesso**.

## Gestão de contas pela administração

- \`GET /api/admin/organizations\`: lista limitada/paginada, busca por nome, status, plano SaaS e contagem de clientes ativos; não revela segredos nem exporta dados de clientes.
- \`PATCH /api/admin/organizations/:id/status\`: mudanças de estado \`active | suspended | blocked\` com motivo obrigatório e auditoria.
- O admin **não pode alterar o status da organização de sua própria sessão**. Suspender/bloquear revoga todas as sessões do tenant e desativa a conexão WhatsApp, bloqueando a fila não enviada; restaurar o status **não ressuscita** as sessões anteriores nem reativa disparos externos.
- Organizações suspensas deixam de ter acesso pelo middleware; workers financeiros/recorrentes que exigem organização ativa permanecem bloqueados. Não apagar registros ao suspender conta.

## Suporte e direitos LGPD

- \`GET /api/admin/support/tickets\`: triagem central de tickets de membros e contatos públicos, apenas superadmin.
- \`PATCH /api/admin/support/tickets/:id\`: status \`open | in_progress | closed\`, motivo obrigatório, histórico imutável em \`support_ticket_events\` e auditoria. **Não envia e-mail**, não responde ao cliente automaticamente e não declara atendimento concluído por envio inexistente.
- \`POST /api/privacy/requests\`: titular abre pedido de acesso, retificação, portabilidade ou exclusão de dados da organização. Limite 10 pedidos por dia.
- \`GET /api/privacy/requests\`: visão dos próprios pedidos, sempre tenant-scoped.
- \`GET /api/admin/privacy/requests\` + \`PATCH /api/admin/privacy/requests/:id\`: triagem e documentação de revisão, sem estado de "atendido" que possa ser marcado sem execução verificável.
- **LGPD:** a solicitação de exclusão não executa \`DELETE\` em registros financeiros nem implica aceitação automática. A instituição precisa definir prazos, base legal, retenção obrigatória, processamento de portabilidade e respostas documentadas com revisão jurídica. Essas obrigações continuam pendentes.

## Indicadores: MRR ≠ GPV

O dashboard administrativo distingue:

| Métrica | Fonte | Critério |
| --- | --- | --- |
| MRR SaaS verificado | \`saas_subscriptions\` + \`saas_invoices\` | Somente assinaturas \`active\`, período atual e última fatura com \`status='paid'\`, \`provider='platform_live'\`, ID e data de confirmação do PSP |
| Receita SaaS recebida e verificada | \`saas_invoices\` | Somente invoices \`paid\` do PSP real da plataforma |
| GPV real de profissionais | \`charges\` | Apenas \`provider='asaas_live'\`, valores \`paid_cents-refunded_cents\` de status financeiro |
| GPV simulado do Sandbox | \`charges\` | Apenas \`provider='asaas_sandbox'\`, exibido em campo **separado** |
| Clientes, serviços, recorrências e rascunhos | PostgreSQL | Contagem de registros por organização |
| Histórico mensal | \`charges.created_at\` | **Quantidade de cobranças criadas**, nunca valor recebido por mês |

**O código ainda não possui provider SaaS \`platform_live\` nem adapter \`asaas_live\` ativados.** Valores reais tendem a zero enquanto não houver homologação, e os exemplos fictícios/sandbox NÃO devem preencher a receita real.

## API implementada

- GET \`/api/admin/reports/overview\`
- GET \`/api/admin/organizations\`
- PATCH \`/api/admin/organizations/:id/status\`
- GET \`/api/admin/audit\`
- GET \`/api/admin/support/tickets\`
- PATCH \`/api/admin/support/tickets/:id\`
- GET \`/api/admin/privacy/requests\`
- PATCH \`/api/admin/privacy/requests/:id\`
- GET \`/api/reports/summary\`
- GET \`/api/reports/audit\`
- POST \`/api/reports/exports/:dataset\` (somente \`clients\` ou \`charges\`)
- GET \`/api/privacy/requests\`
- POST \`/api/privacy/requests\`

## Banco de dados e testes

- Migração \`016_admin_reporting_privacy.sql\`: pedidos de privacidade, histórico de triagem de tickets e trigger append-only na auditoria.
- \`server/phase7-domain.ts\`: formatador CSV defensivo e distinção de pagamentos SaaS verificados.
- \`server/phase7-routes.ts\`: RBAC, isolamento de tenant, auditoria, relatórios e alterações transacionais.
- \`server/phase7.integration.test.ts\`: MFA admin, isolamento de clientes, exportação CSRF, CSV injection, suporte, LGPD, suspensão e revogação de sessões, métricas isoladas.
- Telas \`AdminOperationsView.tsx\` e \`ReportsOperationsView.tsx\`; smoke SSR, navegação desktop/mobile e CI de build.

## Para fechar a Fase 7

Este é um **incremento inicial**, não a conclusão integral da fase. Ainda é necessário:
1. Revisão especializada de LGPD, política de retenção e descarte/anonimização legalmente segura, portabilidade integral e atendimento verificável aos titulares.
2. Gestão completa de suporte (respostas reais, SLA, notificações e anexos seguros), exportações paginadas completas e adequação fina de UI.
3. Monitoramento/alertas de risco, logs centralizados com dados minimizados, política de segregação de funções e governança do superadmin.
4. Revisão financeira de MRR, GPV, reembolsos e tributos quando adaptadores **reais** estiverem homologados.
5. Validação do fluxo de bloqueio/reativação em staging HTTPS, testes externos e revisão independente de segurança; não liberar a PR draft sem esses gates.

**Não implantado:** envio de e-mail administrativo, pagamentos reais, exclusão automática de dados, processamento financeiro ou deploy. \`main\` permanece intacta.

## Incremento seguinte — respostas de suporte no portal (F7, implementação incremental)

**Escopo técnico:** resposta do superadministrador a chamados criados na área autenticada do profissional, com histórico auditável e leitura limitada à organização vinculada ao chamado. Isto **não** fecha todos os requisitos de suporte (SLA, anexos, notificações e entrega de e-mail continuam pendentes).

- Migração incremental `017_support_portal_replies.sql`: respostas em PostgreSQL, relação com ticket, organização e autor, histórico append-only e `client_request_id` único por chamado.
- `GET /api/admin/support/tickets/:id/replies`: histórico paginado para superadmin com sessão/MFA.
- `POST /api/admin/support/tickets/:id/replies`: cria resposta no portal, apenas superadmin, com CSRF, validação Zod, transação com lock, trilha de auditoria sem corpo da mensagem e idempotência por UUID. Repetir a mesma chave/corpo não duplica registros; reutilizar chave com conteúdo diferente retorna conflito. Ticket encerrado não aceita novas respostas.
- `GET /api/support/tickets/:id/replies`: leitura autenticada com vínculo à organização da sessão; tickets de outros tenants e contatos públicos não autenticados retornam 404.
- Admin: editor de resposta e histórico por chamado; Conta do profissional: visualização autenticada das respostas. Não utiliza dados demonstrativos/IndexedDB.
- **Limite operacional explícito:** `delivery_state=portal_only`, `emailSent=false`; nenhuma mensagem é enviada ou confirmada como lida por e-mail/WhatsApp. Contatos públicos exigem verificação de identidade e canal autorizado antes de receber resposta.
- Teste de integração ampliado para papéis, CSRF, isolamento de tenants, chave idempotente, ticket público, ticket encerrado, persistência e ausência de alegação de entrega externa.

**Aceite técnico:** executar lint/TS, testes do servidor e integração PostgreSQL, migrações (incluindo 017) em banco descartável, builds e Playwright; confirmar GitHub Actions verde no **HEAD** correspondente. Até essa prova, tratar a entrega como *implementada — não validada*. A revisão independente de segurança, LGPD/retention policy, SLA, acessibilidade aprofundada e homologação externa permanecem gates.
