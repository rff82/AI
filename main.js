/* farpa.ai — Landing Page Scripts v1.2 */
(function(){
'use strict';
const revealEls=document.querySelectorAll('.reveal');
if(revealEls.length){
  const ro=new IntersectionObserver((entries)=>{entries.forEach((entry,i)=>{if(entry.isIntersecting){setTimeout(()=>entry.target.classList.add('visible'),i*80);ro.unobserve(entry.target);}});},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  revealEls.forEach(el=>ro.observe(el));
}
const barFills=document.querySelectorAll('.mockup-bar-fill');
if(barFills.length){
  const bo=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.style.width=entry.target.dataset.width||'88%';bo.unobserve(entry.target);}});},{threshold:0.3});
  barFills.forEach(b=>bo.observe(b));
}
function animateCounter(el,target,duration){
  duration=duration||1800;const startTime=performance.now();const isDecimal=target%1!==0;const suffix=el.dataset.suffix||'';
  function update(now){const elapsed=now-startTime;const progress=Math.min(elapsed/duration,1);const eased=1-Math.pow(1-progress,3);const current=target*eased;el.textContent=isDecimal?current.toFixed(1)+'x':Math.floor(current).toLocaleString('pt-BR')+suffix;if(progress<1)requestAnimationFrame(update);}
  requestAnimationFrame(update);
}
const statNums=document.querySelectorAll('.hero-stat-num[data-count]');
if(statNums.length){
  const so=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){animateCounter(entry.target,parseFloat(entry.target.dataset.count));so.unobserve(entry.target);}});},{threshold:0.5});
  statNums.forEach(el=>so.observe(el));
}
const form=document.getElementById('waitlist-form');
if(form){
  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const nameInput=form.querySelector('input[name="name"]'),emailInput=form.querySelector('input[name="email"]'),profileInput=form.querySelector('select[name="profile"]'),btn=form.querySelector('button[type="submit"]'),status=document.getElementById('waitlist-status');
    const email=(emailInput?.value||'').trim(),name=(nameInput?.value||'').trim()||'Interessado Farpa',profile=profileInput?.value||'Waitlist';
    if(!email||!email.includes('@')){emailInput.style.borderColor='#ff3b3b';if(status)status.textContent='Digite um e-mail válido.';setTimeout(()=>emailInput.style.borderColor='',1500);return;}
    const orig=btn.textContent;btn.textContent='Enviando…';btn.disabled=true;
    if(status)status.textContent='Enviando seus dados...';
    try{
      const response=await fetch('https://api-leads.rfelipefernandes.workers.dev/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,interest:'Waitlist · '+profile})});
      const result=await response.json();
      if(response.ok){btn.textContent='✓ Acesso solicitado';btn.style.background='#0a0a0a';btn.style.color='var(--farpa)';if(status)status.textContent='Perfeito — recebemos seus dados e vamos priorizar seu acesso.';if(nameInput)nameInput.value='';emailInput.value='';if(profileInput)profileInput.selectedIndex=0;emailInput.placeholder='Você entrou na lista!';}
      else throw new Error(result.error||'Erro ao enviar');
    }catch(error){btn.textContent='Erro. Tente novamente';btn.style.background='#ff3b3b';if(status)status.textContent='Não foi possível enviar. Tente novamente.';setTimeout(()=>{btn.textContent=orig;btn.style.background='';btn.disabled=false;},3000);return;}
    setTimeout(()=>{btn.textContent=orig;btn.style.background='';btn.style.color='';btn.disabled=false;},3500);
  });
}
document.querySelectorAll('.faq-item').forEach(item=>{item.addEventListener('toggle',()=>{if(!item.open)return;document.querySelectorAll('.faq-item').forEach(other=>{if(other!==item)other.open=false;});});});
document.querySelectorAll('a[href^="#"]').forEach(link=>{link.addEventListener('click',(e)=>{const id=link.getAttribute('href').slice(1);const target=document.getElementById(id);if(target){e.preventDefault();const y=target.getBoundingClientRect().top+window.scrollY-54-16;window.scrollTo({top:y,behavior:'smooth'});}});});
})();
