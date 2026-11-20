# CobraFlux — Execução da fundação de produção

**Branch:** feat/production-foundation  
**Estágio:** primeira implementação real (fases 0, 1 e parte da 2). **Não é um lançamento financeiro.**  
**Importante:** o servidor não está implantado nesta entrega. São necessários PostgreSQL, URL HTTPS, segredos e pipeline de deploy.

## O que está implementado no código

- API Express/TypeScript e migração PostgreSQL versionada.
- Registro de usuário e organização em transação; autenticação por senha bcrypt; sessões HttpOnly/SameSite/Secure em HTTPS; revogação em logout e após recuperação.
- Proteção CSRF para mutações autenticadas; limitação persistente de tentativas de login, cadastro e recuperação.
- Isolamento tenant no backend (organização derivada da sessão, não do corpo da requisição).
- CRUD inicial de clientes (criar/listar/editar/arquivar) e serviços (criar/listar).
- Cobranças **como rascunhos não financeiros**, links públicos com token criptográfico e consulta com campos limitados.
- Painel operacional separado do mockup e relatório básico baseado em banco.
- Recuperação de senha com token expirá­vel/uso único, envio via Resend quando configurado.
- Testes unitários e de integração multi-tenant com PostgreSQL no GitHub Actions.
- Frontend React/Vite reaproveitando tipografia, cores, ícones e componentes do CobraFlux.
- Demonstração antiga preservada e não usada no build de produção.

## Limitações intencionais de segurança

- Nenhuma integração Pix real ou acesso bancário está configurada: **não enviar dinheiro para os links criados nesta fase**.
- Nenhum evento financeiro pode ser validado por botões simuladores na API de produção.
- Acesso de superadministrador está bloqueado até implantar MFA.
- Verificação de e-mail ainda não está implantada; cadastro existe, mas verificação da identidade não é comprovada.
- A interface de produção é um recorte reduzido para validação de backend; os painéis antigos permanecem no modo demo e ainda precisam ser migrados por módulo.
- Mensageria WhatsApp, recorrências server-side, faturamento de assinaturas SaaS, conciliação Pix, suporte admin, backups automatizados, LGPD operacional e release Android ainda **não estão concluídos**.
- As cobranças criadas têm estado 'draft' e permanecem assim até uma integração PSP homologada. Nunca as marque 'paid' manualmente no banco para simular liquidação.
- API sem contas provisionadas de PSP ou Meta: integração futura exigirá credenciais de sandbox e homologação do usuário.

## Execução em ambiente local ou hospedagem

1. Criar banco PostgreSQL 16 ou superior e usuário exclusivo com menor privilégio necessário.
2. Definir no ambiente **somente no servidor**: DATABASE_URL, SESSION_SECRET (32+ caracteres aleatórios), APP_ORIGIN (origem exata, HTTPS em produção), PUBLIC_APP_URL e PORT.
3. Instalar dependências: npm install --no-package-lock.
4. Executar **antes do deploy**: npm run migrate.
5. Compilar frontend no modo real: VITE_APP_MODE=production npm run build.
6. Subir a API e o frontend na mesma origem: npm run server.
7. Conferir GET /api/health, criar duas organizações e verificar isolamento usando os testes.
8. Definir RESEND_API_KEY e RESET_EMAIL_FROM para habilitar envio real de e-mails de recuperação.
9. Ativar HTTPS, backup PITR do PostgreSQL, monitoramento e alertas na infraestrutura escolhida.

O Dockerfile compila o frontend em modo produção e publica na porta 8080. **Não executa migrations automaticamente** para evitar alterações indevidas no banco durante reinicializações.

### Desenvolvimento pelo celular

O usuário pode editar via GitHub/Termux e deixar o GitHub Actions executar npm install, TypeScript, testes unitários, migração em Postgres efêmero, integração e compilação Vite. **Não é necessário Android Studio para estas etapas web.** O Android de produção segue etapa separada.

### URLs / ambiente

- Demo legado: build sem VITE_APP_MODE=production, não usar com dados reais.
- Produção: build com VITE_APP_MODE=production.
- Login: /#/entrar; recuperação /#/recuperar?token=<token>.
- Publicar rascunho informativo: /#/pagar/<public_token>. Sem transação bancária.
- Healthcheck: /api/health.

## Próximas etapas obrigatórias do roadmap

1. E-mail verificado e MFA real do admin; política de senha e gestão de sessões/dispositivos.
2. Migrar os módulos completos de cliente, cobrança, relatório e configuração para API, preservando UX.
3. Integração com PSP **sandbox** e webhooks autenticados, idempotência e reconciliação; liberação de Pix real somente após homologação e aprovação.
4. Recorrências com scheduler/worker; WhatsApp oficial e opt-in; assinaturas SaaS; relatórios contábeis e administração.
5. Backups/restauração, testes de segurança e carga, LGPD, monitoramento e piloto.
6. APK/AAB Android assinado e Android API 36+ quando o web app real estiver estabilizado.

## Comprovação

Ver commits e GitHub Actions nesta branch. Somente testes indicados como sucesso na execução de CI podem ser considerados aprovados. **Nenhum pagamento real, deploy comercial ou cadastro de provedor foi testado nesta etapa.**
