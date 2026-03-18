/* farpa.ai — Theme Engine v0.11
   Auto-detect sistema · Persiste localStorage · Troca sem reload
   v0.11 — 2026-03-18: bugfixes sidebar HTML, contraste, micro-interações */

(function () {
  'use strict';

  const STORAGE_KEY = 'farpa_theme';
  const THEMES = {
    void:     { name: 'Void',     feel: 'Foco · Escuro',    swatch: 'tp-void' },
    ivory:    { name: 'Ivory',    feel: 'Leitura · Claro',  swatch: 'tp-ivory' },
    midnight: { name: 'Midnight', feel: 'Tech · Azul',      swatch: 'tp-midnight' }
  };

  function detectInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) return saved;
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'ivory';
    return 'void';
  }

  function applyTheme(theme, animate) {
    if (!THEMES[theme]) return;
    const html = document.documentElement;
    if (animate) {
      html.style.transition = 'background 0.35s ease, color 0.35s ease';
      setTimeout(() => { html.style.transition = ''; }, 400);
    }
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateThemeUI(theme);
    window.dispatchEvent(new CustomEvent('farpaThemeChange', { detail: { theme } }));
  }

  function updateThemeUI(theme) {
    document.querySelectorAll('.tp-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
    document.querySelectorAll('.sb-theme-dot').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
    const paletteBtn = document.getElementById('theme-palette-btn');
    if (paletteBtn) {
      const colors = { void: '#00ff88', ivory: '#2d6a1e', midnight: '#6eb5ff' };
      paletteBtn.style.borderColor = colors[theme] || '';
    }
  }

  function buildThemePicker(container) {
    const picker = document.createElement('div');
    picker.className = 'theme-picker';
    picker.id = 'theme-picker';
    picker.innerHTML =
      '<div class="theme-picker-label">Aparência</div>' +
      Object.entries(THEMES).map(function(entry) {
        var key = entry[0]; var t = entry[1];
        return '<div class="tp-option" data-theme="' + key + '" onclick="window.farpaTheme.set(\'' + key + '\')">' +
          '<div class="tp-swatch tp-' + key + '"></div>' +
          '<div><div class="tp-name">' + t.name + '</div><div class="tp-feel">' + t.feel + '</div></div>' +
          '<span class="tp-check" style="display:none">✓</span>' +
          '</div>';
      }).join('');
    container.appendChild(picker);
    document.addEventListener('click', function(e) {
      if (!container.contains(e.target)) picker.classList.remove('open');
    });
    return picker;
  }

  function togglePicker() {
    var picker = document.getElementById('theme-picker');
    if (picker) picker.classList.toggle('open');
  }

  /* ── Sidebar ── */
  function buildSidebar(activePage) {
    var sidebar = document.createElement('aside');
    sidebar.className = 'farpa-sidebar';
    sidebar.id = 'farpa-sidebar';

    var navItems = [
      { href: 'index.html',      icon: iconHome,  label: 'Início',     id: 'home',       badge: '',          live: false },
      { href: 'biblioteca.html', icon: iconLib,   label: 'Biblioteca', id: 'biblioteca', badge: '8 módulos', live: false },
      { href: 'mercados.html',   icon: iconChart, label: 'Mercados',   id: 'mercados',   badge: '',          live: true  },
      { href: 'labs.html',       icon: iconLabs,  label: 'Labs',       id: 'labs',       badge: 'Novo',      live: false },
    ];

    var subItems = [
      { href: 'biblioteca.html#module-1', label: 'Fundamentos de IA' },
      { href: 'biblioteca.html#module-2', label: 'LLMs e Prompts' },
      { href: 'biblioteca.html#module-3', label: 'Fine-tuning e RAG' },
      { href: 'biblioteca.html#module-4', label: 'Ética em IA' },
    ];

    var mainNav = navItems.map(function(item) {
      var isActive = activePage === item.id;
      return '<a href="' + item.href + '" class="sb-item' + (isActive ? ' active' : '') + '" data-tooltip="' + item.label + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
        item.icon +
        '<span class="sb-item-text">' + item.label + '</span>' +
        (item.live ? '<span class="sb-live"></span>' : '') +
        (item.badge ? '<span class="sb-badge">' + item.badge + '</span>' : '') +
        '</a>';
    }).join('');

    var subNav = subItems.map(function(item) {
      return '<a href="' + item.href + '" class="sb-item sb-item-sub" data-tooltip="' + item.label + '">' +
        iconDot +
        '<span class="sb-item-text">' + item.label + '</span>' +
        '</a>';
    }).join('');

    sidebar.innerHTML =
      '<a class="sb-logo" href="index.html">' +
        iconFarpa +
        '<span class="sb-logo-name">farpa<span class="ai">.ai</span></span>' +
      '</a>' +
      '<div class="sb-section">' +
        '<div class="sb-section-label">Navegar</div>' +
        mainNav +
      '</div>' +
      '<div class="sb-divider"></div>' +
      '<div class="sb-section">' +
        '<div class="sb-section-label">Biblioteca</div>' +
        subNav +
        '<a href="biblioteca.html" class="sb-item sb-item-sub" data-tooltip="Ver todos os módulos" style="color:var(--accent);">' +
          iconDot +
          '<span class="sb-item-text">Ver todos os módulos →</span>' +
        '</a>' +
      '</div>' +
      '<div class="sb-footer">' +
        '<a href="pro.html" class="sb-pro-btn">' +
          iconStar +
          '<span>Plano Pro</span>' +
        '</a>' +
        '<div class="sb-theme-row">' +
          '<span class="sb-theme-label">Tema</span>' +
          '<div class="sb-theme-dots">' +
            '<button class="sb-theme-dot sb-dot-void"     data-theme="void"     onclick="window.farpaTheme.set(\'void\')"     title="Void (escuro)"></button>' +
            '<button class="sb-theme-dot sb-dot-ivory"    data-theme="ivory"    onclick="window.farpaTheme.set(\'ivory\')"    title="Ivory (claro)"></button>' +
            '<button class="sb-theme-dot sb-dot-midnight" data-theme="midnight" onclick="window.farpaTheme.set(\'midnight\')" title="Midnight (azul)"></button>' +
          '</div>' +
        '</div>' +
        '<div class="sb-version">v0.11 · ' + new Date().toLocaleDateString('pt-BR', {month:'short', year:'numeric'}) + '</div>' +
      '</div>';

    return sidebar;
  }

  /* ── Topnav ── */
  function buildTopnav(breadcrumb) {
    var nav = document.createElement('header');
    nav.className = 'farpa-topnav';
    nav.id = 'farpa-topnav';

    var bc = breadcrumb || [{ label: 'Início', href: 'index.html' }];
    var bcHtml = bc.map(function(b, i) {
      return i < bc.length - 1
        ? '<a href="' + b.href + '" class="bc-link">' + b.label + '</a><span class="sep">/</span>'
        : '<span class="current">' + b.label + '</span>';
    }).join('');

    nav.innerHTML =
      '<button class="nav-hamburger" id="nav-hamburger" aria-label="Abrir menu" title="Menu" onclick="(function(){var sb=document.getElementById(\'farpa-sidebar\');if(sb){sb.classList.toggle(\'open\');}})()">'+
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'+
      '</button>'+

      '<button class="nav-collapse-btn" id="nav-collapse-btn" aria-pressed="false" aria-label="Recolher menu lateral" title="Recolher/Expandir menu">'+
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">'+
          '<rect x="3" y="3" width="7" height="18" rx="1.5" stroke-width="1.6"/>'+
          '<path d="M14 9l-3 3 3 3"/>'+
        '</svg>'+
      '</button>'+

      '<nav class="nav-breadcrumb" aria-label="Localização atual">' + bcHtml + '</nav>'+

      '<div class="nav-right">'+
        '<button class="nav-search-btn" onclick="window.farpaSearch.open()" title="Buscar (Ctrl+K)" aria-label="Abrir busca">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'+
          '<span class="search-text">Buscar</span>'+
          '<span class="nav-search-kbd" aria-hidden="true">Ctrl K</span>'+
        '</button>'+
        '<div class="nav-lang">'+
          '<button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set(\'pt\')" title="Português" id="lang-pt">🇧🇷</button>'+
          '<button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set(\'en\')" title="English"   id="lang-en">🇺🇸</button>'+
          '<button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set(\'zh\')" title="中文"      id="lang-zh">🇨🇳</button>'+
          '<button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set(\'de\')" title="Deutsch"   id="lang-de">🇩🇪</button>'+
        '</div>'+
        '<div style="position:relative;">'+
          '<button class="nav-theme-btn" id="theme-palette-btn" onclick="window.farpaTheme.toggle()" title="Mudar tema" aria-label="Selecionar tema">'+
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2C6.5 2 2 6.5 2 12"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>'+
          '</button>'+
        '</div>'+
        '<a href="pro.html" class="nav-pro">⭐ Pro</a>'+
      '</div>';

    setTimeout(function() {
      var btn = document.getElementById('theme-palette-btn');
      if (btn && btn.parentElement) buildThemePicker(btn.parentElement);
    }, 0);

    return nav;
  }

  /* ── Search modal ── */
  var SEARCH_INDEX = [
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
    var overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'farpa-search';
    overlay.innerHTML =
      '<div class="search-box">'+
        '<div class="search-top">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'+
          '<input id="farpa-search-input" type="text" autocomplete="off" spellcheck="false" placeholder="Buscar módulos, demos, mercados, termos..." oninput="window.farpaSearch.query(this.value)">'+
          '<span class="search-esc" onclick="window.farpaSearch.close()">ESC</span>'+
        '</div>'+
        '<div class="search-results" id="farpa-search-results"></div>'+
        '<div class="search-footer"><span>↑↓ navegar</span><span>↵ acessar</span><span>ESC fechar</span></div>'+
      '</div>';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) window.farpaSearch.close();
    });
    document.body.appendChild(overlay);
  }

  function renderSearchResults(items, label) {
    var container = document.getElementById('farpa-search-results');
    if (!container) return;
    var html = (label ? '<div class="search-hint-label">' + label + '</div>' : '') +
      items.map(function(r) {
        return '<a href="' + r.url + '" class="search-result" onclick="window.farpaSearch.close()">' +
          '<div class="sr-icon">' + r.icon + '</div>' +
          '<div><div class="sr-title">' + r.title + '</div><div class="sr-cat">' + r.cat + '</div></div>' +
          '</a>';
      }).join('');
    container.innerHTML = html || '<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px;">Nenhum resultado encontrado</div>';
  }

  /* ── SVG Icons ── */
  var svgAttr = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"';
  var iconHome  = '<svg class="sb-icon" ' + svgAttr + '><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  var iconLib   = '<svg class="sb-icon" ' + svgAttr + '><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
  var iconChart = '<svg class="sb-icon" ' + svgAttr + '><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
  var iconLabs  = '<svg class="sb-icon" ' + svgAttr + '><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>';
  var iconStar  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  var iconDot   = '<svg class="sb-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>';
  var iconFarpa = '<svg class="sb-logo-icon" viewBox="0 0 56 56" fill="none" aria-hidden="true"><polygon points="28,4 44,18 36,28 48,44 28,52 8,44 20,28 12,18" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/><polygon points="28,12 38,22 32,28 40,40 28,46 16,40 24,28 18,22" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="0.8" stroke-linejoin="round"/><circle cx="28" cy="28" r="2.5" fill="var(--accent)"/></svg>';

  /* ── Init ── */
  function init() {
    var theme = detectInitialTheme();
    document.documentElement.setAttribute('data-theme', theme);

    document.addEventListener('DOMContentLoaded', function() {
      buildSearchModal();
      updateThemeUI(theme);
      var savedLang = localStorage.getItem('farpa_lang') || 'pt';
      document.querySelectorAll('.lang-btn').forEach(function(b) {
        b.classList.toggle('active', b.id === 'lang-' + savedLang);
      });
      document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); window.farpaSearch.open(); }
        if (e.key === 'Escape') window.farpaSearch.close();
      });
    });
  }

  /* ── Public API ── */
  window.farpaTheme = {
    set: function(theme) { applyTheme(theme, true); },
    toggle: togglePicker,
    current: function() { return document.documentElement.getAttribute('data-theme') || 'void'; },
  };

  window.farpaSearch = {
    open: function() {
      var overlay = document.getElementById('farpa-search');
      if (!overlay) return;
      overlay.classList.add('open');
      renderSearchResults(SEARCH_INDEX.slice(0, 7), 'Sugestões');
      setTimeout(function() {
        var inp = document.getElementById('farpa-search-input');
        if (inp) inp.focus();
      }, 80);
    },
    close: function() {
      var overlay = document.getElementById('farpa-search');
      if (overlay) overlay.classList.remove('open');
      var input = document.getElementById('farpa-search-input');
      if (input) input.value = '';
    },
    query: function(q) {
      if (!q.trim()) { renderSearchResults(SEARCH_INDEX.slice(0, 7), 'Sugestões'); return; }
      var matches = SEARCH_INDEX.filter(function(r) {
        return r.title.toLowerCase().indexOf(q.toLowerCase()) !== -1 ||
               r.cat.toLowerCase().indexOf(q.toLowerCase()) !== -1;
      }).slice(0, 9);
      renderSearchResults(matches, matches.length ? matches.length + ' resultado' + (matches.length > 1 ? 's' : '') : '');
    },
  };

  window.farpaSidebar = { build: buildSidebar };
  window.farpaTopnav  = { build: buildTopnav };

  init();
})();

/* ── Close sidebar on outside tap (mobile) ─────────────── */
document.addEventListener('click', function(e) {
  try {
    var sb = document.getElementById('farpa-sidebar');
    var hb = document.getElementById('nav-hamburger');
    if (!sb || window.innerWidth > 900) return;
    if (sb.classList.contains('open')) {
      var inside = sb.contains(e.target) || (hb && hb.contains(e.target));
      if (!inside) sb.classList.remove('open');
    }
  } catch(err) {}
}, { passive: true });

/* ── Sidebar collapse ───────────────────────────────────── */
function applySidebarCollapsedState() {
  try {
    var sb = document.getElementById('farpa-sidebar');
    if (!sb) return;
    var collapsed = localStorage.getItem('farpa_sidebar_collapsed') === '1';
    sb.classList.toggle('collapsed', collapsed);
    var btn = document.getElementById('nav-collapse-btn');
    if (btn) btn.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
  } catch(err) {}
}

function toggleSidebarCollapsed() {
  try {
    var sb = document.getElementById('farpa-sidebar');
    if (!sb) return;
    var isCollapsed = sb.classList.toggle('collapsed');
    localStorage.setItem('farpa_sidebar_collapsed', isCollapsed ? '1' : '0');
    var btn = document.getElementById('nav-collapse-btn');
    if (btn) btn.setAttribute('aria-pressed', isCollapsed ? 'true' : 'false');
  } catch(err) {}
}

document.addEventListener('click', function(e) {
  var target = e.target;
  if (target && (target.id === 'nav-collapse-btn' || (target.closest && target.closest('#nav-collapse-btn')))) {
    toggleSidebarCollapsed();
  }
}, { passive: true });

document.addEventListener('DOMContentLoaded', function() {
  try {
    applySidebarCollapsedState();
    var legacy = document.querySelector('.sidebar:not(#farpa-sidebar)');
    if (legacy) legacy.remove();
  } catch(err) {}
});

if (window.farpaSidebar) window.farpaSidebar.toggleCollapse = toggleSidebarCollapsed;
