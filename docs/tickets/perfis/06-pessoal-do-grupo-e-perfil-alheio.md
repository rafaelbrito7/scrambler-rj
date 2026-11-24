---
id: 06
title: Pessoal do grupo e perfil de outra pessoa
status: done
blocked_by: [01]
source: docs/specs/perfis-dos-participantes.md — "Pessoal do grupo", "Quem vê o quê", "Navegação"; .impeccable/surfaces/src-app-perfil-page-tsx.md — "Pessoal do grupo" e "Perfil de outra pessoa"
---

# 06 — Pessoal do grupo e perfil de outra pessoa

## What To Build

O menu ganha "Grupo", que abre a lista dos participantes aprovados em ordem alfabética, cada linha com foto ou iniciais, nome ou apelido, moto principal e a marca de administrador. Cada linha abre o perfil da pessoa: foto grande, apelido e nome, Instagram quando houver e as motos. Nas listas de presença dos passeios e de pedidos dos lotes, cada nome passa a levar ao perfil.

O servidor entrega a outro participante uma forma de perfil que não contém WhatsApp, tamanho nem dados de emergência.

## User Stories Covered

- 25. Abrir "Pessoal do grupo".
- 26. Ver nome ou apelido, foto e moto principal de cada pessoa.
- 27. Abrir o perfil de outra pessoa.
- 28. Ir ao perfil a partir da lista de presença.
- 29. Ir ao perfil a partir da lista de pedidos.
- 30. Não ver telefone nem emergência de outra pessoa.
- 31. Quem não está aprovado não abre perfil nem lista.
- 32. Não ver bloqueados na lista.
- 44. Abrir o Instagram de outra pessoa.

## Acceptance Criteria

- [x] A lista mostra só aprovados, em ordem alfabética pelo nome exibido, com a contagem no título.
- [x] A linha inteira é clicável, com alvo de toque de 56px.
- [x] O perfil de outra pessoa mostra foto, apelido, nome, Instagram e motos, com a principal primeiro.
- [x] O Instagram abre o perfil no Instagram em outra aba.
- [x] A resposta do servidor para outro participante não contém WhatsApp, tamanho nem dados de emergência.
- [x] Perfil de pessoa bloqueada, por link direto, é "não encontrado" para participante.
- [x] Pessoa em avaliação, reprovada ou bloqueada não abre a lista nem um perfil.
- [x] Os nomes nas listas de presença e de pedidos levam ao perfil.
- [x] Abrir o próprio perfil pela lista leva a "Meu perfil".
- [x] A lista funciona com uma pessoa só e com apelido longo.

## Blocked By

- 01 — ticket anterior desta pasta.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — lista do grupo e leitura do perfil de outra pessoa, verificando campo a campo o que a forma de participante contém, a ausência de bloqueados e a recusa a quem não está aprovado.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador com duas contas (celular e desktop): abrir a lista, um perfil, um nome numa lista de presença; bloquear alguém e conferir o link direto.
