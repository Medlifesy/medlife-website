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
  function polishHomepage(){
    const gallerySection=document.getElementById('homepageGallery');
    const heading=gallerySection?.querySelector('.ml-heading');
    if(heading){
      Object.assign(heading.style,{display:'block',width:'min(780px,100%)',maxWidth:'780px',marginInline:'auto',marginLeft:'auto',marginRight:'auto',textAlign:'center',float:'none',direction:'rtl'});
      heading.querySelectorAll('.ml-eyebrow,h2,p').forEach(el=>Object.assign(el.style,{display:'block',width:'100%',textAlign:'center',marginLeft:'auto',marginRight:'auto'}));
      const title=heading.querySelector('h2'); if(title) title.style.margin='10px auto 14px';
      const description=heading.querySelector('p'); if(description){description.style.maxWidth='700px';description.style.margin='0 auto'}
    }
    const contact=document.getElementById('contact');
    const grid=contact?.querySelector('.ml-contact-grid');
    if(grid){
      const cards=grid.querySelectorAll('.ml-contact-card');
      if(cards[0]) cards[0].innerHTML=`<h3>مؤسسة ميدلايف</h3><div class="ml-contact-row"><div><small>العنوان</small><span>طرطوس — سوريا</span><span>المحكمة — خلف شركة الأعلاف</span></div></div><div class="ml-contact-row"><div><small>الهاتف</small><a class="ml-phone" href="tel:+963182222568">+963 182 222 568</a></div></div><div class="ml-contact-row"><div><small>الموبايل</small><a class="ml-phone" href="tel:+963998942124">+963 998 942 124</a></div></div><div class="ml-contact-row"><div><small>البريد الإلكتروني</small><a href="mailto:info@medlifesy.org">info@medlifesy.org</a></div></div><a class="ml-btn ml-btn-primary" href="contact.html">تفاصيل التواصل</a>`;
      if(cards[1]) cards[1].innerHTML=`<h3>منتدى ميدلايف — طرطوس</h3><div class="ml-contact-row"><div><small>العنوان</small><span>الجمعية — خلف مستوصف السل — جنوب الفقاسة</span></div></div><div class="ml-contact-row"><div><small>الهاتف</small><a class="ml-phone" href="tel:+963182220555">+963 182 220 555</a></div></div><div class="ml-contact-row"><div><small>الموبايل</small><a class="ml-phone" href="tel:+963989913713">+963 989 913 713</a></div></div><div class="ml-contact-row"><div><small>البريد الإلكتروني</small><a href="mailto:Forum@medlifesy.org">Forum@medlifesy.org</a></div></div><a class="ml-btn ml-btn-secondary" href="forum-v3.html">زيارة المنتدى</a>`;
    }
  }
  function reveal(){const els=document.querySelectorAll('.ml-reveal');if(!('IntersectionObserver'in window)){els.forEach(x=>x.classList.add('show'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});els.forEach(x=>io.observe(x));}
  function stats(){document.querySelectorAll('[data-count]').forEach(el=>{const target=Number(el.dataset.count);let start=0,step=Math.max(1,Math.ceil(target/45));const tick=()=>{start=Math.min(target,start+step);el.textContent=start.toLocaleString('en-US');if(start<target)requestAnimationFrame(tick)};new IntersectionObserver(es=>{if(es[0].isIntersecting){tick();es[0].target.closest('.ml-stat')?.removeAttribute('data-count-ready')}}).observe(el)})}
  function init(){gallery();polishHomepage();reveal();stats()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
