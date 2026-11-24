---
id: 04
title: Pedido do participante
status: done
blocked_by: [03]
source: docs/specs/mvp-scrambler-rj.md — "Início e navegação" (desenho confirmado em 2026-11-17), "Pedido e preço" (inclui tabela de situações, linha "Pendente, lote aberto"), "Visibilidade e relatório" (primeira frase), cenários de aceite "Receita → lote → pedido" e "Edição e pagamento"
---

# 04 — Pedido do participante

## What To Build

Na página de um lote aberto, o participante monta seu pedido com várias combinações de cor, tamanho e quantidade, confere o total e envia. Enquanto o pedido estiver pendente e o lote aberto, o titular pode editar ou excluir o próprio pedido. Todo participante aprovado consulta a lista de pedidos do grupo naquele lote, com combinações, total e situação de pagamento (todos Pendente nesta fatia). Depois do primeiro pedido, o preço do lote fica travado.

## User Stories Covered

- 25. Reunir várias combinações de cor, tamanho e quantidade em um pedido e conferir o total.
- 26. Editar ou excluir o pedido pendente enquanto o lote estiver aberto.
- 27. Consultar os pedidos do grupo e seus estados de pagamento.

## Acceptance Criteria

- [x] Cada participante tem no máximo um pedido por lote, com uma ou mais combinações.
- [x] Só são aceitas combinações de cor e tamanho oferecidas pelo lote, com quantidade inteira positiva.
- [x] Total = soma das quantidades × preço unitário. Exemplo do spec: 2 M + 1 G a R$ 80 = R$ 240, visível para a própria conta e para outra conta após recarregar.
- [x] O titular edita e exclui o próprio pedido pendente em lote aberto; outro participante não consegue, nem por chamada direta.
- [x] Após o primeiro pedido, o preço do lote não pode ser alterado.
- [x] A lista de pedidos do grupo mostra nome, combinações, total e situação de pagamento, sem telefone.
- [x] No Início, o cartão do lote mostra a situação da pessoa ("Você ainda não pediu" com botão Fazer pedido, ou "Seu pedido: N peças · total · Pendente" com Ver) e os números do grupo (pedidos e peças).
- [x] Lotes em que a pessoa ainda não pediu vêm antes dos já pedidos; o laranja aparece só no cartão pendente.
- [x] A linha de resumo do Início conta os lotes sem pedido da pessoa ("Falta você em N campanhas" ou "Tudo em dia").
- [x] Quem não está aprovado não vê nem cria pedidos.
- [x] Formulário de pedido é confortável no celular (sem controles apertados ou cortados).

## Blocked By

- 03 — Abrir lote direto e ver no Início.

## Execution Bundle

- tdd
- Test Seam: serviço de pedidos — criar, editar e excluir pedido, cobrindo validação de combinações e quantidades, cálculo do total, posse do pedido, unicidade por participante e trava de preço do lote.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador (celular e desktop): reproduzir o exemplo de R$ 240 com duas contas; editar e excluir como titular; falhar como outra conta.
