---
id: 05
title: Foto, apelido e autonomia da moto
status: done
blocked_by: [04]
source: docs/specs/perfis-dos-participantes.md — "Segunda edição — mais dados de perfil e de moto", decisões "Foto da moto", "Apelido e autonomia", "Quem vê o quê"
---

# 05 — Foto, apelido e autonomia da moto

## What To Build

Cada moto pode ter uma foto, um apelido e a autonomia em quilômetros. Aparecem no perfil da pessoa e no perfil visto por outro rider. A tela Riders mostra a foto da moto principal de cada pessoa, quando houver.

## User Stories Covered

- 69. Enviar uma foto de cada moto.
- 70. Trocar ou remover a foto.
- 71. Dar um apelido à moto.
- 72. Informar a autonomia em quilômetros.
- 75. Ver foto, apelido e autonomia das motos de outra pessoa.
- 76. Ver a foto da moto principal na tela Riders.

## Acceptance Criteria

- [x] Uma foto por moto, com as mesmas regras de envio, troca e remoção da foto de perfil, pelo `PhotoStorage`.
- [x] A foto só é entregue a riders aprovados.
- [x] Remover a moto remove a foto do armazenamento.
- [x] Apelido aceita até 40 caracteres; autonomia é um inteiro entre 50 e 1.000; ambos opcionais e apagáveis.
- [x] Moto sem foto mostra um estado vazio discreto, sem imagem quebrada.
- [x] A tela Riders mostra a foto da moto principal quando existe e continua legível quando não existe.
- [x] As imagens têm proporção fixa e não deformam.

## Blocked By

- 04 — Modelo da moto por lista.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — `addBike` e `updateBike` com foto, apelido e autonomia; remoção da moto apagando a foto; as leituras para outro rider.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, celular e desktop: enviar, trocar e remover a foto; conferir a tela Riders com e sem foto.
- [x] Tentar abrir o endereço da foto sem estar aprovado.
