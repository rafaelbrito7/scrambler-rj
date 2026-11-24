---
id: 04
title: Tela Passeios e passeio realizado
status: done
blocked_by: [01]
source: docs/specs/vestuario-passeios-e-perfil.md — decisões "Tela Passeios", "Passeio realizado", "Duração" e "Página do passeio"
---

# 04 — Tela Passeios e passeio realizado

## What To Build

O menu ganha Passeios. A tela mostra os passeios que vêm pela frente, com a resposta no cartão, e todos os realizados. Abrir um realizado mostra fotos, rota no mapa, duração e quem foi.

## User Stories Covered

- 11. Ver os passeios pela frente e responder dali.
- 12. Ver todos os passeios realizados.
- 13. Data, percurso, distância, duração, quem foi e fotos em cada realizado.
- 14. Abrir um realizado e ver fotos, rota, duração e quem foi.

## Acceptance Criteria

- [x] "Em campanha" lista os passeios não cancelados com saída no futuro, o mais próximo primeiro; confirmações encerradas aparecem com o selo e sem a resposta.
- [x] "Realizados" lista os não cancelados com saída no passado, o mais recente primeiro.
- [x] O cartão de realizado mostra data com ano, percurso, distância, duração, a fileira de quem foi e o número de fotos publicadas, que leva à galeria.
- [x] Passeio cancelado não aparece em nenhuma das duas seções.
- [x] A ficha da página do passeio mostra "Duração", da saída ao retorno previsto.
- [x] Antes da saída a página mostra "Respostas do grupo" em três fileiras; depois, só "Quem foi", com a lista de correção para administradores.
- [x] O link de voltar de um passeio realizado leva a Passeios.

## Blocked By

- 01 — Pessoas por avatar: fileira e janela.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios com a data injetada — antes da saída em campanha, depois em realizados com a correção do administrador, cancelado fora.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, como administrador, desktop e celular: tela Passeios e a página de um passeio realizado, sem rolagem horizontal.
- [x] Conferido com a conta de rider comum em 2026-11-23 (ticket 09).
