# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js, TypeScript, Tailwind CSS v4, PostgreSQL, Prisma, Auth.js (login Google), shadcn/ui sobre Base UI, `@react-pdf/renderer` para o PDF da campanha, pnpm, ESLint e Vitest. Aprovada pelo usuário em `map.md`. Hospedagem e armazenamento de imagens em aberto (`issues/03-hospedagem.md`); as fotos ficam em disco local atrás de uma interface trocável.

## Users

- **Riders**: pessoas do Rio de Janeiro que têm Triumph Scrambler de qualquer cilindrada. Chegam pelo celular, a partir de um link no WhatsApp, para pedir uma peça de vestuário ou responder se vão a um passeio. Mantêm um perfil e veem quem mais é do grupo.
- **Administradores**: três inicialmente, com poderes iguais. Avaliam os pedidos de ingresso, abrem campanhas de vestuário e passeios, conferem pagamentos, consolidam a produção e compartilham relatórios. Entram por um endereço próprio, sem link nas telas dos riders, e veem a ficha completa de cada pessoa.
- **Solicitantes**: pessoas que têm uma Scrambler, receberam o link e pedem ingresso no grupo. Entram com Google, enviam o pedido e aguardam a avaliação de um administrador.

## Product Purpose

Substituir as listas copiadas e reconciliadas à mão no WhatsApp. Hoje cada pedido de camiseta é uma mensagem repassada com cor, tamanho e quantidade, e as confirmações de passeio ficam soltas em outra conversa. A plataforma dá a cada campanha um registro único: o rider pede ou confirma, o administrador controla pagamentos, produção e presenças sobre os mesmos dados.

Sucesso: rider e administrador concluem seus fluxos no celular e no desktop sem recorrer a listas paralelas (critérios em `docs/specs/mvp-scrambler-rj.md`).

## Positioning

Ferramenta feita para um grupo específico, não um produto genérico de eventos ou loja. O WhatsApp continua sendo o canal de divulgação; a plataforma só guarda o registro. Sem estoque, sem cobrança integrada, sem automação de mensagens: campanha de vestuário é encomenda a preço de custo, com pagamento conferido manualmente e visível a todos os riders aprovados.

## Operating Context

- Entrada por link compartilhado no WhatsApp; celular é o dispositivo principal, desktop também é critério de aceite.
- Não há landing page: a raiz mostra a abertura do logo e vai direto para a tela de entrada.
- Pedido de ingresso com Google, nome, WhatsApp e modelo/cilindrada. Um único administrador aprova ou reprova na tela de avaliações de perfil do painel.
- Início do rider: “Campanhas ativas” com todas as campanhas de vestuário abertas e passeios com confirmação aberta (vários, um só tipo ou lista vazia). Diz em quantas campanhas falta a pessoa agir; a presença é respondida no próprio cartão.
- Telas Passeios e Vestuário no menu: o que está em campanha e tudo o que o grupo já teve (passeios realizados, peças de campanhas fechadas).
- Um link de campanha de vestuário ou de passeio aberto por quem não está logado volta para aquela campanha depois da entrada.
- Divulgação manual: botão de copiar resumo com link; PDF da campanha compartilhado manualmente pelo administrador.
- Cobrança e entrega são combinadas fora do site.

## Capabilities and Constraints

- **Acesso**: pedido em avaliação, reprovado ou bloqueado não vê dados do grupo, nem por link direto. Cada decisão registra autor e data; uma reprovação pode ser revertida por um administrador. Bloqueio preserva histórico. Telefone visível só a administradores. Nunca deixar o grupo sem administrador ativo.
- **Template e campanha de vestuário**: o template guarda modelo, preço unitário, tamanhos e pares cor/foto. Abrir a campanha copia o template; cópia e template evoluem separados. Um modelo e um preço por campanha. Selecionar cor troca a foto.
- **Pedido de volta**: numa peça de campanha fechada o rider toca em “Quero de volta” e pode desfazer; todos veem quem quer. O administrador acompanha no painel e abre uma campanha nova por cópia da antiga, o que apaga os pedidos de volta atendidos. O aviso a quem pediu virá pelo sininho de notificações, ainda não construído.
- **Pedido**: várias combinações de cor, tamanho e quantidade. Titular edita ou exclui enquanto pendente e campanha aberta. Preço travado após o primeiro pedido.
- **Pagamento**: integral, marcado manualmente por administrador, com autor e data. Mudança de total devolve a Pendente; desfazer marcação exige motivo. Pedido pago e campanha com pedido pago não podem ser cancelados; fechar é permitido.
- **Passeio**: data, percurso, ponto de encontro, saída e previsão de retorno; link de mapa opcional. Respostas Vou / Não vou / Não respondeu, visíveis ao grupo. Sem limite de vagas. Depois da saída o passeio é realizado: fica em Passeios com fotos, rota, duração (saída até o retorno previsto) e quem foi.
- **Pessoas**: toda contagem de pessoas vista por riders é uma fileira de avatares com a contagem em palavras, que abre uma janela com nome, Instagram e o caminho para o perfil.
- **Perfis**: nome, apelido, foto, Instagram, WhatsApp, de uma a cinco motos com uma principal, tamanho de roupa e dados de emergência. O perfil é separado do pedido de ingresso, que fica congelado como registro da avaliação. O perfil mostra também a estrada com o grupo (passeios feitos, selo de nível, sequência, passeios recentes e fotos publicadas) e a moto principal em destaque. Um rider vê de outro só nome, apelido, foto, Instagram, região, experiência, bio, aniversário, tempo de grupo, motos e essa estrada; WhatsApp, tamanho e emergência ficam com a própria pessoa e os administradores. Dados de emergência são opcionais, apagáveis e não entram em relatório.
- **Estados manuais**: fechar, reabrir e cancelar campanhas de vestuário e confirmações são ações de administrador.
- **Relatório**: PDF administrativo com identidade do grupo, sem telefones e sem cancelados.
- **Terminologia**: quem faz parte do grupo é “rider” (decisão de 2026-11-17, no lugar de “participante”). Use “grupo”, “pessoal do Scrambler RJ”, “riders”, “vestuário”, “campanha de vestuário”, “template”, “campanhas ativas”, “passeio”. Nunca “clube”, “motoclube” ou variações.
- **Fora do escopo do MVP**: landing page pública, votação entre administradores, aviso automático da decisão ao solicitante, pagamento integrado ou parcial, estoque, limite de vagas, encerramento agendado, login por SMS/WhatsApp, envio automático de mensagens, logística de entrega, exportação CSV ou imagem.
- **Em aberto**: hospedagem, armazenamento e redimensionamento de fotos, orçamento e responsável pela manutenção; contribuição para eventos por campanha (`issues/04-contribuicao-eventos.md`); credenciais do Google e e-mails reais dos administradores; fonte do PDF (hoje Helvetica); validação de aceite com pessoas do grupo.

## Brand Commitments

- Nome: Scrambler RJ. É um grupo, não um motoclube; nenhum texto, sigla, imagem ou elemento visual pode apresentá-lo como motoclube.
- Voz: direta, entre amigos. Português informal, frases curtas, sem clichê de motociclismo.
- Identidade: logo original e paleta preta, laranja e creme. A abertura em que o logo se monta foi aprovada.
- Landing page descartada em 2026-11-17: não há página de apresentação antes da entrada.
- Área logada e administrativa: o visual anterior foi rejeitado e substituído. A referência vigente é o `DESIGN.md`, que descreve o que está construído.
- Cor com papel definido, a pedido do usuário em 2026-11-17: laranja cheio para uma ação por contexto, selos com palavra para toda situação, creme apagado só para apoio.
- Privacidade é compromisso: todo bloco com dado privado diz quem vê antes de pedir ou mostrar o dado.
- Protótipo antigo descartado: não é referência visual nem de linguagem.

## Evidence on Hand

- `docs/specs/mvp-scrambler-rj.md`: especificação, histórias de usuário e critérios de aceite do MVP.
- `docs/specs/perfis-dos-participantes.md`: especificação dos perfis.
- `docs/specs/passeios-roteiro-e-mapa.md`: roteiro, ficha, mapa e galeria dos passeios.
- `docs/specs/vestuario-passeios-e-perfil.md`: telas Vestuário e Passeios, pedido de volta, pessoas por avatar e perfil renovado.
- `docs/specs/notificacoes.md`: sininho de avisos dentro da plataforma (decidido em 2026-11-23, ainda não construído).
- `docs/tickets/mvp-scrambler-rj/` e `docs/tickets/perfis/`: fatias implementadas, com critérios e verificação.
- `map.md` e `issues/`: decisões aprovadas e pendências.
- `DESIGN.md` e `.impeccable/`: sistema visual vigente e os desenhos de tela confirmados.
- Logo original: `assets/logo-scrambler-rj.webp` (1254×1254, WebP com transparência real). Emblema circular creme, preto e laranja com piloto, Pão de Açúcar e Cristo. Versão vetorial (SVG) não fornecida.
- Logo separado em seis camadas para a abertura em `assets/logo-layers/` (derivadas do logo original).
- Seis fotos originais de um passeio do grupo em `assets/photos/` (2000px no lado maior): `01-dois-riders-mirante`, `02-scrambler-amarela-retrato` (vertical), `03-scrambler-1200-xe-mirante`, `04-scrambler-amarela-neblina`, `05-rider-mochila`, `06-grupo-mirante`. Não reconstruir nem gerar substitutos.
- O código do MVP e dos perfis está implementado, com testes automatizados dos serviços contra um PostgreSQL local. As seis fotos de `assets/photos/` aparecem nos dados de teste locais como fotos de peça, de passeio e de perfil.
- Falta a validação de aceite com pessoas do grupo, no celular e no desktop.
- Não há depoimentos nem números do grupo; não fabricar.

## Product Principles

1. O WhatsApp divulga; a plataforma registra. Não competir com a conversa do grupo.
2. Celular primeiro, para quem chega de um link e quer resolver em poucos toques.
3. Um registro único e visível: riders veem pedidos, pagamentos e presenças do grupo.
4. Controle manual e explícito dos administradores, com histórico preservado.
5. É um grupo de pessoas, não uma instituição: linguagem e tom de quem combina um passeio entre amigos.
