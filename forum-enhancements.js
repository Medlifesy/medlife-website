/* MedLife Forum — interactive visual enhancements */
(function(){
  'use strict';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('.card, .study-feature, .study-side-card, .event, .reading-card, .activity-card, .contact-card');
  cards.forEach((el,i)=>{ el.classList.add('ml-reveal'); el.style.setProperty('--ml-delay', Math.min(i%6,5)*70+'ms'); });

  if(!reduce && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('ml-visible'); io.unobserve(e.target); }
    }),{threshold:.12, rootMargin:'0px 0px -40px'});
    document.querySelectorAll('.ml-reveal, .section-head, .study-main, .study-zone .study-side').forEach(el=>io.observe(el));
  } else document.querySelectorAll('.ml-reveal').forEach(el=>el.classList.add('ml-visible'));

  const hero = document.querySelector('.hero');
  if(hero && !reduce){
    const glow=document.createElement('div'); glow.className='ml-forum-glow'; hero.appendChild(glow);
    hero.addEventListener('pointermove', e=>{
      const r=hero.getBoundingClientRect();
      hero.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
      hero.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
    },{passive:true});
  }

  document.querySelectorAll('.card, .study-side-card, .event, .reading-card, .activity-card').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      if(reduce || window.innerWidth<800)return;
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(700px) rotateX(${(-y*3).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg) translateY(-5px)`;
    },{passive:true});
    el.addEventListener('pointerleave',()=>{el.style.transform='';});
  });

  const statNodes=document.querySelectorAll('.stat strong, .stats strong');
  if(!reduce && 'IntersectionObserver' in window){
    const counters=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const el=e.target, raw=el.textContent.trim(), m=raw.match(/([0-9]+)/);
      if(!m)return;
      const target=parseInt(m[1],10); if(target<10)return;
      let n=0; const step=Math.max(1,Math.ceil(target/35));
      const tick=()=>{n=Math.min(target,n+step);el.textContent=n+(raw.includes('+')?'+':'');if(n<target)requestAnimationFrame(tick);};
      el.textContent='0'; tick(); counters.unobserve(el);
    }),{threshold:.75});
    statNodes.forEach(el=>counters.observe(el));
  }
})();
