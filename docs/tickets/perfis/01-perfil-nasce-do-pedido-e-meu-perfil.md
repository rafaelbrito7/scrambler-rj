---
id: 01
title: Perfil nasce do pedido e "Meu perfil"
status: done
blocked_by: []
source: docs/specs/perfis-dos-participantes.md — "Perfil separado do pedido de ingresso", "Dados do perfil", "Motos", "Navegação", "Impacto no que já existe"; .impeccable/surfaces/src-app-perfil-page-tsx.md — "Meu perfil"
---

# 01 — Perfil nasce do pedido e "Meu perfil"

## What To Build

Ao enviar o pedido de ingresso, a pessoa passa a ter um perfil com o nome e o WhatsApp informados e uma moto principal com o modelo e a cilindrada. O pedido de ingresso continua pedindo os mesmos quatro campos e fica congelado como registro da avaliação. Quem já tinha pedido antes desta mudança ganha perfil e moto a partir do pedido atual, numa migração.

O menu dos participantes ganha "Perfil", que abre "Meu perfil" em modo de leitura: nome, WhatsApp e a moto, com os blocos de quem vê cada dado já no lugar, ainda sem edição. As listas de pedidos, de presença e de participantes, e o PDF, passam a ler o nome do perfil em vez do pedido de ingresso. A tela de avaliações continua lendo o pedido.

## User Stories Covered

- 1. Abrir "Meu perfil" pelo menu.
- 37. O pedido de ingresso continua pedindo só nome, WhatsApp, modelo e cilindrada.
- 38. O perfil já vem com o que foi informado no pedido.
- 40. Quem já era aprovado encontra o perfil preenchido.

## Acceptance Criteria

- [x] Enviar o pedido de ingresso cria o perfil e uma moto principal com os mesmos dados.
- [x] Depois da migração, toda pessoa com pedido de ingresso tem perfil e moto, inclusive em avaliação, reprovada e bloqueada.
- [x] "Meu perfil" mostra nome, WhatsApp formatado e a moto principal; só abre para quem está aprovado.
- [x] O menu dos participantes mostra Início, Perfil e Sair, sem quebrar no celular.
- [x] Listas de pedidos, de presença, de participantes e o PDF mostram o nome que está no perfil.
- [x] A tela de avaliações continua mostrando o que foi escrito no pedido.
- [x] O formulário de pedido de ingresso não muda para quem preenche.
- [x] Os testes existentes continuam passando.

## Blocked By

None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — criação do perfil no envio do pedido, leitura do próprio perfil, recusa a quem não está aprovado; e a migração, verificada com uma pessoa criada antes dela.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador (celular e desktop): abrir "Meu perfil" com participante e com administrador; conferir que os nomes nas listas não mudaram.
