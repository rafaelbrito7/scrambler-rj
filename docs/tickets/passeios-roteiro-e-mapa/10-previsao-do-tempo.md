---
id: 10
title: Previsão do tempo
status: done
blocked_by: [07]
source: docs/specs/passeios-roteiro-e-mapa.md — decisão "Previsão do tempo"
---

# 10 — Previsão do tempo

## What To Build

A partir de sete dias antes do passeio, a página mostra a temperatura e a chance de chuva no ponto de encontro, na hora da saída, e no destino, na hora prevista, junto do plano B.

## User Stories Covered

- 15. Ver a previsão no encontro e no destino quando o passeio estiver próximo.

## Acceptance Criteria

- [x] Usa o Open-Meteo, sem chave; a consulta acontece no servidor e o resultado é guardado por até três horas. Guardado na memória do processo do servidor, não no banco: reiniciar esvazia.
- [x] Aparece só dentro da janela de sete dias e só para paradas com coordenadas.
- [x] Cada ponto mostra ícone do céu, temperatura e chance de chuva, com o lugar e a hora.
- [x] Fora da janela, sem coordenadas ou com o serviço fora do ar, o bloco mostra só o plano B, e some quando não há plano B; a página nunca quebra por causa do clima.
- [x] Depois do passeio, a previsão não aparece. Some já na hora da saída, que é quando o passeio passa a contar como realizado.
- [x] O serviço de clima entra por interface com substituto de teste.

## Blocked By

- 07 — Mapa com rota calculada.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios com o substituto de clima e a data injetada — janela de sete dias, reuso do valor guardado, ausência de coordenadas, falha do serviço, passeio passado.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] Em 2026-11-24, no navegador, com o serviço real e um passeio três dias à frente: encontro às 7h30 com 24° e 40% de chance de chuva, destino às 12h com 18° e 86%, iguais à consulta direta ao Open-Meteo para as 8h e as 12h. Com o passeio de volta a 18 dias, o bloco some e fica só o plano B.
- [ ] Conferir os valores contra outro site de previsão. Não conferido: a comparação foi com o próprio Open-Meteo, o que prova a leitura, não a qualidade da previsão.

## Decisões de implementação

- A previsão é por hora: pede-se a hora cheia mais próxima (saída às 7h30 consulta as 8h) e o lugar arredondado a cerca de um quilômetro.
- O destino sem horário, ou com horário que não vem depois da saída, fica sem previsão.
- Os dois pontos são consultados ao mesmo tempo, com limite de quatro segundos; uma falha fica guardada por dez minutos, para um serviço fora do ar não atrasar cada visita.
- A página credita o Open-Meteo, como a licença dos dados pede.

## Revisão (2026-11-24)

Duas revisões independentes, Standards e Spec. Corrigido: consultas em paralelo e falha guardada por dez minutos (antes a página podia esperar até oito segundos a cada visita com o serviço fora do ar); hora arredondada em vez de truncada; destino com horário antes da saída; entradas vencidas saem da memória; texto "atualizada a cada três horas" retirado; checagem de acesso duplicada e rótulos de interface saíram do serviço.
