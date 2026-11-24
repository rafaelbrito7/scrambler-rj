# Hospedagem e armazenamento de imagens

Type: grilling
Status: open
Parent: [Mapa do MVP — Scrambler RJ](../map.md)
Blocked by: none

## Question

Qual combinação de hospedagem da aplicação, PostgreSQL e armazenamento de imagens atende ao orçamento e à manutenção desejados?

Obter orçamento mensal aceitável e preferência de manutenção. Consultar preços e documentação oficial atualizados antes de propor opções; considerar persistência de imagens, backups, domínio, configuração do login Google e ambientes. Não contratar nem publicar nesta etapa. Stack já aprovada deve ser preservada.

## Decisão parcial — armazenamento de imagens (2026-11-17)

- O usuário escolheu **Cloudflare R2** para as fotos (riders, motos, peças, passeios e galeria).
- Bucket privado: o app continua intermediando a entrega, só para riders aprovados, como hoje em `/fotos/[key]`.
- Redução no envio com `sharp`; limites de tamanho e quantidade ficam para a spec de passeios.
- Preços e cota grátis do R2 não foram conferidos nesta data; conferir antes de contratar.
- Continua em aberto neste ticket: hospedagem da aplicação e do PostgreSQL. O ticket segue `open`.
