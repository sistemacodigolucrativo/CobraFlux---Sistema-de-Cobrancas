# 03 — Registro persistente de decisões

**Fonte histórica:** handoff original **03-REGISTRO-DE-DECISOES.md** (ADR-001 a ADR-024), cujo conteúdo integral permanece no pacote original (consulte 07-FONTES-E-INTEGRIDADE.md). Este documento é um índice reconciliado, **não substitui a redação histórica integral**.

| ADR | Decisão vigente | Observação |
| --- | --- | --- |
| 001 | Transformar demo em plataforma funcional | Sem apagar demo |
| 002 | Preservar main; atuar em feat/production-foundation e PR draft | **Vigente** |
| 003 | Homologação de infraestrutura adiada para pré-lançamento | **Adiada, não dispensada** |
| 004 | Isolar modo demo e produção por build | ProductionApp, não trocar retroativamente por proposta de serviço legado |
| 005 | Express/TypeScript e PostgreSQL multi-tenant | Sessão como autoridade |
| 006 | Autorização/tenant no servidor | Zero trust no body |
| 007 | Segurança da identidade | Hash, recuperação, verificação e sessões |
| 008 | Superadmin exige MFA TOTP validado | Não autoconceder papel |
| 009 | Valores financeiros em centavos, estados originados do PSP | Nada de paid por clique |
| 010 | Asaas Sandbox primeiro; live vedado | PSP externo não homologado |
| 011 | Requisição financeira inconclusiva não reenvia POST cegamente | Reconciliação |
| 012 | Recorrências geram apenas draft | Não emitem Pix por si |
| 013 | WhatsApp oficial Meta e consentimento versionado | Não confiar em checkbox antigo |
| 014 | Workers não ficam ligados por padrão | Só ativar em infraestrutura homologada |
| 015 | MRR SaaS da plataforma separado de GPV de profissionais | Duas contabilidades |
| 016 | Free default; upgrade após liquidação confirmada | Fatura draft não ativa premium |
| 017 | Downgrade preserva dados | Cotas em criação |
| 018 | Superadmin, MFA, auditoria, exposição mínima | Governação pendente |
| 019 | CSV sensível protegido (CSRF, papéis, anti-fórmula) | Export limitado |
| 020 | LGPD sob triagem, sem exclusão automática | Revisão jurídica |
| 021 | Android após estabilidade do web operacional | Demo Android não equivale a Play |
| 022 | CI e documentação a cada incremento | Evitar conclusão verbal sem SHA |
| 023 | Backup/restore só validados com execução real | Scripts não bastam |
| 024 | Segredos e dados pessoais minimizados | Revisão de logs pendente |

## Decisão nova — ADR-025 (21/11/2026)
**Tema:** memória técnica cumulativa e transferível versionada no repositório.

**Origem:** solicitação expressa do responsável após a última validação da Fase 7: criar pasta remota com todo conhecimento rastreável e documentar continuamente cada etapa/fase, habilitando retomada por outra IA.

**Aprovada quanto ao processo documental.** Implantar docs/ai-memory + AGENTS.md; atualizar estado.json, arquivo de fase, diário, evidências e registro de entregas a cada commit de funcionalidade. Manter versões anteriores recuperáveis via histórico Git, nunca sobrescrever evidência por impressão. Atualizar Issue #3 com links. **Esta decisão não autoriza** deploy, merge, exclusão de dados, serviços live nem alteração de main.

## Decisões ainda pendentes
PSP de checkout da plataforma e preços Starter/Business; hosting e custos; credenciais; go-live financeiro, consentimento operacional, políticas LGPD, impostos/NFSe, cron real, release Android. Itens de ideias (**BL-034 a BL-038**) não viram implementações sem decisão.

**Regra de mudança:** se houver ADR posterior, documentar ID novo, motivo, origem, regra substituída, decisões descartadas **apenas quando constarem de fonte** e evidência. Não reescrever histórico antigo.

## ADR-026 — Reprogramação documentada da F7 e início técnico da F8 (23/11/2026)

**Fonte e autorização:** o responsável solicitou que os requisitos não concluídos fossem **anotados para análise posterior** e que, na ausência de outras tarefas fora desses requisitos, se seguisse para a Fase 8. Não houve autorização para merge, deploy, provedores externos, dinheiro, ou exclusão de dados.

**Decisão:** preservar a lista imutável de 10 incrementos técnicos validados da F7; tratar o desenvolvimento **não adiado** como encerrado para o escopo aprovado; mover todos os gates não executados para [pendências formalizadas](pendencias/2026-11-23-f7-adiados.md), sem declarar a F7 juridicamente/operacionalmente concluída. Iniciar F8 apenas com preflight e exercícios descartáveis sem serviços externos. A matriz anterior de fechamento é mantida como auditoria histórica, acrescida desta decisão de replanejamento.

**Não foi decidido:** termos de SLA, base legal LGPD, políticas fiscais, garantias de snapshots, preços, serviços de storage, domínio e hospedagem, segredos, PSP/Meta/Resend live, release ou main. **Status de cada requisito: ADIADO — NÃO CONCLUÍDO.**

## ADR-027 — Configuração de produção fail-closed (23/11/2026)

**Contexto:** `APP_ORIGIN.startsWith('https://')` era insuficiente; o pool PostgreSQL podia usar TLS, mas o startup não exigia configuração `DATABASE_SSL=require`.

**Decisão técnica:** em modo produção exigir origem HTTPS canônica, sem credenciais/path/query/hash/loopback, certificado TLS do banco verificado e SESSION_SECRET com tamanho mínimo e sem placeholders conhecidos. Preservar desenvolvimento/CI local. O sistema falha antes de iniciar com configurações inadequadas; não imprime segredos.

**Evidência:** [afb04d84](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/afb04d84f28e3adbe628b40cc0c2f3b28ce92a27), [CI #45194516204](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194516204), [CI #45194517814](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194517814), [CI #45194517198](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45194517198) — success. [Detalhamento](entregas/2026-11-23-f8-02-configuracao-producao.md).

**Limites:** não substitui entropia real, domínio aprovado, cadeia SSL homologada nem revisão independente. Não autoriza deploy, merge, live, alteração da main nem encerramento F8.

## ADR-028 — Contrato estático de segredos e ambientes (23/11/2026)

**Decisão:** classificar apenas NOMES de variáveis em `docs/security/staging-config-inventory.json` e exigir no CI que todo novo nome esteja documentado; `VITE_` é público. Manter exemplos legados de AI Studio marcados como não confirmados. Não armazenar valores em Git. KMS/cofre e rotação de chaves requerem revisão e operador futuro.

**Evidência:** F8 #03: inventário estático de 33 variáveis, CI de nomes e classificações, threat model e runbook. Código [c210b5d2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/c210b5d2ead0f25d469fb3ad38b8d5d9bb34c280), backend [Actions #45200150015](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200150015), Chromium [Actions #45200150042](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200150042), preflight/restore [Actions #45200149826](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149826) e memória [Actions #45200149781](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45200149781), todos **success** no mesmo SHA. A auditoria não lê valores de segredos nem acessa rede; staging real permanece não homologado.

**Não autoriza:** provider live, secret real, deploy, mudança de main, declaração de compliance ou conclusão dos itens F7 adiados por ADR-026.

## ADR-029 — Lockfile npm canônico, least privilege e Actions imutáveis (23/11/2026)

**Contexto:** `npm install --no-package-lock` em workflows/Docker permitia resolução variável, e o `bun.lock` não acompanhava `package.json`.

**Decisão técnica:** gerar e versionar lock v3 sob CI e importação guardada na branch autorizada, executar `npm ci` em builds, remover lock obsoleto do Bun, fixar SHAs verificadas das Actions, reduzir `GITHUB_TOKEN` a `contents: read` em **todos os seis workflows finais**, incluir auditor/testes e build Docker sem publicar.

**Evidência:** F8 #04 — dependências npm com lockfile, CI em modo read-only, Actions fixadas por SHA e build Docker local. Código [4d43aa6c](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4d43aa6c5cd8623d2ee0fe403ca016bfb51353cc); backend [CI #45205396845](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396845), navegador [CI #45205396796](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396796), F8 preflight/restore [CI #45205396813](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396813), política da cadeia de dependências e Docker [CI #45205396857](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396857), memória [CI #45205396804](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45205396804) — **success** no mesmo SHA. Não houve deploy nem publicação de imagem. Processo temporário de lock: [CI #45203699174](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45203699174) geração read-only e [CI #45204240669](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45204240669) importação feature-only, ambos success. Job bootstrap com escrita foi removido.

**Pendente:** vulnerabilidades/deprecações de `glob` e `node-domexception`, origem de pacotes e scripts de instalação, digests de Docker, staging e todas as aprovações externas. Nunca equiparar pinagem a ausência de vulnerabilidades. Não alterar main nem executar deploy.

## ADR-030 — Gates de homologação externa e limites do CI (23/11/2026)
**Decisão:** `npm audit` e SBOM são evidências de segurança, mas quatro avisos moderados permanecem sem remediação/aceite; 12 gates reais da F8 seguem pendentes. CI não autoriza deploy. Smoke HTTPS só por operador autorizado; logs de API minimizados e UUID sem dados de URL; digests Node/PG imutáveis consultados no registry e rollback com validação offline sem execução. Código [aa155cb8](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/aa155cb880f72c99d972fa58de758a810880b50f): backend [CI #45210349937](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349937), navegador [CI #45210349834](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349834), restore sintético [CI #45210349944](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349944), supply chain/Docker [CI #45210349882](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349882), npm audit/SBOM [CI #45210350161](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210350161), gates/smoke simulados [CI #45210350118](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210350118), memória [CI #45210349835](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45210349835) — **7 success no mesmo SHA**. [Runbook](../security/phase8-homologation-runbook.md). ADR-026 mantém requisitos F7 pendentes, `main` intacta.

## ADR-031 — Android funcional futuro com WebView isolada, sem migrar demo (23/11/2026)

**Origem:** responsável solicitou “Continue para a próxima etapa” após a conclusão dos controles técnicos F8; a F9 foi iniciada apenas no desenvolvimento, não na publicação ou homologação. A F8 segue com 12 gates externos não atendidos, F7 ADR-026 em aberto.

**Decisão:** novo módulo `mobile/android/` na **mesma branch autorizada**, conservando React/Express/PostgreSQL como fonte única de dados e autenticação, sem embed de contas demo e links externos inseguros. `targetSdk 36` conforme política Play de 2026; `minSdk 28`. A origem HTTPS pública é configurada por build somente quando autorizada; default do CI é vazio e seguro. WebView bloqueia navegação cross-origin, SSL inválido, file/content e bridge JS; downloads e upload nativo suspensos até revisão de segurança/PII. AAB/release signing, Play Billing, domínio/infra, OEM e Play Console requerem autorização e testes posteriores.

**Prova:** Código [7208ae2f](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/7208ae2f96e27d7873294d7fe47caa72401ef5a7): **8 workflows success no mesmo SHA**, incluindo Android/JUnit/APK [CI #45218842168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842168), backend [CI #45218842365](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842365), Chromium [CI #45218842181](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842181), restore PostgreSQL sintético [CI #45218842496](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842496), supply chain/9 workflows [CI #45218842917](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842917), audit/SBOM [CI #45218842200](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842200), release gates F8 [CI #45218842473](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842473) e memória [CI #45218842739](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/45218842739). [Registro de entrega](entregas/2026-11-23-f9-01-android-debug.md).

**Não autoriza:** merge na `main`, deploy, keystore de produção, publicar na Play, compras/serviços live ou alegar compliance Android/Google Play.
