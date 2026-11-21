# Fase 7 — incremento nº 06: exportações filtradas e páginas CSV

**Data:** 21/11/2026. **Escopo aprovado:** BL-008 — relatórios/exportações; corte técnico sem alteração de infraestrutura financeira, banco de dados ou provedores externos.

**Branch:** `feat/production-foundation`. **SHA base:** `6babb39975ce15f76d235a4be689159008881227`. **SHA de código testado:** [a157e6f832f5180f7824d3836394b6fabbde5677](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/a157e6f832f5180f7824d3836394b6fabbde5677).

## Diagnóstico anterior
O endpoint já gerava CSV protegido de clientes e cobranças, limitado a 1000 registros. A UI enviava invariavelmente `{limit:1000,offset:0}` e oferecia apenas botões para baixar o primeiro lote. Não havia filtro de status, total dos registros, nem navegação de páginas.

## Arquivos alterados
- `server/phase7-routes.ts`: GET `/api/reports/exports/:dataset/preview` count-only, por tenant e owner/superadmin; status validado, rate limit e cache no-store. POST CSV conserva CSRF/rate limit, adiciona filtro, paginação e cabeçalhos de resultado, mantém auditoria e sanitização anti-fórmula.
- `src/services/productionApi.ts`: tipos de prévia/página, downloads com parâmetros explícitos e verificação de metadados antes do blob; nomes de arquivo incluem número de página.
- `src/pages/production/ReportsOperationsView.tsx`: seletor de conjunto/status, lotes 100/250/1000, visualização do total, botões anterior/próxima e download somente sob interação do titular.
- `server/phase7.integration.test.ts`: isolamento entre tenants, prévia sem PII, CSRF, limites/entradas inválidas, exportação de duas páginas, metadados de arquivo e contagem.

## Critérios de aceite e testes
- [CI backend, PostgreSQL e integrações #44930963112](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963112): **success**.
- [CI Chromium desktop/mobile #44930963010](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963010): **success**.
- [Integridade da memória #44930963018](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44930963018): **success**.
- Commit associado: [a157e6f832f5180f7824d3836394b6fabbde5677](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/a157e6f832f5180f7824d3836394b6fabbde5677).

## Limitações deliberadas
**Ainda não é exportação integral e consistente de volumes arbitrários.** O limite de offset continua em 100000, cada página tem 1000 registros no máximo, os downloads são manuais e não compartilham snapshot: mudanças de dados entre solicitações podem deslocar linhas. O contador é uma leitura pontual, não garantia do arquivo seguinte. A exportação continua restrita ao owner/superadmin, os dados podem conter PII e devem ser tratados conforme LGPD. Não houve envio externo, nova migração, deploy ou merge.

**Status:** IMPLEMENTADA — TESTADA EM CI; FASE 7 EM DESENVOLVIMENTO. Próximo: keyset/paginação estável, testes de carga, revisão LGPD e UI/relatórios de acordo com BL-008/031/012.
