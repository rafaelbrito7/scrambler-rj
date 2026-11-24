---
id: 02
title: Editar dados pessoais
status: done
blocked_by: [01]
source: docs/specs/perfis-dos-participantes.md — "Dados do perfil", "Instagram", "Como o nome aparece", tabela "Quem vê o quê"; .impeccable/surfaces/src-app-perfil-page-tsx.md — "Editar perfil"
---

# 02 — Editar dados pessoais

## What To Build

"Meu perfil" ganha o botão "Editar perfil", que abre um formulário com um único "Salvar". Nesta fatia entram os blocos "Todo o grupo" (nome, apelido, Instagram) e "Só administradores" (WhatsApp e tamanho de roupa). O cabeçalho de cada bloco diz quem vê aqueles dados antes dos campos.

O Instagram aceita o usuário com ou sem @, ou o endereço do perfil colado, e guarda só o usuário. Com o apelido existindo, as telas do grupo passam a mostrar o apelido quando há um e o nome quando não; painel e PDF mostram o nome, com o apelido entre parênteses.

## User Stories Covered

- 2. Corrigir o nome.
- 3. Informar um apelido.
- 7. Atualizar o WhatsApp.
- 8. Ter certeza de que o WhatsApp só é visto por administradores.
- 15. Guardar o tamanho de roupa.
- 22. Ler quem vê cada dado antes de preencher.
- 23. Ser avisado quando o perfil for salvo.
- 24. Ver o que está errado sem perder o resto.
- 41. Informar o Instagram.
- 42. Colar o endereço ou digitar só o usuário, com ou sem @.
- 43. Remover o Instagram.

## Acceptance Criteria

- [x] Nome e WhatsApp são obrigatórios, com as mesmas regras do pedido de ingresso; apelido, Instagram e tamanho são opcionais.
- [x] O tamanho só aceita um dos tamanhos que os lotes usam, ou nenhum.
- [x] `brutavares`, `@brutavares` e `https://www.instagram.com/brutavares/` gravam o mesmo usuário; texto fora do formato é recusado com mensagem clara.
- [x] Apagar o campo remove o Instagram ou o apelido.
- [x] Um campo recusado mantém os outros preenchidos e aponta o erro no campo.
- [x] Salvar mostra confirmação em "Meu perfil".
- [x] Início, listas de pedidos e de presença mostram o apelido quando existe; painel e PDF mostram "Nome (Apelido)".
- [x] Uma pessoa só edita o próprio perfil, inclusive por chamada direta.
- [x] Cada bloco do formulário diz quem vê aqueles dados.

## Blocked By

- 01 — ticket anterior desta pasta.

## Execution Bundle

- tdd
- Test Seam: serviço de perfis — edição dos dados pessoais com suas validações, normalização do Instagram, posse do perfil; e o nome exibido pelos serviços de pedidos, passeios e relatório.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] No navegador (celular e desktop): editar com erro e sem erro; conferir o apelido numa lista de presença e o nome com apelido no painel e no PDF.
