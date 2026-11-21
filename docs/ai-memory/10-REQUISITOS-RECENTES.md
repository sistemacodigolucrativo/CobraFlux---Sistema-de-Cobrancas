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

**Fase 7 atual:** REQ-101 respostas de suporte é **parcial** (portal somente), REQ-104 LGPD ponta a ponta e REQ-105 SLA/monitoramento seguem pendentes.
