# 03 — Registro persistente de decisões

**Fonte histórica:** handoff original **03-REGISTRO-DE-DECISOES.md** (ADR-001 a ADR-024), cujo conteúdo integral permanece no pacote original (consulte 07-FONTES-E-INTEGRIDADE.md). Este documento é um índice reconciliado, **não substitui a redação histórica integral**.

| ADR | Decisão vigente | Observação |
| --- | --- | --- |
| 001 | Transformar demo em plataforma funcional | Sem apagar demo |
| 002 | Preservar main; atuar em feat/production-foundation e PR draft | **Vigente** |
| 003 | Homologação de infraestrutura adiada para pré-lançamento | **Adiada, não dispensada** |
| 004 | Isolar modo demo e produção por build | ProductionApp, não trocar retroativamente por proposta de serviço legado |
| 005 | Express/TypeScript e PostgreSQL multi-tenant | Sessão como autoridade |
| 006 | Autorização/tenant no servidor | Zero trust no body |
| 007 | Segurança da identidade | Hash, recuperação, verificação e sessões |
| 008 | Superadmin exige MFA TOTP validado | Não autoconceder papel |
| 009 | Valores financeiros em centavos, estados originados do PSP | Nada de paid por clique |
| 010 | Asaas Sandbox primeiro; live vedado | PSP externo não homologado |
| 011 | Requisição financeira inconclusiva não reenvia POST cegamente | Reconciliação |
| 012 | Recorrências geram apenas draft | Não emitem Pix por si |
| 013 | WhatsApp oficial Meta e consentimento versionado | Não confiar em checkbox antigo |
| 014 | Workers não ficam ligados por padrão | Só ativar em infraestrutura homologada |
| 015 | MRR SaaS da plataforma separado de GPV de profissionais | Duas contabilidades |
| 016 | Free default; upgrade após liquidação confirmada | Fatura draft não ativa premium |
| 017 | Downgrade preserva dados | Cotas em criação |
| 018 | Superadmin, MFA, auditoria, exposição mínima | Governação pendente |
| 019 | CSV sensível protegido (CSRF, papéis, anti-fórmula) | Export limitado |
| 020 | LGPD sob triagem, sem exclusão automática | Revisão jurídica |
| 021 | Android após estabilidade do web operacional | Demo Android não equivale a Play |
| 022 | CI e documentação a cada incremento | Evitar conclusão verbal sem SHA |
| 023 | Backup/restore só validados com execução real | Scripts não bastam |
| 024 | Segredos e dados pessoais minimizados | Revisão de logs pendente |

## Decisão nova — ADR-025 (21/11/2026)
**Tema:** memória técnica cumulativa e transferível versionada no repositório.

**Origem:** solicitação expressa do responsável após a última validação da Fase 7: criar pasta remota com todo conhecimento rastreável e documentar continuamente cada etapa/fase, habilitando retomada por outra IA.

**Aprovada quanto ao processo documental.** Implantar docs/ai-memory + AGENTS.md; atualizar estado.json, arquivo de fase, diário, evidências e registro de entregas a cada commit de funcionalidade. Manter versões anteriores recuperáveis via histórico Git, nunca sobrescrever evidência por impressão. Atualizar Issue #3 com links. **Esta decisão não autoriza** deploy, merge, exclusão de dados, serviços live nem alteração de main.

## Decisões ainda pendentes
PSP de checkout da plataforma e preços Starter/Business; hosting e custos; credenciais; go-live financeiro, consentimento operacional, políticas LGPD, impostos/NFSe, cron real, release Android. Itens de ideias (**BL-034 a BL-038**) não viram implementações sem decisão.

**Regra de mudança:** se houver ADR posterior, documentar ID novo, motivo, origem, regra substituída, decisões descartadas **apenas quando constarem de fonte** e evidência. Não reescrever histórico antigo.

## ADR-026 — Reprogramação documentada da F7 e início técnico da F8 (23/11/2026)

**Fonte e autorização:** o responsável solicitou que os requisitos não concluídos fossem **anotados para análise posterior** e que, na ausência de outras tarefas fora desses requisitos, se seguisse para a Fase 8. Não houve autorização para merge, deploy, provedores externos, dinheiro, ou exclusão de dados.

**Decisão:** preservar a lista imutável de 10 incrementos técnicos validados da F7; tratar o desenvolvimento **não adiado** como encerrado para o escopo aprovado; mover todos os gates não executados para [pendências formalizadas](pendencias/2026-11-23-f7-adiados.md), sem declarar a F7 juridicamente/operacionalmente concluída. Iniciar F8 apenas com preflight e exercícios descartáveis sem serviços externos. A matriz anterior de fechamento é mantida como auditoria histórica, acrescida desta decisão de replanejamento.

**Não foi decidido:** termos de SLA, base legal LGPD, políticas fiscais, garantias de snapshots, preços, serviços de storage, domínio e hospedagem, segredos, PSP/Meta/Resend live, release ou main. **Status de cada requisito: ADIADO — NÃO CONCLUÍDO.**
