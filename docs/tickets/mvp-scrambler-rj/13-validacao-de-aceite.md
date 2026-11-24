---
id: 13
title: Validação de aceite no celular e no desktop
status: pending
blocked_by: [01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12]
source: docs/specs/mvp-scrambler-rj.md — "Decisões de teste e critérios de aceite" (as duas tabelas, completas), "Validação pendente"
---

# 13 — Validação de aceite no celular e no desktop

## What To Build

Executar o critério de aceite aprovado do MVP: os fluxos de solicitante, participante e administrador, no navegador do celular e no do desktop, com contas distintas, aplicando todos os cenários da tabela de aceite do spec. Registrar o resultado de cada combinação de perfil, dispositivo e cenário. Para ações protegidas, complementar com uma tentativa direta no servidor usando a conta sem permissão. Conferir os dados após recarregar e na sessão da outra conta. Defeitos encontrados viram correções ou novos tickets.

Atualização de 2026-11-23: as telas Vestuário e Passeios, as fileiras de avatares e o perfil renovado vieram depois deste ticket e têm o próprio aceite em `docs/tickets/vestuario-passeios-e-perfil/09-aceite-das-telas-novas-e-revisao-das-decisoes.md`. Nos cenários daqui, onde a spec fala em lista de quem vai, quem recusou e quem não respondeu, a tela hoje mostra fileiras de avatares que abrem uma janela.

## Acceptance Criteria

- [ ] Fluxo do solicitante concluído no celular e no desktop.
- [ ] Fluxo do participante concluído no celular e no desktop.
- [ ] Fluxo do administrador concluído no celular e no desktop.
- [ ] Cada cenário da tabela de aceite tem resultado registrado: Abertura e entrada; Pedido de ingresso; Avaliação de perfil; Bloqueio; Receita → lote → pedido; Edição e pagamento; Correção e histórico; Fechamento e cancelamento; Produção e PDF; Passeio e divulgação; Concorrência e permissões.
- [ ] Tentativas diretas no servidor com conta sem permissão foram recusadas em todas as ações protegidas.
- [ ] Login com Google real validado (depende das credenciais OAuth criadas pelo usuário).
- [ ] Registro salvo em docs/tracking/mvp-scrambler-rj/, com defeitos e pendências listados.

## Blocked By

- Tickets 01 a 12.
- Usuário: credenciais OAuth do Google e e-mails reais dos administradores iniciais.
- Desejável: participação dos três administradores e de dois participantes.

## Execution Bundle

- normal validation
- Test Seam: TDD skipped: ticket de verificação manual de ponta a ponta; as regras já são cobertas pelos testes dos tickets anteriores.

## Verification

- [ ] Registro de aceite preenchido, com evidência por cenário e dispositivo.
