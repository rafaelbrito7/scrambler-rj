---
id: 07
title: Busca e filtros na tela Riders
status: pending
blocked_by: []
source: docs/specs/perfis-dos-participantes.md — "Terceira edição", decisão "Filtros da tela Riders" e histórias 79–86 e 102
---

# 07 — Busca e filtros na tela Riders

## What To Build

A tela Riders ganha busca por nome ou apelido e filtros por modelo de moto, região e experiência. Os filtros ficam no endereço da página, para o link filtrado poder ser compartilhado.

## User Stories Covered

- Perfis 79. Buscar por nome ou apelido.
- Perfis 80 e 81. Filtrar por modelo e ver quantos riders há em cada um.
- Perfis 82 e 83. Filtrar por região e por experiência.
- Perfis 84 e 85. Combinar, limpar e ver claramente quando não há resultado.
- Perfis 86. Mandar o link da lista filtrada.
- Perfis 102. Pessoa bloqueada fora dos filtros e das contagens.

## Acceptance Criteria

- [ ] A busca ignora acentos e maiúsculas.
- [ ] O filtro de modelo considera qualquer moto da pessoa, não só a principal; motos em "Outro" ficam juntas em "Outros modelos".
- [ ] Cada modelo mostra a quantidade de riders.
- [ ] Dentro de um filtro vale uma opção por vez; filtros diferentes se somam.
- [ ] Quem não informou região ou experiência só aparece sem esse filtro.
- [ ] Os filtros ficam no endereço; abrir o link mostra a mesma lista.
- [ ] Filtrar e contar acontecem no servidor, sobre aprovados e não bloqueados.
- [ ] No celular os filtros não ocupam a tela antes da lista.
- [ ] Filtro sem resultado diz isso em uma frase, com o caminho para limpar.

## Blocked By

- Decisão humana: a spec pede o desenho dos filtros no celular antes de implementar.

## Execution Bundle

- tdd
- Test Seam: listagem do grupo pelo serviço de perfis — cada filtro, a soma deles, busca sem acento, moto não principal, "Outros modelos", contagem por modelo, bloqueados fora.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador, celular e desktop: filtrar, combinar, limpar e abrir um link filtrado.
