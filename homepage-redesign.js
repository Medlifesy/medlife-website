(() => {
  function gallery(){
    const box=document.querySelector('[data-home-gallery]'); if(!box)return;
    const meta={health:['الحملات الصحية','حضور ميدلايف في التوعية والخدمات الصحية.'],humanitarian:['الأنشطة الإنسانية','مبادرات إنسانية تضع احتياجات الناس أولاً.'],training:['التدريب والتعليم','بناء المعرفة والمهارات لدى المتطوعين والمجتمع.'],community:['المبادرات المجتمعية','تعاون تطوعي يصنع أثراً مستداماً في المجتمع.']};
    fetch('/api/gallery',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
      if(!d?.success||!Array.isArray(d.images)||!d.images.length)throw Error('empty');
      box.innerHTML=d.images.filter(x=>x?.url).slice(0,12).map((x,i)=>{const key=meta[x.category]?x.category:['health','humanitarian','training','community'][i%4],m=meta[key];return `<article class="ml-gallery-card"><img src="${x.url}" alt="${m[0]}" loading="lazy"><div class="ml-gallery-overlay"><h3>${m[0]}</h3><p>${m[1]}</p></div></article>`}).join('');
      let i=0;setInterval(()=>{if(document.hidden||box.matches(':hover')||box.children.length<2)return;i=(i+1)%box.children.length;box.scrollTo({left:box.children[i].offsetLeft,behavior:'smooth'})},3500);
    }).catch(()=>{box.innerHTML='<div class="ml-gallery-card" style="display:grid;place-items:center;padding:25px;cursor:default"><p style="color:#66748b;text-align:center">صور أنشطة ميدلايف ستظهر هنا عند توفرها.</p></div>';});
  }
  function reveal(){const els=document.querySelectorAll('.ml-reveal');if(!('IntersectionObserver'in window)){els.forEach(x=>x.classList.add('show'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});els.forEach(x=>io.observe(x));}
  function stats(){document.querySelectorAll('[data-count]').forEach(el=>{const target=Number(el.dataset.count);let start=0,step=Math.max(1,Math.ceil(target/45));const tick=()=>{start=Math.min(target,start+step);el.textContent=start.toLocaleString('en-US');if(start<target)requestAnimationFrame(tick)};new IntersectionObserver(es=>{if(es[0].isIntersecting){tick();es[0].target.closest('.ml-stat')?.removeAttribute('data-count-ready')}}).observe(el)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{gallery();reveal();stats()});else{gallery();reveal();stats()}
})();
