---
id: 10
title: Previsão do tempo
status: pending
blocked_by: [07]
source: docs/specs/passeios-roteiro-e-mapa.md — decisão "Previsão do tempo"
---

# 10 — Previsão do tempo

## What To Build

A partir de sete dias antes do passeio, a página mostra a temperatura e a chance de chuva no ponto de encontro, na hora da saída, e no destino, na hora prevista, junto do plano B.

## User Stories Covered

- 15. Ver a previsão no encontro e no destino quando o passeio estiver próximo.

## Acceptance Criteria

- [ ] Usa o Open-Meteo, sem chave; a consulta acontece no servidor e o resultado é guardado por até três horas.
- [ ] Aparece só dentro da janela de sete dias e só para paradas com coordenadas.
- [ ] Cada ponto mostra ícone do céu, temperatura e chance de chuva, com o lugar e a hora.
- [ ] Fora da janela, sem coordenadas ou com o serviço fora do ar, o bloco mostra só o plano B, e some quando não há plano B; a página nunca quebra por causa do clima.
- [ ] Depois do passeio, a previsão não aparece.
- [ ] O serviço de clima entra por interface com substituto de teste.

## Blocked By

- 07 — Mapa com rota calculada.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios com o substituto de clima e a data injetada — janela de sete dias, reuso do valor guardado, ausência de coordenadas, falha do serviço, passeio passado.

## Verification

- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador, com um passeio daqui a três dias e o serviço real: conferir os valores contra um site de previsão.
