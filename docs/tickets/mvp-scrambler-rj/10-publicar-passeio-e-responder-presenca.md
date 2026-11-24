---
id: 10
title: Publicar passeio e responder presença
status: done
blocked_by: [03]
source: docs/specs/mvp-scrambler-rj.md — "Passeios" (até "forma uma terceira lista"; "Sem limite de vagas"), "Início e navegação", cenário de aceite "Passeio e divulgação" (respostas)
---

# 10 — Publicar passeio e responder presença

## What To Build

No painel, o administrador publica um passeio com data, percurso, ponto de encontro, horário de saída e previsão de retorno; o link de mapa e a foto são opcionais. O passeio com confirmação aberta aparece em "Campanhas ativas" junto dos lotes. O participante abre o passeio, lê os detalhes e responde Vou ou Não vou, podendo alternar enquanto a confirmação estiver aberta. Todos os participantes aprovados veem três listas: quem vai, quem não vai e quem ainda não respondeu. Não há limite de vagas.

## User Stories Covered

- 20. Encontrar todos os passeios ativos (parte de passeios).
- 34. Publicar percurso, encontro e horários de um passeio.
- 35. Confirmar ou alterar a resposta e consultar quem vai, quem recusou e quem não respondeu.

## Acceptance Criteria

- [x] Publicar exige data, percurso, ponto de encontro, saída e previsão de retorno; link de mapa é opcional.
- [x] O passeio aparece no Início junto dos lotes; o Início funciona com só lotes, só passeios, ambos ou vazio.
- [x] Foto do passeio é opcional e usa o mesmo armazenamento de fotos dos lotes; o cartão sem foto fica bem resolvido.
- [x] No Início, a seção Passeios vem antes de Lotes, ordenada por data, com pendentes antes dos respondidos; seção sem itens não aparece.
- [x] O cartão do passeio mostra data e saída, percurso, ponto de encontro, números do grupo (vão, não vão, sem resposta) e a situação da pessoa.
- [x] A pessoa responde Vou ou Não vou no próprio cartão, sem abrir o passeio; "Trocar" reabre a escolha no lugar. Enviando trava os botões; erro avisa e mantém a resposta anterior.
- [x] A linha de resumo do Início soma passeios sem resposta e lotes sem pedido da pessoa.
- [x] Participante responde Vou, troca para Não vou e vice-versa; existe uma única resposta por pessoa.
- [x] Repetir a mesma confirmação não duplica respostas.
- [x] As três listas refletem as respostas; "não respondeu" inclui todo participante aprovado sem resposta.
- [x] As listas não mostram telefone.
- [x] Quem não está aprovado não vê o passeio nem responde, nem por link direto.
- [x] Conta de participante não publica passeio por chamada direta.
- [x] Detalhes e botões de resposta são confortáveis no celular.

## Blocked By

- 03 — Abrir lote direto e ver no Início (compartilham a lista de campanhas ativas do Início).

## Execution Bundle

- tdd
- Test Seam: serviço de passeios — publicar (campos obrigatórios, permissão) e responder presença (resposta única por participante, alternância, composição das três listas), mais a listagem do Início com a situação da pessoa e a ordem pendentes-primeiro.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador (celular e desktop), com duas contas: publicar, responder Vou, trocar para Não vou e conferir as listas na outra conta.
