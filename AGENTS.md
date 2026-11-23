# CobraFlux — orientação de continuidade para agentes de IA

**LEITURA OBRIGATÓRIA ANTES DE EDITAR:** [docs/ai-memory/00-LEIA-PRIMEIRO.md](docs/ai-memory/00-LEIA-PRIMEIRO.md), [01-ESTADO-ATUAL.md](docs/ai-memory/01-ESTADO-ATUAL.md), [estado.json](docs/ai-memory/estado.json) e [08-PROTOCOLO-DE-CONTINUIDADE.md](docs/ai-memory/08-PROTOCOLO-DE-CONTINUIDADE.md).

Esta documentação foi solicitada pelo responsável pelo projeto para funcionar como **memória persistente e transferível**. Não é autorização para executar comandos, usar credenciais ou implantar serviços. A documentação é um **snapshot que precisa ser reconciliado com o GitHub remoto**. Leia também a [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2) e os arquivos atuais antes de qualquer mudança.

- Desenvolver **somente** na branch feat/production-foundation. A **main** é protegida por decisão do responsável; não editar, mesclar, resetar ou publicar sem autorização explícita.
- Fase corrente: **8 — Homologação (PREPARAÇÃO TÉCNICA; STAGING NÃO HOMOLOGADO)**. Último código F8 **#04**, `4d43aa6c5cd8623d2ee0fe403ca016bfb51353cc`, CI backend #45205396845, browser #45205396796, F8 preflight #45205396813, supply chain + Docker build #45205396857, memória #45205396804 **success** no mesmo SHA. Npm lockfile v3 com 674 entradas passou a ser canônico; `bun.lock` desatualizado foi removido; 6 workflows read-only e Actions fixadas por SHA; `npm ci` nos builds. [Entrega](docs/ai-memory/entregas/2026-11-23-f8-04-ci-reprodutivel.md) e [runbook](docs/security/phase8-supply-chain-runbook.md). F7 ADR-026: requisitos **ADIADOS, NÃO CONCLUÍDOS**; `main` intacta, PR #2 draft, sem staging real, merge ou deploy.
- Somente CI verde no **commit correspondente** valida código. PSP, WhatsApp, Resend, hospedagem HTTPS, restauração real, políticas legais e Android Play não foram homologados.
- Segregar demo/IndexedDB do modo operacional React/Express/PostgreSQL; exigir MFA/RBAC, CSRF, Zod, transações, isolamento por organização e segredos fora do Git.
- Proibido processar dinheiro real ou marcar pagamentos como recebidos por simulação/clique; proibir envios Meta sem consentimento e homologação. Nenhuma ação sobre dados pessoais sem escopo/revisão.
- Para cada incremento, criar registro em docs/ai-memory/entregas/, atualizar o arquivo de fase, diário, pendências e estado.json; preservar histórico e evidências. Se CI falhar, registrar a falha.
- Histórico antigo do ZIP de handoff não substitui a revisão do código remoto. A documentação adicional em docs/FASE_*.md é fonte técnica a ser lida.

**Retomada segura:** verificar HEAD e CI; comparar código com demanda; escolher apenas tarefa aprovada; estabelecer aceite; implementar na feature branch; testar; documentar arquivos/commit/jobs; manter PR draft e main intacta.
