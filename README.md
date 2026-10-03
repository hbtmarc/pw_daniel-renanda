# Proposta pré-wedding — Daniel & Renanda

Site estático da proposta comercial (pacotes, pagamento e condições).

**Publicado em:** [https://hbtmarc.github.io/pw_daniel-renanda/](https://hbtmarc.github.io/pw_daniel-renanda/)

A página é privada: usa `noindex, nofollow` e não deve aparecer em buscadores.

## Estrutura

```
index.html                 marcação (valores de cada pacote também estão aqui, para funcionar sem JS)
assets/css/0*.css          fontes de estilo (tokens e base, editorial, layout, refinamentos, responsivo)
assets/css/main.css        entrada que importa as partes
assets/css/styles.min.css  bundle usado pelo site (gerado)
assets/js/plans.js         FONTE ÚNICA dos dados comerciais (preços, Pix, cartão, WhatsApp)
assets/js/main.js          comportamento (tema, pagamento, drawer, comparativo, FAQ)
assets/js/app.min.js       bundle usado pelo site (gerado)
assets/fonts, assets/img   fontes e imagens locais (AVIF, WebP e JPEG)
scripts/check-prices.mjs   confere se o HTML bate com plans.js
scripts/build.sh           confere preços e gera os bundles minificados
scripts/process-couple-images.mjs  gera AVIF/WebP/JPEG a partir de assets/img/source/
package.json               sharp (dev) para o script de imagens
```

## Desenvolvimento local

```bash
python3 -m http.server 8080
```

## Alterar preços ou condições

1. Edite `assets/js/plans.js` (valores numéricos).
2. Atualize os textos estáticos em `index.html` (cards e linha "Valor do pacote" da tabela).
3. Rode `sh scripts/build.sh`: ele falha se HTML e `plans.js` divergirem (cards, tabela comparativa e todo o painel de pagamento estático do plano recomendado — nome, Pix, 3× direto, selo de desconto e as 5 faixas de cartão) e gera os bundles.

Regras atuais: Pix à vista com valor informado em cada pacote; Pix 3× direto com parcela **comercial redonda** definida em `pixDirectInstallment` (não é pix ÷ 3 — nos três planos a soma das parcelas fica R$ 10 abaixo do Pix à vista, por escolha deliberada); cartão conforme a simulação do link de pagamento (data em `cardSimulationDate`, repetida no rodapé do painel e conferida pelo `check-prices.mjs`).

## Atualizar o site no ar

```bash
sh scripts/build.sh
git add -A
git commit -m "Atualizar proposta"
git push origin main
```

O push dispara `.github/workflows/check.yml`, que falha se os preços ou os bundles ficarem desatualizados — rode `sh scripts/build.sh` localmente antes de empurrar.

## Fotos do casal (Instagram → site)

Originais nomeados em `assets/img/source/` (`01-hero.png` … `05-cinema.png`). Para regenerar as variantes publicadas:

```bash
npm install
node scripts/process-couple-images.mjs
sh scripts/build.sh
```

Isso sobrescreve `hero-*`, `detail-*`, `story-*`, `cinema-*` e `og-image.jpg` em `assets/img/`. O hero usa `02-detail.png` (retrato principal) e o inset `01-hero.png`.

A data do namoro (`2023-07-01`) fica em `plans.js` → `config.couple.relationshipStart`; o hero exibe a linha fixa e a contagem “há X anos e Y meses” via `main.js`.

## Pendente: identidade e prova social

- **Nome/logo do fotógrafo no cabeçalho** (hoje só “Pré-Wedding” em `.brand-copy`).
- **Depoimentos** de outros casais atendidos — ainda sem seção no HTML.
