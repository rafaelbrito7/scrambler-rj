---
id: 06
title: Pagamento e ajuste administrativo do pedido
status: done
blocked_by: [04]
source: docs/specs/mvp-scrambler-rj.md — "Pedido e preço" (tabela de situações), "Pagamentos e cancelamento" (até "registrar autor, data e motivo"), cenários de aceite "Edição e pagamento" e "Correção e histórico"
---

# 06 — Pagamento e ajuste administrativo do pedido

## What To Build

No painel, o administrador vê os pedidos de um lote e marca cada um como Pago (pagamento integral, manual), com autor e data. Pode desfazer uma marcação incorreta informando um motivo, que fica no histórico com autor e data. O administrador também edita o pedido de um participante: uma troca de cor ou tamanho que preserve o total mantém Pago; uma mudança que altere o total devolve o pedido a Pendente, e a interface avisa disso antes de salvar. Pedido pago deixa de ser editável pelo titular. A situação de pagamento aparece para todos os participantes na lista de pedidos do grupo.

## User Stories Covered

- 28. Registrar o pagamento integral e corrigir uma marcação incorreta com justificativa.
- 29. Ajustar um pedido e saber quando a mudança exige nova conferência do pagamento.

## Acceptance Criteria

- [x] Administrador marca um pedido pendente como Pago; autor e data ficam registrados.
- [x] Desfazer a marcação exige motivo; sem motivo é recusado. Autor, data e motivo ficam no histórico.
- [x] Após Pago, o titular não edita nem exclui o pedido, nem por chamada direta.
- [x] Troca administrativa de cor ou tamanho com mesmo total mantém Pago.
- [x] Alteração administrativa que muda o total devolve o pedido a Pendente; a tela avisa antes de confirmar.
- [x] Remover o último item de um pedido pago é recusado.
- [x] Administrador edita pedidos pendentes em lote aberto.
- [x] Conta de participante não marca nem desfaz pagamento por chamada direta.
- [x] O histórico de pagamento do pedido é visível aos administradores.

## Blocked By

- 04 — Pedido do participante.

## Execution Bundle

- tdd
- Test Seam: serviço de pedidos — marcar pago, desfazer com motivo e edição administrativa, cobrindo as transições Pendente↔Pago conforme a regra de total, a perda de edição do titular e as permissões.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: marcar Pago, confirmar que o titular perde a edição, trocar tamanho (mantém Pago), mudar quantidade (volta a Pendente), desfazer com motivo.
