---
id: 06
title: Correção de presença
status: done
blocked_by: []
source: docs/specs/perfis-dos-participantes.md — "Terceira edição", decisão "Passeio feito"
---

# 06 — Correção de presença

## What To Build

Depois da data de um passeio, o administrador ajusta quem de fato foi: tira quem respondeu "Vou" e faltou, e inclui quem foi sem ter respondido. A partir daí existe, para cada rider e passeio, a noção de presença válida, que a galeria e, mais tarde, o histórico e os selos usam.

## User Stories Covered

- 97. O "Vou" conta sozinho depois da data.
- 98. Tirar da contagem quem não apareceu.
- 99. Incluir quem foi sem responder.
- 100. Corrigir na própria página do passeio.
- 101. Passeio cancelado não conta.

## Acceptance Criteria

- [x] Presença válida: passeio não cancelado, data de saída já passada, e a pessoa respondeu "Vou" ou foi incluída por um administrador, e não foi retirada por um administrador.
- [x] A correção só é possível depois do horário de saída e só por administradores.
- [x] Cada correção guarda autor e data, e pode ser desfeita.
- [x] Só riders aprovados podem ser incluídos.
- [x] Na página do passeio, depois da data, o administrador vê a lista de quem conta e as ações de tirar e incluir; os riders veem a lista de quem foi, sem as ações.
- [x] Um serviço responde, para um rider e um passeio, se a presença vale, e lista quem tem presença válida num passeio.
- [x] Passeios realizados antes desta mudança contam pelas respostas que têm.

## Blocked By

- None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviço de passeios — presença válida nos casos "Vou", "Não vou", sem resposta, futuro e cancelado; correção nos dois sentidos; desfazer; rider não corrige; autor e data gravados. A data atual é injetada.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, com um passeio de data passada: tirar um rider, incluir outro, desfazer, e conferir a lista com conta de rider.
