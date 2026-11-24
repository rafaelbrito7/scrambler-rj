---
id: 07
title: Fechar, reabrir e cancelar lote e pedido
status: done
blocked_by: [06]
source: docs/specs/mvp-scrambler-rj.md — "Início e navegação" (fechar, reabrir, canceladas), "Pedido e preço" (tabela de situações; correção de preço), "Pagamentos e cancelamento", cenários de aceite "Fechamento e cancelamento" e "Concorrência e permissões" (pagar × cancelar)
---

# 07 — Fechar, reabrir e cancelar lote e pedido

## What To Build

O administrador controla manualmente o ciclo do lote. Fechar retira o lote de "Campanhas ativas", preserva os pedidos e impede que participantes criem, editem ou excluam pedidos, mesmo numa aba aberta antes do fechamento. Reabrir devolve o lote ao Início e libera a edição dos pendentes. Cancelar um lote só é permitido se nenhum pedido estiver pago; o lote cancelado sai do Início e fica consultável como histórico. O administrador também cancela um pedido pendente individual; pedido pago não pode ser cancelado. Cancelados são preservados, não excluídos. Em lote fechado, o administrador continua podendo editar, cancelar e marcar pedidos pendentes como pagos.

## User Stories Covered

- 30. Fechar e reabrir lotes para controlar o período de pedidos.
- 31. Cancelar campanhas permitidas sem perder o histórico das inscrições (parte de lotes).

## Acceptance Criteria

- [x] Fechar tira o lote do Início e mantém todos os pedidos.
- [x] Com o lote fechado, criar, editar ou excluir pedido como participante é recusado no servidor, inclusive a partir de uma página carregada antes do fechamento.
- [x] Reabrir devolve o lote ao Início e permite editar pedidos pendentes.
- [x] Cancelar pedido pago é recusado, inclusive por chamada direta.
- [x] Cancelar lote com qualquer pedido pago é recusado, inclusive por chamada direta; fechar continua permitido.
- [x] Lote cancelado some do Início; seus pedidos ficam consultáveis como histórico.
- [x] Se marcar Pago e cancelar o lote acontecerem ao mesmo tempo, só um resultado compatível com as regras é gravado.
- [x] Participante vê claramente a situação do lote (aberto, fechado, cancelado) na página do lote.
- [x] Só administradores executam essas ações.

## Blocked By

- 06 — Pagamento e ajuste administrativo do pedido (as regras de cancelamento dependem do estado Pago).

## Execution Bundle

- tdd
- Test Seam: serviço de lotes e pedidos — fechar, reabrir, cancelar lote e cancelar pedido, cobrindo bloqueios por pedido pago, recusa de escrita do participante em lote fechado e a corrida entre marcar pago e cancelar lote.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador com duas contas: fechar com a aba do participante aberta e tentar editar; reabrir e editar; tentar cancelar lote com pedido pago.
