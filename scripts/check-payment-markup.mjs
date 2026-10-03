#!/usr/bin/env node
/*
 * Garante markup/CSS do painel Pix: badges em fluxo, valor fora dos badges.
 * Uso: node scripts/check-payment-markup.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'assets/css/04-refinements.css'), 'utf8');

const errors = [];

const pagamento = html.match(/<section id="pagamento"[\s\S]*?<\/section>/);
if (!pagamento) {
  errors.push('Seção #pagamento não encontrada no index.html');
} else {
  const section = pagamento[0];
  const pixMatch = section.match(
    /<div class="pay-option pay-option--pix[\s\S]*?<p class="pay-option-note">/
  );
  if (!pixMatch) {
    errors.push('Card Pix (.pay-option--pix + .pay-option-note) não encontrado em #pagamento');
  } else {
    const pixHtml = pixMatch[0];
    const badgesIdx = pixHtml.indexOf('pay-pix-badges');
    const headIdx = pixHtml.indexOf('pay-option-head');
    if (badgesIdx === -1 || headIdx === -1) {
      errors.push('Card Pix deve conter .pay-pix-badges e .pay-option-head');
    } else if (badgesIdx > headIdx) {
      errors.push('.pay-pix-badges deve vir antes de .pay-option-head no card Pix');
    }
    const badgesBlock = pixHtml.match(/<div class="pay-pix-badges"[\s\S]*?<\/div>/);
    if (badgesBlock && /pay-value|id="payPix"/.test(badgesBlock[0])) {
      errors.push('.pay-value não pode estar dentro de .pay-pix-badges');
    }
    if (!pixHtml.includes('pay-option-layout')) {
      errors.push('Card Pix deve usar a classe pay-option-layout');
    }
  }

  if (!section.includes('class="payment-summary"')) {
    errors.push('Painel deve envolver cabeçalho em .payment-summary');
  }
}

const badgesRule = css.match(/\.pay-pix-badges\s*\{[^}]*\}/g) || [];
for (const block of badgesRule) {
  if (/position\s*:\s*absolute/.test(block)) {
    errors.push('.pay-pix-badges não pode usar position: absolute (04-refinements.css)');
    break;
  }
}

const heroTenureBlock = html.match(/id="coupleTenure"[\s\S]*?<\/p>/);
if (!heroTenureBlock || !heroTenureBlock[0].includes('hero-tenure-since')) {
  errors.push('#coupleTenure deve conter .hero-tenure-count e .hero-tenure-since');
} else if (
  !/<p class="hero-lead[^"]*">[\s\S]*?<\/p>\s*<p id="coupleTenure" class="hero-tenure"/.test(html)
) {
  errors.push('#coupleTenure deve ser irmão imediato após .hero-lead (fora do parágrafo)');
}

if (errors.length) {
  console.error('Markup/CSS de pagamento inválido:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('OK: markup e CSS do painel de pagamento consistentes');
