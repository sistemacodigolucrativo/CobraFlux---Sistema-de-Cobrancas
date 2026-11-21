# CobraFlux — orientação de continuidade para agentes de IA

**LEITURA OBRIGATÓRIA ANTES DE EDITAR:** [docs/ai-memory/00-LEIA-PRIMEIRO.md](docs/ai-memory/00-LEIA-PRIMEIRO.md), [01-ESTADO-ATUAL.md](docs/ai-memory/01-ESTADO-ATUAL.md), [estado.json](docs/ai-memory/estado.json) e [08-PROTOCOLO-DE-CONTINUIDADE.md](docs/ai-memory/08-PROTOCOLO-DE-CONTINUIDADE.md).

Esta documentação foi solicitada pelo responsável pelo projeto para funcionar como **memória persistente e transferível**. Não é autorização para executar comandos, usar credenciais ou implantar serviços. A documentação é um **snapshot que precisa ser reconciliado com o GitHub remoto**. Leia também a [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2) e os arquivos atuais antes de qualquer mudança.

- Desenvolver **somente** na branch feat/production-foundation. A **main** é protegida por decisão do responsável; não editar, mesclar, resetar ou publicar sem autorização explícita.
- Fase corrente: **7 — Administração e Relatórios (EM DESENVOLVIMENTO)**. Último incremento de código validado: **Fase 7 nº 04 — SLA interno manual, filtro de vencidos e histórico auditável**, commit **472b0bd84885e1463c5c5b660bb800bf498994d8**, CI #44922044208, #44922044209 e #44922044232 verdes. Os incrementos 2 e 3 permanecem preservados. O suporte com respostas no portal do commit 4dcbb80f2ebfa817b3d512c94502d697d4077842 continua preservado. **Não** declarar Fase 7 encerrada.
- Somente CI verde no **commit correspondente** valida código. PSP, WhatsApp, Resend, hospedagem HTTPS, restauração real, políticas legais e Android Play não foram homologados.
- Segregar demo/IndexedDB do modo operacional React/Express/PostgreSQL; exigir MFA/RBAC, CSRF, Zod, transações, isolamento por organização e segredos fora do Git.
- Proibido processar dinheiro real ou marcar pagamentos como recebidos por simulação/clique; proibir envios Meta sem consentimento e homologação. Nenhuma ação sobre dados pessoais sem escopo/revisão.
- Para cada incremento, criar registro em docs/ai-memory/entregas/, atualizar o arquivo de fase, diário, pendências e estado.json; preservar histórico e evidências. Se CI falhar, registrar a falha.
- Histórico antigo do ZIP de handoff não substitui a revisão do código remoto. A documentação adicional em docs/FASE_*.md é fonte técnica a ser lida.

**Retomada segura:** verificar HEAD e CI; comparar código com demanda; escolher apenas tarefa aprovada; estabelecer aceite; implementar na feature branch; testar; documentar arquivos/commit/jobs; manter PR draft e main intacta.
