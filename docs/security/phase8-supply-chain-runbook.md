# CobraFlux — Runbook de dependências reprodutíveis e CI (F8 #04)

**Estado em 23/11/2026:** política local de CI **IMPLEMENTADA E TESTADA**, não equivale a análise de vulnerabilidades, SBOM ou revisão de segurança independente.

## Diagnóstico original
Os workflows e o Dockerfile executavam `npm install --no-package-lock --no-audit` sem registrar o resultado exato da resolução. O `bun.lock` versionado estava desatualizado em relação ao `package.json`. Com essa combinação, uma reconstrução podia resolver versões diferentes das anteriores.

## Decisão técnica ADR-029
- O gerenciador canônico deste projeto passa a ser **npm** com `package-lock.json` de versão 3. Um lockfile do Bun não é autoridade e o `bun.lock` obsoleto foi removido. **Não** regenerar locks independentemente de mais de um gerenciador.
- O lockfile foi gerado pelo npm no GitHub Actions, instalado novamente por `npm ci` e preservado. Arquivo com **674 entradas de pacotes**, **16 dependências runtime** e **11 dev** no pacote raiz. SHA256 do artefato de origem `b45a0c67d7f916a4c66b181c57cc6ab2be1c81cbdc96e77429d7a2b41a1e4397`, objeto Git blob `a43d301feabb890d131f6606a4737ea157dd63e0`.
- A importação foi um procedimento temporário restrito à branch `feat/production-foundation`. O job que usou `contents: write` **foi removido**, e os seis workflows versionados restantes agora têm `permissions: contents: read`.
- Os usos de `actions/checkout`, `actions/setup-node` e `actions/upload-artifact` foram fixados em SHAs imutáveis verificados nas refs públicas do GitHub em 23/11/2026:
  - checkout: `11d5960a326750d5838078e36cf38b85af677262`
  - setup-node: `49933ea5288caeca8642d1e84afbd3f7d6820020`
  - upload-artifact: `ea165f8d65b6e75b540449e92b4886f43607fa02`
- Dockerfile e quatro workflows de instalação utilizam `npm ci --no-audit --no-fund`, com `package-lock.json` adicionado ao gatilho de CI. O workflow de segurança `phase8-supply-chain.yml` confere lock, Actions, permissões, ausência de installs mutáveis e faz build Docker sem publicar imagem.
- Auditoria estática em `scripts/phase8-supply-chain.mjs` e testes Node em `scripts/phase8-supply-chain.test.mjs`. Uma alteração deliberada em versão de action ou autorização deve ser revisada e acompanhada de atualização explícita do allowlist.

## Como executar localmente (sem segredos)
```bash
node --test scripts/phase8-supply-chain.test.mjs
node scripts/phase8-supply-chain.mjs --check
npm ci --no-audit --no-fund
npm run lint
```
A instalação npm exige rede para baixar os pacotes, mas não conecta aos provedores de cobrança/WhatsApp; os dois primeiros comandos são offline. As atualizações de dependências devem ser feitas em branch autorizada, revisando `package.json` e lockfile no mesmo commit e exigindo CI verde antes de aprovação.

## Evidências de execução
- Bootstrap inicial [CI #45203455427](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45203455427) **failure**: teste de banco incluído em job sem DATABASE_URL; corrigido ao limitar bootstrap à validação offline (testes de banco têm CI próprio).
- Geração limpa [CI #45203699174](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45203699174) **success**: lockfile produzido, `npm ci`, typecheck e auditoria offline; importação guardada [CI #45204240669](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45204240669) **success**. Procedimento temporário removido da branch.
- F8 #04 — dependências npm com lockfile, CI em modo read-only, Actions fixadas por SHA e build Docker local. Código [4d43aa6c](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4d43aa6c5cd8623d2ee0fe403ca016bfb51353cc); backend [CI #45205396845](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396845), navegador [CI #45205396796](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396796), F8 preflight/restore [CI #45205396813](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396813), política da cadeia de dependências e Docker [CI #45205396857](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396857), memória [CI #45205396804](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396804) — **success** no mesmo SHA. Não houve deploy nem publicação de imagem.
- Log da política: `6 workflows; 674 lock entries; STATIC CONTRACT PASSED`. Testes `npm ci` e build Docker local concluídos com **success**, imagem **não enviada** a registry.

## Riscos residuais — ainda pendentes antes do staging real
1. **Vulnerabilidades não auditadas:** o log da instalação acusou advertências de depreciação de `glob@11.1.0` (com referência a vulnerabilidades conhecidas de versões antigas) e `node-domexception@1.0.0`. Não foi feita análise de CVEs/SBOM nem correção completa, e `--no-audit` omite a auditoria automática. Executar análise de dependências por severidade, avaliar upgrades e registrar exceções fundamentadas antes do release.
2. **Imagens Docker mutáveis:** `node:22-alpine` e `postgres:16` ainda dependem de tags. Selecionar base digest e política de atualização com revisão de compatibilidade antes da publicação.
3. **Runtime e scripts de instalação:** versões do Node/npm no runner podem evoluir dentro da linha 22; `npm ci` ainda executa scripts de dependências. Exigir proveniência/revisão, dependabot e pinagem/rotatividade controlada.
4. **Sem ambiente externo homologado:** não houve testes reais de DNS/TLS, provedores, backups offsite/PITR, monitoração, legalidade/LGPD ou Android físico. ADR-026 mantém requisitos F7 adiados, NÃO concluídos.

**Próximo recorte recomendado:** SCA de dependências e pinagem das imagens com manutenção controlada ou, após autorização específica, preparação de staging real. Sem merge/deploy.
