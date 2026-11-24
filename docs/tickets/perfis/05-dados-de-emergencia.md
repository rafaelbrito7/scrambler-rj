---
id: 05
title: Dados de emergência
status: done
blocked_by: [02]
source: docs/specs/perfis-dos-participantes.md — "Dados do perfil", "Dados de emergência são sensíveis", tabela "Quem vê o quê"; .impeccable/surfaces/src-app-perfil-page-tsx.md — bloco "Em caso de emergência"
---

# 05 — Dados de emergência

## What To Build

O formulário de editar perfil ganha o bloco "Em caso de emergência": nome do contato, telefone e tipo sanguíneo. Tudo é opcional, o cabeçalho do bloco diz que só administradores veem, e um comando apaga os três de uma vez. "Meu perfil" mostra os dados à própria pessoa, ou um convite a preencher quando estão vazios.

## User Stories Covered

- 18. Informar um contato de emergência.
- 19. Informar o tipo sanguíneo.
- 20. Deixar os dados de emergência em branco.
- 21. Apagar os dados de emergência.

## Acceptance Criteria

- [x] Nome e telefone do contato vão juntos: um sem o outro é recusado.
- [x] O telefone segue a regra do WhatsApp (DDD e número).
- [x] O tipo sanguíneo aceita os oito tipos ou "não sei".
- [x] Salvar com o bloco em branco é aceito.
- [x] "Apagar dados de emergência" pede confirmação e remove os três campos.
- [x] O bloco diz, antes dos campos, que só administradores veem esses dados.
- [x] Os dados de emergência não aparecem no PDF, no resumo de divulgação nem em nenhuma leitura feita por outro participante.

## Blocked By

- 02 — ticket anterior desta pasta.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — gravar, validar e apagar os dados de emergência; e a garantia de que eles não saem na forma de perfil lida por outro participante nem no relatório.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: preencher, salvar, apagar; conferir que o PDF de um lote não traz nada disso.
