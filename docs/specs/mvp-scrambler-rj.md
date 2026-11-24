# Scrambler RJ — especificação do MVP

> Nomenclatura (2026-11-17): “lote” passou a se chamar “campanha de vestuário” (seção “Vestuário”) e “receita” passou a “template”. O texto abaixo guarda os termos da época; a interface usa os novos.

## Problema

Hoje, quem quer uma camiseta copia uma mensagem no WhatsApp, acrescenta cor, tamanho e quantidade e repassa a lista. O administrador precisa reconciliar versões, conferir pagamentos e somar peças para produção. Para um passeio, percurso e horários ficam em uma mensagem e as confirmações em outra. Quem chega depois precisa descobrir quais campanhas continuam abertas. Quem quer entrar no grupo também depende de alguém lembrar de avisar um administrador, e não há registro de quem pediu, quem avaliou e o que foi decidido.

## Solução

O WhatsApp continua sendo o ponto de divulgação. Um link leva à plataforma web do grupo de proprietários de Triumph Scrambler de todas as cilindradas no RJ. Não há landing page: o endereço abre com a abertura em que o logo se monta e segue direto para a tela de entrada. Quem ainda não participa entra com Google e envia um pedido de ingresso. Os administradores avaliam cada pedido numa tela própria do painel e aprovam ou reprovam. Na área dos riders, o Início reúne as campanhas ativas. Em cada lote, o rider escolhe a peça e acompanha o pedido. Em cada passeio, consulta os detalhes e responde se vai. O painel administrativo utiliza os mesmos registros para controlar inscrições, pagamentos, produção e relatórios.

## Histórias de usuário

1. Como pessoa que abre o link, quero ver a abertura com o logo do Scrambler RJ e chegar direto à tela de entrada, para não passar por uma página intermediária.
2. Como rider já logado, quero ir direto ao Início sem ver a abertura, para não esperar a cada acesso.
3. Como pessoa com "reduzir movimento" ativado, quero chegar à tela de entrada sem animação, para usar a plataforma sem desconforto.
4. Como rider aprovado, quero entrar com Google e cair no Início, para chegar às campanhas ativas em poucos toques.
5. Como pessoa nova, quero entrar com Google e informar nome, WhatsApp, modelo e cilindrada da moto, para pedir ingresso no grupo.
6. Como pessoa nova, quero conferir meus dados antes de enviar o pedido, para não ser avaliada com informação errada.
7. Como solicitante, quero ver que meu pedido está em avaliação, para saber que não preciso reenviar.
8. Como solicitante reprovado, quero ver que o pedido não foi aprovado, para não ficar esperando.
9. Como solicitante aprovado, quero ser levado ao Início no próximo acesso, para começar a participar.
10. Como administrador, quero ver no painel de gerenciamento a lista de pedidos de ingresso em avaliação, para saber quem está esperando.
11. Como administrador, quero ver quantos pedidos estão em avaliação sem abrir a tela, para não deixar ninguém esquecido.
12. Como administrador, quero abrir o perfil do solicitante com nome, WhatsApp, modelo, cilindrada e conta Google, para decidir com informação.
13. Como administrador, quero aprovar um pedido, para liberar o acesso da pessoa.
14. Como administrador, quero reprovar um pedido, para negar o acesso de quem não se enquadra no grupo.
15. Como administrador, quero ver quem avaliou cada pedido e quando, para acompanhar as decisões dos outros administradores.
16. Como administrador, quero consultar os pedidos já aprovados e reprovados, para rever uma decisão quando for preciso.
17. Como administrador, quero reverter uma reprovação, para corrigir um engano sem pedir que a pessoa refaça o cadastro.
18. Como administrador, quero bloquear um rider já aprovado preservando suas participações anteriores, para controlar o acesso sem perder histórico.
19. Como administrador, quero promover outro rider a administrador, para dividir a gestão do grupo.
20. Como rider aprovado, quero encontrar todos os lotes e passeios ativos para decidir do que participar.
21. Como administrador, quero abrir um lote de um único modelo e informar preço, tamanhos e fotos por cor para apresentar a peça correta.
22. Como administrador, quero salvar e editar uma receita para reutilizar os dados da peça em campanhas futuras.
23. Como administrador, quero abrir um lote pela receita e ajustar a cópia para aquela edição.
24. Como rider, quero ver a foto correspondente à cor selecionada para conferir minha escolha.
25. Como rider, quero reunir várias combinações de cor, tamanho e quantidade em um pedido e conferir seu total.
26. Como rider, quero editar ou excluir meu pedido pendente enquanto o lote estiver aberto.
27. Como rider aprovado, quero consultar os pedidos do grupo e seus estados de pagamento para acompanhar a encomenda coletiva.
28. Como administrador, quero registrar o pagamento integral e corrigir uma marcação incorreta com justificativa.
29. Como administrador, quero ajustar um pedido e saber quando a mudança exige nova conferência do pagamento.
30. Como administrador, quero fechar e reabrir lotes para controlar o período de pedidos.
31. Como administrador, quero cancelar campanhas permitidas sem perder o histórico das inscrições.
32. Como administrador, quero conferir quantidades por cor e tamanho e valores pagos e pendentes para organizar a produção.
33. Como administrador, quero gerar um PDF legível com pedidos e totais para compartilhar no WhatsApp.
34. Como administrador, quero publicar percurso, encontro e horários de um passeio para que o grupo possa se organizar.
35. Como rider, quero confirmar ou alterar minha resposta e consultar quem vai, quem recusou e quem ainda não respondeu.
36. Como administrador, quero encerrar, reabrir as confirmações ou cancelar o passeio para que o grupo veja a situação correta.
37. Como administrador, quero copiar um resumo com o link da campanha para divulgar a mesma informação no WhatsApp.

## Decisões de implementação

**Entrada sem landing page.** A raiz do endereço mostra a abertura do logo e, em seguida, a tela de entrada. A landing page foi descartada em 2026-11-17, por decisão do usuário: quem recebe o link já sabe o que é o grupo e quer entrar ou pedir ingresso. O código da landing existente deve ser removido; a abertura do logo já está implementada e é reaproveitada. A abertura monta o logo em camadas (moto, piloto, cenário, anel, letras, RJ), mostra "Scrambler RJ" abaixo e revela a tela de entrada. Ela toca toda vez que o site é aberto por quem não está logado, pode ser pulada por clique, tecla ou rolagem, não aparece com "reduzir movimento" ativado e nunca bloqueia a tela de entrada se as imagens demorarem. Quem já está logado não vê a abertura e vai direto à sua tela (Início, pedido ou situação). Decisão do usuário em 2026-11-17.

**Pedido de ingresso.** O link compartilhado inicia o acesso. Auth.js identifica a conta Google. Uma conta sem cadastro preenche nome, WhatsApp, modelo e cilindrada da moto e envia o pedido de ingresso. Cada conta Google tem no máximo um pedido. O pedido passa pelos estados abaixo.

| Estado | O que a pessoa vê | O que o administrador pode fazer |
|---|---|---|
| Em avaliação | Tela informando que o pedido aguarda avaliação | Aprovar ou reprovar |
| Aprovado | Início e demais áreas dos riders | Bloquear |
| Reprovado | Tela informando que o pedido não foi aprovado | Reverter para aprovado |
| Bloqueado | Tela informando que o acesso está suspenso | Desbloquear |

**Avaliação de perfil.** O painel de gerenciamento tem uma tela de avaliações de perfil. Ela lista os pedidos em avaliação, do mais antigo ao mais recente, e mostra a contagem de pendentes na navegação do painel. Cada pedido abre o perfil do solicitante: nome, WhatsApp, modelo, cilindrada, nome e foto da conta Google e data do pedido. Aprovar e reprovar são ações de um único administrador; a primeira decisão gravada vale. Registrar autor e data de cada decisão. A tela também permite consultar os pedidos já decididos. Pedidos reprovados são preservados, não excluídos, para dar histórico e permitir reversão. Se dois administradores decidirem o mesmo pedido ao mesmo tempo, grava-se um único resultado e o segundo é informado de que o pedido já foi avaliado.

**Acesso.** Em avaliação, reprovado ou bloqueado não acessa dados do grupo, inclusive por link direto. Apenas administradores consultam o WhatsApp de outros riders. O bloqueio preserva pedidos, pagamentos e participações. Os três administradores iniciais têm poderes iguais. Impedir qualquer mudança de papel ou acesso que deixe o grupo sem administrador ativo.

**Início e navegação.** “Campanhas ativas” reúne todos os lotes abertos e passeios com confirmação aberta. Funciona com vários de cada tipo, somente um tipo ou lista vazia. Fechar retira a campanha do Início, preserva o histórico e bloqueia novas inscrições. Reabrir restaura sua disponibilidade. Campanhas canceladas ficam fora da lista. Priorizar a leitura e as ações no celular para quem chega do WhatsApp. Desenho confirmado pelo usuário em 2026-11-17: uma linha de resumo no topo diz em quantas campanhas falta a pessoa agir; duas seções, Passeios (por data, o mais próximo primeiro) e Lotes, com os pendentes antes dos resolvidos; cada cartão mostra foto, a situação da própria pessoa e os números do grupo. O rider responde Vou ou Não vou no próprio cartão do passeio; o cartão do lote leva à página do lote. O laranja aparece só onde falta a pessoa agir.

**Receita e lote.** A receita guarda modelo, preço unitário, tamanhos e pares de cor e foto. O administrador pode preparar a peça diretamente ou partir de uma receita. Abrir pela receita cria uma cópia independente e editável antes da abertura. Mudar a receita afeta usos futuros. Mudar a cópia afeta apenas o lote. Cada lote tem um modelo e um preço por peça, comum a todas as combinações. A troca de cor mostra a imagem daquela variante, inclusive ao voltar à seleção anterior. Validar a correspondência entre cores oferecidas e imagens disponíveis ao abrir o lote.

**Pedido e preço.** O pedido do rider reúne combinações válidas daquele lote, cada uma com quantidade inteira positiva. O total é a soma das quantidades multiplicada pelo preço unitário do lote. Usar valores monetários exatos em reais. Travar o preço após o primeiro pedido. Para corrigir o preço, cancelar e abrir outro lote se todos os pedidos estiverem pendentes. Se houver pagamento confirmado, fechar o lote e aplicar o novo preço apenas aos pedidos futuros em outro lote.

| Situação | Rider titular | Administrador |
|---|---|---|
| Pendente, lote aberto | Editar ou excluir o próprio pedido | Editar, cancelar ou marcar como pago |
| Pendente, lote fechado | Consultar | Editar, cancelar ou marcar como pago |
| Pago, lote aberto ou fechado | Consultar | Editar conforme regra de total. Cancelamento e exclusão bloqueados |
| Lote cancelado | Consultar histórico | Consultar histórico e excluir cancelados dos totais de produção |

**Pagamentos e cancelamento.** Registrar pagamento integral manual, autor e data. Uma correção administrativa de cor ou tamanho que preserve o total mantém o estado Pago. Mudar o total devolve o pedido a Pendente. Para desfazer uma marcação incorreta, registrar autor, data e motivo. É proibido cancelar um pedido pago ou um lote com qualquer pedido pago. Fechar continua permitido. Impedir que a remoção do último item de um pedido pago contorne a proibição. Preservar o histórico dos cancelados.

**Visibilidade e relatório.** Todos os riders aprovados consultam os pedidos e a situação de pagamento do grupo. O administrador vê peças por cor e tamanho e totais financeiros pagos e pendentes. A exportação administrativa gera PDF com identidade Scrambler RJ, modelo, foto, situação do lote, data de geração, riders, combinações, quantidades, valores, pagamentos e totais ao final. Paginar listas longas e omitir telefones e pedidos cancelados. O administrador compartilha manualmente o arquivo.

**Passeios.** Exigir data, percurso, ponto de encontro, saída e previsão de retorno. O link de mapa e a foto do passeio são opcionais. Enquanto aberto, cada rider pode alternar entre Vou e Não vou. A ausência de resposta forma uma terceira lista. O encerramento congela as respostas e a reabertura permite novas alterações. O cancelamento sinaliza a situação e impede confirmações. Sem limite de vagas.

**Persistência e interface.** Implementar a plataforma com Next.js, TypeScript, PostgreSQL, Prisma, Auth.js, Tailwind CSS v4, pnpm e ESLint. Aplicar no servidor as permissões e regras de estado na hora de salvar, inclusive quando duas pessoas agem ao mesmo tempo. Preservar o logo e a paleta preta, laranja e creme. As fotografias originais continuam disponíveis como material do grupo, sem uso obrigatório. Usar “grupo” e “riders”. Na área interna, priorizar leitura, usar Base UI e consolidar os componentes e estados aprovados em catálogo interno do projeto.

## Decisões de teste e critérios de aceite

**Critério de aceite aprovado.** Executar os fluxos no navegador do celular e no navegador do desktop, com contas distintas de solicitante, rider e administrador. Registrar o resultado de cada combinação. O aceite exige que cada perfil conclua as tarefas abaixo nos dois dispositivos.

| Perfil | Fluxos a executar tanto no celular quanto no desktop |
|---|---|
| Solicitante | Ver a abertura, entrar com Google, enviar o pedido de ingresso, ver o estado em avaliação e, depois da decisão, o Início ou o aviso de reprovação. |
| Rider | Entrar, localizar campanhas, escolher cor e tamanho, conferir a foto, fazer e editar pedido pendente, consultar seu pagamento e confirmar ou alterar presença em passeio. |
| Administrador | Avaliar pedidos de ingresso (aprovar e reprovar), reverter uma reprovação, abrir lote pela receita, conferir pedidos, registrar pagamento, fechar e reabrir lote, baixar e conferir o PDF e gerenciar confirmações de passeio. |

Em cada dispositivo, aplicar também os cenários de interface detalhados abaixo, incluindo as restrições de cada perfil. Conferir os dados após atualizar a página e na sessão da outra conta. Para ações protegidas, complementar o teste da interface com uma tentativa direta no servidor usando a conta sem permissão.

| Cenário | Resultado que comprova o aceite |
|---|---|
| Abertura e entrada | A raiz mostra a abertura e chega à tela de entrada sem página intermediária. Clique, tecla ou rolagem pulam a abertura. Abrir o site de novo sem estar logado toca a abertura outra vez; logado, ela não aparece. Com "reduzir movimento" ativado a tela de entrada aparece direto. |
| Pedido de ingresso | Uma conta Google nova preenche o cadastro e vê o estado em avaliação. Reenviar não cria um segundo pedido. Nenhuma área do grupo abre, inclusive por link direto. |
| Avaliação de perfil | O pedido aparece na tela de avaliações com os dados do perfil e a contagem de pendentes sobe. Aprovar libera o Início para o solicitante. Reprovar mostra o aviso de reprovação e mantém o acesso negado. O histórico identifica o administrador e a data. Reverter a reprovação libera o acesso sem novo cadastro. A conta de rider não abre a tela nem consegue decidir por chamada direta. |
| Bloqueio | Um bloqueio corta acesso inclusive por link direto e preserva registros anteriores. Outro rider não recebe o telefone. |
| Receita → lote → pedido | Abrir dois lotes pela mesma receita, ajustar apenas o segundo e editar a receita depois. Os dois lotes mantêm seus dados. No Início, abrir o segundo, alternar cores, conferir as fotos e pedir 2 peças M e 1 G a R$ 80. O total de R$ 240 aparece para as duas contas após recarregar. |
| Edição e pagamento | O titular edita ou exclui o pedido pendente em lote aberto. Outro rider não consegue alterá-lo. Após o administrador marcar Pago, o titular perde a edição. Troca administrativa de tamanho preserva Pago. Alteração de quantidade muda o total e retorna a Pendente. |
| Correção e histórico | Desfazer uma marcação incorreta exige motivo. O histórico identifica o administrador e a data. Bloquear o rider mantém o pedido e o pagamento registrados. |
| Fechamento e cancelamento | Com pedido pago, rejeitar cancelamento de pedido e lote, inclusive por chamada direta. Fechar preserva os pedidos e impede alterações do rider, mesmo numa aba aberta antes do fechamento. Reabrir permite editar os pendentes. |
| Produção e PDF | Com pedidos pagos, pendentes e cancelados, somar peças por variante e conferir valores na tela e no PDF. Verificar a última página de um lote longo, os totais e a ausência de telefones e cancelados. A conta de rider não consegue exportar. |
| Passeio e divulgação | Copiar o resumo com link, abrir a campanha, responder Vou e trocar para Não vou. As listas refletem uma única resposta. Encerrar bloqueia mudanças, reabrir as permite e cancelar encerra as confirmações. |
| Concorrência e permissões | Se dois administradores aprovarem e reprovarem o mesmo pedido ao mesmo tempo, apenas uma decisão é gravada. Se marcar Pago e cancelar o lote coincidirem, apenas um resultado compatível com as regras é gravado. Repetir uma confirmação não duplica respostas. Impedir a perda do último administrador, inclusive por solicitações simultâneas. |

## Fora do escopo

Landing page pública e qualquer página de apresentação do grupo antes da entrada. Votação entre administradores para aprovar um pedido. Aviso automático ao solicitante por e-mail ou WhatsApp sobre a decisão. Pagamento integrado ou parcial, estoque, limite de vagas, encerramento agendado, login por SMS ou WhatsApp, envio automático de mensagens, logística de entrega e exportação em CSV ou imagem. A publicação e a contratação de infraestrutura são decisões posteriores.

## Notas para continuidade

**Etapa futura — contribuição para eventos.** No MVP a peça é vendida pelo custo. A evolução mapeada deve mostrar aos riders custo unitário, adicional destinado aos eventos, preço final e adicional efetivamente arrecadado no lote. Por exemplo, R$ 80 de custo mais R$ 10 de contribuição, com seis peças pagas e quatro pendentes, representam R$ 60 arrecadados. Uma correção de pagamento deve refletir no total. Esse cálculo futuro não exige um fluxo de devolução de pedido pago cancelado.

**Decisão confirmada e suposições em aberto.** O usuário confirmou em 2026-11-17 que a decisão de um único administrador basta para aprovar ou reprovar um pedido de ingresso; não há votação. Seguem como suposições a confirmar: a reprovação não exige motivo, e um solicitante reprovado não pode reenviar o pedido por conta própria, cabendo a reversão ao administrador.

**Estado do código em 2026-11-17.** A landing page foi removida. Estão implementados: a abertura do logo, a tela de entrada, o pedido de ingresso, a tela de situação do pedido, um Início ainda sem campanhas e a tela de avaliações de perfil com aprovar, reprovar e reverter. As regras de acesso têm testes automatizados contra um PostgreSQL local. Decisões tomadas na implementação: os administradores iniciais vêm de uma lista de e-mails na configuração e são aprovados ao enviar o próprio cadastro; a entrada dos administradores fica em um endereço próprio (`/painel/entrar`), sem link em nenhuma tela, separado da entrada dos riders; enquanto o Google não está configurado, e só em desenvolvimento, "Entrar com Google" entra como um rider de teste e a entrada administrativa entra como um administrador de teste; o banco local é o Postgres embutido do Prisma. Depois, na mesma data: abertura de lote direto com fotos por cor (ticket 03), pedido do rider com lista de pedidos do grupo e Início com a situação de cada pessoa (ticket 04), pagamento manual com histórico e ajuste administrativo do pedido (ticket 06), fechar, reabrir e cancelar lote e cancelar pedido (ticket 07), totais de produção (ticket 08), PDF administrativo do lote com `@react-pdf/renderer` (ticket 09), publicação de passeio com resposta de presença no cartão do Início (ticket 10), encerrar, reabrir e cancelar passeio (ticket 11), botão de copiar resumo com link (ticket 12), bloquear e desbloquear rider com tela de riders (ticket 01), promover e rebaixar administrador com proteção do último administrador (ticket 02), receitas com abertura de lote por cópia (ticket 05), e adoção de shadcn/ui sobre Base UI. Todos os tickets de construção estão implementados; falta a validação de aceite no celular e no desktop (ticket 13). Os tickets estão em `docs/tickets/mvp-scrambler-rj/`. As credenciais OAuth do Google ainda precisam ser criadas pelo usuário.

**Entrada única (2026-11-23).** Decisão do usuário: não há mais entrada de administrador. Todos entram pela raiz, com o mesmo botão, e a conta define o que cada um vê; o administrador encontra o painel pelo item "Painel" do menu e cai no Início como os demais. `/painel/entrar` foi removido. Isso substitui a decisão de 2026-11-17, registrada abaixo, de manter a entrada dos administradores em endereço próprio e sem link. Em desenvolvimento, sem Google configurado, a raiz mostra um segundo botão para a conta de administrador de teste.

**Atualização de 2026-11-23.** Especificado em `docs/specs/vestuario-passeios-e-perfil.md` e implementado. O menu ganhou Passeios e Vestuário, telas que mostram, além do que está em campanha, os passeios realizados e as peças que o grupo já teve. Uma peça de campanha fechada pode ser pedida de volta pelo rider; o administrador abre uma campanha nova por cópia da antiga, o que apaga os pedidos de volta atendidos. Isso é diferente de reabrir, que devolve a mesma campanha ao Início com os mesmos pedidos e continua existindo. Nos cartões do Início e nas páginas de campanha e de passeio, os números do grupo passaram a ser fileiras de avatares que abrem uma janela com as pessoas; a história 35 (consultar quem vai, quem recusou e quem não respondeu) é atendida por essas fileiras, e a lista de pedidos do grupo continua na página da campanha. A campanha fechada volta para Vestuário, não para o Início. Um passeio cujo horário de saída já passou sai do Início e deixa de aceitar resposta, mesmo com as confirmações ainda abertas; isso não muda o estado do passeio nem é encerramento agendado.

**Validação pendente.** O protótipo antigo foi descartado. Ainda falta executar a validação no celular e no desktop dos fluxos de solicitante, rider e administrador, de preferência com os três administradores e dois riders. Hospedagem, armazenamento das fotos, orçamento e responsabilidade pela manutenção seguem em aberto.
