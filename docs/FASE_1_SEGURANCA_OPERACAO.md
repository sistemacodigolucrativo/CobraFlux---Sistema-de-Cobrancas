# CobraFlux — Fase 1: identidade, MFA e recuperação operacional

**Estado:** implementado no código da branch de trabalho; validação final da Fase 1 depende de staging/backup reais.

## Progresso sequencial conforme auditoria

- [x] PostgreSQL, migrações versionadas e testes de isolamento multi-tenant.
- [x] Registro, login, sessões HttpOnly/SameSite, CSRF e rate limit.
- [x] Verificação de e-mail por token de uso único (24 h) e bloqueio de login não verificado.
- [x] Recuperação de senha por token único, com revogação de sessões.
- [x] Login administrativo com TOTP (segredo AES-256-GCM, prevenção de replay) e RBAC no backend.
- [x] Consulta e revogação de sessões, incluindo desconexão de todos os dispositivos.
- [x] Scripts de backup PostgreSQL e ensaio de restauração isolado.
- [ ] Provedor real de e-mail configurado e entrega verificada em staging.
- [ ] Staging HTTPS com PostgreSQL provisionado e migração concluída.
- [ ] Backups automáticos off-site criptografados, retenção e alerta de falhas.
- [ ] Restauração real em ambiente isolado e registro do RPO/RTO.
- [ ] Testes E2E das telas e auditoria de segurança externa.

## Identidade e segredos

Defina somente no servidor: `DATABASE_URL`, `SESSION_SECRET`, `APP_ORIGIN`, `PUBLIC_APP_URL`, `RESEND_API_KEY`, `RESET_EMAIL_FROM` e `MFA_ENCRYPTION_KEY` (hex com 32 bytes). Gere a chave MFA com `openssl rand -hex 32`. Não use variáveis `VITE_` para segredos. Cadastro em modo produção exige serviço de e-mail configurado.

Para provisionar um superadministrador: crie e confirme uma conta, assegure que ela tenha apenas uma organização, configure `ADMIN_USER_EMAIL` e execute `npm run admin:enroll` **somente em terminal de operador confiável**. Copie a chave TOTP exibida no autenticador; não deixe a chave em logs, tickets ou CI. O endpoint `/api/admin/overview` exige `super_admin` e sessão com MFA.

## Backup/restauração — procedimento

1. Defina `BACKUP_DIR` apontando para diretório privado, `DATABASE_URL` com acesso apropriado e execute `bash scripts/backup-db.sh`.
2. Criptografe o `.dump` e armazene fora da máquina, com retenção e controle de acesso; não envie backups ao GitHub.
3. Prepare um banco vazio com nome terminado em `_restore_drill`, defina `RESTORE_DRILL_DATABASE_URL` e `BACKUP_FILE`, execute `bash scripts/restore-drill.sh`.
4. Registre duração, consistência de dados e evidências. Não considerar backup aprovado até restauração real.
5. Em produção usar solução gerenciada com PITR, rotação de credenciais e alertas; scripts manuais não substituem backups automáticos.

## Gates antes da Fase 2

CI verde no commit atual, confirmação de e-mail e login MFA testados; banco de staging e HTTPS funcionando; procedimento de backup e restore exercitado. Sem cumprir os gates externos, **Fase 1 permanece parcialmente concluída**, e o modo demo deve permanecer isolado da produção.

**Pix, WhatsApp, planos pagos, recorrências e Android pertencem a fases posteriores e não devem ser ativados por este PR.**
