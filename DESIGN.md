---
name: Scrambler RJ
description: Plataforma do Scrambler RJ, grupo de quem tem Triumph Scrambler no Rio de Janeiro, para campanhas de vestuário, passeios e perfis dos riders.
colors:
  ember: "#d4551f"
  ember-hot: "#ea6a2e"
  asphalt: "#0c0b0a"
  asphalt-raised: "#171513"
  cream: "#f0dfbd"
  cream-dim: "#b8a98b"
  alert: "#ff8f6b"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 8vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "0.005em"
    fontVariation: "'wdth' 62"
  display-shell:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 6vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "0.005em"
    fontVariation: "'wdth' 62"
  display-card:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "0.005em"
    fontVariation: "'wdth' 62"
  intro-name:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 5vmin, 2.75rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 62"
  figure:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
  body-strong:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
    fontVariation: "'wdth' 75"
  label-badge:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
    fontVariation: "'wdth' 75"
rounded:
  control: "2px"
  full: "9999px"
spacing:
  stack-sm: "0.5rem"
  card-gap: "1rem"
  card-grid-gap: "1.25rem"
  gutter: "1.25rem"
  gutter-shell: "1rem"
  gutter-shell-lg: "1.5rem"
  field-gap: "1.5rem"
  card-pad: "1.25rem"
  block: "2rem"
  section: "2.5rem"
  section-lg: "3.5rem"
  touch: "2.75rem"
  control: "3rem"
  row: "3.5rem"
  gate-width: "28rem"
  form-width: "42rem"
  shell-width: "56rem"
components:
  button-default:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.asphalt}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "{spacing.control}"
  button-default-hover:
    backgroundColor: "{colors.ember-hot}"
    textColor: "{colors.asphalt}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "{spacing.control}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    height: "{spacing.touch}"
  button-ghost-hover:
    textColor: "{colors.ember-hot}"
  button-destructive:
    backgroundColor: "color-mix(in oklab, #ff8f6b 10%, transparent)"
    textColor: "{colors.alert}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "{spacing.control}"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 0.75rem"
    height: "{spacing.control}"
  option-chip:
    backgroundColor: "transparent"
    textColor: "{colors.cream-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "{spacing.control}"
  option-chip-selected:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.asphalt}"
  badge-settled:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.asphalt}"
    typography: "{typography.label-badge}"
    rounded: "{rounded.control}"
    padding: "0.25rem 0.5rem"
  badge-attention:
    backgroundColor: "color-mix(in oklab, #d4551f 15%, transparent)"
    textColor: "{colors.ember-hot}"
    typography: "{typography.label-badge}"
    rounded: "{rounded.control}"
    padding: "0.25rem 0.5rem"
  badge-neutral:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.label-badge}"
    rounded: "{rounded.control}"
    padding: "0.25rem 0.5rem"
  badge-problem:
    backgroundColor: "color-mix(in oklab, #ff8f6b 10%, transparent)"
    textColor: "{colors.alert}"
    typography: "{typography.label-badge}"
    rounded: "{rounded.control}"
    padding: "0.25rem 0.5rem"
  notice-status:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.asphalt}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
  notice-error:
    backgroundColor: "transparent"
    textColor: "{colors.alert}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
  card:
    backgroundColor: "{colors.asphalt-raised}"
    textColor: "{colors.cream}"
    rounded: "{rounded.control}"
    padding: "{spacing.card-pad}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.cream-dim}"
    typography: "{typography.label}"
    height: "{spacing.touch}"
  nav-link-current:
    textColor: "{colors.cream}"
  panel-tab:
    backgroundColor: "transparent"
    textColor: "{colors.cream-dim}"
    typography: "{typography.label}"
    height: "{spacing.control}"
  panel-tab-current:
    textColor: "{colors.cream}"
  pending-count:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.asphalt}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.125rem 0.375rem"
  avatar-initials:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.asphalt}"
    rounded: "{rounded.full}"
    size: "3.5rem"
  avatar-initials-lg:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.asphalt}"
    rounded: "{rounded.full}"
    size: "6rem"
---

# Design System: Scrambler RJ

## Overview

**Creative North Star: "O Emblema no Asfalto"**

O logo abre a plataforma montando-se sozinho sobre o preto, e depois fica pequeno no topo de cada tela. O resto é texto sobre um chão preto quente: um título condensado em caixa alta, frases curtas em creme, uma ação laranja por contexto e selos que dizem a situação de cada coisa. Fotografia aparece só como conteúdo: a peça de uma campanha de vestuário, a foto de um passeio, o rosto de uma pessoa. Ela nunca é decoração.

A densidade é baixa e o celular vem primeiro: quem chega de um link do WhatsApp resolve em poucos toques, numa coluna única. As telas de entrada são uma coluna estreita centrada na altura; a área dos riders é uma coluna mais larga com um cabeçalho de uma linha; o painel de gerenciamento acrescenta uma segunda linha de navegação. Não há sombra, gradiente, textura nem ornamento. A forma vem do contraste entre o título pesado e o texto corrido, de fios finos em creme translúcido e de um único tom de superfície elevada.

Este documento registra o que está construído em 2026-11-17: a abertura do logo, as telas de entrada e de situação, o Início com passeios e vestuário, a página da campanha com o montador de pedido, a página do passeio com resposta de presença, os perfis (meu perfil, edição, motos com foto e modificações, riders com aniversariantes do mês, perfil de outra pessoa e ficha para administradores) e o painel (avaliações, riders, campanhas de vestuário, templates, pedidos com produção, passeios). Não existe landing page. O grupo nunca é apresentado como motoclube, em texto, sigla, imagem ou elemento visual.

**Key Characteristics:**
- O logo original é a única imagem de identidade; ele se monta em camadas na abertura e depois aparece pequeno e parado.
- Um chão preto quente, texto creme, laranja para a ação principal e para o fato que pede atenção, coral para problema.
- Títulos em Archivo condensada, peso 800, caixa alta; rótulos em Archivo menos condensada, peso 600; todo texto corrido em Figtree.
- Toda situação é dita por um selo com texto; a cor do selo reforça, nunca substitui.
- Plano: sem sombras. A profundidade vem de um tom de superfície elevada e de fios em creme translúcido.
- Cantos quase retos (2px) em controles e superfícies; o círculo é exclusivo do rosto e do emblema.
- Um único movimento autoral, a abertura do logo, desligado com `prefers-reduced-motion`.

## Colors

Paleta tirada do logo: preto quente, creme e laranja, mais um coral para problema. Nenhuma cor foi acrescentada desde o início; o que mudou foi o papel de cada uma.

### Primary
- **Laranja do Logo** (`ember`): fundo do botão principal e da contagem de pedidos de ingresso pendentes; sublinhado de 2px sob as ações secundárias e sob os links de telefone; traço da aba atual no painel; borda do selo "Pendente"; filete do valor pendente; fundo da seleção de texto e polegar da barra de rolagem.
- **Laranja Aceso** (`ember-hot`): o laranja que funciona como texto. Data e saída do passeio, a quantidade de campanhas em que falta a pessoa, o valor pendente, o texto do selo "Pendente", o ícone do botão do Instagram. Também é o hover do botão principal e das ações secundárias.

### Tertiary
- **Coral de Alerta** (`alert`): erro de campo e de formulário, botão de confirmação de uma ação destrutiva, e os selos de problema ("Cancelado", "Bloqueado", "Reprovado").

### Neutral
- **Preto Quente** (`asphalt`): o chão de todas as telas e da abertura. Também é a cor do texto sobre laranja e sobre creme.
- **Asfalto Elevado** (`asphalt-raised`): a única superfície acima do chão. Cartões de campanha, cartões de pedido e de rider, blocos de dados privados, caixas de valores, o lembrete de perfil.
- **Creme do Logo** (`cream`): títulos, títulos de seção, nomes, valores e o texto das ações. Cheio, é o fundo do aviso de resultado, do selo de coisa resolvida, da opção selecionada e do avatar de iniciais. Translúcido, faz fios e contornos: 15% nos fios divisórios, 35% na borda de campos e de opções, 50% na borda do selo neutro, 70% na borda do botão de contorno, 10% no preenchimento de hover.
- **Creme Apagado** (`cream-dim`): só apoio. Dicas de campo, rótulos de termo, linhas secundárias, histórico, itens de navegação em repouso e links de voltar. A 70% de opacidade, é o texto de exemplo dos campos.

### Papéis de cor nas telas

Revisado em 2026-11-17, a pedido do usuário, que achou ações e informações importantes apagadas.

- **Laranja cheio**: a ação principal da tela ou do cartão, uma por contexto. No Início, só onde falta a pessoa agir.
- **Sublinhado laranja sob texto creme**: ação secundária. Editar, trocar, ver, remover, cancelar.
- **Contorno creme forte**: ação alternativa ao lado da principal.
- **Laranja como texto**: fato que pede atenção agora.
- **Laranja em ícone**: ícone de fato ou de título de seção, para reconhecer de relance o tipo de informação.
- **Selos**: creme cheio para o que está resolvido ou ativo; laranja para o que espera alguém; contorno creme para fato neutro; coral para problema.
- **Creme cheio** para o que importa; **creme apagado** só para apoio.
- Como texto pequeno use sempre o Laranja Aceso: o Laranja do Logo sobre o Asfalto Elevado fica abaixo de 4,5:1. Medido: Laranja Aceso 6,2:1 no chão e 5,7:1 no cartão; selo "Pendente" 4,9:1; Coral 8,2:1 no cartão; Creme Apagado 7,9:1 no cartão.

### Named Rules
**The Laranja É Ação Rule.** O laranja cheio preenche uma única ação por contexto. Como texto, marca só o fato que pede atenção agora. Não colore títulos, fundos de seção nem ornamento. Ícones de fato e de seção são a única outra presença do laranja: marcam o tipo de informação, sempre ao lado da palavra.

**The Selo Diz a Situação Rule.** Toda situação aparece como selo com palavra: Aberto, Fechado, Cancelado, Pago, Pendente, Principal, Administrador, Bloqueado, Seu tamanho. A cor do selo segue o significado e nunca é o único sinal.

**The Um Tom Acima Rule.** Existe um chão e um único tom elevado. Não há segundo nível de elevação: dentro de um cartão, a separação é feita por fios.

**The Coral É Problema Rule.** O coral aparece onde algo deu errado, precisa ser corrigido ou não tem volta. Não serve de destaque neutro nem de decoração.

## Typography

**Display Font:** Archivo, eixo de largura em 62% (com ui-sans-serif, system-ui, sans-serif)
**Body Font:** Figtree (com ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Archivo, eixo de largura em 75%, a mesma família dos títulos

**Character:** Uma voz pesada e estreita para nomear a tela e uma voz redonda e calma para dizer o que fazer. Os títulos são curtos e em caixa alta; o texto corrido é sempre em caixa normal.

### Hierarchy
- **Display** (800, `clamp(2rem, 8vw, 2.75rem)`, 0.96, caixa alta, largura 62%, quebra equilibrada): título único das telas de entrada, de situação e de página não encontrada.
- **Display, área logada** (`display-shell`; `clamp(2rem, 6vw, 2.75rem)`): título único de cada página dentro da área logada. No perfil, é o apelido ou o nome da pessoa.
- **Display de cartão** (`display-card`; 1.5rem): nome da campanha no cartão do Início. Também faz as iniciais do avatar.
- **Nome da abertura** (`intro-name`): "Scrambler RJ" sob o logo na abertura. Não aparece em outro lugar.
- **Figure** (Figtree 600, 1.5rem, algarismos tabulares): preço da peça, total do pedido, valores de produção, horários do passeio.
- **Body strong** (Figtree 600, 1rem): nomes de pessoas e de itens em listas e cartões, a frase que diz a situação da pessoa ("Você ainda não pediu").
- **Body** (Figtree 400, 1rem, 1.625): texto de apoio sob o título, valores de perfil, texto digitado. Largura máxima de 34rem no texto introdutório.
- **Body small** (Figtree 400, 0.875rem): dicas e erros de campo, linhas secundárias, histórico de pagamento.
- **Label** (Archivo 600, largura 75%, 0.875rem, espaçamento 0.05em, caixa alta): texto de botões, rótulos de campo, navegação, títulos de seção, termos das listas de detalhe.
- **Label de selo** (`label-badge`; 0.75rem): texto dos selos.

Números que se comparam (preços, quantidades, telefones, a grade de produção) usam algarismos tabulares.

### Named Rules
**The Duas Vozes Rule.** Archivo nomeia e rotula; Figtree explica. Archivo nunca é usada em texto corrido, e Figtree é a face aprovada para ele.

**The Um Título Rule.** Cada tela tem um único título em Display, e nada fica acima dele além do link de voltar e, quando a coisa não está em situação normal, do selo de situação. As seções são anunciadas por um rótulo em creme cheio.

## Layout

Três quadros, todos de coluna única e centrados na largura.

**Antes da entrada** (entrada, pedido de ingresso, situação, página não encontrada): coluna de até 28rem, com 1.25rem de margem lateral e 3rem de respiro vertical, centrada também na altura. Ordem fixa: logo de 104px, título, frase de apoio, ação ou formulário. Botões ocupam a largura toda.

**Área dos riders** (Início, vestuário, passeio, grupo, perfis): coluna de até 56rem, margem lateral de 1rem que passa a 1.5rem a partir de 640px. No topo, um cabeçalho de uma linha fechado por um fio. Perfis, formulários e a lista do grupo ficam numa coluna interna de até 42rem.

**Painel de gerenciamento**: o mesmo quadro, com uma segunda linha de navegação logo abaixo do cabeçalho.

O ritmo é em múltiplos de 0.25rem. Intervalos recorrentes: 0.5rem entre botões empilhados, 1rem entre cartões de uma lista, 1.25rem entre cartões de campanha, 1.5rem entre campos, 2.5rem entre seções (3.5rem antes de uma seção de lista longa). Todo alvo de toque tem no mínimo 2.75rem; botões, campos e opções têm 3rem; a linha clicável da lista do grupo tem 3.5rem.

Há um único ponto de quebra, 640px. Abaixo dele tudo empilha: ações em coluna e em largura total, a ação principal primeiro. A partir dele: ações lado a lado; o cartão de passeio fica horizontal, com a foto à esquerda; as campanhas de vestuário do Início formam uma grade de duas colunas; a página da campanha e a do passeio ganham uma segunda coluna de até 24rem para a foto; listas de detalhe passam a duas ou três colunas. O título da página nunca divide a linha com ações: elas ficam numa linha própria abaixo dele.

## Elevation & Depth

O sistema é plano e não usa sombras. A profundidade tem dois recursos: o Asfalto Elevado, que levanta cartões e blocos, e fios de 1px em creme a 15%, que fecham o cabeçalho, separam linhas de lista e dividem um cartão por dentro. O aviso de resultado se destaca por inversão (creme cheio com texto preto), não por elevação. As caixas de valores da campanha ganham um filete de 2px no topo, sem cantos arredondados, para dizer qual é qual. A única camada sobreposta é a abertura do logo, que cobre a tela com o preto do chão e some sozinha.

### Named Rules
**The Sem Sombra Rule.** Nenhuma superfície projeta sombra, nem em repouso nem em hover. O que precisa de destaque muda de tom, inverte as cores ou ganha um selo.

## Shapes

Cantos quase retos: 2px em botões, campos, opções, cartões, selos e avisos. O círculo é exclusivo do rosto (foto de perfil ou avatar de iniciais) e do emblema. Bordas são sempre de 1px em creme translúcido, laranja ou coral; não há faixa lateral colorida nem recorte. Uma superfície que recebe filete no topo perde o arredondamento. Fotos de peça e de passeio são retangulares, recortadas por `object-fit: cover` em proporções fixas: 4:3 no cartão de campanha, 16:9 no passeio, 4:5 na página da campanha. O logo é usado inteiro, sem moldura, máscara ou corte.

## Components

Os componentes vêm do shadcn/ui com primitivos Base UI (estilo `lyra`), em `src/components/ui`, com as variantes reescritas para este sistema. As cores passam pelos papéis semânticos do shadcn definidos em `src/app/globals.css`: `primary` = Laranja do Logo, `primary-hover` e `highlight` = Laranja Aceso, `foreground` = Creme, `muted-foreground` = Creme Apagado, `card` = Asfalto Elevado, `destructive` = Coral, `border` = creme a 15%, `input` = creme a 35%, `ring` = Creme. Um componente novo do registro só entra em tela depois de restilizado para estas regras.

### Buttons
Diretos e firmes: retângulos baixos com texto de rótulo em caixa alta.
- **Shape:** 2px, altura mínima de 3rem, 1.25rem de preenchimento lateral.
- **Default:** fundo Laranja do Logo com texto Preto Quente. A ação principal, uma por contexto.
- **Outline:** fundo transparente, borda creme a 70%, texto creme. Ação alternativa: fechar campanha, baixar PDF, abrir no mapa, adicionar moto, "Não vou".
- **Ghost:** texto creme com sublinhado laranja de 2px, afastado 6px. Ação secundária: editar, trocar, ver, remover, cancelar. No tamanho `inline` perde o preenchimento lateral e desce a 2.75rem.
- **Destructive:** borda e texto coral sobre coral a 10%. Só no passo de confirmação.
- **Hover / Focus:** transição de cor, fundo e borda em 200ms. Default passa a Laranja Aceso; outline ganha borda creme cheia e preenchimento a 10%; ghost passa a Laranja Aceso. O foco por teclado é um contorno de 2px em creme, afastado 3px, que não entra na transição.
- **Disabled:** 50% de opacidade. Durante o envio o texto muda ("Salvando…"). O botão de salvar um pedido só acende quando algo mudou.
- **Links com cara de botão** usam as mesmas classes (`buttonVariants`).

### Confirmação no lugar
Ação que não tem volta (cancelar campanha, pedido ou passeio; bloquear; remover moto; apagar dados de emergência; tirar administração) não abre janela. O gatilho ghost dá lugar, no mesmo ponto, a uma pergunta em Body, um botão destructive ("Sim, …") e um ghost para desistir ("Manter …"), separados do que vem acima por um fio.

### Status badges
Selos com texto em Label de 0.75rem, 2px, preenchimento de 0.25rem por 0.5rem.
- **Resolvido ou ativo** (creme cheio, texto preto): Pago, Aberto, Confirmações abertas, Principal, Você vai, Rider.
- **Esperando alguém** (borda laranja, fundo laranja a 15%, texto Laranja Aceso): Pendente, Em avaliação.
- **Fato neutro** (borda creme a 50%, texto creme): Fechado, Confirmações encerradas, Administrador, Você não vai, Seu tamanho.
- **Problema** (borda coral, fundo coral a 10%, texto coral): Cancelado, Bloqueado, Reprovado.

"Seu tamanho" marca, no montador de pedido, a linha do tamanho guardado no perfil, e só quando a campanha oferece esse tamanho. É uma dica: não altera quantidade.

### Avatar
O rosto da pessoa onde ela aparece. Ordem de reserva: foto enviada, foto da conta Google, iniciais.
- **Shape:** círculo, `object-fit: cover`. Quatro tamanhos: 2.5rem (fileira de pessoas), 3.5rem (lista do grupo e janela de pessoas), 6rem e 7rem, que passa a 9rem a partir de 640px (cabeçalho de perfil).
- **Iniciais:** círculo em creme cheio com texto Preto Quente em Display, primeira e última palavra do nome exibido.
- **Texto alternativo:** "Foto de …" ou "Iniciais de …".

### People stack
Toda contagem de pessoas vista por riders (`PeopleStack`): quem vai, não vai e não respondeu a um passeio, quem foi, quem pediu numa campanha, quem quer uma peça de volta.
- **Fileira:** até cinco avatares de 2.5rem sobrepostos em 0.75rem, cada um com um anel de 2px na cor do fundo; passando disso, um círculo "+n" em Label. Na página do passeio e da campanha cabem oito.
- **Contagem em palavras:** sempre ao lado, em Body small strong sublinhado em creme a 15% ("4 vão", "2 pedidos · 5 peças"). O avatar nunca é o único sinal. Fileira e texto são um botão só, de 2.75rem; no hover o texto passa a Laranja Aceso.
- **Ninguém:** sem avatares e sem botão, só a frase em Creme Apagado ("Ninguém confirmou ainda").
- **Janela:** abre no centro, em Asfalto Elevado, com 30rem de largura máxima e fundo preto a 80% atrás. Título em Label com a contagem e "Fechar" (ghost). Cada pessoa é uma linha entre fios: avatar de 3.5rem, nome exibido em Body strong, o @ do Instagram na variante discreta e "Ver perfil" (ghost) à direita. Rola por dentro quando a lista é longa; Escape e o toque fora fecham.
- Onde a linha carrega mais que a pessoa (itens e pagamento de um pedido, correção de presença do administrador), a lista continua, com a fileira acima dela.

### Instagram
O @ da pessoa (`InstagramLink`), abrindo o perfil dela em outra aba.
- **Botão** (cabeçalho de perfil): contorno creme a 35%, 2px, 2.75rem de altura, logo do Instagram preenchido em Laranja Aceso e o @ em Body strong. No hover, contorno laranja e fundo laranja a 15%.
- **Discreto** (janela de pessoas): logo de traço e @ em Body small apagado, Laranja Aceso no hover.

### Icons
Ícones de traço (Phosphor), nunca como enfeite. Servem para a pessoa reconhecer de relance que tipo de informação está ali, e sempre acompanham a palavra: nenhum ícone fica sozinho no lugar de um rótulo ou de uma ação.
- **Fato com ícone:** ícone de 1.25rem em Laranja Aceso à esquerda de um par rótulo e valor (região, experiência, aniversário, tempo de grupo).
- **Título de seção com ícone:** o mesmo ícone, preenchido, antes do título em Label, quando a página junta blocos de naturezas diferentes (aniversariantes, modificações da moto).
- **Estado vazio de imagem:** ícone em Creme Apagado a 60% no centro do quadro (moto sem foto).
- Botões, links e selos não levam ícone; as exceções são a seta do link de voltar, o logo no @ do Instagram e o selo de nível do perfil. Ícones são decorativos para leitores de tela (`aria-hidden`), porque a palavra ao lado já diz tudo.

### Profile facts
O que o grupo vê de uma pessoa além do nome e das motos (`ProfileFacts`). A bio vem primeiro, em Body de 1.125rem, uma linha escrita pela pessoa. Abaixo, uma fileira que quebra: região, experiência, aniversário (dia e mês por extenso) e "No grupo desde" (mês e ano), cada um como fato com ícone, rótulo em Label apagado e valor em Body strong. Dado não informado não deixa rótulo; o tempo de grupo aparece sempre.

### Profile header and ride history
- **Cabeçalho** (`ProfileHeader`): avatar grande à esquerda (acima, no celular), nome exibido em Display de até 3.25rem, nome completo em Body apagado quando há apelido e, abaixo, uma linha que quebra com os selos (Bloqueado, Administrador, selo de nível) e o botão do Instagram.
- **Selo de nível:** variante "esperando alguém" com um ícone de estrada preenchido e o nome escrito (Primeira saída, Pegou estrada, Rodado, Estradeiro, Lenda da serra). Descreve estrada rodada, não posição: sem brasão, escudo, divisa ou faixa. Sem passeio, sem selo.
- **Estrada com o grupo** (`RideHistory`): caixas em Asfalto Elevado, como as da ficha do passeio, com ícone, rótulo e o número em Display de 2.25rem: passeios feitos, sequência (a partir de dois meses) e recorde (quando maior que a atual). Abaixo, em Body small apagado, o que falta para o próximo selo. Depois, "Passeios recentes" como lista entre fios, percurso à esquerda e data à direita, a linha inteira levando ao passeio; e "Fotos nos passeios", na grade da galeria. Sem passeio, uma frase de estado vazio.

### Birthdays
No topo da tela Riders, um bloco em Asfalto Elevado com o título "Aniversariantes de" e o mês. Cada pessoa é uma linha que leva ao perfil: o dia em Figure Laranja Aceso com algarismos tabulares, o avatar pequeno e o nome exibido. Duas colunas a partir de 640px. Sem aniversariantes no mês, o bloco não existe.

### Bike photo and details
- **Foto da moto** (`BikePhoto`): quadro 4:3 com 2px de canto e `object-fit: cover`. Sem foto, o quadro continua em Asfalto Elevado com o ícone de moto, para as listas não perderem o alinhamento. Largura inteira do cartão no perfil, 4rem na tela Riders (onde só aparece quando há foto).
- **Moto principal** (`BikeShowcase`): um cartão com a foto ocupando três quintos da largura a partir de 640px (em cima, no celular). Ao lado, o selo "Principal", o apelido em Label Laranja Aceso, o modelo em Display de 1.875rem e a ficha em duas colunas, rótulo em Label apagado e valor em Body strong de 1.125rem: cilindrada, ano, cor, autonomia. Dado não informado não deixa rótulo.
- **Demais motos:** grade de duas colunas a partir de 640px; cada cartão tem a foto no topo, apelido, modelo em Display de 1.25rem e o resumo em Body small apagado, separado por pontos.
- **Ações do dono:** no próprio perfil, "Editar", "Tornar principal" e "Remover" (ghost) no rodapé de cada cartão, abaixo de um fio na moto principal.
- **Modificações** (`BikeMods`): abaixo do resumo, uma linha por categoria, com a categoria em Label apagado e os itens em Body small separados por pontos. Na página da moto, cada item é uma linha entre fios com "Editar" e "Remover" (ghost), e o formulário de incluir fica logo abaixo, na mesma página.

### Cards / Containers
Uma única superfície, o Asfalto Elevado, com 2px e 1.25rem de preenchimento. Sem sombra e sem borda.
- **Cartão de campanha (Início):** foto no topo (ou à esquerda, no passeio, a partir de 640px); nome em Display de cartão; uma ou duas linhas de fatos; um fio; abaixo dele, a situação da pessoa e a ação. A parte de cima é um link para a página; a ação fica fora dele.
- **Cartão de passeio** (`RideCard`): data e saída em Label Laranja Aceso acima do nome; ponto de encontro; a fileira de quem vai e, em Body small apagado, quantos não vão e não responderam; no rodapé, a resposta. Com as confirmações encerradas, o selo fica acima da data e o rodapé some. Sem resposta: frase em Body strong, "Vou" (default) e "Não vou" (outline) lado a lado. Respondido: selo com a resposta e "Trocar". Trocando: a resposta atual fica preenchida em creme e desabilitada, a outra em outline, e "Manter resposta" desiste.
- **Tempo no dia:** na coluna lateral do passeio, um cartão por ponto (encontro e destino): ícone do céu de 2rem em Laranja Aceso à esquerda; rótulo e hora em Label apagado, o lugar em Body strong e, em Body small apagado, o céu em palavras e a chance de chuva; à direita, a temperatura em Display de 1.875rem. Abaixo, o crédito ao Open-Meteo em Body small apagado. O ícone nunca vai sem o céu escrito.
- **Links de mapa do passeio:** "Abrir no Google Maps" (outline, largura inteira) logo abaixo do mapa, com uma frase em Body small apagado quando o link leva só parte do roteiro. Em cada parada com ponto marcado, "Abrir no mapa" e "Abrir no Waze" (ghost) lado a lado, abaixo da observação.
- **Cartão de passeio realizado** (`DoneRideCard`): foto no topo quando há; data com ano em Label apagado; percurso; distância e duração em Body strong; no rodapé, a fileira de quem foi e, à direita, o número de fotos como link para a galeria. Duas colunas a partir de 640px.
- **Cartão de peça que já tivemos:** foto, modelo, mês da última campanha e preço em Body small apagado, quantas campanhas já teve quando foi mais de uma, a fileira de quem quer de volta; no rodapé, "Quero de volta" (outline) ou o selo "Você pediu a volta" com "Desfazer" (ghost). Três colunas a partir de 1024px.
- **Cartão de vestuário** (`BatchCard`): preço em destaque, a fileira de quem pediu com pedidos e peças; no rodapé, "Você ainda não pediu" com "Fazer pedido" (default) ou o resumo do pedido com o selo de pagamento e "Ver".
- **Cartão de pedido (painel) e de rider:** nome em Body strong, linha secundária, valor com selo; histórico em Body small apagado; ações numa linha que quebra.
- **Bloco de dados privados:** anuncia no título quem vê ("Só você e os administradores veem", "Só administradores veem") antes de mostrar qualquer dado.
- **Caixas de valores:** três caixas lado a lado (Pago, Pendente, Total), sem arredondamento, com filete de 2px no topo em creme, laranja e creme a 15%. O valor pendente fica em Laranja Aceso quando é maior que zero.

### Inputs / Fields
- **Style:** rótulo em Label creme acima do campo. Campo de 3rem, fundo transparente, borda creme a 35%, 2px, 0.75rem de preenchimento lateral, texto de 1rem. Texto de exemplo em Creme Apagado a 70%.
- **Hint:** Body small apagado abaixo do campo.
- **Focus:** contorno de 2px em creme, afastado 3px, e a borda passa a creme cheio.
- **Error:** borda e rótulo em coral; mensagem em Body small coral depois da dica. Um aviso coral no topo do formulário diz que nada foi salvo. Os valores digitados são preservados; arquivos precisam ser escolhidos de novo, e o aviso diz isso.
- **Arquivo:** o mesmo campo, com o botão nativo em creme a 10%. Ao lado ou acima, a prévia da foto escolhida.
- **Texto longo** (`Textarea`): as mesmas bordas, foco e erro do campo, com 6rem de altura mínima, crescendo com o conteúdo. Só para texto de mais de uma linha (alergias e condições de saúde).
- **Blocos de formulário:** um formulário longo é dividido em blocos com legenda. No perfil, a legenda diz quem vê aqueles dados.

### Checkbox
Um sim ou não isolado (`Checkbox`): caixa de 1.5rem, 2px, contorno creme a 35%; marcada, fundo Laranja do Logo com o sinal em Preto Quente. Fica dentro de um rótulo de 3rem de altura, com o texto ao lado, e a linha inteira é o alvo de toque. Hoje só em "Remover o arquivo GPX", no formulário do passeio.

### Option chips
Conjunto de opções em que se escolhe uma ou várias: tamanhos, cores, tipo sanguíneo, região, experiência, modelo da moto, categoria de modificação.
- **Style:** 3rem de altura, largura mínima de 3.5rem, borda creme a 35%, texto em Label apagado.
- **Selected:** fundo e borda em creme cheio, texto Preto Quente.
- Na escolha de cor da campanha, a opção mostra quantas peças daquela cor já estão no pedido.
- Em conjunto de escolha única opcional, tocar de novo desmarca.
- **Opção que abre campos** (`BikeModelField`): o modelo da moto é um conjunto de opções com os modelos da lista e "Outro". Escolher um modelo mostra a cilindrada na dica; escolher "Outro" faz aparecer, logo abaixo, os campos de modelo e cilindrada.
- Rótulos longos (região, modelo) quebram em várias linhas de opções; a opção não encolhe o texto.

### Quantity stepper
No montador de pedido, cada tamanho é uma linha entre fios: o tamanho em Label à esquerda (com o selo "Seu tamanho" quando for o caso) e, à direita, menos, a quantidade em Figure com algarismos tabulares, e mais. Os dois botões são quadrados de 3rem em outline. O menos fica desabilitado em zero. Abaixo, o resumo das combinações e o total em Figure.

### Navigation
- **Cabeçalho:** uma linha fechada por um fio, com o logo de 36px e "Scrambler RJ" à esquerda, como link para o Início. À direita, itens em Label de 2.75rem: Início, Passeios, Vestuário, Riders, Perfil, Painel (só administradores, com a contagem de pedidos pendentes) e Sair. Creme Apagado em repouso, creme no hover. Quando não cabe, a navegação desce para uma segunda linha única, que rola na horizontal sem barra visível; não há menu recolhido.
- **Listas mantidas no painel** (recomendações de passeio, modelos de moto): ficam um nível abaixo de uma aba, com link ghost no cabeçalho dela e link de voltar. Cada item é um cartão com o nome, o selo "Desativado" quando for o caso, as setas de subir e descer (outline, quadradas), os campos para editar com "Salvar" (outline) e "Desativar" ou "Reativar" (ghost). O formulário de incluir fica no fim, com o único botão laranja da tela.
- **Abas do painel:** segunda linha, só nas páginas do painel: Avaliações, Gestão de riders, Vestuário, Passeios. Itens de 3rem; a aba atual fica em creme com um traço laranja de 2px embaixo. Rola na horizontal quando não cabe. Templates pertencem a Vestuário e não têm aba.
- **Voltar** (`BackLink`): o caminho de volta para o nível acima, em toda página de detalhe ou de formulário. Uma seta desenhada dentro de um quadrado de 2rem com contorno creme a 35%, seguida do nome do destino em Label creme cheio; o conjunto tem 2.75rem de altura de toque. Fica perto do cabeçalho, como navegação: 1.5rem abaixo dele (2rem a partir de 640px), e deixa 1.25rem (1.75rem) de respiro antes do título, que continua abrindo o conteúdo. No hover, texto e seta passam a Laranja Aceso, o quadrado ganha contorno laranja com fundo laranja a 15% e desliza 2px para a esquerda. Não usa caractere de seta nem texto apagado.

### Status notice
Confirmação do que acabou de acontecer: uma faixa em creme cheio com texto Preto Quente, peso 500, 2px, logo abaixo do título ou do link de voltar. É a única superfície clara do sistema. A variante de erro é uma faixa de contorno coral com texto coral.

### Lists
No chão, entre dois fios e com fios de creme a 15% entre as linhas. Nome em Body strong, linha secundária em Body small apagado, valor e selo à direita. Nomes de pessoas são links sublinhados em creme a 15%, que passam a laranja no hover. Quando a lista só diria quem são as pessoas, ela dá lugar à fileira de pessoas. Na lista do grupo, a linha inteira é o link: avatar, nome com selo de administrador, moto principal e um sinal de seguir à direita.

### Production table
Grade de cores por tamanhos, só no painel: cabeçalho em Label apagado, linhas entre fios, algarismos tabulares alinhados à direita, zeros em Creme Apagado, totais em peso 600. Rola na horizontal se faltar largura.

### Empty state
Não há ilustração. Ícones existem com um papel só, descrito em "Icons". Um estado vazio é uma frase em Creme Apagado que diz o que vai aparecer ali ou convida a preencher ("Nada informado. Se quiser, diga em Editar perfil a quem avisar num imprevisto."). Nunca usa tom de erro.

### Profile reminder
No topo do Início, enquanto o perfil não tem foto nem tamanho: uma faixa em Asfalto Elevado com uma frase, "Completar perfil" (ghost) e "Agora não" em Label apagado. Não usa laranja cheio e não bloqueia nada. Some de vez quando a pessoa preenche um dos dois ou dispensa.

### Gate screen
Quadro das telas anteriores à entrada: logo de 104px, título em Display e conteúdo, na coluna estreita descrita em Layout. A situação do pedido usa o mesmo quadro para os três estados, mudando só título e frase. A página não encontrada também, com um botão para o Início.

### Opening sequence
A abertura aprovada. O logo se monta sobre o Preto Quente em tela cheia e depois revela a tela que está por baixo. A ordem e os tempos são obrigatórios:

1. Moto, aos 150ms, 700ms: entra da esquerda (14% da largura do logo).
2. Piloto, aos 650ms, 550ms: desce de cima (9%).
3. Cenário, aos 1050ms, 700ms: cresce a partir de 92%.
4. Anel, aos 1250ms, 650ms: fecha a partir de 107%.
5. Letras, aos 1450ms, 600ms: giram de -9 graus até o lugar.
6. Selo RJ, aos 1600ms, 500ms: sobe 5%.
7. Nome "Scrambler RJ", aos 1900ms, 500ms: sobe 0.5rem, 1.25rem a 2rem abaixo do logo.
8. Saída, aos 3000ms, 500ms: a camada inteira some.

Todas as entradas partem de opacidade zero e usam a curva `cubic-bezier(0.16, 1, 0.3, 1)`; as saídas usam `ease-out`. O logo ocupa `min(64vmin, 26rem)`. A sequência pertence à tela de entrada, a mesma para todos: toca em toda visita de quem não está com a sessão iniciada e nunca para quem já entrou. A entrada dos administradores não a exibe. Clique, tecla, rolagem ou arrasto a encerram em 220ms. Ela espera as seis camadas carregarem, mas no máximo 2.5s; e não é exibida com `prefers-reduced-motion` nem sem JavaScript.

### PDF da campanha
Documento, não tela: página branca para ler no WhatsApp e imprimir. Faixa preta no topo com o logo, "Scrambler RJ" em creme e a data de geração, fechada por um filete laranja; foto da peça; tabela de pedidos com cabeçalho repetido a cada página; grade de produção e os três valores no fim; rodapé com paginação. Usa Helvetica, porque o gerador não lê as fontes variáveis do site. Sem telefones e sem pedidos cancelados.

## Do's and Don'ts

### Do:
- **Do** tratar o Scrambler RJ como grupo: "grupo", "pessoal do Scrambler RJ", "riders".
- **Do** usar o logo original inteiro como única imagem de identidade: 104px nas telas de entrada, 36px no cabeçalho.
- **Do** manter a ordem e os tempos da abertura, e exibi-la em toda visita de quem ainda não entrou.
- **Do** usar Figtree em todo texto corrido e Archivo só em títulos e rótulos, em caixa alta.
- **Do** dar a cada tela um único título em Display e uma única ação em laranja cheio por contexto.
- **Do** dizer toda situação com um selo que tem palavra, na cor do seu significado.
- **Do** dar às ações secundárias texto creme com sublinhado laranja; creme apagado é só para apoio e navegação.
- **Do** usar o Laranja Aceso quando o laranja for texto.
- **Do** confirmar ações sem volta no próprio lugar, com a pergunta e os dois botões.
- **Do** dizer quem vê os dados antes de pedi-los ou mostrá-los, em qualquer bloco privado.
- **Do** manter botões, campos e opções com 3rem de altura e qualquer alvo de toque com pelo menos 2.75rem.
- **Do** separar com fios de creme a 15% e levantar com Asfalto Elevado; nada além disso.
- **Do** empilhar ações em largura total abaixo de 640px, com a principal primeiro.
- **Do** escrever estados vazios como uma frase que diz o que vai aparecer ali.

### Don't:
- **Don't** apresentar o grupo como motoclube: nada de brasões, patentes, hierarquia, siglas ou as palavras "clube" e "motoclube".
- **Don't** recriar uma landing page ou qualquer página de apresentação antes da entrada.
- **Don't** criar entrada separada para administradores: todos entram pela mesma tela, e o item "Painel" só aparece no menu de quem é administrador.
- **Don't** usar Archivo em texto corrido nem trocar a face do texto corrido.
- **Don't** colocar um rótulo solto acima do título da página; acima dele só o link de voltar e o selo de situação.
- **Don't** escrever um link de voltar à mão, com caractere de seta ou em creme apagado; use `BackLink`.
- **Don't** alterar a ordem ou os tempos da abertura, nem exibi-la a quem já entrou ou com `prefers-reduced-motion`.
- **Don't** usar sombras nem um segundo tom de superfície elevada.
- **Don't** usar o laranja cheio em mais de uma ação por contexto, nem o laranja em títulos, fundos de seção ou ornamento.
- **Don't** usar o Laranja do Logo como texto pequeno sobre o Asfalto Elevado.
- **Don't** usar o coral fora de erro, problema ou confirmação de ação sem volta.
- **Don't** comunicar uma situação só pela cor.
- **Don't** usar fotografia como decoração: foto é a peça, o passeio ou a pessoa.
- **Don't** mostrar telefone, tamanho ou dado de emergência de uma pessoa a outro rider.
- **Don't** arredondar uma superfície que tem filete de destaque no topo, nem usar faixa lateral colorida.
- **Don't** redesenhar o logo nem gerar imagens que o substituam.
- **Don't** usar o visual de fábrica de um componente do shadcn sem restilizar.
- **Don't** reaproveitar estilos do protótipo antigo ou da área logada rejeitada.
