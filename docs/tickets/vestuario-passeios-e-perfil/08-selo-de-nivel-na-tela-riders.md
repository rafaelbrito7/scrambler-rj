---
id: 08
title: Selo de nível na tela Riders
status: pending
blocked_by: [05]
source: docs/specs/perfis-dos-participantes.md — "Terceira edição", decisões "Selos de nível" e "Nada é guardado como total", história 92
---

# 08 — Selo de nível na tela Riders

## What To Build

Na tela Riders, cada pessoa mostra ao lado do nome o selo de nível que já aparece no perfil dela.

## User Stories Covered

- Perfis 92. Ver o selo de cada pessoa ao lado do nome na tela Riders.

## Acceptance Criteria

- [ ] O selo é o mesmo do perfil: mesmos marcos, mesma regra de passeio feito.
- [ ] Quem não fez passeio não tem selo.
- [ ] O selo é calculado na leitura, sem total guardado; a spec manda revisitar se a tela ficar lenta.
- [ ] O selo segue os selos do DESIGN.md, com a palavra escrita, e convive com o selo de administrador sem quebrar a linha no celular.

## Blocked By

- 05 — Estrada com o grupo no perfil.

## Execution Bundle

- tdd
- Test Seam: listagem do grupo pelo serviço de perfis — cada pessoa vem com o selo correspondente aos passeios feitos; correção de presença muda o selo.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador, celular e desktop: lista com riders de selos diferentes e sem selo.
