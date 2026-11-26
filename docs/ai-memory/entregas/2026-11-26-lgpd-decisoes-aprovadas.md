# Decisões LGPD — retomada F7
Fonte: respostas explícitas do responsável no chat, 10/10. Decisão não equivale a implementação ou homologação.
| Nº | Decisão | Aceite ainda necessário |
|---|---|---|
| 01 | Sessão autenticada com verificação adicional conforme risco | Titularidade, terceiros sem conta, evidência minimizada |
| 02 | Atendimento manual pelo responsável com registro e controle de prazos | Responsável, prazos aplicáveis, resposta comprovada |
| 03 | Análise individual e exclusão quando legalmente cabível | Retenção legal, autorização e prova de execução |
| 04 | Tabela de retenção por categoria, finalidade e base legal | Validar prazos e descarte, inclusive backups |
| 05 | Exportação manual conferida antes da entrega | Escopo do titular, consistência e entrega segura |
| 06 | Mapear controlador e operador por finalidade real | Matriz e responsabilidades contratuais |
| 07 | Política de privacidade compatível com operação real | Conferir fluxos, canais e texto |
| 08 | Desativar anexos e oferecer canal alternativo seguro quando necessário | Verificar ausência de upload e canal seguro |
| 09 | Avaliação em ambiente representativo da produção com evidências | Homologação externa |
| 10 | Revisão jurídica proporcional aos riscos antes da liberação | Validação especializada |
Observação do responsável no item 08: definir nas regras a responsabilidade do usuário CobraFlux sobre uso de dados e documentos dos seus clientes. A plataforma conserva suas próprias obrigações legais; papéis dependem da finalidade real.
## Evidência de retomada
HEAD inicial 68805532670f0b2db82a2848832d4c25e11e5182; PR 2 draft; issue 3 aberta. CI 45737825930 falhou em saas.integration.test.ts:152 (starter vs free); fixtures usavam current_date do banco enquanto entitlement usa calendário de São Paulo. Commit c7e4ffe7e89f0e9511b9baab59cb2ae5f5ae14b3 alinha datas SQL do teste; validação CI pendente. Nenhuma alteração em regras financeiras de produção.
## Limites
F7 não encerrada integralmente; ADR-026 não elimina gates. Nenhuma exclusão real, deploy, merge ou aprovação jurídica. Próximo incremento: auditar e implementar fluxo manual LGPD, preservando isolamento e evidência. Não presumir prazo legal ou base legal não validada.
