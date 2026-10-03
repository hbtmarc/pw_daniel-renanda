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

## Adendo — auditoria 03/10/2026 (pacotes 2026 + responsivo)

Escopo: revisão completa pós-atualização de pacotes/preços 2026, com foco em desktop/tablet/mobile. Validação visual feita com Playwright (Chromium headless) em 320, 390, 768, 900 e 1440px, incluindo a ação "Comparar lado a lado" no mobile.

### Corrigido nesta rodada
- **Pill "Incluído" sobrepondo a coluna fixa da tabela comparativa a 320–390px** (ação "Comparar lado a lado"). Causa raiz: `.yes-pill` é item flex não esticado (`align-items: center`) e seu tamanho era calculado pelo conteúdo máximo, ignorando a largura disponível da célula — a um certo ponto ele ultrapassava a célula e visualmente invadia a coluna "Tratamento" ao lado. Confirmado com `getBoundingClientRect` (pill mais largo que a célula) antes da correção.
- **Correção aplicada:** `overflow-x: visible` e o encolhimento de colunas (`minmax(0, 1fr)`) em `05-responsive.css` agora só valem a partir de 768px (onde foram confirmados visualmente corretos). Abaixo de 768px, a tabela forçada no mobile volta a ter `overflow-x: auto` nativo (comportamento original de `01-base.css`) com as larguras mínimas de coluna originais — ou seja, ela rola horizontalmente em vez de espremer o conteúdo até vazar. Adicionado aviso textual "Arraste para o lado para ver os três pacotes." ao ativar a tabela forçada.
- **Abas de pagamento quebrando linha em 320px** ("Essencia-l", "Signatur-e", "Experien-ce"). Causa: paddings aninhados (`payment-panel` → `package-selector` → `selector-button`) deixavam menos de 80px de texto disponível por aba. Reduzido o padding/margin do `package-selector` e do `selector-button` em telas estreitas, com `font-size` fluido (`clamp`) e `white-space: nowrap`.

### Verificado e confirmado correto (hipóteses da auditoria anterior descartadas)
- A tabela comparativa em 768–1023px (tablet) renderiza bem, sem aperto real — texto quebra de forma legível, sem corte.
- Não há overflow horizontal da página (`body.scrollWidth`) em nenhum dos 5 breakpoints testados, antes ou depois da correção.

### Pix 3× direto — decisão comercial documentada
Os valores (R$ 430 / 730 / 930) são parcelas redondas definidas deliberadamente, não `pix ÷ 3`. Nos três pacotes a soma das 3 parcelas fica R$ 10 abaixo do Pix à vista — padrão consistente, não erro de arredondamento. Nenhum texto da página afirma que as parcelas somam o valor do Pix; documentado em `plans.js` e no `README.md` para não ser "corrigido" por engano no futuro.

### Pendências de conteúdo (ainda sem insumo do fotógrafo)
Mantém-se tudo do relatório original: identidade do fotógrafo no cabeçalho, fotos reais no lugar das de banco, depoimentos. Ver seção "Não alterado" abaixo.

### Técnico
- `check-prices.mjs` agora também valida o painel de pagamento estático (nome, Pix, 3× direto, selo de desconto, 5 faixas de cartão) do plano recomendado e a data da simulação do cartão no rodapé — antes só validava cards e tabela.
- **Correção de a11y (axe-core, 0 violações confirmado):** `#compareMobileDl` era um `<dl>` com `<div>` de título solto entre grupos `dt/dd` — estrutura inválida (`definition-list`). Agora cada seção do comparativo mobile vira um `<dl>` próprio, com o título como `<p>` fora da lista. `<aside role="dialog">` no drawer de navegação virou `<div role="dialog">` (`aside` não aceita `role="dialog"` — `aria-allowed-role`). Testado também: foco do drawer (loop e `Escape` devolvendo foco ao botão), roving tabindex dos tablists (setas/Home/End) e abertura do FAQ por teclado — tudo funcionando.
- **Limpeza de CSS morto:** removidas ~290 linhas de regras de uma versão anterior do layout, não usadas pelo HTML atual — `.plans`/`.plan`/`.plan-tier`/`.plan-kicker`/`.plan-subtitle`/`.plan-note` (card antigo, hoje é `.package-row`/`.package-col`), `.hero-grid`/`.hero-facts*`/`.hero-chips`/`.hero-summary*`, `.trust-grid`/`.trust-item*`/`.trust-icon`, `.story-grid`/`.story-divider*`/`.story-pillar`/`.story-bullets`/`.story-bridge`, `.flow`/`.flow-item*`/`.flow-index`, `.price`/`.pix-price`/`.feature-list`/`.check`, `.count-up`/`.tilt-ready`/`.hero-photo-placeholder`. Confirmado por `grep` no `index.html`/`main.js` antes de remover; `.plan-actions` (ainda em uso) foi preservado. Bundle `styles.min.css` caiu de 70,6 KB para 63,2 KB (~10%). Validado com screenshot de página inteira (desktop/tablet/mobile) e axe-core — sem diferença visual, 0 violações.
- CI adicionado no repositório da proposta: [`/.github/workflows/check.yml`](.github/workflows/check.yml) roda `check-prices.mjs` e `build.sh` a cada push/PR em `main`, falhando se os bundles commitados ficarem desatualizados.
- `.agents/` (skills do Cursor, ~3,8 MB) e `skills-lock.json` passaram a constar no `.gitignore` — não fazem parte do site publicado.

## Não alterado (decisões em aberto)
- **Identidade do fotógrafo.** O cabeçalho só diz "Pré-Wedding". Faltam nome, logotipo e (se existirem) depoimentos; sem esses dados não inventei nada.
- **Fotos.** São imagens de banco. Trocar pelo portfólio real é o maior ganho de conversão pendente: substitua os arquivos em `assets/img` mantendo os nomes ou rode novamente a geração de variantes.
- **Arredondamento do Pix.** Mantido para baixo em múltiplos de R$ 10 (ex.: R$ 1.605,50 aparece como R$ 1.600). Se preferir centavos exatos, altere `pixRoundTo` para `0.01` em `plans.js`.
- **Cascata do CSS.** As cinco partes ainda carregam camadas de sobrescrita herdadas ("passes"). Foram limpas duplicações óbvias, mas uma reescrita completa da cascata exigiria redesenho visual e validação página a página.
- **Valores de cartão** continuam fixos da simulação de 02/10/2026; precisam de atualização manual se a taxa mudar.
