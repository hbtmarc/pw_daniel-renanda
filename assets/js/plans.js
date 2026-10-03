/*
 * Fonte única dos dados comerciais da proposta.
 * Qualquer valor exibido no painel de pagamento é derivado daqui.
 * Os preços estáticos do HTML (cards e tabela) são conferidos por
 * `node scripts/check-prices.mjs`.
 */
(function (global) {
  'use strict';

  var CONFIG = {
    whatsapp: {
      phone: '5531995592422',
      message:
        'Olá! Somos Daniel e Renanda e nos encantamos com a proposta de pré-wedding. ' +
        'Gostaríamos de conversar sobre data, local e qual experiência faz mais sentido para nós — ' +
        'podemos alinhar os próximos passos?'
    },
    // Desconto do Pix à vista e arredondamento comercial (para baixo, em múltiplos de R$ 10).
    pixDiscount: 0.05,
    pixRoundTo: 10,
    installmentsDirect: 3,
    cardSimulationDate: '02/10/2026'
  };

  /*
   * Valores de cartão vêm da simulação do link de pagamento (não são calculáveis aqui).
   * x1 = 1× no cartão; x12/x18 = valor da parcela; t12/t18 = total cobrado.
   */
  var PLANS = {
    essential: {
      name: 'Essencial',
      price: 1690,
      recommended: false,
      card: { x1: 1778.57, x12: 180.98, t12: 2171.81, x18: 128.44, t18: 2311.96 }
    },
    signature: {
      name: 'Signature',
      price: 2490,
      recommended: true,
      card: { x1: 2620.5, x12: 266.66, t12: 3199.89, x18: 189.24, t18: 3406.39 }
    },
    experience: {
      name: 'Experience',
      price: 2990,
      recommended: false,
      card: { x1: 3146.71, x12: 320.2, t12: 3842.45, x18: 227.24, t18: 4090.41 }
    }
  };

  function roundDown(value, step) {
    return Math.round(Math.floor(value / step + 1e-9) * step * 100) / 100;
  }

  function pixPrice(plan) {
    return roundDown(plan.price * (1 - CONFIG.pixDiscount), CONFIG.pixRoundTo);
  }

  function directInstallment(plan) {
    return Math.round((plan.price / CONFIG.installmentsDirect) * 100) / 100;
  }

  function discountPct(plan) {
    return Math.round((1 - pixPrice(plan) / plan.price) * 100);
  }

  function brl(value, forceCents) {
    var hasCents = forceCents || Math.round(value * 100) % 100 !== 0;
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: hasCents ? 2 : 0
    }).replace(/\u00a0/g, ' ');
  }

  function whatsappUrl(suffix) {
    return (
      'https://wa.me/' + CONFIG.whatsapp.phone +
      '?text=' + encodeURIComponent(CONFIG.whatsapp.message + (suffix || ''))
    );
  }

  global.PROPOSTA = {
    config: CONFIG,
    plans: PLANS,
    pixPrice: pixPrice,
    directInstallment: directInstallment,
    discountPct: discountPct,
    brl: brl,
    whatsappUrl: whatsappUrl
  };

  // Permite validação em Node sem DOM.
  if (typeof module !== 'undefined' && module.exports) module.exports = global.PROPOSTA;
})(typeof window !== 'undefined' ? window : globalThis);
