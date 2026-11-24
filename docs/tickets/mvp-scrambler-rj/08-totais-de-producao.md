---
id: 08
title: Totais de produção do lote
status: done
blocked_by: [07]
source: docs/specs/mvp-scrambler-rj.md — "Visibilidade e relatório" (segunda frase), tabela de situações (linha "Lote cancelado"), cenário de aceite "Produção e PDF" (parte de tela)
---

# 08 — Totais de produção do lote

## What To Build

Na tela administrativa do lote, o administrador vê a consolidação para produção: quantidade de peças por cor e tamanho, total de peças, e valores financeiros pagos e pendentes. Pedidos cancelados ficam fora de todos os totais. Os números refletem o estado atual dos pedidos a cada carregamento.

## User Stories Covered

- 32. Conferir quantidades por cor e tamanho e valores pagos e pendentes para organizar a produção.

## Acceptance Criteria

- [x] A tela mostra peças por combinação de cor e tamanho e o total geral de peças.
- [x] A tela mostra valor pago, valor pendente e valor total.
- [x] Pedidos cancelados não entram em quantidades nem em valores.
- [x] Com pedidos pagos, pendentes e cancelados misturados, as somas conferem com a lista de pedidos.
- [x] A grade de cor × tamanho é legível no celular.
- [x] Participante não vê os totais financeiros de produção.

## Blocked By

- 07 — Fechar, reabrir e cancelar lote e pedido (precisa do estado cancelado).

## Execution Bundle

- tdd
- Test Seam: consolidação de produção do lote — dado um conjunto de pedidos pagos, pendentes e cancelados, retorna quantidades por variante e totais pago/pendente corretos.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: montar um lote com os três tipos de pedido e conferir as somas à mão.
