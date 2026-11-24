---
id: 04
title: Motos do participante
status: done
blocked_by: [01]
source: docs/specs/perfis-dos-participantes.md — "Motos", "Consistência"; .impeccable/surfaces/src-app-perfil-page-tsx.md — "Motos ficam fora do formulário"
---

# 04 — Motos do participante

## What To Build

No bloco Motos de "Meu perfil", a pessoa adiciona uma moto, edita modelo, cilindrada, ano e cor, escolhe qual é a principal e remove uma moto vendida. Cada ação salva na hora, sem passar pelo formulário de dados pessoais. A principal aparece primeiro e com o selo "Principal". Remover pede confirmação; a última moto não mostra "Remover".

## User Stories Covered

- 9. Corrigir modelo e cilindrada.
- 10. Informar ano e cor.
- 11. Cadastrar mais de uma Scrambler.
- 12. Escolher a principal.
- 13. Remover uma moto vendida.
- 14. Ser impedido de ficar sem moto.

## Acceptance Criteria

- [x] Modelo e cilindrada são obrigatórios, com as regras do pedido de ingresso; ano e cor são opcionais, e o ano precisa ser plausível.
- [x] Uma pessoa tem de uma a cinco motos; a sexta é recusada.
- [x] Existe exatamente uma principal, mesmo com dois pedidos simultâneos de "tornar principal".
- [x] Remover a principal passa o título à mais antiga das restantes.
- [x] Remover a última moto é recusado, inclusive por chamada direta e com duas remoções simultâneas.
- [x] Uma pessoa só mexe nas próprias motos.
- [x] Cada ação mostra confirmação e mantém a pessoa em "Meu perfil".
- [x] A lista de motos é confortável no celular.

## Blocked By

- 01 — ticket anterior desta pasta.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — adicionar, editar, tornar principal e remover moto, cobrindo os limites, a regra da principal, a última moto e as corridas entre pedidos simultâneos.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador (celular e desktop): adicionar a segunda moto, torná-la principal, remover a primeira e tentar remover a última.
