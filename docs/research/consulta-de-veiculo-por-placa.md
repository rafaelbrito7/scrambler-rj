# Consulta de veículo por placa

Pesquisa para o ticket [09 — Consulta de veículo por placa](../tickets/evolucao-perfil-motos-passeios/issues/09-consulta-de-veiculo-por-placa.md).
Consulta às páginas oficiais em 2026-11-17. Este documento compara e aponta caminhos viáveis; a decisão final não está aqui. Nenhuma conta foi criada e nenhuma placa real foi enviada a serviço algum.

Uso considerado: algumas dezenas de consultas no total (cada rider cadastrando a própria moto), depois um punhado por ano. Campos desejados: marca, modelo, ano, cor e cilindrada.

## Resumo

- **Existe serviço, mas não existe caminho oficial acessível a um grupo informal.** A API oficial (Consulta Online Senatran, vendida pelo Serpro) exige empresa credenciada pela Senatran, caso de uso aprovado e contratação de uma gestora de consentimento. Está fora de alcance.
- **As APIs comerciais são baratas e sem mensalidade** (R$ 0,03 a R$ 0,07 por consulta), mas são revendedoras: declaram que os dados vêm "de terceiros", sem dizer de onde, e sem garantia de exatidão. É legal contratar; a origem do dado não é auditável.
- **Cilindrada é o campo incerto.** Só a API Placas mostra um campo `cilindradas` no exemplo de resposta (com valor fictício), e a Infosimples lista `cilindrada` na consulta do Detran-RJ. A Consulta de Placa não lista cilindrada. Nenhuma foi testada com moto.
- **SINESP Cidadão não tem API**; as bibliotecas que o raspavam estão abandonadas ou já usam outra fonte.
- **LGPD:** a placa, ligada a um rider identificado, deve ser tratada como dado pessoal (art. 5º, I). Não foi encontrada manifestação da ANPD específica sobre placa. O rider digitando a própria placa, com aviso claro e consentimento, é o cenário mais simples; o ponto de atenção é o envio da placa a um terceiro.
- **Sem consulta:** a tabela FIPE tem API gratuita com marcas, modelos e anos de motos. Não dá cor, e a cilindrada só aparece dentro do nome do modelo.

## Tabela comparativa

| Opção | Quem pode contratar | Preço | Mínimo | Entrada | Cor | Cilindrada | Origem declarada | Custo estimado (50 consultas) |
|---|---|---|---|---|---|---|---|---|
| Consulta Online Senatran (Serpro) | Empresa credenciada no sistema Credencia, com caso de uso aprovado pela Senatran e GCC contratada | Faixa 1 (até 50.000/mês): Básica R$ 0,91; Indicadores R$ 1,10; Detalhada R$ 1,62; com imagem R$ 2,74 | Não informado na página | Não verificado | Não verificado | Não verificado | Bases da Senatran, tempo real | Inviável (requisitos) |
| API Placas (apiplacas.com.br, AETHERIA LTDA) | Qualquer conta cadastrada; página não exige CNPJ | "Consulta veicular simples" R$ 0,03; "completa" (com motor, chassi, Renavam) R$ 0,20 | Sem mensalidade; saldo não expira; recarga mínima não visível sem login | Placa | Sim (`cor`) | Campo `cilindradas` aparece no exemplo de resposta, com valor fictício | "Fontes próprias e de terceiros" | ~R$ 1,50 (mais a recarga mínima, não verificada) |
| Consulta de Placa (consultadeplaca.net, CONSULTA DE PLACA LTDA) | Conta gratuita; página não menciona CPF/CNPJ | 20 primeiras grátis; R$ 0,07 por consulta (R$ 0,05 se a mesma placa em 30 dias) | "Sem valor mínimo", sem assinatura | Placa | Sim | Não listada na consulta básica | "Bases de terceiros", entregues "como recebidos" | ~R$ 2,10 |
| Infosimples — DETRAN/RJ/Veículo | Não informado (emite NFS-e; perfil empresarial) | Preço base R$ 0,20–0,22 por consulta na primeira faixa, mais adicional por API não visível | Franquia mínima de R$ 100,00/mês sempre que houver saldo; R$ 100,00 de crédito de avaliação por 30 dias | Placa | Sim (`cor`) | Sim (`cilindrada`) | Consulta pública do Detran-RJ (automação do site) | ~R$ 11 de consumo, mas R$ 100/mês de franquia enquanto houver saldo |
| Infosimples — SENATRAN/Veículo e Sinesp Cidadão/Veículo | — | — | — | — | — | — | — | Descontinuadas |
| Raspadores do SINESP (bibliotecas abertas) | — | Grátis | — | Placa | — | — | App SINESP por engenharia reversa | Não recomendado |
| FIPE (fipe.api.br / parallelum) — sem placa | Qualquer um | Grátis: 500 requisições/dia sem token, 1.000 com token gratuito | — | Marca → modelo → ano | Não | Só dentro do nome do modelo | Tabela FIPE | R$ 0 |

## 1. Fontes oficiais

### Consulta Online Senatran (Serpro)

- É o produto oficial: "Informações de veículos, condutores e infrações [...] direto das bases da Senatran, em tempo real". Fonte: https://loja.serpro.gov.br/product/consultasenatran
- A página diz que o serviço segue a Portaria Senatran nº 139/2025 e que o acesso é "condicionado à definição e aprovação prévia dos casos de uso e dos grupos de dados". Público: "Instituições públicas e privadas".
- Etapas de contratação descritas na página: (1) a empresa solicita credenciamento no sistema Credencia e a Senatran analisa e autoriza; (2) a empresa contrata o serviço na Loja Serpro e contrata uma GCC (Gestora de Consentimento e Ciência) da lista credenciada pela Senatran; (3) a GCC vincula o usuário, a Senatran publica o Termo de Autorização de Acesso a Dados e a empresa habilita certificado digital para acesso.
- Preços (aba "Preço", "definidos pela Portaria Senatran nº 417/2026"), por consulta, faixa 1 (até 50.000 transações): Básica R$ 0,91; com Indicadores R$ 1,10; Detalhada R$ 1,62; com imagem R$ 2,74. A faixa 10 (acima de 3 milhões) cai para R$ 0,25 / 0,51 / 0,70 / 0,72.
- A Portaria nº 139/2025 "disciplina o acesso aos dados dos sistemas e subsistemas informatizados" da Senatran e condiciona o acesso a autorização formal. Texto: https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2025/Portaria1392025.pdf (não lido na íntegra; ver "Não verificado").
- Conclusão factual: todo o fluxo fala em "empresa" e certificado digital. Um grupo sem CNPJ não entra; mesmo com CNPJ, o processo (credenciamento, caso de uso, GCC) é desproporcional para dezenas de consultas.

### e-Frotas, Datavalid, WSDenatran

- e-Frotas (Serpro) é para pessoas jurídicas gerirem a própria frota; as consultas só devolvem veículos vinculados ao CNPJ contratante. Fonte: https://centraldeajuda.serpro.gov.br/efrotas/manuais/roteiro-hom-efrotas.pdf (via resultado de busca; manual não lido na íntegra).
- Datavalid é validação de identidade (pessoa), contratada com e-CNPJ; não é consulta de veículo por placa. Fonte: https://www.gov.br/pt-br/servicos/obter-solucao-digital-para-validacao-de-identidade-datavalid
- "WSDenatran" não aparece como produto atual na Loja Serpro; o produto vigente é o Consulta Online Senatran acima.

### Detran-RJ

- O Detran-RJ tem uma consulta pública de cadastro em que a página pede apenas "Nº da Placa". Fonte: https://apps-portal.detran.rj.gov.br/veiculos/consultaCadastro
- Não foi encontrada API pública nem termos que autorizem acesso automatizado. A página não foi usada (nenhuma placa enviada), então os campos exibidos e a existência de captcha não foram confirmados diretamente. A Infosimples, que automatiza essa página, lista: `ano_fabricacao`, `ano_modelo`, `marca`, `cor`, `cilindrada`, `combustivel`, `potencia`, `categoria`, `especie`, `chassi`, `nome`, entre outros. Fonte: https://infosimples.com/consultas/detran-rj-veiculo/
- Só cobre veículos registrados no RJ.

### SINESP Cidadão

- A página do serviço no gov.br (atualizada em 15/12/2025) descreve a consulta no aplicativo Sinesp Cidadão: digita-se a placa e o app mostra marca e modelo, ano, cor, final do chassi e restrição de roubo/furto. Não há cilindrada. Fonte: https://www.gov.br/pt-br/servicos/consultar-veiculo
- É um aplicativo para o cidadão, sem API pública.
- A Infosimples informa que sua consulta ao Sinesp "não está mais disponível desde que o aplicativo foi descontinuado". Fonte: https://infosimples.com/consultas/sinesp-veiculo/ — isso contradiz a página do gov.br; a situação atual do app não foi confirmada.

## 2. APIs comerciais

### API Placas (apiplacas.com.br)

- Operada por AETHERIA LTDA, CNPJ 67.877.417/0001-08. Termos atualizados em 05/04/2025. Fonte: https://apiplacas.com.br/termos
- Preços por consulta: simples R$ 0,03 ("marca, modelo, ano, cor, combustível e município"); completa R$ 0,20 (acrescenta motor, chassi e Renavam); Renavam, chassi ou motor avulsos R$ 0,12; FIPE R$ 0,05. "Sem mensalidade e sem fidelidade"; saldo "nunca expira"; erro não cobra. Pagamento via PIX. Fonte: https://apiplacas.com.br/valores
- Exemplo de resposta de `/basico/{placa}` na documentação inclui `marca`, `modelo`, `cor`, `ano`, `anoModelo`, `municipio`, `uf`, `tipo`, `combustivel`, `final_chassi`, `motor`, `potencia` e **`cilindradas`** (no exemplo o valor é o texto "exemplo"). A documentação avisa que "os campos de dados variam por produto e veículo" e pede para considerar campos ausentes. Fonte: https://apiplacas.com.br/documentacao
- Chamada com token Bearer em `https://wdapi2.com.br/v3`; o token "não deve ser [...] exposto em código de navegador", ou seja, a chamada sai do servidor.
- Origem: "compilados a partir de fontes próprias e de terceiros"; "não representa órgão público"; dados "como estão", sem garantia de exatidão. Os termos pedem "cache local para evitar consultas desnecessárias" e proíbem revenda ou redistribuição em larga escala.
- Não verificado: valor mínimo de recarga (a página de recarga pede login) e exigência de CPF/CNPJ no cadastro.

### Consulta de Placa (consultadeplaca.net)

- Operada por CONSULTA DE PLACA LTDA, CNPJ 69.973.146/0001-10 (Fortaleza/CE). Fonte: https://consultadeplaca.net/desenvolvedores
- Preço: 20 primeiras consultas básicas grátis por conta; depois R$ 0,07 (R$ 0,05 se a mesma placa em 30 dias). Pré-pago por PIX ou cartão, "sem valor mínimo", sem assinatura. Placa não encontrada também é cobrada; indisponibilidade não.
- Consulta básica devolve: marca, modelo e versão, ano de fabricação e ano-modelo, cor, combustível, tipo (carro, moto etc.), município e UF, indicador de roubo/furto, código e valor FIPE. Não devolve proprietário, chassi, Renavam nem motor. **Cilindrada não está na lista.**
- Termos (vigência 06/11/2026): uso comercial permitido; as consultas só podem ser usadas "para a finalidade que declarou" no painel; quem consome vira controlador independente dos dados recebidos, com base legal própria; dados vêm de "bases de terceiros", "entregues como recebidos". O provedor guarda logs (data, IP, resultado, placa mascarada) por 90 dias e o resultado por 30 dias. Fonte: https://consultadeplaca.net/desenvolvedores/termos
- Requisições vindas de provedores de nuvem precisam ter o IP na lista de permissões da chave — relevante se o app roda em hospedagem sem IP fixo.

### Infosimples

- Automatiza consultas a sites de órgãos. A de DETRAN/RJ/Veículo recebe só a placa e devolve cor e cilindrada (lista acima). A empresa declara não ter vínculo com o órgão de origem. Fonte: https://infosimples.com/consultas/detran-rj-veiculo/
- Cobrança: pré-pago, preço base por faixa de volume (primeira faixa, 1 a 500 consultas: R$ 0,22 no exemplo da página; um resultado de busca mostra R$ 0,20 — a tabela não carregou), mais preço adicional em algumas APIs. **Franquia mínima de R$ 100,00/mês**: "Se houver saldo, a franquia é aplicada mesmo sem consumo no mês"; conta sem uso e sem saldo não paga. Crédito de avaliação de R$ 100,00, válido por 30 dias. Fonte: https://infosimples.com/consultas/precos/
- As consultas SENATRAN/Veículo e Sinesp Cidadão/Veículo estão descontinuadas. Fontes: https://infosimples.com/consultas/senatran-veiculo/ e https://infosimples.com/consultas/sinesp-veiculo/

### Outras vistas de passagem

- Direct Data (directd.com.br): tem consulta veicular, pré-pago com recargas de R$ 50 a R$ 5.000; preço por consulta e campos não estão na página pública. Fonte: https://directd.com.br/precos
- Placa Fipe (placafipe.com): a página `/api` devolveu 404; não foi encontrada oferta pública de API.
- Um ator no Apify cobra US$ 1,20 por consulta bem-sucedida, bem acima das demais. Fonte: https://apify.com/brasildados/consulta-veiculo-por-placa.md

## 3. Raspadores não oficiais do SINESP

- `sinesp-client` (Python): o README explica que o site exige captcha a cada consulta, que o governo não oferece API pública e que o autor fez engenharia reversa dos apps para consultar sem captcha. Traz aviso de que **não é mais mantido**. Fonte: https://github.com/victor-torres/sinesp-client
- `sinesp-api` (Node): o README diz que o projeto não tem vínculo com o SINESP e que hoje usa a "API-Carros" (apicarros.com) para obter os dados — ou seja, já não consulta o SINESP. Fonte: https://github.com/Sorackb/sinesp-api
- Por que são arriscados: (a) dependem de segredo extraído do aplicativo, que muda sem aviso; (b) contornam um mecanismo (captcha) posto para barrar automação; (c) estão abandonados ou trocaram de fonte sem mudar de nome; (d) o SINESP pode bloquear conexões (o próprio README cita bloqueio de fora do Brasil); (e) não há contrato, termo ou base que autorize o uso. O SINESP tampouco devolve cilindrada.

## 4. LGPD

Isto é leitura da lei, não parecer jurídico.

- **Placa é dado pessoal?** A lei define dado pessoal como "informação relacionada a pessoa natural identificada ou identificável" (art. 5º, I). No app, a placa fica ligada ao perfil de um rider identificado, então é dado pessoal desse rider. **Não foi encontrada orientação da ANPD específica sobre placa de veículo.** Material educativo do TJCE lista "placa de automóvel" entre exemplos de dado pessoal (https://www.tjce.jus.br/lgpd/lgpd-dados-pessoais/), sem força normativa. Lei: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- **A lei se aplica a um grupo informal?** O art. 4º, I exclui o tratamento "realizado por pessoa natural para fins exclusivamente particulares e não econômicos". Se isso cobre um app mantido por uma pessoa para um grupo de dezenas de riders é interpretação; não foi encontrada posição da ANPD sobre esse caso. O prudente é agir como se a lei se aplicasse.
- **Regime de pequeno porte.** A Resolução CD/ANPD nº 2/2022 inclui entre os agentes de pequeno porte pessoas naturais e entes privados despersonalizados que tratam dados pessoais (art. 2º, I). Benefícios: registro simplificado das operações (art. 9º), dispensa de encarregado desde que exista canal de comunicação com o titular (art. 11), segurança proporcional (arts. 12 e 13), prazos em dobro (art. 14). Não vale para tratamento de alto risco (art. 3º). Texto consultado em reprodução não oficial: https://www.normasbrasil.com.br/norma/resolucao-2-2022_426801.html (a página da ANPD não abriu).
- **Base legal.** O caminho mais simples é o consentimento (art. 7º, I): o rider digita a própria placa por vontade própria, depois de ler para que serve. O consentimento precisa ser para finalidade determinada e pode ser revogado. Princípios de finalidade, adequação e necessidade (art. 6º, I a III) pedem usar a placa só para preencher o cadastro da moto.
- **Envio a terceiro.** Consultar uma API comercial é compartilhar a placa com o provedor, que guarda logs (a Consulta de Placa declara 90 dias de log e 30 dias de resultado). O aviso ao rider precisa dizer isso antes do envio. O provedor trata o consumidor como controlador independente, com base legal própria.
- **Moto em nome de outra pessoa.** A placa pode estar registrada em nome de terceiro (financiamento, familiar). As consultas básicas não devolvem dados do proprietário, o que reduz o risco; a consulta do Detran-RJ via Infosimples lista um campo `nome` — se usada, esse campo deve ser descartado sem guardar.
- **Retenção.** O tratamento termina quando a finalidade é alcançada (art. 15) e o dado deve ser eliminado depois (art. 16). Alternativa de menor risco: usar a placa só para a consulta e **não guardá-la**, gravando apenas marca, modelo, ano, cor e cilindrada. Se a placa for guardada, ela é dado privado: pelas regras do projeto, outro rider vê só nome, apelido, foto, Instagram e motos — a placa não entra nessa lista e precisa de bloco que diga quem vê.
- **Abuso.** Um campo que consulta qualquer placa permite a um rider pesquisar veículo alheio. Mitigações possíveis: exigir sessão de rider aprovado, limitar consultas por rider, não exibir nada além dos campos do formulário.

## 5. Alternativa sem consulta: tabela FIPE

- API pública `https://fipe.parallelum.com.br/api/v2` (projeto fipe.api.br): cobre carros, motos e caminhões; 500 requisições por 24 h sem token e 1.000 com token gratuito; dados da tabela FIPE atualizados mensalmente e servidos de banco próprio. Fontes: https://deividfortuna.github.io/fipe/v2/ e https://fipe.api.br/
- Fluxo: marca → modelos → anos. Campos de resposta: marca, modelo, ano-modelo, combustível, código FIPE, preço, mês de referência. **Não há campo de cilindrada nem de cor**; a cilindrada costuma vir dentro do nome do modelo.
- A BrasilAPI também expõe FIPE, mas pede que não se use automação em volume e ainda não tem termos de uso publicados. Fonte: https://github.com/BrasilAPI/BrasilAPI
- Como o grupo é só de Triumph Scrambler, uma lista fixa de modelos e cilindradas mantida no próprio app (com FIPE no máximo para conferir nomes e anos) resolve sem depender de serviço externo. Cor continua sendo escolhida pelo rider.

## Não verificado

- Campos exatos devolvidos pelo Consulta Online Senatran em cada modalidade e se há consumo mínimo; texto integral das Portarias Senatran nº 139/2025 e nº 417/2026.
- Se `cilindradas` da API Placas vem preenchido para motos (o exemplo é de carro, com valor fictício). Só um teste real responde, e ele exige conta.
- Recarga mínima da API Placas e exigência de CPF/CNPJ no cadastro das APIs comerciais.
- Preço adicional da consulta DETRAN/RJ/Veículo na Infosimples e o valor exato da primeira faixa (R$ 0,20 ou R$ 0,22).
- De onde as revendedoras tiram os dados. Nenhuma nomeia a fonte.
- Campos e captcha da consulta pública do Detran-RJ (não foi enviada placa).
- Se o aplicativo Sinesp Cidadão está no ar (gov.br diz que sim; Infosimples diz que foi descontinuado).
- Posição da ANPD sobre placa como dado pessoal e sobre o alcance do art. 4º, I para grupos informais; texto oficial da Resolução CD/ANPD nº 2/2022 (lida em reprodução).
- Oferta de API do Placa Fipe e do "Consultar Placa" (não encontradas páginas públicas).

## Caminhos viáveis

### A. Sem consulta: lista própria de modelos

O rider escolhe modelo e ano numa lista de Scramblers (cilindrada vem junto) e informa a cor.

- A favor: custo zero, nenhum dado sai do app, nenhuma dependência externa, sem questão de LGPD nova, sem placa guardada.
- Contra: não atende ao desejo de "digitar a placa e preencher"; a lista precisa de manutenção quando sair modelo novo.

### B. API comercial pré-paga, placa usada e descartada

Chamada no servidor à API Placas (R$ 0,03) ou à Consulta de Placa (20 grátis, depois R$ 0,07), com aviso e consentimento antes do envio; o resultado preenche o formulário e o rider confere e corrige; a placa não é gravada.

- A favor: custo total de poucos reais, sem mensalidade; atende ao pedido; formulário manual continua como reserva quando a consulta falha.
- Contra: origem do dado não declarada e sem garantia; cilindrada não confirmada para motos (API Placas) ou ausente (Consulta de Placa); a placa é compartilhada com um terceiro que guarda logs; exige texto de aviso e limite de uso por rider; o provedor pode mudar preço ou sair do ar.

### C. Infosimples sobre a consulta do Detran-RJ

- A favor: fonte nomeada (consulta pública do Detran-RJ), com cor e cilindrada listadas.
- Contra: franquia de R$ 100/mês enquanto houver saldo (o crédito de avaliação de 30 dias cobriria só a carga inicial); só veículos do RJ; perfil de contratação empresarial; é automação de site público sem vínculo com o órgão; devolve campo `nome`, que teria de ser descartado.

O caminho oficial (Serpro/Senatran) não entra na lista: exige empresa credenciada, caso de uso aprovado e gestora de consentimento.
