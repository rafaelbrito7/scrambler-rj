---
id: 12
title: Copiar resumo com link da campanha
status: done
blocked_by: [03, 10]
source: docs/specs/mvp-scrambler-rj.md — história 37, cenário de aceite "Passeio e divulgação" (primeira frase); PRODUCT.md — "Operating Context" (divulgação manual) e "Brand Commitments" (voz)
---

# 12 — Copiar resumo com link da campanha

## What To Build

Na tela administrativa de um lote e de um passeio, um botão copia para a área de transferência um resumo em texto simples, pronto para colar no WhatsApp, com o link direto da campanha. Para lote: modelo, preço e cores/tamanhos. Para passeio: data, percurso, ponto de encontro, saída e previsão de retorno. O link abre a campanha para quem já está logado e aprovado; quem não está logado passa pela entrada e volta para a campanha depois de entrar. A plataforma não envia mensagens.

## User Stories Covered

- 37. Copiar um resumo com o link da campanha para divulgar no WhatsApp.

## Acceptance Criteria

- [x] Botão de copiar em lote e em passeio, com confirmação visível de que copiou.
- [x] O texto do lote traz modelo, preço, cores, tamanhos e link.
- [x] O texto do passeio traz data, percurso, encontro, saída, retorno, link de mapa (se houver) e link da campanha.
- [x] O link colado abre a campanha correta para um participante aprovado.
- [x] O texto segue a voz do grupo: direto, informal, sem "clube" ou "motoclube".
- [x] Sem telefones nem nomes de participantes no resumo.

## Blocked By

- 03 — Abrir lote direto e ver no Início.
- 10 — Publicar passeio e responder presença.

## Execution Bundle

- tdd
- Test Seam: função que monta o resumo — dado um lote ou um passeio, retorna o texto com os campos esperados e o link absoluto correto.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: copiar, colar num editor e abrir o link em outra conta.
