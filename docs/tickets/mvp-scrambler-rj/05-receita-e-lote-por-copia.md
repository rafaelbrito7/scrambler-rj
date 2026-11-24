---
id: 05
title: Receita e lote por cópia
status: done
blocked_by: [03]
source: docs/specs/mvp-scrambler-rj.md — "Receita e lote", cenário de aceite "Receita → lote → pedido" (primeiras três frases)
---

# 05 — Receita e lote por cópia

## What To Build

No painel, o administrador salva e edita receitas: modelo, preço unitário, tamanhos e pares de cor e foto. Ao abrir um lote, pode partir de uma receita: o formulário de lote vem preenchido com uma cópia independente, editável antes da abertura. Mudar a receita depois afeta apenas usos futuros; mudar a cópia afeta apenas aquele lote.

## User Stories Covered

- 22. Salvar e editar uma receita para reutilizar em campanhas futuras.
- 23. Abrir um lote pela receita e ajustar a cópia para aquela edição.

## Acceptance Criteria

- [x] Administrador cria, lista e edita receitas.
- [x] Abrir lote a partir de uma receita preenche modelo, preço, tamanhos e cores/fotos, e permite ajustar antes de abrir.
- [x] Dois lotes abertos pela mesma receita, com ajuste só no segundo, mantêm cada um seus dados.
- [x] Editar a receita depois não altera nenhum lote já criado.
- [x] Editar um lote não altera a receita.
- [x] As mesmas validações de abertura do ticket 03 se aplicam ao lote vindo de receita.
- [x] Conta de participante não acessa receitas, nem por chamada direta.

## Blocked By

- 03 — Abrir lote direto e ver no Início.

## Execution Bundle

- tdd
- Test Seam: serviço de receitas e lotes — abrir lote a partir de receita e comprovar a independência entre receita e cópia nas duas direções.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: executar o cenário dos dois lotes da mesma receita e conferir os dados de ambos após editar a receita.
