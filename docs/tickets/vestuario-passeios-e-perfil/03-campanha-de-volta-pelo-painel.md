---
id: 03
title: Campanha de volta pelo painel
status: done
blocked_by: [02]
source: docs/specs/vestuario-passeios-e-perfil.md — decisões "Abrir a campanha de volta", "Sem aviso a quem pediu" e "Modelo"
---

# 03 — Campanha de volta pelo painel

## What To Build

No painel, Vestuário mostra as peças com pedido de volta, da mais pedida para a menos. "Abrir nova campanha" leva ao formulário já preenchido com a campanha antiga. Ao abrir, a campanha nova continua a linhagem da peça e os pedidos de volta são apagados.

## User Stories Covered

- 7. Ver no painel as peças com pedido de volta, por ordem.
- 8. Abrir a campanha nova a partir da antiga e ajustar.
- 9. Campanha antiga e seus pedidos intactos.
- 10. O pedido de volta some quando a campanha nova abre.

## Acceptance Criteria

- [x] O bloco "Pedidos de volta" só existe quando há ao menos um pedido, e mostra a fileira de quem quer.
- [x] O formulário começa com modelo, preço, tamanhos, cores e fotos da campanha antiga, e reaproveita as fotos sem novo envio.
- [x] Só campanha fechada serve de origem; se ela mudou de situação, o administrador volta à lista com um aviso.
- [x] Abrir apaga os pedidos de volta da origem na mesma transação e guarda de qual campanha a nova veio.
- [x] A campanha antiga continua fechada, com seus pedidos, e sai de "Já tivemos"; a nova aparece como a peça, com a contagem de campanhas.
- [x] A campanha antiga deixa de aceitar pedido de volta; a nova passa a aceitar depois de fechada.
- [x] Não há aviso automático a quem pediu.

## Blocked By

- 02 — Tela Vestuário e pedido de volta.

## Execution Bundle

- tdd
- Test Seam: serviço de campanhas — abrir a partir de uma fechada, de uma aberta e de uma inexistente; pedidos de volta apagados; peça única com duas campanhas.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, como administrador: ver o bloco "Pedidos de volta" e o formulário preenchido a partir dele.
- [x] Campanha de volta aberta pela tela em 2026-11-23, com Início e Vestuário conferidos (ticket 09).
