---
id: 08
title: Abrir no Google Maps e por parada
status: done
blocked_by: [07]
source: docs/specs/passeios-roteiro-e-mapa.md — decisão "Abrir fora"
---

# 08 — Abrir no Google Maps e por parada

## What To Build

A página do passeio ganha "Abrir no Google Maps", com a rota e as paradas, e cada parada com coordenadas ganha "Abrir no mapa", que abre aquele ponto no aplicativo de mapa do aparelho.

## User Stories Covered

- 5. Abrir uma parada no aplicativo de mapa.
- 13. Abrir a rota inteira no Google Maps.

## Acceptance Criteria

- [x] O link da rota usa as paradas com coordenadas, na ordem, com modo de duas rodas, respeitando o limite de nove paradas e de 2.048 caracteres. O limite foi lido como o do Google: encontro, destino e até nove paradas no caminho.
- [x] Quando há mais paradas que o limite, ficam encontro, destino e as intermediárias na ordem, e a página diz que o link leva parte do roteiro.
- [x] Cada parada com coordenadas tem seu próprio link, que funciona com Google Maps e Waze. São dois links por parada, "Abrir no mapa" (Google Maps) e "Abrir no Waze": um endereço só não abre o seletor de aplicativos no iPhone nem no desktop.
- [x] Parada sem coordenadas não mostra o link.
- [x] O link antigo de mapa dos passeios já publicados continua aparecendo onde existe, agora como "Abrir link do mapa", para não se confundir com o da parada.
- [x] Passeio sem nenhuma parada com coordenadas não mostra o botão da rota.

## Blocked By

- 07 — Mapa com rota calculada.

## Execution Bundle

- tdd
- Test Seam: funções puras que montam o endereço da rota e o de um ponto, com 2, 9 e 12 paradas e com paradas sem coordenadas.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] Em 2026-11-23, no navegador: a página de um passeio com cinco paradas, três com coordenadas, mostra os links só nessas três, sem rolagem horizontal a 375 px; o link da rota abriu no Google Maps com as três paradas e o modo moto.
- [ ] Abrir os links num celular real, com os aplicativos do Google Maps e do Waze instalados. Não conferido: o endereço do Waze e o de um ponto não foram abertos.
