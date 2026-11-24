---
id: 11
title: Rota como template
status: cancelled
blocked_by: [02, 03]
source: docs/specs/passeios-roteiro-e-mapa.md — decisão "Rota como template"
---

# 11 — Rota como template

Cancelado em 2026-11-23, por decisão do usuário: o grupo não vai salvar a rota de um passeio para reutilizar. Nada foi construído.

## What To Build

O administrador salva a rota de um passeio como template, com um nome, e publica um passeio novo a partir dele, ajustando o que mudar. O painel lista os templates de rota, com renomear e apagar.

## User Stories Covered

- 43–46. Salvar como template, publicar a partir dele, independência entre os dois, renomear e apagar.

## Acceptance Criteria

- [ ] O template guarda título, descrição, paradas sem horários, ficha, recomendações, observação e plano B, e o traçado ou GPX quando existirem.
- [ ] Não guarda data, horários, foto, respostas nem galeria.
- [ ] Publicar a partir de um template preenche o formulário com uma cópia; nada é publicado sem o administrador informar data e horários.
- [ ] Mudar o passeio não muda o template, e mudar ou apagar o template não muda nenhum passeio.
- [ ] O painel lista os templates de rota, com renomear e apagar com confirmação no lugar; não há tela para criar um do zero.
- [ ] A interface chama de "template de rota", distinto dos templates de vestuário.
- [ ] Riders não acessam templates, nem por chamada direta.

## Blocked By

- 02 — Ficha da rota.
- 03 — Leve com você e plano B.

## Execution Bundle

- tdd
- Test Seam: serviço de passeios — salvar a partir de um passeio, o que é e o que não é copiado, publicar a partir do template, independência nas duas direções. Arte anterior: testes de templates de vestuário.

## Verification

- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [ ] No navegador: salvar um template, publicar dois passeios a partir dele ajustando só o segundo, apagar o template e conferir os dois passeios.
