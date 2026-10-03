# Relatório de auditoria e refatoração

Data: 02/10/2026. Escopo: `index.html` e tudo que ele carrega.

## Resultado (Lighthouse mobile, mesma máquina)

| Categoria | Antes | Depois |
|---|---|---|
| Performance | 88 | 96 |
| Acessibilidade | 97 | 100 |
| Boas práticas | 96 | 100 |
| SEO | 100 | 66 (intencional: `noindex`) |
| LCP | 3,5 s | 2,6 s |
| CLS | 0,002 | 0,002 |

O SEO cai porque a página agora declara `noindex, nofollow` (proposta privada). É o único item reprovado (`is-crawlable`). Para voltar a 100, remova a meta `robots`.

Verificado também com axe-core: 0 violações em 320, 390, 768 e 1440 px, nos temas claro e escuro. Sem erros de console, sem requisições falhas e sem overflow horizontal.

## Achados e correções

### Crítico
- **Valores inconsistentes no 3× direto.** O código arredondava a parcela para baixo em R$ 10. Essencial mostrava "3× de R$ 560" (soma R$ 1.680 para um pacote de R$ 1.690) e Experience "3× de R$ 990" (soma R$ 2.970 para R$ 2.990). Agora a parcela é exata (R$ 563,33 e R$ 996,67) e a soma fecha com o valor do pacote.
- **Dados comerciais em três lugares.** Preços estavam no HTML, no objeto `plans` e em `compareRows`. Agora existe `assets/js/plans.js` como fonte única; o comparativo mobile é derivado da tabela do HTML; `scripts/check-prices.mjs` falha o build se HTML e dados divergirem e valida a matemática (3×, 12×, 18×, Pix).

### Alto
- **Rolagem sequestrada.** O site interceptava `wheel` com `preventDefault` e animava o scroll via JS. Removido; usa rolagem nativa, `scroll-behavior: smooth` só quando o usuário não pede movimento reduzido e `scroll-margin-top` nas seções.
- **Botões de WhatsApp sem JS.** Eram `href="#"`. Agora têm link real (`wa.me`) com `rel="noopener noreferrer"`; o JS só acrescenta a mensagem.
- **Conteúdo invisível sem JS.** Elementos `.reveal` nasciam com `opacity: 0`. Agora o efeito só existe sob `html.js`.
- **Imagens de terceiros.** Quatro fotos do Unsplash por hotlink. Agora são locais, recortadas na proporção usada, em AVIF, WebP e JPEG, com `srcset`, `sizes`, dimensões e `fetchpriority="high"` só no hero. De ~1,9 MB de origem para ~25 a 60 KB por imagem nos formatos modernos.
- **Drawer modal incompleto.** O fundo agora fica `inert` enquanto o menu está aberto; foco retorna ao botão ao fechar.
- **Contraste.** Acento champagne (#A88458) em texto pequeno tinha 2,9 a 3,2:1. Novo token `--champagne-text` (#7A5C34 no claro; versão clara em superfícies escuras); `--text-soft` e `--text-faint` escurecidos.

### Médio
- **Fontes.** Google Fonts (2 requisições externas, 9 pesos) trocado por 3 arquivos variáveis locais (subconjunto latin, 104 KB) com `preload`.
- **CSS e JS inline** (162 KB num arquivo) separados em partes mantíveis e empacotados com minificação (`styles.min.css` 70 KB, `app.min.js` 10 KB).
- **CSS duplicado.** Três blocos de `prefers-reduced-motion` unificados em um; tokens de raio duplicados (`--radius-*` e `--r-*`) unificados; regras de efeitos removidos apagadas.
- **Loop de scroll.** `requestAnimationFrame` com parallax, leitura de layout por frame e scrollspy por `offsetTop` substituídos por `IntersectionObserver`.
- **Tablist.** Seletores de plano e do comparativo agora têm roving tabindex e `Home`/`End`, além das setas.
- **Live region.** Antes, o painel inteiro (inclusive as abas) anunciava mudanças; agora só o conteúdo do plano.
- **Landmark.** CTA fixo mobile virou `<aside>`; `aria-label` da marca inclui o texto visível.

### SEO e compartilhamento
- Open Graph e Twitter Card com imagem 1200×630, `canonical`, favicon SVG e `apple-touch-icon`, `<noscript>`, título e descrição revisados, `noindex, nofollow`.
- Tema respeita `prefers-color-scheme` quando não há escolha salva, definido antes da pintura (sem flash).

### Design (frontend-design e ui-ux-pro-max)
- Removidos os destaques de palavra solta no H1 ("vocês", "cinema") e o rótulo redundante "Pré-wedding" acima do título.
- Removida a linha "Planejamento • Direção • Luz • Movimento".
- Rótulos e eyebrows em sentence case em vez de caixa-alta.
- Numeração 01/02/03 removida onde o conteúdo não é sequência (cards de pacote e destaques do projeto; os destaques viraram lista com ícone, sem setas de passo). Mantida onde é sequência real (processo).
- Movimento reduzido ao que responde a ação do usuário e à entrada do hero: removidos barra de progresso, parallax triplo, contador animado, botão magnético, fade em todas as seções.

## Não alterado (decisões em aberto)
- **Identidade do fotógrafo.** O cabeçalho só diz "Pré-Wedding". Faltam nome, logotipo e (se existirem) depoimentos; sem esses dados não inventei nada.
- **Fotos.** São imagens de banco. Trocar pelo portfólio real é o maior ganho de conversão pendente: substitua os arquivos em `assets/img` mantendo os nomes ou rode novamente a geração de variantes.
- **Arredondamento do Pix.** Mantido para baixo em múltiplos de R$ 10 (ex.: R$ 1.605,50 aparece como R$ 1.600). Se preferir centavos exatos, altere `pixRoundTo` para `0.01` em `plans.js`.
- **Cascata do CSS.** As cinco partes ainda carregam camadas de sobrescrita herdadas ("passes"). Foram limpas duplicações óbvias, mas uma reescrita completa da cascata exigiria redesenho visual e validação página a página.
- **Valores de cartão** continuam fixos da simulação de 02/10/2026; precisam de atualização manual se a taxa mudar.
