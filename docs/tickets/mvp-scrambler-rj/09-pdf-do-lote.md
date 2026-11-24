---
id: 09
title: PDF administrativo do lote
status: done
blocked_by: [08]
source: docs/specs/mvp-scrambler-rj.md — "Visibilidade e relatório" (exportação), cenário de aceite "Produção e PDF"
---

# 09 — PDF administrativo do lote

## What To Build

Na tela administrativa do lote, o administrador baixa um PDF para compartilhar manualmente no WhatsApp. O documento traz a identidade Scrambler RJ (logo e paleta), modelo, foto, situação do lote, data de geração, a lista de participantes com combinações, quantidades, valores e situação de pagamento, e os totais ao final. Listas longas são paginadas sem cortar linhas. Telefones e pedidos cancelados não aparecem.

A biblioteca de geração de PDF é uma escolha de stack ainda não acordada: propor a opção ao usuário antes de implementar.

## User Stories Covered

- 33. Gerar um PDF legível com pedidos e totais para compartilhar no WhatsApp.

## Acceptance Criteria

- [x] Administrador baixa o PDF de um lote aberto, fechado ou cancelado.
- [x] O PDF contém identidade do grupo, modelo, foto, situação do lote e data de geração.
- [x] Cada participante aparece com combinações, quantidades, valor e situação de pagamento.
- [x] Os totais ao final batem com a tela de produção (ticket 08).
- [x] Um lote longo pagina corretamente; a última página traz os totais.
- [x] Nenhum telefone e nenhum pedido cancelado aparece.
- [x] Conta de participante não consegue exportar, nem por chamada direta.
- [x] O texto do PDF usa "grupo" e "participantes".

## Blocked By

- 08 — Totais de produção do lote.
- Decisão do usuário: biblioteca de geração de PDF.

## Execution Bundle

- tdd
- Test Seam: geração do relatório do lote — os dados entregues ao PDF excluem telefones e cancelados e trazem totais corretos; a rota de exportação recusa quem não é administrador.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] Abrir o PDF de um lote com muitos pedidos e conferir visualmente paginação, última página e totais.
