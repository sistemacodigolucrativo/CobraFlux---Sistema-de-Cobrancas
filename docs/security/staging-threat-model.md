# F8 — Modelo preliminar de ameaças do CobraFlux (STRIDE)

**23/11/2026 — ESTUDO ESTÁTICO, NÃO PENTEST OU HOMOLOGAÇÃO.** Escopo: navegador React/Vite, Express, PostgreSQL multi-tenant, e-mail Resend, Asaas Sandbox, Meta/WhatsApp, workers, CI e backups.

**Ativos e fronteiras:** sessão/MFA; credenciais PostgreSQL, Resend e Meta; chaves mestras AES-GCM de MFA, Asaas Sandbox e WhatsApp; dados pessoais/financeiros e dumps; navegador↔API↔banco, API/worker↔provedores, CI↔repo, staging↔prod.

| ID | Cenário de ameaça | Defesa atual ou prova | Controle futuro ainda PENDENTE |
| --- | --- | --- | --- |
| T01 | Origem HTTPS falsa, spoofing de domínio | F8 #02 exige APP_ORIGIN HTTPS canônico | DNS, certificado TLS e reverse proxy reais testados |
| T02 | Segredo publicado no bundle ou Git | F8 #03 classifica VITE_ como público e compara nomes | Secret scanning completo, revisão de bundle e histórico Git |
| T03 | DB staging conecta por engano à produção | DATABASE_SSL=require exigido em modo produção | Banco e credenciais segregados, CA confiável, privilégios mínimos |
| T04 | Rotação de chave perde dados MFA/PSP/WhatsApp | AES-GCM em código, três master keys identificadas | Plano de recriptografia, versionamento e restauração antes de rotação |
| T05 | WhatsApp envia mensagem não autorizada | Flags de envio, escopo e allowlist identificadas | Manter desligado, revisão independente e prova de consentimento |
| T06 | Webhook Meta forjado/repetido | Código de verificação da assinatura e dedup existente | Testes externos de replay/cargas e monitoramento |
| T07 | Cliente acessa dados de outro tenant | Testes multi-tenant CI já existentes | Pentest, revisão de filtros/queries e ambiente real |
| T08 | Vazamento de PII por CSV/log/backup | CSV auditado parcialmente; restore sintético F8 #01 | Redação, retenção LGPD, cifra offsite, políticas legais |
| T09 | Restore destrói banco errado | restore-drill exige banco vazio com _restore_drill | Provar segregação de conta e ensaio offsite/PITR |
| T10 | Runner/dependência comprometidos | CI atual tem actions/*@v4 e npm install sem lock npm | Pin SHA, dependências reprodutíveis, permissões mínimas |
| T11 | Dados pessoais reais usados em staging | CI usa massa de dados sintéticos | Aprovação, minimização e dados desidentificados |
| T12 | Habilitação acidental de worker ou PSP live | Flags opt-in no código e inventário | Dupla aprovação, rollback, evidências de QA antes de ativar |

**Fatos comprovados:** 33 nomes de variáveis classificados, auditoria offline e CI. **Não comprovado:** valores reais ou força dos segredos, ausência de tokens hardcoded, staging real, validação TLS externa, entrega de mensagens, legalidade ou segurança de produção.

**Legado:** GEMINI_API_KEY e APP_URL estão no .env.example herdado de AI Studio; uso em runtime operacional não confirmado. Revisar antes de configurar qualquer chave.

**Regras de bloqueio:** não ativar serviços live nem lançar sem revisão das pendências ADR-026 (F7), aprovação de domínio e infraestrutura, CA/PostgreSQL, backup offsite/PITR, segurança/LGPD e rollback.

**Conclusão:** modelo de ameaças inicial documentado; segurança operacional e conformidade seguem PENDENTES.
