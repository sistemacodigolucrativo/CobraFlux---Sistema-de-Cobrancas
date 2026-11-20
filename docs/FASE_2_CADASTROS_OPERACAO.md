# CobraFlux — Fase 2: Cadastros e Operação Real

**Estado:** implementação em branch de desenvolvimento. Sem hospedagem ou deploy de produção.
**Premissa aprovada:** concluir o código de todas as fases; homologar em ambiente real somente quando houver infraestrutura.

## Matriz de conversão mockup → real

| Módulo | Funcionalidade | Resultado |
| --- | --- | --- |
| Clientes | Cadastro, edição, busca, arquivamento, restauração e histórico por organização | Implementado |
| Clientes | Código interno, DDI, e-mail opcional, serviço, mensalidade, vencimento, notas e opt-in | Implementado |
| Clientes | Importação CSV validada, prévia por linha, validação de duplicados e importação transacional | Implementado |
| Serviços | Criar, editar, alterar preço, frequência e arquivar sem perder histórico | Implementado |
| Cobranças | Criar/editar rascunho, duplicar, cancelar com motivo, compartilhar link e consultar histórico | Implementado |
| Cobranças | Pix real, liquidação, estorno, comprovante bancário | Fase 3 — não habilitado |
| Perfil | Nome, troca de senha, dados comerciais restritos ao titular e sessões | Implementado |
| Suporte | Abrir e consultar tickets da organização | Implementado |
| Equipe | Restrição de edição da organização para titular/admin | Implementado |
| Equipe | Convites individuais, aceite por usuário novo ou existente, seleção de organização e revogação imediata | Implementado no código; envio real pendente |
| Limite de clientes por plano | Cobrança SaaS/limites conforme assinatura real | Fase 6 |
| UI de produção | Sidebar desktop, cabeçalho fixo, drawer e bottom bar mobile, cards e formulários da base CobraFlux | Implementado e testado em navegador CI |
| Paridade visual total | Revisão elemento a elemento de todos os controles do mockup | Pendente |

## Garantias de arquitetura

- PostgreSQL centralizado e transações para operações de escrita.
- Organização sempre derivada da sessão autenticada; nenhuma escolha de tenant é aceita pelo cliente.
- Senha com hash, sessão HttpOnly, token CSRF e filtros de autorização por papel.
- Importação CSV com telefone normalizado; consentimento WhatsApp não é presumido.
- Valores financeiros inteiros em centavos, descontos válidos e vencimento ISO.
- Rascunhos de cobrança não recebem confirmação de pagamento pelo navegador.
- Eventos de histórico de cobrança e trilha de auditoria.
- Exclusão lógica preserva referências; serviços desativados não são apagados.

## Limitações e dependências externas

Sem servidor de staging, HTTPS e backup remoto, a homologação operacional permanece em aberto. O envio real de e-mail, restauração em infraestrutura gerenciada, conciliação Pix e WhatsApp dependem de contas/credenciais externas. A UI operacional reaproveita componentes visuais, mas ainda não reproduz integralmente todas as seções da demonstração.

## Como são testadas as mudanças sem hospedagem

CI do GitHub Actions executa TypeScript, build Vite nos modos demo e produção, testes unitários, migrações versionadas e integração em PostgreSQL temporário. Testes automatizados de navegador Chromium no GitHub Actions cobrem desktop/mobile, login, clientes, serviços, rascunhos e equipe. Testes em hospedagem real e dispositivo físico ficam para a homologação final. Resultados somente contam como aprovados quando a execução do commit correspondente estiver verde.

## Ordem do roadmap

1. O escopo funcional de cadastros, cobrança em rascunho e equipe da Fase 2 está implementado e aprovado nos testes CI de API, UI e navegador. Os ajustes finos de equivalência de todos os cards e telas pertencentes a fases futuras continuam no backlog.
2. Iniciar a Fase 3 com adapter de PSP em sandbox e testes de webhook/idempotência; sem dinheiro real.
3. Manter PR #2 em draft e branch main intacta até homologação comercial.

## Atualização — Fase 2: equipe e testes de navegador

Consultar docs/FASE_2_EQUIPE_PERMISSOES_UI.md. Os testes Playwright Chromium de cadastros e navegação desktop/mobile foram aprovados no GitHub Actions para o commit 6dd1798. A aprovação não implica validação em Android físico, produção HTTPS ou operação financeira.
