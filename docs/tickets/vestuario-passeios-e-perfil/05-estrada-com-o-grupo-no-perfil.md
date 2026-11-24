---
id: 05
title: Estrada com o grupo no perfil
status: done
blocked_by: []
source: docs/specs/perfis-dos-participantes.md — "Terceira edição", decisões "Passeio feito", "Nada é guardado como total", "Selos de nível", "Sequência" e "Histórico no perfil"; docs/specs/vestuario-passeios-e-perfil.md — decisão "Perfil", item "Estrada com o grupo"
---

# 05 — Estrada com o grupo no perfil

## What To Build

O perfil, próprio e visto por outro rider, mostra a estrada da pessoa com o grupo: passeios feitos, selo de nível com o que falta para o próximo, sequência de meses, recorde, os cinco passeios mais recentes e as fotos que ela publicou nas galerias.

## User Stories Covered

- 18 e 20 desta spec. Histórico, selo, sequência, recentes e fotos no perfil.
- Perfis 87–89. Número de passeios e os cinco recentes, no próprio perfil e no de outra pessoa.
- Perfis 90, 91 e 93. Selo que evolui, o que falta para o próximo, sem selo de zero.
- Perfis 94–96. Sequência, mês sem passeio do grupo e recorde.
- Perfis 97 e 101. O "Vou" conta sozinho; cancelado não conta.

## Acceptance Criteria

- [x] Conta o passeio não cancelado, com saída passada, em que a presença vale: "Vou" por padrão, ou a correção do administrador.
- [x] Selos nos marcos 1, 5, 10, 25 e 50, com o maior atingido; sem passeio, sem selo.
- [x] Sequência por meses de Brasília; mês sem passeio do grupo é ignorado; mês com passeio e sem presença zera; o mês corrente não zera antes de terminar.
- [x] A sequência aparece a partir de dois meses e o recorde quando é maior que a atual.
- [x] Os cinco passeios mais recentes levam à página de cada um; as doze fotos aprovadas mais recentes abrem em tamanho grande.
- [x] Nada é guardado como total: corrigir uma presença muda contagem, selo e sequência.
- [x] Rider aprovado vê o histórico de outro; de quem não está no grupo não se mostra nada.

## Blocked By

- None - can start immediately

## Execution Bundle

- tdd
- Test Seam: funções de selo e de sequência (limites e regras de mês) e o histórico pelo serviço de perfis, com a data injetada.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador, como administrador: perfil de um rider com dois passeios, selo "Primeira saída" e a frase do próximo selo.
- [ ] Conferir sequência e recorde na tela com dados de mais de um mês.
- [x] Conferido com a conta de rider comum em 2026-11-23 (ticket 09).
