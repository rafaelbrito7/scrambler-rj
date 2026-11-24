---
id: 01
title: Região, experiência, bio e "no grupo desde"
status: done
blocked_by: []
source: docs/specs/perfis-dos-participantes.md — "Segunda edição — mais dados de perfil e de moto", decisões "Região", "Experiência", "Bio", "No grupo desde", "Quem vê o quê"
---

# 01 — Região, experiência, bio e "no grupo desde"

## What To Build

O rider informa, na edição do perfil, a região (lista fixa), a experiência de pilotagem (três níveis) e uma bio de uma linha, todos opcionais e apagáveis. O perfil mostra também, sem edição, desde quando a pessoa está no grupo (mês e ano da aprovação). Os quatro dados aparecem em "Meu perfil" e no perfil visto por outro rider e pelo administrador. O desenho das telas é mostrado ao usuário antes de construir.

## User Stories Covered

- 45. Informar de que região saio.
- 46. Escolher a região numa lista, sem bairro.
- 47. Informar meu nível de pilotagem.
- 49. Escrever uma linha sobre mim.
- 50. Deixar em branco e apagar depois.
- 51. Ver desde quando estou no grupo.
- 52. Ver esses dados no perfil de outra pessoa.

## Acceptance Criteria

- [x] Região aceita só os sete valores da lista; experiência só os três níveis; valor fora da lista é recusado no servidor.
- [x] Bio aceita até 140 caracteres, sem quebra de linha; acima disso é recusada com mensagem no campo.
- [x] Os três campos podem ficar vazios e ser apagados depois de preenchidos.
- [x] "No grupo desde" vem da data de aprovação, inclusive para quem foi reprovado antes; não muda com bloqueio e desbloqueio; ninguém edita.
- [x] Outro rider aprovado recebe e vê região, experiência, bio e tempo de grupo; quem não está aprovado não recebe nada.
- [x] Região e experiência são escolhidas em conjuntos de opções (`ToggleGroup` ou equivalente adequado ao celular), não em texto.
- [x] Perfil sem esses dados não mostra rótulos vazios.
- [x] Riders que já existiam continuam com o perfil íntegro depois da migração.

## Blocked By

- None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — `updatePersonalData` com os campos novos e as três leituras (`getOwnProfile`, `getMemberProfile`, `getMemberRecord`).

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, celular e desktop: preencher, salvar, apagar, e abrir o perfil com outra conta de rider.
