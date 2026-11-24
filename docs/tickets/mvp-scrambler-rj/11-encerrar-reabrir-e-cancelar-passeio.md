---
id: 11
title: Encerrar, reabrir e cancelar passeio
status: done
blocked_by: [10]
source: docs/specs/mvp-scrambler-rj.md — "Passeios" (encerramento, reabertura, cancelamento), "Início e navegação", cenário de aceite "Passeio e divulgação" (última frase)
---

# 11 — Encerrar, reabrir e cancelar passeio

## What To Build

O administrador controla manualmente as confirmações do passeio. Encerrar congela as respostas e tira o passeio de "Campanhas ativas". Reabrir devolve o passeio ao Início e permite novas alterações. Cancelar sinaliza que o passeio não vai acontecer, impede confirmações e tira o passeio do Início, preservando as respostas já dadas como histórico. O participante vê a situação atual na página do passeio.

## User Stories Covered

- 31. Cancelar campanhas permitidas sem perder o histórico das inscrições (parte de passeios).
- 36. Encerrar, reabrir as confirmações ou cancelar o passeio.

## Acceptance Criteria

- [x] Encerrar bloqueia mudanças de resposta no servidor, inclusive a partir de uma página carregada antes.
- [x] Reabrir permite alterar respostas de novo.
- [x] Cancelar impede confirmações e mostra a situação de cancelado na página do passeio.
- [x] Passeio encerrado ou cancelado sai do Início; as respostas permanecem consultáveis.
- [x] Só administradores executam essas ações, inclusive por chamada direta.
- [x] Ação de cancelar pede confirmação.

## Blocked By

- 10 — Publicar passeio e responder presença.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios — encerrar, reabrir e cancelar, cobrindo a recusa de resposta fora do estado aberto e a preservação das respostas.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador com duas contas: encerrar e tentar responder; reabrir e responder; cancelar e conferir o aviso.
