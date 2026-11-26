# 08 — Protocolo obrigatório de retomada por outra IA

Protocolo de base de 23/11/2026, suplementado em **25/11/2026** pelo [handoff atual](11-HANDOFF-ATUAL-2026-11-25.md) e pelo [checklist LGPD/HTML pendente](pendencias/2026-11-25-lgpd-decisoes-e-html.md). A **fase de código** atual é F9 #01, mas a **prioridade imediata solicitada** é entregar o HTML LGPD ainda não criado. Não confundir fase vigente com o pedido mais recente. Último código validado: 7208ae2f96e27d7873294d7fe47caa72401ef5a7. F9 #01 Android debug testado; F8 operacional continua não homologada. F7 escopo técnico não adiado encerrado, requisitos remanescentes em pendências/; F8 sem staging/serviços reais. O documento 08 do ZIP original referia-se a HEAD 9c854473 e permanece uma **fotografia histórica**, não autoridade atual.

## Antes de iniciar
1. Abrir AGENTS.md, docs/ai-memory/00-LEIA-PRIMEIRO.md, 01-ESTADO-ATUAL.md, estado.json e o diário.
2. Consultar **GitHub remoto real**, PR #2, Issue #3, branches, último SHA, workflows vinculados ao HEAD. Confirmar main intacta, feature branch autorizada e se houve novas decisões desde o snapshot.
3. Ler os arquivos atuais relevantes, migrations, tests e docs/FASE_*.md. **Não reconstruir código pelo resumo nem duplicar funcionalidades.**
4. Validar estado em cada dimensão: decisão, código, teste/CI, homologação externa. Não marcar release como concluído por sucesso em ambiente efêmero.
5. Priorizar **REQ-122**, HTML LGPD **ainda não entregue**, conforme pedido mais recente do usuário, sem decidir em seu lugar; depois atender itens efetivamente aprovados na F7/F8/F9, identificando REQ/BL/ADR. Não reativar automaticamente obrigações de F7, nem concluir F8 sem evidências. Preflight offline e testes sintéticos são permitidos; staging real, pagamentos, serviços externos e deploy dependem de aprovação específica.

## Segurança e desenvolvimento
- Atua só em **feat/production-foundation**; sem merge, push main, reset destrutivo, deploy, provisionamento de serviço, exclusão de dados, release nem mudança comercial sem autorização específica.
- MFA para superadmin, autorização no backend, organização da sessão, CSRF, validação Zod, SQL parametrizado, transações/locks, idempotência e privacidade minimizada.
- Dados reais em PostgreSQL, sem IndexedDB/localStorage para saldo/cobranças; demo isolado.
- Centavos inteiros; status financeiro apenas por PSP verificado; PSP/Meta não reenvia POST incerto automaticamente; assinatura draft nunca concede premium.
- LGPD: não eliminar dados financeiros sob simples solicitação; fluxo auditável e revisão jurídica; mensagens portal_only não significam e-mail entregue.
- Migração **nova e incremental** para schema que evolui; não adulterar migrations históricas já aplicadas.
- CI necessário: lint, domain, server, UI, migrate duas vezes em DB isolado, integration multi-tenant, builds demo+produção, E2E desktop/mobile (quando UI mudar).

## Após cada incremento
1. Atualizar o arquivo da **fase** em docs/ai-memory/fases/ e o documento técnico docs/FASE_*.md.
2. Criar entrada em docs/ai-memory/entregas/ seguindo 09-MODELO-DE-REGISTRO.md.
3. Acrescentar **linha no 05-DIARIO-DE-DESENVOLVIMENTO.md** e evidência (commit/job/status) em 06-EVIDENCIAS.md.
4. Atualizar estado.json e 01-ESTADO-ATUAL.md somente com prova correspondente. Diferenciar último SHA de **código validado** e HEAD que inclui docs.
5. Atualizar Issue #3 e backlog, decisão ADR se mudou; nunca apagar registro anterior, sempre anotação de substituição.
6. CI falhou? Registrar falha, corrigir, testar novamente. **Não** afirmar concluído no commit não validado.
7. Relatar ao usuário: branch, SHA, arquivos, test run IDs, o que mudou, o que continua pendente, main/PR.

## Parada obrigatória
Pedir apenas o indispensável para fazer com segurança: pagamento/fornecedor, preços, credenciais, hospedagem, uso real da Meta, exclusão legal de dados, liberação de dinheiro, merge/main, publicação Android/Play. Para escopo aprovado de código sem dependência externa, continuar e registrar os limites.

## Desacordo entre fontes
Analisar diff temporal, fonte da decisão e job do SHA, preservar histórico divergente. Uma alteração na main por terceiro não autoriza editar main. Para novas informações não verificadas, escrever **HIPÓTESE** em vez de fato.

## Prioridade de retomada adicionada em 25/11/2026

1. Abrir [Handoff atual](11-HANDOFF-ATUAL-2026-11-25.md) e [10 itens LGPD com alternativas e especificação HTML](pendencias/2026-11-25-lgpd-decisoes-e-html.md).
2. **Não repetir a promessa de entrega:** o HTML ainda não existe como artefato comprovado. Implementar **um único HTML offline responsivo** com 10 itens, persistência e export TXT/HTML com respostas incorporadas/PDF via impressão. Verificar arquivo antes de compartilhar.
3. **Nenhuma resposta do responsável foi marcada**. A escolha de atendimento/retention/jurídico é dele; avaliar legalidade após receber as decisões.
4. Após entregar o arquivo, aguardar instruções do responsável e só então priorizar LGPD de código ou F9. Não executar deploy, dinheiro real, Play ou merge por causa de um checklist.
