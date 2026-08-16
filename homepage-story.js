(() => {
  const init=()=>{
    const main=document.querySelector('main');
    if(!main) return;
    document.documentElement.classList.add('medlife-story');
    const sections=[...main.querySelectorAll(':scope > section')];
    sections.forEach(s=>s.classList.add('story-section'));
    const style=document.createElement('style');style.id='medlife-story-style';style.textContent=`
      .medlife-story{scroll-behavior:smooth}.story-section{transition:opacity .65s ease,transform .65s ease}.story-section:not(.is-story-active){opacity:.97;transform:translateY(7px)}.story-section.is-story-active{opacity:1;transform:none}
      .ml-gallery{justify-content:center}.ml-gallery-card{flex-basis:min(350px,30vw)}
      @media(max-width:1050px){.ml-gallery{justify-content:flex-start}.ml-gallery-card{flex-basis:min(350px,43vw)}}
      @media(max-width:700px){.ml-gallery{justify-content:flex-start}.ml-gallery-card{flex-basis:82vw}}
      @media(prefers-reduced-motion:reduce){.medlife-story{scroll-behavior:auto}.story-section{transition:none!important;transform:none!important;opacity:1!important}}
    `;document.head.appendChild(style);
    const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('is-story-active',e.isIntersecting)),{rootMargin:'-18% 0px -55% 0px',threshold:.08});sections.forEach(s=>io.observe(s));sections[0]?.classList.add('is-story-active');
  };if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
