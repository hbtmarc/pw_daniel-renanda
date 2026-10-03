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
  expect(`${plan.name} (card, Pix)`, (card.match(/package-pix">([^<]+)</) || [])[1], `Pix ${P.brl(P.pixPrice(plan))}`);
  if (!card.includes(`data-plan="${key}"`)) errors.push(`${plan.name}: botão data-plan="${key}" ausente no card`);
});

const row = html.match(/Valor do pacote<\/div>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
const tablePrices = row ? [...row[1].matchAll(/R\$ [\d.]+/g)].map((m) => m[0]) : [];
keys.forEach((key, i) => expect(`${P.plans[key].name} (tabela)`, tablePrices[i], P.brl(P.plans[key].price)));

// Coerência matemática.
keys.forEach((key) => {
  const p = P.plans[key];
  const direct = P.directInstallment(p) * P.config.installmentsDirect;
  if (Math.abs(direct - p.price) > 0.02) errors.push(`${p.name}: 3× parcelas somam ${direct.toFixed(2)} ≠ ${p.price}`);
  if (Math.abs(p.card.x12 * 12 - p.card.t12) > 0.2) errors.push(`${p.name}: 12× não fecha com o total`);
  if (Math.abs(p.card.x18 * 18 - p.card.t18) > 0.2) errors.push(`${p.name}: 18× não fecha com o total`);
  if (P.pixPrice(p) > p.price * (1 - P.config.pixDiscount)) errors.push(`${p.name}: Pix acima do desconto prometido`);
});

if (errors.length) {
  console.error('Inconsistências encontradas:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('OK: preços do HTML consistentes com assets/js/plans.js');
