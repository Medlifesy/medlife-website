(function(){
  'use strict';
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Motion */
  document.querySelectorAll('.card,.num,.press a,.vol').forEach((el,i)=>{el.classList.add('mlf-reveal');el.style.setProperty('--d',(i%6)*70+'ms')});
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('mlf-visible');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.mlf-reveal,.title').forEach(e=>io.observe(e))}else document.querySelectorAll('.mlf-reveal').forEach(e=>e.classList.add('mlf-visible'));
  if(!reduce){document.querySelectorAll('.card,.press a').forEach(el=>{el.addEventListener('pointermove',e=>{if(innerWidth<800)return;const r=el.getBoundingClientRect(),x=e.clientX/r.width-r.left/r.width-.5,y=e.clientY/r.height-r.top/r.height-.5;el.style.transform=`perspective(800px) rotateX(${(-y*2.5).toFixed(2)}deg) rotateY(${(x*2.5).toFixed(2)}deg) translateY(-6px)`},{passive:true});el.addEventListener('pointerleave',()=>el.style.transform='')});}
  const hero=document.querySelector('.hero');if(hero&&!reduce){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--x',((e.clientX-r.left)/r.width*100)+'%');hero.style.setProperty('--y',((e.clientY-r.top)/r.height*100)+'%')},{passive:true})}
  const nums=document.querySelectorAll('.num strong');if(!reduce&&'IntersectionObserver' in window){const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,m=el.textContent.match(/\d+/);if(!m)return;const t=+m[0];if(t<10)return;let n=0;const step=Math.max(1,Math.ceil(t/35));el.textContent='0';const tick=()=>{n=Math.min(t,n+step);el.textContent=n+(el.dataset.suffix||'');if(n<t)requestAnimationFrame(tick)};tick();co.unobserve(el)}),{threshold:.8});nums.forEach(e=>co.observe(e))}

  /* Media archive + real photos */
  const mediaData=[
    {title:'سانا — فعالية الوقاية من أضرار أشعة الشمس',date:'5 تموز 2026',source:'الوكالة العربية السورية للأنباء',url:'https://sana.sy/governorates/tartus/2519122/',icon:'fa-sun',img:'https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg'},
    {title:'سانا — افتتاح منتدى المطالعة في طرطوس',date:'22 شباط 2026',source:'الوكالة العربية السورية للأنباء',url:'https://sana.sy/culture-and-arts/2409961/',icon:'fa-book-open',img:'https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg'},
    {title:'سانا — إفطار خيري للأطفال من ذوي الإعاقة',date:'23 شباط 2026',source:'الوكالة العربية السورية للأنباء',url:'https://sana.sy/locals/2411073/',icon:'fa-heart',img:'https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg'},
    {title:'سانا — نشاط طبي ترفيهي للمسنين في حمص',date:'7 أيار 2026',source:'الوكالة العربية السورية للأنباء',url:'https://sana.sy/locals/2469615/',icon:'fa-people-roof',img:'https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg'},
    {title:'سانا — فعالية خيرية للأطفال المرضى في مشفى جامعة حمص',date:'14 أيار 2025',source:'الوكالة العربية السورية للأنباء',url:'https://sana.sy/governorates/homs/2218468/',icon:'fa-face-smile',img:'https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg'},
    {title:'صحيفة الثورة — برامج طبية جديدة لميدلايف',date:'14 تشرين الأول 2025',source:'صحيفة الثورة',url:'https://archive.thawra.sy/?p=731600',icon:'fa-newspaper',img:null},
    {title:'أخبار سورية الوطن — مبادرة بسمة أمل',date:'28 آذار 2025',source:'أخبار سورية الوطن',url:'https://syriahomenews.com/مبادرة-بسمة-أمل-في-مستشفى-الأطفال-ب/',icon:'fa-gift',img:null},
    {title:'شام تايمز — فعالية الأطفال المرضى في حمص',date:'14 أيار 2025',source:'شام تايمز',url:'https://n.chamtimes.com/660461/',icon:'fa-child-reaching',img:null},
    {title:'Med Life Syria — المنشورات والتحديثات',date:'منشورات المؤسسة',source:'LinkedIn',url:'https://sy.linkedin.com/company/med-life-syria',icon:'fa-linkedin-in',img:null},
    {title:'Med Life Syria — نشاط الحسكة',date:'27 شباط 2025',source:'منشور المؤسسة',url:'https://ae.linkedin.com/posts/med-life-syria_%D9%85%D9%8A%D8%AF%D9%84%D8%A7%D9%8A%D9%81-%D8%AA%D9%88%D8%B5%D9%84-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D8%AD%D8%B3%D9%83%D8%A9-%D9%84%D8%A3%D9%88%D9%84-%D9%85%D8%B1%D8%A9-%D9%85%D8%A4%D8%B3%D8%B3%D8%A9-activity-7301858821583376385-womS',icon:'fa-tooth',img:null}
  ];

  function addMediaArchive(){
    if(document.getElementById('mlf-media-archive')) return;
    const volunteer=document.querySelector('.vol')?.closest('.section');
    if(!volunteer) return;
    const section=document.createElement('section');
    section.className='section mlf-media-section';
    section.id='mlf-media-archive';
    section.innerHTML=`<div class="wrap"><div class="title"><div class="ey">توثيق إعلامي</div><h2>ميدلايف كما رآها الإعلام</h2><p>مجموعة من التغطيات الصحفية والمنشورات العامة التي وثّقت مبادرات وأنشطة مؤسسة ميدلايف. اضغط على أي بطاقة لقراءة الخبر الأصلي.</p></div><div class="mlf-media-grid">${mediaData.map((m,i)=>`<a class="mlf-media-card" href="${m.url}" target="_blank" rel="noopener noreferrer"><div class="mlf-media-image">${m.img?`<img src="${m.img}" alt="${m.title}" loading="lazy">`:`<div class="mlf-media-placeholder"><i class="fa-solid ${m.icon}"></i></div>`}<span class="mlf-media-badge">${m.source}</span></div><div class="mlf-media-body"><small>${m.date}</small><h3>${m.title}</h3><span>قراءة التغطية <i class="fa-solid fa-arrow-left"></i></span></div></a>`).join('')}</div><div class="mlf-media-note"><i class="fa-solid fa-circle-info"></i> الصور الظاهرة في هذا القسم مأخوذة من تغطيات منشورة عن أنشطة ميدلايف، مع رابط للمصدر الأصلي. عند تزويدنا بالصور الأصلية عالية الدقة من أرشيف المؤسسة يمكن استبدالها بمعرض ميدلايف الرسمي.</div></div>`;
    volunteer.parentNode.insertBefore(section,volunteer);
    addMediaStyles();
    if(!reduce && 'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('mlf-visible');io.unobserve(e.target)}}),{threshold:.08});section.querySelectorAll('.mlf-media-card').forEach((e,i)=>{e.classList.add('mlf-reveal');e.style.setProperty('--d',(i%5)*70+'ms');io.observe(e)})}else section.querySelectorAll('.mlf-media-card').forEach(e=>e.classList.add('mlf-visible'));
    section.querySelectorAll('.mlf-media-image img').forEach(img=>img.addEventListener('error',()=>{img.parentElement.innerHTML='<div class="mlf-media-placeholder"><i class="fa-solid fa-image"></i><span>صورة من الأرشيف الإعلامي</span></div>'}));
  }

  function addGallery(){
    if(document.getElementById('mlf-gallery')) return;
    const story=document.getElementById('story');
    if(!story) return;
    const section=document.createElement('section');section.className='section soft';section.id='mlf-gallery';
    section.innerHTML=`<div class="wrap"><div class="title"><div class="ey">صور من الرحلة</div><h2>لحظات صنعتها ميدلايف</h2><p>صور من التغطيات الإعلامية المتاحة حالياً، مع فتح الصورة بحجم كبير.</p></div><div class="mlf-gallery"><button type="button" data-img="https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg" data-caption="منتدى المطالعة في طرطوس — سانا"><img src="https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg" alt="منتدى المطالعة في طرطوس" loading="lazy"><span>منتدى المطالعة — طرطوس</span></button><button type="button" data-img="https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg" data-caption="صورة من تغطية سانا لأنشطة ميدلايف"><img src="https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg" alt="نشاط ميدلايف" loading="lazy"><span>من ذاكرة التغطيات الإعلامية</span></button><button type="button" data-img="https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg" data-caption="مؤسسة ميدلايف في الإعلام"><img src="https://cdn.sananews.sy/2026/02/IMG_1259-scaled.jpg" alt="مؤسسة ميدلايف" loading="lazy"><span>ميدلايف في الإعلام</span></button></div></div>`;
    story.parentNode.insertBefore(section,story.nextElementSibling);
    const modal=document.createElement('div');modal.className='mlf-lightbox';modal.innerHTML='<button aria-label="إغلاق">×</button><img alt=""><p></p>';document.body.appendChild(modal);
    const close=()=>modal.classList.remove('open');modal.querySelector('button').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};section.querySelectorAll('button').forEach(b=>b.onclick=()=>{modal.querySelector('img').src=b.dataset.img;modal.querySelector('p').textContent=b.dataset.caption;modal.classList.add('open')});
  }

  function addMediaStyles(){
    if(document.getElementById('mlf-media-styles')) return;
    const s=document.createElement('style');s.id='mlf-media-styles';s.textContent=`.mlf-media-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.mlf-media-card{display:block;background:#fff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 18px 55px #151d360d;transition:.35s}.mlf-media-card:hover{transform:translateY(-8px);box-shadow:0 28px 70px #151d3620}.mlf-media-image{height:205px;position:relative;overflow:hidden;background:linear-gradient(135deg,#151d36,#344267)}.mlf-media-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s}.mlf-media-card:hover img{transform:scale(1.06)}.mlf-media-badge{position:absolute;right:12px;top:12px;background:#ffffffeb;color:#151d36;padding:5px 10px;border-radius:999px;font-size:10px;font-weight:900}.mlf-media-placeholder{height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:#fff;font-size:38px}.mlf-media-placeholder span{font-size:12px;color:#dbe2ed}.mlf-media-body{padding:20px}.mlf-media-body small{color:#ff2a54;font-weight:900}.mlf-media-body h3{font-size:17px;color:#151d36;line-height:1.55;margin:6px 0 12px}.mlf-media-body span{color:#ff2a54;font-size:12px;font-weight:900}.mlf-media-note{margin-top:20px;padding:14px 18px;border-radius:16px;background:#fff;border:1px solid #e2e8f0;color:#64748b;font-size:12px}.mlf-media-note i{color:#ff2a54;margin-left:5px}.mlf-gallery{display:grid;grid-template-columns:1.35fr 1fr 1fr;gap:16px}.mlf-gallery button{position:relative;padding:0;border:0;border-radius:24px;overflow:hidden;cursor:pointer;min-height:240px;background:#151d36}.mlf-gallery button:first-child{min-height:500px}.mlf-gallery img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s}.mlf-gallery button:hover img{transform:scale(1.06)}.mlf-gallery button span{position:absolute;bottom:0;right:0;left:0;padding:32px 16px 15px;color:#fff;text-align:right;font-weight:900;background:linear-gradient(transparent,#151d36e8)}.mlf-lightbox{position:fixed;inset:0;background:#080b16ee;z-index:9999;display:none;align-items:center;justify-content:center;flex-direction:column;padding:25px}.mlf-lightbox.open{display:flex}.mlf-lightbox img{max-width:min(1000px,94vw);max-height:78vh;object-fit:contain;border-radius:16px;box-shadow:0 30px 100px #0008}.mlf-lightbox button{position:absolute;top:18px;left:20px;width:46px;height:46px;border:0;border-radius:50%;background:#fff;color:#151d36;font-size:30px;cursor:pointer}.mlf-lightbox p{color:#fff;margin:12px 0 0;font-size:13px}@media(max-width:800px){.mlf-media-grid,.mlf-gallery{grid-template-columns:1fr}.mlf-gallery button:first-child{min-height:280px}.mlf-gallery button{min-height:240px}}@media(prefers-reduced-motion:reduce){.mlf-media-card,.mlf-media-image img,.mlf-gallery img{transition:none}}`;
    document.head.appendChild(s);
  }

  addGallery();
  addMediaArchive();
})();