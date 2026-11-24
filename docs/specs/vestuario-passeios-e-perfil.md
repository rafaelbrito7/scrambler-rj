# Scrambler RJ — telas Vestuário e Passeios, pessoas por avatar e perfil renovado

Complementa `docs/specs/mvp-scrambler-rj.md` (campanhas e pedidos), `docs/specs/passeios-roteiro-e-mapa.md` (página do passeio e galeria) e a terceira edição de `docs/specs/perfis-dos-participantes.md` (histórico, selos e sequência). Decisões do usuário em 2026-11-23. Está implementado; o estado do código fica em "Notas".

## Problema

O rider só enxerga o que está aberto agora, no Início. Não há onde ver as peças que o grupo já fez nem os passeios que já aconteceram, e quem perdeu uma campanha não tem como dizer que quer a peça de volta. As contagens de pessoas são números ou listas de nomes. O perfil mostra dados em linha, com as motos pequenas, e não diz nada sobre a participação da pessoa.

## Solução

Duas telas novas no menu, Vestuário e Passeios, mostram o que está em campanha e tudo o que o grupo já teve. Numa peça de campanha fechada o rider pede a volta; os administradores acompanham os pedidos e abrem uma campanha nova quando juntar gente. Toda contagem de pessoas vira uma fileira de avatares que abre uma janela com quem são. O perfil passa a mostrar a estrada da pessoa com o grupo, o Instagram como botão e a moto principal em destaque.

## Histórias de usuário

1. Como rider, quero ver numa tela todas as peças que o grupo já fez, para saber o que existiu antes de eu entrar.
2. Como rider, quero ver quais peças estão em campanha agora e pedir dali mesmo.
3. Como rider, quero dizer que quero de volta uma peça de campanha fechada, com um toque.
4. Como rider, quero desfazer meu pedido de volta.
5. Como rider, quero ver quem mais quer a peça de volta, para saber se a campanha tem chance de reabrir.
6. Como rider, quero que a mesma peça apareça uma vez só, mesmo que já tenha tido várias campanhas.
7. Como administrador, quero ver no painel as peças com pedido de volta, da mais pedida para a menos.
8. Como administrador, quero abrir uma campanha nova a partir da antiga, já com modelo, preço, tamanhos, cores e fotos, e ajustar o que mudou.
9. Como administrador, quero que a campanha antiga e seus pedidos fiquem intactos quando a peça volta.
10. Como rider, quero que meu pedido de volta saia da lista quando a campanha nova abrir, porque foi atendido.
11. Como rider, quero ver numa tela os passeios que vêm pela frente e responder dali.
12. Como rider, quero ver todos os passeios realizados, do mais recente ao mais antigo.
13. Como rider, quero ver em cada passeio realizado a data, o percurso, a distância, a duração, quem foi e quantas fotos tem.
14. Como rider, quero abrir um passeio realizado e ver as fotos, a rota no mapa, a duração e quem foi.
15. Como rider, quero ver quem são as pessoas de uma contagem pelos rostos, e não só um número.
16. Como rider, quero tocar na contagem e ver cada pessoa com nome, Instagram e o caminho para o perfil.
17. Como rider que usa leitor de tela, quero a contagem escrita ao lado dos avatares.
18. Como rider, quero ver no perfil quantos passeios a pessoa fez, o selo de nível, a sequência e os passeios recentes.
19. Como rider, quero ver a moto principal de alguém em destaque, com foto grande e ficha.
20. Como rider, quero ver as fotos que a pessoa publicou nos passeios.
21. Como rider, quero que meu Instagram apareça como um botão fácil de tocar.
22. Como pessoa bloqueada, não quero aparecer nas fileiras de avatares nem ter histórico exibido.

## Decisões de implementação

**Pessoas por avatar.** Toda contagem de pessoas vista por riders é uma fileira de avatares sobrepostos com a contagem em palavras ao lado ("4 vão", "2 pedidos · 5 peças"). Mostra até cinco rostos e depois "+n"; na página do passeio e da campanha, até oito. A fileira é um botão que abre uma janela com cada pessoa: avatar, nome do grupo, @ do Instagram e "Ver perfil". Sem ninguém, não há botão, só a frase. Vale para quem vai, não vai e não respondeu a um passeio, quem foi, quem pediu numa campanha e quem quer uma peça de volta. É a única janela do sistema além da foto ampliada da galeria; ação sem volta continua sendo confirmada no lugar.

**Onde a lista continua.** Na página da campanha, a lista de pedidos fica, com a fileira acima: ela mostra itens e pagamento. Na página do passeio, o administrador continua com a lista de correção de presença, que tem botões por pessoa. Na tela Riders a contagem não vira fileira, porque a lista inteira está logo abaixo.

**Cartão de pessoa.** A fileira recebe do servidor só o que qualquer rider já vê de outro: nome, apelido, foto, foto da conta e Instagram. Entram apenas pessoas aprovadas e não bloqueadas; o pedido ou a resposta de uma pessoa bloqueada continua contando no número, sem rosto na fileira.

**Tela Vestuário (`/vestuario`).** Duas seções. "Em campanha" lista as campanhas abertas com o mesmo cartão do Início. "Já tivemos" lista as peças fechadas, as mais pedidas de volta primeiro, com foto, modelo, mês e preço da última campanha, quantas campanhas já teve (quando mais de uma) e a fileira de quem quer de volta. Campanha cancelada não aparece.

**Peça e linhagem.** Uma campanha aberta a partir de outra guarda de qual veio. A peça é a campanha mais recente dessa linhagem: as anteriores saem de "Já tivemos" e continuam acessíveis pelo endereço e pelo painel. Se a campanha nova for cancelada, a anterior volta a ser a peça. Campanhas abertas do zero ou por template, mesmo com o mesmo nome, são peças diferentes.

**Pedir a volta.** Só a campanha fechada e mais recente da peça aceita pedido de volta, um por rider, que ele desfaz quando quiser. Não há quantidade, tamanho nem cor: é um sinal de interesse, não um pedido. Todos os riders veem quem pediu.

**Abrir a campanha de volta.** No painel, Vestuário mostra o bloco "Pedidos de volta" com as peças que têm ao menos um pedido, da mais pedida para a menos, e "Abrir nova campanha". O formulário começa como cópia da campanha antiga, reaproveita as fotos e pode ser ajustado. Só campanha fechada serve de origem; se ela mudou de situação nesse meio-tempo, o administrador volta à lista com um aviso. Ao abrir, os pedidos de volta daquela peça são apagados, na mesma transação. Alternativa rejeitada pelo usuário: reabrir a própria campanha antiga, que misturaria pedidos antigos e novos.

**Aviso a quem pediu.** Hoje não há: a campanha nova aparece no Início e em "Em campanha", como qualquer outra. Decisão do usuário em 2026-11-23: a plataforma ganha um sininho na barra do topo, com avisos de volta de campanha, passeio novo e vestuário novo, entre outros. Especificado em `docs/specs/notificacoes.md`, ainda não construído; tickets 10 a 12.

**Passeio que já saiu.** Depois do horário de saída o passeio deixa de aceitar resposta e sai do Início, mesmo que nenhum administrador tenha encerrado as confirmações; fica só em "Realizados". As respostas ficam como estavam e o administrador continua corrigindo a presença. Decisão do usuário em 2026-11-23, depois de o aceite mostrar o mesmo passeio no Início e em "Realizados". O estado "confirmações abertas" não muda sozinho: não é encerramento agendado.

**Nome na janela de pessoas.** Nas telas do grupo, a janela mostra o apelido quando existe. No painel, mostra o nome com o apelido entre parênteses, como os demais registros de gestão (decisão do usuário em 2026-11-23).

**Tela Passeios (`/passeios`).** "Em campanha" lista os passeios não cancelados com saída no futuro, o mais próximo primeiro, com a resposta no cartão; os de confirmações encerradas aparecem com o selo e sem a resposta. "Realizados" lista os não cancelados com saída no passado, o mais recente primeiro, com data, percurso, distância, duração, a fileira de quem foi e o número de fotos publicadas, que leva à galeria.

**Passeio realizado.** É o passeio não cancelado cuja saída já passou, a mesma regra da galeria e da presença. Quem foi segue a regra de "passeio feito" da terceira edição de perfis.

**Duração.** É o intervalo entre a saída e o retorno previsto. A plataforma não mede o tempo real do passeio. Aparece na ficha da página do passeio, ao lado do "Tempo de rolé", e no cartão de realizado.

**Página do passeio.** Antes da saída, as três listas de nomes viram "Respostas do grupo", com três fileiras. Depois da saída, só "Quem foi": fileira para os riders, lista de correção para os administradores. O link de voltar leva a Passeios quando o passeio já foi realizado e ao Início quando não. A página da campanha fechada volta para Vestuário.

**Perfil.** O mesmo desenho no próprio perfil e no perfil visto por outro rider, na largura inteira da página; o bloco de dados privados segue estreito e com o título dizendo quem vê.

- **Cabeçalho**: avatar grande, nome do grupo, nome completo quando há apelido, selos e o Instagram como botão com o logo.
- **Estrada com o grupo**: passeios feitos, sequência (a partir de dois meses), recorde (quando maior que a atual), o que falta para o próximo selo, os cinco passeios mais recentes e as doze fotos mais recentes que a pessoa publicou nas galerias. As regras de contagem, selo e sequência são as da terceira edição de perfis, calculadas a cada leitura.
- **Motos**: a principal num cartão largo com foto grande e ficha (cilindrada, ano, cor, autonomia, modificações); as demais em grade. No próprio perfil, as ações de cada moto ficam no rodapé do cartão.

**Sequência de um mês.** A suposição da terceira edição foi mantida: sequência de um mês não aparece.

**Menu.** Entram Passeios e Vestuário, entre Início e Riders. No celular, o menu é uma linha que rola na horizontal, no lugar de quebrar em duas.

**Modelo.** A campanha ganha a referência opcional à campanha de onde veio. Uma tabela nova guarda o pedido de volta: campanha, rider e data, um por par. Nada do histórico de passeios é guardado.

**Quem vê e quem faz.** Riders aprovados veem as duas telas, pedem e desfazem a volta e veem quem pediu. Só administradores abrem campanha. Histórico, selo, sequência e fotos do perfil são vistos por riders aprovados; de quem não está no grupo não se mostra nada. Nenhum dado privado (WhatsApp, tamanho, emergência) entra nas fileiras nem nas telas novas.

## Decisões de teste

Pelos serviços, contra o PostgreSQL de teste, com a data atual injetada onde importa.

- **Pedir a volta**: pedir duas vezes conta uma; desfazer; todos veem quem pediu; só campanha fechada; quem não está aprovado não pede; campanha inexistente.
- **Campanha de volta**: abrir a partir de uma fechada apaga os pedidos de volta, mantém a antiga fechada e mostra uma peça só, com duas campanhas; a antiga deixa de aceitar pedido de volta e a nova passa a aceitar depois de fechada; campanha aberta ou inexistente não serve de origem; cancelada fica fora de "Já tivemos".
- **Passeios**: antes da saída o passeio está em campanha, com as pessoas de cada resposta; depois, está em realizados, com quem foi incluindo a correção do administrador; cancelado fica fora dos dois.
- **Selos**: os limites de cada marco e o que falta para o próximo.
- **Sequência**: meses seguidos, virada de ano, mês sem passeio do grupo, mês com passeio e sem presença, mês corrente em aberto, recorde preservado.
- **Histórico**: outro rider recebe contagem, selo, sequência e passeios recentes; a correção do administrador desfaz; quem não está no grupo não recebe.
- **Resumo de pedidos**: traz as pessoas que pediram e deixa de fora o pedido cancelado.
- **Passeio que já saiu**: sai do Início e recusa resposta depois da saída, continuando aberto e com a presença contada.
- **Tela**: conferida no navegador como rider comum e como administrador, no desktop e no celular, incluindo abrir uma campanha de volta pela tela; resultado no ticket 09. Falta ver sequência e recorde com dados de mais de um mês.

## Fora do escopo

Filtros e selos na tela Riders (terceira edição de perfis, ainda não construídos). Foto de capa no perfil (oferecida e não escolhida). Duração real do passeio. Notificações (sininho), que têm ticket próprio. Quantidade, cor ou tamanho no pedido de volta. Pedir a volta pela página da campanha.

## Notas

**Decisões do usuário em 2026-11-23.** Pedido de volta por peça, com campanha nova por cópia. Avatares com "+n" e janela em toda contagem de pessoas. No perfil: moto principal em destaque, Instagram como botão e fotos da pessoa nos passeios, além do histórico, selos e sequência já decididos.

**Decisões da implementação, revistas pelo usuário em 2026-11-23.** Confirmadas como estavam: duração como saída até o retorno previsto; campanha cancelada fora de "Já tivemos"; cinco rostos na fileira (oito nas páginas de detalhe) e doze fotos no perfil; passeio futuro com confirmações encerradas dentro de "Em campanha", com o selo. Mudadas: a janela de quem quer de volta, no painel, passou a mostrar o nome com o apelido entre parênteses; o aviso a quem pediu a volta deixa de ser "sem aviso" e vira o sininho de notificações, especificado em `docs/specs/notificacoes.md`.

**Estado do código em 2026-11-23.** Tudo acima está implementado, com a migração `20261123100000_batch_comebacks` e testes dos serviços. Componentes novos descritos no `DESIGN.md` e listados no `AGENTS.md`. Tickets em `docs/tickets/vestuario-passeios-e-perfil/`: 01 a 06 feitos, 09 (aceite e revisão das decisões) feito em 2026-11-23; 07 (busca e filtros na tela Riders), 08 (selo na tela Riders) e 10 a 12 (sininho de notificações) pendentes. Da terceira edição de perfis, ficaram construídos o histórico, o selo, a sequência e o recorde no perfil; filtros, busca e selo na tela Riders continuam por fazer.
