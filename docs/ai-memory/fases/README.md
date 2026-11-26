# Fases do desenvolvimento — CobraFlux

O projeto foi planejado em **10 fases, de 0 a 9**. Esta pasta mantém uma página rastreável por fase; o último incremento de código validado está em [01-ESTADO-ATUAL](../01-ESTADO-ATUAL.md).

- [Fase 0 — Preparação e auditoria](00-preparacao.md) — **PARCIAL — código/CI**
- [Fase 1 — Segurança, autenticação e infraestrutura base](01-seguranca.md) — **NÚCLEO TESTADO; HOMOLOGAÇÃO PENDENTE**
- [Fase 2 — Cadastros, serviços, cobranças draft, equipe e UX](02-operacoes.md) — **NÚCLEO TESTADO; PARIDADE INCOMPLETA**
- [Fase 3 — Pix Asaas — somente sandbox](03-pix-sandbox.md) — **CÓDIGO TESTADO COM MOCKS; PSP EXTERNO PENDENTE**
- [Fase 4 — Recorrências](04-recorrencias.md) — **NÚCLEO TESTADO; SCHEDULER EXTERNO PENDENTE**
- [Fase 5 — WhatsApp Meta Cloud API](05-whatsapp.md) — **NÚCLEO TESTADO; ENVIO DESATIVADO**
- [Fase 6 — Monetização SaaS da plataforma](06-saas.md) — **NÚCLEO TÉCNICO TESTADO; MONETIZAÇÃO REAL INCOMPLETA**
- [Fase 7 — Administração, relatórios, suporte e LGPD](07-admin-relatorios-lgpd.md) — **ESCOPO NÃO ADIADO TESTADO; ADR-026 PENDÊNCIAS NÃO CONCLUÍDAS**
- [Fase 8 — Homologação e segurança operacional](08-homologacao.md) — **CONTROLES TÉCNICOS TESTADOS; 12 GATES EXTERNOS PENDENTES**
- [Fase 9 — Android e Google Play](09-android-play.md) — **INICIADA: APK DEBUG/API36 TESTADO, SEM PLAY OU STAGING**

**Regra de manutenção:** atualize o documento da fase afetada a cada incremento; preserve o que foi aprovado, o que falhou e os bloqueios externos. Não usar percentual automático de checkboxes. Consulte a Issue #3, PR #2 e os workflows mais recentes para confirmação.
