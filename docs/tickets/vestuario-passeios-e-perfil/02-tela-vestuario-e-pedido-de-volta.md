---
id: 02
title: Tela Vestuário e pedido de volta
status: done
blocked_by: [01]
source: docs/specs/vestuario-passeios-e-perfil.md — decisões "Tela Vestuário", "Peça e linhagem" e "Pedir a volta"
---

# 02 — Tela Vestuário e pedido de volta

## What To Build

O menu ganha Vestuário. A tela mostra as campanhas abertas em "Em campanha" e, em "Já tivemos", uma entrada por peça de campanha fechada. Em cada peça fechada o rider toca em "Quero de volta" e pode desfazer; todos veem quem quer.

## User Stories Covered

- 1. Ver todas as peças que o grupo já fez.
- 2. Ver as peças em campanha e pedir dali.
- 3. Pedir a volta de uma peça fechada.
- 4. Desfazer o pedido de volta.
- 5. Ver quem mais quer a peça de volta.
- 6. A mesma peça aparece uma vez só.

## Acceptance Criteria

- [x] "Em campanha" usa o mesmo cartão do Início, com o pedido da própria pessoa.
- [x] "Já tivemos" mostra foto, modelo, mês e preço da última campanha, quantas campanhas já teve quando mais de uma, e a fileira de quem quer de volta, as mais pedidas primeiro.
- [x] Campanha cancelada não aparece.
- [x] Só a campanha fechada e mais recente da peça aceita pedido de volta; um por rider; pedir duas vezes conta uma.
- [x] Quem pediu vê o selo "Você pediu a volta" e "Desfazer"; a página atualiza no lugar.
- [x] Quem não está aprovado não vê a tela nem pede.
- [x] A página de uma campanha fechada volta para Vestuário.

## Blocked By

- 01 — Pessoas por avatar: fileira e janela.

## Execution Bundle

- tdd
- Test Seam: serviço de campanhas — pedir, pedir de novo, desfazer, quem vê, só campanha fechada, quem não está aprovado, campanha inexistente, cancelada fora do catálogo.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, como administrador: pedir a volta de uma peça, abrir a janela de quem quer e conferir o selo.
- [x] Conferido com a conta de rider comum em 2026-11-23 (ticket 09).
