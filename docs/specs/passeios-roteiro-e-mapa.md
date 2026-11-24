# Scrambler RJ — passeios com roteiro, ficha e mapa

Complementa `docs/specs/mvp-scrambler-rj.md` (passeio, respostas, encerramento) e `docs/specs/perfis-dos-participantes.md` (presença, selos e sequência). Decisões do usuário em 2026-11-17, tomadas no mapa `docs/tickets/evolucao-perfil-motos-passeios/map.md`. Nada daqui está implementado.

## Problema

Hoje um passeio é um título, um ponto de encontro, dois horários e, quando alguém lembra, um link de mapa. Quem abre a página não sabe quantos quilômetros são, quanto tempo de moto, se tem terra, onde abastece, onde almoça, nem o que levar. Essas respostas acabam dadas uma a uma no WhatsApp, e se perdem na conversa. Depois do passeio, as fotos ficam espalhadas nos celulares, e uma rota boa precisa ser redigitada do zero para ser repetida.

## Solução

O administrador publica o passeio com um roteiro de paradas em ordem, cada uma com tipo, lugar e horário. A plataforma traça a rota num mapa de verdade e calcula quilômetros e tempo de rolé. A página do passeio mostra, em blocos que se reconhecem de relance: a ficha da rota, o roteiro em linha do tempo, o mapa, a previsão do tempo com o plano B, e o que levar, escolhido pelo administrador numa lista pronta de recomendações. Depois do passeio, quem foi envia fotos para uma galeria aprovada pelos administradores, e a rota pode ser guardada como template para a próxima vez.

## Histórias de usuário

1. Como rider, quero ver o roteiro do passeio em ordem, com o horário de cada parada, para saber como o dia vai acontecer.
2. Como rider, quero reconhecer o tipo de cada parada por um ícone e uma palavra, para achar de relance onde abastece e onde come.
3. Como rider, quero ver o nome e o lugar de cada parada, para saber onde é.
4. Como rider, quero ler a observação de uma parada, para saber o que o administrador avisou sobre ela.
5. Como rider, quero abrir uma parada no meu aplicativo de mapa, para chegar lá sozinho se me perder do grupo.
6. Como rider, quero ver o horário de encontro separado do de saída, para saber até que horas posso chegar.
7. Como rider, quero ver a distância total e o tempo de rolé, para decidir se o passeio cabe no meu dia.
8. Como rider, quero ver o tipo de piso, para saber se minha moto e meu pneu dão conta.
9. Como rider, quero ver a dificuldade, para comparar com a minha experiência.
10. Como rider, quero ver quanto vou gastar de pedágio, para levar o valor.
11. Como rider, quero ver o traçado da rota num mapa, com as paradas numeradas como no roteiro.
12. Como rider, quero arrastar e ampliar o mapa, para ver uma parte da rota de perto.
13. Como rider, quero abrir a rota inteira no Google Maps, para navegar por ela.
14. Como rider, quero que a página continue útil quando o mapa não carrega, com o roteiro em lista e os botões de abrir.
15. Como rider, quero ver a previsão do tempo no encontro e no destino quando o passeio estiver próximo.
16. Como rider, quero saber qual é o plano B em caso de chuva, para não ficar na dúvida na manhã do passeio.
17. (Retirada em 2026-11-17: o grupo não tem líder nem ferrolho, anda junto.)
18. (Retirada em 2026-11-17: o grupo não tem líder nem ferrolho, anda junto.)
19. Como rider, quero ver o que levar numa lista de itens com ícone, para conferir antes de sair de casa.
20. Como rider, quero ler uma observação extra do administrador sobre o que levar, quando houver.
21. Como rider, quero responder "Vou" ou "Não vou" logo no começo da página, sem rolar até o fim.
22. Como rider, quero adicionar o passeio à minha agenda com um toque.
23. Como rider, quero que a página funcione bem no celular, que é onde abro o link do WhatsApp.
24. Como administrador, quero montar o roteiro acrescentando paradas uma a uma.
25. Como administrador, quero buscar cada parada pelo nome ou endereço, para não precisar de coordenadas.
26. Como administrador, quero reordenar e remover paradas antes de publicar.
27. Como administrador, quero escolher o tipo de cada parada numa lista.
28. Como administrador, quero que a distância e o tempo de rolé venham calculados, para não medir em outro aplicativo.
29. Como administrador, quero corrigir à mão a distância e o tempo calculados, quando eu souber que estão errados.
30. Como administrador, quero enviar um GPX da rota que já fiz, para o traçado ser exatamente a estrada que quero.
31. Como administrador, quero ver o mapa com o traçado antes de publicar, para conferir a rota.
32. Como administrador, quero informar piso e dificuldade escolhendo entre opções.
33. Como administrador, quero ser impedido de publicar sem distância, piso e dificuldade, para todo passeio ter a ficha mínima.
34. Como administrador, quero publicar mesmo sem traçado no mapa, digitando a distância, para não depender do serviço de mapa.
35. (Retirada em 2026-11-17: o grupo não tem líder nem ferrolho, anda junto.)
36. (Retirada em 2026-11-17: o grupo não tem líder nem ferrolho, anda junto.)
37. Como administrador, quero marcar numa lista pronta as recomendações do que levar, para não redigir a cada passeio.
38. Como administrador, quero acrescentar uma observação livre ao que levar, para o que a lista não cobre.
39. Como administrador, quero escrever o plano B para chuva.
40. Como administrador, quero editar roteiro, ficha e recomendações de um passeio já publicado.
41. Como administrador, quero que os passeios publicados antes desta mudança continuem abrindo, sem eu ter de refazê-los.
42. Como administrador, quero completar o roteiro de um passeio antigo quando eu quiser.
43. Como administrador, quero salvar a rota de um passeio como template.
44. Como administrador, quero publicar um passeio novo a partir de um template, ajustando data, horários e o que mais mudar.
45. Como administrador, quero que mudar o passeio não mude o template, e vice-versa.
46. Como administrador, quero renomear e apagar templates de rota.
47. Como rider que fez o passeio, quero enviar fotos para a galeria dele.
48. Como rider, quero ver minhas fotos que ainda esperam aprovação e apagá-las.
49. Como rider, quero ser avisado na tela quando atingi meu limite de fotos naquele passeio.
50. Como rider que não fez o passeio, quero ver a galeria, mas não enviar.
51. Como administrador, quero aprovar ou recusar cada foto antes de ela aparecer.
52. Como administrador, quero ver na aba Passeios do painel quantas fotos esperam aprovação.
53. Como administrador, quero apagar uma foto já publicada.
54. Como rider, quero abrir uma foto da galeria em tamanho grande.
55. Como pessoa não aprovada, não quero conseguir ver roteiro, mapa nem fotos de um passeio, nem por link direto.
56. Como rider, quero que o resumo copiado para o WhatsApp traga distância, tempo de rolé e horário de encontro.

## Decisões de implementação

**Roteiro em paradas.** Um passeio tem uma lista ordenada de paradas, de uma a vinte. Cada parada tem tipo e nome (obrigatórios), local, horário previsto e observação (opcionais). Tipos: encontro, abastecimento, café ou refeição, mirante ou foto, destino, retorno. A primeira parada é sempre do tipo encontro. O local é um ponto achado pela busca de lugares (nome exibido e coordenadas) ou um texto livre sem coordenadas; só paradas com coordenadas entram no mapa e na rota calculada. A observação tem até 140 caracteres.

**Horários.** O passeio tem horário de encontro, horário de saída e previsão de retorno. O horário de saída é o que existe hoje; o de encontro é novo, opcional, e não pode ser depois da saída. Sem horário de encontro, a página mostra só a saída.

**Descrição.** O título do passeio continua sendo o percurso em uma linha. Soma-se uma descrição opcional de até 500 caracteres.

**Ficha da rota.** Obrigatórios para publicar: distância total em quilômetros, tipo de piso (asfalto, terra, misto) e dificuldade (leve, moderado, exigente). Opcionais: tempo de rolé, pedágios em reais. O usuário escolheu esses três como mínimo para que todo passeio responda "quanto, em que piso, para quem". A dificuldade só informa: não impede ninguém de responder "Vou", e a plataforma não a compara com a experiência do rider. O destaque de trechos por tipo de piso no traçado foi descartado pelo usuário; o piso aparece só na ficha.

**Mapa e rota.** MapLibre desenha o mapa; Stadia Maps fornece o mapa-base e a rota com perfil de moto. Decisão revista em 2026-11-17, depois de ler os termos de uso da Stadia (versão de 9 de novembro de 2026): eles proíbem guardar o resultado da rota no servidor, em qualquer plano, e só permitem guardar coordenadas vindas da busca de lugares a partir do plano Standard. A recomendação inicial dizia o contrário, sem ter lido os termos. O usuário decidiu seguir com a Stadia dentro dessas regras; um e-mail pedindo autorização para guardar foi redigido para ele enviar a support@stadiamaps.com. Fonte: `docs/research/provedores-de-mapa-rota-e-clima.md`, que está errada nesse ponto.

**Paradas marcadas no mapa.** O administrador marca cada parada tocando no ponto exato de um mapa, no formulário. A coordenada é escolha dele, dado do grupo, e fica guardada na parada. Não há busca de lugar por nome: guardar o resultado dela exigiria um plano pago. Marcar é opcional; parada sem ponto aparece só no roteiro.

**Rota ao vivo.** A página do passeio pede a rota à Stadia a partir do navegador de quem a abre, entre as paradas marcadas, na ordem, e desenha o traçado. Nada disso é guardado no banco. O navegador guarda o resultado por até sete dias, que é o que os termos permitem, para quem reabre a página não gastar de novo. Abaixo do mapa aparece o que a rota deu ("Pelo mapa: 63 km, 56min de moto sem as paradas"), como referência. A distância e o tempo da ficha continuam sendo os que o administrador digitou. Estimativa de consumo: cerca de um terço dos 200.000 créditos mensais do plano grátis, com 2.000 aberturas de página por mês; o custo do mapa-base nessa conta não foi confirmado.

**Sem chave no navegador.** As chamadas saem das páginas do site e são autorizadas pela Stadia por domínio; em `localhost` funcionam sem cadastro. Quando o site tiver endereço próprio, o domínio precisa ser cadastrado no painel da Stadia. A chave de API criada pelo usuário está no `.env` e hoje não é usada por nenhuma parte do sistema.

**GPX.** Continua previsto: traçado e distância vindos de um arquivo do próprio grupo podem ser guardados sem restrição, e passam a ter prioridade sobre a rota ao vivo. Limite de 5 MB; traçado simplificado para no máximo 5.000 pontos. Link colado do Google Maps não é aceito como rota.

**Publicar não depende do mapa.** Marcar paradas é opcional. Sem pontos marcados o bloco do mapa não aparece; se a rota não carregar, o mapa mostra só as paradas e a página diz isso.

**Abrir fora.** "Abrir no Google Maps" abre a rota com as paradas que têm coordenadas, até o limite do Google (nove paradas; três em navegador de celular), priorizando encontro, destino e as intermediárias na ordem. Cada parada com coordenadas tem "Abrir no mapa", que abre aquele ponto no aplicativo de mapa do aparelho e serve também ao Waze, que só aceita um destino. O link de mapa que os passeios antigos têm continua funcionando onde existe.

**Previsão do tempo.** Open-Meteo, sem custo. Aparece a partir de sete dias antes da data, para o ponto de encontro no horário de saída e para a parada de destino no horário dela: temperatura e chance de chuva, com um ícone do céu. O servidor busca e guarda por até três horas, para não consultar a cada visita. Sem coordenadas, fora da janela ou com o serviço fora do ar, o bloco mostra só o plano B, e some se não houver plano B. Depois do passeio, a previsão não aparece.

**Plano B.** Texto opcional de até 280 caracteres, sempre visível quando preenchido.

**Sem líder nem ferrolho.** A plataforma não registra quem lidera nem quem fecha o passeio. A ideia entrou na lista inicial e chegou a ser decidida, mas o usuário a retirou em 2026-11-17: nos rolés do grupo ninguém tem esse papel, todo mundo anda junto. Não reintroduzir sem pedido dele.

**Leve com você: recomendações de uma lista.** O administrador marca, ao publicar ou editar, quais recomendações valem para aquele passeio, numa lista fixa em que cada item tem um texto e um ícone. O usuário pediu a lista pronta para o administrador selecionar, em vez de redigir; assim todo passeio fala a mesma língua e cada item se reconhece de relance. Lista inicial, a conferir com o usuário:

| Recomendação | Quando costuma valer |
|---|---|
| Tanque cheio na saída | Quase sempre |
| Pneus calibrados | Quase sempre |
| Corrente lubrificada | Passeios longos |
| Documento da moto e habilitação | Sempre |
| Dinheiro para pedágio | Rota com pedágio |
| Dinheiro para alimentação | Parada de café ou refeição |
| Capa de chuva | Serra, previsão incerta |
| Agasalho ou segunda pele | Serra, saída cedo |
| Jaqueta, luvas e bota | Sempre |
| Água | Calor, passeios longos |
| Protetor solar | Verão |
| Kit de reparo de pneu | Trechos de terra, estrada vazia |
| Roupa de banho | Cachoeira, praia |
| Carregador ou bateria extra | Passeios de dia inteiro |

A lista fica no banco de dados e é mantida pelos administradores numa tela do painel: incluir, renomear, trocar o ícone (escolhido num conjunto pequeno), reordenar e desativar. O usuário pediu isso em 2026-11-17, revendo a decisão anterior de manter a lista fixa no código; o custo aceito é mais uma tela para manter. As quatorze recomendações acima entram no banco prontas, pela migração. Uma recomendação nunca é apagada, só desativada: deixa de aparecer para escolha em passeios novos e continua aparecendo nos passeios que já a usam. Para o que a lista não cobre há uma observação livre de até 200 caracteres, mostrada abaixo dos itens. Nenhuma recomendação é obrigatória; sem itens e sem observação, o bloco não aparece. Os itens aparecem na ordem da lista, não na ordem em que foram marcados. Recomendação é aviso: a plataforma não confere nem pede confirmação do rider.

**Página do passeio.** Segue a variante A aprovada no protótipo (`src/app/passeios/prototipo/`, descartável): título, data com encontro e saída, descrição, resposta "Vou / Não vou" logo abaixo no celular e no topo da coluna lateral no desktop; ficha em quadros com ícone; roteiro em linha do tempo, com o horário à esquerda, o marcador com o ícone do tipo (encontro e destino em laranja cheio) e, à direita, tipo, nome, local, observação e "Abrir no mapa"; "Leve com você" em itens com ícone; galeria. Na coluna lateral: mapa com os botões de abrir e de agenda, tempo no dia com o plano B. Cada seção tem título com ícone e fio, para ser reconhecida de relance. As listas "Vão", "Não vão" e "Sem resposta" continuam como hoje, abaixo. O laranja fica nos ícones de seção, nos horários e nos dois marcadores principais; o botão "Vou" segue sendo a única ação em laranja cheio. O `DESIGN.md` ganha esses componentes quando forem construídos. O cartão do passeio no Início passa a mostrar distância e dificuldade, sem mapa.

**Passeios já publicados.** Não são reescritos. O ponto de encontro de hoje passa a ser a primeira parada, em texto, sem coordenadas; o percurso segue como título. Ficam sem ficha, mapa e recomendações até um administrador editar; a exigência de distância, piso e dificuldade vale para publicar um passeio novo e para a primeira vez que um antigo ganha roteiro, não para abrir um antigo.

**Rota como template.** Retirado pelo usuário em 2026-11-23: o grupo não vai salvar a rota de um passeio para reutilizar. As histórias 43 a 46, a menção na Solução e o item de teste "Templates de rota" não valem mais; o texto a seguir fica como registro do que foi decidido antes. Na página do passeio no painel, "Salvar rota como template" guarda, com um nome: título, descrição, paradas sem horários, ficha, traçado (ou GPX), recomendações, observação e plano B. Não guarda data, horários, foto, respostas nem galeria. Publicar a partir de um template preenche o formulário com uma cópia; passeio e template evoluem separados, como no vestuário. O painel lista os templates de rota, com renomear e apagar; não há tela para criar um do zero.

**Galeria.** Abre quando passa o horário de saída de um passeio não cancelado. Enviam os riders com presença válida naquele passeio (regra da spec de perfis, terceira edição) e os administradores. Toda foto entra como pendente e só aparece para os demais depois de aprovada por um administrador; quem enviou vê as suas pendentes e pode apagá-las; foto recusada é apagada. Limites: dez por rider e cento e cinquenta por passeio, contando pendentes e aprovadas; reduzidas no envio para lado maior de 2.000 pixels. Administrador apaga qualquer foto. Cada foto guarda quem enviou e quando, e mostra o nome exibido de quem enviou. As fotos ficam no mesmo armazenamento das demais (Cloudflare R2, bucket privado) e só são entregues a riders aprovados. O usuário preferiu aprovação prévia a publicação direta, aceitando que as fotos demorem a aparecer; como a plataforma não avisa ninguém, o único sinal para os administradores é o contador de pendentes na aba Passeios do painel.

**Agenda.** "Adicionar à agenda" baixa um arquivo .ics com o título, início no horário de encontro (ou de saída, sem encontro), fim na previsão de retorno, local do encontro, e na descrição a distância e o endereço da página do passeio. É um arquivo avulso: mudanças no passeio não chegam à agenda de quem já baixou. Não aparece em passeio cancelado.

**Resumo de divulgação.** O texto copiado para o WhatsApp passa a incluir horário de encontro, distância e tempo de rolé quando existem. Não inclui recomendações.

**Quem vê e quem faz.** Roteiro, ficha, mapa, clima, recomendações e galeria aprovada são vistos por riders aprovados; nada disso é público. Só administradores publicam, editam, aprovam fotos e mexem em templates. As regras valem no servidor.

**Consistência.** Salvar um passeio grava roteiro, ficha e recomendações de uma vez ou não grava nada. O limite de fotos vale também para envios simultâneos.

## Decisões de teste

Um bom teste exercita os serviços pela interface pública, contra o PostgreSQL de teste, e verifica o que o chamador observa. Os serviços externos (rota, busca de lugares, clima) entram por uma interface com um substituto de teste, como já acontece com o armazenamento de fotos.

- **Seam principal: o serviço de passeios**, estendido. Publicar com roteiro e ficha; recusas (sem distância, piso ou dificuldade; primeira parada que não é encontro; mais de vinte paradas; encontro depois da saída; recomendação fora da lista); edição; passeio antigo abrindo sem roteiro e ganhando roteiro depois.
- **Rota**: com o substituto, salvar guarda traçado, distância e tempo; mudar paradas recalcula; valor digitado prevalece; falha do serviço não impede publicar com distância digitada.
- **GPX**: funções puras de leitura e simplificação, com arquivos de exemplo válidos, vazios, grandes demais e malformados; a distância calculada confere com um traçado conhecido.
- **Recomendações**: guardar e ler a seleção; ordem da lista; item retirado da lista some sem erro; observação livre.
- **Links de abertura**: função pura que monta o endereço do Google Maps respeitando o limite de paradas, e o de um ponto.
- **Clima**: com o substituto e a data injetada, janela de sete dias, reuso do valor guardado, ausência de coordenadas e falha do serviço.
- **Templates de rota**: independência entre template e passeio nas duas direções, o que é e o que não é copiado. Arte anterior: testes de templates de vestuário.
- **Galeria**: quem pode enviar; antes do horário de saída; pendente invisível para os outros; aprovar, recusar, apagar; limites por rider e por passeio, inclusive em envios simultâneos; contador de pendentes; entrega negada a quem não está aprovado. Arte anterior: testes de foto de perfil.
- **Agenda**: função pura que gera o .ics, conferida campo a campo.
- **Resumo de divulgação**: os testes existentes ganham os campos novos.
- **Tela**: publicar um passeio com paradas buscadas, conferir a página no celular e no desktop contra o protótipo aprovado, abrir os links externos, enviar e aprovar foto, salvar e usar template; com o serviço de mapa real ligado ao menos uma vez antes de aceitar.

## Fora do escopo

Destaque do traçado por tipo de via ou piso. Rastreamento ao vivo do grupo e navegação curva a curva. Perfil de altimetria. Ler rota de um link colado do Google Maps. Limite de vagas e cobrança por passeio. Comparar a dificuldade com a experiência do rider ou impedir resposta. Rider confirmar que leu as recomendações. Administradores enviarem imagem própria como ícone de recomendação. Avisos por e-mail, WhatsApp ou notificação (inclusive de foto pendente e de mudança no passeio). Agenda que se atualiza sozinha. Comentários e reações nas fotos; vídeos; baixar a galeria inteira. Publicação direta de fotos sem aprovação. Criar template de rota do zero. Previsão do tempo por hora ou ao longo da rota.

## Notas

**Suposições a confirmar com o usuário.** A lista de recomendações acima. Limites: vinte paradas, 140 caracteres na observação da parada, 500 na descrição, 280 no plano B, 200 na observação do "Leve com você", GPX de 5 MB. Horário de encontro opcional. Tempo de rolé sem contar as paradas. Foto recusada é apagada. Pendentes contam no limite de fotos. Previsão guardada por três horas. Cartão do Início com distância e dificuldade. Template guarda também recomendações e plano B. Resumo de divulgação com os campos novos.

**A confirmar antes de implementar.** Plano e custo da Stadia Maps para o grupo; contratação do Cloudflare R2 (hoje as fotos ficam em disco local); criação das contas, que é do usuário.

**Ordem.** O usuário quer perfil e motos implementados antes dos passeios. A galeria e os selos dependem da presença válida, definida na terceira edição da spec de perfis.

**Atualização de 2026-11-23.** Especificado em `docs/specs/vestuario-passeios-e-perfil.md` e implementado. Existe a tela Passeios (`/passeios`), com os passeios em campanha e os realizados; o cartão de realizado mostra distância, duração, quem foi e o número de fotos. Na página do passeio, as listas "Vão", "Não vão" e "Sem resposta" deixaram de ser listas de nomes: antes da saída são três fileiras de avatares em "Respostas do grupo", e depois da saída dão lugar a "Quem foi". A ficha ganhou "Duração", da saída ao retorno previsto, ao lado do "Tempo de rolé"; a plataforma não mede o tempo real. As fotos aprovadas que um rider enviou às galerias aparecem também no perfil dele. O link de voltar de um passeio realizado leva a Passeios.

**GPX, implementado em 2026-11-23 (ticket 09).** O formulário do passeio tem "Traçado no mapa", com o arquivo GPX opcional. O servidor lê trilha (ou rota, se não houver trilha), junta trechos e trilhas na ordem do arquivo, simplifica para até 5.000 pontos a partir de uma tolerância de cerca de um metro e guarda o traçado numa coluna do passeio. Com o arquivo: o mapa desenha o traçado sem pedir rota ao provedor, os marcadores continuam vindo das paradas, e a distância é a do arquivo, com o campo travado na edição. O tempo de rolé não vem do arquivo. Marcar "Remover o arquivo GPX" volta à rota calculada e destrava a distância. Arquivo inválido, vazio ou acima de 5 MB é recusado sem alterar o passeio. Falta testar com um arquivo exportado de um aparelho de verdade.

**Previsão do tempo, implementada em 2026-11-24 (ticket 10).** O bloco "Tempo no dia" fica na coluna lateral, acima do plano B, com um cartão por ponto: ícone e nome do céu, lugar, hora, chance de chuva e temperatura, mais o crédito ao Open-Meteo. Decisões tomadas na implementação: o valor fica guardado na memória do servidor por três horas, e uma falha por dez minutos; pede-se a hora cheia mais próxima; o destino sem horário, ou com horário que não vem depois da saída, fica sem previsão; a previsão some na hora da saída, não ao fim do passeio; a janela de sete dias conta do horário de saída, não da data.

**Rota como template, retirado em 2026-11-23 (ticket 11 cancelado).** Não haverá template de rota. Os templates que existem na plataforma são só os de vestuário.

**Abrir fora, implementado em 2026-11-23 (ticket 08).** "Abrir no Google Maps" fica abaixo do mapa e leva encontro, destino e até nove paradas no caminho, em modo de duas rodas; além disso, a página avisa que o link leva parte do roteiro. Cada parada com coordenadas tem dois links, "Abrir no mapa" (Google Maps) e "Abrir no Waze", no lugar do link único previsto acima: um endereço só não abre o seletor de aplicativos no iPhone nem no desktop. O link antigo de mapa passou a se chamar "Abrir link do mapa". Falta conferir num celular real.

**Primeiro passo sugerido.** Colocar o mapa real de pé com uma rota Rio–Petrópolis antes de construir o resto: a escolha do provedor veio de documentação, não de teste.
