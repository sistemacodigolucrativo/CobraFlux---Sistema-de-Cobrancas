# 04 — Backlog Consolidado, Único e Priorizado

**Corte:** 21/11/2026, HEAD `9c854473`. Este backlog contém **somente trabalho aberto, parcial ou decisão pendente**. Funcionalidades já implementadas/testadas constam na matriz `02` e não são repetidas como tarefas independentes. IDs `BL-*` não existiam previamente; são índices deste handoff.

**Priorização:** **P0** = bloqueio de segurança, integridade/obrigações antes de dinheiro real ou lançamento (não significa que deve ser executado antes do próximo commit de F7); **P1** = conclusão da fase ativa ou dependência substantiva; **P2** = melhoria/escopo futuro relevante; **P3** = cosmético ou opção ainda sem autorização. Prioridades propostas aqui são **classificação da auditoria**, não substituem prioridades explícitas do usuário no roadmap.

**Regra:** itens dependentes de hospedagem/PSP têm execução adiada por decisão explícita, **não cancelada**. «Não validado» não é «defeituoso». Recomendações novas estão marcadas como propostas, não comandos autorizados.

## Índice de itens por categoria

| Grupo | Categoria | Itens |
|---|---|---:|
| A | Correções críticas e bloqueios de segurança/integridade para release | 5 |
| B | Funcionalidades aprovadas ainda não concluídas | 6 |
| C | Implementações parciais que precisam ser fechadas | 7 |
| D | Validações externas pendentes | 9 |
| E | Refinamentos e melhorias (com indicação de recomendações novas) | 6 |
| F | Ideias/opções não aprovadas ou indefinidas | 5 |

**Total:** 38 itens únicos. Não converter em percentual de completude.


## A — Correções críticas e bloqueios de segurança/integridade para release

### BL-001 — Gate anti-live obrigatório
- **Título/descrição:** Proibir merge/deploy, cobranças real e mensagens Meta a clientes sem autorização formal; não há bug confirmado de bypass na CI, é gate crítico de release.
- **Origem e rastreabilidade:** Issue #3; REQ-002,007,011,057,113.
- **Prioridade:** **P0 — risco de movimentação financeira/envios não autorizados**.
- **Aprovação:** **APROVADA (proibição explícita)**.
- **Implementação:** **EM DESENVOLVIMENTO (guardas de código; governança de liberação faltante)**.
- **Dependências:** Homologação de PSP/Meta, F8, revisão segurança.
- **Critérios de aceitação:** Nenhum live habilitado sem checklist assinada, credenciais segregadas, consentimento/validação e rollback.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Criar checklist release com prova do PSP, autorização explícita, teste de feature flags e rollback; mantê-lo bloqueado.

### BL-002 — Governança de segredos e chaves em produção
- **Título/descrição:** Garantir gestão de chaves, rotação, revogação e acesso mínimo a segredos administrativos/Meta/PSP.
- **Origem e rastreabilidade:** Issue #3; REQ-009,032,029; docs F1/F3/F5.
- **Prioridade:** **P0 — vazamento de dados financeiros e privilégios**.
- **Aprovação:** **APROVADA (princípio)**.
- **Implementação:** **IMPLEMENTADA PARCIALMENTE — criptografia código testada, operação de segredos não configurada**.
- **Dependências:** Provedor de secrets, staging, MFA, contas externas.
- **Critérios de aceitação:** Teste de não exposição em UI/log; chaves rotacionáveis e segredos não publicados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Definir política segura de secrets e teste de rotação em staging; NÃO criar/distribuir valores agora.

### BL-003 — Proteção LGPD antes de dados reais em produção
- **Título/descrição:** Fechar bases legais, retenção, exclusão/anonimização controlada e resposta verificável a titulares.
- **Origem e rastreabilidade:** Issue #3 F7/F8; REQ-102–104; LGPD.
- **Prioridade:** **P0 antes do go-live — dados pessoais/financeiros e obrigações legais**.
- **Aprovação:** **APROVADA (necessidade de conformidade)**.
- **Implementação:** **EM DESENVOLVIMENTO (intake/triagem testados; cumprimento final não)**.
- **Dependências:** Revisão jurídica, staging, backups, suporte.
- **Critérios de aceitação:** Retenção e atendimento documentados/aprovados, prova por caso, nunca deletar financeiro indevidamente.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Projetar e revisar o fluxo completo com profissional jurídico, distinguir requisitos legais de sugestões técnicas.

### BL-004 — Verificar suspensão segura em execução concorrente
- **Título/descrição:** Testar se workers em voo e sessões paralelas obedecem bloqueio de organização; risco inferido, sem defeito confirmado.
- **Origem e rastreabilidade:** Recomendação da auditoria sobre REQ-093/094.
- **Prioridade:** **P1 — potencial envio indevido durante mudança de status**.
- **Aprovação:** **PROPOSTA DA AUDITORIA (não aprovada)**.
- **Implementação:** **NÃO INICIADA como bateria de teste de concorrência externa**.
- **Dependências:** F7, staging, workers, eventos.
- **Critérios de aceitação:** Nenhum job novo ou finalizado após suspensão onde regra proíba, sessão revogada imediatamente.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Adicionar testes concorrentes e threat model, só após aceite; não afirmar vulnerabilidade sem reprodução.

### BL-005 — Revisar modelagem de receita e contabilização antes de habilitar live
- **Título/descrição:** Impedir que filtros de status/provider gerem reconhecimento de receita sem cadeia de confirmação externa.
- **Origem e rastreabilidade:** Docs F6/F7; REQ-096,089.
- **Prioridade:** **P0 para finanças live — falso reconhecimento de receita**.
- **Aprovação:** **APROVADA como requisito de integridade**.
- **Implementação:** **EM DESENVOLVIMENTO — métricas restritivas em código, PSP real ausente**.
- **Dependências:** PSP SaaS e merchant live, conciliação, fiscal.
- **Critérios de aceitação:** Eventos verificados, reembolsos, períodos/annualização corretos, GPV/MRR separados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Especificar e testar critérios com contabilidade/PSP antes de ativar qualquer live.


## B — Funcionalidades aprovadas ainda não concluídas

### BL-006 — Respostas administrativas de suporte e SLA
- **Título/descrição:** Adicionar mensagens de resposta real, histórico acessível, notificação comprovável, SLA e gestão de estado.
- **Origem e rastreabilidade:** Issue #3 F7; REQ-039/100/101.
- **Prioridade:** **P1 — fechamento do escopo funcional da F7**.
- **Aprovação:** **APROVADA — roadmap F7**.
- **Implementação:** **PLANEJADA (triagem já testada; resposta não)**.
- **Dependências:** Email real ou canal escolhido, RBAC, retention.
- **Critérios de aceitação:** Ticket possui resposta auditada e cliente sabe se foi entregue; não marcar envio fictício.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Desenhar contrato de mensagens/entregas com status idempotentes e testes, sem enviar agora.

### BL-007 — Atendimento LGPD de ponta a ponta
- **Título/descrição:** Executar acesso, retificação, portabilidade e decisões fundamentadas sem excluir registros retidos legalmente.
- **Origem e rastreabilidade:** Issue #3 F7; REQ-104.
- **Prioridade:** **P1 para desenvolvimento F7, P0 release**.
- **Aprovação:** **APROVADA — fase 7**.
- **Implementação:** **PLANEJADA (intake/triagem implementados)**.
- **Dependências:** Acordo jurídico, DPO, retenção, auditoria, exportação.
- **Critérios de aceitação:** Cada pedido percorre fluxo verificável e é resolvido com evidência e restrições legais.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Mapear processo e estados de cumprimento; implementar apenas após revisão do escopo legal.

### BL-008 — Relatórios financeiros e exportações completos
- **Título/descrição:** Ampliar filtros, intervalos, paginação/portabilidade e explicitar dados consolidados vs estimados.
- **Origem e rastreabilidade:** Issue #3 F7; REQ-096–099.
- **Prioridade:** **P1 — qualidade de gestão e fechamento F7**.
- **Aprovação:** **APROVADA — roadmap relatórios**.
- **Implementação:** **EM DESENVOLVIMENTO — sumários e CSV 1000 itens testados**.
- **Dependências:** PSP para renda real; tenant; performance.
- **Critérios de aceitação:** Filtros corretos, totais reconciliados, download por páginas com data lineage.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Comparar demo e relatórios operacionais, especificar métricas e testes de acúmulo.

### BL-009 — Centro de notificações funcional
- **Título/descrição:** Completar o módulo de notificações do mockup com eventos do servidor, permissões e opt-out.
- **Origem e rastreabilidade:** Doc Golden Billing; REQ-020.
- **Prioridade:** **P2 — paridade funcional, sem comprometer segurança**.
- **Aprovação:** **APROVADA no objetivo de converter mockup; detalhamento indefinido**.
- **Implementação:** **EM DESENVOLVIMENTO — existe fila WhatsApp, centro geral não comprovado**.
- **Dependências:** F3/F5, preferências, consentimentos.
- **Critérios de aceitação:** Eventos do DB renderizados, diferenciação mensagem enviada/entregue e pagamento verificado.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Inventariar componentes demo e decidir comportamento de notificações antes de codar.

### BL-010 — Site institucional e onboarding de produção
- **Título/descrição:** Revisar registro, confirmação, recuperação, páginas públicas, planos, termos e FAQ reais.
- **Origem e rastreabilidade:** Doc Golden Billing; REQ-014.
- **Prioridade:** **P2 — UX onboarding e conformidade pré-publicação**.
- **Aprovação:** **APROVADA como conversão geral do mockup**.
- **Implementação:** **EM DESENVOLVIMENTO — auth real existe, paridade global não comprovada**.
- **Dependências:** F1/F6/F7, texto legal, deploy.
- **Critérios de aceitação:** Landing real não anuncia funcionalidades inexistentes, autentica na API e mostra termos corretos.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Executar inventário de páginas demo e produção; abrir tarefas específicas.

### BL-011 — Android real de publicação
- **Título/descrição:** Converter WebView demo para cliente do web app operacional, depois build AAB assinado e Play interno.
- **Origem e rastreabilidade:** Issue #3 F9; REQ-115–119.
- **Prioridade:** **P2 agora, P0 antes do release Android**.
- **Aprovação:** **APROVADA no roadmap F9**.
- **Implementação:** **PLANEJADA — branch demo não integrada**.
- **Dependências:** F8, HTTPS, Play Console, API 36+.
- **Critérios de aceitação:** Login, cookies, downloads, notificações e UX passam em aparelhos físicos; bundle assinado.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Manter separado até F8 e inspecionar branch Android antes de iniciar.


## C — Implementações parciais que precisam ser fechadas

### BL-012 — Fase 7: integração final da UI de relatórios/admin
- **Título/descrição:** Revisar formulários, tratamento de erro, navegação por papel, acessibilidade e paridade do painel real.
- **Origem e rastreabilidade:** Issue #3; REQ-091–105; commit 9c854473.
- **Prioridade:** **P1 — F7 atual**.
- **Aprovação:** **APROVADA**.
- **Implementação:** **EM DESENVOLVIMENTO — primeira entrega implementada/testada em CI**.
- **Dependências:** Catálogo de UX do demo, revisão cross-device.
- **Critérios de aceitação:** Testes visuais/controlados para status, lista vazia, falha de rede, tokens expirados, foco/scroll.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Auditar cada tela F7 em navegador e escrever testes de fluxos específicos.

### BL-013 — Fase 2: paridade visual funcional integral
- **Título/descrição:** Comparar todos os cards, menus, formulários e páginas do demo com modo real.
- **Origem e rastreabilidade:** Issue #3 F0/F2; REQ-015,019,044.
- **Prioridade:** **P1 — requisito expresso e dívida transversal**.
- **Aprovação:** **APROVADA**.
- **Implementação:** **EM DESENVOLVIMENTO — navegação e smoke testados; paridade fina não**.
- **Dependências:** Screenshots e fluxos demo/real, CSS, Android.
- **Critérios de aceitação:** Inventário sem lacunas nem elementos escondidos, regressão em viewport mobile.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Produzir checklist por componente e testes de screenshots, sem copiar simuladores financeiros.

### BL-014 — Fase 6: PSP de assinatura da plataforma
- **Título/descrição:** Completar checkout, webhooks autenticados, reembolsos, reconciliação, ativação pós-pagamento e cupons.
- **Origem e rastreabilidade:** Issue #3 F6; REQ-088–090.
- **Prioridade:** **P1 para fechamento do produto, P0 antes do preço comercial**.
- **Aprovação:** **APROVADA como fase; fornecedor e preços INDEFINIDOS**.
- **Implementação:** **EM DESENVOLVIMENTO — ledger/quote/draft testados, PSP live ausente**.
- **Dependências:** Fornecedor SaaS, preços, ambiente sandbox, legal.
- **Critérios de aceitação:** Nenhuma elevação por invoice draft; somente evento verificado e conciliação ativa o plano.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Elaborar especificação neutra ao PSP, levantar decisões comerciais, esperar contratação para homologar.

### BL-015 — Fase 3: levar adapter de testes à homologação real
- **Título/descrição:** Adapter existe com mocks, mas falta provar Pix/QR/evento/refund/cancelamento no Asaas Sandbox remoto.
- **Origem e rastreabilidade:** Issue #3 F3; REQ-056/057.
- **Prioridade:** **P1 para preparar operação financeira, P0 para ativar live**.
- **Aprovação:** **APROVADA como etapa sandbox**.
- **Implementação:** **EM DESENVOLVIMENTO — código/CI testados, exterior não**.
- **Dependências:** Asaas Sandbox, HTTPS, credenciais e consentimento.
- **Critérios de aceitação:** Logs/redações PSP reais reconciliados; sem dinheiro live.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Preparar plano de testes externos, sem ativar live nem inserir segredos no Git.

### BL-016 — Fase 5: lembretes automáticos e notificações finais
- **Título/descrição:** Fila e scheduler desligado por padrão; precisa teste real de opt-out/template e entrega.
- **Origem e rastreabilidade:** Issue #3 F4/F5; REQ-066,076,078.
- **Prioridade:** **P1 antes de automação de lembretes**.
- **Aprovação:** **APROVADA — arquitetura de Meta oficial**.
- **Implementação:** **EM DESENVOLVIMENTO — queue e worker com mocks, sem envio remoto**.
- **Dependências:** Meta WABA, templates, consentimento, HTTPS, cron.
- **Critérios de aceitação:** Nenhum destinatário sem prova; delivery/status verificáveis e fallback de erro.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Documentar casos de teste e autorização de envio teste, somente após contas.

### BL-017 — Fase 1: operacionalização de MFA e e-mail
- **Título/descrição:** Fluxos implementados com testes; faltam e-mail entregue e provisioning de superadmin em staging.
- **Origem e rastreabilidade:** Issue #3 F1; REQ-026–029,107.
- **Prioridade:** **P1 para readiness e P0 go-live**.
- **Aprovação:** **APROVADA**.
- **Implementação:** **EM DESENVOLVIMENTO — código validado, operação não**.
- **Dependências:** Resend, HTTPS, chave MFA, conta verificada.
- **Critérios de aceitação:** Login real, recuperações e revogações com evidência sem segredo.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Preparar runbook privado e testá-lo quando houver staging.

### BL-018 — Plano de deploy e restore
- **Título/descrição:** Dockerfile/scripts existentes mas não há rotina externa de backup, PITR, monitoramento, rollback.
- **Origem e rastreabilidade:** Issue #3 F1/F8; REQ-108–113.
- **Prioridade:** **P0 pré-lançamento**.
- **Aprovação:** **APROVADA**.
- **Implementação:** **EM DESENVOLVIMENTO — scripts versionados sem operação remota**.
- **Dependências:** PostgreSQL gerenciado, storage, secret manager, hosted server.
- **Critérios de aceitação:** Backup restaurável, alertas e rollback demonstrados com evidências.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Criar plano operacional/homologação, sem executar deploy até aprovação.


## D — Validações externas pendentes

### BL-019 — Validar e-mail Resend externo
- **Título/descrição:** Confirmar fluxo end-to-end de registro, recuperação e convite, com remetente autorizado.
- **Origem e rastreabilidade:** Issue #3 F1/F2; REQ-026/027/040/107.
- **Prioridade:** **P0 release — autenticação e suporte dependem do transporte**.
- **Aprovação:** **APROVADA; adiada por usuário**.
- **Implementação:** **BLOQUEADA (sem conta/hosting comprovados)**.
- **Dependências:** Staging/Resend.
- **Critérios de aceitação:** E-mails de teste recebidos e tokens expiram; logs sem conteúdo sigiloso.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Quando houver staging, executar suite externa controlada e anexar evidência redigida.

### BL-020 — Validar Asaas Sandbox com webhooks e refunds
- **Título/descrição:** Confirmar adapter host, callback, QR, evento fora de ordem, refunds DONE e timeout.
- **Origem e rastreabilidade:** Issue #3 F3; REQ-045–056.
- **Prioridade:** **P0 antes de transação live**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Asaas Sandbox/HTTPS.
- **Critérios de aceitação:** Cenários de integração reais aprovados e conciliados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Abrir conta de homologação sob custódia e testar sem money live.

### BL-021 — Validar Meta WABA e templates reais
- **Título/descrição:** Verificar HMAC, opt-out, entrega/read, custos e throttling com números autorizados.
- **Origem e rastreabilidade:** Issue #3 F5; REQ-067–078.
- **Prioridade:** **P0 antes de envio real**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Meta WABA/HTTPS/consentimento válido.
- **Critérios de aceitação:** Evidência de template UTILITY aprovado e destinatário consentido.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Quando houver infraestrutura, testar escopo test e deixar live fechado.

### BL-022 — Habilitar agendador de recorrências sob observabilidade
- **Título/descrição:** Executar cron e validar idempotência sob concorrência real e reinício.
- **Origem e rastreabilidade:** Issue #3 F4; REQ-065.
- **Prioridade:** **P1 operação sem cron não automatiza**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Staging/DB/alertas.
- **Critérios de aceitação:** Cada ciclo tem único draft e runs monitorados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Criar job de scheduler depois de staging e backup.

### BL-023 — Habilitar scheduler SaaS e WhatsApp enqueue de teste
- **Título/descrição:** Validar jobs one-shot recorrentes com locks/retentativas, sem ativar envio live.
- **Origem e rastreabilidade:** Issue #3 F5/F6; REQ-076/086.
- **Prioridade:** **P1 operação automatizada**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Cron/Meta e DB.
- **Critérios de aceitação:** Estados e filas evoluem sem duplicação ou PII vazada.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Planejar horário, observabilidade e feature gates por job.

### BL-024 — Validar restauração PostgreSQL off-site
- **Título/descrição:** Executar backup + restore drill e registrar consistência, RPO/RTO.
- **Origem e rastreabilidade:** Issue #3 F1/F8; REQ-108–110.
- **Prioridade:** **P0 segurança de dados de clientes**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** DB gerenciado/backup.
- **Critérios de aceitação:** Restore real em base separada, logs e hash íntegros.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Executar teste somente após provisionamento seguro autorizado.

### BL-025 — Homologar UX em Android físico
- **Título/descrição:** Testar login, cookies, navegação, uploads, exports e performance, inclusive MIUI/One UI.
- **Origem e rastreabilidade:** Issue #3 F2/F9; REQ-018/118.
- **Prioridade:** **P1 antes de distribuir Android**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** APK real, HTTPS, dispositivos.
- **Critérios de aceitação:** Checklist em modelos e APIs relevantes, sem bugs bloqueantes.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Estabelecer matriz de devices e execução física após F8.

### BL-026 — Homologar RGPD/LGPD e obrigações fiscais
- **Título/descrição:** Verificar bases legais, prazos, notas, retenção e suporte jurídico/fiscal brasileiro.
- **Origem e rastreabilidade:** Issue #3 F6/F7/F8; REQ-090/104.
- **Prioridade:** **P0 go-live por risco regulatório**.
- **Aprovação:** **APROVADA como necessidade, decisão específica indefinida**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Especialistas e modelo comercial.
- **Critérios de aceitação:** Parecer/revisão assinada e implementação correspondente.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Preparar tópicos para revisão jurídica/fiscal, sem afirmar conformidade.

### BL-027 — Teste de carga, segurança e rollback
- **Título/descrição:** Avaliar limites sob carga, reconciliação e segurança do SaaS live em staging.
- **Origem e rastreabilidade:** Issue #3 F8; REQ-111–113.
- **Prioridade:** **P0 release**.
- **Aprovação:** **APROVADA; adiada**.
- **Implementação:** **PLANEJADA**.
- **Dependências:** Staging e ambiente de backup.
- **Critérios de aceitação:** Nenhum P0/P1 aberto, relatórios de stress e rollback.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Planejar casos OWASP/concurrency, executar após staging.


## E — Refinamentos e melhorias (com indicação de recomendações novas)

### BL-028 — Revisar naming/package e README
- **Título/descrição:** `package.json` ainda usa `react-example`, README não encontrado no HEAD; padronizar quando autorizado.
- **Origem e rastreabilidade:** Inspeção de `package.json`/árvore; recomendação auditoria.
- **Prioridade:** **P3 — documentação e manutenção**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Revisão branding e workflow.
- **Critérios de aceitação:** Nome coerente e README que aponta aos docs vigentes.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Solicitar aceite e alterar em commit pequeno após F7 se priorizado.

### BL-029 — Formalizar política de migração e rollback
- **Título/descrição:** Documentar rollback forward-only, backups, ensaio de migrações com DDL não reversível.
- **Origem e rastreabilidade:** Inspeção de `migrate.ts`, F8; recomendação auditoria.
- **Prioridade:** **P2 — manutenção de esquema e recuperação**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Backups/DB, staging.
- **Critérios de aceitação:** Guia testado de upgrade/rollback preserva dados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Escrever runbook e ensaiar em BD isolado quando permitido.

### BL-030 — Cobertura de acessibilidade e testes visuais
- **Título/descrição:** Formalizar WCAG, teclado, foco, leitores e regressões de screenshot por viewport.
- **Origem e rastreabilidade:** Issue #3 F2; recomendação auditoria; REQ-015/018.
- **Prioridade:** **P2 — evita regressões de UX**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **PLANEJADA como revisão visual, sem auditoria WCAG confirmada**.
- **Dependências:** UI F7, devices.
- **Critérios de aceitação:** Relatório de foco, contraste, sem clipping e navegação teclado.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Levantar baseline e escopo sem inventar conformidade.

### BL-031 — Verificar desempenho de exports e analytics grandes
- **Título/descrição:** Avaliar paginação e índices com volume elevado e memória ao gerar CSV.
- **Origem e rastreabilidade:** Inspeção F7; recomendação auditoria.
- **Prioridade:** **P2 — evitar lentidão em tenants grandes**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **NÃO INICIADA como benchmark**.
- **Dependências:** Staging/datasets sintéticos, métricas.
- **Critérios de aceitação:** Export e consultas dentro de SLO mensurável sob carga.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Elaborar benchmark e plano de streaming/paginação se necessário.

### BL-032 — Revisar metodologia de MRR e reembolsos
- **Título/descrição:** Definir tratamento anual, trials, descontos, cancelamento, refunds, impostos sem inflar MRR.
- **Origem e rastreabilidade:** Inspeção `phase7-routes.ts`; recomendação auditoria.
- **Prioridade:** **P1 antes da monetização real**.
- **Aprovação:** **PROPOSTA DA AUDITORIA — definição comercial ainda indefinida**.
- **Implementação:** **NÃO INICIADA para edge cases comerciais**.
- **Dependências:** PSP SaaS, fiscal, métricas.
- **Critérios de aceitação:** Fórmulas auditadas reconciliadas com ledger live.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Propor especificação e validar com equipe financeira antes do provider.

### BL-033 — Auditoria da qualidade de logs e PII
- **Título/descrição:** Verificar minimização de payload em eventos/audit, anonimização, políticas de acesso/retention.
- **Origem e rastreabilidade:** Inspeção F7; recomendação auditoria.
- **Prioridade:** **P1 por privacidade e compliance**.
- **Aprovação:** **PROPOSTA DA AUDITORIA**.
- **Implementação:** **NÃO INICIADA como revisão independente**.
- **Dependências:** LGPD/observabilidade.
- **Critérios de aceitação:** Logs sem tokens/PII desnecessária e retenção aprovada.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Conduzir threat model e inventário de campos com aprovação.


## F — Ideias/opções não aprovadas ou indefinidas

### BL-034 — Fornecedor de checkout SaaS e condições comerciais
- **Título/descrição:** Escolher PSP da plataforma, precificação Starter/Business, desconto, ciclo, regras de chargeback/taxas.
- **Origem e rastreabilidade:** Docs F6; REQ-088–090.
- **Prioridade:** **P1 decisão de produto para concluir F6 live**.
- **Aprovação:** **INDEFINIDA — nenhum fornecedor/preço aprovado**.
- **Implementação:** **PLANEJADA**.
- **Dependências:** Pesquisa atual/contrato/contabilidade.
- **Critérios de aceitação:** Decisão registrada em ADR, API/ambientes separados.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Apresentar opções com custos/regras e solicitar aprovação, não contratar por conta própria.

### BL-035 — Fornecedor de hosting e domínio
- **Título/descrição:** Escolher serviço gerenciado e domínio HTTPS de staging/produção.
- **Origem e rastreabilidade:** Docs fundação; REQ-106/112.
- **Prioridade:** **P1 para homologação**.
- **Aprovação:** **INDEFINIDA — usuário afirmou não ter hospedagem**.
- **Implementação:** **BLOQUEADA**.
- **Dependências:** Custos, região, DB, compliance.
- **Critérios de aceitação:** Contrato/ambiente escolhidos com critérios explícitos.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Preparar comparativo após definição de orçamento e restrições.

### BL-036 — Refatoração para contrato `IGoldenBillingService`
- **Título/descrição:** Documento demo sugeria `httpApiService.ts` e `VITE_USE_REAL_API`; runtime atual usa ProductionApp.
- **Origem e rastreabilidade:** ADR-004; docs Golden Billing.
- **Prioridade:** **P3 — alternativa arquitetural não adotada**.
- **Aprovação:** **PROPOSTA HISTÓRICA, NÃO APROVADA COMO MUDANÇA ATUAL**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Arquitetura operacional vigente, testes.
- **Critérios de aceitação:** Somente realizar se houver decisão e razão concretas.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Não reintroduzir contrato legado automaticamente; registrar divergência.

### BL-037 — Mercado Pago/Efí como alternativas PSP
- **Título/descrição:** Documento original cita provedores, mas adapter inicial escolhido é Asaas Sandbox.
- **Origem e rastreabilidade:** Documento Golden Billing; ADR-010.
- **Prioridade:** **P3 — opção de arquitetura, não tarefa pendente**.
- **Aprovação:** **INDEFINIDA; NÃO REJEITADA FORMALMENTE**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Comparativo PSP e decisão comercial.
- **Critérios de aceitação:** Provedor escolhido após auditoria de custos, sem mudança clandestina de gateway.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Não implementar providers alternativos sem escolha.

### BL-038 — Utilizar Universal Build para CobraFlux
- **Título/descrição:** Projeto Android universal apareceu em conversa separada; integração não solicitada de forma conclusiva neste escopo.
- **Origem e rastreabilidade:** Histórico de outra conversa, fronteira de escopo.
- **Prioridade:** **P3 — evita mistura entre repositórios**.
- **Aprovação:** **NÃO APROVADA PARA O COBRAFLUX**.
- **Implementação:** **NÃO INICIADA**.
- **Dependências:** Decisão específica F9.
- **Critérios de aceitação:** Se desejado, definir interface/repo com autorização explícita.
- **Validação necessária:** evidência no commit/CI se desenvolvimento; staging/PSP/Meta/backup/dispositivo real quando especificado; revisão legal quando aplicável. Não fechar com declaração verbal da IA.
- **Próxima ação concreta:** Manter Universal Build independente; não importar regras dele.

---

## Verificação de ausência de duplicação e autorização
- Cada `BL-*` possui um único agrupamento principal; referências à mesma dependência em outros itens são **vínculos**, não ordens para executar duas vezes.
- A primeira sequência operacional autorizada é **continuar Fase 7** (`BL-006`, `BL-007`, `BL-008` e `BL-012` conforme o conjunto acima), após checar HEAD/CI, não operar serviços externos.
- Ideias do grupo F exigem decisão explícita; não se deve tratar alternativas antigas como backlog aprovado.
- Ausência de bugs P0 reproduzidos no HEAD atual: o grupo A mapeia **gates/riscos críticos de pré-lançamento**, não afirma falhas de produção.
- Itens ligados a Fase 8 e Fase 9 não estão autorizados a publicar/mergear apenas porque o roadmap existe.
