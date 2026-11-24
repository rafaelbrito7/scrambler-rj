# Mapa na página do passeio

Type: grilling
Status: resolved
Parent: [Mapa — evolução de perfil, motos e passeios](../map.md)
Blocked by: 01, 04

## Question

Com a pesquisa em mãos: qual provedor, o que o mapa mostra (traçado, paradas, interativo ou imagem), como o administrador informa a rota (paradas digitadas, GPX, link colado) e o que é calculado sozinho versus digitado? Como fica quando o serviço falha ou a rota não tem traçado?

## Parcial (2026-11-17)

Respondido pelo usuário, ticket ainda `claimed`:

- Entrada da rota: paradas buscadas por nome ou endereço, com traçado calculado; GPX opcional, que prevalece sobre o traçado calculado.
- Exibição: mapa interativo na página do passeio, com traçado e paradas numeradas; sem mapa no cartão do Início.
- Clima: entra, simples, com Open-Meteo: a partir de 7 dias antes, temperatura e chance de chuva no encontro e no destino, na hora prevista.
- Requisito novo do usuário para o provedor: além do mapa, calcular quilômetros e tempo de rolé e **destacar no traçado os trechos por tipo de via e piso** (estrada, off-road etc.).
- Provedor em aberto: depende da pesquisa `docs/research/piso-e-tipo-de-via-por-trecho.md` (em andamento).

## Correção (2026-11-17)

O usuário descartou o destaque de trechos por tipo de via e piso. Continuam pedidos: quilômetros e tempo de rolé calculados. A pesquisa de piso por trecho foi interrompida e não entra na escolha do provedor.

## Answer

Decidido com o usuário em 2026-11-17. Vale o que está em "Parcial", com a "Correção", mais:

- **Provedor**: MapLibre para o mapa e Stadia Maps para os mapas-base, a busca de local e a rota com perfil de moto. Clima pelo Open-Meteo.
- **Calculado na publicação e guardado**: traçado, quilômetros e tempo de rolé. O administrador pode corrigir distância e duração à mão.
- **GPX enviado**: o traçado e a distância vêm do arquivo; a duração é digitada (o GPX não a traz).
- **Abrir fora**: a rota abre no Google Maps (até 9 paradas; 3 em navegador de celular) e cada parada tem seu próprio "abrir", que serve também para o Waze, que só aceita um destino.
- **Falha**: sem traçado ou com o serviço fora do ar, a página mostra o roteiro em lista e os botões de abrir; publicar não depende do mapa.
- A confirmar antes de implementar: se o grupo se enquadra no plano grátis "não comercial" da Stadia (senão US$ 20/mês) e se o plano exige cartão.
- Os três últimos itens de comportamento (correção manual, GPX, falha) são proposta minha, a confirmar na spec.
