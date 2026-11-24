# Dados novos do perfil e quem vê cada um

Type: grilling
Status: resolved
Parent: [Mapa — evolução de perfil, motos e passeios](../map.md)
Blocked by: none

## Question

Para cada dado novo (bairro ou região, "no grupo desde", contagem de passeios, experiência de pilotagem, aniversário, bio, plano de saúde, alergias, segundo contato de emergência, tamanhos de luva, capacete e calça): entra como? Obrigatório ou opcional, formato (lista ou texto), e quem vê: outros riders, só a pessoa e administradores, ou só administradores? O que entra no pedido de ingresso e o que fica para depois?

## Answer

Decidido com o usuário em 2026-11-17. Tudo novo é opcional e preenchido no perfil; o pedido de ingresso não muda.

| Dado | Forma | Quem vê |
|---|---|---|
| Região | Lista: Zona Sul, Zona Norte, Zona Oeste, Centro, Niterói e região, Baixada, outra cidade. Sem bairro. | Riders |
| Experiência | Três níveis: Começando, Estrada, Estrada e terra | Riders |
| Aniversário | Dia e mês, sem ano. A tela Riders mostra os aniversariantes do mês no topo. | Riders |
| Bio | Uma linha de texto livre | Riders |
| No grupo desde | Automático: data de aprovação. Ninguém edita. | Riders |
| Contagem de passeios | Automática; a regra de contagem é do ticket "Lista de riders, filtros e histórico" | Riders |
| Segundo contato de emergência | Nome e telefone | A pessoa e administradores |
| Plano de saúde | Nome do plano e número da carteirinha | A pessoa e administradores |
| Alergias e condições | Texto livre | A pessoa e administradores |

- Os três dados de saúde e emergência entram no bloco de emergência existente: opcionais, apagáveis pela pessoa, fora de PDF, resumo e lista do grupo.
- Tamanhos extras (luva, capacete, calça): não entram agora; voltam quando uma campanha de vestuário precisar.
- O lembrete de completar o perfil passa a considerar os dados novos (quais contam fica para a spec).
- Suposições minhas, a confirmar na spec: limite de 140 caracteres na bio; quem já era do grupo antes da plataforma aparece com a data de aprovação, sem correção.
