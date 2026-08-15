/* Interactive enhancement layer for مؤسسة ميدلايف */
(function(){
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const root=document.documentElement;
  document.querySelectorAll('[data-reveal]').forEach((el,i)=>{el.style.setProperty('--delay',(i%6)*70+'ms');});
  if(!reduce && 'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(e=>io.observe(e));}
  else document.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-visible'));
  const hero=document.querySelector('[data-parallax]');
  if(hero&&!reduce){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();root.style.setProperty('--px',((e.clientX-r.left)/r.width-.5)*12+'px');root.style.setProperty('--py',((e.clientY-r.top)/r.height-.5)*12+'px')},{passive:true});}
  const counters=document.querySelectorAll('[data-count]');
  if(!reduce&&'IntersectionObserver' in window){const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,t=Number(el.dataset.count),suffix=el.dataset.suffix||'';let n=0;const tick=()=>{n=Math.min(t,n+Math.max(1,Math.ceil(t/40)));el.textContent=n+suffix;if(n<t)requestAnimationFrame(tick)};tick();co.unobserve(el)}),{threshold:.7});counters.forEach(e=>co.observe(e));}
  document.querySelectorAll('[data-gallery] img').forEach(img=>img.addEventListener('click',()=>{const box=document.createElement('div');box.className='ml-lightbox';box.innerHTML='<button aria-label="إغلاق">×</button><img alt="">';box.querySelector('img').src=img.src;box.querySelector('img').alt=img.alt;document.body.appendChild(box);const close=()=>box.remove();box.addEventListener('click',e=>{if(e.target===box||e.target.tagName==='BUTTON')close()});document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}})}));
})();
