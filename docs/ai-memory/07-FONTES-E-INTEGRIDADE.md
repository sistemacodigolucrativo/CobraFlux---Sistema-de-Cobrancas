# 07 — Fontes históricas, upload original e integridade

## Inventário do handoff recebido na conversa em 21/11/2026
O responsável forneceu o **CobraFlux-Knowledge-Handoff-2026-11-21.zip** (arquivo ZIP original), além do arquivo separado **08-PROTOCOLO-DE-RETOMADA.md**. O ZIP contém 12 Markdown, com origem documental no commit 9c854473; o documento MANIFESTO-DE-INTEGRIDADE afirma expressamente que o pacote original **não havia sido enviado ao repositório**.

- SHA-256 do ZIP recebido: **730fba546e3d834cadcf29849f81b3a7cba70c0af9967dddb4e8b79f9cc6fe86**.
- **Status de armazenamento:** este diretório Git guarda uma **consolidação rastreável do conteúdo analisado**; **não contém os bytes integrais do ZIP original** nem os 12 arquivos históricos. O anexo da conversa não é recuperável automaticamente por uma nova IA apenas lendo este Git. Use o importador **scripts/import-handoff-knowledge.sh** com o ZIP original para versionar a cópia integral, após revisão de segredos e dados pessoais.
- O snapshot do handoff cobre fontes parcialmente disponíveis e **não garante 100% do histórico de conversas**. Não inventar decisões ou dados ausentes.

## Manifesto do pacote original
| Arquivo no ZIP | Bytes | SHA-256 |
| --- | ---: | --- |
| 00-LEIA-PRIMEIRO.md | 7108 | faf2c4cc8cc497745576e22a4303b2e850a417e792a3a3790aa19739179abe26 |
| 01-HANDOFF-MESTRE.md | 21602 | 991f4817ff8c2518316cd7467b7e8e1a0a6dc98ef0786eade01d024891b6b6c1 |
| 02-MATRIZ-DE-REQUISITOS.md | 107569 | 937bc586b9f42d6271a65c0b9fd5d1fefcc08ebc802c0d3fc77b7aa8f422e06e |
| 03-REGISTRO-DE-DECISOES.md | 18381 | acf3ef493d547edcc1d6e22ccced50744c30342cd9c4e802121862c60d5f129b |
| 04-BACKLOG-CONSOLIDADO.md | 37983 | f0b041b031899c17cca401aaa5f00471f6cda1cc525708fe7d8a247aee577cbf |
| 05-ARQUITETURA-E-ESTADO-TECNICO.md | 26105 | e867d2b80e6d5425487b9ed8f22fb8eff3f9c230c8af928bdd798067e1f93c8c |
| 06-ROADMAP-E-MARCOS.md | 11743 | d69330ee56a937cf49ceac5623296442046776db7fe7ff9927ff7a93fb495555 |
| 07-EVIDENCIAS-E-LACUNAS.md | 18428 | 9ce671cefd746794c50ddecc3e95f8b8018ccd0df180fe57cd1cba86cca209f7 |
| 08-PROTOCOLO-DE-RETOMADA.md | 11747 | 709643b104ad37a3aea56a6a434ce02e90d0e75b643a26e99442939c9041a0a0 |
| 09-PROMPT-AUTONOMO-DE-RETOMADA.md | 11311 | dcca9f5d702e632350002f81b8f61464af49f2eead1ab655f4990ef318476d9a |
| HANDOFF-COMPLETO.md | 272389 | 87fe58b2ff532d81e5c9c0efff18110e08c45b516f77efba95859f363e1ec7b7 |
| MANIFESTO-DE-INTEGRIDADE.md | 1955 | 89d4b06156f2d7ecb8924905b2120b6ad198d6a45076501917154310f49f5ef7 |

O HANDOFF-COMPLETO.md é cópia consolidada, enquanto arquivos 00–09 são fonte de edição; SHA comprova integridade de bytes, **não** verdade das afirmações técnicas.

## Fontes remotas consultadas
- [PR #2](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/pull/2): head/base/draft, arquivos de código e docs.
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3): checklist das fases e decisões de avanço.
- [Commit 4dcbb80](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/commit/4dcbb80f2ebfa817b3d512c94502d697d4077842): incremento novo já testado após o handoff.
- [CI backend #44915970990](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915970990) e [browser #44915971125](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44915971125), success.
- Docs remotos **docs/FASE_1_*** a **docs/FASE_7_***; código atual deve ser lido no HEAD, não em exemplo de handoff.

## Regras para materiais novos e uploads
Registrar data, quem forneceu, nome, tipo, hash, origem, sensibilidade, versão e link persistente. Nunca commitar .env, credenciais, tokens, cookies de sessão, selfies, documentos KYC, log com dados pessoais ou dados de pagamentos reais. Armazenar binários grandes/PII em solução autorizada privada, não pública. Se cópia externa não estiver no Git, rotular **NÃO VERSIONADA** e fornecer instrução de importação, sem fingir que já foi enviada.
