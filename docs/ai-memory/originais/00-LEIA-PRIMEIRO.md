# 00 — LEIA PRIMEIRO · Knowledge Handoff CobraFlux

**Corte documental:** 21/11/2026, última verificação remota do commit `9c8544730b47059f4f8977bd950e46227784c9c0` (2026-11-21 13:45:54 UTC). **Natureza:** auditoria de fontes acessíveis, somente leitura; não é laudo de segurança nem comprovação de produção.

## Identidade e proposta

**Projeto vigente:** CobraFlux — Sistema de Cobranças. **Nome documental anterior:** *Golden Billing SaaS* (documentação da versão demonstrativa ainda presente no repositório). SaaS brasileiro para profissionais autônomos e pequenos prestadores de serviços: clientes, serviços, cobranças, Pix, recorrências, lembretes WhatsApp, relatórios, assinaturas SaaS e painel de operação. O modelo original é um **mockup React com IndexedDB e dados simulados**; o objetivo de desenvolvimento autorizado é convertê-lo em um produto real, persistente e seguro, **preservando a demonstração isolada**.

> **O que nunca confundir:** (1) demo com produção; (2) Pix **Asaas Sandbox** com dinheiro real; (3) receitas das assinaturas vendidas pelo CobraFlux (**MRR SaaS**) com dinheiro processado para profissionais (**GPV**); (4) código implementado/CI verde com homologação em infraestrutura real.

## Estado Git confirmado em 21/11/2026

| Referência | Estado verificado |
|---|---|
| Repositório | [`sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas`](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas) — público |
| Branch autorizada para desenvolvimento | `feat/production-foundation` — `9c8544730b47059f4f8977bd950e46227784c9c0` |
| `main` | `95aba9c27c363c8b24c2f34c65a28c2f3b011b3b` — **não modificada** durante esta sequência |
| Branch Android demonstrativa | `android-webview-demo-debug` — `326c326e445f3b0338ba3a8eb39db864a2aa1453` |
| PR | [#2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2): aberta como **draft**, **não mesclada** |
| Roadmap | [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3) |
| Backend e integrações no commit atual | [GitHub Actions #44910490191](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490191) — **success** |
| Navegador desktop/mobile no commit atual | [GitHub Actions #44910490168](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44910490168) — **success** |

**Regra de trabalho atual:** preservar `main`, trabalhar somente na branch da PR, comparar solicitação com código antes de alterar, validar a cada avanço, não mesclar/publicar nem ativar operações financeiras externas sem autorização específica. A pessoa responsável decidiu continuar implementando **sem hospedagem neste momento**; staging HTTPS, e-mail real, backup/restauração, provedores externos e testes físicos ficam **adiados para homologação**, não dispensados.

## Último marco e ponto de retomada

- **Último núcleo de fase tecnicamente concluído em código:** **Fase 6, monetização SaaS**; há *pendências substanciais* de checkout/PSP da própria plataforma, pagamento verificado, tributação e homologação. Não dizer «Fase 6 operacionalmente concluída».
- **Fase corrente:** **Fase 7, Administração e Relatórios**, já **iniciada e com primeiro incremento testado** no commit `9c854473`: relatórios por tenant, painel superadmin com MFA, suspensão/reativação de organizações, auditoria, suporte, triagem LGPD e exportações CSV protegidas. **A Fase 7 não foi encerrada.**
- **Próxima ação autorizada pelo roadmap:** **continuar a Fase 7**, primeiro verificando HEAD e CI, depois concluir o que ainda falta em atendimento de suporte, governança/LGPD, relatórios e paridade visual. Não avançar automaticamente para Fase 8 nem executar operações destrutivas.
- **Última ação desta auditoria:** inspeção remota **somente leitura**. Nenhum commit, migração, deploy ou alteração de servidor executado pelo handoff.

## Principais bloqueios sem infraestrutura

Servidor de staging/produção HTTPS e PostgreSQL gerenciado; envio Resend validado; MFA provisionado em terminal seguro; backups off-site criptografados com restauração realmente testada; contas e webhooks **Asaas Sandbox**, **Meta WhatsApp Cloud API** e PSP **SaaS da plataforma**; credenciais protegidas; políticas LGPD, fiscal, ant fraude; cron e observabilidade; Android físico, assinatura AAB e revisão Play Store. A inexistência de hospedagem impede **homologação**, não o desenvolvimento de código com CI.

## Regras inegociáveis de continuidade

1. **Não modificar `main`**, não mesclar PR #2, não publicar sem autorização expressa de release.
2. Nenhuma ação de browser, CSV, operador ou webhook não verificado deve definir cobrança como `paid` ou liberar plano SaaS pago.
3. **Não utilizar dados demonstrativos como dinheiro real.** O modo demo e a API PostgreSQL são aplicações intencionalmente distintas.
4. Em toda rota protegida, tenant deve ser derivado **da sessão autorizada**, nunca de identificador arbitrário enviado no corpo da requisição.
5. Segredos somente no servidor/gerenciador seguro, nunca em frontend, repositório, arquivos de handoff ou logs publicados.
6. Provedores externos e workers continuam desabilitados por padrão até homologação e aprovação.
7. **Read-only por padrão ao retomar:** verificar a branch, commits, PR, issue, arquivos e CI antes de propor/escrever mudanças.

## Fontes e limitações

**Acessado/verificado:** repositório GitHub (árvore, branch, commits, componentes, migrações, documentação, package/scripts e CI), [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2), [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3), mensagens recentes visíveis e resumos históricos recuperáveis de conversas anteriores.

**Não acessado integralmente:** várias centenas de mensagens antigas desta própria conversa aparecem compactadas/omitidas; nenhum link individual está disponível para essas mensagens. Pesquisa de anexos nesta conversa retornou **nenhum arquivo disponível**. Não foi possível inspecionar servidor de staging, dashboard de Asaas/Meta/Resend, backups reais, ambiente Android físico ou conta de publicação. O handoff **não reivindica cobertura de 100% das solicitações históricas**; requisitos ausentes desse material devem ser recuperados do usuário ou de fontes adicionais antes de serem inventados.

## Sequência de leitura dos artefatos

`00` → `01-HANDOFF-MESTRE` → `03-REGISTRO-DE-DECISOES` → `02-MATRIZ-DE-REQUISITOS` → `04-BACKLOG-CONSOLIDADO` → `05-ARQUITETURA-E-ESTADO-TECNICO` → `06-ROADMAP-E-MARCOS` → `07-EVIDENCIAS-E-LACUNAS` → `08-PROTOCOLO-DE-RETOMADA` → **`09-PROMPT-AUTONOMO-DE-RETOMADA`**.

**Não substitua evidências de teste/estado do repositório por afirmações da conversa.** O snapshot é datado e deve ser revalidado quando outra IA assumir.
