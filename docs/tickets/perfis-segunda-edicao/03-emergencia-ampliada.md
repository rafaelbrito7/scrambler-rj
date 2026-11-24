---
id: 03
title: Emergência ampliada
status: done
blocked_by: []
source: docs/specs/perfis-dos-participantes.md — "Segunda edição — mais dados de perfil e de moto", decisões "Emergência ampliada", "Quem vê o quê"
---

# 03 — Emergência ampliada

## What To Build

O bloco de emergência do perfil ganha segundo contato (nome e telefone), plano de saúde (nome e número da carteirinha) e alergias e condições (texto livre). Vistos só pela própria pessoa e pelos administradores. "Apagar dados de emergência" apaga antigos e novos de uma vez. A ficha do administrador mostra os dados novos, com ligação em um toque para o segundo contato.

## User Stories Covered

- 55. Informar um segundo contato de emergência.
- 56. Informar plano de saúde e carteirinha.
- 57. Informar alergias e condições.
- 58. Ler quem vê antes de preencher.
- 59. Apagar os dados novos junto com os antigos.
- 60. Não ver esses dados de outra pessoa, nem por link direto.
- 61. Administrador vê os dados novos na ficha.
- 62. Administrador liga para o segundo contato com um toque.

## Acceptance Criteria

- [x] Segundo contato exige nome e telefone juntos e só é aceito quando o primeiro contato existe.
- [x] Número da carteirinha só é aceito com o nome do plano.
- [x] Alergias e condições aceita até 500 caracteres.
- [x] Todos os campos são opcionais.
- [x] O título do bloco diz quem vê, antes dos campos.
- [x] Uma única ação apaga todos os dados de emergência, antigos e novos, com confirmação no lugar (`ConfirmAction`).
- [x] A leitura para outro rider não contém nenhum dos dados novos, nem em resposta que a tela ignore.
- [x] A ficha do administrador mostra os dados novos; o telefone do segundo contato é um link de ligação.
- [x] Nenhum dado novo entra no PDF, no resumo de divulgação nem em tela de rider.

## Blocked By

- None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — edição e `clearEmergencyData`, e o conteúdo de `getMemberProfile` (sem os dados) contra `getMemberRecord` e `getOwnProfile` (com os dados).

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: preencher, abrir o perfil com outra conta de rider (não vê), abrir a ficha como administrador (vê), apagar tudo.
- [x] Conferir que o PDF de uma campanha de vestuário não traz nenhum dado de emergência.
