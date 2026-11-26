# CobraFlux — Fase 7: auditoria de encerramento em 23/11/2026

**AUDITORIA HISTÓRICA ANTERIOR À ADR-026.** Em 23/11/2026 o responsável decidiu reprogramar estes gates para análise posterior e iniciar a preparação da F8. A redação histórica abaixo é preservada, **não é o status atual do fluxo**. Consulte [ADR-026 e lista de adiados](../pendencias/2026-11-23-f7-adiados.md). O núcleo técnico não adiado da F7 foi encerrado por escopo, mas a F7 não foi integralmente homologada nem seus gates foram cumpridos.

**Resultado histórico (antes de ADR-026): Fase 7 NÃO encerrada; Fase 8 NÃO iniciada.** CI valida código e testes simulados; não valida aprovação legal, contratos, mensagens enviadas, staging, dinheiro real ou produção.

## Comprovação técnica adicional
- F7 #08: índices PostgreSQL migração 020, benchmark sintético de 100 mil clientes + 100 mil cobranças, 4 consultas indexadas (0,359 / 0,361 / 0,506 / 0,568 ms em CI efêmero). [1fbc06a7](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/1fbc06a7e22f2f9d548daa1e52a7b1654b4c0aa5), [CI #45183457088](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45183457088) aprovado.
- F7 #09: migração 021 de eventos LGPD append-only, histórico seguro owner/superadmin MFA com notas internas redigidas para owner. [49d134a5](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/49d134a5e76d6697c5b0138d6efa537cd225281b), [CI #45184164223](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184164223) / [CI #45184164450](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184164450) aprovados.
- F7 #10: lotes CSV por cursor associados a pedidos de acesso/portabilidade na mesma organização, assinados e auditados sem declarar pedido cumprido. [1c16c6ad](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/1c16c6ad0798b6c77543679738e2a57fb9e831ea), [CI #45184992979](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184992979) / [CI #45184993002](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45184993002) aprovados.

## Gates ainda abertos
| Grupo | Estado | Aceite ainda necessário |
| --- | --- | --- |
| BL-006 — SLA, suporte e anexos | **PARCIAL** | Definição de SLA/calendário e canais; entrega e recibos externos reais ou decisão explícita portal-only; anexos seguros com armazenamento, antivírus, retenção, quotas e testes |
| BL-007 — LGPD | **PARCIAL** | Identificação do titular, escopo jurídico, retificação, exportação abrangente, erasure condicionado à retenção fiscal, prova de atendimento, revisão/aceite legal. Um lote CSV auditado não é portabilidade integral |
| BL-008/031 — CSV/relatórios | **PARCIAL** | Consistência sob alterações/exclusões, dados de staging e concorrência, carga real, indexes CONCURRENTLY em ambiente populado e testes de retenção/PII; microbenchmark não representa produção |
| BL-012 — interface | **PARCIAL** | Auditoria demo x produção tela por tela, acessibilidade com teclado/leitor de tela/contraste, aparelhos físicos |
| Segurança/governança | **PARCIAL** | Staging HTTPS, backup offsite/restore real, observabilidade, revisão independente, política LGPD, fiscalização e operações live aprovadas |
| F8 | **NÃO INICIADA** | F7 concluída de fato e autorizações específicas para staging, PSP sandbox externo, Meta/Resend, restore, piloto e release |

## Decisões e dependências do responsável
- Aprovar horas úteis, prazos e canais de suporte; não inventar metas contratuais.
- Aprovar políticas LGPD/retention/direitos de terceiros e responsável jurídico; jamais apagar registros fiscais automaticamente.
- Selecionar serviço privado de anexos e scanner, política de retenção e quotas antes do upload em produção.
- Autorizar domínio e infraestrutura de staging, credenciais externas, backup/restore e revisão independente.
- Em base populada, autorizar janela/método de migração de índices; migração 020 usa CREATE INDEX transacional, não CONCURRENTLY.
- Não alterar `main`, não mesclar PR #2, não fazer deploy ou habilitar PSP/Meta live sem permissão separada.

**Próximo agente:** verificar HEAD, issue #3, CI no mesmo SHA, ler AGENTS.md, estado.json e este documento; manter gates abertos até prova de aceite. Não converter testes de código em homologação.
