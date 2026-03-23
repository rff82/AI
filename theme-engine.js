/* farpa.ai — Theme Engine v0.13
   Refactored: admin links removed from public sidebar,
   flat file structure, simplified UX */
(function(){
'use strict';
const STORAGE_KEY='farpa_theme';
const THEMES={void:{name:'Void',feel:'Foco · Escuro'},ivory:{name:'Ivory',feel:'Leitura · Claro'},midnight:{name:'Midnight',feel:'Tech · Azul'}};

function detectInitialTheme(){
  const s=localStorage.getItem(STORAGE_KEY);
  if(s&&THEMES[s])return s;
  if(window.matchMedia('(prefers-color-scheme: light)').matches)return 'ivory';
  return 'void';
}
function applyTheme(theme,animate){
  if(!THEMES[theme])return;
  const html=document.documentElement;
  if(animate){html.style.transition='background 0.35s ease, color 0.35s ease';setTimeout(()=>{html.style.transition='';},400);}
  html.setAttribute('data-theme',theme);localStorage.setItem(STORAGE_KEY,theme);updateThemeUI(theme);
  window.dispatchEvent(new CustomEvent('farpaThemeChange',{detail:{theme}}));
}
function updateThemeUI(theme){
  document.querySelectorAll('.tp-option').forEach(el=>el.classList.toggle('active',el.dataset.theme===theme));
  document.querySelectorAll('.sb-theme-dot').forEach(el=>el.classList.toggle('active',el.dataset.theme===theme));
}
function buildThemePicker(container){
  const picker=document.createElement('div');picker.className='theme-picker';picker.id='theme-picker';
  picker.innerHTML='<div class="theme-picker-label">Aparência</div>'+Object.entries(THEMES).map(([key,t])=>`<div class="tp-option" data-theme="${key}" onclick="window.farpaTheme.set('${key}')" role="button" tabindex="0"><div class="tp-swatch tp-${key}"></div><div><div class="tp-name">${t.name}</div><div class="tp-feel">${t.feel}</div></div></div>`).join('');
  container.appendChild(picker);
  document.addEventListener('click',e=>{if(!container.contains(e.target))picker.classList.remove('open');});
  return picker;
}
function togglePicker(){const p=document.getElementById('theme-picker');if(p)p.classList.toggle('open');}

const sa='width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"';
const iconHome=`<svg class="sb-icon" ${sa}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const iconLib=`<svg class="sb-icon" ${sa}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
const iconChart=`<svg class="sb-icon" ${sa}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`;
const iconLabs=`<svg class="sb-icon" ${sa}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`;
const iconContact=`<svg class="sb-icon" ${sa}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
const iconFarpa='<svg class="sb-logo-icon" viewBox="0 0 56 56" fill="none"><polygon points="28,4 44,18 36,28 48,44 28,52 8,44 20,28 12,18" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/><polygon points="28,12 38,22 32,28 40,40 28,46 16,40 24,28 18,22" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="0.8" stroke-linejoin="round"/><circle cx="28" cy="28" r="2.5" fill="var(--accent)"/></svg>';
const iconStar='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

/* PUBLIC sidebar — NO admin links */
function buildSidebar(activePage){
  const sidebar=document.createElement('aside');
  sidebar.className='farpa-sidebar';sidebar.id='farpa-sidebar';
  sidebar.setAttribute('role','navigation');sidebar.setAttribute('aria-label','Menu principal');
  const navItems=[
    {href:'index.html',      icon:iconHome,    label:'Início',           id:'home'},
    {href:'biblioteca.html', icon:iconLib,     label:'Biblioteca de IA', id:'biblioteca'},
    {href:'mercados.html',   icon:iconChart,   label:'Mercados ao vivo', id:'mercados', badge:'Ao vivo', live:true},
    {href:'labs.html',       icon:iconLabs,    label:'Farpa Labs',       id:'labs',     badge:'Demos'},
    {href:'contato.html',    icon:iconContact, label:'Contato',          id:'contato'},
  ];
  const mainNav=navItems.map(item=>{
    const isActive=activePage===item.id;
    return `<a href="${item.href}" class="sb-item${isActive?' active':''}" data-tooltip="${item.label}"${isActive?' aria-current="page"':''}>${item.icon}<span class="sb-item-text">${item.label}</span>${item.live?'<span class="sb-live"></span>':''}${item.badge?`<span class="sb-badge">${item.badge}</span>`:''}</a>`;
  }).join('');
  sidebar.innerHTML=`${iconFarpa.replace('<svg','<a class="sb-logo" href="index.html">'+iconFarpa.replace('<svg','<svg')).replace('</svg>','</svg>')}`.replace(/BADREPLACE/g,'') + 
  `<a class="sb-logo" href="index.html">${iconFarpa}<span class="sb-logo-name">farpa<span class="ai">.ai</span></span></a>` +
  `<div class="sb-section"><div class="sb-section-label">Navegar</div>${mainNav}</div>` +
  `<div class="sb-footer">` +
  `<a href="index.html#waitlist" class="sb-pro-btn">${iconStar}<span>Acesso antecipado</span></a>` +
  `<div class="sb-theme-row"><span class="sb-theme-label">Tema</span><div class="sb-theme-dots"><button class="sb-theme-dot sb-dot-void" data-theme="void" onclick="window.farpaTheme.set('void')" title="Void"></button><button class="sb-theme-dot sb-dot-ivory" data-theme="ivory" onclick="window.farpaTheme.set('ivory')" title="Ivory"></button><button class="sb-theme-dot sb-dot-midnight" data-theme="midnight" onclick="window.farpaTheme.set('midnight')" title="Midnight"></button></div></div>` +
  `<div class="sb-version">v0.13 · mar 2026</div></div>`;
  
  // Fix: build properly without the messy concatenation above
  sidebar.innerHTML = `
    <a class="sb-logo" href="index.html">${iconFarpa}<span class="sb-logo-name">farpa<span class="ai">.ai</span></span></a>
    <div class="sb-section"><div class="sb-section-label">Navegar</div>${mainNav}</div>
    <div class="sb-footer">
      <a href="index.html#waitlist" class="sb-pro-btn">${iconStar}<span>Acesso antecipado</span></a>
      <div class="sb-theme-row">
        <span class="sb-theme-label">Tema</span>
        <div class="sb-theme-dots">
          <button class="sb-theme-dot sb-dot-void" data-theme="void" onclick="window.farpaTheme.set('void')" title="Void"></button>
          <button class="sb-theme-dot sb-dot-ivory" data-theme="ivory" onclick="window.farpaTheme.set('ivory')" title="Ivory"></button>
          <button class="sb-theme-dot sb-dot-midnight" data-theme="midnight" onclick="window.farpaTheme.set('midnight')" title="Midnight"></button>
        </div>
      </div>
      <div class="sb-version">v0.13 · mar 2026</div>
    </div>`;
  return sidebar;
}

function buildTopnav(breadcrumb){
  const nav=document.createElement('header');nav.className='farpa-topnav';nav.id='farpa-topnav';
  const bc=breadcrumb||[{label:'Início',href:'index.html'}];
  const bcHtml=bc.map((b,i)=>i<bc.length-1?`<a href="${b.href}" class="bc-link">${b.label}</a><span class="sep">/</span>`:`<span class="current">${b.label}</span>`).join('');
  nav.innerHTML=`
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Abrir menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
    <button class="nav-collapse-btn" id="nav-collapse-btn" aria-label="Recolher menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="18" rx="1.5" stroke-width="1.6"/><path d="M14 9l-3 3 3 3"/></svg></button>
    <nav class="nav-breadcrumb">${bcHtml}</nav>
    <div class="nav-right">
      <button class="nav-search-btn" onclick="window.farpaSearch.open()" title="Buscar (Ctrl+K)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><span class="search-text">Buscar</span><span class="nav-search-kbd">Ctrl K</span></button>
      <div class="nav-lang"><button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set('pt')" id="lang-pt">🇧🇷</button><button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set('en')" id="lang-en">🇺🇸</button></div>
      <div style="position:relative;"><button class="nav-theme-btn" id="theme-palette-btn" onclick="window.farpaTheme.toggle()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2C6.5 2 2 6.5 2 12"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg></button></div>
      <a href="index.html#waitlist" class="nav-pro">✦ Entrar na lista</a>
    </div>`;
  setTimeout(()=>{const btn=document.getElementById('theme-palette-btn');if(btn&&btn.parentElement)buildThemePicker(btn.parentElement);},0);
  return nav;
}

const SEARCH_INDEX=[
  {title:'Início — farpa.ai',cat:'Página',icon:'🏠',url:'index.html'},
  {title:'Biblioteca de IA Generativa',cat:'Biblioteca',icon:'📚',url:'biblioteca.html'},
  {title:'Fundamentos de IA — LLMs e Transformers',cat:'Módulo 1',icon:'🧠',url:'biblioteca.html'},
  {title:'RAG e Fine-tuning na Prática',cat:'Módulo 3',icon:'🔧',url:'biblioteca.html'},
  {title:'Agentes e Memória Avançados',cat:'Módulo 5',icon:'🤖',url:'biblioteca.html'},
  {title:'Dashboard de Mercados ao vivo',cat:'Mercados',icon:'📈',url:'mercados.html'},
  {title:'Criptomoedas — BTC, ETH, SOL',cat:'Mercados',icon:'₿',url:'mercados.html'},
  {title:'Farpa Labs — Demos interativos',cat:'Labs',icon:'⚗️',url:'labs.html'},
  {title:'Analisador de Sentimento',cat:'Labs',icon:'🎯',url:'labs.html'},
  {title:'Trader Simulator',cat:'Labs',icon:'💹',url:'trader-sim.html'},
  {title:'Contato — Conversa estratégica',cat:'Contato',icon:'✉️',url:'contato.html'},
  {title:'Fundamentos de IA',cat:'Artigo',icon:'📖',url:'fundamentos.html'},
  {title:'Dados & Democratização',cat:'Artigo',icon:'📊',url:'dados.html'},
  {title:'Infraestrutura & Escala',cat:'Artigo',icon:'🖥️',url:'infraestrutura.html'},
  {title:'Maturidade Organizacional',cat:'Artigo',icon:'📈',url:'maturidade.html'},
];

function buildSearchModal(){
  const overlay=document.createElement('div');overlay.className='search-overlay';overlay.id='farpa-search';
  overlay.innerHTML=`<div class="search-box"><div class="search-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input id="farpa-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Buscar módulos, demos, mercados..." oninput="window.farpaSearch.query(this.value)"><button class="search-esc" onclick="window.farpaSearch.close()">ESC</button></div><div class="search-results" id="farpa-search-results"></div><div class="search-footer"><span>↑↓ navegar</span><span>↵ acessar</span><span>ESC fechar</span></div></div>`;
  overlay.addEventListener('click',e=>{if(e.target===overlay)window.farpaSearch.close();});
  document.body.appendChild(overlay);
}
function renderSearchResults(items,label){
  const container=document.getElementById('farpa-search-results');if(!container)return;
  const html=(label?`<div class="search-hint-label">${label}</div>`:'')+items.map(r=>`<a href="${r.url}" class="search-result" onclick="window.farpaSearch.close()"><div class="sr-icon">${r.icon}</div><div><div class="sr-title">${r.title}</div><div class="sr-cat">${r.cat}</div></div></a>`).join('');
  container.innerHTML=html||'<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px;">Nenhum resultado encontrado</div>';
}

function init(){
  const theme=detectInitialTheme();document.documentElement.setAttribute('data-theme',theme);
  document.addEventListener('DOMContentLoaded',()=>{
    buildSearchModal();updateThemeUI(theme);
    const savedLang=localStorage.getItem('farpa_lang')||'pt';
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.id==='lang-'+savedLang));
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();window.farpaSearch.open();}
      if(e.key==='Escape'){window.farpaSearch.close();closeSidebarMobile();}
    });
  });
}

function openSidebarMobile(){const sb=document.getElementById('farpa-sidebar'),hb=document.getElementById('nav-hamburger');if(sb){sb.classList.add('open');document.body.classList.add('sidebar-open');}if(hb)hb.setAttribute('aria-expanded','true');}
function closeSidebarMobile(){const sb=document.getElementById('farpa-sidebar'),hb=document.getElementById('nav-hamburger');if(sb){sb.classList.remove('open');document.body.classList.remove('sidebar-open');}if(hb)hb.setAttribute('aria-expanded','false');}
function toggleSidebarMobile(){const sb=document.getElementById('farpa-sidebar');if(sb&&sb.classList.contains('open'))closeSidebarMobile();else openSidebarMobile();}

window.farpaTheme={set:(theme)=>applyTheme(theme,true),toggle:togglePicker,current:()=>document.documentElement.getAttribute('data-theme')||'void'};
window.farpaSearch={
  open(){const o=document.getElementById('farpa-search');if(!o)return;o.classList.add('open');renderSearchResults(SEARCH_INDEX.slice(0,8),'Sugestões');setTimeout(()=>{const i=document.getElementById('farpa-search-input');if(i)i.focus();},80);},
  close(){const o=document.getElementById('farpa-search');if(o)o.classList.remove('open');const i=document.getElementById('farpa-search-input');if(i)i.value='';},
  query(q){if(!q.trim()){renderSearchResults(SEARCH_INDEX.slice(0,8),'Sugestões');return;}const m=SEARCH_INDEX.filter(r=>r.title.toLowerCase().includes(q.toLowerCase())||r.cat.toLowerCase().includes(q.toLowerCase())).slice(0,9);renderSearchResults(m,m.length+' resultado'+(m.length!==1?'s':''));}
};
window.farpaSidebar={build:buildSidebar};
window.farpaTopnav={build:buildTopnav};
window.farpaSidebarMobile={open:openSidebarMobile,close:closeSidebarMobile,toggle:toggleSidebarMobile};
init();
})();

document.addEventListener('click',e=>{
  try{
    const hb=document.getElementById('nav-hamburger');
    if(hb&&(hb===e.target||hb.contains(e.target))){window.farpaSidebarMobile&&window.farpaSidebarMobile.toggle();return;}
    if(window.innerWidth<=900){const sb=document.getElementById('farpa-sidebar');if(sb&&sb.classList.contains('open')&&!sb.contains(e.target))window.farpaSidebarMobile&&window.farpaSidebarMobile.close();}
  }catch(err){}
},{passive:true});

function applySidebarCollapsedState(){try{const sb=document.getElementById('farpa-sidebar');if(!sb)return;const c=localStorage.getItem('farpa_sidebar_collapsed')==='1';sb.classList.toggle('collapsed',c);const ct=document.querySelector('.farpa-content');if(ct)ct.style.marginLeft=c?'72px':'';const tn=document.getElementById('farpa-topnav');if(tn)tn.style.left=c?'72px':'';}catch(e){}}
function toggleSidebarCollapsed(){try{const sb=document.getElementById('farpa-sidebar');if(!sb)return;const c=sb.classList.toggle('collapsed');localStorage.setItem('farpa_sidebar_collapsed',c?'1':'0');const ct=document.querySelector('.farpa-content');if(ct)ct.style.marginLeft=c?'72px':'';const tn=document.getElementById('farpa-topnav');if(tn)tn.style.left=c?'72px':'';}catch(e){}}
document.addEventListener('click',e=>{const t=e.target;if(t&&(t.id==='nav-collapse-btn'||(t.closest&&t.closest('#nav-collapse-btn'))))toggleSidebarCollapsed();},{passive:true});
document.addEventListener('DOMContentLoaded',()=>{try{applySidebarCollapsedState();const n=document.querySelector('nav.nav:not(#farpa-topnav)');if(n)n.style.display='none';}catch(e){}});
