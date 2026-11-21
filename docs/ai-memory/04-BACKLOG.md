# 04 — Backlog reconciliado e prioridades

**Fonte primária atual:** [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3). **Fonte histórica:** arquivo 04-BACKLOG-CONSOLIDADO.md do ZIP (BL-001 a BL-038). IDs e decisões de origem permanecem imutáveis; não transformar ideias em aprovações.

## Fase 7: tarefas de desenvolvimento ainda em aberto
| ID histórico | Assunto | Situação em 21/11/2026 | Próximo aceite técnico |
| --- | --- | --- | --- |
| BL-006 | Respostas, SLA e suporte | **Parcial:** resposta/histórico no portal TESTADOS em 4dcbb80; timeline interna de status TESTADA em 96e58848; prazo manual TESTADO em 472b0bd; alertas internos em consulta e ciência versionada TESTADOS em 42f7eec; e-mail, SLA comercial automático, anexos e notificações externas ausentes | Definir política aprovada, alertas e entrega verificável sem simulação; manter testes permissão e atraso |
| BL-007 | Direitos LGPD ponta a ponta | Triagem existente, atendimento legal ainda **não concluído** | Evidência/revisão, portabilidade integral, retenção sob parecer jurídico |
| BL-008 | Relatórios/exportações completos | Métricas e CSV limitados implementados | Filtragem, paginação integral, integridade de números e segurança de dados |
| BL-012 | Paridade da interface F7 | Primeiro incremento testado | Verificar demo vs operação, papéis, estados de erro, acessibilidade, mobile |
| BL-003/004/005 | LGPD, concorrência da suspensão, precisão MRR/GPV | Gate de segurança/riscos | Tests de concorrência e revisão de origem financeira antes de live |
| BL-031/032/033 | Carga de export, MRR e logs/PII | Refinamentos necessários | Medir com dataset e prova; não declarar por inspeção |

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
Escolher um recorte **já aprovado** de BL-006/007/008/012. Prioridade sugerida: **política real de SLA e notificação verificável**, ou LGPD/exportações, aproveitando migrações 017–019 e testes, sem alegar envio externo. Antes de codar: verificar código e decisões, definir critérios mensuráveis, testar erro/CSRF/MFA/cross-tenant, atualizar docs após CI.

**Status não é binário:** PLANEJADA, EM DESENVOLVIMENTO, IMPLEMENTADA NÃO VALIDADA, IMPLEMENTADA TESTADA, HOMOLOGAÇÃO PENDENTE e OPERACIONAL são dimensões distintas. Não converter esta lista em percentual de conclusão.
