---
id: 05
title: Adicionar à agenda
status: done
blocked_by: [01]
source: docs/specs/passeios-roteiro-e-mapa.md — decisão "Agenda"
---

# 05 — Adicionar à agenda

## What To Build

Na página do passeio, "Adicionar à agenda" baixa um arquivo .ics que abre no calendário do aparelho com o passeio já preenchido.

## User Stories Covered

- 22. Adicionar o passeio à agenda com um toque.

## Acceptance Criteria

- [x] O arquivo tem título, início no horário de encontro (ou de saída, quando não há encontro), fim na previsão de retorno, local do encontro e, na descrição, a distância (quando existe) e o endereço da página do passeio.
- [x] Os horários saem corretos no fuso de Brasília, qualquer que seja o relógio do servidor.
- [x] O arquivo só é entregue a riders aprovados.
- [x] O botão não aparece em passeio cancelado.
- [ ] O arquivo abre no calendário do iOS e do Google sem aviso de erro. (Não conferido: precisa de um aparelho real.)

## Blocked By

- 01 — Roteiro em paradas.

## Execution Bundle

- tdd
- Test Seam: função pura que gera o .ics a partir de um passeio, conferida campo a campo, e a rota de entrega recusando quem não está aprovado.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] Baixar o arquivo no navegador e abri-lo num aplicativo de calendário. (Baixado e lido; não aberto num aplicativo.)
- [x] Pedir o arquivo sem estar logado.
