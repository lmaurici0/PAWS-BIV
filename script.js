(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* cabeçalho, barra de progresso e item de menu ativo */
  var hdr = $('#hdr'), prog = $('#progress');
  var links = $$('.menu a[href^="#"]:not(.btn)');
  var secs = links.map(function (a) { return $(a.getAttribute('href')); });
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
      hdr.classList.toggle('solid', y > 24);
      prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
      var cur = -1;
      secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= 120) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu mobile */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* revelar elementos ao rolar */
  var rev = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('in'); });

  /* contadores */
  var nf = new Intl.NumberFormat('pt-BR');
  function count(el) {
    var end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + nf.format(end) + suf; return; }
    var t0 = null, dur = 1800;
    (function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + nf.format(Math.round(end * e)) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  var nums = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io2.observe(n); });
  } else nums.forEach(count);

  /* formulário: apenas validação local, nada é enviado */
  var form = $('#form'), msg = $('#msg');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      $$('input,textarea', form).forEach(function (f) {
        var v = f.value.trim(), bad = !v || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
        f.classList.toggle('bad', bad);
        f.setAttribute('aria-invalid', bad);
        if (bad) { ok = false; if (!first) first = f; }
      });
      msg.className = 'msg ' + (ok ? 'ok' : 'err');
      msg.textContent = ok ? 'Mensagem registrada. Esta é uma demonstração: nenhum dado foi enviado.' : 'Preencha todos os campos corretamente.';
      if (ok) form.reset(); else first.focus();
    });
  }
})();
