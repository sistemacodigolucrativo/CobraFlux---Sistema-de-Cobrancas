# CobraFlux — Fase 5: WhatsApp Business Cloud API (integração em código)

**Status:** implementação na branch de desenvolvimento \`feat/production-foundation\` e PR #2 em rascunho. Não há credenciais, domínio HTTPS ou agendador contratado. **Nenhum envio real foi habilitado.**

## Escopo

Este módulo usa **somente Meta WhatsApp Cloud API**, com origem fixa \`https://graph.facebook.com/v27.0\`. Não utiliza WhatsApp Web, automação de navegador, bibliotecas não oficiais, nem tokens expostos no React.

A Meta exige templates de mensagem aprovados para comunicações empresariais iniciadas fora da janela de serviço. Este primeiro adaptador suporta **somente templates de categoria UTILITY aprovados** com três variáveis sequenciais \`{{1}}\`, \`{{2}}\` e \`{{3}}\`: nome do cliente, descrição da cobrança e vencimento. O proprietário deve configurar e aprovar o modelo na Meta; **sincronizar o catálogo não cria nem aprova templates**.

## Consentimento versionado

- \`clients.whatsapp_opt_in\` é legado e **não constitui autorização para enviar mensagens**.
- A autorização atual está em \`whatsapp_consents\` e seu histórico imutável em \`whatsapp_consent_events\`. Exige uma ação explícita, tipo da prova, referência com no mínimo 12 caracteres, versão, telefone registrado e titular identificável.
- Formulários/documentos de terceiros continuam sob responsabilidade do profissional. O sistema registra a declaração de que a prova existe, **não autentica a assinatura nem substitui a obrigação de consentimento válido**.
- A revogação por painel ou mensagem de entrada "PARAR", "SAIR", "STOP", "CANCELAR" ou "REMOVER" cancela os itens ainda não enviados e invalida a versão anterior. Uma alteração de telefone também invalida o envio até nova autorização.
- Operações de concessão dependem de papel titular/admin e CSRF. Revogações não podem ser bloqueadas por falta de permissões de administrador.

## Integração com Meta

- Token Meta por organização protegido por AES-256-GCM com dados adicionais associados ao ID do tenant. A chave mestra está apenas em variável de ambiente.
- O token é validado na conexão e o catálogo é sincronizado diretamente do endpoint de mensagens aprovadas da Meta.
- A conexão só pode ser habilitada depois de sincronização recente de modelos e configuração do webhook.
- \`GET /api/webhooks/meta-whatsapp\` valida o desafio com token secreto.
- \`POST /api/webhooks/meta-whatsapp\` valida \`X-Hub-Signature-256\` calculado com o corpo bruto e app secret antes de interpretar atualizações.
- A fila registra \`queued\`, \`sending\`, \`accepted\`, \`sent\`, \`delivered\`, \`read\`, \`failed\`, \`blocked\`, \`unknown\`. **HTTP 200 da API significa aceite, não entrega comprovada.**
- Webhooks podem chegar antes da resposta de envio: o buffer persistente guarda a confirmação e a aplica quando o ID externo é conhecido. Duplicações e eventos fora de ordem não rebaixam uma confirmação de entrega/leitura.
- Um timeout depois do POST é **resultado desconhecido**, não motivo para repetir o POST. Marca \`unknown\` e exige revisão para evitar mensagens duplicadas.

## Fila e limitações

A ação "Preparar lembrete" só enfileira cobrança com status pendente ou vencida, cliente ativo, consentimento atual para o telefone e template aprovado e verificado recentemente.

O worker de envio é de execução única e desabilitado por padrão. Regras conservadoras de proteção: no máximo 50 requisições por organização nas últimas 24 horas, uma por destinatário no período e envio apenas de **segunda a sábado, das 09h às 18h59 no horário de São Paulo**.

O worker somente roda com \`WHATSAPP_SEND_ENABLED=true\`. Mesmo assim o escopo padrão \`test\` restringe destinatários à allowlist \`WHATSAPP_TEST_RECIPIENT_ALLOWLIST\`. O escopo \`production\` também requer \`WHATSAPP_GO_LIVE_APPROVED=true\`, liberado somente depois de revisão específica e não permite enviar cobranças Asaas Sandbox.

**Não ative essas variáveis de envio sem credenciais Meta e sem aprovação de templates e destinatários.** O código não instala cron, não inicia processo contínuo e não dispara mensagens do painel.

## Preparação para testes com infraestrutura

1. Hospedar o backend com PostgreSQL e HTTPS confiável e aplicar migrações 012 e 013.
2. Criar um app Meta, vincular um WABA e número de teste, obter token de sistema com escopos mínimos e configurar segredo do aplicativo.
3. Configurar servidor com \`WHATSAPP_CREDENTIAL_ENCRYPTION_KEY\`, \`META_APP_SECRET\` e \`META_WEBHOOK_VERIFY_TOKEN\`.
4. Expor \`/api/webhooks/meta-whatsapp\` e completar validação da Meta. Assinar o campo \`messages\`.
5. No painel do titular, fornecer WABA ID, Phone Number ID e token; sincronizar templates, selecionar modelo aprovado UTILITY com 3 parâmetros e habilitar conexão.
6. Registrar autorização de destinatário real de teste com prova e configurar allowlist. Somente após as etapas anteriores e aprovação explícita, executar o worker em ambiente isolado.

Inspeção **sem envio**:

\`\`\`bash
npm run migrate
npm run whatsapp:run -- --dry-run
\`\`\`

Execução pontual **somente em ambiente autorizado e isolado**:

\`\`\`bash
WHATSAPP_SEND_ENABLED=true WHATSAPP_SEND_SCOPE=test \
 WHATSAPP_TEST_RECIPIENT_ALLOWLIST=5511999999999 \
 npm run whatsapp:run -- --once --limit=10
\`\`\`

A execução recorrente exige cron externo, observabilidade, alertas e kill switch. **Não configurada nesta entrega.** A futura automação da criação de lembretes a partir de vencimentos deverá escolher um template padrão aprovado e atender às mesmas garantias de opt-in, deduplicação e limites, sem misturar o ambiente financeiro de testes com pessoas reais.

## Segurança / dados / pendências externas

- Tokens e segredo Meta nunca são devolvidos pelo frontend nem registrados em logs.
- Rotas de gestão e mensagens usam isolamento por organização, CSRF e RBAC.
- Dados de mensagens são mínimos: status, identificadores e códigos; não armazenar todo o payload webhook. Telefone só é enviado quando há consentimento atual.
- LGPD: definir política de retenção, inventário e exclusão, direitos do titular e base legal com apoio jurídico. Habilitar canais de supressão por STOP.
- Ainda pendentes: conta Meta real, templates aprovados reais, testes de opt-out com dispositivo físico, webhook HTTPS validado, agendador, métricas de custos da Meta, alertas e go-live aprovado.
- CI com respostas Meta simuladas valida regras de negócio e HMAC, **não prova entrega de mensagens reais**.

## Fontes oficiais

- Cloud API: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/
- Webhook Graph e assinatura SHA256: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/
- Consulta de estado de templates: https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account/message_templates/
