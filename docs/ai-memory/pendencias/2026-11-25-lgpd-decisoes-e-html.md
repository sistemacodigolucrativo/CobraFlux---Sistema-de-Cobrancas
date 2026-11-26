# CobraFlux — Checklist de pendências LGPD para decisão do responsável (25/11/2026)

**Status:** 10 itens **sem respostas/decisões fornecidas** nesta revisão; 6 categorias. Documento de análise de negócio em linguagem simples. **Não significa que cada requisito esteja totalmente ausente no código**, nem que o CobraFlux esteja conforme a LGPD. Conteúdo proveniente do checklist reduzido solicitado pelo responsável, cruzado com as pendências F7 [ADR-026](2026-11-23-f7-adiados.md). Nenhuma resposta pode ser presumida.

**Objetivo:** permitir que uma pessoa sem conhecimento técnico escolha uma política/forma de atendimento **antes** de solicitar implementação. É permitido **não decidir agora**, mas uma decisão adiada não equivale a dispensa legal. Tratamento efetivo e dever legal exigem revisão aplicável. Não coletar nomes/documentos de clientes neste checklist.

## Categoria 01 — Direitos dos usuários

### [ ] 01 — Confirmação de identidade
- **O que precisa decidir:** como confirmar que quem pede acesso, correção ou exclusão tem direito aos dados solicitados, inclusive clientes de terceiros que não são usuários cadastrados.
- **Por que:** impedir entrega de informações financeiras/pessoais a pessoas erradas.
- **É obrigatório?** Proteger os dados e verificar legitimidade, de forma proporcional, é necessário; **não** é obrigatório pedir documento de todos.
- **Alternativas para decisão:** (a) conta autenticada, com verificação de titularidade; (b) conta + confirmação adicional para dados sensíveis; (c) processo manual seguro quando não houver conta; (d) combinar métodos conforme o tipo de pedido; (e) ainda não definido.
- **Questões em aberto:** quem confere pedidos de clientes dos profissionais? Que informação mínima comprova a relação sem gerar coleta excessiva?
- **Aceite futuro:** o procedimento escrito e testado impede acesso de terceiros e registra a verificação sem expor documentos.

### [ ] 02 — Atendimento dos pedidos LGPD
- **O que precisa decidir:** quem analisa, responde e comprova a execução dos pedidos (consulta, correção, exclusão etc.).
- **Por que:** receber/registrar um pedido não significa atendê-lo; alguns direitos possuem procedimentos e prazos específicos.
- **É obrigatório?** Atender os direitos aplicáveis, justificar recusas e observar prazos legais, sim; automatizar tudo, não.
- **Alternativas:** (a) responsável atende manualmente pelo painel; (b) canal de e-mail e registro administrativo; (c) atendimento misto: triagem automática e conclusão humana; (d) ainda não definido.
- **Questões:** responsável? Como comprovar resposta e providências? Encaminhamento para profissional controlador, quando aplicável?
- **Aceite:** cada pedido passa por análise de legitimidade, ação adequada, resposta documentada e registro com privacidade.

## Categoria 02 — Exclusão e conservação de informações

### [ ] 03 — Exclusão e anonimização de dados
- **O que precisa decidir:** quando eliminar, anonimizar, restringir ou manter um dado por obrigação legal.
- **Por que:** o CobraFlux inclui registros financeiros que podem exigir conservação, mas outros dados devem deixar de ser tratados quando cabível.
- **É obrigatório?** Respeitar os direitos aplicáveis e as hipóteses legais de conservação, sim; apagar tudo imediatamente sem análise, não.
- **Alternativas:** (a) revisão humana de toda exclusão; (b) exclusão automática apenas de dados não financeiros previamente classificados; (c) anonimização quando adequada; (d) combinar tratamentos por categoria; (e) ainda não definido.
- **Questões:** quem autoriza? O que a legislação fiscal/contratual obriga preservar? Como informar a pessoa?
- **Aceite:** não excluir saldo/cobrança/histórico fiscal cegamente; registrar a providência e justificar retenção/recusa.

### [ ] 04 — Política de retenção
- **O que precisa decidir:** por quanto tempo guardar dados de conta, clientes, cobranças, documentos, logs e pedidos LGPD.
- **Por que:** não reter indefinidamente sem justificativa; não apagar registros exigidos por lei.
- **É obrigatório?** Critérios adequados de conservação, necessidade e eliminação, sim; prazo único para tudo, não.
- **Alternativas:** (a) tabela simples de prazos/justificativas por categoria; (b) revisão individual onde não houver prazo fixo; (c) combinação de política geral e exceções legais; (d) ainda não definido.
- **Questões:** responsáveis pela revisão tributária/jurídica? O que fazer ao encerrar conta? Prazo para backups?
- **Aceite:** matriz documentada de categorias, finalidade, prazo ou critério, responsável e procedimento de eliminação.

## Categoria 03 — Acesso e transferência de informações

### [ ] 05 — Portabilidade completa dos dados
- **O que precisa decidir:** quais informações pessoais fornecer, em que formato e com qual conferência; garantir consistência em exportações.
- **Por que:** as exportações existentes não provam uma visão completa e estável quando cadastros/cobranças mudam durante o processo.
- **É obrigatório?** Aplicar o direito de portabilidade quando cabível, respeitadas regras e terceiros; integração com concorrentes, não necessariamente.
- **Alternativas:** (a) exportação preparada e conferida manualmente; (b) CSV/JSON disponível após verificação de identidade; (c) exportação automatizada quando houver garantia de consistência; (d) combinar manual/automático; (e) ainda não definido.
- **Questões:** quais dados pertencem ao titular? Há informações de clientes de outros profissionais? Quem confere exportações grandes?
- **Aceite:** exportação segura, completa e consistente no escopo aprovado, sem informações indevidas de terceiros.

## Categoria 04 — Responsabilidades e transparência

### [ ] 06 — Definir quem responde pelos dados
- **O que precisa decidir:** papel da empresa CobraFlux e do profissional que cadastra seus próprios clientes; quem recebe/autoriza pedidos.
- **Por que:** quem usa o sistema não é necessariamente o titular dos dados dos clientes cobrados.
- **É obrigatório?** Definir responsabilidades e operar conforme os papéis reais, sim; não presumir que o sistema é sempre controlador ou operador em todos os fluxos.
- **Alternativas:** (a) profissional decide sobre dados dos seus clientes e plataforma apoia; (b) plataforma decide sobre dados de conta/serviços próprios; (c) matriz por finalidade distinguindo os dois; (d) ainda não definido.
- **Questões:** identificação de controladores, cláusulas contratuais, contato dos titulares e escalonamento.
- **Aceite:** matriz de responsabilidades documentada, refletindo o negócio e validada onde necessário.

### [ ] 07 — Revisão das regras de privacidade
- **O que precisa decidir:** texto e canal que explicam coleta, finalidade, compartilhamento, conservação, direitos e contato.
- **Por que:** informação clara ao titular e procedimento real são indispensáveis.
- **É obrigatório?** Transparência e informações adequadas, sim; documento enorme ou ferramenta onerosa, não.
- **Alternativas:** (a) política de privacidade objetiva e canal por e-mail; (b) política + formulário no painel; (c) documento com regras separadas para usuários e clientes de profissionais; (d) combinação; (e) ainda não definido.
- **Questões:** quem aprova o texto e atualiza após mudanças? Existe transferência internacional? Qual canal é divulgado?
- **Aceite:** política corresponde ao uso real dos dados e tem canal acessível e processo de resposta.

## Categoria 05 — Proteção de informações

### [ ] 08 — Proteção de documentos e anexos
- **O que precisa decidir:** oferecer anexos? Se sim, sob quais controles e prazos?
- **Por que:** documentos podem conter CPF, endereços, comprovantes e dados de terceiros.
- **É obrigatório?** Disponibilizar upload **não** é obrigatório por si só; proteger dados recebidos e não impedir indevidamente o exercício de direitos, sim.
- **Alternativas:** (a) não oferecer anexos agora e manter rota segura alternativa para pedidos legais; (b) permitir apenas documentos essenciais, com acesso restrito; (c) implementar anexos protegidos após análise específica; (d) ainda não definido.
- **Questões:** em quais fluxos o anexo é imprescindível? Quem poderá ver? Por quanto tempo será mantido?
- **Aceite:** não ativar armazenamento inseguro; controles de acesso, privacidade, retenção e uso legítimo comprovados.

### [ ] 09 — Comprovar a segurança dos dados
- **O que precisa decidir:** qual validação real antecede o uso de dados pessoais/financeiros.
- **Por que:** CI e testes sintéticos não comprovam proteção no ambiente publicado.
- **É obrigatório?** Segurança proporcional aos riscos, sim; contratar o serviço mais caro, não.
- **Alternativas:** (a) checagem interna documentada e correções; (b) revisão independente antes do uso real; (c) combinar checagens técnicas, staging e revisão proporcional; (d) ainda não definido.
- **Questões:** quem aprova resultados? Quais riscos relevantes foram corrigidos? Como lidar com incidentes e backups?
- **Aceite:** resultados verificáveis de ambiente real e medidas proporcionais, sem declaração infundada de conformidade.

## Categoria 06 — Validação jurídica e liberação

### [ ] 10 — Revisão jurídica das obrigações
- **O que precisa decidir:** como validar as regras de retenção financeira, direitos dos titulares, papéis da plataforma, compartilhamento e comunicações.
- **Por que:** diferentes atividades do CobraFlux estão sujeitas a obrigações específicas e decisões de negócio.
- **É obrigatório?** Cumprir a legislação, sim; contratar advogado para **toda** decisão, não é exigência universal. Avaliação especializada pode ser necessária para dúvidas complexas.
- **Alternativas:** (a) análise interna documentada de situações simples; (b) revisão jurídica focalizada em pontos de risco; (c) revisão externa abrangente pré-lançamento; (d) combinar; (e) ainda não definido.
- **Questões:** quem dá o aceite final? Há obrigações fiscais específicas? Alguma hipótese de transferência internacional?
- **Aceite:** decisões justificadas e compatíveis com a lei, com parecer/validação onde cabível.

## Requisito de interface solicitado: formulário HTML de decisões — AINDA NÃO ENTREGUE

**Pedido expresso:** gerar **um único HTML** autossuficiente (CSS e JavaScript embutidos; sem dependências externas), responsivo para celular, visual organizado/premium e **simples**, com o conteúdo **integral** das 6 categorias/10 itens acima: título, o que resolver, por quê, obrigatoriedade e alternativas; cada item com caixas de resposta, observações e escolha ainda não definida.

**Comportamento requerido:**
1. Mostrar as categorias separadas e os 10 itens numerados, sem omitir contexto.
2. Para **decisões exclusivas**, disponibilizar escolha única clara (radio ou checkbox com exclusividade garantida); **ações cumulativas**, checkboxes; observação livre por item. Não selecionar nada pelo usuário.
3. Salvar automaticamente as alterações de maneira persistente no navegador (por exemplo, `localStorage`, com aviso sobre eventuais restrições de arquivos `file://`). Não coletar dados reais de clientes.
4. Ter **botão flutuante** para exportar o estado do checklist como **TXT**, **HTML autossuficiente com respostas incorporadas** e **PDF por impressão/salvar como PDF do navegador**. Exportação HTML precisa continuar com respostas após reabrir o arquivo **em outro dispositivo sem o armazenamento anterior**.
5. Deve funcionar totalmente offline no celular; aplicar CSS de impressão para exportar PDF sem cortar campos. Sem backend, login, bibliotecas remotas ou uploads automáticos. Arquivo nomeado de forma inequívoca.
6. Ao reabrir o mesmo HTML no mesmo navegador, restaurar respostas; ao compartilhar o HTML exportado, respostas devem viajar junto; manter TXT fácil de ler por outra IA. Mostrar progresso e data de exportação sem inventar aprovação jurídica.
7. Testar marcações, persistência após reload, export/reimport HTML, TXT e impressão no desktop/mobile; avaliar comportamento `file://` no Android e documentar limitações.

**Status verificado em 25/11:** pedido repetido pelo responsável, **não há arquivo HTML LGPD/checklist no HEAD remoto** e nenhuma entrega HTML concluída foi comprovada nesta conversa. Respostas de todas as 10 questões: **NÃO DEFINIDAS**. Uma resposta anterior do assistente prometeu entregar, mas promessa não é artefato.

**Ao retomar:** prioridade prática imediata é **criar e entregar esse HTML simples**, sem pedir ao usuário que repita conteúdo ou opções. Depois esperar que ele responda e envie seu arquivo, **sem tomar decisões no lugar dele**.

**Segurança:** exportações TXT/HTML/PDF são arquivos legíveis, **não criptografados**. Tratar respostas como internas; não inserir dados pessoais reais, segredos ou arquivos preenchidos com informações sensíveis no Git público.
