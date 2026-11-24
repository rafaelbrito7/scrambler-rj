---
id: 07
title: Ficha completa para o administrador
status: done
blocked_by: [05, 06]
source: docs/specs/perfis-dos-participantes.md — tabela "Quem vê o quê" (coluna Administrador), "Pessoal do grupo" (bloqueados); .impeccable/surfaces/src-app-perfil-page-tsx.md — "Para administrador, um bloco extra"
---

# 07 — Ficha completa para o administrador

## What To Build

Para um administrador, o perfil de qualquer pessoa ganha o bloco "Só administradores": WhatsApp, tamanho de roupa e dados de emergência, com o telefone do contato de emergência e o WhatsApp como links de ligação. A tela de participantes do painel leva à ficha de cada pessoa, inclusive de quem está bloqueado, que aparece com o selo "Bloqueado".

## User Stories Covered

- 33. Abrir a ficha completa de um participante.
- 34. Chegar à ficha a partir da tela de participantes.
- 35. Ver a ficha de quem está bloqueado.
- 36. Ligar para o contato de emergência com um toque.

## Acceptance Criteria

- [x] O administrador vê WhatsApp, tamanho e dados de emergência no perfil de qualquer pessoa.
- [x] O telefone de emergência e o WhatsApp são links que iniciam ligação ou conversa.
- [x] Dados de emergência vazios aparecem como "não informado", sem campo em branco.
- [x] Cada nome na tela de participantes do painel abre a ficha.
- [x] A ficha de pessoa bloqueada abre para administrador, com o selo "Bloqueado".
- [x] Um participante que tenta a leitura de administrador por chamada direta é recusado.
- [x] O bloco é identificado como visível só a administradores.
- [x] O administrador não edita o perfil de outra pessoa.

## Blocked By

- 05 — ticket anterior desta pasta.
- 06 — ticket anterior desta pasta.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — leitura de administrador, com todos os campos, inclusive de pessoa bloqueada, e a recusa dessa leitura a quem não é administrador.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador (celular e desktop): abrir a ficha pelo painel; conferir os links de ligação; tentar a mesma tela como participante.
