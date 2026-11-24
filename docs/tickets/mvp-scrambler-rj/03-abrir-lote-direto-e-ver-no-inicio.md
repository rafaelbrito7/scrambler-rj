---
id: 03
title: Abrir lote direto e ver no Início
status: done
blocked_by: []
source: docs/specs/mvp-scrambler-rj.md — "Início e navegação", "Receita e lote" (lote preparado diretamente; um modelo e um preço; troca de cor; validação cor↔imagem); issues/03-hospedagem.md (armazenamento de fotos em aberto)
---

# 03 — Abrir lote direto e ver no Início

## What To Build

Primeira fatia de lotes, de ponta a ponta. No painel, um administrador prepara um lote diretamente: modelo da peça, preço unitário em reais, tamanhos oferecidos e pares de cor e foto. Ao abrir, o lote aparece em "Campanhas ativas" no Início de todo participante aprovado. O participante abre o lote, vê modelo e preço, e ao selecionar uma cor vê a foto daquela cor, inclusive ao voltar a uma cor já vista. Ainda não há pedido nesta fatia.

O Início passa a listar lotes abertos e mantém o estado vazio quando não houver nenhum.

Armazenamento de fotos: a hospedagem segue em aberto. Entregar o envio de fotos atrás de uma interface de armazenamento com implementação em disco local para desenvolvimento, para que a troca por um serviço externo não altere o restante.

## User Stories Covered

- 20. Encontrar todos os lotes ativos (parte de lotes).
- 21. Abrir um lote de um único modelo com preço, tamanhos e fotos por cor.
- 24. Ver a foto correspondente à cor selecionada.

## Acceptance Criteria

- [x] Administrador cria e abre um lote com modelo, preço, ao menos um tamanho e ao menos uma cor com foto.
- [x] Abrir é recusado se alguma cor oferecida não tiver foto, ou se faltar modelo, preço ou tamanho.
- [x] Preço é guardado como valor monetário exato em reais (sem ponto flutuante).
- [x] O lote aberto aparece em "Campanhas ativas"; vários lotes abertos aparecem juntos; sem lotes, o estado vazio continua.
- [x] Na página do lote, trocar a cor troca a foto, inclusive ao voltar à seleção anterior.
- [x] Solicitante em avaliação, reprovado ou bloqueado não vê o lote nem por link direto.
- [x] Conta de participante não abre a tela de criação nem cria lote por chamada direta.
- [x] Fotos passam por uma interface de armazenamento substituível.
- [x] Telas funcionam no celular e no desktop, seguindo DESIGN.md.

## Blocked By

None - can start immediately

## Execution Bundle

- tdd
- Test Seam: serviço de lotes — abrir lote (validações de modelo, preço, tamanhos e correspondência cor↔foto, permissão de administrador) e listar campanhas ativas para um participante aprovado.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador (celular e desktop): admin abre lote com duas cores; participante vê no Início e alterna as fotos.
