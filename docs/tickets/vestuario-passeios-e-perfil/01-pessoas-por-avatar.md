---
id: 01
title: Pessoas por avatar: fileira e janela
status: done
blocked_by: []
source: docs/specs/vestuario-passeios-e-perfil.md — decisões "Pessoas por avatar", "Onde a lista continua" e "Cartão de pessoa"; DESIGN.md — "People stack"
---

# 01 — Pessoas por avatar: fileira e janela

## What To Build

Toda contagem de pessoas vista por riders vira uma fileira de avatares sobrepostos com a contagem em palavras. Tocar abre uma janela com cada pessoa: avatar, nome do grupo, @ do Instagram e "Ver perfil". Vale nos cartões do Início, na página do passeio e na página da campanha.

## User Stories Covered

- 15. Ver as pessoas de uma contagem pelos rostos.
- 16. Tocar na contagem e ver nome, Instagram e o caminho para o perfil.
- 17. Contagem escrita ao lado dos avatares.
- 22. Pessoa bloqueada fora das fileiras.

## Acceptance Criteria

- [x] A fileira mostra até cinco rostos e "+n" para o restante; nas páginas de passeio e de campanha, até oito.
- [x] A contagem em palavras fica sempre ao lado; sem ninguém, não há botão, só a frase.
- [x] A janela lista cada pessoa com avatar, nome do grupo, Instagram quando informado e "Ver perfil", que leva a "Meu perfil" quando é a própria pessoa.
- [x] A janela fecha com Escape, com "Fechar" e com o toque fora.
- [x] O servidor entrega só nome, apelido, foto, foto da conta e Instagram, e só de pessoas aprovadas e não bloqueadas.
- [x] Cartões de passeio e de campanha no Início, respostas e "Quem foi" na página do passeio e "Pedidos do grupo" na página da campanha usam a fileira.
- [x] A lista de pedidos da campanha e a correção de presença do administrador continuam como lista.

## Blocked By

- None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviços de passeios e de pedidos — cada contagem devolve as pessoas correspondentes; pedido cancelado e pessoa fora do grupo não entram.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, como administrador, desktop e celular: abrir a janela de uma fileira e seguir para um perfil.
- [x] Conferido com a conta de rider comum em 2026-11-23 (ticket 09).
