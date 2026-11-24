---
id: 03
title: Leve com você e plano B
status: done
blocked_by: [01]
source: docs/specs/passeios-roteiro-e-mapa.md — decisões "Leve com você: recomendações de uma lista", "Plano B"
---

# 03 — Leve com você e plano B

## What To Build

Ao publicar ou editar um passeio, o administrador marca numa lista pronta as recomendações do que levar, cada uma com texto e ícone, e pode acrescentar uma observação livre e um plano B para chuva. A página mostra os itens marcados com ícone, a observação abaixo deles, e o plano B em destaque próprio.

## User Stories Covered

- 16. Saber o plano B em caso de chuva.
- 19, 20. Ver o que levar em itens com ícone e a observação extra.
- 37–39. Marcar recomendações da lista, acrescentar observação e escrever o plano B.

## Acceptance Criteria

- [x] As recomendações ficam no banco de dados; as quatorze da spec entram prontas pela migração, cada uma com texto, ícone e posição.
- [x] O painel tem uma tela de recomendações em que o administrador inclui, renomeia, troca o ícone (de um conjunto fixo), reordena, desativa e reativa; riders não acessam, nem por chamada direta.
- [x] Recomendação desativada some da escolha em passeios novos e continua aparecendo nos passeios que já a usam; nenhuma é apagada.
- [x] O administrador marca quantos quiser, ou nenhum; recomendação inexistente é recusada no servidor.
- [x] Observação livre até 200 caracteres; plano B até 280.
- [x] Na página, os itens aparecem na ordem da lista, não na ordem em que foram marcados.
- [x] Sem itens e sem observação, o bloco "Leve com você" não aparece; sem plano B, o bloco dele não aparece.
- [x] No formulário, marcar recomendações funciona bem no celular (alvos de 48px, rótulos legíveis).

## Blocked By

- 01 — Roteiro em paradas.
- Lista conferida pelo usuário em 2026-11-17, que pediu as recomendações no banco de dados, mantidas pelos administradores no painel.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios — guardar e ler a seleção, a ordem, a recusa de recomendação inexistente; e a manutenção da lista (incluir, renomear, reordenar, desativar) com o efeito nos passeios novos e nos já publicados.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, celular e desktop: marcar cinco itens, escrever observação e plano B, conferir a página; desmarcar tudo e conferir que os blocos somem.
