# Fluxos e telas do MVP

Type: prototype
Status: claimed
Assignee: Rafael Brito (condução assistida neste chat)
Parent: [Mapa do MVP — Scrambler RJ](../map.md)
Blocked by: 01

## Question

Como apresentar os fluxos do MVP no celular preservando o logo e a direção visual aprovada?

Criar protótipo navegável com dados fictícios, após resolver regras operacionais. Cobrir pedido pendente/pago, lote fechado, cadastro aguardando aprovação, confirmação de passeio e tarefas dos administradores. Comparar a experiência de membro e administrador. Validar com o usuário; aprovação da direção visual não é aprovação das telas.

Usar a skill prototype ao trabalhar este ticket.

## Protótipo para avaliação

- Fonte descartável: [prototype](../prototype/). Sem repositório Git neste chat; captura em branch fica pendente até existir repositório e uma decisão validada.
- Executar: `pnpm dev` dentro da pasta prototype. URL: http://localhost:3107.
- Variantes: `?variant=0` Clube (destaques), `?variant=1` Agenda (lista cronológica), `?variant=2` Painel (resumo pessoal e atalhos). Setas na barra inferior alternam variantes.
- Dados fictícios, estado em memória. Inclui pedido, bloqueio de pedido pago, confirmação de passeio e controles administrativos demonstrativos.
- Verificação: typecheck e lint passaram; inclusão de item e bloqueio após pagamento conferidos no navegador. Layout inspecionado em 390px, sem overflow horizontal.
- Limites explícitos: login real, criação completa de lotes/passeios, histórico, geração final do PDF e integrações não implementados. Impressão é somente demonstração do navegador.
- Aguardando avaliação do usuário sobre hierarquia e navegação. Ticket permanece claimed, sem decisão visual final.

## Rodada Impeccable — imagem primeiro

Usuário aprovou fluxo comp-first; registrado em prototype/.impeccable/config.json. Três composições mobile geradas com ferramenta nativa image_gen, logo original e protótipo como referências. Arquivos e prompts: prototype/.impeccable/mocks/decision/{actions,personal,ride}.{png,json}. Todas ainda não aprovadas.

Página de escolha: http://127.0.0.1:62022/ — chave 320e9910; seed surface 64c5d58b. Comparação entre ações pendentes, participação pessoal e passeio em foco. Não implementar antes da escolha.

## Revisão de direção

Usuário definiu preto/laranja e landing page web fotográfica por rolagem, referência Joplin. Rodada 320e9910 superada para essa superfície; nenhuma composição aprovada. Preparar nova composição de landing page, preservando fluxos internos. Material fotográfico e sequência final ainda pendentes.

## Landing page com fotos reais

Seis fotos recebidas e copiadas em public/photos. Composições A/B/C em prototype/.impeccable/mocks/landing, com prompts e aprovação ainda false. A: foto em tela inteira; B: assimetria inspirada em Joplin; C: capítulos do grupo. Na composição B, corrigir o texto gerado Entrar quiet para Entrar ao implementar. Fotos e logo originais devem substituir reconstruções dos mockups. Imagens estáticas não validam movimento. Aguardando escolha.

## Implementação da composição A

Usuário aprovou primeira estrutura da landing. Em /, fotos originais com narrativa preta/laranja; /membros mantém protótipo funcional demonstrativo recolorido. Motion implementa deslocamento suave e capítulos sticky, com redução de movimento. Desktop e celular inspecionados. Typecheck/lint passaram; detector sem achados. Comparação automática de comp: 63%, não aprovada como fidelidade completa; gate de assets incompatível com JPEG e logo original, registrado sem forçar aprovação. Revisão independente em andamento. Backend, Google Auth, Prisma/PostgreSQL e PDF final não implementados.

## Fechamento desta iteração visual

Landing composição A implementada. Revisor independente confirmou cinco correções visuais resolvidas: fusão da foto, tipografia, transição diagonal, CTA e proteção das cabeças no grupo. Disposition permanece fix exclusivamente por validação de hero/gate incompleta; não equivale a aprovação integral. DESIGN.md e .impeccable/design.json registrados a partir do código. Próxima avaliação do usuário deve focar rolagem e composição; backend e demais fluxos continuam pendentes.
