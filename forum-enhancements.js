/* =========================================================
   MedLife Forum — lively visual enhancement layer
   Keeps the existing HTML/content intact.
========================================================= */
(function(){
  'use strict';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const style = document.createElement('style');
  style.id = 'medlife-forum-motion-styles';
  style.textContent = `
    .ml-reveal{opacity:0;transform:translateY(28px);transition:opacity .75s ease,transform .75s cubic-bezier(.2,.75,.25,1);transition-delay:var(--ml-delay,0ms)}
    .ml-visible{opacity:1!important;transform:none!important}
    .hero .ml-forum-glow{position:absolute;width:420px;height:420px;border-radius:50%;pointer-events:none;left:var(--mx,70%);top:var(--my,30%);transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,42,84,.13),transparent 68%);filter:blur(8px);transition:left .25s ease,top .25s ease;z-index:1}
    .hero{isolation:isolate}
    .brand-card{animation:mlFloat 6s ease-in-out infinite;}
    .floating.one{animation:mlFloatSmall 4.5s ease-in-out infinite}
    .floating.two{animation:mlFloatSmall 5.2s ease-in-out infinite reverse}
    .card,.study-main,.study-side-card,.event,.reading-card,.activity-card,.contact-card{will-change:transform}
    .card,.study-side-card,.event,.reading-card,.activity-card{transition:transform .25s ease,box-shadow .3s ease,border-color .3s ease}
    .card:hover,.study-side-card:hover,.event:hover,.reading-card:hover,.activity-card:hover{box-shadow:0 24px 60px rgba(21,29,54,.14);border-color:rgba(255,42,84,.25)}
    .stat-number{transition:transform .3s ease,color .3s ease}
    .stat:hover .stat-number{transform:scale(1.08);color:var(--red)}
    .section-head .eyebrow{display:inline-flex;align-items:center;gap:8px}
    .section-head .eyebrow::before{content:'';width:28px;height:3px;border-radius:99px;background:var(--red);box-shadow:0 0 0 5px rgba(255,42,84,.08)}
    .timeline-item{transition:transform .35s ease}
    .timeline-item:hover{transform:translateX(-5px)}
    .timeline-dot{transition:transform .3s ease,box-shadow .3s ease}
    .timeline-item:hover .timeline-dot{transform:scale(1.2);box-shadow:0 0 0 8px rgba(255,42,84,.10)}
    .btn{position:relative;overflow:hidden}
    .btn::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.25) 50%,transparent 65%);transform:translateX(-120%);transition:transform .65s ease}
    .btn:hover::after{transform:translateX(120%)}
    @keyframes mlFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-9px) rotate(.4deg)}}
    @keyframes mlFloatSmall{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @media(max-width:700px){.hero .ml-forum-glow{width:260px;height:260px}.brand-card{animation:none}.floating.one,.floating.two{animation:none}.timeline-item:hover{transform:none}}
    @media(prefers-reduced-motion:reduce){.ml-reveal{opacity:1;transform:none;transition:none}.brand-card,.floating.one,.floating.two{animation:none}.hero .ml-forum-glow{display:none}.btn::after{display:none}}
  `;
  document.head.appendChild(style);

  const revealTargets = document.querySelectorAll('.card,.study-feature,.study-side-card,.event,.reading-card,.activity-card,.contact-card,.section-head,.about-card,.study-main,.timeline-item');
  revealTargets.forEach((el,i)=>{el.classList.add('ml-reveal');el.style.setProperty('--ml-delay',Math.min(i%6,5)*70+'ms')});

  if(!reduce && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('ml-visible');io.unobserve(entry.target)}
    }),{threshold:.12,rootMargin:'0px 0px -35px'});
    revealTargets.forEach(el=>io.observe(el));
  } else revealTargets.forEach(el=>el.classList.add('ml-visible'));

  const hero=document.querySelector('.hero');
  if(hero && !reduce){
    const glow=document.createElement('div');
    glow.className='ml-forum-glow';
    hero.appendChild(glow);
    hero.addEventListener('pointermove',e=>{
      const r=hero.getBoundingClientRect();
      hero.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
      hero.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
    },{passive:true});
  }

  document.querySelectorAll('.card,.study-side-card,.event,.reading-card,.activity-card').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      if(reduce || window.innerWidth<850)return;
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(900px) rotateX(${(-y*2.4).toFixed(2)}deg) rotateY(${(x*2.4).toFixed(2)}deg) translateY(-6px)`;
    },{passive:true});
    el.addEventListener('pointerleave',()=>{el.style.transform=''});
  });

  /* Count-up only numeric stats, leaving ranges such as 9–8 untouched. */
  if(!reduce && 'IntersectionObserver' in window){
    const nodes=document.querySelectorAll('.stat-number');
    const counter=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target, raw=el.textContent.trim(), m=raw.match(/^(\d+)(\+)?$/);
      if(!m){counter.unobserve(el);return;}
      const target=parseInt(m[1],10), plus=m[2]||'';
      if(target<10){counter.unobserve(el);return;}
      let n=0;
      const step=Math.max(1,Math.ceil(target/28));
      const tick=()=>{n=Math.min(target,n+step);el.textContent=n+plus;if(n<target)requestAnimationFrame(tick)};
      el.textContent='0';requestAnimationFrame(tick);counter.unobserve(el);
    }),{threshold:.8});
    nodes.forEach(n=>counter.observe(n));
  }

  /* Add a subtle active progress indicator while scrolling through the forum. */
  if(!reduce){
    const bar=document.createElement('div');
    bar.setAttribute('aria-hidden','true');
    bar.style.cssText='position:fixed;top:0;right:0;left:0;height:3px;transform-origin:right center;transform:scaleX(0);background:linear-gradient(90deg,#FF2A54,#151D36);z-index:2000;pointer-events:none;';
    document.body.appendChild(bar);
    const update=()=>{const h=document.documentElement.scrollHeight-window.innerHeight;bar.style.transform=`scaleX(${h>0?window.scrollY/h:0})`};
    window.addEventListener('scroll',update,{passive:true});
    update();
  }
})();
