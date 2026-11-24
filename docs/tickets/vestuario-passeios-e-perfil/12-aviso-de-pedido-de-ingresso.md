---
id: 12
title: Aviso de pedido de ingresso para administradores
status: pending
blocked_by: [10]
source: docs/specs/notificacoes.md — decisão "Pedido de ingresso" e a última linha da tabela "Eventos e quem recebe"
---

# 12 — Aviso de pedido de ingresso para administradores

## What To Build

Quando alguém envia um pedido de ingresso, os administradores recebem um aviso no sininho que leva à tela de avaliações de perfil. A contagem de pendentes ao lado de "Painel" continua como está.

## User Stories Covered

- 12. Administrador avisado de um novo pedido de ingresso.

## Acceptance Criteria

- [ ] Enviar um pedido de ingresso avisa todos os administradores.
- [ ] O aviso diz só que há um pedido novo; o nome de quem pediu fica na tela de avaliações.
- [ ] O aviso leva a `/painel/avaliacoes`; rider comum nunca recebe esse aviso nem vê o endereço do painel.
- [ ] A contagem ao lado de "Painel" segue mostrando quantos pedidos esperam.
- [ ] O administrador configurado por e-mail, que entra aprovado ao enviar o próprio cadastro, não gera aviso.

## Blocked By

- 10 — Sininho com avisos de passeio, campanha e volta de peça.

## Execution Bundle

- tdd
- Test Seam: serviço de acesso — enviar o pedido grava o aviso para cada administrador e para mais ninguém.

## Verification

- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador: enviar um pedido com uma conta nova e ver o aviso na conta de administrador, com a contagem de "Painel" ao lado.
