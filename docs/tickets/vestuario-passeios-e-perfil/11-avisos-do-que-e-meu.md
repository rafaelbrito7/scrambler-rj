---
id: 11
title: Avisos do que é meu: passeio, pedido e foto
status: pending
blocked_by: [10]
source: docs/specs/notificacoes.md — decisões "Passeio alterado", "O que o aviso diz" e as linhas de passeio alterado, passeio cancelado, pedido e foto da tabela "Eventos e quem recebe"
---

# 11 — Avisos do que é meu: passeio, pedido e foto

## What To Build

O sininho passa a avisar o rider do que mudou naquilo em que ele está envolvido: o passeio a que confirmou presença mudou de data, horário ou ponto de encontro, ou foi cancelado; o pedido dele foi marcado como pago, teve o pagamento desfeito ou foi cancelado; a foto que enviou foi publicada.

## User Stories Covered

- 8 e 9. Passeio alterado ou cancelado, para quem confirmou presença.
- 10. Pedido pago, pagamento desfeito ou pedido cancelado por administrador.
- 11. Foto publicada na galeria.

## Acceptance Criteria

- [ ] Mudar data, horário de encontro, horário de saída ou ponto de encontro avisa quem respondeu "Vou"; mudar descrição, foto, ficha ou recomendações não avisa.
- [ ] Várias mudanças na mesma edição geram um aviso só.
- [ ] Cancelar o passeio avisa quem respondeu "Vou".
- [ ] Quem não respondeu ou respondeu "Não vou" não é avisado de mudança nem de cancelamento.
- [ ] Marcar como pago, desfazer o pagamento e cancelar o pedido avisam o dono do pedido, levando à campanha.
- [ ] O aviso de pedido não cita valor nem quem fez a marcação.
- [ ] Aprovar uma foto avisa quem a enviou, levando à galeria; recusar não avisa.
- [ ] Ninguém recebe aviso da própria ação.

## Blocked By

- 10 — Sininho com avisos de passeio, campanha e volta de peça.

## Execution Bundle

- tdd
- Test Seam: serviços de passeios, pedidos e galeria — cada ação grava o aviso para quem a tabela diz e só para eles; edição sem mudança de data, horário ou encontro não grava.

## Verification

- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador, com duas contas: mudar o horário de um passeio confirmado, marcar um pedido como pago e aprovar uma foto, conferindo os três avisos na conta do rider.
