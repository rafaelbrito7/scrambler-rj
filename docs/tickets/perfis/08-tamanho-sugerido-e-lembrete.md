---
id: 08
title: Tamanho sugerido no lote e lembrete de perfil
status: done
blocked_by: [02, 03]
source: docs/specs/perfis-dos-participantes.md — "Tamanho sugerido no lote", "Lembrete de completar o perfil"; .impeccable/surfaces/src-app-perfil-page-tsx.md — "Lembrete no Início"
---

# 08 — Tamanho sugerido no lote e lembrete de perfil

## What To Build

Ao pedir uma peça, a linha do tamanho guardado no perfil vem marcada como "seu tamanho" quando o lote oferece esse tamanho; nenhuma quantidade é pré-preenchida. No Início, enquanto a pessoa não tiver foto nem tamanho, aparece uma linha discreta com "Completar perfil" e "Agora não". Dispensar esconde a linha de vez para aquela pessoa.

## User Stories Covered

- 16. Ver o tamanho destacado ao pedir uma peça.
- 17. Pedir um tamanho diferente do guardado.
- 39. Ser lembrado de completar o perfil sem ser obrigado.

## Acceptance Criteria

- [x] A marca "seu tamanho" aparece só quando o lote oferece o tamanho guardado.
- [x] Sem tamanho guardado, a tela do lote fica como hoje.
- [x] A marca não muda nenhuma quantidade nem impede pedir outro tamanho.
- [x] O lembrete aparece quando faltam foto e tamanho, e some quando a pessoa preenche um deles ou dispensa.
- [x] A dispensa é guardada no servidor e vale em outro aparelho.
- [x] O lembrete não usa laranja cheio nem bloqueia nenhuma ação do Início.
- [x] A marca é lida por leitor de tela junto do tamanho.

## Blocked By

- 02 — ticket anterior desta pasta.
- 03 — ticket anterior desta pasta.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — regra que decide se o lembrete aparece e a dispensa gravada; e a função que decide o tamanho sugerido a partir do perfil e dos tamanhos do lote.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: guardar M e abrir um lote com e sem M; dispensar o lembrete e recarregar.
