# Provedores de mapa, rota e clima

Pesquisa para o ticket [01 — Provedores de mapa, rota e clima](../tickets/evolucao-perfil-motos-passeios/issues/01-provedores-de-mapa-rota-e-clima.md).
Consulta às páginas oficiais em 2026-11-17. Este documento compara e aponta combinações viáveis; a decisão final não está aqui.

Uso considerado: ~50 riders, ~2.000 visualizações de mapa por mês, ~20 cálculos de rota por mês (um por passeio criado ou editado), previsão do tempo consultada nas páginas de passeio.

## Resumo

- Nesse volume, **todas as opções cabem na cota grátis**. A diferença está em exigência de cartão, termos de uso (uso não comercial, guardar o resultado) e perfil de moto no cálculo.
- **Waze só aceita um destino** no link de abertura; não há parâmetro de paradas. **Google Maps aceita até 9 paradas, mas só 3 quando o link abre em navegador de celular.**
- Importar **GPX não depende de provedor** (é XML lido no próprio app). Importar **link do Google Maps não tem API oficial**.
- Perfil de **moto** no cálculo de rota: Google (nível Enterprise, Brasil coberto) e Stadia Maps (Valhalla, `motorcycle`). Mapbox, OpenRouteService e o demo do OSRM só têm carro.
- Guardar o traçado calculado no banco (calcular uma vez, mostrar muitas) **esbarra nos termos do Google**; nos serviços baseados em OpenStreetMap o dado é ODbL e o obstáculo é menor.

## Tabela comparativa

### Mapa (exibir traçado e paradas)

| Opção | Cota grátis | Preço depois | Cartão | Restrições relevantes | Custo estimado/mês |
|---|---|---|---|---|---|
| Google Maps JavaScript (Dynamic Maps) | 10.000 carregamentos/mês | US$ 7,00 por 1.000 | Exige faturamento ativado no projeto; exigência de cartão não confirmada na doc (ver "Não verificado") | Atribuição Google obrigatória; conteúdo Google só pode ser guardado quando expressamente permitido | US$ 0 |
| Google Maps Embed (iframe) | Ilimitado, sem cobrança | — | Precisa de chave de API | Modo `directions` aceita até 20 paradas; não desenha traçado próprio nem marcadores próprios (só calcula a rota entre os pontos) | US$ 0 |
| Google Static Maps | 10.000/mês | US$ 2,00 por 1.000 | Idem Google | Imagem estática | US$ 0 |
| Mapbox GL JS | 50.000 carregamentos/mês | US$ 5,00 por 1.000 | Não informado na página de preço | Termos de produto (PDF) não lidos | US$ 0 |
| MapTiler Cloud (com MapLibre) | 5.000 sessões + 100.000 requisições/mês | Plano Flex US$ 30/mês (25.000 sessões) | Não exige | Plano grátis: "teste, protótipo, pessoal ou não comercial"; logo MapTiler no mapa; ao estourar, o serviço pausa até o mês seguinte | US$ 0 (ou US$ 30 se quiser sair do "não comercial") |
| Stadia Maps (com MapLibre ou Leaflet) | 200.000 créditos/mês | Starter US$ 20/mês (1 milhão de créditos) | Não confirmado para o plano grátis | Plano grátis proíbe uso comercial | US$ 0 (ou US$ 20) |
| Protomaps (PMTiles hospedado por conta própria + MapLibre) | Sem cota: arquivo próprio | Custo do armazenamento estático | Não | ODbL, atribuição OSM; planeta inteiro ~120 GB, mas dá para extrair só a região com `pmtiles extract` | ~US$ 0 (extrato regional pequeno em hospedagem estática) |
| Tiles de openstreetmap.org (Leaflet direto) | Grátis | — | Não | Sem SLA; acesso pode ser cortado sem aviso; exige atribuição visível, `Referer` válido, respeito a cache; proibido pré-carregar em massa | US$ 0, com risco de corte |

### Cálculo de rota (distância e duração com várias paradas)

| Opção | Cota grátis | Preço depois | Paradas por requisição | Perfil de moto | Restrições | Custo estimado/mês |
|---|---|---|---|---|---|---|
| Google Routes API — Essentials | 10.000/mês | US$ 5,00 por 1.000 | até 10 intermediárias | Não (carro) | Lat/lng em cache por no máximo 30 dias; resultado de rota não deve ser armazenado | US$ 0 |
| Google Routes API — Enterprise (duas rodas) | 1.000/mês | US$ 15,00 por 1.000 | até 25 intermediárias (acima de 10 cobra mais) | Sim; Brasil está na lista de cobertura de duas rodas | Idem | US$ 0 |
| Mapbox Directions | 100.000/mês | US$ 2,00 por 1.000 | 25 coordenadas | Não (`driving`, `driving-traffic`, `walking`, `cycling`) | Deve exibir aviso de que a rota não substitui a sinalização | US$ 0 |
| Stadia Maps Routing (Valhalla) | Dentro dos 200.000 créditos (20 créditos por rota → 20 rotas = 400 créditos) | Incluído no plano pago | 50 locais, 5.000 km | Sim (`motorcycle`; `motor_scooter` até 500 km) | Plano grátis não comercial | US$ 0 |
| OpenRouteService (HeiGIT) | 2.000 rotas/dia, 40/min (valor obtido por busca; página oficial de planos não abriu) | — | 50, até 6.000 km | Não (pé, bicicleta, carro, cadeira de rodas) | Exige cadastro e chave | US$ 0 |
| GraphHopper | 500 créditos/dia, **máx. 5 locais por rota** | Basic € 69/mês | 5 no grátis | Não confirmado no grátis ("conjunto limitado de perfis") | Grátis só para uso não comercial; sem cartão | US$ 0, mas limite de 5 pontos atrapalha |
| OSRM (servidor de demonstração) | Grátis | — | não documentado | Não (carro, pé, bicicleta) | Máx. 1 requisição/s; "uso razoável e não comercial"; sem garantia de disponibilidade nem de atualização | US$ 0, sem garantia |

### Clima

| Opção | Cota grátis | Preço depois | Horizonte | Cartão / chave | Restrições | Custo estimado/mês |
|---|---|---|---|---|---|---|
| Open-Meteo | 10.000 chamadas/dia (5.000/h, 600/min) | Standard US$ 29/mês por 1 milhão (valor de 2023, ver "Não verificado") | até 16 dias | Sem cartão; chave só no plano pago | Grátis só não comercial (site privado ou sem fins lucrativos, sem assinatura nem anúncio, é aceito); dados CC BY 4.0 com crédito | US$ 0 |
| Google Weather API | 10.000/mês | US$ 0,15 por 1.000 | 10 dias (240 h) | Conta Google Maps Platform | Termos Google | US$ 0 |
| OpenWeather | 60/min e 1.000.000/mês (previsão 5 dias, de 3 em 3 h); One Call 4.0: 1.000/dia grátis, depois £ 0,0012 por chamada | conforme plano | 5 dias no grátis | Exigência de cartão no One Call não informada | ODbL | US$ 0 |

## Fatos por requisito

### (a) Mapa com traçado e paradas

- Google cobra por SKU com cota grátis mensal por SKU; o crédito mensal de US$ 200 acabou em 1º de março de 2025. Fontes: https://developers.google.com/maps/billing-and-pricing/pricing e https://developers.google.com/maps/billing-and-pricing/march-2025
- Embed API é grátis e ilimitada, com chave, e o modo `directions` aceita até 20 paradas e os modos `driving`, `walking`, `bicycling`, `transit`, `flying`. Não desenha um traçado importado de GPX. Fontes: https://developers.google.com/maps/documentation/embed/get-started e https://developers.google.com/maps/documentation/embed/embedding-map
- Mapbox: 50.000 carregamentos de mapa web grátis por mês. Fonte: https://www.mapbox.com/pricing
- MapTiler: plano grátis sem cartão, 5.000 sessões, logo obrigatório, uso não comercial; Flex US$ 30. Fonte: https://www.maptiler.com/cloud/pricing/
- Stadia: 200.000 créditos grátis, sem uso comercial; Starter US$ 20. Fonte: https://stadiamaps.com/pricing/
- Protomaps: um único arquivo PMTiles em armazenamento próprio; ODbL. Fontes: https://docs.protomaps.com/basemaps/downloads e https://docs.protomaps.com/deploy/cost
- Tiles de openstreetmap.org: melhor esforço, "no SLA or guarantee", bloqueio sem aviso em caso de abuso. Fonte: https://operations.osmfoundation.org/policies/tiles/

### (b) Distância e duração

- Google Routes: Essentials até 10 paradas intermediárias; trânsito é Pro; duas rodas é Enterprise; máximo de 25 paradas. Fonte: https://developers.google.com/maps/documentation/routes/usage-and-billing
- Brasil consta na cobertura de rotas para duas rodas do Google. Fonte: https://developers.google.com/maps/documentation/routes/coverage-two-wheeled
- Google permite cache de latitude/longitude por até 30 dias corridos e orienta não armazenar resultados de rota. Fonte: https://developers.google.com/maps/documentation/routes/policies
- Mapbox Directions: até 25 coordenadas, sem perfil de moto. Fonte: https://docs.mapbox.com/api/navigation/directions/
- Stadia: `motorcycle` com até 50 locais e 5.000 km. Fonte: https://docs.stadiamaps.com/routing/standard-routing/
- OpenRouteService: 50 paradas, 6.000 km, sem perfil de moto. Fonte: https://giscience.github.io/openrouteservice/hosted-api-restrictions
- GraphHopper grátis: 500 créditos/dia, 5 locais por rota, não comercial, sem cartão. Fonte: https://www.graphhopper.com/pricing/
- OSRM demo: 1 requisição/s, não comercial, sem garantias. Fonte: https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server

### (c) Importar GPX ou link do Google Maps

- GPX é um XML aberto: dá para ler no servidor ou no navegador e converter em linha e pontos, sem serviço externo. Distância sai da própria geometria; duração não (GPX de planejamento não traz tempo), então a duração ainda pede um cálculo de rota ou digitação manual. *(Conhecimento geral, não verificado em fonte nesta pesquisa.)*
- Link do Google Maps: a documentação oficial descreve como **montar** links, não como **ler** um link colado. Um link `google.com/maps/dir/?api=1&origin=…&waypoints=…` que o próprio app gerou é legível; links copiados do aplicativo (curtos `maps.app.goo.gl` ou com `/dir/A/B/C/data=…`) não têm formato documentado. Fonte: https://developers.google.com/maps/documentation/urls/get-started

### (d) Abrir no Google Maps e no Waze

- Google Maps: `https://www.google.com/maps/dir/?api=1&origin=…&destination=…&waypoints=A|B|C&travelmode=…`. Sem chave de API. **Até 9 paradas; até 3 em navegadores de celular.** URL de no máximo 2.048 caracteres. `travelmode=two-wheeler` existe e depende da cobertura do país. `dir_action=navigate` inicia a navegação. Fonte: https://developers.google.com/maps/documentation/urls/get-started
- Waze: `https://waze.com/ul?ll=<lat>,<lng>&navigate=yes` (ou `q=` para busca). A documentação só mostra um destino e não tem parâmetro de paradas. Consequência: no Waze o caminho possível é um botão por parada ("ir até a próxima parada"). Fonte: https://developers.google.com/waze/deeplinks
- Um passeio com mais de 9 paradas (ou mais de 3, se o link abrir no navegador do celular e não no aplicativo) precisa ser dividido em trechos também no Google Maps.

### (e) Previsão do tempo

- Open-Meteo: até 16 dias, por hora, com probabilidade de chuva, temperatura, vento, rajada e código de tempo. Para o Brasil não há modelo regional: valem os modelos globais (ECMWF 9–25 km, GFS 3–25 km, ICON 2–11 km). Fontes: https://open-meteo.com/en/docs, https://open-meteo.com/en/pricing, https://open-meteo.com/en/terms
- Google Weather: 10 dias, por hora e por dia. Fonte: https://developers.google.com/maps/documentation/weather/overview
- OpenWeather: grátis cobre 5 dias de 3 em 3 horas. Fonte: https://openweathermap.org/price
- Em qualquer provedor, um passeio marcado para além do horizonte (10 ou 16 dias) fica sem previsão até entrar na janela.

## Esforço de integração em Next.js 16 / React 19

Avaliação por conhecimento geral das bibliotecas, não verificada em fonte nesta pesquisa.

- Todo mapa interativo é componente de cliente, carregado sem renderização no servidor. Cálculo de rota e clima cabem em código de servidor, com a chave fora do navegador.
- Google Embed: um `iframe`; o menor esforço, e o menor controle visual (não segue a paleta preta, laranja e creme).
- Google Maps JavaScript: biblioteca React oficial (`@vis.gl/react-google-maps`); estilo do mapa configurável no console do Google.
- Mapbox GL JS e MapLibre: API quase idêntica (`react-map-gl` atende os dois); estilo do mapa totalmente editável, o que favorece um mapa escuro coerente com o DESIGN.md.
- Leaflet: o mais simples para linha + marcadores com tiles raster; estilo do mapa depende do provedor de tiles.
- Protomaps: MapLibre mais o passo de gerar e hospedar o extrato; maior esforço inicial, nenhuma dependência de cota.

## Combinações viáveis

### 1. Tudo Google
Maps JavaScript (ou Embed) + Routes API com duas rodas + links de abertura + Google Weather.

- A favor: único com rota de moto oficialmente coberta no Brasil; dados de trânsito; um só fornecedor; mesma base de dados do aplicativo em que o rider vai abrir a rota.
- Contra: precisa de conta de faturamento; termos restringem guardar o traçado (teria de recalcular ou mostrar via Embed); estouro de cota vira cobrança, então convém limitar cotas no console; visual menos moldável.
- Custo estimado: **US$ 0/mês** (2.000 de 10.000 mapas; 20 de 1.000 rotas Enterprise).

### 2. MapLibre + provedor baseado em OpenStreetMap com rota de moto + Open-Meteo
MapLibre com tiles da Stadia Maps (ou MapTiler), rota pela Stadia (`motorcycle`), clima Open-Meteo, links de abertura do Google Maps e Waze.

- A favor: perfil de moto; estilo do mapa livre; traçado calculado uma vez e guardado; sem cartão no MapTiler e no Open-Meteo.
- Contra: planos grátis são "não comerciais" — um grupo sem receita parece caber, mas é leitura nossa dos termos; a distância calculada pode diferir um pouco da que o Google Maps mostrará ao abrir a rota; dois ou três cadastros.
- Custo estimado: **US$ 0/mês**; **US$ 20/mês** (Stadia Starter) ou **US$ 30/mês** (MapTiler Flex) para sair da condição de não comercial; Open-Meteo pago seria mais ~US$ 29.

### 3. Mapbox + Open-Meteo
Mapbox GL JS + Mapbox Directions + Open-Meteo, links de abertura do Google Maps e Waze.

- A favor: cotas grátis muito acima do uso (50.000 mapas, 100.000 rotas); um fornecedor para mapa e rota; estilo livre; plano grátis sem a restrição "não comercial" na página de preço.
- Contra: sem perfil de moto (rota de carro); exigência de cartão e regras de armazenamento não confirmadas; passou do grátis, cobra por uso.
- Custo estimado: **US$ 0/mês**.

Variante de custo zero e sem conta alguma para o mapa: Leaflet ou MapLibre com Protomaps hospedado junto do app, com rota pelo OpenRouteService (carro) — mais trabalho inicial, nenhuma cota, sem perfil de moto.

## Não verificado

- **Cartão de crédito no Google Maps Platform**: a documentação lida só diz que o faturamento precisa estar ativado no projeto; não confirmei na fonte se a conta de faturamento exige cartão (historicamente exige).
- **Cartão no Mapbox e no plano grátis da Stadia**: as páginas de preço não dizem.
- **Termos do Google sobre exibir conteúdo Google em mapa de terceiros** e o texto exato das regras de armazenamento: a página dos termos específicos de serviço não carregou; usei só a página de políticas da Routes API.
- **Termos de produto do Mapbox** (cache, uso com mapa de terceiros, atribuição): estão em PDF não lido.
- **Cotas do OpenRouteService** (2.000/dia, 40/min): a página oficial de planos redireciona para um painel que não abriu; o número veio de resultado de busca da página oficial.
- **Preço atual do Open-Meteo pago**: a página de preço não exibiu valores; US$ 29/mês vem de publicação do próprio Open-Meteo de junho de 2023 (https://openmeteo.substack.com/p/api-subscriptions-for-commercial).
- **Qualidade de cobertura no Brasil**: só o Google declara cobertura (duas rodas). Para Mapbox, OpenStreetMap e Open-Meteo não achei declaração oficial específica do Brasil; vale um teste prático com um roteiro real do grupo (por exemplo, serra) antes de decidir.
- **Perfis disponíveis no GraphHopper grátis** e **limite de paradas do OSRM demo**: não informados nas páginas lidas.
- **Leitura de link colado do Google Maps** e **bibliotecas React citadas**: conhecimento geral, sem fonte primária consultada.
- **Enquadramento do grupo como "não comercial"** em MapTiler, Stadia, GraphHopper, OSRM demo e Open-Meteo: interpretação; só o Open-Meteo define o termo de forma explícita (sem assinatura nem anúncio).
