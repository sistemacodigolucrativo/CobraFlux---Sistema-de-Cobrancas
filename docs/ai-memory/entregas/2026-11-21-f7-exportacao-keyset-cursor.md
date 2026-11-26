# F7 — incremento 07: exportação CSV por cursor assinado (keyset)

**Data:** 21/11/2026 (America/Sao_Paulo). **Origem:** continuidade de BL-008 / BL-031 aprovada por solicitação de avançar no roadmap. **Branch:** `feat/production-foundation`.

**Base:** `bc235e8d35324e0878f68007269ff19f96fdf5e0`. **Primeiro commit com teste incorreto:** `2c94972131cf337c5a96ef83add784f8ac7a0f79`. **Código final validado:** [e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2).

## Auditoria prévia e escopo
O incremento 6 já oferecia CSV por status, contagem e download de lotes até 1000 registros, mas usava `OFFSET` máximo de 100000. Para percorrer dados com maior previsibilidade, foi criada uma rota **adicional** por keyset; a antiga permanece para compatibilidade. Sem novos provedores, migrações de banco ou alteração de dados financeiros.

## Implementação
- `server/phase7-routes.ts`: cursor HMAC-SHA256 derivado de `SESSION_SECRET`, versionado e vinculado ao tenant/dataset/status. Validade 30 min. Paginação por `(created_at,id)` ordenada desc, com timestamp µs preservado do PostgreSQL e cutoff inicial. Novo POST `/api/reports/exports/:dataset/keyset`, RBAC owner/superadmin, sessão/CSRF, 12 exportações/hora, CSV anti-fórmula, no-store, metadados e auditoria sem PII do cursor.
- `src/services/productionApi.ts`: download binário da página e validação dos cabeçalhos `X-Export-Mode`, `X-Export-Count`, `X-Export-Has-More` e `X-Export-Next-Cursor`.
- `src/pages/production/ReportsOperationsView.tsx`: card de exportação por cursor, controles de lote anterior/próximo, reinício e download com os filtros atuais. Mudança de dataset/status/tamanho reinicia a cadeia.
- `server/phase7.integration.test.ts`: anônimo GET/POST, CSRF, 400 para token adulterado/incompatível, tenant isolado, registros com mesmo timestamp, três páginas sem duplicação, inserção posterior ao cutoff não entra em páginas seguintes e auditoria protegida.

## Evidência
- [Backend, TypeScript, migrações e integração #44935128670](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128670): **success**.
- [Chromium desktop/mobile #44935128826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128826): **success**.
- [Integridade da memória #44935128710](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44935128710): **success**.

**Falha histórica documentada:** primeiro CI backend [#44934990819](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44934990819) falhou em assert de método HTTP equivocado; o endpoint era POST, mas o teste esperava 401 para GET e recebeu 404. Em `e88ddfe8c2792dbd8d7806c046a14a8a3ff4b7d2`, separou-se o teste correto de GET (404) e de POST anônimo (401).

## Limites, risco e retomada
**IMPLEMENTADA — TESTADA EM CI, NÃO HOMOLOGADA EXTERNAMENTE.** Cursor por timestamp/ID não é snapshot MVCC de várias requisições. Atualizações de status, exclusões e alterações após o começo podem afetar páginas, mesmo que novas inserções normais estejam excluídas pelo corte. O cursor tem validade de 30 minutos; rotação do SESSION_SECRET o invalida. Persistem rate limit 12 downloads/hora, limite por arquivo 1000, tratamento LGPD/PII e testes de carga 100k+ ainda não realizados. Não há merge, deploy, PSP live, Meta live nem alteração da main.

**Próximo incremento recomendado:** BL-031: ensaio de carga em PostgreSQL descartável e revisão de EXPLAIN/índices; ou BL-007 LGPD/BL-012 paridade, preservando escopo aprovado. Registrar SHA, CI, alterações e resultados na memória.
