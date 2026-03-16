/* farpa.ai — Theme Engine v1.0
   Auto-detect sistema · Persiste localStorage · Troca sem reload */

(function () {
  'use strict';

  // ── Constantes ──────────────────────────────────────────
  const STORAGE_KEY = 'farpa_theme';
  const THEMES = {
    void:     { name: 'Void',     feel: 'Foco · Escuro',    swatch: 'tp-void' },
    ivory:    { name: 'Ivory',    feel: 'Leitura · Claro',  swatch: 'tp-ivory' },
    midnight: { name: 'Midnight', feel: 'Tech · Azul',      swatch: 'tp-midnight' }
  };

  // ── Detectar tema inicial ───────────────────────────────
  function detectInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) return saved;
    // Respeitar preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'ivory';
    return 'void'; // dark padrão
  }

  // ── Aplicar tema ────────────────────────────────────────
  function applyTheme(theme, animate) {
    if (!THEMES[theme]) return;
    const html = document.documentElement;
    if (animate) {
      html.style.transition = 'background 0.35s ease, color 0.35s ease';
      setTimeout(() => { html.style.transition = ''; }, 400);
    }
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    // Atualizar indicadores visuais
    updateThemeUI(theme);
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('farpaThemeChange', { detail: { theme } }));
  }

  function updateThemeUI(theme) {
    // Seletor na nav
    document.querySelectorAll('.tp-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
    // Dots na sidebar
    document.querySelectorAll('.sb-theme-dot').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
    // Ícone da paleta — cor de acento muda conforme tema
    const paletteBtn = document.getElementById('theme-palette-btn');
    if (paletteBtn) {
      const colors = { void: '#00ff88', ivory: '#2d6a1e', midnight: '#6eb5ff' };
      paletteBtn.style.borderColor = colors[theme] || '';
    }
  }

  // ── Picker de tema ──────────────────────────────────────
  function buildThemePicker(container) {
    const picker = document.createElement('div');
    picker.className = 'theme-picker';
    picker.id = 'theme-picker';
    picker.innerHTML = `
      <div class="theme-picker-label">Aparência</div>
      ${Object.entries(THEMES).map(([key, t]) => `
        <div class="tp-option" data-theme="${key}" onclick="window.farpaTheme.set('${key}')">
          <div class="tp-swatch tp-${key}"></div>
          <div>
            <div class="tp-name">${t.name}</div>
            <div class="tp-feel">${t.feel}</div>
          </div>
          <span class="tp-check" style="display:none">✓</span>
        </div>`).join('')}
    `;
    container.appendChild(picker);
    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) picker.classList.remove('open');
    });
    return picker;
  }

  function togglePicker() {
    const picker = document.getElementById('theme-picker');
    if (picker) picker.classList.toggle('open');
  }

  // ── Sidebar 220px ───────────────────────────────────────
  function buildSidebar(activePage) {
    const sidebar = document.createElement('aside');
    sidebar.className = 'farpa-sidebar';
    sidebar.id = 'farpa-sidebar';

    const navItems = [
      { href: 'index.html',       icon: iconHome,       label: 'Início',     id: 'home',       badge: '' },
      { href: 'biblioteca.html',  icon: iconLib,        label: 'Biblioteca', id: 'biblioteca', badge: '8 módulos' },
      { href: 'mercados.html',    icon: iconChart,      label: 'Mercados',   id: 'mercados',   live: true },
      { href: 'labs.html',        icon: iconLabs,       label: 'Labs',       id: 'labs',       badge: 'Novo' },
    ];

    sidebar.innerHTML = `
      <a class="sb-logo" href="index.html">
        ${iconFarpa}
        <span class="sb-logo-name">farpa<span class="ai">.ai</span></span>
      </a>

      <div class="sb-section">
        <div class="sb-section-label">Navegar</div>
        ${navItems.map(item => `
          <a href="${item.href}" class="sb-item ${activePage === item.id ? 'active' : ''}">
            ${item.icon}
            <span class="sb-item-text">${item.label}</span>
            ${item.live ? '<span class="sb-live"></span>' : ''}
            ${item.badge ? `<span class="sb-badge">${item.badge}</span>` : ''}
          </a>`).join('')}
      </div>

      <div class="sb-divider"></div>

      <div class="sb-section">
        <div class="sb-section-label">Biblioteca</div>
        <a href="biblioteca.html#module-1" class="sb-item">
          ${iconDot}
          <span class="sb-item-text">Fundamentos de IA</span>
        </a>
        <a href="biblioteca.html#module-2" class="sb-item">
          ${iconDot}
          <span class="sb-item-text">LLMs e Prompts</span>
        </a>
        <a href="biblioteca.html#module-3" class="sb-item">
          ${iconDot}
          <span class="sb-item-text">Fine-tuning e RAG</span>
        </a>
        <a href="biblioteca.html#module-4" class="sb-item">
          ${iconDot}
          <span class="sb-item-text">Ética em IA</span>
        </a>
        <a href="biblioteca.html" class="sb-item" style="color:var(--accent);font-size:12px;">
          ${iconDot}
          <span class="sb-item-text">Ver todos os módulos →</span>
        </a>
      </div>

      <div class="sb-footer">
        <a href="pro.html" class="sb-pro-btn">
          ${iconStar}
          <span>Plano Pro</span>
        </a>
        <div class="sb-theme-row">
          <span class="sb-theme-label">Tema</span>
          <div class="sb-theme-dots">
            <div class="sb-theme-dot sb-dot-void" data-theme="void" onclick="window.farpaTheme.set('void')" title="Void (escuro)"></div>
            <div class="sb-theme-dot sb-dot-ivory" data-theme="ivory" onclick="window.farpaTheme.set('ivory')" title="Ivory (claro)"></div>
            <div class="sb-theme-dot sb-dot-midnight" data-theme="midnight" onclick="window.farpaTheme.set('midnight')" title="Midnight (azul)"></div>
          </div>
        </div>
      </div>
    `;
    return sidebar;
  }

  // ── Topnav ──────────────────────────────────────────────
  function buildTopnav(breadcrumb) {
    const nav = document.createElement('header');
    nav.className = 'farpa-topnav';
    nav.id = 'farpa-topnav';

    const bc = breadcrumb || [{ label: 'Início', href: 'index.html' }];
    const bcHtml = bc.map((b, i) =>
      i < bc.length - 1
        ? `<a href="${b.href}">${b.label}</a><span class="sep">/</span>`
        : `<span class="current">${b.label}</span>`
    ).join('');

    nav.innerHTML = `
      <div class="nav-breadcrumb">${bcHtml}</div>

      <button class="nav-hamburger" id="nav-hamburger" aria-label="Abrir menu" title="Menu" onclick="(function(){const sb=document.getElementById('farpa-sidebar');if(sb){sb.classList.toggle('open');}})()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <div class="nav-right">
        <button class="nav-search-btn" onclick="window.farpaSearch.open()" title="Buscar (Ctrl+K)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span class="search-text">Buscar</span>
          <span class="nav-search-kbd">Ctrl K</span>
        </button>
        <div class="nav-lang">
          <button class="lang-btn" onclick="window.farpaI18n.set('pt')" title="Português" id="lang-pt">🇧🇷</button>
          <button class="lang-btn" onclick="window.farpaI18n.set('en')" title="English"   id="lang-en">🇺🇸</button>
          <button class="lang-btn" onclick="window.farpaI18n.set('zh')" title="中文"      id="lang-zh">🇨🇳</button>
          <button class="lang-btn" onclick="window.farpaI18n.set('de')" title="Deutsch"   id="lang-de">🇩🇪</button>
        </div>
        <div style="position:relative;">
          <button class="nav-theme-btn" id="theme-palette-btn" onclick="window.farpaTheme.toggle()" title="Mudar tema" aria-label="Selecionar tema">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a10 10 0 0 1 0 20"/>
              <path d="M12 2C6.5 2 2 6.5 2 12"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <a href="pro.html" class="nav-pro">⭐ Pro</a>
      </div>
    `;

    // Injetar theme picker dentro do botão de tema
    setTimeout(() => {
      const btn = document.getElementById('theme-palette-btn');
      if (btn && btn.parentElement) buildThemePicker(btn.parentElement);
    }, 0);

    return nav;
  }

  // ── Busca global ────────────────────────────────────────
  const SEARCH_INDEX = [
    { title: 'Biblioteca de IA Generativa', cat: 'Biblioteca', icon: '📚', url: 'biblioteca.html' },
    { title: 'Fundamentos de IA — Da origem aos LLMs', cat: 'Módulo 1', icon: '🧠', url: 'biblioteca.html#module-1' },
    { title: 'Como os LLMs Pensam — Embeddings e Prompts', cat: 'Módulo 2', icon: '⚙️', url: 'biblioteca.html#module-2' },
    { title: 'Personalização e Recuperação — Fine-tuning e RAG', cat: 'Módulo 3', icon: '🔧', url: 'biblioteca.html#module-3' },
    { title: 'IA Responsável — Viés, Riscos e Governança', cat: 'Módulo 4', icon: '⚖️', url: 'biblioteca.html#module-4' },
    { title: 'Agentes e Memória — Sistemas LLM Avançados', cat: 'Módulo 5', icon: '🤖', url: 'biblioteca.html#module-5' },
    { title: 'LLMs como Plataformas — LangChain e MemGPT', cat: 'Módulo 6', icon: '🔗', url: 'biblioteca.html#module-6' },
    { title: 'Engenharia de LLMs — Vetores e ReAct', cat: 'Módulo 7', icon: '📐', url: 'biblioteca.html#module-7' },
    { title: 'Ecossistema e Estratégia de IA', cat: 'Módulo 8', icon: '🌐', url: 'biblioteca.html#module-8' },
    { title: 'Dashboard de Mercados ao vivo', cat: 'Mercados', icon: '📈', url: 'mercados.html' },
    { title: 'B3 — Ações brasileiras ao vivo', cat: 'Mercados · B3', icon: '🇧🇷', url: 'mercados.html' },
    { title: 'NYSE / Nasdaq — Ações americanas', cat: 'Mercados · EUA', icon: '🇺🇸', url: 'mercados.html' },
    { title: 'Criptomoedas — BTC, ETH, SOL', cat: 'Mercados · Cripto', icon: '₿', url: 'mercados.html' },
    { title: 'Farpa Labs — Demos interativos', cat: 'Labs', icon: '⚗️', url: 'labs.html' },
    { title: 'Analisador de Sentimento de Notícias', cat: 'Labs · Demo', icon: '🎯', url: 'labs.html' },
    { title: 'Gerador de Headlines em 4 tons', cat: 'Labs · Demo', icon: '✍️', url: 'labs.html' },
    { title: 'Resumidor Inteligente com keywords', cat: 'Labs · Demo', icon: '📋', url: 'labs.html' },
    { title: 'Detector de Viés Linguístico', cat: 'Labs · Demo', icon: '🔍', url: 'labs.html' },
    { title: 'Plano Pro — análises e biblioteca completa', cat: 'Pro', icon: '⭐', url: 'pro.html' },
    { title: 'LLM · Large Language Model', cat: 'Glossário', icon: '📖', url: 'biblioteca.html' },
    { title: 'RAG · Geração Aumentada por Recuperação', cat: 'Glossário', icon: '📖', url: 'biblioteca.html' },
    { title: 'Embeddings · Representações vetoriais', cat: 'Glossário', icon: '📖', url: 'biblioteca.html' },
    { title: 'Fine-tuning · Ajuste fino de modelos', cat: 'Glossário', icon: '📖', url: 'biblioteca.html' },
    { title: 'Transformer Architecture', cat: 'Glossário', icon: '📖', url: 'biblioteca.html' },
  ];

  function buildSearchModal() {
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'farpa-search';
    overlay.innerHTML = `
      <div class="search-box">
        <div class="search-top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="farpa-search-input" type="text" placeholder="Buscar módulos, demos, mercados, termos..." oninput="window.farpaSearch.query(this.value)">
          <span class="search-esc" onclick="window.farpaSearch.close()">ESC</span>
        </div>
        <div class="search-results" id="farpa-search-results"></div>
        <div class="search-footer">
          <span>↑↓ navegar</span>
          <span>↵ acessar</span>
          <span>ESC fechar</span>
        </div>
      </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) window.farpaSearch.close(); });
    document.body.appendChild(overlay);
  }

  function renderSearchResults(items, label) {
    const container = document.getElementById('farpa-search-results');
    if (!container) return;
    const html = (label ? `<div class="search-hint-label">${label}</div>` : '') +
      items.map(r => `<a href="${r.url}" class="search-result" onclick="window.farpaSearch.close()">
        <div class="sr-icon">${r.icon}</div>
        <div><div class="sr-title">${r.title}</div><div class="sr-cat">${r.cat}</div></div>
      </a>`).join('');
    container.innerHTML = html || '<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px;">Nenhum resultado encontrado</div>';
  }

  // ── SVG Icons ───────────────────────────────────────────
  const svgAttr = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"';
  const iconHome   = `<svg class="sb-icon" ${svgAttr}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const iconLib    = `<svg class="sb-icon" ${svgAttr}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
  const iconChart  = `<svg class="sb-icon" ${svgAttr}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`;
  const iconLabs   = `<svg class="sb-icon" ${svgAttr}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`;
  const iconStar   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const iconDot    = `<svg class="sb-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`;
  const iconFarpa  = `<svg class="sb-logo-icon" viewBox="0 0 56 56" fill="none"><polygon points="28,4 44,18 36,28 48,44 28,52 8,44 20,28 12,18" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/><polygon points="28,12 38,22 32,28 40,40 28,46 16,40 24,28 18,22" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="0.8" stroke-linejoin="round"/><circle cx="28" cy="28" r="2.5" fill="var(--accent)"/></svg>`;

  // ── Init ─────────────────────────────────────────────────
  function init() {
    // Aplicar tema ANTES do render para evitar flash
    const theme = detectInitialTheme();
    document.documentElement.setAttribute('data-theme', theme);

    document.addEventListener('DOMContentLoaded', () => {
      // Construir busca global
      buildSearchModal();
      // Atualizar UI do tema
      updateThemeUI(theme);
      // Lang ativo
      const savedLang = localStorage.getItem('farpa_lang') || 'pt';
      document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.id === `lang-${savedLang}`);
      });
      // Keyboard shortcuts
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); window.farpaSearch.open(); }
        if (e.key === 'Escape') window.farpaSearch.close();
      });
    });
  }

  // ── API pública ─────────────────────────────────────────
  window.farpaTheme = {
    set: (theme) => applyTheme(theme, true),
    toggle: togglePicker,
    current: () => document.documentElement.getAttribute('data-theme') || 'void',
  };

  window.farpaSearch = {
    open: () => {
      const overlay = document.getElementById('farpa-search');
      if (!overlay) return;
      overlay.classList.add('open');
      renderSearchResults(SEARCH_INDEX.slice(0, 7), 'Sugestões');
      setTimeout(() => document.getElementById('farpa-search-input')?.focus(), 80);
    },
    close: () => {
      const overlay = document.getElementById('farpa-search');
      if (overlay) { overlay.classList.remove('open'); }
      const input = document.getElementById('farpa-search-input');
      if (input) input.value = '';
    },
    query: (q) => {
      if (!q.trim()) { renderSearchResults(SEARCH_INDEX.slice(0, 7), 'Sugestões'); return; }
      const matches = SEARCH_INDEX.filter(r =>
        r.title.toLowerCase().includes(q.toLowerCase()) ||
        r.cat.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 9);
      renderSearchResults(matches, matches.length ? `${matches.length} resultado${matches.length > 1 ? 's' : ''}` : '');
    },
  };

  window.farpaSidebar = { build: buildSidebar };
  window.farpaTopnav  = { build: buildTopnav };

  // Aplicar tema imediatamente (antes do DOMContentLoaded)
  init();
})();

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e){try{const sb=document.getElementById('farpa-sidebar');const hb=document.getElementById('nav-hamburger');if(!sb) return; if(window.innerWidth>900) return; if(sb.classList.contains('open')){ const inside = sb.contains(e.target) || (hb && hb.contains(e.target)); if(!inside) sb.classList.remove('open'); }}catch(e){ } }, {passive:true});
