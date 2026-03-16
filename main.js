/* farpa.ai — Landing Page Scripts */

(function () {
  'use strict';

  /* ── Cursor personalizado ── */
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  // Desabilitar cursor em dispositivos touch
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  if (cursor && cursorRing && window.innerWidth > 768 && !isTouch) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverEls = document.querySelectorAll('a, button, .feature-card, .plan-card, .category-card, .mockup-card');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  } else if (cursor) {
    cursor.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
  }

  /* ── Nav scroll ── */
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
  if (tickerTrack && !tickerTrack.dataset.duplicated) {
    const clone = tickerTrack.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    tickerTrack.parentElement.appendChild(clone);
    tickerTrack.dataset.duplicated = '1';
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

  /* ── Formulário de email ── */
  const form = document.getElementById('waitlist-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');
      if (!input.value || !input.value.includes('@')) {
        input.style.borderColor = 'var(--urgente)';
        setTimeout(() => input.style.borderColor = '', 1500);
        return;
      }
      btn.textContent = '✓ Na lista!';
      btn.style.background = '#0a0a0a';
      btn.style.color = 'var(--farpa)';
      input.value = '';
      input.placeholder = 'Você está na lista de espera!';
      setTimeout(() => {
        btn.textContent = 'Entrar';
        btn.style.background = '';
        btn.style.color = '';
        input.placeholder = 'seu@email.com';
      }, 5000);
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
  if (heroGlow && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (heroGlow)  heroGlow.style.transform  = `translateX(-50%) translateY(${y * 0.15}px)`;
      if (heroGrid)  heroGrid.style.transform  = `translateY(${y * 0.08}px)`;
    }, { passive: true });
  }

})();
