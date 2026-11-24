---
id: 12
title: Galeria de fotos
status: done
blocked_by: [06]
source: docs/specs/passeios-roteiro-e-mapa.md — decisão "Galeria"
---

# 12 — Galeria de fotos

## What To Build

Depois de um passeio, quem tem presença válida envia fotos. Cada foto espera a aprovação de um administrador para aparecer na página do passeio. O painel mostra quantas fotos estão pendentes.

## User Stories Covered

- 47–50. Enviar fotos, ver e apagar as próprias pendentes, limite avisado, ver sem poder enviar.
- 51–53. Aprovar, recusar, contador no painel, apagar publicada.
- 54. Abrir a foto em tamanho grande.

## Acceptance Criteria

- [x] A galeria abre quando passa o horário de saída de um passeio não cancelado.
- [x] Enviam riders com presença válida e administradores; os demais veem as fotos aprovadas sem o botão de enviar.
- [x] Toda foto entra pendente; só quem enviou e os administradores a veem até a aprovação.
- [x] Limites de dez por rider e cento e cinquenta por passeio, contando pendentes e aprovadas, respeitados também em envios simultâneos; a tela avisa quando o limite é atingido.
- [x] As fotos são reduzidas no envio para lado maior de 2.000 pixels.
- [x] Administrador aprova, recusa (a foto é apagada) e apaga qualquer foto; quem enviou apaga as suas pendentes.
- [x] A aba Passeios do painel mostra a contagem de fotos pendentes, e o administrador chega à fila a partir dali.
- [x] Cada foto mostra quem enviou; tocar abre em tamanho grande, com fechar acessível por teclado.
- [x] As fotos só são entregues a riders aprovados, e uma pendente só a quem pode vê-la.
- [x] Os arquivos são apagados do armazenamento quando a foto é apagada ou recusada.

## Blocked By

- 06 — Correção de presença.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios com o substituto de armazenamento — quem envia, antes e depois do horário, visibilidade da pendente, aprovar, recusar, apagar, os dois limites (inclusive simultâneos), contador de pendentes. Arte anterior: testes de foto de perfil.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, celular e desktop: enviar três fotos como rider, aprovar duas e recusar uma como administrador, conferir a galeria com outra conta.
- [x] Pedir o endereço de uma foto pendente com conta de outro rider.
