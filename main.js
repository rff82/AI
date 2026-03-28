/* farpa.ai — Landing Scripts v4.0 */
(function(){
'use strict';
/* Reveal */
const revealEls=document.querySelectorAll('.reveal');
if(revealEls.length){const ro=new IntersectionObserver(entries=>{entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*70);ro.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -40px 0px'});revealEls.forEach(el=>ro.observe(el))}
/* Mockup bars */
const barFills=document.querySelectorAll('.mockup-bar-fill');
if(barFills.length){const bo=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.width||'88%';bo.unobserve(e.target)}})},{threshold:.3});barFills.forEach(b=>bo.observe(b))}
/* Counters */
function animCounter(el,target,dur){dur=dur||1600;const t0=performance.now();const dec=target%1!==0;const suffix=el.dataset.suffix||'';function step(now){const p=Math.min((now-t0)/dur,1),e=1-Math.pow(1-p,3),cur=target*e;el.textContent=dec?cur.toFixed(1)+'x':Math.floor(cur).toLocaleString('pt-BR')+suffix;if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)}
const nums=document.querySelectorAll('.hero-stat-num[data-count]');
if(nums.length){const so=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){animCounter(e.target,parseFloat(e.target.dataset.count));so.unobserve(e.target)}})},{threshold:.5});nums.forEach(el=>so.observe(el))}
/* Form — v4 fix: button always recovers */
const form=document.getElementById('waitlist-form');
if(form){form.addEventListener('submit',async e=>{e.preventDefault();const ni=form.querySelector('input[name="name"]'),ei=form.querySelector('input[name="email"]'),pi=form.querySelector('select[name="profile"]');const btn=form.querySelector('button[type="submit"]'),st=document.getElementById('waitlist-status');const email=(ei?.value||'').trim(),name=(ni?.value||'').trim()||'Interessado',profile=pi?.value||'Waitlist';if(!email||!email.includes('@')){if(ei)ei.style.borderColor='var(--accent-danger)';if(st)st.textContent='Digite um e-mail válido.';setTimeout(()=>{if(ei)ei.style.borderColor=''},1500);return}const orig=btn.textContent;btn.textContent='Enviando…';btn.disabled=true;if(st){st.textContent='';st.style.color='var(--text-3)'}try{const r=await fetch('https://api-leads.rfelipefernandes.workers.dev/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,interest:'Waitlist · '+profile})});const res=await r.json();if(r.ok){btn.textContent='✓ Cadastrado!';if(st){st.textContent='Perfeito — vamos priorizar seu acesso.';st.style.color='var(--accent-success)'}if(ni)ni.value='';ei.value='';if(pi)pi.selectedIndex=0;setTimeout(()=>{btn.textContent=orig;btn.disabled=false},4000)}else throw new Error(res.error||'Erro')}catch(err){btn.textContent='Erro. Tente novamente';if(st){st.textContent='Não foi possível enviar.';st.style.color='var(--accent-danger)'}setTimeout(()=>{btn.textContent=orig;btn.disabled=false;if(st)st.textContent=''},3000)}})}
/* FAQ */
document.querySelectorAll('.faq-item').forEach(item=>{item.addEventListener('toggle',()=>{if(!item.open)return;document.querySelectorAll('.faq-item').forEach(o=>{if(o!==item)o.open=false})})});
/* Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(link=>{link.addEventListener('click',e=>{const id=link.getAttribute('href').slice(1);const t=document.getElementById(id);if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-64,behavior:'smooth'})}})});
/* Version display */
fetch('version.json').then(r=>r.json()).then(d=>{const v=document.querySelector('.footer-version');if(v&&d.version)v.textContent=d.version+' · '+d.date}).catch(()=>{});
})();
