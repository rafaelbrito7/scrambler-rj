---
id: 02
title: Promover administrador e proteger o último administrador
status: done
blocked_by: [01]
source: docs/specs/mvp-scrambler-rj.md — "Acesso" (poderes iguais; nunca deixar o grupo sem administrador ativo), cenário de aceite "Concorrência e permissões"
---

# 02 — Promover administrador e proteger o último administrador

## What To Build

Na tela de participantes do painel, um administrador promove um participante aprovado a administrador e pode retirar o papel de administrador de outra pessoa. Todos os administradores têm poderes iguais. Qualquer mudança de papel ou de acesso que deixaria o grupo sem administrador ativo (aprovado e não bloqueado) é recusada no servidor, inclusive quando duas solicitações chegam ao mesmo tempo. A regra vale também para o bloqueio entregue no ticket 01.

## User Stories Covered

- 19. Promover outro participante a administrador.

## Acceptance Criteria

- [x] Administrador promove um participante aprovado; a pessoa promovida passa a ver o painel no próximo acesso.
- [x] Administrador retira o papel de outro administrador; a pessoa volta a ser participante.
- [x] Retirar o papel ou bloquear o único administrador ativo é recusado com mensagem clara.
- [x] Duas solicitações simultâneas que, juntas, zerariam os administradores resultam em apenas uma aceita.
- [x] Só pessoas aprovadas podem ser promovidas.
- [x] Conta de participante não consegue promover nem rebaixar por chamada direta.
- [x] Cada mudança de papel registra autor e data.

## Blocked By

- 01 — Bloquear e desbloquear participante (usa a tela de participantes e estende a regra de bloqueio).

## Execution Bundle

- tdd
- Test Seam: serviço de acesso — promover, rebaixar e bloquear, cobrindo a recusa da última administração e a corrida entre duas solicitações concorrentes.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: promover uma conta de teste, confirmar acesso ao painel; tentar rebaixar e bloquear o único admin e ver a recusa.
