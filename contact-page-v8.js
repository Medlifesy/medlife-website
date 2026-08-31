(() => {
  'use strict';

  const BRAND = '/logo.PNG?v=20260831-contact8';
  const locations = [
    ['ميدلايف طرطوس', 34.8959, 35.8867, 'المكتب الرئيسي لمؤسسة ميدلايف في طرطوس.'],
    ['ميدلايف بانياس', 35.1818, 35.9486, 'فريق ميدلايف في بانياس.'],
    ['ميدلايف اللاذقية', 35.5317, 35.7914, 'فريق ميدلايف في اللاذقية.'],
    ['ميدلايف حمص', 34.7324, 36.7137, 'فريق ميدلايف في حمص.'],
    ['ميدلايف دمشق', 33.5138, 36.2765, 'فريق ميدلايف في دمشق.'],
    ['ميدلايف حلب', 36.2021, 37.1343, 'فريق ميدلايف في حلب.'],
    ['ميدلايف الحسكة', 36.5024, 40.7477, 'فريق ميدلايف في الحسكة.']
  ];

  const loadLeaflet = src => new Promise((resolve, reject) => {
    if (window.L) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  function injectStyles() {
    if (document.getElementById('medlife-contact-v8-style')) return;
    const style = document.createElement('style');
    style.id = 'medlife-contact-v8-style';
    style.textContent = `
      #medlife-contact-v8{direction:rtl;background:#fffaf7;color:#10182f;min-height:100vh;font-family:Cairo,Arial,sans-serif;}
      #medlife-contact-v8 *{box-sizing:border-box}
      #medlife-contact-v8 .mc8-hero{background:#fffaf7;border-bottom:1px solid #eee4e0;padding:32px 18px 26px;text-align:center}
      #medlife-contact-v8 .mc8-wrap{width:min(1160px,calc(100% - 28px));margin:auto}
      #medlife-contact-v8 .mc8-brand{display:flex;justify-content:center;margin:0 auto 14px}
      #medlife-contact-v8 .mc8-brand a{display:inline-flex}
      #medlife-contact-v8 .mc8-logo{width:112px;height:112px;border-radius:50%;background:#fff;border:3px solid #e92850;padding:10px;box-shadow:0 10px 26px rgba(16,24,47,.10);animation:mc8float 4.2s ease-in-out infinite}
      #medlife-contact-v8 .mc8-logo img{width:100%;height:100%;object-fit:contain;border-radius:50%;display:block}
      @keyframes mc8float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      #medlife-contact-v8 .mc8-kicker{display:inline-block;padding:6px 12px;border-radius:999px;background:#fff0f3;border:1px solid #f4d7de;color:#e92850;font-size:11px;font-weight:900}
      #medlife-contact-v8 h1{margin:10px 0 5px;font-size:clamp(34px,5vw,50px);line-height:1.2;color:#10182f;font-weight:900}
      #medlife-contact-v8 h1 span{color:#e92850}
      #medlife-contact-v8 .mc8-hero p{margin:0 auto;max-width:690px;color:#69758b;font-size:13px;line-height:1.9}
      #medlife-contact-v8 .mc8-content{width:min(1160px,calc(100% - 28px));margin:auto;padding:34px 0 68px}
      #medlife-contact-v8 .mc8-title{text-align:center;margin-bottom:20px}
      #medlife-contact-v8 .mc8-title small{display:block;color:#e92850;font-size:10px;font-weight:900}
      #medlife-contact-v8 .mc8-title h2{margin:3px 0 5px;font-size:27px;color:#10182f}
      #medlife-contact-v8 .mc8-title p{margin:0;color:#69758b;font-size:12px}
      #medlife-contact-v8 .mc8-main{display:grid;grid-template-columns:minmax(330px,.82fr) minmax(0,1.18fr);gap:20px;align-items:start}
      #medlife-contact-v8 .mc8-card{background:#fff;border:1px solid #e9e5e2;border-radius:22px;padding:21px;box-shadow:0 12px 35px rgba(16,24,47,.06)}
      #medlife-contact-v8 .mc8-map-card{grid-column:1;grid-row:1}
      #medlife-contact-v8 .mc8-contact-card{grid-column:2;grid-row:1}
      #medlife-contact-v8 .mc8-card-head{display:flex;align-items:center;gap:10px;margin-bottom:14px}
      #medlife-contact-v8 .mc8-card-head img{width:40px;height:40px;border-radius:50%;background:#fff;border:2px solid #e92850;padding:4px;object-fit:contain;box-shadow:0 5px 12px rgba(16,24,47,.07)}
      #medlife-contact-v8 .mc8-card-head h3{margin:0;color:#10182f;font-size:19px;font-weight:900}
      #medlife-contact-v8 .mc8-card-head p{margin:2px 0 0;color:#69758b;font-size:10px}
      #medlife-contact-v8 .mc8-map{height:420px;border-radius:17px;overflow:hidden;border:1px solid #e6e0dc;background:#f1f1f1;filter:none}
      #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:grayscale(1) saturate(0) contrast(.95) brightness(1.03)}
      #medlife-contact-v8 .leaflet-control-zoom a{color:#10182f!important;background:#fff!important;border-color:#eee!important}
      #medlife-contact-v8 .leaflet-popup-content-wrapper{border-radius:13px;box-shadow:0 12px 30px rgba(16,24,47,.14)}
      #medlife-contact-v8 .leaflet-popup-content{font-family:Cairo,Arial,sans-serif!important;line-height:1.75;margin:10px 13px}
      #medlife-contact-v8 .mc8-pin-wrap{background:transparent!important;border:0!important}
      #medlife-contact-v8 .mc8-pin{position:relative;width:42px;height:52px;background:#e92850;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 7px 16px rgba(16,24,47,.20);display:grid;place-items:center;padding:4px}
      #medlife-contact-v8 .mc8-pin img{position:relative;z-index:2;width:26px;height:26px;object-fit:contain;background:#fff;border-radius:50%;padding:2px;transform:rotate(45deg);display:block}
      #medlife-contact-v8 .mc8-pin:before{content:"";position:absolute;inset:-7px;border:1px solid rgba(233,40,80,.22);border-radius:50%;animation:mc8pulse 2.4s ease-out infinite}
      @keyframes mc8pulse{0%{opacity:.55;transform:scale(.82)}100%{opacity:0;transform:scale(1.22)}}
      #medlife-contact-v8 .mc8-team-list{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:10px}
      #medlife-contact-v8 .mc8-team-list button{border:1px solid #ebe6e3;background:#fff;color:#10182f;border-radius:10px;padding:8px 5px;cursor:pointer;font:800 10px Cairo,sans-serif;transition:.2s}
      #medlife-contact-v8 .mc8-team-list button:before{content:"";display:block;width:7px;height:7px;border-radius:50%;background:#e92850;margin:0 auto 5px}
      #medlife-contact-v8 .mc8-team-list button:hover,#medlife-contact-v8 .mc8-team-list button.active{border-color:#e92850;color:#e92850;transform:translateY(-2px)}
      #medlife-contact-v8 .mc8-contact-list{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}
      #medlife-contact-v8 .mc8-item{display:flex;gap:11px;align-items:flex-start;padding:14px 0;border-bottom:1px solid #efebea}
      #medlife-contact-v8 .mc8-item:nth-last-child(-n+2){border-bottom:0}
      #medlife-contact-v8 .mc8-icon{width:42px;height:42px;border-radius:13px;background:#fff0f3;color:#e92850;display:grid;place-items:center;flex:none}
      #medlife-contact-v8 .mc8-item strong{display:block;font-size:12px;color:#10182f}
      #medlife-contact-v8 .mc8-item small{display:block;font-size:10px;color:#69758b;line-height:1.7;margin-top:2px}
      #medlife-contact-v8 .mc8-item a{display:inline-block;color:#10182f;font-size:11px;font-weight:800;margin-top:2px}
      #medlife-contact-v8 .mc8-item a:hover{color:#e92850}
      #medlife-contact-v8 .mc8-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:18px}
      #medlife-contact-v8 .mc8-action{display:block;padding:11px 10px;border:1px solid #e9e4e1;border-radius:12px;background:#fff;color:#10182f;text-decoration:none;font-size:11px;font-weight:900;text-align:center;transition:.2s}
      #medlife-contact-v8 .mc8-action:hover{border-color:#e92850;color:#e92850;transform:translateY(-2px)}
      #medlife-contact-v8 .mc8-forum{margin-top:18px;padding:17px;border-radius:16px;background:#fff0f3;border:1px solid #f4d9df}
      #medlife-contact-v8 .mc8-forum h4{margin:0 0 4px;font-size:15px;color:#10182f}.mc8-forum p{margin:0;color:#69758b;font-size:10px;line-height:1.8}
      #medlife-contact-v8 .mc8-links{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.mc8-links a{padding:7px 10px;border-radius:9px;border:1px solid #e9e4e1;background:#fff;color:#10182f;font-size:10px;font-weight:900;text-decoration:none}.mc8-links a:hover{color:#e92850;border-color:#e92850}
      #medlife-contact-v8 .mc8-lower{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
      #medlife-contact-v8 .mc8-lower-card{background:#fff;border:1px solid #e9e5e2;border-radius:18px;padding:18px}
      #medlife-contact-v8 .mc8-lower-card h3{margin:0 0 5px;font-size:16px}.mc8-lower-card p{margin:0;color:#69758b;font-size:10px;line-height:1.8}
      #medlife-contact-v8 .mc8-quote{margin-top:18px;padding:18px;text-align:center;border-top:1px solid #eadfdc;color:#566071;font-size:12px;line-height:1.9}.mc8-quote strong{color:#10182f}
      @media(max-width:900px){#medlife-contact-v8 .mc8-main{grid-template-columns:1fr}.mc8-map-card,.mc8-contact-card{grid-column:1!important;grid-row:auto!important}.mc8-map-card{order:1}.mc8-contact-card{order:2}}
      @media(max-width:640px){#medlife-contact-v8 .mc8-contact-list{grid-template-columns:1fr}.mc8-item:nth-last-child(-n+2){border-bottom:1px solid #efebea}.mc8-item:last-child{border-bottom:0}.mc8-lower{grid-template-columns:1fr!important}.mc8-map{height:360px}.mc8-team-list{grid-template-columns:repeat(2,1fr)}.mc8-actions{grid-template-columns:1fr!important}.mc8-logo{width:100px;height:100px}}
      @media(prefers-reduced-motion:reduce){#medlife-contact-v8 .mc8-logo,#medlife-contact-v8 .mc8-pin:before{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function buildPage(){
    injectStyles();
    document.querySelector('body > header.hero')?.remove();
    document.querySelector('body > main.wrap')?.remove();
    document.getElementById('medlife-contact-v8')?.remove();

    const page=document.createElement('div');
    page.id='medlife-contact-v8';
    page.innerHTML=`
      <section class="mc8-hero">
        <div class="mc8-wrap">
          <div class="mc8-brand"><a href="/index.html" aria-label="مؤسسة ميدلايف"><span class="mc8-logo"><img src="${BRAND}" alt="شعار مؤسسة ميدلايف"></span></a></div>
          <span class="mc8-kicker">مؤسسة ميدلايف الطبية الخيرية التطوعية</span>
          <h1>تواصل <span>معنا</span></h1>
          <p>نحن قريبون منك. تواصل مع المؤسسة أو مع فريق ميدلايف في محافظتك عبر القنوات الرسمية.</p>
        </div>
      </section>
      <main class="mc8-content">
        <div class="mc8-title"><small>حضور ميدلايف</small><h2>ميدلايف في سوريا</h2><p>تعرّف على توزع فرقنا وتواصل مع الفريق الأقرب إليك.</p></div>
        <section class="mc8-main">
          <article class="mc8-card mc8-map-card">
            <div class="mc8-card-head"><img src="${BRAND}" alt="MedLife"><div><h3>خريطة فرق ميدلايف</h3><p>المواقع الميدانية في المحافظات</p></div></div>
            <div class="mc8-map" id="syriaMap" aria-label="خريطة توزع فرق ميدلايف في سوريا"></div>
            <div class="mc8-team-list">${locations.map((x,i)=>`<button type="button" data-team="${i}">${x[0].replace('ميدلايف ','')}</button>`).join('')}</div>
          </article>
          <article class="mc8-card mc8-contact-card">
            <div class="mc8-card-head"><img src="${BRAND}" alt="MedLife"><div><h3>معلومات التواصل</h3><p>المكتب الرئيسي والقنوات الرسمية</p></div></div>
            <div class="mc8-contact-list">
              <div class="mc8-item"><div class="mc8-icon"><i class="fa-solid fa-building"></i></div><div><strong>المكتب الرئيسي — طرطوس</strong><small>المحكمة — خلف شركة الأعلاف</small><a href="tel:+963182222568">+963 182 222 568</a></div></div>
              <div class="mc8-item"><div class="mc8-icon"><i class="fa-solid fa-phone"></i></div><div><strong>الهاتف</strong><a href="tel:+963998942124">+963 998 942 124</a></div></div>
              <div class="mc8-item"><div class="mc8-icon"><i class="fa-solid fa-envelope"></i></div><div><strong>البريد الإلكتروني</strong><a href="mailto:info@medlifesy.org">info@medlifesy.org</a></div></div>
              <div class="mc8-item"><div class="mc8-icon"><i class="fa-brands fa-telegram"></i></div><div><strong>الاستشارات الطبية</strong><small>بوت الاستشارات الطبية</small><a href="https://t.me/Medlife2024bot" target="_blank" rel="noopener noreferrer">فتح البوت</a></div></div>
            </div>
            <div class="mc8-actions">
              <a class="mc8-action" href="/support.html">صندوق الدعم</a>
              <a class="mc8-action" href="/join-options.html">الانضمام إلى ميدلايف</a>
              <a class="mc8-action" href="mailto:info@medlifesy.org?subject=تعاون%20مع%20ميدلايف">التعاون والشراكات</a>
              <a class="mc8-action" href="/forum-v3.html">زيارة المنتدى</a>
            </div>
            <div class="mc8-forum"><h4>منتدى ميدلايف — طرطوس</h4><p>مساحة للتعلم والتدريب والأنشطة والفعاليات.</p><div class="mc8-links"><a href="/forum-v3.html">زيارة المنتدى</a><a href="https://www.facebook.com/Medlifesyforum" target="_blank" rel="noopener noreferrer">صفحة المنتدى على Facebook</a><a href="mailto:Forum@medlifesy.org">بريد المنتدى</a></div></div>
          </article>
        </section>
        <section class="mc8-lower">
          <article class="mc8-lower-card"><h3>المنصات الرسمية</h3><p>تابع آخر المبادرات والأنشطة والمحتوى الطبي من حسابات ميدلايف الرسمية.</p><div class="mc8-links"><a href="https://www.facebook.com/medlifesy" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://www.instagram.com/medlifesy" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://www.instagram.com/medlifesy_trends" target="_blank" rel="noopener noreferrer">MedLife Trends</a></div></article>
          <article class="mc8-lower-card"><h3>كيف يمكننا مساعدتك؟</h3><p>للدعم أو الاستفسار أو الشراكات أو الانضمام، اختر المسار المناسب من الروابط أعلاه.</p><div class="mc8-links"><a href="/support-request.html">طلب مساعدة</a><a href="mailto:info@medlifesy.org">استفسار عام</a></div></article>
        </section>
        <div class="mc8-quote"><strong>نحن قريبون عندما نتواصل.</strong><br>بالعمل التطوعي نصنع الأثر.</div>
      </main>`;

    const nav=document.querySelector('body > header.medlife-global-header');
    if(nav) nav.insertAdjacentElement('afterend',page); else document.body.prepend(page);
    return page;
  }

  function initMap(page){
    const el=page.querySelector('#syriaMap');
    if(!el || !window.L || el.dataset.ready==='1') return;
    el.dataset.ready='1';
    const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true,minZoom:6,maxZoom:10});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    const icon=L.divIcon({className:'mc8-pin-wrap',html:'<div class="mc8-pin"><img src="'+BRAND+'" alt="MedLife"></div>',iconSize:[42,54],iconAnchor:[21,49],popupAnchor:[0,-44]});
    const markers=[];const bounds=[];
    locations.forEach(([name,lat,lng,desc],i)=>{
      bounds.push([lat,lng]);
      const marker=L.marker([lat,lng],{icon,title:name,alt:name}).addTo(map);
      marker.bindPopup('<div dir="rtl"><strong style="display:block;color:#10182f;font-size:14px">'+name+'</strong><span style="color:#69758b;font-size:10px">'+desc+'</span></div>');
      marker.on('click',()=>selectTeam(i));
      markers.push(marker);
    });
    map.fitBounds(bounds,{padding:[28,28],maxZoom:7.25});
    function selectTeam(i){
      page.querySelectorAll('[data-team]').forEach((b,n)=>b.classList.toggle('active',n===i));
      const item=locations[i];
      map.setView([item[1],item[2]],8,{animate:true,duration:.45});
      markers[i].openPopup();
    }
    page.querySelectorAll('[data-team]').forEach((b,i)=>b.addEventListener('click',()=>selectTeam(i)));
    setTimeout(()=>map.invalidateSize(),350);
    window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
  }

  function init(){
    const page=buildPage();
    const boot=()=>initMap(page);
    if(window.L) boot();
    else loadLeaflet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(boot).catch(()=>{});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();