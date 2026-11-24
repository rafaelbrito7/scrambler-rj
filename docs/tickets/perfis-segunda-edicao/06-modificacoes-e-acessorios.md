---
id: 06
title: Modificações e acessórios
status: done
blocked_by: [04]
source: docs/specs/perfis-dos-participantes.md — "Segunda edição — mais dados de perfil e de moto", decisão "Modificações e acessórios"
---

# 06 — Modificações e acessórios

## What To Build

Cada moto tem uma lista de modificações e acessórios. Cada item tem uma categoria (escape, bagagem, pneus, proteção, iluminação, outro) e uma descrição. O dono inclui, edita e remove itens; outros riders veem a lista no perfil.

## User Stories Covered

- 73. Listar modificações e acessórios, cada um numa categoria.
- 74. Editar e remover um item.
- 75. Ver as modificações das motos de outra pessoa.

## Acceptance Criteria

- [x] Item exige categoria da lista e descrição de até 80 caracteres.
- [x] Até vinte itens por moto; o vigésimo primeiro é recusado com mensagem clara.
- [x] Os itens aparecem agrupados por categoria e, dentro dela, na ordem de cadastro.
- [x] Só o dono da moto inclui, edita e remove; outro rider e o administrador só veem.
- [x] Remover a moto remove seus itens.
- [x] Moto sem itens não mostra a seção para outros riders; para o dono, mostra o convite para incluir.
- [x] No celular, incluir um item não exige sair da página da moto.

## Blocked By

- 04 — Modelo da moto por lista.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — incluir, editar e remover item, limites, dono contra não dono, e a leitura para outro rider.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, celular e desktop: incluir itens em duas categorias, editar, remover, e abrir o perfil com outra conta.
