# CobraFlux — Fase 2: equipe, permissões e paridade da navegação

**Escopo:** implementação no código; não equivale à homologação financeira/comercial.

## Convites e gerenciamento de equipe

- Titular (owner) ou superadministrador autenticado com MFA pode consultar membros, emitir convites de operador, revogar convites pendentes e remover operadores.
- Operadores podem gerenciar cadastros e rascunhos, mas não administram convites, não alteram dados gerais da organização e não podem se promover.
- Convite individual com e-mail normalizado, token criptográfico e somente hash SHA-256 armazenado, expiração em 48 horas, uso único e revogação.
- A emissão depende de provedor de e-mail configurado; sem credenciais retorna HTTP 503. Em falha de envio o convite é revogado, sem expor o token no painel.
- Novo usuário aceita o convite com nome e senha; tenant é derivado exclusivamente do convite. Possuir o link emitido para seu e-mail comprova posse do convite.
- Usuário existente aceita somente se o e-mail autenticado for o e-mail convidado.
- Usuários com acesso a diversas organizações escolhem o tenant no login ou alternam via sessão e CSRF. A organização nunca é fornecida como prova isolada de autorização.
- Revogar operador encerra imediatamente suas sessões vinculadas àquela organização, preservando sessões de outras organizações.
- O titular não pode remover a si próprio, nem operadores podem promover seus próprios privilégios.

## Endpoints

| Método | Endpoint | Requisito |
| --- | --- | --- |
| GET | /api/team | Titular/admin |
| POST | /api/team/invitations | Titular/admin + CSRF |
| POST | /api/team/invitations/:id/revoke | Titular/admin + CSRF |
| DELETE | /api/team/members/:userId | Titular/admin + CSRF |
| GET | /api/team/invitation/:token | Token válido |
| POST | /api/team/activate | Token + novo usuário |
| POST | /api/team/accept | Sessão do usuário convidado + CSRF |
| GET | /api/auth/organizations | Sessão |
| POST | /api/auth/switch-organization | Sessão + CSRF |

## Paridade de navegação com o mockup

O painel operacional reutiliza logotipo, paleta de cores, primitivos de cards e inputs, cabeçalho fixo, barra lateral desktop, menu drawer mobile e barra inferior compacta. Somente módulos operacionais reais aparecem no menu; recursos futuros não são apresentados como botões fictícios.

| Módulo do mockup | Situação operacional |
| --- | --- |
| Início | Indicadores básicos vindos do PostgreSQL |
| Clientes | Busca, filtro, CSV, cadastro, edição, arquivo e histórico |
| Cobranças | Criação, edição, duplicação, cancelamento, link e histórico de rascunhos |
| Serviços | Preços, frequência e arquivamento |
| Equipe | Convites, membros, revogação e alternância de tenant |
| Configurações | Perfil, senha, negócio, suporte e sessões |
| Pix real / Pagamentos | Fase 3 — bloqueado até PSP |
| Recorrências | Fase 4 — não implementado |
| Mensagens/avisos | Fase 5 — não implementado |
| Assinaturas de planos | Fase 6 — não implementado |
| Relatórios e notificações completos | Fase 7 — não implementado |

**A paridade total do mockup não está concluída:** gráficos e todos os cards não financeiros, elementos específicos das futuras telas, foto de perfil e detalhes finos de responsividade exigem uma revisão de navegador e continuarão evoluindo nas fases seguintes. Não declarar o mockup inteiro convertido até as fases posteriores.

## Testes sem hospedagem

- PostgreSQL temporário e testes de integração de convites, papéis, multi-tenant, revogação de sessões e autenticação.
- Smoke tests SSR da interface de produção, navegação e visibilidade de menu por papel.
- Playwright Chromium dedicado em CI com banco efêmero, desktop/mobile, login, cadastros, rascunhos e menu.
- Homologação de e-mail real, SSL/HTTPS, backup e PSP fica para o lançamento.

## Critérios de aceite

CI verde no commit final para testes de TypeScript, domínio, segurança, banco, UI e navegador. Código preservado em feat/production-foundation e PR draft. Nenhum Pix real será habilitado durante esta etapa.
