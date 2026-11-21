# 06 — Roadmap, Marcos, Dependências e Critérios de Aceitação

**Fonte mestra:** [GitHub Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), criada para acompanhar auditoria de 20/11/2026; docs F1–F7 no HEAD do repositório. Corte técnico confirmado: `9c854473` em 21/11/2026, CI backend/Postgres e Playwright aprovadas.

## Como interpretar as quatro etapas de entrega

**PLANEJADO** = escopo aceito/registrado; **EXECUTADO** = código, SQL ou procedimento produzido; **VALIDADO** = evidência de testes adequada ao escopo declarado; **ENTREGUE OPERACIONALMENTE** = deploy, provedor externo, usuários/dispositivos e homologação comprovados. Nenhuma fase foi demonstrada como *operacionalmente entregue em produção* neste histórico.

A decisão vigente permite **avançar implementação em código**, testando no GitHub Actions, **antes** de haver staging. Isso não apaga gates nem autoriza serviços live. Deve haver duas colunas distintas para **núcleo técnico** e **homologação externa**.

## Panorama completo de fases 0–9

| Fase | Meta e principais entregáveis | Planejado | Execução/código | Validação técnica observada | Operação/homologação |
|---|---|---|---|---|---|
| **0 — Preparação** | Auditoria do demo, branch feature, PR draft, CI, baseline completo | Sim | Branch/PR/CI existentes; baseline integral não | CI funcionando no HEAD | Não |
| **1 — Segurança/base** | PostgreSQL, auth, CSRF, MFA, e-mail, sessões, backup | Sim | Núcleo implementado; scripts de backup/restore; integração email preparada | CI/PG/código aprovado | **Não:** staging, Resend, MFA real, restore off-site |
| **2 — Cadastros/operação** | Clientes, serviços, drafts, CSV, equipe, perfil/suporte e UI responsiva | Sim | Núcleo implementado; paridade visual fina não | CI e browser desktop/mobile | **Não:** convite email real, revisão completa Android |
| **3 — Pix Asaas** | Adaptação **sandbox** de Pix, QR, webhooks, estorno, cancelamento, conciliação | Sim | Código e mock tests implementados | CI sandbox/mock e Postgres | **Não:** Asaas Sandbox externo, HTTPS, Pix live proibido |
| **4 — Recorrências** | Regras semanais/mensais, calendário civil, worker de rascunhos idempotentes | Sim | Núcleo implementado | Testes de calendário/integridade/CI | **Não:** cron em hosting e carga real |
| **5 — WhatsApp** | Meta Cloud API, consentimento versionado, fila, callbacks, lembretes | Sim | Núcleo implementado, envio desativado | Testes mockados/webhook/unitários/CI | **Não:** Meta externa/entrega/custos/consentimentos auditados |
| **6 — Monetização SaaS** | Planos/cotas, faturas próprias, upgrade draft, coupons e dunning | Sim | **Núcleo técnico concluído**, último commit de referência `e79c829d` | CI aprovada nesse núcleo, revalidada em HEAD posterior | **Não:** PSP SaaS, cobrança, NFSe/preços/recebimento real |
| **7 — Admin/relatórios** | MFA/RBAC global, status de contas, suporte, LGPD, KPIs e exportações | Sim | **INICIADA**: 1º incremento com migração 016, telas/APIs | **Sim no incremento:** CI `9c854473` aprovada | **Não:** F7 integral, LGPD plena, suporte de resposta, staging |
| **8 — Homologação** | Segurança externa, carga, PITR, backup real, alertas, piloto e rollback | Sim | Scripts/CI de apoio disponíveis | Somente testes automatizados, não homologação | **Pendente** |
| **9 — Android Play** | Integrar aplicação real, target API 36+, assinar AAB, testes Play | Sim | Branch Android demo separada, sem app real integrado | Histórico de demo reportado; app real não testado | **Pendente** |

**Métrica de andamento:** não se deve calcular percentual de conclusão com `[x]` da Issue #3, pois diferentes itens envolvem testes de naturezas distintas, homologação externa e requisitos legais. Não há baseline ponderado aprovado.

## Marcos verificáveis do desenvolvimento

### M0 — Fundação do repositório

- `main` no commit `95aba9c27c363c8b24c2f34c65a28c2f3b011b3b`, criado em 13/11/2026 a partir da demo Golden Billing.
- Branch `feat/production-foundation` preserva conteúdo do mockup original e adiciona backend operacional.
- **Entrega:** fonte versionada e projeto demonstrativo; sem produção homologada.

### M1 — Fundação de backend/auth

- Código Express, migrações, PostgreSQL, sessão, MFA, email, CSRF, rate limits, teste de isolamento.
- A entrega de e-mail real, staging HTTPS e exercício restore eram gates originais. Decisão posterior do usuário **adiou**, não removeu, esses gates.
- **Aceite técnico:** testes de auth/segurança e migration no CI; **aceite operacional:** envio real, MFA provisionado, backup restaurável.

### M2 — Operações de profissionais

- `004_operations.sql`, `005_team_invitations.sql`, telas reais, arquivos CSV, CRUD, histórico, convites e painel responsivo.
- CI histórico navegador commit `6dd1798`; no HEAD atual, suite de regressão permanece aprovada.
- **Falta:** comparação exaustiva de todos os cards/campos/interações de demo, email real de convites, Android físico.

### M3 — Pix sob controle de sandbox

- `006` a `010`: emissões Asaas Sandbox, webhooks, comprovantes/estornos/reconciliação/cancelamento.
- **Não** usar para cobrar cliente em produção; mockações não são chamadas a conta Asaas externa.
- **Aceite futuro:** conta PSP de homologação, webhook HTTPS, transações de teste com prova externa, conciliação, antifraude, homologação e autorização de live **separada**.

### M4 — Recorrências sem débito automático

- `011_recurring_plans.sql`, regras, calendário `America/Sao_Paulo`, geração de `draft`, dedup e lease, CLI.
- **Aceite técnico:** calendário e integridade testados; **aceite operacional futuro:** cron/monitoramento, backup e carga sem duplicação.

### M5 — Mensageria sem disparo real

- `012` a `014`, Meta Cloud API v27.0, consentimento atual, STOP/PARAR, outbox, webhook HMAC, enfileiramento por vencimento e UI.
- **Aceite técnico:** flags default OFF, callbacks/idempotência/consentimentos testados; **aceite operacional futuro:** WABA, número autorizado, template UTILITY aprovado, custos, envio e opt-out reais.

### M6 — SaaS financeiro separado

- Migração `015_saas_billing.sql`, cotação/quotas/cupom/request idempotente, fatura `draft`, pagina Meu Plano; sem PSP próprio.
- **Último commit do núcleo técnico:** `e79c829de377fa816468ab409b9d4d233b019021`, 21/11/2026 05:15 UTC.
- **Critério válido:** código e CI aprovados; **não** se pode declarar a **Fase 6 inteira financeiramente concluída** sem checkout/PSP/live e fiscal.

### M7 — Fase atual: Administração/Relatórios, primeiro incremento

- Iniciada a partir de `d552e99f7eb1e7e4d6484b76035d7c8ec91c9245` (migração 016), 21/11/2026 13:36 UTC.
- Entre essa alteração e `9c8544730b47059f4f8977bd950e46227784c9c0` foram incorporados endpoints, telas, migração LGPD/tickets, relatórios, CSV protegido, auditoria e testes.
- Correções de testes intermediários: TypeScript da asserção audit (`79c45622`) e normalização de BOM CSV por Fetch (`9c854473`).
- **CI FINAL VERIFICADA:** backend Postgres [#44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191) **success**; browser [#44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168) **success**.
- **Importante:** primeiro incremento **testado**, **Fase 7 ainda aberta**.

## Próxima etapa autorizada — não implementar durante auditoria

**Objetivo:** concluir os elementos *funcionais e de governança* da **Fase 7** que podem ser feitos sem hospedagem, respeitando os bloqueios reais.

1. **Revalidar HEAD** de `feat/production-foundation`, PR #2, Issue #3, CI e migrações atuais. Não confundir `main` e branch feature.
2. **Auditar paridade** `src/pages/admin/AdminView.tsx` (demo) versus `AdminOperationsView.tsx` (real); `ReportsView.tsx` versus `ReportsOperationsView.tsx`; status, filtros, formulários, cards, fluxos vazios, erros e papéis. Preservar recursos demo sem contaminar DB operacional.
3. **Escolher próximo item F7 aprovado, não ideia nova:** 
   - acompanhamento e resposta de suporte com histórico, status de entrega e SLA, evitando afirmar entrega de e-mail sem envio real; **ou**
   - especificar e implementar fluxo LGPD de cumprimento e evidências que possa ser testado com dados fictícios, **sem apagar automaticamente registros financeiros** e sujeito a revisão legal; **ou**
   - completar relatórios autorizados/queries, paginação, integridade e tratamento de exportações e estados de UI.
4. Adicionar migração numerada nova quando necessária, teste multi-tenant e papel, testes de valores/segurança, UI SSR e Playwright desktop/mobile.
5. Só alterar `IMPLEMENTADA — TESTADA` depois de CI **verde no commit escrito**. Manter documentação e Issue #3 sincronizadas sem criar conclusão fictícia.
6. Não avançar Fase 8/Android antes do momento previsto nem iniciar PSP/Meta live sem gate.

**Resultado mínimo para declarar núcleo de Fase 7 tecnicamente encerrado futuramente:** cada subitem F7 de código implementado com testes específicos e sem bugs críticos de auth/tenant; avaliação de paridade visual; tickets respondidos ou status corretamente documentado; exportações/relatórios consistentes; direitos LGPD com processo revisável; documentação atualizada. **Mesmo então, homologação externa e revisão legal permanecem gates do release.**

## Caminho para produção depois do desenvolvimento

```text
Fase 7 (fechar funcionalidades e testes)
   -> Fase 8 (infraestrutura HTTPS, PG gerenciado, e-mail, backups/restore/PITR,
             PSP sandbox + SaaS PSP test, Meta autorizada, threat model,
             performance, privacidade, fiscal, piloto, rollback)
   -> aprovação expressa separada para cada recurso de dinheiro/envio live
   -> Fase 9 (app Android real, target/API Play compatível, AAB assinado,
             Play internal testing, testes aparelhos, políticas Google Play)
```

Este diagrama **não é autorização automática** de provisionar contas, alterar chaves, publicar, fazer merge ou processar pagamentos. Exige decisão do usuário e verificação das pré-condições.

## Itens que não devem ser elevados artificialmente de status

- **Fase 1:** scripts não significam backup restaurado e Postgres temporário não é staging.
- **Fase 2:** menu e smoke tests não são paridade pixel/funcional completa com o mockup.
- **Fase 3:** adapter e mocks de Asaas não significam Pix real ou homologação Asaas externa.
- **Fase 4/5:** worker one-shot e filas não significam cron/agendamento em produção, nem envio Meta.
- **Fase 6:** invoice draft não é invoice paga, cupom sem resgate não é plano pago ativo.
- **Fase 7:** triagem de ticket não é resposta enviada; pedido LGPD criado não é direito atendido; query de MRR não prova receita live.
- **Fase 8/9:** CI Chromium mobile não é instalação Android real nem autorização Play.

## Referências para retomar cada marco

- [Roadmap Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)
- [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2)
- [Código fixo do HEAD auditado](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/tree/9c8544730b47059f4f8977bd950e46227784c9c0)
- [Fase 7 técnica](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/blob/9c8544730b47059f4f8977bd950e46227784c9c0/docs/FASE_7_ADMIN_RELATORIOS_LGPD.md)
