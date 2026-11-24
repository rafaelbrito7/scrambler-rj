# Scrambler RJ

## Identidade e linguagem

- Scrambler RJ é um grupo de pessoas que têm Triumph Scrambler de todas as cilindradas no Rio de Janeiro. Não é um motoclube.
- Quem faz parte do grupo é **rider** (plural **riders**), decisão do usuário em 2026-11-17. Use “grupo” para o Scrambler RJ e “riders” para as pessoas; não use mais “participante” nem “pessoal do grupo” em texto de interface, documentação ou comunicação. A tela que lista quem faz parte se chama “Riders”. Em português a palavra fica sem itálico e sem tradução: “o rider”, “os riders”, “rider aprovado”.
- A encomenda de peças é **vestuário**: cada uma é uma “campanha de vestuário” (curto: “campanha”, feminino: aberta, fechada, cancelada), e o modelo reaproveitável é **template**; decisão do usuário em 2026-11-17. Não use mais “lote” nem “receita” em interface, PDF, resumo de divulgação ou documentação. A seção, a aba do painel e os endereços se chamam “Vestuário” (`/vestuario/[id]`, `/painel/vestuario`, `/painel/templates`). No código os nomes seguem `Batch` e `Recipe`.
- Identificadores no código continuam em inglês como estão (`PARTICIPANT`, `participant`, `member`); a troca é de linguagem, não de nomes internos. O e-mail da conta de teste (`participante@teste.local`) e os nomes de arquivo dos documentos antigos também não mudam.
- Evite “clube”, “motoclube”, “moto clube”, “motorcycle club”, siglas ou linguagem e elementos visuais que apresentem o grupo como motoclube.
- As telas `/vestuario` e `/passeios` mostram tudo o que o grupo já teve; regras em `docs/specs/vestuario-passeios-e-perfil.md`. Uma peça fechada pode ser pedida de volta ("Quero de volta"); a campanha nova nasce como cópia e apaga os pedidos de volta atendidos. Passeio cujo horário de saída passou sai do Início e não aceita resposta, mesmo com as confirmações abertas. `PeopleStack` usa `naming="record"` no painel.
- Os passeios do grupo não têm líder, ferrolho nem outro papel: todo mundo anda junto (decisão do usuário em 2026-11-17, depois de a ideia ter sido implementada e desfeita). Não proponha nem desenhe papéis ou hierarquia nos passeios.
- Aplique essa regra a textos de interface, nomes de produtos, documentação, imagens geradas e comunicação. Termos presentes em protótipos antigos não são referência aprovada.

## Direção visual

- Não há landing page. A raiz do endereço mostra a abertura em que o logo se monta e segue direto para a tela de entrada. A landing preta e laranja com fotografias foi descartada pelo usuário em 2026-11-17; não a recrie nem a trate como referência aprovada.
- Preserve o logo e a paleta preta, laranja e creme. Títulos e rótulos em Archivo condensada; texto corrido em Figtree, nunca em Archivo.
- A abertura do logo foi aprovada pelo usuário; preserve a ordem (moto, piloto, cenário, anel, letras, RJ, nome).
- A referência visual vigente é o `DESIGN.md`, que descreve o que está construído. O visual antigo da área logada e administrativa foi rejeitado; não o trate como padrão. As regras funcionais estão em `docs/specs/mvp-scrambler-rj.md` e `docs/specs/perfis-dos-participantes.md`.
- Papéis de cor: laranja cheio em uma única ação por contexto; ação secundária em creme com sublinhado laranja; como texto, só o laranja quente (`text-highlight`); coral para erro, problema e confirmação de ação sem volta. Detalhes em "Papéis de cor nas telas" no `DESIGN.md`.
- Toda situação aparece como selo com palavra (`Badge`, ou os selos de `src/components/app/status-badge.tsx`). A cor nunca é o único sinal.
- Nada fica acima do título da página além do link de voltar e do selo de situação.

## Componentes de interface

- Biblioteca: shadcn/ui com primitivos Base UI (`components.json`, estilo `lyra`). Antes de criar um componente básico, procure no registro (`pnpm dlx shadcn@latest search`) e adicione com `pnpm dlx shadcn@latest add <nome>`.
- Todo componente adicionado vem com o visual de fábrica: restilize as variantes (`cva`) para o DESIGN.md antes de usar. Controles têm 48px de altura, raio 2px, sem sombra, rótulos com a utilidade `label`.
- Use os papéis semânticos (`bg-primary`, `text-muted-foreground`, `border-input`) mapeados em `src/app/globals.css`; a interface tem um único esquema escuro, sem variantes `dark:`.
- Em links com aparência de botão use `buttonVariants()`; em formulários use `FieldGroup`, `Field`, `FieldLabel`, `Input`, `Textarea`, `NativeSelect` (lista suspensa nativa, para escolha entre muitas opções repetida várias vezes na tela), `Checkbox` (um sim ou não isolado, dentro de um `label` de 48px), `FieldError`; em conjuntos de opções use `ToggleGroup`.
- Componentes próprios do projeto ficam em `src/components/app`: `BackLink` para o link de voltar no topo de páginas de detalhe e formulário, `ProfileFacts` para bio, região, experiência e tempo de grupo no perfil, `BikePhoto` para a foto da moto (quadro 4:3, com estado vazio), `BikeMods` para as modificações de uma moto agrupadas por categoria, `TipIcon` para o ícone de uma recomendação de passeio (os nomes ficam em `TIP_ICONS`), `BikeModelField` para escolher o modelo da moto na lista de `src/server/bike-models.ts` (no pedido de ingresso e no perfil), `Avatar` para o rosto de uma pessoa, `ConfirmAction` para ação sem volta (confirmação no lugar, sem janela), `PeopleStack` para toda contagem de pessoas vista por riders (avatares sobrepostos, "+n" e janela com nome, Instagram e "Ver perfil"; decisão do usuário em 2026-11-23), `InstagramLink` para o @ do Instagram, `RideCard` e `DoneRideCard` para passeio futuro e realizado, `BatchCard` para campanha aberta, `ProfileHeader`, `RideHistory` e `BikeShowcase` para as partes do perfil, `CopySummary`, `GarmentForm`, `RideAnswer`. Reuse antes de criar outro.
- Código que roda no navegador não pode importar valores de módulos de `src/server` que tocam banco ou disco. Listas e funções puras usadas dos dois lados ficam em módulos sem dependências, como `src/server/sizes.ts` e `src/server/display-name.ts`.

## Mapa

- O mapa usa MapLibre com a Stadia Maps. Os termos da Stadia proíbem guardar no servidor o resultado da rota, e guardar coordenadas da busca de lugares exige plano pago: a rota é pedida pelo navegador a cada visita (`RideMap`) e as paradas são marcadas pelo administrador tocando no mapa (`PinPicker`). Não grave no banco nada que venha da API de rota ou de busca da Stadia. O traçado de um arquivo GPX enviado pelo administrador é dado do grupo e fica guardado no passeio (`Ride.track`); com ele, o mapa não pede rota ao provedor.
- Nenhuma chave vai para o navegador; a autorização é por domínio (em `localhost` funciona sem cadastro). O worker da biblioteca é copiado para `public/maplibre` pelo `postinstall`.

## Entrada

- Todo mundo entra pela raiz, com a mesma tela e o mesmo botão (decisão do usuário em 2026-11-23). Não existe entrada separada de administrador; `/painel/entrar` foi removido e não deve voltar. O que o administrador vê a mais (o item "Painel" no menu, "Gerenciar passeio", a ficha completa) vem da conta, e o servidor confere a permissão em cada página e ação.
- O atalho de teste só existe fora de produção, com `ENABLE_TEST_LOGIN="true"` e sem Google configurado: na raiz, "Entrar com Google" entra como o rider de teste e um segundo botão, "Entrar como administrador de teste", entra como o administrador de teste. Não o habilite em produção nem o substitua por algo que funcione lá.

## Perfis e privacidade

- Um rider vê de outro só nome, apelido, foto, Instagram, região, experiência, bio, aniversário (dia e mês), tempo de grupo e motos. WhatsApp, tamanho de roupa e dados de emergência são vistos apenas pela própria pessoa e por administradores.
- A regra vale no servidor: use as leituras do serviço de perfis (`getOwnProfile`, `getMemberProfile`, `getMemberRecord`), que devolvem formas diferentes para cada leitor. Não busque o perfil inteiro para esconder campos na tela.
- Dados de emergência incluem dados de saúde (tipo sanguíneo, plano de saúde, alergias e condições) e dois contatos. São opcionais, apagáveis pela pessoa e não entram em PDF, resumo de divulgação nem lista do grupo.
- Nas telas do grupo o nome exibido é o apelido quando existe (`groupName`); no painel e no PDF é o nome com o apelido entre parênteses (`recordName`).
- Todo bloco com dado privado diz no título quem vê, antes de mostrar ou pedir o dado.

## Banco e servidor de desenvolvimento

- `prisma migrate dev` falha no Postgres embutido do Prisma. Gere a migração com `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` e aplique com `prisma migrate deploy` nos dois bancos (`DATABASE_URL` e `DATABASE_URL_TEST`).
- Depois de uma migração, reinicie o servidor de desenvolvimento: ele mantém o cliente do banco antigo em memória.
- Nomeie a pasta de cada migração nova com um carimbo maior que o da última existente (confira com `ls prisma/migrations`): as anteriores usam horários arredondados à frente do relógio, e um nome menor quebraria um banco criado do zero.
- Pare o servidor de desenvolvimento antes de gerar uma migração: com ele ligado, o `migrate diff` pode falhar no meio e deixar um arquivo vazio, que o `migrate deploy` registra como aplicado. Confira que o SQL gerado não está vazio antes de aplicar.
- O Postgres local do `prisma dev` aceita uma conexão por vez: com o servidor de desenvolvimento ligado, `prisma migrate status` e afins podem responder P1001 sem que o banco esteja fora do ar. Tente de novo.
- Use Node 22.21.1 (`.nvmrc`).
