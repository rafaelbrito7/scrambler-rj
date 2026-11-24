---
id: 02
title: Ficha da rota
status: done
blocked_by: [01]
source: docs/specs/passeios-roteiro-e-mapa.md — decisões "Ficha da rota", "Resumo de divulgação", "Página do passeio"
---

# 02 — Ficha da rota

## What To Build

Todo passeio novo tem distância total, tipo de piso e dificuldade; tempo de rolé e pedágios são opcionais. A página mostra a ficha em quadros com ícone, o cartão do passeio no Início mostra distância e dificuldade, e o resumo copiado para o WhatsApp traz encontro, distância e tempo de rolé. Neste ticket a distância e o tempo são digitados; o cálculo vem com o mapa.

## User Stories Covered

- 7–10. Ver distância, tempo de rolé, piso, dificuldade e pedágios.
- 32–34. Informar piso e dificuldade por opções; não publicar sem a ficha mínima; publicar digitando a distância.
- 56. Resumo do WhatsApp com os números.

## Acceptance Criteria

- [x] Distância em quilômetros inteiros, piso (asfalto, terra, misto) e dificuldade (leve, moderado, exigente) são obrigatórios para publicar um passeio novo e na primeira vez que um antigo ganha roteiro.
- [x] Tempo de rolé (horas e minutos) e pedágios (reais) são opcionais.
- [x] Um passeio antigo sem ficha abre sem o bloco e sem erro.
- [x] A ficha aparece em quadros com ícone, rótulo e valor; quadro de dado não informado não aparece.
- [x] O cartão do passeio no Início mostra distância e dificuldade quando existem.
- [x] O resumo de divulgação inclui horário de encontro, distância e tempo de rolé quando existem, e nada além disso de novo.
- [x] A dificuldade não impede nenhuma resposta.

## Blocked By

- 01 — Roteiro em paradas.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios — publicar com e sem a ficha mínima, e o texto de `buildRideShareText`.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, celular e desktop: publicar sem distância (recusa), publicar completo, conferir página, cartão do Início e o texto copiado.
