# Fase 2 — Cadastros, serviços, cobranças draft, equipe e UX

**Estado documental em 21/11/2026:** NÚCLEO TESTADO; PARIDADE INCOMPLETA

## Implementação identificada
CRUD de clientes e serviços, CSV importado com validação, cobranças draft, configurações, perfil/suporte, convites/aceites, troca de organização, RBAC e shell responsivo real.

## Evidência de verificação
CI de código e Playwright Chromium desktop/mobile no commit 6dd1798, run 44817066812; regressões posteriores no HEAD validado.

## Pendências (ainda NÃO entregues)
Paridade fina de todos os componentes, acessibilidade, convites por e-mail entregues, homologação Android físico.

## Próxima ação autorizada ou necessária
Auditar componente por componente do mockup sem importar finance/demo.

## Risco de interpretação
Links draft não são cobranças reais.

## Fonte técnica primária
docs/FASE_2_CADASTROS_OPERACAO.md e docs/FASE_2_EQUIPE_PERMISSOES_UI.md

## Referências cruzadas
- [Estado atual](../01-ESTADO-ATUAL.md)
- [Decisões](../03-DECISOES.md)
- [Backlog](../04-BACKLOG.md)
- [Diário](../05-DIARIO-DE-DESENVOLVIMENTO.md)
- [Issue #3](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/issues/3)
- [Evidência associada](https://github.com/sistemacodigolucrativo/CobraFlux---Sistema-de-Cobrancas/actions/runs/44817066812)

## Como continuar esta fase
Antes de marcar qualquer item como completo: conferir branch e SHA no GitHub, revisar implementação presente, estabelecer testes de aceitação, não duplicar funcionalidade, criar registro em **../entregas/**, atualizar esta fase e **estado.json**. Distinguir código testado, homologação externa e publicação.
