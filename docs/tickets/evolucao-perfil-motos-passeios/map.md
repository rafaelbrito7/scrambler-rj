# Mapa — evolução de perfil, motos e passeios

Label: wayfinder:map

## Destination

Duas specs prontas para virar tickets: `docs/specs/perfis-dos-participantes.md` atualizada com os dados novos de perfil e de moto, e uma spec nova de passeios com roteiro, ficha da rota e mapa. Este mapa decide; não implementa.

## Notes

- Origem: lista de ideias aprovada inteira pelo usuário em 2026-11-17 ("Todas!"). Entram: bairro, "no grupo desde", contagem de passeios, experiência, aniversário, bio, saúde extra, tamanhos extras; foto da moto, modelo por lista, apelido, modificações, autonomia, placa, lembretes; roteiro em paradas, ficha da rota, mapa com traçado, abrir no Maps/Waze, GPX ou link, encontro e saída separados, requisitos, líder e ferrolho, previsão do tempo, plano B, galeria, rota como template; filtros na lista de riders, histórico de passeios, agenda (.ics).
- Custo: o usuário aceita um pequeno valor mensal se a experiência for claramente melhor.
- Ordem de implementação: perfil e motos primeiro, passeios depois.
- Linguagem e privacidade seguem o `AGENTS.md`: riders, vestuário, template; todo dado privado diz quem vê; a regra de visibilidade vale no servidor. Dado de saúde é opcional e apagável.
- Estado atual: `Profile` (nome, apelido, Instagram, WhatsApp, foto, tamanho de camiseta, emergência, tipo sanguíneo), `Bike` (modelo em texto, cilindrada, ano, cor), `Ride` (percurso em texto, ponto de encontro, saída, retorno, link de mapa, foto).
- Tracker local nesta pasta. Tickets de protótipo usam a skill prototype; os de pesquisa, a skill research, com achados em `docs/research/` (o projeto não é repositório git).
- Fotos vão para Cloudflare R2, bucket privado com entrega pelo app (decisão do usuário em 2026-11-17, registrada em `issues/03-hospedagem.md` na raiz). Hospedagem do app e do banco continuam abertas lá.

## Decisions so far

- [Provedores de mapa, rota e clima](issues/01-provedores-de-mapa-rota-e-clima.md): três combinações viáveis perto de custo zero; Waze só abre um destino; GPX não depende de provedor; pontos de cobrança e termos ainda por confirmar.
- [Dados novos do perfil e quem vê cada um](issues/02-dados-novos-do-perfil.md): região por lista, experiência em três níveis, aniversário, bio e "desde" visíveis aos riders; segundo contato, plano de saúde e alergias só para a pessoa e administradores; ingresso não muda; sem tamanhos extras.
- [Dados novos da moto](issues/03-dados-novos-da-moto.md): modelo por lista com "Outro", modificações em itens por categoria, uma foto, apelido e autonomia; placa depende da pesquisa de consulta.
- [Roteiro e ficha do passeio](issues/04-roteiro-e-ficha-do-passeio.md): paradas ordenadas com tipo, nome, local, horário e nota; distância, piso e dificuldade obrigatórios; líder e ferrolho escolhidos pelo administrador; passeios antigos ficam como estão.
- [Consulta de veículo por placa](issues/09-consulta-de-veiculo-por-placa.md): via oficial inacessível; resta lista fixa sem consulta ou API comercial de centavos por consulta, sem garantia de origem; cilindrada de moto não confirmada.
- [Placa e preenchimento pela consulta](issues/10-placa-e-preenchimento-pela-consulta.md): sem consulta; a plataforma não pede nem guarda placa.
- [Mapa na página do passeio](issues/05-mapa-na-pagina-do-passeio.md): MapLibre com Stadia, rota de moto, traçado, km e tempo guardados na publicação; paradas com GPX opcional; mapa interativo; clima pelo Open-Meteo.
- [Lista de riders, filtros e histórico](issues/07-riders-filtros-e-historico.md): passeio feito é "Vou" com correção do administrador; filtros por modelo, região, experiência e nome; histórico, selos de nível em cinco marcos e sequência de meses seguidos.
- [Depois do passeio: galeria, rota como template e agenda](issues/08-depois-do-passeio.md): galeria de quem fez o passeio, com aprovação de administrador, 10 fotos por rider e 150 por passeio; rota salva como template a partir de um passeio; arquivo de agenda avulso.
- [Protótipo da página do passeio](issues/06-prototipo-da-pagina-do-passeio.md): variante A, linha do tempo com identidade por seção; "Leve com você" vira seleção numa lista de recomendações.
- Destino alcançado em 2026-11-17: `docs/specs/perfis-dos-participantes.md` (segunda e terceira edições) e `docs/specs/passeios-roteiro-e-mapa.md`. Nenhum ticket aberto.

- Spec de perfis atualizada em 2026-11-17 com a seção "Segunda edição" (perfil e motos). Falta nela o que depende de "Lista de riders, filtros e histórico".

## Not yet specified

- Lembretes de revisão e seguro: dependem de existir um canal de aviso (hoje não há e-mail nem notificação).
- Previsão do tempo no passeio: forma e momento em que aparece, depois da pesquisa de provedores.
- Fatiamento em tickets de implementação e migração dos dados existentes (modelo de moto em texto livre para lista).

## Out of scope

- Rastreamento ao vivo do comboio e navegação curva a curva dentro da plataforma.
- Chat, comentários e automação de WhatsApp.
- Limite de vagas e cobrança por passeio.
- Líder e ferrolho do passeio: decidido em "Roteiro e ficha do passeio" e retirado pelo usuário em 2026-11-17; o grupo anda junto, sem esses papéis.
- Destaque no traçado por tipo de via e piso (estrada, off-road): descartado pelo usuário em 2026-11-17. O piso do passeio aparece só na ficha (asfalto, terra, misto).
