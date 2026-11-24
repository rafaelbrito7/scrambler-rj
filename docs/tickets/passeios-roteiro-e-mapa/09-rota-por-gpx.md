---
id: 09
title: Rota por GPX
status: done
blocked_by: [07]
source: docs/specs/passeios-roteiro-e-mapa.md — decisão "GPX"
---

# 09 — Rota por GPX

## What To Build

O administrador pode enviar um arquivo GPX no lugar da rota calculada. O traçado e a distância passam a vir do arquivo; remover o arquivo volta à rota calculada.

## User Stories Covered

- 30. Enviar um GPX da rota que já fiz.

## Acceptance Criteria

- [x] Aceita GPX com trilha ou rota, até 5 MB; arquivo inválido, vazio ou grande demais é recusado com mensagem clara, sem alterar o passeio.
- [x] O traçado é simplificado para no máximo 5.000 pontos, sem mudar visivelmente a forma.
- [x] A distância vem do arquivo; o tempo de rolé fica vazio até ser digitado, e o formulário diz isso. Enquanto o passeio tem o arquivo, o campo de distância fica travado. O tempo de rolé nunca é preenchido pelo arquivo; um tempo já digitado não é apagado ao trocar o arquivo.
- [x] Com GPX, mudar as paradas não recalcula o traçado; os marcadores continuam vindo das paradas.
- [x] Remover o GPX volta à rota calculada pelas paradas.
- [x] O arquivo é lido no servidor, sem serviço externo.

## Blocked By

- 07 — Mapa com rota calculada.

## Execution Bundle

- tdd
- Test Seam: funções puras de leitura e simplificação do GPX, com arquivos de exemplo válidos, vazios, grandes e malformados, e a distância conferida contra um traçado conhecido; no serviço, enviar e remover.

## Verification

- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` limpos.
- [x] Em 2026-11-23, no navegador, desktop: arquivo inválido recusado com a mensagem no campo; GPX de 801 pontos gerado para o teste desenhado no mapa, com os marcadores das paradas e a distância do arquivo (38 km); campo de distância travado na edição; remover voltou à rota calculada.
- [ ] Enviar um GPX exportado de um aparelho ou aplicativo de verdade, e conferir o formulário no celular. Não conferido.

## Revisão (2026-11-23)

Duas revisões independentes, Standards e Spec. Corrigido: caixa de remover trocada pelo `Checkbox` do registro; a escolha de remover não se perde mais depois de um erro; a distância continua sendo a do arquivo nas edições seguintes; arquivo com marcas prefixadas (`gpx:trkpt`) e com comentários é lido certo; as listas de passeios não carregam mais o traçado; nomes e mensagem duplicada.

Mantido como está, por decisão de implementação: várias trilhas no mesmo arquivo são lidas como uma estrada só, emendadas na ordem; a tolerância da simplificação é em graus, sem corrigir a longitude pela latitude.
