# F8 — Runbook de segredos e configurações de staging

**23/11/2026 — DOCUMENTAÇÃO OFFLINE.** Inventário machine-readable: `docs/security/staging-config-inventory.json`. **33 nomes classificados**, incluindo flags CI e dois exemplos legados. Nenhum valor de segredo é versionado por este incremento.

## Princípios e decisões
1. Usar secret manager/ambiente autorizado com papéis mínimos; nunca registrar valores em Git, prompt, artefatos, logs ou tickets. Staging e produção devem usar contas, DB e chaves diferentes.
2. `VITE_` é público após o build: usar apenas `VITE_APP_MODE` como chave de modo; nunca expor segredos no navegador.
3. `DATABASE_URL` é sensível; exigir DB isolado e `DATABASE_SSL=require` com CA verificada. `APP_ORIGIN` deve apontar para domínio HTTPS real aprovado.
4. `SESSION_SECRET` precisa de geração CSPRNG e plano de invalidação. `MFA_ENCRYPTION_KEY`, `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` e `WHATSAPP_CREDENTIAL_ENCRYPTION_KEY` exigem recriptografia/versionamento antes de rotação; nunca sobrescrever sem migração.
5. Manter `WHATSAPP_SEND_ENABLED=false`, `WHATSAPP_GO_LIVE_APPROVED=false`, `WHATSAPP_ENQUEUE_ENABLED=false` e demais workers opt-in desligados até autorização. Telefones na allowlist de teste são dados pessoais restritos.
6. `RESEND_API_KEY`, `META_APP_SECRET` e `META_WEBHOOK_VERIFY_TOKEN` não podem ser logados; testes externos só após criação de sandbox e permissão. Asaas permanece no endpoint sandbox fixado em código.
7. `GEMINI_API_KEY` e `APP_URL` são exemplos legados em `.env.example`; uso operacional e necessidade ainda não demonstrados.

## Controles de aceitação, TODOS ainda pendentes fora do CI
| Etapa | Evidência exigida | Responsável futuro |
| --- | --- | --- |
| Ambiente e domínio | Aprovação de custos, DNS, HTTPS e proxy reais | Operador de infraestrutura |
| Segredos e acesso | Referências de cofre (nunca valores), MFA, escopo de roles, rotação | Operador + revisor de segurança |
| PostgreSQL | Conta distinta de produção, TLS/CA, backups, restore/PITR | Operador de dados |
| Provedores externos | Sandbox Asaas, verificação Meta/Resend, opt-in/opt-out e webhooks | Responsáveis dos provedores |
| Privacidade e fiscal | Reanalisar direitos/retention da F7 (ADR-026), LGPD/NFSe e consentimento | Revisores jurídico/fiscal |
| Piloto e rollback | Teste negativo, segurança, logs sem PII, incidente, recuperação | Release manager autorizado |

## Atualização segura do inventário
```bash
node --test scripts/phase8-secrets-audit.test.mjs
node scripts/phase8-secrets-audit.mjs --check
node scripts/phase8-readiness.mjs --offline
```
O scanner só lê **código e `.env.example`**, compara nomes com o JSON e reprova variáveis não classificadas ou `VITE_` rotulado como segredo. Não verifica valores secretos, não conecta a provedores e não é substituto para secret scanning de tokens hardcoded.

## Rotação e incidentes
- Sessões: preparar revogação; masters de cifragem: fazer recriptografia transacional com teste de recuperação; credenciais de provedores: revogar e substituir no cofre, auditar blast radius.
- Dumps são sensíveis: armazenar com criptografia offsite e política legal somente após aprovação; não anexar a CI ou PR.

**Estado:** inventário de nomes e runbook APROVADOS EM CI; configuração real e homologação PENDENTES.
