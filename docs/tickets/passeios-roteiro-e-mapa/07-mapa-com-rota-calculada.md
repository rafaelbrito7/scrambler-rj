---
id: 07
title: Mapa com rota calculada
status: done
blocked_by: [01, 02]
source: docs/specs/passeios-roteiro-e-mapa.md — decisões "Mapa e rota", "Calculado uma vez, guardado", "Publicar não depende do mapa"; `docs/research/provedores-de-mapa-rota-e-clima.md`
---

# 07 — Mapa com rota calculada

## Como foi entregue (2026-11-17)

Diferente do escrito abaixo, por causa dos termos de uso da Stadia, lidos neste ticket: guardar rota no servidor é proibido e guardar coordenadas da busca exige plano pago. Com a concordância do usuário:

- [x] O administrador marca cada parada tocando num mapa; a coordenada fica guardada na parada. Não há busca de lugar por nome.
- [x] A rota de moto é pedida pelo navegador a cada visita e desenhada no mapa, com as paradas numeradas como no roteiro. Nada da rota vai para o banco; o navegador a guarda por até sete dias.
- [x] Abaixo do mapa aparece a distância e o tempo que a rota deu, como referência. A ficha continua com os valores digitados.
- [x] Sem pontos marcados, a página abre sem o mapa; se a rota falhar, o mapa mostra só as paradas.
- [x] Nenhuma chave vai para o navegador: a autorização é por domínio. A chave do `.env` não é usada.
- [x] O mapa não prende a rolagem no celular (um dedo rola a página, dois movem o mapa).
- [x] Termos de uso conferidos.
- [ ] Cadastrar o domínio no painel da Stadia quando o site tiver endereço (hoje só `localhost`).
- [ ] Conferir quilômetros e tempo contra um aplicativo de mapa (não feito).

Os critérios originais abaixo ficam como registro do que se pretendia.

## What To Build

No formulário, cada parada pode ser achada pelo nome ou endereço. Ao salvar, a plataforma calcula a rota de moto entre as paradas, guarda o traçado, a distância e o tempo de rolé, e a página do passeio mostra um mapa interativo com o traçado e as paradas numeradas como no roteiro. É o primeiro contato com o serviço real: o ticket começa colocando de pé um mapa com uma rota Rio–Petrópolis, antes do resto.

## User Stories Covered

- 11, 12. Ver o traçado num mapa que se arrasta e amplia.
- 14. A página continua útil sem o mapa.
- 25. Buscar cada parada pelo nome.
- 28, 29. Distância e tempo calculados, com correção manual.
- 31. Ver o mapa antes de publicar.

## Acceptance Criteria

- [ ] A busca de lugares devolve sugestões enquanto o administrador digita; escolher uma guarda nome e coordenadas; continua possível digitar um local em texto, sem coordenadas.
- [ ] Ao salvar, o servidor calcula a rota com perfil de moto entre as paradas com coordenadas, na ordem, e guarda traçado, distância e tempo; a página não chama o serviço de rota ao ser aberta.
- [ ] Mudar as paradas recalcula; distância ou tempo digitados pelo administrador prevalecem até serem limpos.
- [ ] O mapa mostra o traçado e marcadores numerados na mesma ordem do roteiro, com o visual escuro da plataforma.
- [ ] Com o serviço fora do ar ou sem chave configurada, publicar funciona com paradas em texto e distância digitada, e a página abre sem o bloco do mapa.
- [ ] A chave do serviço não vai para o navegador além do necessário para desenhar o mapa-base.
- [ ] O mapa não trava a rolagem da página no celular.
- [ ] Os serviços de busca e de rota entram por uma interface com substituto de teste; nenhum teste automático chama a rede.
- [ ] Os termos de uso do plano contratado foram conferidos quanto a guardar o resultado da rota.

## Blocked By

- 01 — Roteiro em paradas.
- 02 — Ficha da rota.
- Conta na Stadia Maps criada pelo usuário e chave colocada no `.env`; confirmar o plano (grátis não comercial ou cerca de US$ 20 por mês).

## Execution Bundle

- tdd
- Test Seam: serviço de passeios com o substituto de rota — salvar guarda traçado, distância e tempo; recalcula ao mudar paradas; valor digitado prevalece; falha do serviço não impede publicar.

## Verification

- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador, celular e desktop, com o serviço real ligado: publicar Rio–Petrópolis com paradas buscadas, conferir traçado, quilômetros e tempo contra um aplicativo de mapa.
- [ ] Desligar a chave e publicar outro passeio.
- [ ] Console e rede sem erros na página do passeio.
