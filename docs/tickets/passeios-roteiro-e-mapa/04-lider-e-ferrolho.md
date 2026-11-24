---
id: 04
title: Líder e ferrolho
status: cancelled
blocked_by: [01]
source: docs/specs/passeios-roteiro-e-mapa.md — decisão "Líder e ferrolho"
---

# 04 — Líder e ferrolho

## Cancelado

Retirado pelo usuário em 2026-11-17: o grupo não tem líder nem ferrolho, anda junto. Chegou a ser implementado no serviço e foi desfeito no mesmo dia (código, testes, colunas e migração removidos). Não implementar.

## What To Build

O administrador escolhe, entre os riders do grupo, quem lidera e quem fecha o comboio de um passeio. Os dois aparecem na página com foto e nome, levando ao perfil.

## User Stories Covered

- 17, 18. Ver líder e ferrolho com foto e abrir o perfil.
- 35, 36. Escolher na lista de riders e trocar até o dia.

## Acceptance Criteria

- [ ] Líder e ferrolho são opcionais e escolhidos entre riders aprovados e não bloqueados.
- [ ] A mesma pessoa não ocupa os dois papéis.
- [ ] Podem ser trocados e removidos enquanto o passeio não foi cancelado.
- [ ] Se a pessoa for bloqueada depois, o papel aparece vago, sem erro.
- [ ] Na página aparecem com avatar, papel e nome exibido (apelido quando existe), e o link leva ao perfil (ou a "Meu perfil" quando é a própria pessoa).
- [ ] Ser líder ou ferrolho não cria nem altera a resposta de presença da pessoa.
- [ ] A escolha no formulário funciona com dezenas de riders (busca ou lista rolável), no celular.

## Blocked By

- 01 — Roteiro em paradas.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios — definir, trocar e remover os papéis, as recusas (mesma pessoa, não aprovado, bloqueado) e a leitura depois de um bloqueio.

## Verification

- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador, celular e desktop: escolher os dois, conferir a página, trocar um, bloquear o outro no painel e reabrir a página.
