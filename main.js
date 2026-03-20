/* farpa.ai — Landing Scripts v1.1 */
(function () {
  'use strict';

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
  }

  /* Ticker duplicate */
  const tt = document.querySelector('.ticker-track');
  if (tt) tt.innerHTML += tt.innerHTML;

  /* Bar fills */
  const bars = document.querySelectorAll('.mockup-bar-fill');
  if (bars.length) {
    const bObs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.style.width = e.target.dataset.width || '88%'; bObs.unobserve(e.target); } }); }, { threshold: 0.3 });
    bars.forEach(b => bObs.observe(b));
  }

  /* Counter animation */
  function animateCounter(el, target, dur) {
    dur = dur || 1800;
    const t0 = performance.now(), suffix = el.dataset.suffix || '', isDecimal = target % 1 !== 0;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3), cur = target * eased;
      el.textContent = isDecimal ? cur.toFixed(1) + 'x' : Math.floor(cur).toLocaleString('pt-BR') + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = isDecimal ? target.toFixed(1) + 'x' : target.toLocaleString('pt-BR') + suffix;
    };
    requestAnimationFrame(step);
  }
  const stats = document.querySelectorAll('.hero-stat-num[data-count]');
  if (stats.length) {
    const sObs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target, parseFloat(e.target.dataset.count)); sObs.unobserve(e.target); } }); }, { threshold: 0.5 });
    stats.forEach(el => sObs.observe(el));
  }

  /* Waitlist form */
  const form = document.getElementById('waitlist-form');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]'), btn = form.querySelector('button[type="submit"]');
      const email = (input.value || '').trim();
      if (!email || !email.includes('@')) { input.style.borderColor = '#ff3b3b'; setTimeout(() => input.style.borderColor = '', 1500); return; }
      const orig = btn.textContent; btn.textContent = 'Enviando…'; btn.disabled = true;
      try {
        const res = await fetch('https://api-leads.rfelipefernandes.workers.dev/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:'Interessado Farpa',email,interest:'Waitlist'}) });
        const result = await res.json();
        if (res.ok) { btn.textContent = '✓ Na lista!'; btn.style.background = '#0a0a0a'; btn.style.color = 'var(--farpa, #00ff88)'; input.value = ''; input.placeholder = 'Você está na lista de espera!'; }
        else throw new Error(result.error || 'Erro');
      } catch (err) {
        btn.textContent = 'Erro. Tente novamente'; btn.style.background = '#ff3b3b';
        setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
      }
    });
  }

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1), target = document.getElementById(id);
      if (target) { e.preventDefault(); const y = target.getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({top: y, behavior: 'smooth'}); }
    });
  });

  /* Parallax hero */
  const glow = document.querySelector('.hero-glow'), grid = document.querySelector('.hero-grid');
  if (glow && grid && window.innerWidth > 768 && !('ontouchstart' in window)) {
    window.addEventListener('scroll', () => { const y = window.scrollY; if (glow) glow.style.transform = `translateX(-50%) translateY(${y * 0.15}px)`; if (grid) grid.style.transform = `translateY(${y * 0.08}px)`; }, {passive:true});
  }
})();
