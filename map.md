# Mapa do MVP — Scrambler RJ

Label: wayfinder:map

## Destination

Definir fluxos, regras e decisões técnicas do MVP de lotes de vestuário, passeios e painel administrativo, pronto para especificação e implementação. Este mapa planeja; não implementa.

## Notes

Contexto aprovado na conversa:

- Grupo de proprietários de Triumph Scrambler de todas as cilindradas no RJ. Priorizar celular e acessos provenientes do WhatsApp.
- Login Google com Auth.js. Link compartilhado, cadastro e aprovação inicial por administrador. Cadastro: nome, WhatsApp e modelo/cilindrada da moto. Telefone visível apenas aos administradores.
- Inicialmente três administradores, com as mesmas permissões para membros, lotes, pagamentos e passeios; administradores podem promover membros.
- Lote é campanha de encomendas, sem estoque: um modelo por lote, imagem da peça, cores, tamanhos e preço unitário único. Pedido permite várias combinações e quantidades.
- Membro pode editar/excluir pedido pendente enquanto lote aberto. Pedido pago ou lote fechado: somente administrador altera.
- Pagamento integral, marcado manualmente somente por administrador. Registrar autor e data. Alteração do total de pedido pago retorna a Pendente; alteração sem mudança de total preserva Pago.
- Membros aprovados veem pedidos e situação de pagamento de todos. Administradores têm consolidação por cor/tamanho e valores pagos/pendentes.
- Passeio: percurso, ponto de encontro, data, saída e previsão de retorno. Sem limite de vagas. Respostas Vou/Não vou, com não respondentes separados. Respostas alteráveis até encerramento. Membros veem quem vai.
- Encerramento e reabertura de lotes e confirmações são manuais. Administrador pode cancelar passeio.
- Divulgação manual por botão de copiar mensagem com resumo e link.
- Stack aprovada: Next.js, TypeScript, Tailwind CSS v4, PostgreSQL, Prisma, Auth.js, pnpm e ESLint. Hospedagem e armazenamento de imagens ainda pendentes; usuário não possui infraestrutura.
- Direção visual revisada: preservar logo, preto e laranja como identidade principal. Landing page web responsiva, fotográfica, com frases não clichês e imagens sequenciadas por rolagem; referência Joplin/Hostinger. Separar apresentação da área autenticada de gestão. Creme não é mais fundo dominante.
- Protótipo previsto: lotes/passeios, detalhe de lote e pedido, confirmação de passeio, painel administrativo. Validar com três administradores e, se possível, dois membros.
- Usar atlas-wayfinder ao retomar; tickets de protótipo usam prototype. Não implementar antes de concluir decisões relevantes.
- Tracker local na raiz do projeto ScramblerRJ; aplicação em prototype/. Tickets abertos: Status: open; claim antes do trabalho; registrar resolução no próprio ticket.

## Decisions so far

- [Regras operacionais e exceções do MVP](issues/01-regras-operacionais.md): aprovadas regras de bloqueio, cancelamentos, correções, preço, permissões, passeios e relatório PDF compartilhável.

## Not yet specified

- Detalhamento das telas administrativas após validação dos fluxos.
- Critérios de aceite e estratégia de verificação a consolidar após decisões de comportamento e protótipo.

## Out of scope

- Cobrança integrada e pagamentos parciais; cobrança e entrega combinadas fora do site.
- Automação de WhatsApp, autenticação por SMS/WhatsApp, estoque e limite de vagas.
- Encerramento automático agendado.
- Exportação CSV e exportação como imagem no MVP.
- Implementação e publicação nesta etapa de planejamento.

## Continuidade — design system

- Usuário aprovou área interna preta/laranja com tipografia discreta e foco em leitura/rapidez (Q30).
- Usuário aprovou Base UI + Tailwind v4, design system no próprio projeto e catálogo /design-system, sem pacote separado (Q31).
- Usuário aprovou em 2026-11-17 `@react-pdf/renderer` para o PDF do lote; `sharp` converte as fotos para o formato que ele lê.
- Usuário aprovou em 2026-11-17 shadcn/ui com primitivos Base UI (estilo `lyra`) como biblioteca de componentes. Componentes ficam em `src/components/ui`, restilizados para o DESIGN.md; novos entram via `pnpm dlx shadcn@latest add <nome>` e são restilizados antes do uso. HeroUI foi descartado por impor visual próprio.
- Q29 aprovada: desenhar primeiro a página inicial do participante e a gestão administrativa de um lote. Após aprovação visual, extrair os componentes, estados e estilos dessas telas para o catálogo.
- Todo o trabalho transferido para /Users/rafaelbrito/PersonalProjects/ScramblerRJ; estrutura preservada.

- Direção visual da gestão de lote aprovada. No Início do participante, usar “Campanhas ativas” e listar todos os lotes abertos para pedidos e todos os passeios com confirmação aberta. A seção comporta vários itens de cada tipo ou apenas um tipo ativo.
- Hoje, o vestuário é vendido pelo custo. Para uma etapa futura, prever transparência por lote sobre o custo da peça, o adicional destinado a eventos do grupo e o extra efetivamente arrecadado. [Detalhamento da contribuição para eventos](issues/04-contribuicao-eventos.md).

- Lotes de vestuário: cada cor tem sua própria foto; selecionar a cor atualiza a prévia da peça.
- Administradores criam, editam e reutilizam receitas com modelo, cores/fotos, tamanhos e preço. Ao abrir um lote, os dados são copiados e podem ser ajustados. Alterar uma receita preserva os lotes anteriores.

## Continuidade — entrada sem landing (2026-11-17)

- Usuário descartou a landing page. A raiz do endereço mostra a abertura do logo e segue direto para a tela de entrada. As notas acima sobre a landing fotográfica ficam como histórico, não como direção vigente.
- Novos usuários enviam um pedido de ingresso. O painel de gerenciamento ganha a tela de avaliações de perfil, onde um único administrador aprova ou reprova. Estados: em avaliação, aprovado, reprovado, bloqueado.
- Confirmado pelo usuário: a decisão de um administrador basta; não há votação.
- Em aberto: motivo obrigatório na reprovação; reenvio do pedido pelo próprio solicitante.
- Confirmado pelo usuário: a abertura do logo toca em todo acesso de quem não está logado; logado, não aparece.
- Especificação atualizada em [docs/specs/mvp-scrambler-rj.md](docs/specs/mvp-scrambler-rj.md).

## Continuidade — construção do MVP e perfis (2026-11-17)

- O mapa acima planejou; a construção já aconteceu. Estão implementados os tickets de `docs/tickets/mvp-scrambler-rj/` (01 a 12): acesso, bloqueio, administradores, lotes, receitas, pedidos, pagamentos, fechamento e cancelamento, produção, PDF, passeios e resumo com link. Falta o 13, a validação de aceite.
- "Detalhamento das telas administrativas" e "critérios de aceite", listados em "Not yet specified", foram resolvidos no spec e nos tickets. As notas sobre protótipo em `prototype/` e sobre o catálogo `/design-system` ficam como histórico: não há protótipo nem catálogo; o sistema visual está no `DESIGN.md`.
- Confirmado pelo usuário: a entrada dos administradores fica em endereço próprio (`/painel/entrar`), sem link nas telas dos participantes. Enquanto o Google não está configurado, e só em desenvolvimento, as duas entradas usam contas de teste.
- Confirmado pelo usuário: desenho da tela "Campanhas ativas" (resumo do que falta, Passeios antes de Lotes, pendentes primeiro, resposta de presença no cartão, foto de passeio opcional).
- Confirmado pelo usuário: revisão dos papéis de cor, mantendo a paleta.
- Confirmado pelo usuário: perfis dos participantes, com Instagram visível ao grupo e as quatro suposições do spec (apelido nas telas do grupo, limite de cinco motos, administrador não edita perfil alheio, lembrete dispensável no Início). Especificação em [docs/specs/perfis-dos-participantes.md](docs/specs/perfis-dos-participantes.md); tickets 01 a 08 em `docs/tickets/perfis/`, todos implementados.
- Decisões tomadas na implementação, ainda não revistas pelo usuário: pedido cancelado pode ser refeito pelo titular com o lote aberto; fechar e reabrir lote ou passeio não registram autor; receitas ficam dentro da aba Lotes; o texto do resumo de divulgação.
- Em aberto: hospedagem e armazenamento de fotos (com dado de saúde no perfil, pesa mais); redimensionamento das fotos enviadas; fonte do PDF; credenciais do Google e e-mails reais dos administradores; motivo obrigatório na reprovação; reenvio do pedido de ingresso pelo solicitante; menu do administrador no celular, que quebra em duas linhas.

## Continuidade — nomenclatura (2026-11-17)

- Decisão do usuário: quem faz parte do grupo passa a se chamar **rider** (plural **riders**), no lugar de "participante". Vale para telas, documentos e comunicação. A regra está em `AGENTS.md`.
- Trocado: textos de interface, o PDF do lote, a aba e o endereço do painel (`/painel/riders`), `PRODUCT.md`, `DESIGN.md`, as duas especificações e os desenhos de tela.
- Mantido de propósito: identificadores no código (`PARTICIPANT`, `participant`), o e-mail da conta de teste, os nomes de arquivo (`perfis-dos-participantes.md` e os tickets) e o texto dos tickets já concluídos, que são registro do que foi feito. As notas antigas deste mapa, que falam em "membros" e "participantes", ficam como histórico.

## Nomenclatura de vestuário (2026-11-17)

- Decisão do usuário: “lote” vira “campanha de vestuário” (seção e aba “Vestuário”) e “receita” vira “template”. As notas acima guardam os termos antigos.
- Trocado: textos de interface, selos (Aberta, Fechada, Cancelada), PDF e nome do arquivo, resumo de divulgação, endereços (`/vestuario/[id]`, `/painel/vestuario`, `/painel/templates`), `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `design.json`. Os endereços antigos não redirecionam.
- Não trocado: identificadores de código (`Batch`, `Recipe`), banco, tickets antigos e seus nomes de arquivo.

## Telas Vestuário e Passeios, avatares e perfil (2026-11-23)

- Decisões do usuário: tela Vestuário com tudo o que o grupo já teve e pedido de volta por peça, atendido com campanha nova por cópia (não reabrindo a antiga); tela Passeios com os realizados; toda contagem de pessoas vira fileira de avatares com "+n" e janela com nome, Instagram e "Ver perfil"; perfil com moto principal em destaque, Instagram como botão e fotos da pessoa nos passeios.
- Especificação em [docs/specs/vestuario-passeios-e-perfil.md](docs/specs/vestuario-passeios-e-perfil.md), implementada na mesma data. Do histórico decidido em 2026-11-17 entraram contagem, selo, sequência e passeios recentes no perfil.
- Em aberto: filtros, busca e selo na tela Riders; rever as decisões tomadas na implementação listadas nas notas da spec; conferir as telas como rider comum.

## Sininho de notificações (2026-11-23)

- Decisões do usuário: sininho na barra do topo, só dentro da plataforma; abrir a lista zera a contagem; avisos somem em trinta dias. Avisam: passeio publicado, campanha aberta, volta de peça (aviso próprio a quem pediu), passeio alterado ou cancelado para quem vai, mudança no próprio pedido, foto publicada e, para administradores, pedido de ingresso.
- Especificação em [docs/specs/notificacoes.md](docs/specs/notificacoes.md); tickets 10 a 12 em `docs/tickets/vestuario-passeios-e-perfil/`. Não implementado.
- A confirmar: as suposições listadas nas notas da spec.

## Entrada única (2026-11-23)

- Decisão do usuário: não há mais área de login de administrador. Todos entram pela raiz e os administradores veem as funcionalidades de administrador a partir da conta. Substitui a decisão acima de manter `/painel/entrar` em endereço próprio.
- Implementado: `/painel/entrar` removido; em desenvolvimento, a raiz ganhou o botão "Entrar como administrador de teste".
