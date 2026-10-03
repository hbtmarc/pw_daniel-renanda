(function () {
  'use strict';

  var P = window.PROPOSTA;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* —— Tema —— */
  var themeToggle = $('#themeToggle');
  var metaTheme = $('meta[name="theme-color"]');

  function syncThemeUI() {
    var dark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
    $('.moon', themeToggle).style.display = dark ? 'none' : 'block';
    $('.sun', themeToggle).style.display = dark ? 'block' : 'none';
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#0F120F' : '#F4F1EA');
  }

  themeToggle.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('prewedding-theme', root.dataset.theme); } catch (err) { /* storage bloqueado */ }
    syncThemeUI();
  });
  syncThemeUI();

  function relationshipStartLabel(isoDate) {
    var couple = P.config.couple || {};
    if (couple.relationshipStartLabel) return couple.relationshipStartLabel;
    var start = new Date(isoDate + 'T12:00:00');
    var dd = String(start.getDate()).padStart(2, '0');
    var mm = String(start.getMonth() + 1).padStart(2, '0');
    var yy = String(start.getFullYear()).slice(-2);
    return dd + '/' + mm + '/' + yy;
  }

  function formatRelationshipTenure(isoDate) {
    var start = new Date(isoDate + 'T12:00:00');
    var now = new Date();
    var months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months -= 1;
    if (months < 0) months = 0;
    var years = Math.floor(months / 12);
    var rem = months % 12;
    var sinceLabel = relationshipStartLabel(isoDate);
    var count;
    if (years === 0 && rem === 0) count = 'Há menos de um mês e contando';
    else if (years === 0) count = 'Há ' + rem + (rem === 1 ? ' mês' : ' meses') + ' e contando';
    else if (rem === 0) count = 'Há ' + years + (years === 1 ? ' ano' : ' anos') + ' e contando';
    else {
      count =
        'Há ' +
        years +
        (years === 1 ? ' ano' : ' anos') +
        ' e ' +
        rem +
        (rem === 1 ? ' mês' : ' meses') +
        ' e contando';
    }
    return { count: count, since: 'desde ' + sinceLabel };
  }

  var coupleTenureEl = $('#coupleTenure');
  if (coupleTenureEl && P.config.couple && P.config.couple.relationshipStart) {
    var tenure = formatRelationshipTenure(P.config.couple.relationshipStart);
    var countEl = coupleTenureEl.querySelector('.hero-tenure-count');
    var sinceEl = coupleTenureEl.querySelector('.hero-tenure-since');
    if (countEl) countEl.textContent = tenure.count;
    if (sinceEl) sinceEl.textContent = tenure.since;
  }

  /* —— Rolagem: nativa, com offset via scroll-margin-top no CSS —— */
  function scrollToEl(el) {
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  /* —— Tablist acessível (setas, Home, End, roving tabindex) —— */
  function initTablist(tabs, onSelect) {
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      onSelect(tab);
    }
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab);
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
    return select;
  }

  /* —— Pagamento: tudo derivado de PROPOSTA.plans —— */
  var payTabs = $$('.selector-button');
  var paymentContent = $('#paymentContent');

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderPlan(key) {
    var plan = P.plans[key];
    if (!plan) return;
    var c = plan.card;
    paymentContent.setAttribute('aria-labelledby', 'tab-' + key);
    setText('payPlanName', plan.name);
    setText('payListPrice', P.brl(plan.price));
    setText('payPix', P.brl(P.pixPrice(plan)));
    setText('payDirect', P.config.installmentsDirect + '× de ' + P.brl(P.directInstallment(plan)));
    var pct = P.discountPct(plan);
    setText('payDiscountPill', pct > 0 ? '−' + pct + '% no Pix' : 'Pix à vista');
    setText('mp1x', P.brl(c.x1, true));
    setText('mp3x', '3× ' + P.brl(c.x3, true));
    setText('mp3Total', 'total: ' + P.brl(c.t3, true));
    setText('mp6x', '6× ' + P.brl(c.x6, true));
    setText('mp6Total', 'total: ' + P.brl(c.t6, true));
    setText('mp12x', '12× ' + P.brl(c.x12, true));
    setText('mp12Total', 'total: ' + P.brl(c.t12, true));
    setText('mp18x', '18× ' + P.brl(c.x18, true));
    setText('mp18Total', 'total: ' + P.brl(c.t18, true));
    setText('payBadge', plan.recommended ? 'Recomendado' : 'Selecionado');
  }

  function animatePaymentSwap() {
    if (reduceMotion) return;
    paymentContent.classList.add('is-swapping');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { paymentContent.classList.remove('is-swapping'); });
    });
    $$('.pay-value, .mp-row strong', paymentContent).forEach(function (el) {
      el.classList.remove('pay-flash');
      void el.offsetWidth;
      el.classList.add('pay-flash');
    });
  }

  function writePlanToUrl(key) {
    try {
      var u = new URL(window.location.href);
      u.searchParams.set('plano', key);
      history.replaceState(null, '', u.toString());
    } catch (err) { /* file:// ou contexto restrito */ }
  }

  var selectPayTab = initTablist(payTabs, function (tab) {
    renderPlan(tab.dataset.plan);
    animatePaymentSwap();
    writePlanToUrl(tab.dataset.plan);
  });

  $$('.choose-plan').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = payTabs.filter(function (t) { return t.dataset.plan === btn.dataset.plan; })[0];
      if (tab) selectPayTab(tab, false);
      scrollToEl($('#pagamento'));
    });
  });

  (function initialPlan() {
    var wanted = null;
    try { wanted = new URLSearchParams(window.location.search).get('plano'); } catch (err) { /* ignora */ }
    var key = wanted && P.plans[wanted] ? wanted : 'experience';
    payTabs.forEach(function (t) {
      var on = t.dataset.plan === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    renderPlan(key);
  })();

  /* —— WhatsApp: href real (funciona sem JS); aqui só enriquecemos com a mensagem —— */
  $$('.wa-cta').forEach(function (link) {
    link.href = P.whatsappUrl(link.getAttribute('data-wa-suffix') || '');
  });

  /* —— Comparativo mobile: derivado da tabela desktop (fonte única no HTML) —— */
  var compareDl = $('#compareMobileDl');
  var compareTabs = $$('.compare-mobile-tabs [role="tab"]');
  var compareDesktop = $('.compare-desktop');
  var compareMobile = $('.compare-mobile');
  var compareBodyRows = $$('.compare-body .compare-row');
  var planOrder = ['essential', 'signature', 'experience'];

  function renderCompareMobile(planKey) {
    if (!compareDl) return;
    var col = planOrder.indexOf(planKey) + 1;
    compareDl.textContent = '';
    /* Cada seção vira um <dl> próprio: o título fica fora da lista de definição
       (um <dl> só pode conter grupos dt+dd, não um rótulo solto) — estrutura
       válida para leitores de tela, confirmada com axe-core. */
    var currentList = null;
    compareBodyRows.forEach(function (row) {
      if (row.classList.contains('compare-row--section')) {
        var heading = document.createElement('p');
        heading.className = 'compare-mobile-section';
        heading.textContent = row.textContent.trim();
        compareDl.appendChild(heading);
        currentList = document.createElement('dl');
        currentList.className = 'compare-mobile-section-list';
        compareDl.appendChild(currentList);
        return;
      }
      if (!currentList) return;
      var cells = Array.prototype.slice.call(row.children);
      if (!cells[col]) return;
      var wrap = document.createElement('div');
      wrap.className = 'compare-mobile-row';
      if (row.classList.contains('compare-row--price')) wrap.classList.add('is-price');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = cells[0].textContent.trim();
      dd.innerHTML = cells[col].innerHTML.trim();
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      currentList.appendChild(wrap);
    });
  }

  if (compareTabs.length) {
    initTablist(compareTabs, function (tab) { renderCompareMobile(tab.dataset.comparePlan); });
    renderCompareMobile('experience');
  }

  var compareShowTable = $('#compareShowTable');
  var compareScrollHint = $('#compareScrollHint');
  if (compareShowTable && compareDesktop && compareMobile) {
    compareShowTable.addEventListener('click', function () {
      if (window.matchMedia('(max-width: 767px)').matches) return;
      compareMobile.classList.add('is-hidden');
      compareDesktop.classList.add('is-forced');
      if (compareScrollHint) compareScrollHint.hidden = false;
      scrollToEl(compareDesktop);
    });
  }

  // Realce de coluna na tabela (ponteiro fino).
  var cmpWrap = $('.compare-wrap');
  if (cmpWrap && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cmpRowEls = $$('.compare-head, .compare-row:not(.compare-row--section)', cmpWrap);
    var highlight = function (idx) {
      cmpRowEls.forEach(function (row) {
        Array.prototype.forEach.call(row.children, function (cell, i) {
          if (i === idx && idx > 0) cell.setAttribute('data-col-hover', '');
          else cell.removeAttribute('data-col-hover');
        });
      });
    };
    cmpWrap.addEventListener('mouseover', function (e) {
      var cell = e.target.closest('.compare-head > div, .compare-row > div');
      if (cell) highlight(Array.prototype.indexOf.call(cell.parentNode.children, cell));
    });
    cmpWrap.addEventListener('mouseleave', function () { highlight(-1); });
  }

  /* —— Drawer de navegação (modal real: inert no resto da página) —— */
  var menuOpen = $('#menuOpen');
  var menuClose = $('#menuClose');
  var navDrawer = $('#navDrawer');
  var navBackdrop = $('#navBackdrop');
  var inertTargets = $$('main, footer, .mobile-cta, .site-header');
  var drawerReturnFocus;

  function setDrawerOpen(open) {
    menuOpen.setAttribute('aria-expanded', String(open));
    navDrawer.classList.toggle('is-open', open);
    navBackdrop.classList.toggle('is-open', open);
    inertTargets.forEach(function (el) { el.inert = open; });
    if (open) {
      drawerReturnFocus = document.activeElement;
      navDrawer.hidden = false;
      navBackdrop.hidden = false;
      document.body.style.overflow = 'hidden';
      var first = $('a, button', navDrawer);
      if (first) first.focus();
    } else {
      navDrawer.hidden = true;
      navBackdrop.hidden = true;
      document.body.style.overflow = '';
      if (drawerReturnFocus && drawerReturnFocus.focus) drawerReturnFocus.focus();
    }
  }

  menuOpen.addEventListener('click', function () { setDrawerOpen(true); });
  menuClose.addEventListener('click', function () { setDrawerOpen(false); });
  navBackdrop.addEventListener('click', function () { setDrawerOpen(false); });
  $$('[data-nav-close]', navDrawer).forEach(function (link) {
    link.addEventListener('click', function () { setDrawerOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (!navDrawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); setDrawerOpen(false); return; }
    if (e.key !== 'Tab') return;
    var focusable = $$('a, button', navDrawer);
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
    if (e.matches && navDrawer.classList.contains('is-open')) setDrawerOpen(false);
  });

  /* —— Disclosures por viewport —— */
  var wideMQ = window.matchMedia('(min-width: 768px)');
  function syncDisclosures() {
    $$('.package-more').forEach(function (d) { d.open = wideMQ.matches; });
  }
  syncDisclosures();
  wideMQ.addEventListener('change', syncDisclosures);

  /* —— FAQ: abertura/fechamento animados (resposta a ação do usuário) —— */
  $$('.faq-list details').forEach(function (d) {
    var sum = $('summary', d);
    if (!sum) return;
    sum.addEventListener('click', function (e) {
      if (reduceMotion || !d.animate) return;
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = '1';
      var startH = d.offsetHeight;
      var opts = { duration: 280, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
      d.style.overflow = 'hidden';
      if (d.open) {
        d.animate({ height: [startH + 'px', sum.offsetHeight + 2 + 'px'] }, opts).onfinish = function () {
          d.open = false; d.style.overflow = ''; delete d.dataset.busy;
        };
      } else {
        d.open = true;
        d.animate({ height: [startH + 'px', d.scrollHeight + 'px'] }, opts).onfinish = function () {
          d.style.overflow = ''; delete d.dataset.busy;
        };
      }
    });
  });

  /* —— Cabeçalho, scrollspy e CTA fixo: observers (sem leitura de layout por frame) —— */
  var siteHeader = $('.site-header');
  var sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(function (entries) {
    siteHeader.classList.toggle('is-scrolled', !entries[0].isIntersecting);
  }).observe(sentinel);

  var spyLinks = $$('.nav-desktop a, .nav-drawer a[href^="#"]');
  var spyMap = {};
  spyLinks.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    (spyMap[id] = spyMap[id] || []).push(a);
  });
  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      spyLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
      (spyMap[entry.target.id] || []).forEach(function (a) { a.setAttribute('aria-current', 'true'); });
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  Object.keys(spyMap).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spyObserver.observe(el);
  });

  var mobileCta = $('.mobile-cta');
  var mobileMq = window.matchMedia('(max-width: 767px)');
  if (mobileCta) {
    function syncStickyBarHeight() {
      if (!mobileMq.matches) return;
      var h = mobileCta.offsetHeight;
      if (h > 0) document.documentElement.style.setProperty('--sticky-h', h + 'px');
    }
    function setStickyCtaActive() {
      document.body.classList.toggle('has-sticky-cta', mobileMq.matches);
      if (mobileMq.matches) syncStickyBarHeight();
    }
    setStickyCtaActive();
    mobileMq.addEventListener('change', setStickyCtaActive);
    window.addEventListener('resize', syncStickyBarHeight, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncStickyBarHeight);
    }

    var stickyDimKeys = {};
    function updateStickyDimmed() {
      var hide = Object.keys(stickyDimKeys).some(function (k) { return stickyDimKeys[k]; });
      mobileCta.classList.toggle('is-dimmed', hide);
    }
    var stickyDimObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        stickyDimKeys[entry.target.id || entry.target.tagName.toLowerCase()] = entry.isIntersecting;
      });
      updateStickyDimmed();
    }, { threshold: 0.1, rootMargin: '0px 0px -56px 0px' });

    ['pagamento', 'final-cta', 'topo'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) stickyDimObserver.observe(el);
    });
    var footerEl = $('footer');
    if (footerEl) stickyDimObserver.observe(footerEl);
  }

  /* —— Revelação das imagens editoriais (único movimento de scroll) —— */
  var reveals = $$('.reveal-image');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealObs.observe(el); });
  }
})();
