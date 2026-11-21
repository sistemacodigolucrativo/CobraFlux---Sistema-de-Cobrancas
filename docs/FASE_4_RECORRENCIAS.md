# CobraFlux — Fase 4: regras de cobrança recorrente (entrega inicial)

**Status:** implementação de código em \`feat/production-foundation\`; agendador automático ainda não executado em hospedagem. A \`main\` não deve ser modificada até revisão da PR draft.

## O que o módulo faz

- O profissional titular cria planos de recorrência **mensal** ou **semanal** para um cliente ativo, com valor bruto, desconto e descrição.
- O backend valida o cliente e o tenant, exige CSRF nas alterações, registra auditoria e restringe a criação/gestão ao titular ou administrador com acesso válido.
- O agendador gera **somente cobranças do tipo rascunho (\`charges.status=draft\`)**. Não emite Pix automaticamente, não envia avisos e não modifica saldos.
- O calendário é de **datas civis**, ancorado em \`America/Sao_Paulo\` e independente do fuso do servidor. A frequência semanal avança sete datas civis; a mensal preserva o dia escolhido. Se o plano é dia 31, produz 31/jan, 28 ou 29/fev, 31/mar, 30/abr, e volta ao dia 31 no mês seguinte.
- Valores, desconto, descrição e serviço são gravados como snapshot na cobrança de cada ciclo. Editar uma regra não altera cobranças previamente geradas.
- Pausar desativa a geração futura sem alterar cobranças existentes. Retomar utiliza por padrão **\`skip_missed\`**, que descarta ciclos anteriores sem cobrar retroativamente. O modo \`catch_up\` exige ação explícita do titular e é limitado a 12 ciclos anteriores.
- Cancelar a regra é definitivo e preserva os rascunhos, histórico e pagamentos eventualmente associados às cobranças passadas.
- Arquivamento de cliente impede novas cobranças e pausa automaticamente a regra quando o agendador a examina. Para retomar é necessário restaurar o cliente.

## Garantias de persistência e idempotência

- **Migração 011:** \`recurrence_plans\` é o cronograma persistente, \`recurrence_cycles\` registra cada ocorrência criada, \`recurrence_worker_runs\` mantém histórico de execuções.
- \`next_due_date\` é a cursor de progresso; \`UNIQUE(plan_id,cycle_key)\` e \`UNIQUE(charge_id)\` impedem repetição de ciclos e duplicação em atualizações concorrentes.
- Cada rascunho é criado na **mesma transação PostgreSQL** que registra seu ciclo, histórico, auditoria e avança o cursor. Falhas transacionais revertem tudo.
- O worker reserva tarefas via \`FOR UPDATE SKIP LOCKED\` e lease com token de 5 minutos. Um worker que perdeu seu token não gera o ciclo. Falhas mantêm o plano para nova tentativa, com backoff limitado.
- Um lote processa no máximo 100 ciclos; mais trabalho permanece persistido para execuções posteriores. Nenhum processamento em background é ligado automaticamente na inicialização do Node.
- Limite inicial: até 250 planos não cancelados por organização, sob bloqueio da linha da organização para evitar corridas.
- Não existe chamada ao PSP, WhatsApp, e-mail ou serviço financeiro neste módulo.

## Endpoints operacionais

| Método | Caminho | Acesso |
| --- | --- | --- |
| GET | /api/recurrences | Sessão, lista limitada ao tenant |
| GET | /api/recurrences/overview | Sessão, indicadores do tenant |
| POST | /api/recurrences/preview | Sessão + CSRF, preview sem gravar |
| POST | /api/recurrences | Titular/admin + CSRF |
| PATCH | /api/recurrences/:id | Titular/admin + CSRF; somente futuros |
| POST | /api/recurrences/:id/pause | Titular/admin + CSRF |
| POST | /api/recurrences/:id/resume | Titular/admin + CSRF; modo skip_missed ou catch_up |
| POST | /api/recurrences/:id/cancel | Titular/admin + CSRF |
| GET | /api/recurrences/:id/cycles | Sessão, histórico restrito ao tenant |

A interface **Recorrências** aparece na navegação desktop e no menu completo mobile. Fornece formulário, prévia de seis ciclos, indicadores, filtros, histórico, edição futura, pausa, retomada e cancelamento.

## Operação local (quando houver PostgreSQL e hospedagem)

Sem agendador ligado, somente as regras são persistidas. Para inspeção **sem alterações**, executar:

\`\`\`bash
npm run migrate
npm run recurring:run -- --dry-run
\`\`\`

Após autorização operacional para gerar rascunhos de teste:

\`\`\`bash
RECURRENCE_SCHEDULER_ENABLED=true npm run recurring:run -- --once --limit=20
\`\`\`

O comando acima apenas processa **um lote** e encerra. Quando a hospedagem estiver disponível, configurar um serviço scheduler/cron para executá-lo periodicamente com fuso comercial definido. **A implantação deste scheduler ainda está pendente.**

## Testes e condições para avançar

- Testes de calendário com janeiro/fevereiro (28/29 dias), meses de 30/31 dias, virada de ano, frequências semanais e datas civis na madrugada brasileira.
- Integração com PostgreSQL: autorização do titular, CSRF, isolamento entre tenants, duas execuções concorrentes, deduplicação, rascunhos sem Pix, alteração de valores somente nos ciclos futuros, pausa, cancelamento, restauração do cliente e histórico.
- Smoke tests de UI e Playwright desktop/mobile com criação de regra, prévia e menus.
- **Não homologado**: disparo real de scheduler na hospedagem, cargas em produção, notificações e-mails/WhatsApp (Fase 5), envio automático de Pix (não permitido nesta fase) e restauração real de backup.
- O encerramento técnico da Fase 4 requer CI verde no último commit e revisão do calendário/segurança. A ausência de infraestrutura continuará registrada como débito para a homologação final.

## Próximos trabalhos

1. Verificar o pipeline e corrigir eventuais regressões. Completar os testes de produção do agendador e cenários de falha.
2. Conservar os eventos para futura fila de avisos, **sem disparar notificação até a Fase 5**, que exige consentimento e canal oficial.
3. Manter \`main\` e PR draft sem mudanças de status não autorizadas.
