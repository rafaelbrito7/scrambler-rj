---
id: 10
title: Sininho com avisos de passeio, campanha e volta de peça
status: pending
blocked_by: []
source: docs/specs/notificacoes.md — decisões "Onde aparece", "A lista", "Visto", "Prazo e alcance", "Modelo" e as três primeiras linhas da tabela "Eventos e quem recebe"
---

# 10 — Sininho com avisos de passeio, campanha e volta de peça

## What To Build

A barra do topo ganha um sininho com a contagem do que é novo. Tocar abre a lista de avisos, zera a contagem e cada aviso leva ao que anuncia. Nesta fatia os avisos nascem de três eventos: passeio publicado, campanha de vestuário aberta e campanha aberta como volta de uma peça, em que quem pediu a volta recebe um aviso próprio.

## User Stories Covered

- 1–4. Contagem no topo, lista que leva ao destino, zerar ao abrir, novos destacados.
- 5–7. Passeio publicado, campanha aberta, a peça que eu pedi voltou.
- 13–15. Sem aviso da própria ação, sem aviso para quem não está aprovado, contagem em palavras.

## Acceptance Criteria

- [ ] O sininho aparece em toda tela da área logada para riders aprovados, com o número de avisos novos; sem novos, sem número.
- [ ] No celular o sininho fica fora da linha do menu que rola, sempre visível.
- [ ] A lista mostra os avisos do mais recente ao mais antigo, com frase, data e destino; os novos levam o selo "Novo".
- [ ] Abrir a lista zera a contagem daquela pessoa; um aviso que chega depois volta a contar.
- [ ] Aviso com mais de trinta dias não aparece.
- [ ] Publicar um passeio avisa os riders aprovados, menos quem publicou.
- [ ] Abrir uma campanha avisa os riders aprovados, menos quem abriu.
- [ ] Abrir uma campanha como volta de peça avisa quem pediu com "A peça que você pediu voltou" e os demais com o aviso comum; ninguém recebe dois.
- [ ] O aviso é gravado por destinatário na mesma transação do evento; a frase é montada na leitura.
- [ ] Quem não está aprovado não recebe; quem é bloqueado depois deixa de ver; um rider não lê os avisos de outro.
- [ ] A leitura de tela diz a contagem em palavras.
- [ ] O DESIGN.md descreve o sininho e a lista.

## Blocked By

- None - can start immediately
- Prefactoring: a barra do topo passa a receber a contagem de avisos, como já recebe a de pedidos de ingresso.

## Execution Bundle

- tdd
- Test Seam: serviço de avisos com a data injetada — quem recebe em cada um dos três eventos, quem causou não recebe, volta de peça sem aviso duplicado, contagem antes e depois de abrir, prazo de trinta dias, acesso.

## Verification

- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador, celular e desktop, com duas contas: pedir a volta com uma, abrir a campanha com a outra, ver o aviso próprio chegar, abrir a lista e ver a contagem zerar.
- [ ] Publicar um passeio e conferir o aviso na conta de rider e a ausência dele na de quem publicou.
