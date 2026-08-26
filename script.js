(function () {
  'use strict';

  // Scroll progress bar + active nav
  var progressBar = document.getElementById('progressBar');
  var navButtons = Array.prototype.slice.call(document.querySelectorAll('.site-nav button'));
  var navMap = navButtons.map(function (btn) {
    return { btn: btn, el: document.getElementById(btn.dataset.target) };
  });
  var backToTop = document.getElementById('backToTop');

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var progress = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    progressBar.style.width = progress + '%';
    backToTop.classList.toggle('visible', progress > 3);

    var active = null;
    navMap.forEach(function (entry) {
      if (entry.el && entry.el.getBoundingClientRect().top < 140) active = entry.btn;
    });
    navButtons.forEach(function (btn) { btn.classList.toggle('active', btn === active); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { scrollToId(btn.dataset.target); });
  });
  document.getElementById('navCta').addEventListener('click', function () {
    scrollToId('waitlist-form');
  });
  document.querySelectorAll('.js-scroll-to-form').forEach(function (el) {
    el.addEventListener('click', function () { scrollToId('waitlist-form'); });
  });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Reveal on scroll (decorative only — content is always visible/opacity:1)
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal-id]'));
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(function (el) { observer.observe(el); });
  // Safety net: never leave content stuck without its final position.
  setTimeout(function () {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }, 1400);

  // Disponibilidade toggle
  var toggleButtons = Array.prototype.slice.call(document.querySelectorAll('.toggle-option'));
  var dispoInput = document.getElementById('f-disponibilidade');
  toggleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleButtons.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      dispoInput.value = btn.dataset.value;
    });
  });

  // Form validation + submission
  var form = document.getElementById('waitlistForm');
  var confirmCard = document.getElementById('confirmCard');
  var confirmTitle = document.getElementById('confirmTitle');
  var formError = document.getElementById('formError');

  // Placeholder submit handler: stores the lead locally and logs it.
  // TODO: swap this for the real destination (planilha, CRM, e-mail marketing) once defined.
  function submitLead(data) {
    try {
      var key = 'agirWaitlistLeads';
      var existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(Object.assign({ submittedAt: new Date().toISOString() }, data));
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      // localStorage unavailable (e.g. private mode) — non-fatal, lead still logged below.
    }
    console.log('[AGIR waitlist] novo lead:', data);
    return Promise.resolve();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      nome: form.nome.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      email: form.email.value.trim(),
      tempo: form.tempo.value,
      faturamento: form.faturamento.value,
      desafio: form.desafio.value,
      disponibilidade: dispoInput.value
    };

    var missing = Object.keys(data).some(function (key) { return !data[key]; });
    if (missing) {
      formError.textContent = 'Preencha todos os campos para entrar na lista.';
      formError.hidden = false;
      return;
    }
    formError.hidden = true;

    submitLead(data).then(function () {
      var firstName = data.nome.split(' ')[0] || 'você';
      confirmTitle.textContent = 'Você está na lista, ' + firstName + '!';
      form.hidden = true;
      confirmCard.hidden = false;
    });
  });
})();
