#!/usr/bin/env node
/*
 * Confere se os preços estáticos do index.html (cards, tabela comparativa e
 * valores iniciais do painel) batem com assets/js/plans.js (fonte única).
 * Uso: node scripts/check-prices.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const P = require(join(root, 'assets/js/plans.js'));
const html = readFileSync(join(root, 'index.html'), 'utf8');

const errors = [];
const expect = (label, found, wanted) => {
  if (found !== wanted) errors.push(`${label}: HTML tem "${found}", dados têm "${wanted}"`);
};

const cards = [...html.matchAll(/<article class="package-col[^"]*">[\s\S]*?<\/article>/g)].map((m) => m[0]);
const keys = Object.keys(P.plans);
if (cards.length !== keys.length) errors.push(`Esperados ${keys.length} cards, encontrados ${cards.length}`);

keys.forEach((key, i) => {
  const plan = P.plans[key];
  const card = cards[i] || '';
  expect(`${plan.name} (card, preço)`, (card.match(/package-price">([^<]+)</) || [])[1], P.brl(plan.price));
  expect(`${plan.name} (card, Pix)`, (card.match(/package-pix">([^<]+)</) || [])[1], `Pix ${P.brl(plan.pix)}`);
  if (!card.includes(`data-plan="${key}"`)) errors.push(`${plan.name}: botão data-plan="${key}" ausente no card`);
});

const recCard = cards.find((c) => c.includes('is-recommended'));
if (!recCard || !recCard.includes('Experience')) {
  errors.push('Destaque visual (is-recommended) deve estar no card Experience');
}

const row = html.match(/Valor do pacote<\/div>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
const tablePrices = row ? [...row[1].matchAll(/R\$ [\d.]+/g)].map((m) => m[0]) : [];
keys.forEach((key, i) => expect(`${P.plans[key].name} (tabela)`, tablePrices[i], P.brl(P.plans[key].price)));

keys.forEach((key) => {
  const p = P.plans[key];
  if (P.directInstallment(p) !== p.pixDirectInstallment) {
    errors.push(`${p.name}: parcela Pix 3× direto inconsistente`);
  }
  const c = p.card;
  if (Math.abs(c.x3 * 3 - c.t3) > 0.2) errors.push(`${p.name}: 3× cartão não fecha com o total`);
  if (Math.abs(c.x6 * 6 - c.t6) > 0.2) errors.push(`${p.name}: 6× cartão não fecha com o total`);
  if (Math.abs(c.x12 * 12 - c.t12) > 0.2) errors.push(`${p.name}: 12× não fecha com o total`);
  if (Math.abs(c.x18 * 18 - c.t18) > 0.2) errors.push(`${p.name}: 18× não fecha com o total`);
  if (p.pix > p.price) errors.push(`${p.name}: Pix acima do valor do pacote`);
});

// —— Painel de pagamento estático (plano default = recommended, sem JS) ——
const defaultKey = keys.find((k) => P.plans[k].recommended) || keys[0];
const defaultPlan = P.plans[defaultKey];
const c = defaultPlan.card;
const panel = html.match(/<div class="payment-body"[\s\S]*?<\/section>/);
const panelHtml = panel ? panel[0] : '';
const field = (id) => (panelHtml.match(new RegExp(`id="${id}"[^>]*>([^<]+)<`)) || [])[1];

const expectPanel = (label, id, wanted) => {
  const found = field(id);
  if (found !== wanted) errors.push(`Painel (${label}): HTML tem "${found}", dados têm "${wanted}"`);
};

expectPanel('nome do plano', 'payPlanName', defaultPlan.name);
expectPanel('valor do pacote', 'payListPrice', P.brl(defaultPlan.price));
expectPanel('Pix à vista', 'payPix', P.brl(P.pixPrice(defaultPlan)));
expectPanel(
  'Pix 3× direto',
  'payDirect',
  P.config.installmentsDirect + '× de ' + P.brl(P.directInstallment(defaultPlan))
);
const pct = P.discountPct(defaultPlan);
expectPanel('selo de desconto', 'payDiscountPill', pct > 0 ? '−' + pct + '% no Pix' : 'Pix à vista');
expectPanel('1× cartão', 'mp1x', P.brl(c.x1, true));
expectPanel('3× cartão', 'mp3x', '3× ' + P.brl(c.x3, true));
expectPanel('total 3×', 'mp3Total', 'total: ' + P.brl(c.t3, true));
expectPanel('6× cartão', 'mp6x', '6× ' + P.brl(c.x6, true));
expectPanel('total 6×', 'mp6Total', 'total: ' + P.brl(c.t6, true));
expectPanel('12× cartão', 'mp12x', '12× ' + P.brl(c.x12, true));
expectPanel('total 12×', 'mp12Total', 'total: ' + P.brl(c.t12, true));
expectPanel('18× cartão', 'mp18x', '18× ' + P.brl(c.x18, true));
expectPanel('total 18×', 'mp18Total', 'total: ' + P.brl(c.t18, true));

if (!panelHtml.includes(P.config.cardSimulationDate)) {
  errors.push(
    `Rodapé do cartão: data "${P.config.cardSimulationDate}" (plans.js cardSimulationDate) não aparece no HTML`
  );
}

if (errors.length) {
  console.error('Inconsistências encontradas:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('OK: preços do HTML consistentes com assets/js/plans.js');
