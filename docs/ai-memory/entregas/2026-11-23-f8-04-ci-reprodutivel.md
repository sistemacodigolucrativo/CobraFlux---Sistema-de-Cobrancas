# F8 incremento nº 04 — lockfile npm, pinagem CI e reprodutibilidade

**Data:** 23/11/2026. **Branch:** `feat/production-foundation`. **Base pré-trabalho:** `bb9f1c53423e76adab2c8af345442c01ebf6ddaf`. **Código final validado:** [4d43aa6c](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4d43aa6c5cd8623d2ee0fe403ca016bfb51353cc).

## Problema identificado
Cinco workflows e o Dockerfile instalavam dependências sem lockfile npm. O `bun.lock` existente não acompanhava as novas dependências do `package.json`. Isso impedia demonstrar uma instalação reprodutível.

## Implementação e alterações
- `package-lock.json` v3 gerado no GitHub Actions a partir do `package.json`, **674 entradas** (16 dependências de runtime e 11 de desenvolvimento); blob SHA `a43d301feabb890d131f6606a4737ea157dd63e0` igual ao artefato validado.
- Workflows com permissão padrão `contents: read` e `actions/checkout`, `actions/setup-node`, `actions/upload-artifact` pinados a SHA. Todos os npm installs em CI/Docker trocaram para `npm ci`.
- `bun.lock` desatualizado e workflow temporário de bootstrap removidos, mantendo somente npm como gerenciador canônico.
- Novo `scripts/phase8-supply-chain.mjs` com quatro testes e workflow dedicado `phase8-supply-chain.yml`. Reprova permissão write, actions mutáveis, npm install sem lock, Dockerfile sem lock, divergência de package.json/package-lock e lock duplicado.
- O pipeline dedicado compila uma imagem Docker **local** usando npm ci e Vite production build, **sem enviar ao registry**.

## Evidências
- Bootstrap read-only falhou inicialmente [CI #45203455427](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45203455427) por incluir teste de backend sem DATABASE_URL; corrigido, workflow de geração [CI #45203699174](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45203699174) **success**, importação temporária guardada [CI #45204240669](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45204240669) **success** e ambos mecanismos excluídos.
- Validação final F8 #04 — dependências npm com lockfile, CI em modo read-only, Actions fixadas por SHA e build Docker local. Código [4d43aa6c](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4d43aa6c5cd8623d2ee0fe403ca016bfb51353cc); backend [CI #45205396845](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396845), navegador [CI #45205396796](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396796), F8 preflight/restore [CI #45205396813](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396813), política da cadeia de dependências e Docker [CI #45205396857](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396857), memória [CI #45205396804](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396804) — **success** no mesmo SHA. Não houve deploy nem publicação de imagem.
- [Runbook de supply chain](../../security/phase8-supply-chain-runbook.md) contém contratos, scripts, comandos e limites.

## Pendências e bloqueios
- A auditoria de vulnerabilidades e procedência ainda não foi executada: o log `npm ci` aponta aviso para `glob@11.1.0` e `node-domexception@1.0.0`. Não se deve declarar dependências livres de CVEs.
- `node:22-alpine` e `postgres:16` seguem tags mutáveis, necessitam digest/política de atualização. `npm ci` não garante build hermético e pode rodar scripts de pós-instalação.
- **F8 ainda não homologada;** sem secrets reais, staging HTTPS, PSP/Meta/Resend externos, backup offsite/PITR, análise LGPD/fiscal ou deploy. F7 ADR-026 mantém itens adiados **não concluídos**.
