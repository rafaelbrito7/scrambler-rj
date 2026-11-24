---
id: 09
title: Aceite das telas novas e revisão das decisões
status: done
blocked_by: [01, 02, 03, 04, 05, 06]
source: docs/specs/vestuario-passeios-e-perfil.md — "Decisões de teste", item "Tela", e "Notas", item "Decisões tomadas na implementação, a rever"; docs/tickets/mvp-scrambler-rj/13-validacao-de-aceite.md
---

# 09 — Aceite das telas novas e revisão das decisões

## What To Build

Conferir as telas novas com a conta de rider comum, no celular e no desktop, percorrer uma volta de peça de ponta a ponta, e o usuário decidir cada item que foi resolvido na implementação sem a confirmação dele.

## Acceptance Criteria

- [x] Como rider comum: telas Vestuário e Passeios, pedir e desfazer a volta, janela de pessoas, página de passeio realizado sem a lista de correção, perfil próprio e de outro rider.
- [x] Como rider comum, nenhum dado privado de outra pessoa aparece nas telas novas.
- [x] Como administrador: abrir uma campanha de volta pela tela e conferir que os pedidos de volta sumiram, a peça aparece uma vez e a campanha nova está no Início.
- [x] Celular e desktop sem rolagem horizontal da página; o menu rola dentro da própria linha.
- [x] Decidido pelo usuário: duração como saída até o retorno previsto. Confirmado em 2026-11-23.
- [x] Decidido pelo usuário: campanha cancelada fora de "Já tivemos". Confirmado em 2026-11-23.
- [x] Decidido pelo usuário: sem aviso a quem pediu a volta. Mudado em 2026-11-23: entra um sininho de notificações (ticket 10).
- [x] Decidido pelo usuário: cinco rostos na fileira, oito nas páginas de detalhe, e doze fotos no perfil. Confirmado em 2026-11-23.
- [x] Decidido pelo usuário: apelido ou nome com apelido entre parênteses na janela de quem quer de volta, no painel. Em 2026-11-23: nome com apelido entre parênteses; implementado.
- [x] Decidido pelo usuário: passeio futuro com confirmações encerradas dentro de "Em campanha". Confirmado em 2026-11-23.
- [x] O que mudar vira ajuste na spec e, se for trabalho, ticket novo.

## Blocked By

- 01 a 06 — as telas precisam estar construídas (estão).
- Decisão humana: os seis itens "a rever" são do usuário.

## Execution Bundle

- normal validation
- Test Seam: TDD skipped: validação manual no navegador e decisões de produto.

## Verification

- [x] Roteiro percorrido com a conta de rider de teste e com a de administrador, com o que foi visto registrado aqui.
- [x] Itens "a rever" marcados com a decisão e a data; spec atualizada.

## Resultado do roteiro (2026-11-23)

No navegador, contra o banco local, com as contas de teste.

**Rider comum (desktop).**
- Menu com Início, Passeios, Vestuário, Riders, Perfil e Sair, sem Painel.
- Vestuário: pedir a volta levou a contagem de 1 para 2 e mostrou o selo "Você pediu a volta"; a janela listou as duas pessoas com Instagram e "Ver perfil"; desfazer voltou a 1.
- Passeio realizado: link de voltar para Passeios, "Duração 6h" na ficha, "4 riders foram" com a janela das quatro pessoas, três fotos; sem lista de correção, sem "Gerenciar passeio" e sem as respostas do grupo.
- Perfil de outro rider: link de voltar para Riders, estrada com o grupo e selo; nenhum telefone, tamanho ou dado de emergência no texto nem no HTML da página.
- Perfil próprio: selo "Primeira saída", dois passeios, recentes, três motos com a principal em destaque e as ações de cada uma, e o bloco privado com o título de quem vê.

**Celular (375 px).** Perfil, Vestuário, Passeios e a página do passeio sem rolagem horizontal; o menu rola dentro da própria linha (420 px de conteúdo em 375). A janela de pessoas cabe na tela. As três motos empilham, com a foto da principal na largura do cartão.

**Administrador.** O bloco "Pedidos de volta" mostrava a peça com "2 querem de volta". "Abrir nova campanha" abriu o formulário com modelo, preço, tamanhos, cor e foto da campanha antiga. Ao abrir: aviso "Campanha aberta", o bloco "Pedidos de volta" sumiu, a campanha antiga continuou "Fechada" na lista do painel, Vestuário passou a mostrar a peça uma vez, em "Em campanha", sem "Já tivemos", e a campanha nova apareceu no Início.

**Achados.**
- Um passeio com data passada e confirmações ainda abertas aparecia ao mesmo tempo no Início ("Campanhas ativas") e em "Realizados". Decisão do usuário em 2026-11-23: depois da saída o passeio sai do Início e não aceita resposta. Implementado e conferido no navegador: o passeio de 22/11 saiu do Início e a página dele mostra "Este passeio já saiu", sem os botões de resposta.
- Na lista do painel, a campanha nova e a antiga aparecem como duas linhas de mesmo nome, sem indicar que uma veio da outra. Sem decisão; fica como está.
- O nome com apelido entre parênteses na janela do painel não foi visto na tela: depois da campanha de volta não sobrou peça com pedido de volta nos dados locais.
- Não conferido: sequência e recorde na tela, porque os dados locais têm passeios em um mês só; desktop largo acima de 1024 px para a grade de três colunas de "Já tivemos".

**Dados locais deixados pelo roteiro.** Uma campanha aberta "Jaqueta Corta-Vento Inverno" criada em 2026-11-23 a partir da fechada.
