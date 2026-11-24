---
id: 06
title: Cabeçalho, Instagram e vitrine de motos
status: done
blocked_by: [05]
source: docs/specs/vestuario-passeios-e-perfil.md — decisão "Perfil", itens "Cabeçalho" e "Motos"; DESIGN.md — "Profile header and ride history", "Instagram" e "Bike photo and details"
---

# 06 — Cabeçalho, Instagram e vitrine de motos

## What To Build

O perfil ganha um cabeçalho com avatar grande, selos e o Instagram como botão com o logo. A moto principal aparece num cartão largo com foto grande e ficha; as demais, em grade. O desenho é o mesmo no próprio perfil e no perfil visto por outro rider.

## User Stories Covered

- 19. Moto principal em destaque, com foto grande e ficha.
- 21. Instagram como botão fácil de tocar.

## Acceptance Criteria

- [x] Cabeçalho com avatar grande, nome do grupo, nome completo quando há apelido, selos (Bloqueado, Administrador, nível) e o botão do Instagram.
- [x] O botão do Instagram abre o perfil da pessoa em outra aba; sem Instagram, não aparece.
- [x] Moto principal com selo "Principal", apelido, modelo e ficha de cilindrada, ano, cor e autonomia; dado não informado não deixa rótulo.
- [x] Demais motos em grade de duas colunas a partir de 640px.
- [x] No próprio perfil, "Editar", "Tornar principal" e "Remover" ficam no rodapé de cada cartão.
- [x] O bloco de dados privados continua dizendo no título quem vê.

## Blocked By

- 05 — Estrada com o grupo no perfil (o selo de nível do cabeçalho vem dele).

## Execution Bundle

- normal validation
- Test Seam: TDD skipped: só apresentação; os dados vêm das leituras de perfil já testadas.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, como administrador: o próprio perfil e o de outro rider, com moto com e sem foto.
- [x] Conferido no celular, com um perfil de três motos, em 2026-11-23 (ticket 09).
- [x] Conferido com a conta de rider comum em 2026-11-23 (ticket 09).
