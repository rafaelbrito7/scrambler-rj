# Protótipo da página do passeio

Type: prototype
Status: resolved
Parent: [Mapa — evolução de perfil, motos e passeios](../map.md)
Blocked by: 04, 05

## Question

Como a página do passeio e o cartão no Início devem mostrar roteiro, ficha e mapa no celular e no desktop, e como fica o formulário de publicação com paradas?

## Protótipo (2026-11-17)

Rota descartável `/passeios/prototipo?variant=A|B|C` (`src/app/passeios/prototipo/`), só fora de produção, com dados fictícios, ações sem efeito e mapa desenhado à mão. Três variantes: A, linha do tempo; B, mapa primeiro; C, abas. O formulário de publicação com paradas não foi prototipado. Aguardando a escolha do usuário; apagar a pasta depois de registrar a resposta (o projeto não é repositório git, então não há branch para guardá-la).

## Answer

Aprovada pelo usuário em 2026-11-17 a **variante A (linha do tempo)**, depois de refeita com identidade por seção: título com ícone e fio em cada bloco, ficha em quadros com ícone, marcador da parada com o ícone do tipo, clima com ícone e temperatura, "Leve com você" em itens com ícone, resposta "Vou / Não vou" no começo da página no celular. O mapa do protótipo é ilustração; o real é MapLibre com Stadia.

- Consequência: "Leve com você" deixa de ser texto livre e passa a ser uma seleção, feita pelo administrador, numa lista pronta de recomendações (pedido do usuário). Isso substitui a suposição registrada em "Roteiro e ficha do passeio".
- O formulário de publicação com paradas não foi prototipado; fica para o desenho antes da implementação.
- O protótipo foi mantido em `src/app/passeios/prototipo/` como referência visual, por não haver repositório git onde guardá-lo; só responde fora de produção. Apagar quando a página real estiver construída.
- Detalhe em `docs/specs/passeios-roteiro-e-mapa.md`.
