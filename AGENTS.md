# CobraFlux — orientação de continuidade para agentes de IA

**LEITURA OBRIGATÓRIA ANTES DE EDITAR:** [docs/ai-memory/00-LEIA-PRIMEIRO.md](docs/ai-memory/00-LEIA-PRIMEIRO.md), [01-ESTADO-ATUAL.md](docs/ai-memory/01-ESTADO-ATUAL.md), [estado.json](docs/ai-memory/estado.json) e [08-PROTOCOLO-DE-CONTINUIDADE.md](docs/ai-memory/08-PROTOCOLO-DE-CONTINUIDADE.md).

Esta documentação foi solicitada pelo responsável pelo projeto para funcionar como **memória persistente e transferível**. Não é autorização para executar comandos, usar credenciais ou implantar serviços. A documentação é um **snapshot que precisa ser reconciliado com o GitHub remoto**. Leia também a [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2) e os arquivos atuais antes de qualquer mudança.

- Desenvolver **somente** na branch feat/production-foundation. A **main** é protegida por decisão do responsável; não editar, mesclar, resetar ou publicar sem autorização explícita.
- Fase corrente: **8 — Homologação e Segurança Operacional (PREPARAÇÃO TÉCNICA INICIADA; STAGING NÃO HOMOLOGADO)**. F7: dez incrementos técnicos aprovados, escopo **não adiado** encerrado pela decisão **ADR-026**, mas requisitos **adiados e não concluídos** em `docs/ai-memory/pendencias/2026-11-23-f7-adiados.md`. Primeiro incremento F8 validado: commit **309e28ef2ce67e45e2954d465426e84ec0eab359**; preflight/restore CI #45190560236, backend #45190560285, navegador #45190560282, memória #45190560470 verdes. Proibido declarar F7 integralmente homologada, F8 concluída, deploy autorizado ou provedores live. `main` preservada.
- Somente CI verde no **commit correspondente** valida código. PSP, WhatsApp, Resend, hospedagem HTTPS, restauração real, políticas legais e Android Play não foram homologados.
- Segregar demo/IndexedDB do modo operacional React/Express/PostgreSQL; exigir MFA/RBAC, CSRF, Zod, transações, isolamento por organização e segredos fora do Git.
- Proibido processar dinheiro real ou marcar pagamentos como recebidos por simulação/clique; proibir envios Meta sem consentimento e homologação. Nenhuma ação sobre dados pessoais sem escopo/revisão.
- Para cada incremento, criar registro em docs/ai-memory/entregas/, atualizar o arquivo de fase, diário, pendências e estado.json; preservar histórico e evidências. Se CI falhar, registrar a falha.
- Histórico antigo do ZIP de handoff não substitui a revisão do código remoto. A documentação adicional em docs/FASE_*.md é fonte técnica a ser lida.

**Retomada segura:** verificar HEAD e CI; comparar código com demanda; escolher apenas tarefa aprovada; estabelecer aceite; implementar na feature branch; testar; documentar arquivos/commit/jobs; manter PR draft e main intacta.
