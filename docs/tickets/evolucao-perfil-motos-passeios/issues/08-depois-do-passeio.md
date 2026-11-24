# Depois do passeio: galeria, rota como template e agenda

Type: grilling
Status: resolved
Parent: [Mapa — evolução de perfil, motos e passeios](../map.md)
Blocked by: 04

## Question

Quem envia fotos para a galeria de um passeio e quem modera? Como uma rota vira template reutilizável e o que é copiado? O que vai no arquivo de agenda (.ics) e de onde a pessoa o baixa?

## Answer

Decidido com o usuário em 2026-11-17.

- **Galeria — quem envia**: riders com presença válida naquele passeio e administradores. Abre depois da data de saída.
- **Galeria — moderação**: toda foto espera a aprovação de um administrador para aparecer. Quem enviou vê as suas pendentes e pode apagá-las; administrador aprova, recusa ou apaga qualquer uma.
- **Limites**: 10 fotos por rider e 150 por passeio, reduzidas no envio para lado maior de 2000px. Armazenamento em Cloudflare R2, bucket privado, entrega só a riders aprovados.
- **Rota como template**: na página de um passeio o administrador salva a rota como template. Copia paradas sem horários, ficha, traçado e descrição. Publicar a partir do template cria cópia independente, como no vestuário. Sem tela para criar template do zero.
- **Agenda** (proposta minha, o usuário aprovou a ideia mas não os detalhes): botão "Adicionar à agenda" na página do passeio baixa um arquivo .ics com percurso, horário de encontro, previsão de retorno, local do encontro e o link do passeio. É um arquivo avulso: se o passeio mudar, a agenda da pessoa não muda sozinha.
- A confirmar na spec: se as fotos recusadas são apagadas na hora; se fotos pendentes contam no limite (proposta: contam); onde o administrador vê a fila de aprovação (proposta: na página do passeio no painel, com contador na aba Passeios); lista e edição dos templates de rota (proposta: lista simples no painel, com renomear e apagar).
