/* farpa.ai — Theme Engine v4.0 */
(function(){
'use strict';
const SK='farpa_theme',CK='farpa_ac';
const THEMES={claro:{name:'Claro',feel:'Editorial'},escuro:{name:'Escuro',feel:'Noturno'},sepia:{name:'Sépia',feel:'Leitura longa'}};
function getTheme(){const s=localStorage.getItem(SK);return(s&&THEMES[s])?s:'claro'}
function isAC(){return localStorage.getItem(CK)==='1'}
function applyTheme(t){if(!THEMES[t])return;localStorage.setItem(SK,t);if(!isAC())document.documentElement.setAttribute('data-theme',t);updateThemeUI(t);window.dispatchEvent(new CustomEvent('farpaThemeChange',{detail:{theme:t}}))}
function toggleAC(){const html=document.documentElement;const on=!isAC();localStorage.setItem(CK,on?'1':'0');html.setAttribute('data-theme',on?'alto-contraste':(localStorage.getItem(SK)||'claro'));updateThemeUI(html.getAttribute('data-theme'));updateACUI(on);window.dispatchEvent(new CustomEvent('farpaACChange',{detail:{on}}))}
function updateThemeUI(t){document.querySelectorAll('.tp-option').forEach(el=>el.classList.toggle('active',el.dataset.theme===t));document.querySelectorAll('.sb-theme-dot').forEach(el=>el.classList.toggle('active',el.dataset.theme===t))}
function updateACUI(on){document.querySelectorAll('.farpa-contrast-btn').forEach(btn=>{btn.setAttribute('aria-pressed',on?'true':'false');const sp=btn.querySelector('.ac-label');if(sp)sp.textContent=on?'Contraste: ON':'Alto contraste'})}
function buildThemePicker(container){const p=document.createElement('div');p.className='theme-picker';p.id='theme-picker';p.innerHTML='<div class="theme-picker-label">Aparência</div>'+Object.entries(THEMES).map(([k,t])=>'<div class="tp-option" data-theme="'+k+'" onclick="window.farpaTheme.set(\''+k+'\')" role="button" tabindex="0"><div class="tp-swatch tp-'+k+'"></div><div><div class="tp-name">'+t.name+'</div><div class="tp-feel">'+t.feel+'</div></div></div>').join('')+'<div class="tp-option" data-theme="alto-contraste" onclick="window.farpaTheme.toggleAC()" role="button" tabindex="0"><div class="tp-swatch tp-contraste"></div><div><div class="tp-name">Alto contraste</div><div class="tp-feel">WCAG AAA</div></div></div>';container.appendChild(p);document.addEventListener('click',e=>{if(!container.contains(e.target))p.classList.remove('open')});return p}
function togglePicker(){const p=document.getElementById('theme-picker');if(p)p.classList.toggle('open')}

const SA='width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"';
const iHome='<svg class="sb-icon" '+SA+'><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
const iLib='<svg class="sb-icon" '+SA+'><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
const iChart='<svg class="sb-icon" '+SA+'><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
const iLabs='<svg class="sb-icon" '+SA+'><path d="M14.5 2v8.5L19 17a2 2 0 0 1 0 4H5a2 2 0 0 1 0-4l4.5-6.5V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/></svg>';
const iContact='<svg class="sb-icon" '+SA+'><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
const iPro='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const iContrast='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" stroke-linecap="round"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>';
const iFarpa='<svg class="sb-logo-icon" viewBox="0 0 48 48" fill="none"><polygon points="24,3 38,15 31,24 42,38 24,45 6,38 17,24 10,15" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/><polygon points="24,10 32,19 27,24 34,35 24,40 14,35 21,24 16,19" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="0.8" stroke-linejoin="round"/><circle cx="24" cy="24" r="2.5" fill="var(--accent)"/></svg>';

function buildSidebar(active){
  const sb=document.createElement('aside');sb.className='farpa-sidebar';sb.id='farpa-sidebar';sb.setAttribute('role','navigation');
  const nav=[{href:'index.html',icon:iHome,label:'Início',id:'home'},{href:'biblioteca.html',icon:iLib,label:'Biblioteca',id:'biblioteca'},{href:'mercados.html',icon:iChart,label:'Mercados',id:'mercados',badge:'Ao vivo',live:true},{href:'labs.html',icon:iLabs,label:'Labs',id:'labs',badge:'Demos'},{href:'contato.html',icon:iContact,label:'Contato',id:'contato'}];
  const navHtml=nav.map(it=>{const a=active===it.id;return'<a href="'+it.href+'" class="sb-item'+(a?' active':'')+'"'+(a?' aria-current="page"':'')+'>'+it.icon+'<span class="sb-item-text">'+it.label+'</span>'+(it.live?'<span class="sb-live"></span>':'')+(it.badge&&!it.live?'<span class="sb-badge">'+it.badge+'</span>':'')+'</a>'}).join('');
  const on=isAC();
  sb.innerHTML='<a class="sb-logo" href="index.html">'+iFarpa+'<span class="sb-logo-name">farpa<span class="ai">.ai</span></span></a><div class="sb-section"><div class="sb-section-label">Navegar</div>'+navHtml+'</div><div class="sb-footer"><a href="index.html#waitlist" class="sb-pro-btn">'+iPro+'<span>Acesso antecipado</span></a><button class="sb-contrast-btn farpa-contrast-btn" onclick="window.farpaTheme.toggleAC()" aria-pressed="'+on+'">'+iContrast+'<span class="ac-label">'+(on?'Contraste: ON':'Alto contraste')+'</span></button><div class="sb-theme-row"><span class="sb-theme-label">Tema</span><div class="sb-theme-dots"><button class="sb-theme-dot sb-dot-claro" data-theme="claro" onclick="window.farpaTheme.set(\'claro\')" title="Claro"></button><button class="sb-theme-dot sb-dot-escuro" data-theme="escuro" onclick="window.farpaTheme.set(\'escuro\')" title="Escuro"></button><button class="sb-theme-dot sb-dot-sepia" data-theme="sepia" onclick="window.farpaTheme.set(\'sepia\')" title="Sépia"></button></div></div><div class="sb-version">v4.0 · 2026</div></div>';
  return sb;
}

function buildTopnav(bc){
  const nav=document.createElement('header');nav.className='farpa-topnav';nav.id='farpa-topnav';
  const bcHtml=(bc||[{label:'Início',href:'index.html'}]).map((b,i,arr)=>i<arr.length-1?'<a href="'+b.href+'" class="bc-link">'+b.label+'</a><span class="sep">/</span>':'<span class="current">'+b.label+'</span>').join('');
  const on=isAC();
  nav.innerHTML='<button class="nav-hamburger" id="nav-hamburger" aria-label="Menu" aria-expanded="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><button class="nav-collapse-btn" id="nav-collapse-btn" aria-label="Recolher"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="18" rx="1.5" stroke-width="1.6"/><path d="M14 9l-3 3 3 3"/></svg></button><nav class="nav-breadcrumb">'+bcHtml+'</nav><div class="nav-right"><button class="nav-search-btn" onclick="window.farpaSearch.open()" title="Buscar (Ctrl+K)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><span class="search-text">Buscar</span><span class="nav-search-kbd">⌘K</span></button><div class="nav-lang"><button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set(\'pt\')" id="lang-pt" title="PT">🇧🇷</button><button class="lang-btn" onclick="window.farpaI18n&&window.farpaI18n.set(\'en\')" id="lang-en" title="EN">🇺🇸</button></div><button class="nav-contrast-btn farpa-contrast-btn" onclick="window.farpaTheme.toggleAC()" aria-pressed="'+on+'">'+iContrast+'</button><div style="position:relative"><button class="nav-theme-btn" id="theme-palette-btn" onclick="window.farpaTheme.toggle()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg></button></div><a href="index.html#waitlist" class="nav-pro">✦ Pro</a></div>';
  setTimeout(()=>{const btn=document.getElementById('theme-palette-btn');if(btn&&btn.parentElement)buildThemePicker(btn.parentElement)},0);
  return nav;
}

const IDX=[{title:'Início',cat:'Página',icon:'🏠',url:'index.html'},{title:'Biblioteca de IA',cat:'Biblioteca',icon:'📚',url:'biblioteca.html'},{title:'Fundamentos de IA',cat:'Módulo',icon:'🧠',url:'fundamentos.html'},{title:'Dados & Democratização',cat:'Módulo',icon:'📊',url:'dados.html'},{title:'Infraestrutura & Escala',cat:'Módulo',icon:'🖥️',url:'infraestrutura.html'},{title:'Maturidade Organizacional',cat:'Módulo',icon:'📈',url:'maturidade.html'},{title:'Dashboard de Mercados',cat:'Mercados',icon:'📈',url:'mercados.html'},{title:'BTC, ETH, SOL — Cripto',cat:'Mercados',icon:'₿',url:'mercados.html'},{title:'Farpa Labs — Demos',cat:'Labs',icon:'⚗️',url:'labs.html'},{title:'Trader Simulator',cat:'Labs',icon:'💹',url:'trader-sim.html'},{title:'Contato',cat:'Página',icon:'✉️',url:'contato.html'},{title:'Plano Pro',cat:'Pro',icon:'✦',url:'pro.html'}];

function buildSearch(){const ov=document.createElement('div');ov.className='search-overlay';ov.id='farpa-search';ov.innerHTML='<div class="search-box"><div class="search-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input id="farpa-search-input" type="search" autocomplete="off" placeholder="Buscar páginas, módulos..." oninput="window.farpaSearch.query(this.value)"><button class="search-esc" onclick="window.farpaSearch.close()">ESC</button></div><div class="search-results" id="farpa-search-results"></div><div class="search-footer"><span>↑↓ navegar</span><span>↵ abrir</span><span>ESC fechar</span></div></div>';ov.addEventListener('click',e=>{if(e.target===ov)window.farpaSearch.close()});document.body.appendChild(ov)}
function renderResults(items,label){const c=document.getElementById('farpa-search-results');if(!c)return;c.innerHTML=(label?'<div class="search-hint-label">'+label+'</div>':'')+(items.length?items.map(r=>'<a href="'+r.url+'" class="search-result" onclick="window.farpaSearch.close()"><div class="sr-icon">'+r.icon+'</div><div><div class="sr-title">'+r.title+'</div><div class="sr-cat">'+r.cat+'</div></div></a>').join(''):'<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px">Nenhum resultado</div>')}

function openMobile(){const sb=document.getElementById('farpa-sidebar');if(sb){sb.classList.add('open');document.body.classList.add('sidebar-open')}const hb=document.getElementById('nav-hamburger');if(hb)hb.setAttribute('aria-expanded','true')}
function closeMobile(){const sb=document.getElementById('farpa-sidebar');if(sb){sb.classList.remove('open');document.body.classList.remove('sidebar-open')}const hb=document.getElementById('nav-hamburger');if(hb)hb.setAttribute('aria-expanded','false')}
function applyCollapse(){const sb=document.getElementById('farpa-sidebar');if(!sb)return;const c=localStorage.getItem('farpa_sb_col')==='1';sb.classList.toggle('collapsed',c);const ct=document.querySelector('.farpa-content');const tn=document.getElementById('farpa-topnav');if(ct)ct.style.marginLeft=c?'60px':'';if(tn)tn.style.left=c?'60px':''}
function toggleCollapse(){const sb=document.getElementById('farpa-sidebar');if(!sb)return;const c=sb.classList.toggle('collapsed');localStorage.setItem('farpa_sb_col',c?'1':'0');const ct=document.querySelector('.farpa-content');const tn=document.getElementById('farpa-topnav');if(ct)ct.style.marginLeft=c?'60px':'';if(tn)tn.style.left=c?'60px':''}

function init(){
  const t=isAC()?'alto-contraste':getTheme();
  document.documentElement.setAttribute('data-theme',t);
  document.addEventListener('DOMContentLoaded',()=>{
    buildSearch();updateThemeUI(document.documentElement.getAttribute('data-theme'));updateACUI(isAC());
    const lang=localStorage.getItem('farpa_lang')||'pt';document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.id==='lang-'+lang));
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();window.farpaSearch.open()}if(e.key==='Escape'){window.farpaSearch.close();closeMobile()}});
    document.addEventListener('click',e=>{try{const hb=document.getElementById('nav-hamburger');if(hb&&(hb===e.target||hb.contains(e.target))){const sb=document.getElementById('farpa-sidebar');if(sb&&sb.classList.contains('open'))closeMobile();else openMobile();return}if(window.innerWidth<=900){const sb=document.getElementById('farpa-sidebar');if(sb&&sb.classList.contains('open')&&!sb.contains(e.target))closeMobile()}}catch(err){}},{passive:true});
    document.addEventListener('click',e=>{const t=e.target;if(t&&(t.id==='nav-collapse-btn'||(t.closest&&t.closest('#nav-collapse-btn'))))toggleCollapse()},{passive:true});
    applyCollapse();
  });
}

window.farpaTheme={set:applyTheme,toggle:togglePicker,toggleAC,current:()=>document.documentElement.getAttribute('data-theme')||'claro'};
window.farpaSidebar={build:buildSidebar};
window.farpaTopnav={build:buildTopnav};
window.farpaSidebarMobile={open:openMobile,close:closeMobile};
window.farpaSearch={open(){const o=document.getElementById('farpa-search');if(!o)return;o.classList.add('open');renderResults(IDX.slice(0,8),'Sugestões');setTimeout(()=>{const i=document.getElementById('farpa-search-input');if(i)i.focus()},80)},close(){const o=document.getElementById('farpa-search');if(o)o.classList.remove('open');const i=document.getElementById('farpa-search-input');if(i)i.value=''},query(q){if(!q.trim()){renderResults(IDX.slice(0,8),'Sugestões');return}const m=IDX.filter(r=>r.title.toLowerCase().includes(q.toLowerCase())||r.cat.toLowerCase().includes(q.toLowerCase())).slice(0,9);renderResults(m,m.length+' resultado'+(m.length!==1?'s':''))}};
init();
})();
