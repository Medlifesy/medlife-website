(() => {
  'use strict';
  const BRAND='/logo.PNG?v=20260831-contact7';
  const locations=[
    ['ميدلايف طرطوس',34.8959,35.8867,'المكتب الرئيسي لمؤسسة ميدلايف في طرطوس.'],
    ['ميدلايف بانياس',35.1818,35.9486,'فريق ميدلايف في بانياس.'],
    ['ميدلايف اللاذقية',35.5317,35.7914,'فريق ميدلايف في اللاذقية.'],
    ['ميدلايف حمص',34.7324,36.7137,'فريق ميدلايف في حمص.'],
    ['ميدلايف دمشق',33.5138,36.2765,'فريق ميدلايف في دمشق.'],
    ['ميدلايف حلب',36.2021,37.1343,'فريق ميدلايف في حلب.'],
    ['ميدلايف الحسكة',36.5024,40.7477,'فريق ميدلايف في الحسكة.']
  ];
  const load=src=>new Promise((ok,no)=>{if(window.L)return ok();const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  function css(){if(document.getElementById('ml-contact-v7-css'))return;const s=document.createElement('style');s.id='ml-contact-v7-css';s.textContent=`
    body{background:#fff!important;color:#111!important}
    body>header.hero{background:#fff!important;color:#111!important;padding:30px 18px 26px!important;text-align:center;border-bottom:1px solid #ededed!important}
    body>header.hero:before,body>header.hero:after{display:none!important}
    .hero .hero-inner{max-width:820px!important}
    #ml-contact-brand{display:flex;justify-content:center;margin:0 auto 14px}
    #ml-contact-brand .circle{width:126px;height:126px;border-radius:50%;background:#fff;border:3px solid #d92b47;padding:10px;display:grid;place-items:center;box-shadow:0 12px 28px rgba(0,0,0,.09);animation:mlFloat 3.2s ease-in-out infinite}
    #ml-contact-brand img{width:100%;height:100%;object-fit:contain;border-radius:50%}
    @keyframes mlFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .hero h1{margin:2px 0 6px!important;color:#111!important;font:900 clamp(31px,4.5vw,46px)/1.2 Cairo,sans-serif!important}.hero p{max-width:650px!important;color:#666!important;font:500 13px/1.9 Cairo,sans-serif!important}.back{margin-top:15px!important;background:#d92b47!important;color:#fff!important;box-shadow:none!important;border:0!important}
    body>main.wrap{max-width:1120px!important;padding:28px 18px 58px!important}
    .grid{display:block!important}
    .card{background:#fff!important;border:1px solid #ededed!important;border-radius:20px!important;box-shadow:0 7px 24px rgba(0,0,0,.045)!important;padding:20px!important;margin-bottom:20px!important}
    .card h2{margin:0 0 6px!important;color:#111!important;font-size:22px!important}.lead{color:#777!important;font-size:11px!important;line-height:1.9!important}
    .contact-list{display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:9px!important}.item{background:#fff!important;border:1px solid #ededed!important;border-radius:14px!important;box-shadow:none!important;padding:12px!important}.icon{background:#fff5f6!important;color:#d92b47!important}
    .item strong{color:#111!important;font-size:11px!important}.item small{color:#777!important}.item a{color:#333!important}.item a:hover{color:#d92b47!important}
    .forum-card{background:#fbfbfb!important;border:1px solid #ededed!important;border-radius:16px!important}.forum-icon{background:#fff!important;color:#d92b47!important}.forum-head h3{color:#111!important}.forum-head small,.forum-details span,.forum-details a{color:#666!important}.forum-actions a{background:#d92b47!important}.forum-actions a.alt{background:#fff!important;color:#d92b47!important;border:1px solid #efc3cc!important}
    .social a{background:#fff!important;border:1px solid #ededed!important;color:#111!important}.social i{color:#d92b47!important}.social small{color:#777!important}.note{background:#fbfbfb!important;color:#666!important;border:1px solid #ededed!important}
    #syriaMap{height:500px!important;background:#f3f3f3!important}.map-shell{border:1px solid #e6e6e6!important;border-radius:17px!important;box-shadow:none!important}.map-badge{background:#fff!important;color:#111!important;border:1px solid #ececec!important;box-shadow:0 5px 14px rgba(0,0,0,.06)!important}
    .mc-marker-wrap{background:transparent!important;border:0!important}.mc-location-pin{position:relative;width:42px;height:52px;background:#d92b47;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 7px 16px rgba(0,0,0,.2);display:grid;place-items:center}.mc-location-pin:after{content:"";position:absolute;inset:6px;border-radius:50% 50% 50% 0;background:#fff}.mc-location-pin i{position:relative;z-index:2;width:8px;height:8px;border-radius:50%;background:#d92b47;transform:rotate(45deg);display:block}.mc-location-pulse{position:absolute;inset:-6px;border:1px solid rgba(217,43,71,.25);border-radius:50%;animation:mlPinPulse 2.2s ease-out infinite}.leaflet-marker-icon{overflow:visible!important}.leaflet-popup-content{font-family:Cairo,Arial,sans-serif!important;margin:10px 13px!important}.leaflet-popup-content-wrapper{border-radius:12px!important}
    .mc-team-list{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-top:12px}.mc-team-list button{background:#fff;border:1px solid #e9e9e9;border-radius:11px;padding:9px 5px;color:#111;font:800 10px Cairo,sans-serif;cursor:pointer;transition:.2s}.mc-team-list button:before{content:"";width:7px;height:7px;background:#d92b47;border-radius:50%;display:block;margin:0 auto 6px}.mc-team-list button:hover,.mc-team-list button.active{border-color:#d92b47;color:#d92b47;transform:translateY(-2px)}
    .mc-clean-section{margin-top:22px}.mc-clean-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.mc-clean-card{background:#fff;border:1px solid #ededed;border-radius:17px;padding:17px}.mc-clean-card h3{margin:0 0 5px;font-size:16px}.mc-clean-card p{margin:0;color:#777;font-size:10px;line-height:1.8}.mc-clean-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px}.mc-clean-links a{padding:7px 9px;border:1px solid #e9e9e9;border-radius:8px;color:#222;font-size:9px;font-weight:800;text-decoration:none}.mc-clean-links a:hover{border-color:#d92b47;color:#d92b47}
    @keyframes mlPinPulse{0%{opacity:.65;transform:scale(.8)}100%{opacity:0;transform:scale(1.25)}}
    @media(max-width:760px){.contact-list{grid-template-columns:1fr!important}.mc-team-list{grid-template-columns:repeat(4,1fr)}.mc-clean-grid{grid-template-columns:1fr}#syriaMap{height:430px!important}}
    @media(max-width:440px){#ml-contact-brand .circle{width:110px;height:110px}.mc-team-list{grid-template-columns:repeat(2,1fr)}#syriaMap{height:390px!important}}
    @media(prefers-reduced-motion:reduce){#ml-contact-brand .circle,.mc-location-pulse{animation:none}}
  `;document.head.appendChild(s)}
  function build(){
    css();
    document.querySelector('body>header.hero')?.remove();document.querySelector('body>main.wrap')?.remove();
    const page=document.createElement('div');page.id='ml-contact-final-page';
    page.innerHTML=`
      <section class="ml-contact-hero">
        <header class="hero">
          <div class="hero-inner">
            <div id="ml-contact-brand"><a href="/index.html" aria-label="مؤسسة ميدلايف"><span class="circle"><img src="${BRAND}" alt="شعار مؤسسة ميدلايف"></span></a></div>
            <span class="eyebrow" style="color:#d92b47;background:#fff5f6;border-color:#f0ccd2">مؤسسة ميدلايف الطبية الخيرية التطوعية</span>
            <h1>تواصل <span style="color:#d92b47">معنا</span></h1>
            <p>نحن قريبون منك. تواصل مع فريق ميدلايف في محافظتك أو عبر قنواتنا الرسمية.</p>
          </div>
        </header>
      </section>
      <main class="wrap">
        <section class="card">
          <div style="text-align:center;margin-bottom:18px"><span style="display:block;color:#d92b47;font-size:10px;font-weight:800">حضور ميدلايف</span><h2>فرق ميدلايف في سوريا</h2><p class="lead">توزع فرقنا الميدانية في سبع محافظات سورية.</p></div>
          <div class="map-shell"><div id="syriaMap" aria-label="خريطة توزع فرق ميدلايف"></div><div class="map-badge">اضغط على الموقع للتفاصيل</div></div>
          <div class="mc-team-list">${locations.map((x,i)=>`<button type="button" data-team="${i}">${x[0].replace('ميدلايف ','')}</button>`).join('')}</div>
        </section>
        <section class="grid">
          <article class="card">
            <h2>كيف يمكننا مساعدتك؟</h2><p class="lead">اختر وسيلة التواصل الأنسب لك.</p>
            <div class="contact-list">
              <div class="item"><div class="icon"><i class="fa-solid fa-building"></i></div><div><strong>المكتب الرئيسي — طرطوس</strong><small>المحكمة — خلف شركة الأعلاف</small><a href="tel:+963182222568">+963 182 222 568</a></div></div>
              <div class="item"><div class="icon"><i class="fa-solid fa-phone"></i></div><div><strong>الهاتف</strong><a href="tel:+963998942124">+963 998 942 124</a></div></div>
              <div class="item"><div class="icon"><i class="fa-solid fa-envelope"></i></div><div><strong>البريد الإلكتروني</strong><a href="mailto:info@medlifesy.org">info@medlifesy.org</a></div></div>
              <div class="item"><div class="icon"><i class="fa-brands fa-telegram"></i></div><div><strong>الاستشارات الطبية</strong><small>بوت الاستشارات الطبية</small><a href="https://t.me/Medlife2024bot" target="_blank" rel="noopener noreferrer">فتح البوت</a></div></div>
            </div>
          </article>
          <article class="card">
            <h2>منتدى ميدلايف — طرطوس</h2><p class="lead">مساحة للتعلم والتدريب والأنشطة والفعاليات.</p>
            <div class="item"><div class="icon"><i class="fa-solid fa-location-dot"></i></div><div><strong>موقع المنتدى</strong><small>الجمعية — خلف مستوصف السل — جنوب الفقاسة</small></div></div>
            <div class="mc-clean-links"><a href="tel:+963182220555">اتصال</a><a href="tel:+963989913713">موبايل</a><a href="mailto:Forum@medlifesy.org">بريد المنتدى</a><a href="/forum-v3.html">زيارة المنتدى</a></div>
          </article>
        </section>
        <section class="mc-clean-section">
          <div class="mc-clean-grid">
            <article class="mc-clean-card"><h3>المنصات الرسمية</h3><p>تابع أخبار ومبادرات ميدلايف عبر قنواتنا الرقمية.</p><div class="mc-clean-links"><a href="https://www.facebook.com/medlifesy" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://www.instagram.com/medlifesy" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://www.instagram.com/medlifesy_trends" target="_blank" rel="noopener noreferrer">MedLife Trends</a></div></article>
            <article class="mc-clean-card"><h3>التعاون والشراكات</h3><p>نرحب بالتعاون مع الجهات الطبية والتعليمية والمجتمعية لتنفيذ مبادرات ذات أثر.</p><div class="mc-clean-links"><a href="mailto:info@medlifesy.org">تواصل للشراكات</a></div></article>
          </div>
        </section>
      </main>`;
    document.body.appendChild(page);
    return page;
  }
  function initMap(page){
    const el=page.querySelector('#syriaMap');if(!el||!window.L)return;
    const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true,minZoom:6,maxZoom:10});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    const icon=L.divIcon({className:'mc-marker-wrap',html:'<div class="mc-location-pin"><span class="mc-location-pulse"></span><i></i><img style="display:none" src="'+BRAND+'" alt=""></div>',iconSize:[42,52],iconAnchor:[21,47],popupAnchor:[0,-43]});
    const markers=[];const bounds=[];
    locations.forEach(([name,lat,lng,desc],i)=>{bounds.push([lat,lng]);const m=L.marker([lat,lng],{icon,title:name,alt:name}).addTo(map);m.bindPopup('<div dir="rtl"><strong style="display:block;font-size:14px;color:#111">'+name+'</strong><span style="color:#666;font-size:10px">'+desc+'</span></div>');m.on('click',()=>select(i));markers.push(m)});
    map.fitBounds(bounds,{padding:[30,30],maxZoom:7.4});
    function select(i){page.querySelectorAll('[data-team]').forEach((b,n)=>b.classList.toggle('active',n===i));const x=locations[i];map.setView([x[1],x[2]],8,{animate:true,duration:.45});markers[i].openPopup()}
    page.querySelectorAll('[data-team]').forEach((b,i)=>b.addEventListener('click',()=>select(i)));
    setTimeout(()=>map.invalidateSize(),300);window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
  }
  function init(){const page=build();const go=()=>initMap(page);if(window.L)go();else load('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(go).catch(()=>{})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
