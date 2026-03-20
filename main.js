/* farpa.ai — Landing Page Scripts v1.1
   Fixes: nav scroll (replaced by theme-engine), counter animation,
   waitlist form, hero parallax, reveal observer */

(function () {
  'use strict';

  /* ── Reveal on scroll ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ── Ticker: duplicate content for seamless loop ── */
  const tickerTrack = document.querySelector('.ticker-track');
  if (tickerTrack) {
    const clone = tickerTrack.innerHTML;
    tickerTrack.innerHTML += clone;
  }

  /* ── Animate mockup progress bars ── */
  const barFills = document.querySelectorAll('.mockup-bar-fill');
  if (barFills.length) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width || '88%';
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    barFills.forEach(b => barObserver.observe(b));
  }

  /* ── Counter animation on hero stats ── */
  function animateCounter(el, target, duration) {
    duration = duration || 1800;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;
    const suffix = el.dataset.suffix || '';
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = isDecimal
        ? current.toFixed(1) + 'x'
        : Math.floor(current).toLocaleString('pt-BR') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statNums = document.querySelectorAll('.hero-stat-num[data-count]');
  if (statNums.length) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const val = parseFloat(el.dataset.count);
          animateCounter(el, val);
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => statObserver.observe(el));
  }

  /* ── Waitlist form ── */
  const form = document.getElementById('waitlist-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn   = form.querySelector('button[type="submit"]');
      const email = (input.value || '').trim();

      if (!email || !email.includes('@')) {
        input.style.borderColor = '#ff3b3b';
        setTimeout(() => input.style.borderColor = '', 1500);
        return;
      }

      const originalText = btn.textContent;
      btn.textContent = 'Enviando…';
      btn.disabled = true;

      try {
        const response = await fetch('https://api-leads.rfelipefernandes.workers.dev/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Interessado Farpa', email, interest: 'Waitlist' }),
        });
        const result = await response.json();
        if (response.ok) {
          btn.textContent = '✓ Na lista!';
          btn.style.background = '#0a0a0a';
          btn.style.color = 'var(--farpa)';
          input.value = '';
          input.placeholder = 'Você está na lista de espera!';
        } else {
          throw new Error(result.error || 'Erro ao enviar');
        }
      } catch (error) {
        console.error('Waitlist error:', error);
        btn.textContent = 'Erro. Tente novamente';
        btn.style.background = '#ff3b3b';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const topnavHeight = 54;
        const y = target.getBoundingClientRect().top + window.scrollY - topnavHeight - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ── Parallax on hero (desktop only) ── */
  const heroGlow = document.querySelector('.hero-glow');
  const heroGrid = document.querySelector('.hero-grid');
  if (heroGlow && heroGrid && window.innerWidth > 768 && !('ontouchstart' in window)) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroGlow.style.transform = `translateX(-50%) translateY(${y * 0.15}px)`;
      heroGrid.style.transform = `translateY(${y * 0.08}px)`;
    }, { passive: true });
  }

})();
