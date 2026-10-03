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

## Pendente: identidade e prova social (precisa de insumo real, não inventar)

Itens de maior impacto em conversão, sem conteúdo definido ainda:

- **Nome/logo do fotógrafo no cabeçalho.** Hoje o `<header>` só mostra "Pré-Wedding" (`index.html`, `.brand-copy`). Quando houver nome e/ou logo, troque o texto e, se houver arquivo de marca, adicione um `<img>`/SVG dentro de `.brand-mark` no lugar do ícone genérico atual.
- **Fotos reais do portfólio.** Hoje as imagens em `assets/img/` (`hero-*`, `detail-*`, `story-*`, `cinema-*`, `og-image.jpg`) são de banco. Para trocar: gere as mesmas variantes (AVIF/WebP/JPEG, mesmas dimensões e nomes de arquivo) e substitua — nenhuma mudança de HTML/CSS é necessária se os nomes forem mantidos.
- **Depoimentos / prova social.** Não existe seção no momento. Quando houver depoimentos reais de casais atendidos, é possível inserir uma seção nova entre `#diferencas` e `#experience-spot` (ou entre `#pagamento` e `#experiencia`) seguindo o padrão visual de `.section-stack` + `.eyebrow` já usado nas outras seções.

Nenhum desses itens foi preenchido com texto ou imagem fictícia — fazer isso arriscaria passar informação falsa para os clientes.
