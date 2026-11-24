# Perfis (Meu perfil, Riders, ficha do rider)

Mode: Operate

Brief confirmado pelo usuário em 2026-11-17. Regras em `docs/specs/perfis-dos-participantes.md`.

- Menu do rider: Início · Riders · Perfil · Sair. No painel, cada nome em Riders abre a ficha.
- Meu perfil: cabeçalho com foto, nome, apelido e Instagram; botão "Editar perfil"; bloco Motos; bloco "Só você e os administradores veem" com WhatsApp, tamanho e emergência.
- Editar perfil: um formulário, três blocos, um "Salvar". O cabeçalho de cada bloco diz quem vê aqueles dados, antes dos campos: "Todo o grupo" (foto, nome, apelido, Instagram), "Só administradores" (WhatsApp, tamanho), "Em caso de emergência" (contato, telefone, tipo sanguíneo, com "Apagar dados de emergência").
- Motos ficam fora do formulário: adicionar, editar, tornar principal e remover salvam na hora. A última moto não mostra "Remover". Remover pede confirmação.
- Riders: lista em ordem alfabética, linha inteira clicável (56px), foto, nome ou apelido, moto principal, selo de administrador.
- Perfil de outra pessoa: foto grande, apelido como título, nome e Instagram abaixo, motos. Para administrador, um bloco extra "Só administradores" com WhatsApp e emergência, com toque para ligar.
- Foto: prévia ao escolher; sem foto, a do Google; sem ela, iniciais num círculo creme.
- Instagram em laranja como link; telefones como links de ligação só para administradores.
- Lembrete no Início: uma linha com "Completar perfil" e "Agora não"; nunca bloqueia.
- Estados: perfil recém-criado com blocos vazios que convidam, sem tom de erro; grupo de uma pessoa; apelido longo quebra em duas linhas; bloqueado é "não encontrado" para rider e ficha com selo para administrador.
- Fora: busca, filtros, grade de fotos, capa, biografia, contagem de passeios.
