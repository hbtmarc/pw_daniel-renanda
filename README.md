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
```

## Desenvolvimento local

```bash
python3 -m http.server 8080
```

## Alterar preços ou condições

1. Edite `assets/js/plans.js` (valores numéricos).
2. Atualize os textos estáticos em `index.html` (cards e linha "Valor do pacote" da tabela).
3. Rode `sh scripts/build.sh`: ele falha se HTML e `plans.js` divergirem e gera os bundles.

Regras atuais: Pix à vista com 5% de desconto, arredondado para baixo em múltiplos de R$ 10; Pix 3× direto em parcelas exatas (soma igual ao valor do pacote); cartão conforme a simulação do link de pagamento (data em `cardSimulationDate`).

## Atualizar o site no ar

```bash
sh scripts/build.sh
git add -A
git commit -m "Atualizar proposta"
git push origin main
```
