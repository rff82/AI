/* farpa.ai — Landing Page Scripts */

(function () {
  'use strict';

  /* -- Cursor: Restaurado ao padrao do sistema -- */
  /* Cursor personalizado removido para melhor experiencia de usuario */

  /* -- Nav scroll -- */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ── Reveal on scroll ── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Ticker duplicar conteúdo ── */
  const tickerTrack = document.querySelector('.ticker-track');
  if (tickerTrack) {
    const clone = tickerTrack.cloneNode(true);
    tickerTrack.parentElement.appendChild(clone);
  }

  /* ── Animação das barras de progresso (mockup) ── */
  const barFills = document.querySelectorAll('.mockup-bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width || '88%';
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  barFills.forEach(b => barObserver.observe(b));

  /* ── Counter animado nos stats ── */
  function animateCounter(el, target, duration = 1800) {
    let start = 0;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      el.textContent = isDecimal ? current.toFixed(1) + 'x' : Math.floor(current).toLocaleString('pt-BR') + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statNums = document.querySelectorAll('.hero-stat-num[data-count]');
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

  /* ── Formulário de email (Integrado com Cloudflare Worker) ── */
  const form = document.getElementById('waitlist-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');
      const email = input.value;

      if (!email || !email.includes('@')) {
        input.style.borderColor = 'var(--urgente)';
        setTimeout(() => input.style.borderColor = '', 1500);
        return;
      }

      const originalBtnText = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      try {
        const response = await fetch('https://api-leads.rfelipefernandes.workers.dev/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Interessado Farpa', // Nome padrão para waitlist simples
            email: email,
            interest: 'Waitlist'
          }),
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
        console.error('Erro no cadastro:', error);
        btn.textContent = 'Erro. Tente novamente';
        btn.style.background = 'var(--urgente)';
        setTimeout(() => {
          btn.textContent = originalBtnText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  /* ── Smooth scroll nos links de nav ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Highlight ativo no nav ao rolar ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === '#' + entry.target.id
            ? 'var(--off-white)'
            : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => sectionObserver.observe(s));

  /* ── Parallax sutil no hero ── */
  const heroGlow = document.querySelector('.hero-glow');
  const heroGrid = document.querySelector('.hero-grid');
  if (heroGlow && window.innerWidth > 768 && !('ontouchstart' in window)) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (heroGlow)  heroGlow.style.transform  = `translateX(-50%) translateY(${y * 0.15}px)`;
      if (heroGrid)  heroGrid.style.transform  = `translateY(${y * 0.08}px)`;
    }, { passive: true });
  }

})();
