# HANDOFF ATUAL — CobraFlux, 25/11/2026

> **Documento de entrada para qualquer nova IA.** Este documento é um registro da revisão atual, não comprova que o código não mudou depois do snapshot. **Antes de agir, revalidar HEAD remoto, PR, Issue e workflows.** Não transferir decisões não documentadas nem declarar tarefas concluídas sem evidências.

## 1. Escopo e confirmação remota nesta revisão

- **Repositório público:** [sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas).
- **Branch autorizada:** `feat/production-foundation`. **HEAD observado antes deste commit documental:** `da401007721c8d98eca7800509c955c4bc07de56`. `main` observada em `95aba9c27c363c8b24c2f34c65a28c2f3b011b3b`.
- [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2) **draft**, **não mesclada**. [Issue roadmap #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3) é a trilha cumulativa; rever antes de editar.
- **Último incremento de código documentado e validado:** `7208ae2f96e27d7873294d7fe47caa72401ef5a7` (F9 #01 Android). **HEAD de documentação + código antes desta revisão:** `da401007...`.
- **CI verificável no HEAD anterior `da401007...`:** os 10 registros retornados em Actions para esse SHA estavam `success`, incluindo backend, Chromium, Android debug, supply chain, auditoria/SBOM, gates F8, restore sintético e memória (há duas execuções para certos workflows). Isso **não** prova homologação externa.
- **Nenhuma operação liberada:** não há deploy de produção, merge, integração financeira live, AAB release, Play Store aprovada, chaves reais ou testes de provedores externos comprovados.
- Data do handoff = **25/11/2026**; artefatos/relatos anteriores de 23/11 são referências históricas, não atualidade operacional.

## 2. Como o sistema está organizado

- **Frontend:** React/TypeScript/Vite, com demo original separado do modo `VITE_APP_MODE=production`; `src/pages/production/` e `src/services/productionApi.ts`.
- **Backend operacional:** Express/TypeScript, PostgreSQL multi-organização (isolamento por tenant/sessão), autenticação/MFA, RBAC, CSRF, validação e auditoria. Ver `server/`, migrações e [arquitetura](02-ARQUITETURA-E-SEGURANCA.md).
- **Cobranças:** Integração Asaas projetada para **sandbox**, regras de idempotência, estados financeiros somente confirmados pelo provedor. Recorrência cria rascunhos, não Pix automaticamente.
- **Comunicações:** Meta WhatsApp e Resend previstos, controles de consentimento/opt-out e flags; **não** confundir filas/local mocks com entrega real.
- **SaaS/admin:** planos e limites, portal de suporte, relatórios/CSV e solicitações de privacidade, parcialmente implementados e testados em CI.
- **Android:** `mobile/android/` WebView com API 36, Java/Gradle; build de APK **debug** sem origem HTTPS configurada por padrão e sem contas demonstrativas. Sem autorização Play/release ou homologação em aparelhos.
- **Segurança:** CI com `npm ci`, lockfile e actions fixadas por SHA, contêineres por digest, restauração PostgreSQL **sintética**, SBOM e gates offline. Recursos reais requerem infraestrutura e aceite.

## 3. Matriz de fases — estado real, não apenas nomes

| Fase | Estado respaldado |
| --- | --- |
| F0–F6 | Núcleos técnicos construídos/documentados em histórico; homologação externa real **não comprovada**. Ver `fases/`, `docs/FASE_*.md`, CI/commits específicos. |
| F7 — Admin/suporte/LGPD/export | 10 incrementos de código implementados/testados em CI no escopo anterior. **ADR-026 adiou requisitos obrigatórios; F7 integral NÃO homologada.** |
| F8 — Homologação/segurança | Controles locais #01–09 testados, **12 gates externos pendentes**, incluindo staging/backup/PSP/Meta/Resend/jurídico/QA/rollback. **4 achados moderados** PWA/Workbox sem remediação/aceite. **Não homologada.** |
| F9 — Android/Play | Iniciada tecnicamente; #01 Java WebView/API36, testes e APK debug construídos. Sem URL de staging, testes físicos, AAB de release, Billing aprovado ou Play. **Em desenvolvimento.** |

**Links essenciais:** [pendências F7 ADR-026](pendencias/2026-11-23-f7-adiados.md), [F8 12 gates](../security/phase8-acceptance-gates.json), [runbook F8](../security/phase8-homologation-runbook.md), [F9 entrega #01](entregas/2026-11-23-f9-01-android-debug.md), [fases](fases/README.md).

## 4. O que aconteceu após F9 #01 — PEDIDO NOVO, NÃO IMPLEMENTADO

O responsável **redirecionou a prioridade para decisões LGPD**, solicitando apenas **problemas a resolver**, sem itens já corretos, sem detalhes técnicos, **sem redundâncias** e com explicações acessíveis. A lista final de trabalho contém **10 pendências em 6 categorias**, preservadas integralmente em [Checklist LGPD e HTML pendente](pendencias/2026-11-25-lgpd-decisoes-e-html.md):

1. **Direitos dos usuários:** 01 confirmação de identidade; 02 atendimento dos pedidos LGPD.
2. **Exclusão e conservação:** 03 exclusão/anonimização; 04 política de retenção.
3. **Acesso e transferência:** 05 portabilidade completa dos dados.
4. **Responsabilidades/transparência:** 06 papéis de CobraFlux versus profissionais; 07 política de privacidade e canal.
5. **Proteção de informações:** 08 documentos/anexos; 09 comprovação da segurança real.
6. **Validação jurídica:** 10 revisão das obrigações aplicáveis.

**Não misturar** esse checklist para decisões do responsável com todos os controles técnicos F7/F8 do roadmap. Itens técnicos diferidos (SLA, export snapshot, carga, acessibilidade, avisos de segurança) **continuam pendentes** no backlog; apenas não devem sobrecarregar o formulário de decisões de negócio.

Em seguida, o responsável solicitou **um único arquivo HTML responsivo premium, simples, CSS/JS embutidos**, contendo o texto completo dos 10 itens, alternativas para escolher, persistência das marcações e **botão flutuante de exportação TXT, HTML com respostas incorporadas ou PDF por impressão**. O usuário repetiu a solicitação e perguntou se o arquivo tinha sido criado.

**Status factual:** NENHUM HTML final foi gerado, entregue ou encontrado no repositório nesta revisão. Respostas do usuário: **NENHUMA DEFINIDA**. Não responder "já foi feito". O pedido do HTML é a **tarefa imediatamente pendente**, anterior ao retorno a outras implementações.

## 5. Plano de retomada prioritário sem pedir que o usuário se repita

**Passo 1 — Entrega imediata solicitada (novo artefato):** ler [especificação LGPD integral](pendencias/2026-11-25-lgpd-decisoes-e-html.md) e criar HTML único com conteúdo completo + escolhas separadas, notas e persistência; layout mobile. Não usar bibliotecas remotas. Exportar TXT, HTML autossuficiente com respostas embutidas e PDF via imprimir/salvar PDF. Não tomar decisões por padrão. Verificar que arquivo existe antes de publicar link; se versionar, apenas modelo **sem respostas de pessoas** e na feature branch.

**Passo 2 — Esperar decisões reais do responsável:** quando o usuário enviar HTML/TXT/PDF preenchido, ler as respostas, preservar preferências e condições; identificar contradições, requisitos legais e itens adiados. **Não executar exclusões ou reter dados em desconformidade** apenas porque uma caixa foi marcada. Se solicitado, transformar escolhas em especificação de implementação validável.

**Passo 3 — LGPD/ADR-026:** revisar papéis controlador/operador, bases legais, legitimidade, retenção financeiro-fiscal, resposta auditável, export consistente/portabilidade, uploads seguros, transparência. Buscar revisão jurídica proporcional; separar decisões de negócio de implementação e homologação. Ver [F7 adiados](pendencias/2026-11-23-f7-adiados.md) e [BL backlog](04-BACKLOG.md).

**Passo 4 — Se o responsável pedir Android:** retomar F9 #02 somente depois de revisar `mobile/android/` e os gates relevantes; resolver download/arquivo/sessões com dados sintéticos. **Sem Play, deploy ou API real** até autorização e gates atendidos.

**Passo 5 — Operação real:** staging, TLS, DB distinto, backup offsite/PITR, segredos/fornecedores, auditorias, Android físico e release exigem responsáveis, decisões e evidência externa. CI verde é condição técnica, **não autorização**.

## 6. Segurança, validação e regras de governança

- **Sempre conferir remoto:** HEAD da feature, SHA da main, PR #2 draft/merged, Issue #3 e Actions do **mesmo SHA**. Em casos de descompasso, o GitHub atual prevalece sobre este snapshot.
- **Nunca alterar `main` sem autorização explícita**, nem mesclar PR #2, fazer deploy, conectar contas externas, usar segredos, enviar comunicações reais, publicar AAB/Play ou movimentar dinheiro.
- Código: preservar isolamento multi-organização, sessão/MFA/RBAC, proteção CSRF, Zod, centavos, idempotência financeira, migrações incrementais, demo isolado.
- Dados LGPD: não excluir registros financeiros automaticamente, nunca colocar dados reais, documentos, respostas sensíveis ou tokens em docs públicos. A lista de opções **não é parecer jurídico** e não contém decisões já tomadas.
- **Documentar entregas reais:** código SHA, CI/run ID, o que foi testado, o que não foi; atualizar `AGENTS.md`, `01-ESTADO-ATUAL.md`, `estado.json`, fase, ADR quando decisão existir, diário, evidências, `Issue #3`; referência em [08-PROTOCOLO](08-PROTOCOLO-DE-CONTINUIDADE.md). Commit só de docs **não altera** `lastVerifiedCodeCommit`.
- **Memória histórica íntegra:** 12 arquivos originais SHA-256 em [originais](originais/), fonte de REQ-001–119 e ADR-001–024; não reescrever, ver [07-FONTES-E-INTEGRIDADE](07-FONTES-E-INTEGRIDADE.md).

## 7. Prompt de retomada para outra IA

> Estou dando continuidade ao **CobraFlux**, repositório `sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas`. Leia **AGENTS.md**, **docs/ai-memory/00-LEIA-PRIMEIRO.md**, **docs/ai-memory/11-HANDOFF-ATUAL-2026-11-25.md**, **docs/ai-memory/estado.json**, e **docs/ai-memory/pendencias/2026-11-25-lgpd-decisoes-e-html.md**; depois consulte PR #2, Issue #3 e HEAD remoto. Trabalho **somente em `feat/production-foundation`**, não altero `main`, não faço deploy nem ativo provedores sem permissão. A F9 tem apenas preview APK debug; a F8 tem 12 gates externos pendentes e a F7 mantém ADR-026 não concluída. **Prioridade atual do usuário: entregar o HTML único, mobile, com todo o checklist LGPD de 10 itens, alternativas editáveis, persistência e botão flutuante de exportação TXT/HTML com respostas/PDF. Ainda não foi criado.** Não solicite novamente as 10 descrições: estão no documento. Faça o arquivo, valide e entregue. Não assuma escolhas do usuário e registre o que realmente realizou.
