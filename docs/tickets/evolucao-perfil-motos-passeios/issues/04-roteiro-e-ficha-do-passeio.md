# Roteiro e ficha do passeio

Type: grilling
Status: resolved
Parent: [Mapa — evolução de perfil, motos e passeios](../map.md)
Blocked by: none

## Question

Como o administrador descreve um passeio: quais tipos de parada existem, o que cada parada guarda (nome, endereço, horário, observação), como ficam encontro e saída separados, e quais campos compõem a ficha (distância, duração, piso, dificuldade, pedágios, custo, requisitos, líder, ferrolho, plano B)? O que é obrigatório para publicar e o que acontece com os passeios já publicados?

## Answer

Decidido com o usuário em 2026-11-17.

- **Roteiro**: paradas em ordem. Cada parada tem tipo (encontro, abastecimento, café ou refeição, mirante ou foto, destino, retorno), nome, local (endereço ou link), horário previsto e observação curta. Só tipo e nome são obrigatórios.
- **Ficha da rota**, obrigatórios para publicar: distância total (km), tipo de piso (asfalto, terra, misto) e dificuldade (leve, moderado, exigente). Opcionais: duração estimada, pedágios e custo estimado, requisitos, líder, ferrolho, plano B para chuva.
- **Líder e ferrolho**: o administrador escolhe na lista de riders; aparecem com foto na página do passeio e podem ser trocados até o dia.
- **Passeios já publicados**: continuam como estão. O texto do percurso vira a descrição, o ponto de encontro vira a primeira parada; ficam sem ficha até alguém editar.
- Suposições minhas, a confirmar na spec: horário de encontro e de saída são dois campos do passeio (o de saída é o atual); requisitos e plano B são texto livre; a descrição em texto continua existindo ao lado do roteiro; a dificuldade só informa, não impede a resposta "Vou".
- Se a distância é digitada ou calculada fica para "Mapa na página do passeio".
