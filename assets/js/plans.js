/*
 * Fonte única dos dados comerciais da proposta.
 * Qualquer valor exibido no painel de pagamento é derivado daqui.
 * Os preços estáticos do HTML (cards e tabela) são conferidos por
 * `node scripts/check-prices.mjs`.
 */
(function (global) {
  'use strict';

  var CONFIG = {
    couple: {
      relationshipStart: '2022-07-01',
      relationshipStartLabel: '01/07/22'
    },
    whatsapp: {
      phone: '5531995592422',
      message:
        'Olá! Somos Daniel e Renanda e nos encantamos com a proposta de pré-wedding. ' +
        'Gostaríamos de conversar sobre data, local e qual experiência faz mais sentido para nós — ' +
        'podemos alinhar os próximos passos?'
    },
    installmentsDirect: 3,
    cardSimulationDate: '03/10/2026'
  };

  /*
   * pix: valor à vista informado comercialmente.
   * pixDirectInstallment: parcela do Pix 3× direto — valor comercial redondo,
   * decisão deliberada (não é pix/3). Nos três pacotes a soma das 3 parcelas
   * fica R$ 10 abaixo do Pix à vista (ex.: Essencial 3×430=1290 vs pix 1300);
   * é intencional e consistente nos três planos, não um erro de arredondamento.
   * Não há texto na página que afirme que as parcelas somam o valor do Pix —
   * ao alterar esses números, mantenha essa ausência de reivindicação.
   * Valores de cartão vêm da simulação do link de pagamento (não são calculáveis aqui).
   */
  var PLANS = {
    essential: {
      name: 'Essencial',
      price: 1390,
      pix: 1300,
      pixDirectInstallment: 430,
      recommended: false,
      card: {
        x1: 1462.85,
        x3: 542.38, t3: 1627.13,
        x6: 278.72, t6: 1672.33,
        x12: 148.85, t12: 1786.29,
        x18: 105.64, t18: 1901.56
      }
    },
    signature: {
      name: 'Signature',
      price: 2390,
      pix: 2200,
      pixDirectInstallment: 730,
      recommended: false,
      card: {
        x1: 2515.26,
        x3: 932.57, t3: 2797.72,
        x6: 479.24, t6: 2875.45,
        x12: 255.95, t12: 3071.38,
        x18: 181.64, t18: 3269.59
      }
    },
    experience: {
      name: 'Experience',
      price: 2990,
      pix: 2800,
      pixDirectInstallment: 930,
      recommended: true,
      card: {
        x1: 3146.71,
        x3: 1166.70, t3: 3500.09,
        x6: 599.55, t6: 3597.32,
        x12: 320.20, t12: 3842.45,
        x18: 227.24, t18: 4090.41
      }
    }
  };

  function pixPrice(plan) {
    return plan.pix;
  }

  function directInstallment(plan) {
    return plan.pixDirectInstallment;
  }

  function discountPct(plan) {
    if (!plan.price) return 0;
    return Math.round((1 - plan.pix / plan.price) * 100);
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

  if (typeof module !== 'undefined' && module.exports) module.exports = global.PROPOSTA;
})(typeof window !== 'undefined' ? window : globalThis);
