---
id: 01
title: Roteiro em paradas
status: done
blocked_by: []
source: docs/specs/passeios-roteiro-e-mapa.md — decisões "Roteiro em paradas", "Horários", "Descrição", "Página do passeio", "Passeios já publicados"; protótipo aprovado em `src/app/passeios/prototipo/` (variante A)
---

# 01 — Roteiro em paradas

## What To Build

O administrador publica e edita um passeio com uma lista ordenada de paradas (tipo, nome, local em texto, horário previsto, observação), um horário de encontro separado do de saída e uma descrição. A página do passeio passa a seguir a variante A do protótipo: título, data com encontro e saída, descrição, resposta "Vou / Não vou" no começo no celular e no topo da coluna lateral no desktop, e o roteiro em linha do tempo com o ícone do tipo em cada parada. Os passeios já publicados continuam abrindo, com o ponto de encontro como primeira parada. Mapa, ficha, clima e demais blocos entram nos tickets seguintes.

## User Stories Covered

- 1–4. Ver o roteiro em ordem, com horário, tipo, nome, local e observação.
- 6. Ver o horário de encontro separado do de saída.
- 21, 23. Responder no começo da página; funcionar bem no celular.
- 24, 26, 27. Montar o roteiro, reordenar, remover, escolher o tipo.
- 40–42. Editar um passeio publicado; passeios antigos continuam abrindo e podem ganhar roteiro.

## Acceptance Criteria

- [x] De uma a vinte paradas; a primeira é sempre do tipo encontro; tipo e nome obrigatórios; observação até 140 caracteres.
- [x] Tipos: encontro, abastecimento, café ou refeição, mirante ou foto, destino, retorno, numa lista sem dependências usada pelo servidor e pelo navegador.
- [x] Horário de encontro é opcional e não pode ser depois da saída; sem ele, a página mostra só a saída.
- [x] Descrição opcional de até 500 caracteres.
- [x] O formulário permite incluir, reordenar e remover paradas sem recarregar a página, e funciona no celular.
- [x] Salvar grava passeio e paradas de uma vez ou não grava nada.
- [x] Um passeio publicado antes desta mudança abre sem erro, com o ponto de encontro como primeira parada em texto.
- [x] Na página, cada parada mostra horário, marcador com ícone do tipo (encontro e destino em laranja cheio), tipo, nome, local e observação; a resposta "Vou / Não vou" aparece logo abaixo da descrição no celular.
- [x] As listas "Vão", "Não vão" e "Sem resposta" continuam como hoje.
- [x] Riders não publicam nem editam, nem por chamada direta.

## Blocked By

- None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviço de passeios — `publishRide` e a edição com paradas, as recusas, e `getRide` devolvendo o roteiro em ordem, inclusive para um passeio antigo.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, celular e desktop: publicar um passeio com seis paradas, reordenar, editar, e comparar a página com o protótipo A.
- [x] Abrir um passeio antigo do banco de desenvolvimento.
