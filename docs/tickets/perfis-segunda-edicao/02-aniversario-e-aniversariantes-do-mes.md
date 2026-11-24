---
id: 02
title: Aniversário e aniversariantes do mês
status: done
blocked_by: []
source: docs/specs/perfis-dos-participantes.md — "Segunda edição — mais dados de perfil e de moto", decisões "Aniversário", "Aniversariantes do mês"
---

# 02 — Aniversário e aniversariantes do mês

## What To Build

O rider informa dia e mês do aniversário, sem ano. O dado aparece no perfil dele para os outros riders. A tela Riders mostra, acima da lista, quem faz aniversário no mês corrente, em ordem de dia.

## User Stories Covered

- 48. Informar dia e mês do aniversário, sem ano.
- 53. Ver no topo da tela Riders quem faz aniversário no mês.
- 54. Quem não informou não aparece na lista.

## Acceptance Criteria

- [x] Guarda só dia e mês; não existe campo de ano nem cálculo de idade.
- [x] Data inexistente (30 de fevereiro, 31 de abril) é recusada; 29 de fevereiro é aceito.
- [x] Em ano não bissexto, quem nasceu em 29 de fevereiro aparece entre os aniversariantes de fevereiro.
- [x] O bloco lista só aprovados e não bloqueados que informaram aniversário no mês corrente do fuso de Brasília, em ordem de dia, com o dia ao lado do nome exibido.
- [x] Sem aniversariantes no mês, o bloco não aparece.
- [x] O aniversário pode ser apagado; a pessoa some do bloco.
- [x] Cada nome leva ao perfil.

## Blocked By

- None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — edição do aniversário e uma leitura de aniversariantes do mês com a data atual injetada (virada de mês, 29 de fevereiro, bloqueados).

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, celular e desktop: informar o aniversário no mês corrente e ver o bloco na tela Riders com outra conta.
