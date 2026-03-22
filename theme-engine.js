/* farpa.ai — Theme Engine v0.12 */
(function () {
  'use strict';

  const STORAGE_KEY = 'farpa_theme';
  const SITE_META = { version: 'v0.14', publishedLabel: 'mar 2026' };
  const THEMES = { void:{name:'Void',feel:'Foco · Escuro'}, ivory:{name:'Ivory',feel:'Leitura · Claro'}, midnight:{name:'Midnight',feel:'Tech · Azul'}, contrast:{name:'Alto Contraste',feel:'Acessibilidade · Máxima legibilidade'} };

  function detectInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) return saved;
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'ivory';
    return 'void';
  }

  function applyTheme(theme, animate) {
    if (!THEMES[theme]) return;
    const html = document.documentElement;
    if (animate) { html.style.transition = 'background 0.35s ease, color 0.35s ease'; setTimeout(() => { html.style.transition = ''; }, 400); }
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateThemeUI(theme);
    window.dispatchEvent(new CustomEvent('farpaThemeChange', { detail: { theme } }));
  }

  function updateThemeUI(theme) {
    document.querySelectorAll('.tp-option').forEach(el => el.classList.toggle('active', el.dataset.theme === theme));
    document.querySelectorAll('.sb-theme-dot').forEach(el => el.classList.toggle('active', el.dataset.theme === theme));
    const btn = document.getElementById('theme-palette-btn');
    if (btn) { const c = {void:'#00ff88',ivory:'#2d6a1e',midnight:'#6eb5ff',contrast:'#ffd400'}; btn.style.borderColor = c[theme] || ''; }
  }

  function buildThemePicker(container) {
    const picker = document.createElement('div');
    picker.className = 'theme-picker'; picker.id = 'theme-picker';
    picker.innerHTML = '<div class="theme-picker-label">Aparência</div>' +
      Object.entries(THEMES).map(([k,t]) => `<div class="tp-option" data-theme="${k}" onclick="window.farpaTheme.set('${k}')" role="button" tabindex="0"><div class="tp-swatch tp-${k}"></div><div><div class="tp-name">${t.name}</div><div class="tp-feel">${t.feel}</div></div></div>`).join('');
    container.appendChild(picker);
    document.addEventListener('click', e => { if (!container.contains(e.target)) picker.classList.remove('open'); });
    return picker;
  }

  function togglePicker() { const p = document.getElementById('theme-picker'); if (p) p.classList.toggle('open'); }

  /* SVG Icons */
  const sa = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"';
  const iHome  = `<svg class="sb-icon" ${sa}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const iLib   = `<svg class="sb-icon" ${sa}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
  const iChart = `<svg class="sb-icon" ${sa}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`;
  const iLabs  = `<svg class="sb-icon" ${sa}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`;
  const iLeads = `<svg class="sb-icon" ${sa}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  const iAdmin = `<svg class="sb-icon" ${sa}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;
  const iStar  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const iDot   = `<svg class="sb-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`;
  const iFarpa = `<svg class="sb-logo-icon" viewBox="0 0 56 56" fill="none" width="28" height="28"><polygon points="28,4 44,18 36,28 48,44 28,52 8,44 20,28 12,18" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/><polygon points="28,12 38,22 32,28 40,40 28,46 16,40 24,28 18,22" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="0.8" stroke-linejoin="round"/><circle cx="28" cy="28" r="2.5" fill="var(--accent)"/></svg>`;

  function buildSidebar(activePage) {
    const s = document.createElement('aside');
    s.className = 'farpa-sidebar'; s.id = 'farpa-sidebar';

    const navItems = [
      {href:'index.html',      icon:iHome,  label:'Início',     id:'home',       badge:'',       live:false},
      {href:'biblioteca.html', icon:iLib,   label:'Biblioteca', id:'biblioteca', badge:'8 labs', live:false},
      {href:'mercados.html',   icon:iChart, label:'Mercados',   id:'mercados',   badge:'',       live:true },
      {href:'labs.html',       icon:iLabs,  label:'Labs',       id:'labs',       badge:'Novo',   live:false},
    ];
    const subItems = [
      {href:'biblioteca.html#module-1',label:'Fundamentos de IA'},
      {href:'biblioteca.html#module-2',label:'LLMs e Prompts'},
      {href:'biblioteca.html#module-3',label:'Fine-tuning e RAG'},
      {href:'biblioteca.html#module-4',label:'Ética em IA'},
    ];
    const adminItems = [
      {href:'leads.html',        icon:iLeads, label:'Central de Leads', id:'leads'},
      {href:'admin/index.html',  icon:iAdmin, label:'Painel Admin',     id:'admin'},
    ];

    const mkItem = (item, isActive) =>
      `<a href="${item.href}" class="sb-item${isActive?' active':''}" data-tooltip="${item.label}"${isActive?' aria-current="page"':''}>${item.icon}<span class="sb-item-text">${item.label}</span>${item.live?'<span class="sb-live"></span>':''}${item.badge?`<span class="sb-badge">${item.badge}</span>`:''}</a>`;

    const showLibraryDiscovery = activePage === 'biblioteca';

    s.innerHTML =
      `<a class="sb-logo" href="index.html">${iFarpa}<span class="sb-logo-name">farpa<span class="ai">.ai</span></span></a>` +
      `<div class="sb-section"><div class="sb-section-label">Navegar</div>${navItems.map(i=>mkItem(i,activePage===i.id)).join('')}</div>` +
      `${showLibraryDiscovery ? `<div class="sb-divider"></div><div class="sb-section"><div class="sb-section-label">Biblioteca</div>${subItems.map(i=>`<a href="${i.href}" class="sb-item sb-item-sub" data-tooltip="${i.label}">${iDot}<span class="sb-item-text">${i.label}</span></a>`).join('')}<a href="biblioteca.html" class="sb-item sb-item-sub" style="color:var(--accent)" data-tooltip="Ver todos">${iDot}<span class="sb-item-text">Ver todos →</span></a></div>` : ''}` +
      `<div class="sb-divider"></div>` +
      `${['admin','leads'].includes(activePage) ? `<div class="sb-section"><div class="sb-section-label">Admin</div>${adminItems.map(i=>mkItem(i,activePage===i.id)).join('')}</div>` : ''}` +
      `<div class="sb-footer"><a href="pro.html" class="sb-pro-btn">${iStar}<span>Plano Pro</span></a><div class="sb-theme-row"><span class="sb-theme-label">Acessibilidade</span><div class="sb-theme-dots"><button class="sb-theme-dot sb-dot-void" data-theme="void" onclick="window.farpaTheme.set('void')" title="Void" aria-label="Tema Void"></button><button class="sb-theme-dot sb-dot-ivory" data-theme="ivory" onclick="window.farpaTheme.set('ivory')" title="Ivory" aria-label="Tema Ivory"></button><button class="sb-theme-dot sb-dot-midnight" data-theme="midnight" onclick="window.farpaTheme.set('midnight')" title="Midnight" aria-label="Tema Midnight"></button><button class="sb-theme-dot sb-dot-contrast" data-theme="contrast" onclick="window.farpaTheme.set('contrast')" title="Alto Contraste" aria-label="Tema Alto Contraste"></button></div></div><div class="sb-version" data-site-version></div></div>`;
    return s;
  }

  function buildTopnav(breadcrumb) {
    const nav = document.createElement('header');
    nav.className = 'farpa-topnav'; nav.id = 'farpa-topnav';
    const bc = breadcrumb || [{label:'Início',href:'index.html'}];
    const bcHtml = bc.map((b,i) => i < bc.length-1
      ? `<a href="${b.href}" class="bc-link">${b.label}</a><span class="sep">/</span>`
      : `<span class="current">${b.label}</span>`).join('');

    nav.innerHTML =
      `<button class="nav-hamburger" id="nav-hamburger" aria-label="Menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>` +
      `<button class="nav-collapse-btn" id="nav-collapse-btn" aria-pressed="false" aria-label="Recolher menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="18" rx="1.5" stroke-width="1.6"/><path d="M14 9l-3 3 3 3"/></svg></button>` +
      `<nav class="nav-breadcrumb">${bcHtml}</nav>` +
      `<div class="nav-right">` +
        `<button class="nav-search-btn" onclick="window.farpaSearch.open()" title="Buscar (Ctrl+K)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><span class="search-text">Buscar</span><span class="nav-search-kbd">Ctrl K</span></button>` +
        `<div class="nav-lang"><button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set('pt')" title="Português" id="lang-pt">🇧🇷</button><button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set('en')" title="English" id="lang-en">🇺🇸</button><button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set('zh')" title="中文" id="lang-zh">🇨🇳</button><button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set('de')" title="Deutsch" id="lang-de">🇩🇪</button></div>` +
        `<div style="position:relative"><button class="nav-theme-btn" id="theme-palette-btn" onclick="window.farpaTheme.toggle()" title="Tema e acessibilidade" aria-label="Abrir temas e opções de acessibilidade"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2C6.5 2 2 6.5 2 12"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg></button></div>` +
        `<a href="pro.html" class="nav-pro">⭐ Pro</a>` +
      `</div>`;

    setTimeout(() => { const b = document.getElementById('theme-palette-btn'); if (b && b.parentElement) buildThemePicker(b.parentElement); }, 0);
    return nav;
  }

  /* Search */
  const SEARCH_INDEX = [
    {title:'Biblioteca de IA Generativa',cat:'Biblioteca',icon:'📚',url:'biblioteca.html'},
    {title:'Fundamentos de IA — Da origem aos LLMs',cat:'Módulo 1',icon:'🧠',url:'biblioteca.html#module-1'},
    {title:'Como os LLMs Pensam',cat:'Módulo 2',icon:'⚙️',url:'biblioteca.html#module-2'},
    {title:'Fine-tuning e RAG',cat:'Módulo 3',icon:'🔧',url:'biblioteca.html#module-3'},
    {title:'IA Responsável — Ética e Governança',cat:'Módulo 4',icon:'⚖️',url:'biblioteca.html#module-4'},
    {title:'Agentes e Memória',cat:'Módulo 5',icon:'🤖',url:'biblioteca.html#module-5'},
    {title:'LLMs como Plataformas — LangChain',cat:'Módulo 6',icon:'🔗',url:'biblioteca.html#module-6'},
    {title:'Engenharia de LLMs — Vetores e ReAct',cat:'Módulo 7',icon:'📐',url:'biblioteca.html#module-7'},
    {title:'Ecossistema e Estratégia de IA',cat:'Módulo 8',icon:'🌐',url:'biblioteca.html#module-8'},
    {title:'Dashboard de Mercados ao vivo',cat:'Mercados',icon:'📈',url:'mercados.html'},
    {title:'B3 — Ações brasileiras',cat:'Mercados',icon:'🇧🇷',url:'mercados.html'},
    {title:'Criptomoedas — BTC, ETH, SOL',cat:'Mercados',icon:'₿',url:'mercados.html'},
    {title:'Farpa Labs — Demos interativos',cat:'Labs',icon:'⚗️',url:'labs.html'},
    {title:'Analisador de Sentimento',cat:'Labs',icon:'🎯',url:'labs.html'},
    {title:'Gerador de Headlines',cat:'Labs',icon:'✍️',url:'labs.html'},
        {title:'Plano Pro',cat:'Pro',icon:'⭐',url:'pro.html'},
    {title:'LLM · Large Language Model',cat:'Glossário',icon:'📖',url:'biblioteca.html'},
    {title:'RAG · Geração Aumentada por Recuperação',cat:'Glossário',icon:'📖',url:'biblioteca.html'},
    {title:'Embeddings · Representações vetoriais',cat:'Glossário',icon:'📖',url:'biblioteca.html'},
  ];

  function buildSearchModal() {
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay'; overlay.id = 'farpa-search';
    overlay.innerHTML = `<div class="search-box"><div class="search-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input id="farpa-search-input" type="search" autocomplete="off" placeholder="Buscar módulos, demos, termos..." oninput="window.farpaSearch.query(this.value)"><button class="search-esc" onclick="window.farpaSearch.close()">ESC</button></div><div class="search-results" id="farpa-search-results"></div><div class="search-footer"><span>↑↓ navegar</span><span>↵ acessar</span><span>ESC fechar</span></div></div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) window.farpaSearch.close(); });
    document.body.appendChild(overlay);
  }

  function renderSearchResults(items, label) {
    const c = document.getElementById('farpa-search-results'); if (!c) return;
    const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    c.innerHTML = (label ? `<div class="search-hint-label">${label}</div>` : '') +
      items.map(r => `<a href="${r.url}" class="search-result" onclick="window.farpaSearch.close()"><div class="sr-icon">${r.icon}</div><div><div class="sr-title">${esc(r.title)}</div><div class="sr-cat">${esc(r.cat)}</div></div></a>`).join('') ||
      `<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px;">Nenhum resultado</div>`;
  }

  /* Sidebar mobile */
  function openSidebar() { const s = document.getElementById('farpa-sidebar'), h = document.getElementById('nav-hamburger'); if (s) { s.classList.add('open'); document.body.classList.add('sidebar-open'); } if (h) h.setAttribute('aria-expanded','true'); }
  function closeSidebar() { const s = document.getElementById('farpa-sidebar'), h = document.getElementById('nav-hamburger'); if (s) { s.classList.remove('open'); document.body.classList.remove('sidebar-open'); } if (h) h.setAttribute('aria-expanded','false'); }
  function toggleSidebar() { const s = document.getElementById('farpa-sidebar'); if (s && s.classList.contains('open')) closeSidebar(); else openSidebar(); }

  /* Collapse desktop */
  function toggleCollapse() {
    const s = document.getElementById('farpa-sidebar'), c = document.getElementById('farpa-content') || document.querySelector('.farpa-content'), t = document.getElementById('farpa-topnav');
    if (!s) return;
    const collapsed = s.classList.toggle('collapsed');
    localStorage.setItem('farpa_sidebar_collapsed', collapsed?'1':'0');
    const btn = document.getElementById('nav-collapse-btn'); if (btn) btn.setAttribute('aria-pressed', collapsed?'true':'false');
    if (c) c.style.marginLeft = collapsed?'72px':'';
    if (t) t.style.left = collapsed?'72px':'';
  }
  function applyCollapse() {
    const collapsed = localStorage.getItem('farpa_sidebar_collapsed')==='1';
    const s = document.getElementById('farpa-sidebar'), c = document.getElementById('farpa-content') || document.querySelector('.farpa-content'), t = document.getElementById('farpa-topnav'), btn = document.getElementById('nav-collapse-btn');
    if (collapsed && s) { s.classList.add('collapsed'); if (c) c.style.marginLeft='72px'; if (t) t.style.left='72px'; if (btn) btn.setAttribute('aria-pressed','true'); }
  }

  function syncSiteMeta() {
    const versionLabel = `${SITE_META.version} · ${SITE_META.publishedLabel}`;
    document.querySelectorAll('[data-site-version], .footer-version, .sb-version').forEach(el => { el.textContent = versionLabel; });
  }

  function init() {
    const theme = detectInitialTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.addEventListener('DOMContentLoaded', () => {
      buildSearchModal();
      updateThemeUI(theme);
      syncSiteMeta();
      const lang = localStorage.getItem('farpa_lang')||'pt';
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.id==='lang-'+lang));
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); window.farpaSearch.open(); }
        if (e.key==='Escape') { window.farpaSearch.close(); closeSidebar(); }
      });
    });
  }

  window.farpaTheme  = { set: t => applyTheme(t,true), toggle: togglePicker, current: () => document.documentElement.getAttribute('data-theme')||'void' };
  window.farpaSearch = {
    open() { const o = document.getElementById('farpa-search'); if (!o) return; o.classList.add('open'); renderSearchResults(SEARCH_INDEX.slice(0,8),'Sugestões'); setTimeout(() => { const i = document.getElementById('farpa-search-input'); if(i) i.focus(); }, 80); },
    close() { const o = document.getElementById('farpa-search'); if(o) o.classList.remove('open'); const i = document.getElementById('farpa-search-input'); if(i) i.value=''; },
    query(q) { if (!q.trim()) { renderSearchResults(SEARCH_INDEX.slice(0,8),'Sugestões'); return; } const m = SEARCH_INDEX.filter(r => r.title.toLowerCase().includes(q.toLowerCase())||r.cat.toLowerCase().includes(q.toLowerCase())).slice(0,9); renderSearchResults(m, m.length+' resultado'+(m.length!==1?'s':'')); }
  };
  window.farpaSidebar = { build: buildSidebar };
  window.farpaTopnav  = { build: buildTopnav };

  init();
})();

/* Handlers fora do IIFE */
document.addEventListener('click', function(e) {
  try {
    const hb = document.getElementById('nav-hamburger');
    if (hb && (hb===e.target||hb.contains(e.target))) { window.farpaSidebar&&(window._farpaSidebarToggle||function(){const s=document.getElementById('farpa-sidebar');if(s&&s.classList.contains('open')){s.classList.remove('open');document.body.classList.remove('sidebar-open');}else{s&&s.classList.add('open')&&document.body.classList.add('sidebar-open');}})(); if(document.getElementById('farpa-sidebar')){ const sb=document.getElementById('farpa-sidebar');if(sb.classList.contains('open')){sb.classList.remove('open');document.body.classList.remove('sidebar-open');document.getElementById('nav-hamburger')&&document.getElementById('nav-hamburger').setAttribute('aria-expanded','false');}else{sb.classList.add('open');document.body.classList.add('sidebar-open');document.getElementById('nav-hamburger')&&document.getElementById('nav-hamburger').setAttribute('aria-expanded','true');}} return; }
    if (window.innerWidth <= 900) { const sb = document.getElementById('farpa-sidebar'); if (sb && sb.classList.contains('open') && !sb.contains(e.target)) { sb.classList.remove('open'); document.body.classList.remove('sidebar-open'); const hb2=document.getElementById('nav-hamburger'); if(hb2) hb2.setAttribute('aria-expanded','false'); } }
    const cb = document.getElementById('nav-collapse-btn');
    if (cb && (cb===e.target||cb.contains(e.target))) {
      const s=document.getElementById('farpa-sidebar'),c=document.querySelector('.farpa-content'),t=document.getElementById('farpa-topnav');
      if(!s) return; const collapsed=s.classList.toggle('collapsed');
      localStorage.setItem('farpa_sidebar_collapsed',collapsed?'1':'0');
      cb.setAttribute('aria-pressed',collapsed?'true':'false');
      if(c) c.style.marginLeft=collapsed?'72px':''; if(t) t.style.left=collapsed?'72px':'';
    }
  } catch(err){}
}, {passive:true});

document.addEventListener('DOMContentLoaded', function() {
  try {
    const collapsed = localStorage.getItem('farpa_sidebar_collapsed')==='1';
    if (collapsed) {
      const s=document.getElementById('farpa-sidebar'),c=document.querySelector('.farpa-content'),t=document.getElementById('farpa-topnav'),btn=document.getElementById('nav-collapse-btn');
      if(s){s.classList.add('collapsed');if(c)c.style.marginLeft='72px';if(t)t.style.left='72px';if(btn)btn.setAttribute('aria-pressed','true');}
    }
  } catch(err){}
});
