---
id: 03
title: Foto do perfil
status: done
blocked_by: [01]
source: docs/specs/perfis-dos-participantes.md — "Foto"; .impeccable/surfaces/src-app-perfil-page-tsx.md — "Foto"
---

# 03 — Foto do perfil

## What To Build

A pessoa envia uma foto de perfil, vê a prévia antes de salvar, troca e remove. A foto usa o mesmo armazenamento das fotos de lote e de passeio e só é entregue a quem está aprovado. Sem foto enviada aparece a da conta Google; sem ela, as iniciais num círculo creme. Um componente de avatar passa a existir para as próximas telas usarem.

## User Stories Covered

- 4. Enviar uma foto.
- 5. Ver a foto do Google ou as iniciais quando não há foto enviada.
- 6. Trocar ou remover a foto.

## Acceptance Criteria

- [x] Aceita JPG, PNG e WebP de até 5 MB; outro formato ou tamanho é recusado com mensagem clara.
- [x] Trocar a foto apaga o arquivo anterior do armazenamento; remover também.
- [x] A ordem de reserva é: foto enviada, foto do Google, iniciais.
- [x] As iniciais vêm do apelido quando existe, senão do nome.
- [x] A foto de perfil devolve 404 para quem não está aprovado ou não está logado.
- [x] O avatar tem texto alternativo com o nome da pessoa.
- [x] A foto aparece em "Meu perfil" no celular e no desktop sem distorcer.

## Blocked By

- 01 — ticket anterior desta pasta.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — gravar, trocar e remover a foto, com a limpeza do arquivo anterior; e a regra de reserva que decide o que o avatar mostra.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador: enviar, trocar e remover; conferir a reserva com uma conta sem foto.
