# Entrega F8 nº 03 — auditoria de variáveis e modelo de ameaças

**23/11/2026 — [c210b5d2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/c210b5d2ead0f25d469fb3ad38b8d5d9bb34c280)**, branch `feat/production-foundation`; base `a7b81eeb588bdfd666f6e4d7b3eb8befec3fe455`.

## O que mudou
- `docs/security/staging-config-inventory.json`: inventário de 33 nomes de env com classificação, contexto e cuidados, sem valores secretos.
- `scripts/phase8-secrets-audit.mjs` e `.test.mjs`: extração offline de nomes em server/, scripts/, src/ e .env.example; rejeita variáveis sem documentação, entradas obsoletas e segredo classificado em `VITE_`.
- `.github/workflows/phase8-preflight.yml`: roda três testes novos e auditoria `--check` em CI.
- `docs/security/staging-threat-model.md` (STRIDE, 12 cenários) e `docs/security/staging-secrets-runbook.md` (aprovação, cofre, rotação, evidências).

## Provas no código verificado
- Log CI F8: **33 nomes documentados / 33 referenciados, 3 testes novos passed, 0 failed**. O script não usa `process.env` real nem rede.
- [Actions #45200150015](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200150015) backend, [Actions #45200150042](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200150042) Chromium, [Actions #45200149826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149826) preflight/restore e [Actions #45200149781](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149781) integridade da memória — **success** no SHA c210b5d2ead0f25d469fb3ad38b8d5d9bb34c280.

## Limitações
- Inventário é análise estática de **nomes**, não prova de valores, entropia, ausência de chaves hardcoded ou controle real de infraestrutura.
- `GEMINI_API_KEY` e `APP_URL` constam só de exemplo legado; não marcar como segredos de runtime confirmados.
- **Sem** staging HTTPS, cofre, conexão Asaas/Meta/Resend, backup offsite/PITR, revisão jurídica, rollout ou alteração da main. Requisitos adiados F7 pela ADR-026 continuam **não concluídos**.

**Status:** IMPLEMENTADO E TESTADO EM CI; F8 aberta, homologação externa não realizada. Próximo passo seguro: endurecimento/reprodutibilidade do CI ou planejamento de infraestrutura sob autorização.
