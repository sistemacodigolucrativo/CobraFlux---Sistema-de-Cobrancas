# 00 — Leia primeiro: memória persistente do CobraFlux

**Finalidade:** preservar o estado real, decisões, cronologia, evidências, pendências e instruções de handoff do CobraFlux para que um novo agente continue o projeto sem depender da memória do chat.

## Comece aqui
1. Leia este índice, **01-ESTADO-ATUAL.md** e **estado.json**.
2. Confira a branch, HEAD, PR #2, Issue #3 e GitHub Actions **ao vivo**. Nunca adote um SHA de documento como HEAD sem reverificar.
3. Leia **03-DECISOES.md** e **02-ARQUITETURA-E-SEGURANCA.md**.
4. Consulte **fases/** (0 a 9), **05-DIARIO-DE-DESENVOLVIMENTO.md** e **06-EVIDENCIAS.md**.
5. Consulte **04-BACKLOG.md** e identifique decisão aprovada, dependências, impacto cross-tenant e a próxima tarefa.
6. Execute **08-PROTOCOLO-DE-CONTINUIDADE.md**; antes de qualquer mudança leia os arquivos reais. Registre cada entrega em **entregas/**.

## Fontes e ordem de precedência
1. **GitHub atual (HEAD real, diff, PR/Issue, testes no mesmo SHA)**: prova técnica contemporânea.
2. **Decisão expressa mais recente do responsável**: autoridade de escopo, quando não contradiz segurança ou lei.
3. **Documentação específica de fase em docs/**: arquitetura e implementação, sujeita a rechecagem.
4. **Esta pasta**: índice persistente e histórico cumulativo.
5. **Pacote de handoff de 21/11/2026**: fotografia histórica, não estado automaticamente atual. Consulte **07-FONTES-E-INTEGRIDADE.md**.

## Definição honesta de status
- **PLANEJADA:** escopo deliberado, sem código final.
- **IMPLEMENTADA — NÃO VALIDADA:** código remoto presente, mas ainda não possui evidência do CI correspondente.
- **IMPLEMENTADA — TESTADA:** CI/integração que cobre o incremento aprovados no SHA.
- **HOMOLOGAÇÃO PENDENTE:** falta provar o ambiente externo, fornecedor, usuário/dispositivo, restauração ou revisão jurídica.
- **OPERACIONAL:** somente com deploy e homologação reais comprovados. Até o snapshot desta pasta, **nenhuma fase foi demonstrada como entregue operacionalmente em produção**.

## Projeto
- Repositório: https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas
- Branch de desenvolvimento permitida: feat/production-foundation
- Branch principal: main — não modificar sem autorização.
- PR de acompanhamento: https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2 (draft em 21/11/2026).
- Issue mestre: https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3
- **Há 10 fases, numeradas de 0 a 9**; não transformar itens técnicos parcialmente aprovados em fases operacionais encerradas.
