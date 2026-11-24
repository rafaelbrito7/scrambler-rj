# Provedores de mapa, rota e clima

Type: research
Status: resolved
Parent: [Mapa — evolução de perfil, motos e passeios](../map.md)
Blocked by: none

## Question

Quais serviços atendem um grupo pequeno (dezenas de riders, poucos passeios por mês) para: mostrar um mapa com traçado e paradas, calcular distância e duração de uma rota de moto, importar GPX ou link do Google Maps, abrir a rota no Google Maps e no Waze com as paradas, e mostrar previsão do tempo? Comparar Google Maps Platform, Mapbox e OpenStreetMap (Leaflet/MapLibre com OSRM ou OpenRouteService) e, para clima, Open-Meteo e alternativas: preço atual, cota grátis, exigência de cartão, termos de uso, limites dos links de abertura (número de paradas) e esforço de integração em Next.js.

## Answer

Achados completos em [docs/research/provedores-de-mapa-rota-e-clima.md](../../../research/provedores-de-mapa-rota-e-clima.md). Nenhuma escolha feita aqui; a escolha é do ticket "Mapa na página do passeio".

- Três combinações viáveis, todas perto de US$ 0/mês no uso do grupo: tudo Google (único com rota de moto com Brasil na cobertura; exige faturamento ativado e orienta não guardar o resultado da rota); MapLibre com Stadia ou MapTiler e Open-Meteo (grátis só como "não comercial", US$ 20 a 30/mês fora disso; traçado pode ser guardado); Mapbox com Open-Meteo (sem perfil de moto, até 25 pontos).
- Abrir no Google Maps: até 9 paradas, 3 em navegador de celular. Waze aceita um único destino.
- GPX é lido no próprio app, sem provedor, mas não traz duração. Link colado do Google Maps não tem leitura oficial.
- Clima: Open-Meteo 16 dias sem chave; Google Weather 10 dias.
- Não verificado: exigência de cartão nos planos grátis, enquadramento do grupo como "não comercial", cotas do OpenRouteService, preço atual do Open-Meteo pago, cobertura no Brasil fora do Google.
