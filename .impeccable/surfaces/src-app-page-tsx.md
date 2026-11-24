---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Entrada (/)

Mode: Operate. Scope: `src/app/page.tsx` e as telas de portão (`/pedido`, `/situacao`).

A landing page que ocupava esta rota foi descartada pelo usuário em 2026-11-17. O contrato de direção anterior não vale mais.

## Audience and job

- Quem recebeu o link e quer entrar ou pedir ingresso no grupo.
- Ação: entrar com Google. Sem conta aprovada, o passo seguinte é o pedido de ingresso.
- A abertura do logo (em `src/components/intro/`) toca antes, em todo acesso de quem não está logado, e é a única peça expressiva.
- Regras em `docs/specs/mvp-scrambler-rj.md`.

## Direction

Coluna única estreita sobre preto: logo, título em Archivo condensada pesada, texto em Figtree, um botão laranja. Sem fotografia, sem painéis. Não pode parecer motoclube.

## Unresolved

- Credenciais do Google ainda não configuradas; o botão fica indisponível e existe um login de teste só em desenvolvimento.
