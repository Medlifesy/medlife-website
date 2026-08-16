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
  function addHomepageContent(){
    if(document.getElementById('ml-home-journey'))return;
    const about=document.getElementById('about'),programs=document.getElementById('programs');
    if(about&&programs){
      const section=document.createElement('section');section.id='ml-home-journey';section.className='ml-section ml-soft ml-reveal';
      section.innerHTML=`<div class="ml-wrap"><div class="ml-heading"><div class="ml-eyebrow">رحلتنا</div><h2>من مبادرة تطوعية إلى مؤسسة تعمل على الأرض</h2><p>بدأت ميدلايف كفكرة تطوعية، ثم تطورت لتصبح مساحة تجمع العمل الطبي والتطوعي والإنساني والتوعوي ضمن رؤية واحدة.</p></div><div class="ml-timeline"><article class="ml-timeline-item"><span>2019</span><div><h3>البداية</h3><p>انطلقت المبادرة بروح تطوعية هدفها تحويل المعرفة والطاقات الطبية إلى خدمة للمجتمع.</p></div></article><article class="ml-timeline-item"><span>2023</span><div><h3>الإشهار الرسمي</h3><p>انتقلت ميدلايف إلى مرحلة العمل المؤسسي المنظم بعد الإشهار الرسمي للمؤسسة.</p></div></article><article class="ml-timeline-item"><span>اليوم</span><div><h3>توسيع الأثر</h3><p>تستمر ميدلايف في تطوير برامجها، وبناء مجتمع من المتطوعين، والوصول إلى احتياجات صحية وإنسانية متنوعة.</p></div></article></div></div>`;
      programs.parentNode.insertBefore(section,programs);
    }
    const support=document.querySelector('.ml-support')?.closest('.ml-section');
    if(support){
      const impact=document.createElement('section');impact.id='ml-home-impact';impact.className='ml-section ml-reveal';
      impact.innerHTML=`<div class="ml-wrap"><div class="ml-heading"><div class="ml-eyebrow">أثرنا</div><h2>الأثر يبدأ من الناس</h2><p>لا نقيس العمل بعدد الأنشطة فقط؛ نهتم بمن وصلته الخدمة، وبالمعرفة التي انتشرت، وبالفرصة التي حصل عليها متطوع، وبالحاجة التي استطعنا الوصول إليها.</p></div><div class="ml-impact-grid"><article class="ml-impact-card"><strong>صحة</strong><h3>نقرّب المعلومة والخدمة الصحية</h3><p>من التوعية والفحوصات إلى الاستشارات والمبادرات الصحية، نعمل حيث تكون الحاجة واضحة.</p></article><article class="ml-impact-card"><strong>إنسان</strong><h3>نضع الاحتياج الإنساني في المركز</h3><p>نطوّر مبادرات تساعد الأشخاص والأسر الأكثر حاجة، مع التركيز على التنظيم والشفافية.</p></article><article class="ml-impact-card"><strong>معرفة</strong><h3>نبني قدرات المجتمع والمتطوعين</h3><p>التدريب والتعليم جزء أساسي من الاستدامة، لأن الأثر الأقوى هو الذي يستمر بعد انتهاء النشاط.</p></article></div></div>`;
      support.parentNode.insertBefore(impact,support);
    }
    const social=document.getElementById('social');
    if(social){
      const participate=document.createElement('section');participate.id='ml-home-participate';participate.className='ml-section ml-soft ml-reveal';
      participate.innerHTML=`<div class="ml-wrap"><div class="ml-heading"><div class="ml-eyebrow">شارك معنا</div><h2>هناك أكثر من طريقة لتكون جزءاً من الأثر</h2><p>سواء كنت طبيباً، طالباً، متطوعاً، مصمماً، مهندساً، شريكاً أو شخصاً يرغب بالمساهمة، يمكنك أن تجد مساحة تناسبك.</p></div><div class="ml-participate-grid"><a class="ml-participate-card" href="join-options.html"><span>01</span><h3>انضم إلى الفريق</h3><p>تعرّف على خيارات الانضمام وآلية التسجيل.</p></a><a class="ml-participate-card" href="support.html"><span>02</span><h3>ادعم حالة أو مشروعاً</h3><p>اطلع على الحالات والمشاريع المنشورة وآلية الدعم.</p></a><a class="ml-participate-card" href="forum-v3.html"><span>03</span><h3>شارك المعرفة</h3><p>ساهم في المنتدى والمحتوى والمبادرات التعليمية.</p></a><a class="ml-participate-card" href="contact.html"><span>04</span><h3>كن شريكاً</h3><p>تواصل معنا لبحث فرص التعاون والشراكة.</p></a></div></div>`;
      social.parentNode.insertBefore(participate,social);
    }
    const style=document.createElement('style');style.id='ml-home-extra-style';style.textContent=`
      #ml-home-journey .ml-timeline{max-width:920px;margin:0 auto;position:relative;padding:10px 0}
      #ml-home-journey .ml-timeline:before{content:"";position:absolute;top:0;bottom:0;right:31px;width:2px;background:linear-gradient(#ff2a54,#dbe3ec);opacity:.8}
      .ml-timeline-item{display:grid;grid-template-columns:90px 1fr;gap:24px;align-items:start;position:relative;margin:0 0 26px}
      .ml-timeline-item:last-child{margin-bottom:0}.ml-timeline-item>span{position:relative;z-index:2;width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:#fff;border:2px solid #ff2a54;color:#ff2a54;font:900 13px Cairo,sans-serif;box-shadow:0 10px 25px rgba(18,32,58,.08)}
      .ml-timeline-item>div{background:#fff;border:1px solid #e5eaf1;border-radius:20px;padding:22px 24px;box-shadow:0 12px 35px rgba(18,32,58,.06)}.ml-timeline-item h3{margin:0 0 5px;color:#12203a}.ml-timeline-item p{margin:0;color:#66748b;font-size:13px;line-height:2.05}
      .ml-impact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.ml-impact-card{border:1px solid #e5eaf1;border-radius:22px;background:#fff;padding:28px;transition:.3s;position:relative;overflow:hidden}.ml-impact-card:after{content:"";position:absolute;inset:auto -20px -50px auto;width:130px;height:130px;border-radius:50%;background:rgba(255,42,84,.055)}.ml-impact-card:hover{transform:translateY(-6px);box-shadow:0 20px 55px rgba(18,32,58,.09)}.ml-impact-card strong{color:#ff2a54;font-size:12px}.ml-impact-card h3{color:#12203a;font-size:20px;margin:9px 0}.ml-impact-card p{color:#66748b;font-size:13px;line-height:2.05;margin:0}
      .ml-participate-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.ml-participate-card{background:#fff;border:1px solid #e5eaf1;border-radius:20px;padding:24px;text-decoration:none;transition:.3s;position:relative}.ml-participate-card:hover{transform:translateY(-6px);border-color:#ffc0cd;box-shadow:0 18px 45px rgba(18,32,58,.08)}.ml-participate-card span{color:#ff2a54;font-weight:900;font-size:12px}.ml-participate-card h3{color:#12203a;font-size:17px;margin:8px 0 6px}.ml-participate-card p{color:#66748b;font-size:12px;line-height:1.95;margin:0}
      @media(max-width:900px){.ml-impact-grid{grid-template-columns:1fr 1fr}.ml-participate-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:650px){#ml-home-journey .ml-timeline:before{right:24px}.ml-timeline-item{grid-template-columns:70px 1fr;gap:14px}.ml-timeline-item>span{width:50px;height:50px;font-size:11px}.ml-timeline-item>div{padding:18px}.ml-impact-grid,.ml-participate-grid{grid-template-columns:1fr}.ml-impact-card,.ml-participate-card{padding:22px}}
    `;document.head.appendChild(style);
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
  function init(){addHomepageContent();gallery();polishHomepage();reveal();stats()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
