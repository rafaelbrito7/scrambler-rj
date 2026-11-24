# Scrambler RJ — perfis dos riders

> Nomenclatura (2026-11-17): “lote” passou a se chamar “campanha de vestuário” (seção “Vestuário”) e “receita” passou a “template”. O texto abaixo guarda os termos da época; a interface usa os novos.

Complementa `docs/specs/mvp-scrambler-rj.md`. Decisões do usuário em 2026-11-17: cada pessoa tem "Meu perfil" e os riders aprovados veem os perfis do grupo; entram foto e apelido, mais dados da moto, tamanho de roupa, dados de emergência e, por pedido posterior no mesmo dia, o Instagram; um rider vê do outro nome, foto, moto e Instagram.

## Problema

Hoje a plataforma só guarda o que a pessoa escreveu no pedido de ingresso: nome, WhatsApp, modelo e cilindrada de uma moto. Depois de aprovada, ela não consegue corrigir nada, nem trocar de moto, nem ter duas. Ninguém vê quem são os outros riders: nas listas de pedidos e de presença aparece só um nome. A cada lote a pessoa procura de novo o próprio tamanho. E num passeio, se alguém se machuca, o administrador não tem na plataforma a quem ligar.

## Solução

Cada rider aprovado tem um perfil. Em "Meu perfil" ele mantém os próprios dados: foto, nome e apelido, Instagram, WhatsApp, as motos que tem, o tamanho de roupa e os dados de emergência. Uma tela "Riders" mostra a todos os aprovados quem participa, com nome, foto e moto de cada um, e leva ao perfil de cada pessoa, onde também aparece o Instagram de quem informou. Os administradores veem a ficha completa, com WhatsApp e dados de emergência. O tamanho de roupa aparece sugerido na hora de pedir uma peça. Nas listas de pedidos e de presença, cada nome passa a levar ao perfil da pessoa.

## Histórias de usuário

1. Como rider aprovado, quero abrir "Meu perfil" pelo menu, para ver os dados que o grupo tem de mim.
2. Como rider, quero corrigir meu nome, para aparecer certo nas listas.
3. Como rider, quero informar um apelido, para ser reconhecido pelo nome que o grupo usa.
4. Como rider, quero enviar uma foto minha, para as pessoas me reconhecerem.
5. Como rider que não enviou foto, quero que apareça a foto da minha conta Google ou minhas iniciais, para o perfil não ficar vazio.
6. Como rider, quero trocar ou remover minha foto, para manter o perfil atual.
7. Como rider, quero atualizar meu WhatsApp, para os administradores conseguirem falar comigo.
8. Como rider, quero ter certeza de que meu WhatsApp só é visto por administradores, para não expor meu número.
9. Como rider, quero corrigir o modelo e a cilindrada da minha moto, para o perfil refletir a moto que tenho.
10. Como rider, quero informar ano e cor da moto, para descrevê-la melhor.
11. Como rider com mais de uma Scrambler, quero cadastrar todas, para o grupo saber com qual posso aparecer.
12. Como rider, quero escolher qual moto é a principal, para ela aparecer primeiro e nas listas.
13. Como rider, quero remover uma moto que vendi, para o perfil não mostrar moto que não tenho mais.
14. Como rider, quero ser impedido de ficar sem nenhuma moto no perfil, porque o grupo é de quem tem Scrambler.
15. Como rider, quero guardar meu tamanho de roupa, para não ter que lembrar a cada lote.
16. Como rider, quero ver meu tamanho destacado ao pedir uma peça, para escolher mais rápido.
17. Como rider, quero pedir um tamanho diferente do guardado, porque posso estar comprando para outra pessoa.
18. Como rider, quero informar um contato de emergência com nome e telefone, para o grupo saber a quem avisar num passeio.
19. Como rider, quero informar meu tipo sanguíneo, para ajudar num atendimento.
20. Como rider, quero deixar os dados de emergência em branco, porque fornecê-los é escolha minha.
21. Como rider, quero apagar meus dados de emergência quando quiser, para controlar um dado sensível.
22. Como rider, quero ler quem vê cada dado antes de preencher, para decidir o que informar.
23. Como rider, quero ser avisado quando o perfil for salvo, para saber que a mudança valeu.
24. Como rider, quero ver o que está errado quando um campo não é aceito, para corrigir sem perder o resto.
25. Como rider aprovado, quero abrir "Riders", para ver quem participa.
26. Como rider, quero ver na lista o nome ou apelido, a foto e a moto principal de cada pessoa, para reconhecer o pessoal.
27. Como rider, quero abrir o perfil de outra pessoa, para ver as motos dela.
28. Como rider, quero tocar num nome na lista de presença de um passeio e ir ao perfil, para saber quem é.
29. Como rider, quero tocar num nome na lista de pedidos de um lote e ir ao perfil, pelo mesmo motivo.
30. Como rider, não quero ver telefone nem dado de emergência de outra pessoa, nem por link direto.
31. Como pessoa em avaliação, reprovada ou bloqueada, não quero conseguir abrir nenhum perfil nem a lista do grupo.
32. Como rider, não quero ver na lista quem está bloqueado, para a lista mostrar só quem está no grupo.
33. Como administrador, quero abrir a ficha completa de um rider, com WhatsApp e dados de emergência, para agir num imprevisto.
34. Como administrador, quero chegar à ficha a partir da tela de riders do painel, para não procurar em dois lugares.
35. Como administrador, quero ver a ficha de quem está bloqueado, porque o histórico foi preservado.
36. Como administrador, quero ligar para o contato de emergência com um toque, para não copiar número no meio de um passeio.
37. Como pessoa nova, quero que o pedido de ingresso continue pedindo só nome, WhatsApp, modelo e cilindrada, para entrar rápido. Na segunda edição, o modelo vem de uma lista (história 68).
38. Como rider recém-aprovado, quero que meu perfil já venha com o que informei no pedido, para não digitar de novo.
39. Como rider, quero ser lembrado de completar o perfil sem ser obrigado, para decidir quando fazer.
40. Como rider já aprovado antes desta mudança, quero encontrar meu perfil preenchido com os dados que eu já tinha dado.
41. Como rider, quero informar meu Instagram, para o pessoal do grupo me seguir.
42. Como rider, quero colar o endereço do perfil ou digitar só o usuário, com ou sem @, para não precisar adivinhar o formato.
43. Como rider, quero remover meu Instagram quando quiser, porque informá-lo é opcional.
44. Como rider, quero tocar no Instagram de outra pessoa e abrir o perfil dela no Instagram, para segui-la.

## Decisões de implementação

**Perfil separado do pedido de ingresso.** O pedido de ingresso é o registro do que a pessoa escreveu ao pedir para entrar e do que os administradores decidiram; ele não muda mais depois de enviado. O perfil é o registro vivo, que a pessoa edita. Ao enviar o pedido, o perfil nasce com os mesmos dados. Trade-off aceito: o nome fica gravado em dois lugares, mas a avaliação continua mostrando exatamente o que foi avaliado. Alternativa rejeitada: editar o próprio pedido de ingresso, porque apagaria a evidência da avaliação. Quem já existe ganha um perfil a partir do pedido atual, numa migração.

**Dados do perfil.** Nome (obrigatório), apelido (opcional), foto (opcional), Instagram (opcional), WhatsApp (obrigatório), tamanho de roupa (opcional, um dos tamanhos que os lotes usam), contato de emergência com nome e telefone (opcionais, mas os dois juntos) e tipo sanguíneo (opcional, entre os oito tipos ou "não sei").

**Instagram.** Guarda-se só o nome de usuário. A pessoa pode digitar o usuário, com ou sem @, ou colar o endereço do perfil; o servidor reduz tudo ao usuário e recusa o que não tem o formato de um usuário do Instagram (letras, números, ponto e sublinhado, até 30 caracteres). A plataforma não confere se a conta existe nem se é da pessoa. É exibido como @usuario e abre o perfil no Instagram em outra aba. Diferente do WhatsApp, é visível a todos os riders aprovados, porque a pessoa o informa justamente para ser encontrada; a tela diz isso antes do preenchimento.

**Motos.** Uma pessoa tem de uma a cinco motos. Cada moto tem modelo e cilindrada (obrigatórios, com as regras do pedido de ingresso), ano e cor (opcionais). Exatamente uma é a principal. Remover a principal passa o título para a mais antiga das restantes. Remover a última é recusado. O limite de cinco existe só para a tela não crescer sem controle; rever se alguém pedir.

**Como o nome aparece.** Nas telas do grupo (Início, listas de pedidos e de presença, Riders) aparece o apelido quando existe e o nome quando não. No painel e no PDF aparece o nome, seguido do apelido entre parênteses quando existe, porque são registros de gestão. Suposição a confirmar com o usuário.

**Foto.** A foto enviada usa o mesmo armazenamento das fotos de lote e de passeio. Sem foto enviada, aparece a da conta Google; sem ela, as iniciais. A foto do perfil só é entregue a quem está aprovado, como as demais.

**Quem vê o quê.** Aplicado no servidor, a cada leitura:

| Dado | A própria pessoa | Outro rider aprovado | Administrador |
|---|---|---|---|
| Nome, apelido, foto, motos, Instagram | vê e edita | vê | vê |
| Papel de administrador | vê | vê | vê |
| WhatsApp | vê e edita | não vê | vê |
| Tamanho de roupa | vê e edita | não vê | vê |
| Dados de emergência | vê e edita | não vê | vê |

O serviço devolve formas diferentes de perfil para cada caso, em vez de devolver tudo e esconder na tela: um rider nunca recebe o telefone de outro, nem numa resposta que a tela ignora.

**Dados de emergência são sensíveis.** Tipo sanguíneo é dado de saúde. São opcionais, a tela diz quem vê antes do preenchimento, e a pessoa apaga quando quiser. Não entram no PDF, no resumo de divulgação nem em nenhuma tela de rider. Administradores editando perfil alheio fica fora: só a própria pessoa muda os seus dados.

**Riders.** Lista os aprovados em ordem alfabética pelo nome exibido, com foto, nome ou apelido, moto principal e a marca de administrador. Bloqueados não aparecem para riders. Abrir o perfil de um bloqueado por link direto devolve "não encontrado" para riders e a ficha para administradores.

**Tamanho sugerido no lote.** Ao pedir uma peça, a linha do tamanho guardado no perfil vem marcada como "seu tamanho" quando o lote oferece esse tamanho. Nada é pré-preenchido: a quantidade continua zero até a pessoa escolher.

**Navegação.** O menu dos riders ganha "Grupo" e o acesso ao próprio perfil. No painel, a tela de riders leva à ficha de cada pessoa.

**Lembrete de completar o perfil.** Enquanto a pessoa não tiver foto nem tamanho, o Início mostra uma linha discreta convidando a completar o perfil, que some quando ela completa ou dispensa. Não bloqueia nada.

**Consistência.** Salvar o perfil valida tudo no servidor. Duas edições simultâneas do mesmo perfil gravam uma versão inteira, nunca metade de cada. As regras de moto principal e de última moto valem também sob pedidos simultâneos.

## Decisões de teste

Um bom teste aqui exercita o serviço pela sua interface pública, contra o PostgreSQL de teste, e verifica o que um chamador observa: o que cada tipo de pessoa recebe, o que é recusado e o que fica gravado. Não testa como o serviço monta as consultas.

- **Instagram**: os formatos aceitos (usuário, @usuário, endereço colado) viram o mesmo usuário gravado; formato inválido é recusado; o Instagram sai na forma de perfil que os outros riders recebem.
- **Seam principal: o serviço de perfis**, novo, no mesmo molde dos serviços de acesso, lotes, pedidos e passeios. Cobre: criação do perfil no envio do pedido de ingresso; edição dos próprios dados e suas validações; regras das motos (uma a cinco, uma principal, última não sai); as três formas de leitura (própria, de outro rider, de administrador) e a garantia de que telefone, tamanho e emergência não saem na forma de rider; lista do grupo sem bloqueados; recusa para quem não está aprovado; remoção dos dados de emergência.
- **Serviços existentes**: os testes de pedidos, passeios e relatório passam a verificar o nome exibido conforme a regra de apelido.
- **Migração**: um teste confirma que uma pessoa aprovada antes da mudança tem perfil com os dados do pedido.
- **Arte anterior**: os testes dos serviços de acesso, lotes, pedidos, passeios e receitas, que criam contas, aprovam e verificam erros por código.
- **Tela**: o fluxo de editar perfil, enviar foto e abrir o perfil de outra pessoa é verificado no navegador, no celular e no desktop, com conta de rider e de administrador, incluindo a tentativa de abrir por link direto o que não se pode ver.

## Fora do escopo

Administrador editar o perfil de outra pessoa. Rider escolher mostrar o WhatsApp aos outros. Outras redes além do Instagram. Mostrar publicações ou seguidores do Instagram dentro da plataforma. Conferir se a conta do Instagram existe ou pertence à pessoa. Mensagens entre riders. Histórico de alterações do perfil. Documentos da moto ou da habilitação. Exportar a lista do grupo. Excluir a própria conta pela plataforma.

Foto por moto, dados de saúde além do tipo sanguíneo e filtros na lista do grupo estavam fora na primeira edição; a segunda edição, abaixo, trata deles.

## Segunda edição — mais dados de perfil e de moto

Decisões do usuário em 2026-11-17, tomadas no mapa `docs/tickets/evolucao-perfil-motos-passeios/map.md` (tickets "Dados novos do perfil e quem vê cada um", "Dados novos da moto" e "Placa e preenchimento pela consulta"). Esta seção acrescenta ao que está acima e, onde diz diferente, prevalece. Nada daqui está implementado.

### Problema

O perfil diz quem a pessoa é e que moto tem, mas pouco além disso. Não dá para saber de que lado da cidade alguém sai, se está começando ou já anda em terra, nem quando faz aniversário. A moto é um texto digitado: "Scrambler 900", "scrambler 900cc" e "Street Scrambler" são três grafias, então não se conta quantas de cada modelo o grupo tem; e ela não tem foto nem lugar para as modificações, que são o assunto do grupo. Num imprevisto, o administrador tem um contato e o tipo sanguíneo, e mais nada.

### Solução

O perfil ganha região, experiência de pilotagem, aniversário e uma bio de uma linha, todos opcionais e visíveis aos riders, e mostra desde quando a pessoa está no grupo. O bloco de emergência ganha segundo contato, plano de saúde e alergias ou condições, vistos só pela pessoa e pelos administradores. A moto passa a ter o modelo escolhido de uma lista, foto, apelido, autonomia e uma lista de modificações. A tela Riders mostra os aniversariantes do mês.

### Histórias de usuário

45. Como rider, quero informar de que região saio, para combinar ponto de encontro com quem mora perto.
46. Como rider, quero escolher a região numa lista, sem dizer o bairro, para não expor onde moro.
47. Como rider, quero informar meu nível de pilotagem, para o grupo calibrar o ritmo dos passeios.
48. Como rider, quero informar o dia e o mês do meu aniversário, sem o ano, para o grupo lembrar da data.
49. Como rider, quero escrever uma linha sobre mim, para me apresentar a quem ainda não me conhece.
50. Como rider, quero deixar qualquer um desses dados em branco e apagá-los depois, porque são opcionais.
51. Como rider, quero ver no meu perfil desde quando estou no grupo, sem precisar informar.
52. Como rider, quero ver região, experiência, aniversário, bio e tempo de grupo no perfil de outra pessoa, para conhecê-la melhor.
53. Como rider, quero ver no topo da tela Riders quem faz aniversário no mês, para dar os parabéns.
54. Como rider que não informou aniversário, não quero aparecer na lista de aniversariantes.
55. Como rider, quero informar um segundo contato de emergência, para o grupo ter a quem recorrer se o primeiro não atender.
56. Como rider, quero informar meu plano de saúde e o número da carteirinha, para agilizar um atendimento.
57. Como rider, quero informar alergias e condições de saúde, para quem me socorrer saber o que evitar.
58. Como rider, quero ler que esses dados são vistos só por mim e pelos administradores antes de preenchê-los.
59. Como rider, quero apagar os dados novos de emergência junto com os antigos, de uma vez.
60. Como rider, não quero ver plano de saúde, alergias nem contatos de emergência de outra pessoa, nem por link direto.
61. Como administrador, quero ver na ficha do rider o segundo contato, o plano de saúde e as alergias, para agir num imprevisto.
62. Como administrador, quero ligar para o segundo contato com um toque, como já faço com o primeiro.
63. Como rider, quero escolher o modelo da minha moto numa lista, para não digitar e para ficar igual ao dos outros.
64. Como rider, quero que a cilindrada venha junto com o modelo escolhido, para não informar duas vezes.
65. Como rider com uma moto fora da lista, quero escolher "Outro" e digitar modelo e cilindrada, para não ficar de fora.
66. Como rider que já tinha moto cadastrada, quero encontrá-la no modelo certo da lista, sem refazer o cadastro.
67. Como rider cuja moto antiga não bateu com a lista, quero que ela continue aparecendo com o texto que digitei.
68. Como pessoa nova, quero escolher o modelo na mesma lista ao pedir para entrar.
69. Como rider, quero enviar uma foto de cada moto, para mostrá-la ao grupo.
70. Como rider, quero trocar ou remover a foto da moto.
71. Como rider, quero dar um apelido à moto, porque ela tem nome.
72. Como rider, quero informar a autonomia da moto em quilômetros, para ajudar a planejar abastecimento nos passeios.
73. Como rider, quero listar as modificações e acessórios da moto, um por linha, cada um numa categoria.
74. Como rider, quero editar e remover um item da lista de modificações.
75. Como rider, quero ver foto, apelido, autonomia e modificações das motos de outra pessoa, para trocar ideia sobre o que ela instalou.
76. Como rider, quero ver a foto da moto principal de cada pessoa na tela Riders, quando houver.
77. Como rider, não quero que a plataforma peça a placa da minha moto.
78. Como rider, quero que o lembrete de completar o perfil deixe de aparecer quando eu o dispensar, mesmo com dados novos em branco.

### Decisões de implementação

**Tudo novo é opcional.** Nenhum dado desta edição é exigido para entrar nem para continuar no grupo. O pedido de ingresso continua pedindo nome, WhatsApp e a moto; a única mudança nele é o modelo vir da lista.

**Região.** Uma entre: Zona Sul, Zona Norte, Zona Oeste, Centro, Niterói e região, Baixada Fluminense, outra cidade. Não há campo de bairro: a lista serve para combinar encontro e para filtro, e expõe menos do que um bairro. Alternativa rejeitada: bairro em texto livre, que não filtra e revela mais.

**Experiência.** Um entre três níveis: Começando, Estrada, Estrada e terra. É declaração da própria pessoa; ninguém confere. Serve de informação e, mais tarde, de filtro e de referência para a dificuldade de um passeio.

**Aniversário.** Dia e mês, sem ano; a plataforma não guarda nem calcula idade. Data inexistente (30 de fevereiro) é recusada; 29 de fevereiro é aceito e, em ano não bissexto, conta como aniversariante de fevereiro.

**Bio.** Uma linha de texto livre, até 140 caracteres, sem quebra de linha. Suposição a confirmar: o limite.

**No grupo desde.** É a data em que o pedido de ingresso foi aprovado. Ninguém edita. Quem já era do grupo antes da plataforma aparece com a data de aprovação; o usuário aceitou isso. Mostra-se o mês e o ano. Para quem foi reprovado e depois aprovado, vale a aprovação. Bloqueio e desbloqueio não mudam a data.

**Aniversariantes do mês.** A tela Riders mostra, acima da lista, os riders aprovados e não bloqueados que informaram aniversário no mês corrente, em ordem de dia, com o dia ao lado do nome. Sem aniversariantes, o bloco não aparece. O mês corrente é o do fuso de Brasília.

**Emergência ampliada.** O bloco de emergência passa a ter: primeiro contato (nome e telefone, como hoje), segundo contato (nome e telefone, os dois juntos), tipo sanguíneo, plano de saúde (nome do plano e número da carteirinha, o número só com o nome) e alergias e condições (texto livre, até 500 caracteres). Valem para os novos as regras dos antigos: opcionais, a tela diz quem vê antes de pedir, a pessoa apaga quando quiser, e "apagar dados de emergência" apaga todos de uma vez. Não entram no PDF, no resumo de divulgação nem em tela de rider. O segundo contato só é aceito quando existe o primeiro. Alergias e condições é o dado mais sensível da plataforma: a mesma atenção da nota de privacidade abaixo vale em dobro.

**Tamanhos extras ficam de fora.** Luva, capacete e calça não entram: hoje nenhuma campanha de vestuário os usaria. Voltam quando uma campanha precisar.

**Modelo da moto por lista.** Lista inicial, a conferir com o usuário antes de implementar: Scrambler 400 X, Scrambler 400 XC, Scrambler 900, Street Scrambler, Scrambler 1200 X, Scrambler 1200 XC, Scrambler 1200 XE, Scrambler 865. Cada modelo da lista tem sua cilindrada, que deixa de ser digitada. "Outro" abre texto livre de modelo e cilindrada, com as regras de hoje. A lista é fixa no código e a mesma no pedido de ingresso e no perfil; mudá-la é mudança de código. Alternativa rejeitada: lista editada pelos administradores no painel, que é mais uma tela para manter para uma lista que muda a cada alguns anos. **Revisto pelo usuário em 2026-11-17:** a lista de modelos vai para o banco de dados, mantida pelos administradores no painel, como as recomendações de passeio. Ticket `docs/tickets/perfis-segunda-edicao/07-modelos-de-moto-no-banco.md`; até ele ser feito, vale a lista no código. **Feito em 2026-11-24:** a lista está no banco e os administradores a mantêm em Gestão de riders, "Modelos de moto" (incluir, renomear, corrigir a cilindrada, reordenar, desativar e reativar). A moto de um modelo da lista aponta para ele, então renomear ou corrigir a cilindrada reflete nas motos que o usam; modelo desativado sai da escolha e continua nas motos que já o têm; nenhum é apagado. A migração criou os oito modelos e ligou a eles as motos de mesmo nome e mesma cilindrada, sem mudar nenhuma. O pedido de ingresso já enviado não é reescrito.

**Motos já cadastradas.** Na migração, cada moto cujo texto corresponde sem ambiguidade a um modelo da lista (ignorando maiúsculas, espaços, "cc" e a palavra "Triumph") passa para esse modelo. As demais viram "Outro" com o texto e a cilindrada preservados, e a pessoa pode corrigir depois. Nenhuma moto é apagada nem muda de dono ou de principal. O pedido de ingresso já enviado não é reescrito.

**Foto da moto.** Uma por moto, opcional, com as mesmas regras de envio, troca e remoção da foto de perfil, e entregue só a riders aprovados. Remover a moto remove a foto. O armazenamento é o mesmo das demais fotos (Cloudflare R2, decisão registrada em `issues/03-hospedagem.md`).

**Apelido e autonomia.** Apelido da moto: texto curto, até 40 caracteres. Autonomia: quilômetros com um tanque, número inteiro entre 50 e 1.000. Suposições a confirmar: os limites.

**Modificações e acessórios.** Cada moto tem uma lista de itens. Cada item tem categoria (escape, bagagem, pneus, proteção, iluminação, outro) e descrição em texto, até 80 caracteres. Até vinte itens por moto. A ordem é a de categoria e, dentro dela, a de cadastro. Remover a moto remove os itens. O usuário preferiu itens por categoria a um campo de texto livre, aceitando mais trabalho de preenchimento em troca de uma lista legível e pesquisável depois. Suposições a confirmar: limite de vinte itens e de 80 caracteres.

**Sem placa.** A plataforma não pede nem guarda placa. O usuário queria usá-la para buscar os dados do veículo; a pesquisa (`docs/research/consulta-de-veiculo-por-placa.md`) mostrou que a via oficial exige empresa credenciada e que as APIs comerciais não dizem a origem do dado, e ele decidiu não consultar. Sem a consulta, a placa não tem uso. Reabrir se surgir serviço oficial acessível.

**Quem vê o quê.** A tabela passa a ser:

| Dado | A própria pessoa | Outro rider aprovado | Administrador |
|---|---|---|---|
| Nome, apelido, foto, Instagram | vê e edita | vê | vê |
| Região, experiência, aniversário, bio | vê e edita | vê | vê |
| No grupo desde | vê | vê | vê |
| Motos: modelo, cilindrada, ano, cor, foto, apelido, autonomia, modificações | vê e edita | vê | vê |
| Papel de administrador | vê | vê | vê |
| WhatsApp | vê e edita | não vê | vê |
| Tamanho de roupa | vê e edita | não vê | vê |
| Emergência: contatos, tipo sanguíneo, plano de saúde, alergias e condições | vê e edita | não vê | vê |

Continua valendo que o serviço devolve formas diferentes para cada leitor. Com esta edição, o AGENTS.md deve passar a dizer que um rider vê de outro também região, experiência, aniversário, bio e tempo de grupo.

**Lembrete de completar o perfil.** Continua aparecendo só enquanto faltam foto e tamanho, como hoje. Os dados novos não o reativam para quem já completou ou dispensou. Suposição a confirmar.

**Telas.** "Meu perfil" e o perfil de outra pessoa ganham os dados novos; a edição do perfil ganha os campos, com região e experiência como conjuntos de opções; o formulário de moto ganha a lista de modelos, a foto, o apelido, a autonomia e a lista de modificações; a ficha do administrador ganha os dados novos de emergência. O desenho dessas telas é feito antes de implementar, seguindo o `DESIGN.md`.

### Decisões de teste

Mesma régua da primeira edição: pelo serviço de perfis, contra o PostgreSQL de teste, observando o que cada leitor recebe.

- **Visibilidade**: outro rider recebe região, experiência, aniversário, bio, tempo de grupo e os dados novos da moto, e não recebe segundo contato, plano de saúde nem alergias; o administrador recebe tudo; quem não está aprovado não recebe nada.
- **Validações**: região e experiência fora da lista, aniversário inexistente, bio acima do limite, segundo contato sem o primeiro ou pela metade, carteirinha sem plano, autonomia fora da faixa, item de modificação sem categoria ou acima dos limites.
- **Apagar emergência**: uma ação apaga os dados antigos e os novos.
- **Aniversariantes**: só aprovados e não bloqueados, só do mês corrente, em ordem de dia; virada de mês e 29 de fevereiro, com a data atual injetada no serviço.
- **No grupo desde**: vem da aprovação, inclusive para quem foi reprovado antes; não muda com bloqueio.
- **Modelo por lista**: modelo da lista traz a cilindrada; "Outro" exige modelo e cilindrada; o pedido de ingresso aceita as duas formas.
- **Migração**: uma função pura recebe o texto antigo e devolve o modelo da lista ou "Outro"; testada com as grafias reais do banco de desenvolvimento e com casos ambíguos, que devem cair em "Outro".
- **Foto da moto**: enviar, trocar, remover; some ao remover a moto; não é entregue a quem não está aprovado.
- **Tela**: editar os dados novos, cadastrar moto pela lista e por "Outro", incluir modificações e abrir o perfil de outra pessoa, no celular e no desktop, com conta de rider e de administrador.

### Fora do escopo desta edição

Placa e consulta de veículo por placa. Bairro. Idade ou ano de nascimento. Tamanhos de luva, capacete e calça. Lista de modelos editável pelo painel. Mais de uma foto por moto. Lembretes de revisão e de seguro (não existe canal de aviso). Aviso de aniversário fora da tela Riders. Administrador corrigir a data de entrada no grupo.

### Pendente no mapa

Nada: filtros, histórico e contagem de passeios foram decididos e estão na terceira edição, abaixo.

## Terceira edição — riders, histórico de passeios, selos e sequência

Decisões do usuário em 2026-11-17, no ticket "Lista de riders, filtros e histórico" do mapa `docs/tickets/evolucao-perfil-motos-passeios/map.md`. Selos de nível e sequência foram ideias do próprio usuário. Depende da segunda edição (região, experiência e modelo por lista). Em 2026-11-23 foi implementada a parte do perfil (histórias 87 a 91, 93 a 97 e 101); a correção de presença (98 a 100) já existia. Continuam por fazer a busca e os filtros da tela Riders (79 a 86 e 102) e o selo ao lado do nome nela (92).

### Problema

A tela Riders é uma lista em ordem alfabética: com o grupo crescendo, achar quem tem o mesmo modelo ou sai da mesma região exige ler tudo. E o perfil não diz nada sobre a participação da pessoa: quem vai a todo passeio e quem acabou de entrar aparecem iguais.

### Solução

A tela Riders ganha busca por nome e filtros por modelo, região e experiência. O perfil passa a mostrar quantos passeios a pessoa fez com o grupo, os mais recentes, um selo de nível que evolui com esse número e a sequência de meses seguidos com passeio. O administrador ajusta, depois de cada passeio, quem de fato foi.

### Histórias de usuário

79. Como rider, quero buscar alguém pelo nome ou apelido na tela Riders, para achar a pessoa sem rolar a lista.
80. Como rider, quero filtrar a lista por modelo de moto, para ver quem tem a mesma que eu.
81. Como rider, quero ver quantos riders há em cada modelo, para saber a composição do grupo.
82. Como rider, quero filtrar por região, para ver quem sai de perto de mim.
83. Como rider, quero filtrar por experiência, para achar companhia do meu nível.
84. Como rider, quero combinar filtros e limpá-los com um toque.
85. Como rider, quero que um filtro sem resultado diga isso claramente, em vez de mostrar uma tela vazia.
86. Como rider, quero mandar o link da lista já filtrada para alguém do grupo.
87. Como rider, quero ver no meu perfil quantos passeios fiz com o grupo.
88. Como rider, quero ver os meus cinco passeios mais recentes e abrir cada um.
89. Como rider, quero ver o número e os passeios recentes no perfil de outra pessoa, para saber quem costuma ir.
90. Como rider, quero ganhar um selo ao fazer meu primeiro passeio e vê-lo mudar conforme faço mais.
91. Como rider, quero ver quantos passeios faltam para o próximo selo.
92. Como rider, quero ver o selo de cada pessoa ao lado do nome na tela Riders.
93. Como rider que ainda não fez passeio, não quero um selo de "zero" no meu perfil.
94. Como rider, quero ver há quantos meses seguidos faço ao menos um passeio, para ter vontade de manter.
95. Como rider, quero que um mês em que o grupo não fez passeio não quebre minha sequência.
96. Como rider, quero ver meu recorde de sequência mesmo depois de ela zerar.
97. Como rider que respondeu "Vou" e foi, quero que o passeio conte sozinho, sem depender de ninguém marcar.
98. Como administrador, quero tirar da contagem quem respondeu "Vou" e não apareceu, para o histórico ser fiel.
99. Como administrador, quero incluir quem foi sem ter respondido, para a pessoa não perder o passeio.
100. Como administrador, quero fazer essa correção na própria página do passeio, depois da data.
101. Como rider, quero que passeio cancelado não conte nem atrapalhe minha sequência.
102. Como pessoa bloqueada, não quero aparecer nos filtros nem na contagem por modelo.

### Decisões de implementação

**Passeio feito.** Um rider fez um passeio quando: o passeio não foi cancelado, a data de saída já passou, e a presença dele vale. A presença vale por padrão para quem respondeu "Vou" e não vale para os demais; o administrador pode inverter cada caso, pessoa por pessoa, depois da data. A correção fica registrada com autor e data, como as demais ações de administrador. Alternativas rejeitadas: contar só o "Vou", que premia quem confirma e falta; exigir marcação do administrador para todos, que zera a contagem de um passeio enquanto ninguém marca. Trade-off aceito: sem correção, quem faltou conta.

**Nada é guardado como total.** Número de passeios, selo, sequência e recorde são calculados das presenças a cada leitura. Corrigir uma presença muda tudo de uma vez, e não existe contador para ficar errado. Revisitar se a leitura da tela Riders ficar lenta.

**Passeios antigos.** Os passeios já realizados antes desta edição contam pela mesma regra, com as respostas que têm.

**Selos de nível.** Marcos e nomes: 1 passeio, Primeira saída; 5, Pegou estrada; 10, Rodado; 25, Estradeiro; 50, Lenda da serra. Vale o maior marco atingido. Sem passeio, sem selo. O selo desce se uma correção reduzir o número. Os nomes foram escolhidos para não soar como patente: selo de nível descreve estrada rodada, não posição no grupo, e não dá permissão nenhuma. Não usar brasão, escudo, divisa, faixa nem palavra de hierarquia no desenho do selo; ele segue os selos do `DESIGN.md`, sempre com a palavra escrita.

**Sequência.** Conta meses seguidos, no calendário de Brasília, em que a pessoa fez ao menos um passeio. Mês em que o grupo não teve nenhum passeio realizado é ignorado: não soma e não zera. Mês em que houve passeio e a pessoa não fez nenhum zera. O mês corrente não zera a sequência enquanto não terminar. O recorde é a maior sequência que a pessoa já teve. O perfil mostra a sequência atual quando é de dois meses ou mais, e o recorde quando é maior que a atual. Suposição a confirmar: esconder sequência de um mês.

**Histórico no perfil.** Número de passeios feitos e os cinco mais recentes, com percurso e data, cada um levando à página do passeio. Visto por todos os riders aprovados: a lista de presença de cada passeio já é visível a eles, e o histórico só reúne o que já se vê.

**Filtros da tela Riders.** Busca por nome ou apelido, ignorando acentos e maiúsculas. Filtros por modelo de moto (qualquer moto da pessoa, não só a principal), região e experiência; dentro de um filtro vale uma opção por vez, e filtros diferentes se somam. Cada modelo mostra a quantidade de riders. Quem não informou região ou experiência só aparece sem esse filtro. Motos em "Outro" ficam juntas numa opção "Outros modelos". Os filtros ficam no endereço da página, para o link poder ser compartilhado. Filtrar e contar acontecem no servidor, sobre aprovados e não bloqueados. No celular os filtros não podem ocupar a tela antes da lista: o desenho é feito antes de implementar.

**Quem vê o quê.** Somam-se à tabela da segunda edição, vistos pela própria pessoa, pelos outros riders e pelos administradores: passeios feitos, passeios recentes, selo de nível, sequência e recorde. Só administradores corrigem presença.

### Decisões de teste

Pelos serviços de passeios e de perfis, contra o PostgreSQL de teste, com a data atual injetada.

- **Passeio feito**: "Vou" conta depois da data; "Não vou" e sem resposta não contam; passeio futuro e cancelado não contam; correção do administrador nos dois sentidos; rider não corrige; a correção guarda autor e data.
- **Selos**: os limites exatos de cada marco (0, 1, 4, 5, 9, 10, 24, 25, 49, 50) e a descida após correção.
- **Sequência**: meses seguidos; mês sem passeio do grupo ignorado; mês com passeio e sem presença zera; mês corrente em aberto; virada de ano; recorde preservado depois de zerar.
- **Filtros**: cada filtro, a soma deles, busca sem acento, moto não principal, "Outros modelos", contagem por modelo, e bloqueados fora de tudo.
- **Visibilidade**: outro rider recebe histórico, selo e sequência; quem não está aprovado não recebe nada.
- **Tela**: filtrar no celular e no desktop, abrir link filtrado, corrigir presença como administrador e conferir o selo mudar.

### Fora do escopo desta edição

Ranking ou classificação entre riders. Selos por outros motivos (quilômetros, tempo de grupo, vestuário). Avisar a pessoa quando ela ganha um selo. Sequência por passeios seguidos. Rider contestar a própria presença pela plataforma. Exportar a lista filtrada.

## Notas

**Suposições a confirmar.** Apelido substitui o nome nas telas do grupo, e painel e PDF usam o nome. Limite de cinco motos. Administradores não editam perfis alheios. Lembrete de completar o perfil no Início.

**Impacto no que já existe.** As listas de pedidos, presença e riders passam a ler o nome do perfil. A tela de avaliações continua lendo o pedido de ingresso. O pedido de ingresso não muda para quem preenche.

**Privacidade.** Com dado de saúde na plataforma, a escolha de hospedagem e de quem tem acesso ao banco passa a pesar mais. Registrar na decisão de hospedagem (`issues/03-hospedagem.md`).

**Atualização de 2026-11-23.** Especificado em `docs/specs/vestuario-passeios-e-perfil.md` e implementado. O perfil, próprio e visto por outro rider, foi redesenhado: cabeçalho com avatar grande, selo de nível e o Instagram como botão com o logo (história 44); o bloco "Estrada com o grupo", com passeios feitos, sequência, recorde, o que falta para o próximo selo, os cinco passeios recentes e as doze fotos mais recentes que a pessoa publicou nas galerias; a moto principal em destaque, com foto grande e ficha, e as demais em grade. A suposição de esconder a sequência de um mês foi mantida. Nada mudou em quem vê o quê: as fotos de galeria já eram vistas pelos riders, e os dados privados seguem no bloco que diz quem vê. Fora do perfil, as contagens de pessoas viraram fileiras de avatares que mostram nome do grupo, foto e Instagram, os mesmos dados que um rider já via de outro.

**Estado do código em 2026-11-17.** Os oito tickets de `docs/tickets/perfis/` estão implementados: perfil criado no envio do pedido de ingresso e migração de quem já existia; edição de nome, apelido, Instagram, WhatsApp e tamanho; foto com reserva na conta Google e nas iniciais; de uma a cinco motos com uma principal; dados de emergência opcionais e apagáveis; "Riders" e perfil de outra pessoa; ficha completa para administradores; tamanho sugerido no pedido e lembrete dispensável no Início. As quatro suposições foram implementadas como escritas. Decisões tomadas na implementação: a moto principal é um vínculo obrigatório do perfil com uma das motos, garantido pelo banco; a ficha do administrador é a mesma página do perfil, e o servidor decide o que entregar pela conta logada; a foto sobe sem redimensionar.
