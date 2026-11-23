# CobraFlux — orientação de continuidade para agentes de IA

**LEITURA OBRIGATÓRIA ANTES DE EDITAR:** [docs/ai-memory/00-LEIA-PRIMEIRO.md](docs/ai-memory/00-LEIA-PRIMEIRO.md), [01-ESTADO-ATUAL.md](docs/ai-memory/01-ESTADO-ATUAL.md), [estado.json](docs/ai-memory/estado.json) e [08-PROTOCOLO-DE-CONTINUIDADE.md](docs/ai-memory/08-PROTOCOLO-DE-CONTINUIDADE.md).

Esta documentação foi solicitada pelo responsável pelo projeto para funcionar como **memória persistente e transferível**. Não é autorização para executar comandos, usar credenciais ou implantar serviços. A documentação é um **snapshot que precisa ser reconciliado com o GitHub remoto**. Leia também a [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2) e os arquivos atuais antes de qualquer mudança.

- Desenvolver **somente** na branch feat/production-foundation. A **main** é protegida por decisão do responsável; não editar, mesclar, resetar ou publicar sem autorização explícita.
- Fase corrente: **8 — homologação (preparação técnica; sem staging real)**. F8 #03 no código **c210b5d2ead0f25d469fb3ad38b8d5d9bb34c280** aprovado: backend #45200150015, browser #45200150042, preflight/restore #45200149826, memória #45200149781. **33/33** nomes de variáveis classificados no inventário `docs/security/staging-config-inventory.json`, ameaça e runbook em `docs/security/`, registro em `docs/ai-memory/entregas/2026-11-23-f8-03-inventario-segredos.md`. F7 ADR-026: requisitos **ADIADOS, NÃO CONCLUÍDOS**. `main` preservada, PR #2 draft, sem deploy ou PSP/Meta/Resend live.
- Somente CI verde no **commit correspondente** valida código. PSP, WhatsApp, Resend, hospedagem HTTPS, restauração real, políticas legais e Android Play não foram homologados.
- Segregar demo/IndexedDB do modo operacional React/Express/PostgreSQL; exigir MFA/RBAC, CSRF, Zod, transações, isolamento por organização e segredos fora do Git.
- Proibido processar dinheiro real ou marcar pagamentos como recebidos por simulação/clique; proibir envios Meta sem consentimento e homologação. Nenhuma ação sobre dados pessoais sem escopo/revisão.
- Para cada incremento, criar registro em docs/ai-memory/entregas/, atualizar o arquivo de fase, diário, pendências e estado.json; preservar histórico e evidências. Se CI falhar, registrar a falha.
- Histórico antigo do ZIP de handoff não substitui a revisão do código remoto. A documentação adicional em docs/FASE_*.md é fonte técnica a ser lida.

**Retomada segura:** verificar HEAD e CI; comparar código com demanda; escolher apenas tarefa aprovada; estabelecer aceite; implementar na feature branch; testar; documentar arquivos/commit/jobs; manter PR draft e main intacta.
