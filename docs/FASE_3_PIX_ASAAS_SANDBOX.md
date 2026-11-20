# CobraFlux — Fase 3: Integração Asaas Pix em SANDBOX

**Estado:** código de integração no branch feat/production-foundation, somente sandbox, sem hospedagem e sem credenciais reais. Não é processamento financeiro de produção.

## Regras inegociáveis

- A URL de saída está fixada no código para https://api-sandbox.asaas.com/v3. Não existe opção de ambiente financeiro live.
- Cada organização possui seu próprio registro de conexão de sandbox; chave API criptografada em repouso com AES-256-GCM e AAD contendo o identificador da organização.
- Webhook deve ser configurado na conta do Asaas com authToken de 32–255 caracteres, distinto da chave API. No banco persiste somente SHA-256 do token. O callback valida o cabeçalho asaas-access-token usando comparação constante.
- Envio Pix não ocorre pelo navegador: apenas o servidor consulta os clientes no PSP, cria cobrança e obtém QR.
- Sem PAYMENT_CREDENTIAL_ENCRYPTION_KEY configurada no backend a conexão é bloqueada (HTTP 503); sem conexão do tenant a emissão também é bloqueada.
- O endpoint do webhook é único por conta, contém somente um identificador público aleatório, não as credenciais.
- A conexão não pode trocar credenciais automaticamente depois que houver emissão vinculada: exige revisão operacional para evitar pagamentos órfãos.
- Apenas titular/admin com sessão autenticada e CSRF pode configurar a conta, emitir rascunhos ou iniciar reconciliação.
- Tokens e chaves jamais devem ser adicionados ao GitHub, exibidos novamente pelo backend, gravados em logs ou enviados para variáveis VITE_.

## Fluxo

1. Em Configurações, o titular cria uma conta no Asaas Sandbox e adiciona chave API e token exclusivo do webhook. É necessário configurar PAYMENT_CREDENTIAL_ENCRYPTION_KEY no servidor (openssl rand -hex 32).
2. O painel informa o endpoint completo do webhook; cadastrar essa URL e o authToken no console Sandbox Asaas. Sem URL pública HTTPS, o PSP não consegue entregar callbacks automaticamente.
3. Em Cobranças, criar um rascunho e clicar Emitir Pix SANDBOX. O banco reserva o envio primeiro e impede requisições concorrentes ou duplicadas para o mesmo rascunho.
4. O adapter consulta eventual cliente Asaas pela externalReference, cadastra se não existir, guarda o ID e só então cria o pagamento com billingType PIX.
5. O adapter procura o pagamento por externalReference estável antes de criar. Um retorno inconclusivo/timeout nunca causa POST automático repetido.
6. Recebido o identificador do PSP, buscar GET /payments/{id}/pixQrCode. Guardar payload e expor a página pública claramente marcada SANDBOX.
7. O webhook usa o ID único de evento para deduplicar. A transição para pago só ocorre com PAYMENT_RECEIVED e valor exato em centavos, após o token de webhook ser validado.
8. PAYMENT_CONFIRMED não é tratado como dinheiro disponível. Eventos fora de ordem nunca rebaixam pago para vencido nem reabrem uma cobrança estornada.
9. Eventos PAYMENT_REFUNDED e PAYMENT_PARTIALLY_REFUNDED apenas marcam necessidade de conciliação. Nunca debitam valores sozinhos. Só itens com status DONE obtidos pelo endpoint GET /payments/{id}/refunds comprovam estorno, inclusive múltiplos estornos parciais.
10. Pedidos de estorno parcial são reservados no PostgreSQL antes do POST externo. Só um pedido pode estar em andamento por cobrança; timeout exige reconciliação antes de nova solicitação, sem repetir POST automaticamente.
11. Se a emissão ficar inconclusiva, a rota /api/sandbox/charges/:id/reconcile consulta o PSP e recupera o QR sem criar um segundo pagamento.

## Interface e rotas

| Método | Rota | Autorização |
| --- | --- | --- |
| GET | /api/sandbox/connection | Sessão válida |
| PUT | /api/sandbox/connection | Titular/admin + CSRF |
| POST | /api/sandbox/charges/:id/issue | Titular/admin + CSRF |
| POST | /api/sandbox/charges/:id/reconcile | Titular/admin + CSRF |
| POST | /api/webhooks/asaas-sandbox/:accountId | authToken do webhook do Asaas |
| GET | /api/sandbox/charges/:id/refunds | Titular/admin |
| POST | /api/sandbox/charges/:id/refunds | Titular/admin + CSRF, solicitação exclusivamente no sandbox |
| POST | /api/sandbox/charges/:id/reconcile-financial | Titular/admin + CSRF, somente consulta de pagamento/refund |
| GET | /api/public/charges/:publicToken/sandbox-qr | Token público imprevisível de cobrança pendente em sandbox |

## Testes automatizados e homologação futura

- Testes de unidade: transições conservadoras de pagamento, conversão centavos, criptografia autenticada e adapter HTTP restrito ao host de sandbox.
- Teste de integração PostgreSQL sem Internet: duas organizações, conta A configurada, tentativa cruzada bloqueada, emissão única, cabeçalho inválido rejeitado, idempotência de evento, pagamento com valor divergente ignorado, recebimento confirmado, reenvio ignorado, estorno, evento tardio e recuperação de timeout sem novo POST.
- GitHub Actions executa PostgreSQL efêmero e testes de navegador do fluxo de rascunho; nenhum QR real ou PSP remoto é usado nos testes automatizados.
- Para homologação final: conta de Asaas Sandbox por organização, domínio HTTPS, webhook real, testes controlados de pagamento Pix, auditoria de segurança, saldo/estornos e contingência.

## Limites conhecidos (não implementar como se estivesse pronto)

- Ainda não existe conexão a ambiente real, nenhuma credencial do usuário foi recebida e nenhum pagamento foi efetuado no Asaas.
- Implementamos solicitação de estorno parcial/integral e conciliação manual dos itens DONE. Ainda faltam validação real das contas sandbox, cancelamento no PSP, conciliação periódica em worker, monitoramento de delivery, fila durável de webhooks, chargebacks, comprovantes e testes antifraude antes de qualquer go-live.
- Emissão em sandbox mantém estado pending_provider ou reconcile_required em respostas inconclusivas. Não existe retry automático de criação.
- Para habilitar Pix comercial, será preciso analisar modelo de subcontas/recebedores e contrato financeiro por organização; **não compartilhar uma única conta de produção entre tenants sem arquitetura e contrato apropriados**.
- Chave da master key não pode ser trocada sem processo formal de recriptografia das chaves salvas.

## Documentação oficial consultada (2026-11-20)

- [Introdução API Asaas / Sandbox](https://docs.asaas.com/docs/sandbox-2)
- [Criar cobrança](https://docs.asaas.com/reference/create-new-payment)
- [Pix QR dinâmico](https://docs.asaas.com/docs/cobrancas-via-pix)
- [Webhooks / token de autenticação](https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook)
- [Eventos de cobranças](https://docs.asaas.com/docs/webhook-para-cobrancas)
- [Retries e idempotência](https://docs.asaas.com/docs/retries-e-idempot%C3%AAncia)

## Próximo marco

Concluir os testes CI do adapter e do webhook; implementar os pontos restantes da Fase 3 em código e somente após a aprovação partir para a Fase 4 de recorrências, mantendo homologação PSP externa como pendência pré-lançamento.

## Entrega adicional — estornos e conciliação financeira

- A migração 007_sandbox_refunds.sql mantém `refunded_cents` separado do valor original e registra cada tentativa de estorno com estado `reserved`, `submitted`, `reconcile_required`, `completed` ou `denied`.
- A API de refund do Asaas permite devolução integral ou parcial; não basta a aceitação HTTP para comprovar conclusão. `GET /payments/{id}/refunds` distingue DONE de PENDING e CANCELLED.
- A reconciliação verifica identificador da cobrança, externalReference, método PIX e valor original em centavos antes de alterar saldos. O sistema recusa retorno paginado ou incongruente, evita diminuição de `refunded_cents` e não recredita eventos tardios.
- `PAYMENT_REFUNDED` e `PAYMENT_PARTIALLY_REFUNDED` geram sinal de revisão, mas não transferem valores nem alteram os centavos até o comprovante de estorno DONE ser consultado no PSP.
- Novos status: `partially_refunded` e `refunded`, com `paid_cents` líquido e histórico de devolução. O painel de cobranças distingue estorno parcial e apresenta solicitação/consulta somente aos titulares em modo SANDBOX.
- Falhas inconclusivas são preservadas como `reconcile_required` e não reenviadas automaticamente. Isso reduz o risco de duplicar devoluções; reprocessamentos que dependam de revisão externa permanecem procedimentos manuais.
- A meta de homologação externa continua pendente; APIs reais de sandbox e estornos reais de testes não foram executados.

Referências: [estorno integral/parcial Asaas](https://docs.asaas.com/reference/refund-payment), [interpretação de estornos DONE/PENDING/CANCELLED](https://docs.asaas.com/docs/refunds), [eventos de webhook](https://docs.asaas.com/docs/payment-events).
