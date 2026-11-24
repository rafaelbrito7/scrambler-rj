---
id: 04
title: Modelo da moto por lista
status: done
blocked_by: []
source: docs/specs/perfis-dos-participantes.md — "Segunda edição — mais dados de perfil e de moto", decisões "Modelo da moto por lista", "Motos já cadastradas", "Sem placa"
---

# 04 — Modelo da moto por lista

## What To Build

O modelo da moto passa a ser escolhido numa lista fixa, com a cilindrada vinda do modelo; "Outro" abre modelo e cilindrada em texto livre. A mesma lista vale no pedido de ingresso e no formulário de moto do perfil. As motos já cadastradas são levadas para a lista quando o texto corresponde sem ambiguidade; as demais viram "Outro" com o texto preservado.

## User Stories Covered

- 63. Escolher o modelo numa lista.
- 64. A cilindrada vem com o modelo.
- 65. "Outro" com modelo e cilindrada digitados.
- 66. Moto antiga encontrada no modelo certo.
- 67. Moto antiga que não bateu continua com o texto digitado.
- 68. Pessoa nova escolhe o modelo na mesma lista.
- 77. A plataforma não pede a placa.

## Acceptance Criteria

- [x] A lista é a conferida pelo usuário (inicial: Scrambler 400 X, 400 XC, Scrambler 900, Street Scrambler, Scrambler 1200 X, 1200 XC, 1200 XE, Scrambler 865), definida num módulo sem dependências, usado pelo servidor e pelo navegador.
- [x] Modelo da lista não aceita cilindrada diferente da do modelo; "Outro" exige modelo e cilindrada com as regras atuais.
- [x] O pedido de ingresso e o formulário de moto usam o mesmo controle.
- [x] A migração leva cada moto existente ao modelo da lista quando o texto corresponde (ignorando maiúsculas, espaços, "cc" e "Triumph"); o resto vira "Outro" com texto e cilindrada preservados.
- [x] Nenhuma moto é apagada, muda de dono ou deixa de ser a principal na migração.
- [x] O pedido de ingresso já enviado não é reescrito; a tela de avaliações continua mostrando o que a pessoa escreveu.
- [x] Nas telas, uma moto da lista e uma moto "Outro" aparecem do mesmo jeito: modelo e cilindrada.
- [x] Nenhuma tela pede placa.

## Blocked By

- Conferência da lista de modelos pelo usuário (decisão humana pendente).

## Execution Bundle

- tdd
- Test Seam: serviço de perfis e de acesso — `addBike`, `updateBike` e `submitJoinRequest` com modelo da lista e com "Outro"; e a função pura de correspondência da migração, testada com as grafias reais do banco de desenvolvimento e com casos ambíguos, que caem em "Outro".

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] Migração aplicada nos dois bancos pelo fluxo do `AGENTS.md`; servidor de desenvolvimento reiniciado.
- [x] No navegador: cadastrar moto pela lista e por "Outro", e enviar um pedido de ingresso novo.
- [x] Conferir no banco de desenvolvimento para onde cada moto existente foi.
