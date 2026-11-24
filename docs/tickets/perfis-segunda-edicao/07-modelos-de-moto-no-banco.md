---
id: 07
title: Modelos de moto no banco
status: pending
blocked_by: [04]
source: docs/specs/perfis-dos-participantes.md — "Segunda edição", decisão "Modelo da moto por lista" (revista pelo usuário em 2026-11-17)
---

# 07 — Modelos de moto no banco

## What To Build

A lista de modelos de Scrambler sai do código e vai para o banco de dados. Os administradores a mantêm numa tela do painel: incluir um modelo com sua cilindrada, renomear, reordenar e desativar. O pedido de ingresso e o formulário de moto passam a ler a lista do banco. Os oito modelos atuais entram prontos, pela migração.

## User Stories Covered

- 63–65, 68. Escolher o modelo numa lista, com a cilindrada vindo junto, no perfil e no pedido de ingresso.

## Acceptance Criteria

- [ ] Os oito modelos atuais entram no banco pela migração, com nome, cilindrada e posição.
- [ ] O painel tem uma tela de modelos em que o administrador inclui, renomeia, muda a cilindrada, reordena, desativa e reativa; riders não acessam, nem por chamada direta.
- [ ] Modelo desativado some da escolha e continua aparecendo nas motos que já o usam; nenhum é apagado.
- [ ] Renomear um modelo atualiza o nome mostrado nas motos que o usam.
- [ ] O pedido de ingresso, que é aberto por quem ainda não foi aprovado, continua mostrando a lista.
- [ ] "Outro" continua existindo, com modelo e cilindrada digitados.
- [ ] O reconhecimento de grafias ("triumph scrambler 900cc") continua valendo para os modelos do banco.
- [ ] Nenhuma moto existente muda de modelo ou de cilindrada na migração.

## Blocked By

- 04 — Modelo da moto por lista.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis e de acesso — manutenção da lista por administrador, efeito de desativar e renomear nas motos existentes, e cadastro de moto e pedido de ingresso lendo a lista do banco.

## Verification

- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador: incluir um modelo no painel e cadastrar uma moto com ele; desativá-lo e conferir que a moto continua mostrando o modelo.
