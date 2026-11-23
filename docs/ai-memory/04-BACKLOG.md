# 04 — Backlog reconciliado e prioridades

**Fonte primária atual:** [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3). **Fonte histórica:** arquivo 04-BACKLOG-CONSOLIDADO.md do ZIP (BL-001 a BL-038). IDs e decisões de origem permanecem imutáveis; não transformar ideias em aprovações.

## Fase 7: requisitos pendentes ADIADOS para análise posterior (ADR-026)

**Replanejado em 23/11/2026:** o núcleo técnico F7 (incrementos 1–10) encerra seu escopo de desenvolvimento atualmente autorizado. As linhas seguintes **não foram implementadas nem aceitas**; permanecem registradas em [requisitos adiados](pendencias/2026-11-23-f7-adiados.md). A F8 pode iniciar pela preparação técnica sem deploy, mantendo os gates obrigatórios para homologação.
| ID histórico | Assunto | Situação em 23/11/2026 | Próximo aceite técnico |
| --- | --- | --- | --- |
| BL-006 | Respostas, SLA e suporte | **Parcial:** resposta/histórico no portal TESTADOS em 4dcbb80; timeline interna de status TESTADA em 96e58848; prazo manual TESTADO em 472b0bd; alertas internos em consulta e ciência versionada TESTADOS em 42f7eec; e-mail, SLA comercial automático, anexos e notificações externas ausentes | Definir política aprovada, alertas e entrega verificável sem simulação; manter testes permissão e atraso |
| BL-007 | Direitos LGPD ponta a ponta | Triagem, eventos LGPD append-only (49d134a) e lotes access/portability auditáveis (1c16c6a) testados; cumprimento LGPD integral **não concluído** | Evidência/revisão, portabilidade integral, retenção sob parecer jurídico |
| BL-008 | Relatórios/exportações completos | Prévia e paginação por offset testadas em a157e6f; modo keyset por cursor HMAC, tenant+filtro e corte de novas inserções TESTADO em e88ddfe; índices 020 e benchmark sintético 100k clientes+100k cobranças testados (1fbc06a), ainda sem snapshot sob mutações e carga de produção | Avaliar performance e índices, testar carga/concorrência, considerar snapshot export assíncrono somente com autorização, revisar LGPD/PII |
| BL-012 | Paridade da interface F7 | Primeiro incremento testado | Verificar demo vs operação, papéis, estados de erro, acessibilidade, mobile |
| BL-003/004/005 | LGPD, concorrência da suspensão, precisão MRR/GPV | Gate de segurança/riscos | Tests de concorrência e revisão de origem financeira antes de live |
| BL-031/032/033 | Carga de export, MRR e logs/PII | Refinamentos necessários | Benchmark sintético 100k+100k concluído; ainda requer dados concorrentes/reais em staging, validação de MRR e auditoria PII |

## Débitos históricos por fase
- F0: baseline completo do demo e inventário por componente.
- F1 (BL-002/017/018/019/024): staging HTTPS, Resend, MFA operacional, backup off-site e restore testado.
- F2 (BL-010/013/030): site/onboarding real, paridade demo, convite por e-mail real, acessibilidade.
- F3 (BL-001/015/020): Asaas Sandbox externo, eventos/estornos/webhooks reais de teste, autorização separada para live.
- F4 (BL-022): scheduler/cron real monitorado.
- F5 (BL-009/016/021/023): Meta WABA, templates aprovados, consentimento/entrega/opt-out e notificações.
- F6 (BL-005/014/032): PSP SaaS, preço/comercial, webhook verificado, impostos, cupons após pagamento.
- F8 (BL-003/018/024/026/027): homologação, backup/PITR, carga, observabilidade, revisão legal, piloto e rollback.
- F9 (BL-011/025): conectar Android à API real, testes físicos, target API compatível, AAB e Play.

## Ideias não aprovadas
BL-034 fornecedor/preço checkout SaaS; BL-035 hosting/domínio; BL-036 refatoração IGoldenBillingService; BL-037 PSPs alternativos; BL-038 Universal Build. **Não implementar por conta própria.**

## Próximo incremento recomendado, ainda F7
Escolher um recorte **já aprovado** de BL-006/007/008/012. Prioridade sugerida: **testes de carga e consistência real de exportações (BL-008/031)**, LGPD jurídica ou paridade visual, preservando a segurança comprovada e testes, sem alegar envio externo. Antes de codar: verificar código e decisões, definir critérios mensuráveis, testar erro/CSRF/MFA/cross-tenant, atualizar docs após CI.

**Status não é binário:** PLANEJADA, EM DESENVOLVIMENTO, IMPLEMENTADA NÃO VALIDADA, IMPLEMENTADA TESTADA, HOMOLOGAÇÃO PENDENTE e OPERACIONAL são dimensões distintas. Não converter esta lista em percentual de conclusão.
