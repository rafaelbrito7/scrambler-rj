# Consulta de veículo por placa

Type: research
Status: resolved
Parent: [Mapa — evolução de perfil, motos e passeios](../map.md)
Blocked by: none

## Question

Existe serviço confiável e legal no Brasil para, a partir da placa, obter marca, modelo, ano, cor e cilindrada de uma moto? Levantar opções (oficiais e comerciais), preço por consulta, o que cada uma devolve, termos de uso e implicações de LGPD para um grupo pequeno (dezenas de consultas no total).

## Answer

Achados completos em [docs/research/consulta-de-veiculo-por-placa.md](../../../research/consulta-de-veiculo-por-placa.md). A escolha é do ticket "Placa e preenchimento pela consulta".

- Via oficial (Serpro/Senatran) fora de alcance: exige empresa credenciada, caso de uso aprovado, gestor de consentimento e certificado digital. SINESP Cidadão não tem API.
- Caminho A, sem consulta: lista fixa de modelos e anos, cor escolhida pelo rider. Custo zero, nenhum dado sai do app.
- Caminho B, API comercial pré-paga com a placa usada e descartada: R$ 0,03 a R$ 0,07 por consulta, sem mensalidade. São revendedoras: não dizem a origem do dado nem garantem precisão.
- Caminho C, Infosimples sobre a consulta do Detran-RJ: traz cor e cilindrada, mas tem mínimo de R$ 100/mês, só veículos do RJ e devolve o nome do proprietário, que teria de ser descartado.
- LGPD: placa ligada a um rider é dado pessoal. Consentimento de quem digita a própria placa é a base mais simples; o aviso precisa dizer que a placa vai a um terceiro que guarda registro. Não guardar a placa é o menor risco.
- Não verificado: se a cilindrada vem preenchida para motos, recarga mínima, cadastro com CPF ou CNPJ nas APIs comerciais.
