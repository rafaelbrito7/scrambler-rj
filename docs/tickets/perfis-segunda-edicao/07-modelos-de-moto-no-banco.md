---
id: 07
title: Modelos de moto no banco
status: done
blocked_by: [04]
source: docs/specs/perfis-dos-participantes.md — "Segunda edição", decisão "Modelo da moto por lista" (revista pelo usuário em 2026-11-17)
---

# 07 — Modelos de moto no banco

## What To Build

A lista de modelos de Scrambler sai do código e vai para o banco de dados. Os administradores a mantêm numa tela do painel: incluir um modelo com sua cilindrada, renomear, reordenar e desativar. O pedido de ingresso e o formulário de moto passam a ler a lista do banco. Os oito modelos atuais entram prontos, pela migração.

## User Stories Covered

- 63–65, 68. Escolher o modelo numa lista, com a cilindrada vindo junto, no perfil e no pedido de ingresso.

## Acceptance Criteria

- [x] Os oito modelos atuais entram no banco pela migração, com nome, cilindrada e posição.
- [x] O painel tem uma tela de modelos em que o administrador inclui, renomeia, muda a cilindrada, reordena, desativa e reativa; riders não acessam, nem por chamada direta.
- [x] Modelo desativado some da escolha e continua aparecendo nas motos que já o usam; nenhum é apagado.
- [x] Renomear um modelo atualiza o nome mostrado nas motos que o usam.
- [x] O pedido de ingresso, que é aberto por quem ainda não foi aprovado, continua mostrando a lista.
- [x] "Outro" continua existindo, com modelo e cilindrada digitados.
- [x] O reconhecimento de grafias ("triumph scrambler 900cc") continua valendo para os modelos do banco.
- [x] Nenhuma moto existente muda de modelo ou de cilindrada na migração.

## Blocked By

- 04 — Modelo da moto por lista.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis e de acesso — manutenção da lista por administrador, efeito de desativar e renomear nas motos existentes, e cadastro de moto e pedido de ingresso lendo a lista do banco.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] Em 2026-11-24, no navegador, como administrador: incluí um modelo no painel e cadastrei uma moto com ele; renomeei e a moto acompanhou; desativei e ele saiu da escolha, continuou na moto e continuou selecionado ao editar essa moto.
- [ ] Conferir o pedido de ingresso com uma conta nova e a tela de modelos no celular. Não conferido no navegador; a leitura da lista sem aprovação está coberta por teste.

## Decisões de implementação

- A moto de um modelo da lista aponta para ele e guarda uma cópia do nome e da cilindrada, que o serviço reescreve ao renomear. As telas e o PDF continuam lendo a cópia.
- A migração liga a um modelo só as motos com o mesmo nome e a mesma cilindrada. As demais continuam como "Outro".
- Dois modelos que respondem pela mesma grafia são recusados, contando os desativados; um nome feito só de "Triumph", "cc" ou pontuação também.
- A moto que já usa um modelo desativado continua podendo mantê-lo ao ser editada.
- O pedido de ingresso já enviado não é reescrito quando o modelo muda de nome.
- A tela fica em Gestão de riders, "Modelos de moto", como as recomendações ficam em Passeios.

## Revisão (2026-11-24)

Duas revisões independentes, Standards e Spec com análise de impacto. Sem violação de regra documentada. Corrigido: nome de modelo que se reduzia a nada casava com campo vazio; renomear um modelo no instante em que alguém cadastrava uma moto podia deixar a moto com o nome antigo; valor inesperado no formulário desativava o modelo; a lista inicial dos testes não era conferida contra a migração.

Mantido como está: uma moto "Outro" cujo texto é igual ao nome de um modelo da lista passa a ser desse modelo, com a cilindrada dele, ao ser salva. É a regra que já valia antes deste ticket.
