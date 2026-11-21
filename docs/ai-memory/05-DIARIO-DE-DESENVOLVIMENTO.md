# 05 — Diário cumulativo de execução

**Leitura:** histórico resumido reconstruído do pacote de handoff e da Issue #3, mais verificação direta da entrega seguinte em 21/11/2026. Datas e commits são evidências documentadas, não prova de hospedagem. Entradas novas devem ser **acrescentadas**, não substituir entradas anteriores. Ver entregas/ para o detalhamento por incremento.

| Ordem | Marco | Evidência de código e teste | Escopo e limitação |
| --- | --- | --- | --- |
| 2026-11-13 | Demo/base na main | 95aba9c27c363c8b24c2f34c65a28c2f3b011b3b | Golden Billing/CobraFlux demonstrativo, **não** produto homologado |
| 2026-11-20 | Auditoria/branch de fundação, PR #2, Issue #3 | docs/EXECUCAO_PRODUCAO_FUNDACAO.md; ver PR | Preservação da main, novo backend de produção |
| Fase 1 | PostgreSQL, identidade, MFA, sessões e segurança | docs/FASE_1_SEGURANCA_OPERACAO.md; testes CI | Envios Resend, MFA em staging e backup real pendentes |
| Fase 2 | Operações + equipe + shell responsivo | Migrações 004–005; CI navegador [#44817066812](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44817066812) no commit 6dd1798 | Paridade fina/Android físico não encerrados |
| Fase 3 | Asaas Sandbox, estornos, reconciliação, cancelamentos | Migrações 006–010; docs/FASE_3_PIX_ASAAS_SANDBOX.md | Sem conta externa homologada, sem Pix live |
| Fase 4 | Recorrências geram rascunhos idempotentes | Migração 011; docs/FASE_4_RECORRENCIAS.md | Worker/cron não ativado |
| Fase 5 | Meta WhatsApp, consentimento, fila e webhooks | Migrações 012–014; docs/FASE_5_WHATSAPP_META.md | Sem envio Meta real |
| Fase 6 | Planos/cotas/faturas do SaaS | Migração 015; commit e79c829de377fa816468ab409b9d4d233b019021; [CI #44870002881](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44870002881), [browser #44870002890](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44870002890) | Núcleo técnico implementado, sem checkout da plataforma |
| 2026-11-21 F7 incremento 1 | Admin/Relatórios/LGPD, export CSV e auditoria | Migração 016; commit 9c8544730b47059f4f8977bd950e46227784c9c0; [CI #44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191), [browser #44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168) | Primeiro incremento F7 testado, fase não encerrada |
| 2026-11-21 F7 incremento 2 | Resposta em suporte no portal, histórico, segurança e idempotência | Migração 017; commit [4dcbb80](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4dcbb80f2ebfa817b3d512c94502d697d4077842); [CI #44915970990](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915970990), [browser #44915971125](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915971125) | **IMPLEMENTADA — TESTADA**; sem e-mail/Meta/SLA; F7 continua aberta |
| 2026-11-21 memória | Solicitação expressa de persistir conhecimento em pasta remota | Este diretório, AGENTS.md, diário e arquivos de fases; consultar git log destes paths | 12 fontes originais importadas com hashes exatos; documentação apenas, sem novo incremento financeiro/operacional |

| 2026-11-21 F7 incremento 3 | Timeline administrativa de status dos tickets | [Commit 96e58848](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/96e58848cb696489560fa14fcbceaf19357d2566), [backend #44920626498](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44920626498) e [browser #44920626428](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44920626428) — success | RBAC e motivos auditáveis; sem notificação externa nem SLA; F7 aberta |

| 2026-11-21 F7 incremento 4 | Gestão manual de prazo SLA, filtro vencidos, eventos imutáveis | [Código 472b0bd](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/472b0bd84885e1463c5c5b660bb800bf498994d8); [backend #44922044208](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044208), [browser #44922044209](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044209), [memória #44922044232](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44922044232) — success | Implementado e testado; sem política SLA automática, alertas, e-mail nem deploy; F7 aberta |

| 2026-11-21 F7 incremento 5 | Inbox interna de prazos vencidos, reconhecimento versionado e auditado | [Código 42f7eec](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/42f7eecf6aa5ee25adb3d135930d73befbeaa6b8), [backend/PostgreSQL #44928047228](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047228), [Chromium #44928047306](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047306), [memória #44928047281](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44928047281) — success | Implementado e testado; alerta somente ao consultar painel, nenhuma notificação externa e F7 aberta |

| 2026-11-21 F7 incremento 6 | Exportação CSV filtrada/paginada e prévia de contagem por tenant | [Código a157e6f](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/a157e6f832f5180f7824d3836394b6fabbde5677), [backend #44930963112](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963112), [browser #44930963010](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963010), [memória #44930963018](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963018) — success | IMPLEMENTADA — TESTADA; sem snapshot entre páginas, offset limitado; F7 aberta |

| 2026-11-21 F7 incremento 7 | Exportação CSV por cursor HMAC/keyset, corte temporal e navegação de lotes | [Código e88ddfe](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2), [backend #44935128670](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128670), [browser #44935128826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128826), [memória #44935128710](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128710) — success | IMPLEMENTADA — TESTADA. Execução inicial 2c94972 falhou por método errado em teste de autenticação, corrigido no commit final; sem snapshot MVCC nem teste 100k+, F7 aberta |

## Rastro adicional da segunda entrega F7
- 2c79532: migração 017;
- 1d609d6: rotas seguras do portal;
- 36e7580: cliente API tipado;
- 5c4d6e9 e c47e056: interfaces admin e conta;
- f87498b: testes multi-tenant, CSRF, idempotência e casos negativos;
- 942d850: documentação F7;
- fbe9b34: organização do card admin;
- 4dcbb80: correção de tipagem; **CI final verde**.
Os SHAs intermediários registram a sequência, **não** certificam CI individual. CI anterior falhou TypeScript em fbe9b34 e foi corrigido em 4dcbb80.

## Procedimento para novas entradas
Acrescentar data, identificador de fase/BL/REQ/ADR, SHA base, arquivos alterados, CI com SHA, resultado, limitações, próxima ação e status da main/PR; criar arquivo individual em entregas/. **Nunca substituir registros de falha ou lacunas por sucessos retroativos.**
