# Scrambler RJ — sininho de notificações

Complementa `docs/specs/vestuario-passeios-e-perfil.md` (pedido de volta) e `docs/specs/mvp-scrambler-rj.md` (campanhas, pedidos, passeios, pedido de ingresso). Decisões do usuário em 2026-11-23. Nada daqui está implementado.

## Problema

O rider só descobre o que mudou se abrir a plataforma e procurar. Quem pediu a volta de uma peça não fica sabendo que ela voltou; quem confirmou presença não fica sabendo que o passeio mudou de horário; quem pagou não vê que o pedido foi marcado. O grupo avisa pelo WhatsApp, mas o aviso se perde na conversa.

## Solução

Um sininho na barra do topo, com a contagem do que é novo desde a última vez que a pessoa o abriu. Tocar abre a lista de avisos; cada aviso leva ao que anuncia. Os avisos vivem só dentro da plataforma e somem depois de trinta dias.

## Histórias de usuário

1. Como rider, quero ver no topo de qualquer tela quantos avisos novos tenho.
2. Como rider, quero abrir a lista de avisos e ir direto ao passeio, à campanha ou ao pedido de que o aviso fala.
3. Como rider, quero que a contagem zere quando abro a lista, sem marcar aviso por aviso.
4. Como rider, quero continuar vendo os avisos recentes depois de abri-los, com os novos destacados.
5. Como rider, quero ser avisado quando abrirem um passeio.
6. Como rider, quero ser avisado quando abrirem uma campanha de vestuário.
7. Como rider que pediu a volta de uma peça, quero um aviso dizendo que a peça que eu pedi voltou.
8. Como rider que confirmou presença, quero ser avisado se o passeio mudar de data, horário ou ponto de encontro.
9. Como rider que confirmou presença, quero ser avisado se o passeio for cancelado.
10. Como rider, quero ser avisado quando meu pedido for marcado como pago, tiver o pagamento desfeito ou for cancelado por um administrador.
11. Como rider, quero ser avisado quando uma foto que enviei for publicada na galeria.
12. Como administrador, quero ser avisado de um novo pedido de ingresso.
13. Como rider, não quero receber aviso do que eu mesmo fiz.
14. Como pessoa bloqueada ou ainda não aprovada, não recebo nem vejo avisos.
15. Como rider que usa leitor de tela, quero a contagem dita em palavras.

## Decisões de implementação

**Onde aparece.** Na barra do topo de toda tela da área logada, para riders aprovados. O sininho mostra a contagem em número; sem aviso novo, não há número. No celular fica fora da linha do menu que rola, sempre visível.

**A lista.** Tocar no sininho abre a lista, do mais recente ao mais antigo. Cada aviso tem uma frase, quando aconteceu e leva ao destino. Os que chegaram desde a última abertura aparecem destacados com um selo escrito ("Novo"), não só por cor. Lista vazia mostra uma frase, sem ilustração.

**Visto.** Abrir a lista zera a contagem para aquela pessoa. Não há botão por aviso nem "marcar todos". Alternativa rejeitada pelo usuário: marcar aviso por aviso.

**Prazo e alcance.** Os avisos existem só dentro da plataforma: nada de e-mail, notificação do navegador ou WhatsApp. Um aviso com mais de trinta dias some da lista. Alternativa rejeitada pelo usuário: avisar fora da plataforma, que exige infraestrutura e permissão que hoje não existem.

**Eventos e quem recebe.**

| Evento | Quem recebe | Leva a |
| --- | --- | --- |
| Passeio publicado | riders aprovados | página do passeio |
| Campanha de vestuário aberta | riders aprovados | página da campanha |
| Campanha aberta como volta de uma peça | quem pediu a volta recebe "A peça que você pediu voltou"; os demais, o aviso comum de campanha aberta | página da campanha |
| Passeio com data, horário de encontro ou de saída, ou ponto de encontro alterado | quem respondeu "Vou" | página do passeio |
| Passeio cancelado | quem respondeu "Vou" | página do passeio |
| Pedido marcado como pago, pagamento desfeito ou pedido cancelado por administrador | o dono do pedido | página da campanha |
| Foto publicada na galeria | quem enviou a foto | galeria do passeio |
| Pedido de ingresso enviado | administradores | avaliações de perfil |

**Quem não recebe.** Ninguém recebe aviso da própria ação: o administrador que publica o passeio não é avisado dele. Na volta de uma peça ninguém recebe dois avisos. Quem não está aprovado na hora do evento não recebe, e quem é bloqueado depois deixa de ver os que tinha.

**O que o aviso diz.** O nome do passeio ou da peça e o que aconteceu, sem dado privado de ninguém: não cita valor de pedido de outra pessoa, telefone, nem quem marcou o pagamento. O aviso de pedido de ingresso diz só que há um pedido novo; o nome fica na tela de avaliações.

**Pedido de ingresso.** A contagem de pendentes ao lado de "Painel" continua. O aviso no sininho soma a ela: a contagem diz quantos esperam, o aviso diz que chegou um novo.

**Passeio alterado.** Só mudança de data, horário de encontro, horário de saída ou ponto de encontro avisa. Trocar descrição, foto, ficha ou recomendações não avisa. Várias mudanças na mesma edição geram um aviso só.

**Modelo.** Um aviso é gravado por destinatário, na mesma transação do evento que o causa, com o tipo, a referência do destino e a data. A frase é montada na leitura, a partir do tipo e do nome atual do passeio ou da peça. Por pessoa guarda-se a data em que abriu a lista pela última vez; "novo" é o aviso posterior a ela. Alternativa rejeitada: calcular os avisos a cada leitura a partir das tabelas existentes, que não distingue o que mudou do que já era assim.

**Quem vê e quem faz.** Cada pessoa vê só os próprios avisos. Ninguém cria aviso à mão: eles nascem dos eventos.

## Decisões de teste

Pelos serviços, contra o PostgreSQL de teste, com a data atual injetada.

- **Cada evento**: gera aviso para quem a tabela diz, e só para eles; quem causou não recebe.
- **Volta de peça**: quem pediu recebe o aviso próprio e não o comum; os demais recebem o comum.
- **Passeio alterado**: muda data, horário ou encontro e avisa quem vai; muda descrição e não avisa; uma edição, um aviso.
- **Visto**: contagem antes e depois de abrir a lista; aviso que chega depois volta a contar.
- **Prazo**: aviso de trinta e um dias não aparece.
- **Acesso**: quem não está aprovado não recebe; bloqueado depois deixa de ver; um rider não lê os avisos de outro.
- **Tela**: no celular e no desktop, com duas contas, pedir a volta com uma, abrir a campanha com a outra e ver o aviso chegar e a contagem zerar.

## Fora do escopo

Avisos fora da plataforma (e-mail, notificação do navegador, WhatsApp). Escolher quais avisos receber. Apagar um aviso. Aviso de aniversário, de campanha fechando ou de resposta de outra pessoa a um passeio. Lembrete de passeio na véspera.

## Notas

**Suposições a confirmar.** O que conta como "passeio alterado" (só data, horários e ponto de encontro). O sininho de pedido de ingresso convive com a contagem ao lado de "Painel". Ninguém é avisado da própria ação. Quem não respondeu a um passeio não é avisado de mudança nem de cancelamento. Reabrir uma campanha ou as confirmações de um passeio não avisa.

**Tickets.** `docs/tickets/vestuario-passeios-e-perfil/`, 10 a 12.
