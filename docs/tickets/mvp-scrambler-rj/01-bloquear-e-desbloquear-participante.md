---
id: 01
title: Bloquear e desbloquear participante
status: done
blocked_by: []
source: docs/specs/mvp-scrambler-rj.md — "Pedido de ingresso" (tabela de estados, linhas Aprovado e Bloqueado), "Acesso", cenário de aceite "Bloqueio"
---

# 01 — Bloquear e desbloquear participante

## What To Build

O painel de gerenciamento ganha uma tela de participantes que lista as pessoas aprovadas e bloqueadas. Um administrador bloqueia um participante aprovado e desbloqueia um bloqueado. A pessoa bloqueada vê a tela informando que o acesso está suspenso e não abre nenhuma área do grupo, nem por link direto. O bloqueio não apaga nada: o pedido de ingresso, as decisões anteriores e (quando existirem) pedidos, pagamentos e presenças continuam registrados. Cada bloqueio e desbloqueio registra autor e data, no mesmo histórico de decisões de acesso já usado em aprovar, reprovar e reverter.

O WhatsApp dos participantes aparece nessa tela só porque ela é administrativa; nenhuma tela de participante o expõe.

## User Stories Covered

- 18. Bloquear um participante já aprovado preservando suas participações anteriores.

## Acceptance Criteria

- [x] Administrador vê a lista de participantes aprovados e bloqueados, com nome, moto e situação.
- [x] Bloquear um aprovado muda a situação para Bloqueado e registra autor e data.
- [x] Desbloquear um bloqueado devolve a situação para Aprovado e registra autor e data.
- [x] A pessoa bloqueada, no próximo acesso ou ao recarregar, vê o aviso de acesso suspenso e é barrada em qualquer rota do grupo, inclusive por link direto.
- [x] Bloquear só vale para quem está Aprovado; desbloquear só para quem está Bloqueado. Estado diferente retorna erro claro.
- [x] Conta de participante não abre a tela nem consegue bloquear ou desbloquear por chamada direta.
- [x] Os registros anteriores do bloqueado permanecem consultáveis pelos administradores.
- [x] Textos usam "grupo" e "participantes"; ação destrutiva pede confirmação.

## Blocked By

None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviço de acesso — bloquear e desbloquear, cobrindo transições válidas e inválidas, permissão de administrador, registro de autor/data e o estado de acesso retornado para a pessoa bloqueada.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador (celular e desktop): admin bloqueia, a outra conta é barrada por link direto, admin desbloqueia e o acesso volta.
