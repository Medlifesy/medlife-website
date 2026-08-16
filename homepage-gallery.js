(() => {
  const meta={health:['الحملات الصحية','لمحة من حضور ميدلايف في المبادرات الصحية والتوعية الطبية.'],humanitarian:['الأنشطة الإنسانية','لمحة من مبادرات الدعم والعطاء التي تضع احتياجات الناس أولاً.'],training:['التدريب والتعليم','لمحة من التدريب ونقل المعرفة وبناء مهارات المتطوعين.'],community:['المبادرات المجتمعية','لمحة من العمل التطوعي والتعاون لخدمة المجتمع.']};
  function init(){
    const section=document.getElementById('activities');
    if(!section)return;
    const title=section.querySelector('.section-title');
    if(title){const eyebrow=title.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='صورنا';const h2=title.querySelector('h2');if(h2)h2.textContent='لمحات من أنشطة ميدلايف';const p=title.querySelector('p');if(p)p.textContent='صور من الحملات والأنشطة والمبادرات التي نصنع من خلالها أثراً حقيقياً.';}
    const gallery=section.querySelector('.gallery');
    if(!gallery)return;
    const fallback=gallery.innerHTML;
    const style=document.createElement('style');style.textContent='.ml-home-gallery{display:flex!important;grid-template-columns:none!important;grid-auto-rows:none!important;gap:18px!important;overflow:hidden!important;padding:10px 2px 22px}.ml-home-gallery .gallery-card{flex:0 0 min(330px,78vw)!important;height:280px!important;grid-column:auto!important;grid-row:auto!important}.ml-home-gallery .gallery-card:nth-child(n){grid-column:auto!important;grid-row:auto!important}.ml-home-gallery .gallery-card img{width:100%;height:100%;object-fit:cover}.ml-home-gallery:hover .gallery-card{animation-play-state:paused}.ml-home-gallery .gallery-overlay{display:block}.ml-home-more{display:inline-flex;margin-top:22px;padding:11px 20px;border-radius:13px;background:#ff2a54;color:#fff;font:900 13px Cairo,sans-serif;box-shadow:0 12px 30px rgba(255,42,84,.22)}';document.head.appendChild(style);
    gallery.classList.add('ml-home-gallery');
    let more=section.querySelector('.ml-home-more');if(!more){more=document.createElement('a');more.className='ml-home-more';more.href='gallery.html';more.textContent='رؤية المزيد من الصور';section.querySelector('.wrap').appendChild(more)}
    fetch('/api/gallery',{cache:'no-store'}).then(r=>r.json()).then(d=>{
      if(!d||!d.success||!Array.isArray(d.images)||!d.images.length)throw Error('gallery');
      const images=d.images.filter(x=>x&&x.url).slice(0,10);
      if(!images.length)throw Error('gallery');
      gallery.innerHTML=images.map((x,i)=>{const key=x.category&&meta[x.category]?x.category:['health','humanitarian','training','community'][i%4],m=meta[key];return `<div class="gallery-card"><img src="${x.url}" alt="${m[0]}" loading="lazy"><div class="gallery-overlay"><h3>${m[0]}</h3><p>${m[1]}</p></div></div>`}).join('');
      let index=0;const cards=[...gallery.children];if(cards.length>1)setInterval(()=>{if(document.hidden||gallery.matches(':hover'))return;index=(index+1)%cards.length;gallery.scrollTo({left:cards[index].offsetLeft,behavior:'smooth'})},3200);
    }).catch(()=>{gallery.innerHTML=fallback;});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
