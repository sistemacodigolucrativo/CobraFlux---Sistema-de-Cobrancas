# 10 — Rastreabilidade de requisitos e solicitações novas

**Matriz de origem integral:** [02-MATRIZ-DE-REQUISITOS.md](originais/02-MATRIZ-DE-REQUISITOS.md) — 119 requisitos REQ-001 a REQ-119, cada um com decisão, implementação e evidência como dimensões distintas. A matriz original é um **snapshot imutável**, não reescrever para reflectir novos commits.

| Grupo | Intervalo | Fonte temática |
| --- | --- | --- |
| GOV | REQ-001–011 | Governança, branches, processo e decisão do responsável |
| DEMO | REQ-012–020 | Conversão do mockup e paridade |
| SEC | REQ-021–032 | Segurança, identidade e infraestrutura |
| OPS | REQ-033–044 | Cadastros, equipe, operação |
| PIX | REQ-045–057 | Asaas Sandbox / Pix |
| REC | REQ-058–066 | Recorrências |
| META | REQ-067–078 | WhatsApp Meta |
| SAAS | REQ-079–090 | Monetização da plataforma |
| ADM | REQ-091–105 | Administração, relatórios, suporte, LGPD |
| OPSREL | REQ-106–113 | Homologação/backup/deploy |
| ANDROID | REQ-114–119 | APK/AAB/Play e dispositivos |

## REQ-120 — Memória cumulativa e transição para outra IA
- **Origem:** solicitação do responsável em 21/11/2026 após a Fase 7 de suporte.
- **Decisão:** APROVADA (documentação persistente). ADR-025.
- **Objetivo:** criar pasta no GitHub com documentação de todos os marcos/fases, últimas entregas, decisões e anexos históricos, com protocolo de acompanhamento por IA.
- **Implementação:** docs/ai-memory/, AGENTS.md, 10 documentos de fase, estado.json, evidências/diário, registros de entrega e **12/12 originais exatos**.
- **Validação:** hashes Git exatos dos originais verificados; workflow de integridade automatizado avalia 12 SHA-256 e estrutura. Aguardar resultado no commit que instala o workflow.
- **Aceite final:** revalidar HEAD, GitHub Actions e acessibilidade dos links; não autoriza alteração da main ou deploy.
- **Observação:** chats futuros não são arquivados automaticamente. Só o conteúdo registrado em commits fica persistente.

## Regras para REQ-121+
Criar ID livre, preservar origem (incluindo número original da anotação, quando existir), decisão aprovada/pedida/indefinida, escopo, critérios de aceite, execução, SHA/CI e pendências externas. Vincular BL/ADR/arquivo de fase. Não inventar evidência nem modificar retroativamente os REQ históricos.

**Fase 7 atual:** REQ-100 triagem foi ampliada por timeline de status no commit 96e58848 (testado); REQ-101 respostas de suporte permanece **parcial** (portal somente), REQ-104 LGPD ponta a ponta e REQ-105 SLA/monitoramento seguem pendentes.

## REQ-121 — Requisitos LGPD reduzidos para decisão do responsável (25/11/2026)
- **Origem:** o usuário pediu somente os problemas ainda pendentes, excluindo funcionalidades corretas, redundâncias e detalhes técnicos.
- **Escopo:** 10 itens em 6 categorias, cada um com contexto, obrigatoriedade e alternativas simples. [Fonte preservada para decisão](docs/ai-memory/pendencias/2026-11-25-lgpd-decisoes-e-html.md).
- **Decisão/execução:** escopo de documentação aprovado; **nenhuma das 10 opções foi escolhida**; a LGPD real continua sob ADR-026 e legislação aplicável.

## REQ-122 — Checklist LGPD em HTML único com respostas persistentes (25/11/2026)
- **Origem:** pedido repetido do usuário para transformar a lista integral em HTML offline premium/mobile, CSS/JS embutidos, inputs por item, autosave e botão flutuante para TXT, HTML com escolhas integradas e PDF.
- **Status factual:** **SOLICITADO — NÃO IMPLEMENTADO/NÃO ENTREGUE**, conforme árvore remota e conversa. **Prioridade imediata.**
- **Aceite:** [definição detalhada](pendencias/2026-11-25-lgpd-decisoes-e-html.md), com checagem de export em novo navegador; nenhuma opção marcada por padrão.

## REQ-123 — Handoff atualizado do projeto para outra IA (25/11/2026)
- **Origem:** solicitação expressa para registrar estado, decisões, lacunas e procedimento exato de continuidade no GitHub.
- **Entrega documental:** [Handoff de 25/11](11-HANDOFF-ATUAL-2026-11-25.md), atualização do estado, protocolo, backlog, evidências, diário e Issue #3; validar integridade do commit documental pelo GitHub Actions antes de declarar sucesso.
- **Limites:** documentação não significa HTML criado, decisão jurídica aprovada, F7 integral concluída, F8 homologada ou F9 publicada.
