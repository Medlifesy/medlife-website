(() => {
  'use strict';

  const BRAND = '/logo.PNG?v=20260831-contact5';
  const locations = [
    ['ميدلايف طرطوس', 34.8959, 35.8867, 'المكتب الرئيسي لمؤسسة ميدلايف في طرطوس.'],
    ['ميدلايف بانياس', 35.1818, 35.9486, 'فريق ميدلايف في بانياس.'],
    ['ميدلايف اللاذقية', 35.5317, 35.7914, 'فريق ميدلايف في اللاذقية.'],
    ['ميدلايف حمص', 34.7324, 36.7137, 'فريق ميدلايف في حمص.'],
    ['ميدلايف دمشق', 33.5138, 36.2765, 'فريق ميدلايف في دمشق.'],
    ['ميدلايف حلب', 36.2021, 37.1343, 'فريق ميدلايف في حلب.'],
    ['ميدلايف الحسكة', 36.5024, 40.7477, 'فريق ميدلايف في الحسكة.']
  ];

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      if(window.L) return resolve();
      const s=document.createElement('script');
      s.src=src;
      s.async=true;
      s.onload=resolve;
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  function injectStyles(){
    if(document.getElementById('medlife-contact-v5-style')) return;
    const st=document.createElement('style');
    st.id='medlife-contact-v5-style';
    st.textContent=`
      :root{--mc-navy:#12203a;--mc-blue:#0d668c;--mc-cyan:#1b9ac0;--mc-pink:#e83d63;--mc-bg:#f4f7fa;--mc-line:#e5ebf1;--mc-muted:#667487}
      body{background:var(--mc-bg);color:var(--mc-navy)}
      body > .medlife-contact-v5{min-height:calc(100vh - 72px)}
      .mc-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#10203b 0%,#173a59 56%,#0d668c 100%);color:#fff}
      .mc-hero:before,.mc-hero:after{content:"";position:absolute;border:1px solid rgba(255,255,255,.11);border-radius:50%;pointer-events:none}
      .mc-hero:before{width:520px;height:520px;left:-220px;top:-320px}.mc-hero:after{width:360px;height:360px;right:-160px;bottom:-230px}
      .mc-hero-inner{position:relative;z-index:1;width:min(1120px,calc(100% - 32px));margin:auto;text-align:center;padding:48px 0 54px}
      .mc-brand{display:flex;justify-content:center;margin:2px auto 20px}
      .mc-brand-bubble{width:150px;height:150px;border-radius:50%;background:#fff;padding:13px;border:4px solid rgba(255,255,255,.9);box-shadow:0 20px 50px rgba(0,0,0,.22);animation:mcBounce 2.9s ease-in-out infinite}
      .mc-brand-bubble img{width:100%;height:100%;object-fit:contain;border-radius:50%;display:block}
      @keyframes mcBounce{0%,100%{transform:translateY(0)}12%{transform:translateY(-12px)}23%{transform:translateY(0)}33%{transform:translateY(-6px)}43%,100%{transform:translateY(0)}}
      .mc-hero-kicker{display:inline-block;padding:7px 14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);border-radius:999px;font:800 12px Cairo,sans-serif}
      .mc-hero h1{margin:14px 0 8px;font:900 clamp(34px,5vw,54px)/1.2 Cairo,sans-serif;letter-spacing:-.4px}.mc-hero p{max-width:720px;margin:0 auto;color:rgba(255,255,255,.88);font:500 15px/2 Cairo,sans-serif}
      .mc-page{width:min(1180px,calc(100% - 32px));margin:auto;padding:38px 0 72px}
      .mc-section-head{text-align:center;margin:0 auto 22px}.mc-eyebrow{display:inline-block;color:var(--mc-blue);font:800 11px Cairo,sans-serif;letter-spacing:.2px}.mc-section-head h2{margin:5px 0 6px;font:900 29px/1.35 Cairo,sans-serif;color:var(--mc-navy)}.mc-section-head p{max-width:700px;margin:auto;color:var(--mc-muted);font:500 13px/1.9 Cairo,sans-serif}
      .mc-map-card{background:#fff;border:1px solid var(--mc-line);border-radius:26px;box-shadow:0 18px 55px rgba(18,32,58,.08);overflow:hidden}
      .mc-map-top{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 22px;border-bottom:1px solid var(--mc-line)}
      .mc-map-title{display:flex;align-items:center;gap:11px}.mc-map-title img{width:44px;height:44px;border-radius:50%;padding:5px;background:#fff;border:2px solid rgba(232,61,99,.85);box-shadow:0 6px 16px rgba(18,32,58,.12)}.mc-map-title strong{display:block;font:900 17px Cairo,sans-serif}.mc-map-title span{display:block;margin-top:2px;color:var(--mc-muted);font:500 11px Cairo,sans-serif}
      .mc-map-legend{font:800 11px Cairo,sans-serif;color:var(--mc-blue);white-space:nowrap}
      .mc-map-wrap{padding:0}.mc-map{height:600px;width:100%;direction:ltr}.leaflet-container{font-family:Cairo,Arial,sans-serif;background:#e8f3f7}.leaflet-control-zoom a{font-family:Arial,sans-serif}.leaflet-popup-content-wrapper{border-radius:16px;box-shadow:0 16px 42px rgba(18,32,58,.18)}.leaflet-popup-content{margin:13px 15px;line-height:1.8}
      .mc-marker{position:relative;width:48px;height:58px;background:var(--mc-pink);border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 9px 20px rgba(232,61,99,.3);display:grid;place-items:center;padding:6px}
      .mc-marker:before{content:"";position:absolute;inset:5px;border-radius:50% 50% 50% 0;background:#fff}
      .mc-marker img{position:relative;z-index:1;width:28px;height:28px;object-fit:contain;background:#fff;border-radius:50%;transform:rotate(45deg);display:block;padding:2px}
      .mc-info-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:22px;margin-top:30px}
      .mc-card{background:#fff;border:1px solid var(--mc-line);border-radius:24px;padding:24px;box-shadow:0 14px 38px rgba(18,32,58,.07)}
      .mc-card-head{display:flex;align-items:center;gap:10px;margin-bottom:18px}.mc-card-head img{width:40px;height:40px;border-radius:50%;padding:4px;background:#fff;border:2px solid rgba(232,61,99,.75)}.mc-card-head h3{margin:0;font:900 21px Cairo,sans-serif}.mc-card-head p{margin:2px 0 0;color:var(--mc-muted);font:500 11px Cairo,sans-serif}
      .mc-contact-list{display:grid;gap:10px}.mc-contact-row{display:flex;gap:12px;align-items:flex-start;padding:13px 0;border-bottom:1px solid #edf1f4}.mc-contact-row:last-child{border-bottom:0}.mc-contact-icon{width:42px;height:42px;border-radius:13px;background:#eef7fa;color:var(--mc-blue);display:grid;place-items:center;flex:0 0 auto}.mc-contact-row strong{display:block;font:900 12px Cairo,sans-serif}.mc-contact-row a,.mc-contact-row span{display:block;margin-top:2px;color:var(--mc-muted);font:600 11px/1.7 Cairo,sans-serif}.mc-contact-row a{color:var(--mc-blue)}
      .mc-social-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.mc-social{display:flex;align-items:center;gap:10px;padding:13px;border:1px solid #e8edf2;border-radius:15px;text-decoration:none;background:#fbfcfd;transition:.22s}.mc-social:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(18,32,58,.08);background:#fff}.mc-social i{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:#eef7fa;color:var(--mc-blue);font-size:18px}.mc-social strong{display:block;font:900 11px Cairo,sans-serif;color:var(--mc-navy)}.mc-social small{display:block;color:var(--mc-muted);font:500 9px Cairo,sans-serif;margin-top:2px}
      .mc-forum{margin-top:18px;padding:18px;border-radius:18px;background:linear-gradient(135deg,#f1fafc,#fff);border:1px solid #d9eaf0}.mc-forum h4{margin:0 0 6px;font:900 16px Cairo,sans-serif}.mc-forum p{margin:0;color:var(--mc-muted);font:500 11px/1.8 Cairo,sans-serif}.mc-forum-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.mc-forum-actions a{padding:8px 11px;border-radius:10px;background:var(--mc-blue);color:#fff;font:800 10px Cairo,sans-serif;text-decoration:none}.mc-forum-actions a.alt{background:#eaf6fa;color:var(--mc-blue)}
      .mc-note{margin-top:20px;padding:14px 16px;border-radius:15px;background:#edf7fa;color:#4b6778;font:600 11px/1.9 Cairo,sans-serif}
      @media(max-width:900px){.mc-info-grid{grid-template-columns:1fr}.mc-map{height:520px}.mc-map-top{align-items:flex-start;flex-direction:column}.mc-map-legend{white-space:normal}}
      @media(max-width:560px){.mc-hero-inner{padding:36px 0 44px}.mc-brand-bubble{width:126px;height:126px;padding:11px}.mc-page{width:min(100% - 20px,1180px);padding:28px 0 54px}.mc-map{height:430px}.mc-card{padding:18px;border-radius:20px}.mc-social-grid{grid-template-columns:1fr}.mc-section-head h2{font-size:25px}}
      @media(prefers-reduced-motion:reduce){.mc-brand-bubble{animation:none}}
    `;
    document.head.appendChild(st);
  }

  function buildPage(){
    injectStyles();
    const oldHero=document.querySelector('body > header.hero');
    const oldMain=document.querySelector('body > main.wrap');
    if(oldHero) oldHero.remove();
    if(oldMain) oldMain.remove();
    document.querySelectorAll('body > .mc-old-footer').forEach(el=>el.remove());

    const page=document.createElement('div');
    page.className='medlife-contact-v5';
    page.innerHTML=`
      <section class="mc-hero">
        <div class="mc-hero-inner">
          <div class="mc-brand"><a href="/index.html" aria-label="مؤسسة ميدلايف"><span class="mc-brand-bubble"><img src="${BRAND}" alt="شعار مؤسسة ميدلايف"></span></a></div>
          <span class="mc-hero-kicker">مؤسسة ميدلايف الطبية الخيرية التطوعية</span>
          <h1>تواصل معنا</h1>
          <p>نحن قريبون منك. استكشف فرق ميدلايف في المحافظات وتواصل معنا عبر قنواتنا الرسمية.</p>
        </div>
      </section>
      <main class="mc-page">
        <div class="mc-section-head">
          <div class="mc-eyebrow">حضور ميدلايف</div>
          <h2>تواجدنا في المحافظات السورية</h2>
          <p>تعرف على مواقع فرق ميدلايف وتواصل مع الفريق الأقرب إليك.</p>
        </div>
        <section class="mc-map-card">
          <div class="mc-map-top">
            <div class="mc-map-title"><img src="${BRAND}" alt="MedLife"><div><strong>خريطة فرق ميدلايف</strong><span>سبع نقاط تمثل مواقع حضور الفرق</span></div></div>
            <div class="mc-map-legend">اضغط على رمز الموقع لمعرفة الفريق</div>
          </div>
          <div class="mc-map-wrap"><div id="syriaMap" class="mc-map" aria-label="خريطة توزع فرق ميدلايف في سوريا"></div></div>
        </section>
        <section class="mc-info-grid">
          <article class="mc-card">
            <div class="mc-card-head"><img src="${BRAND}" alt="MedLife"><div><h3>معلومات التواصل</h3><p>المكتب الرئيسي والقنوات المباشرة</p></div></div>
            <div class="mc-contact-list">
              <div class="mc-contact-row"><div class="mc-contact-icon"><i class="fa-solid fa-building"></i></div><div><strong>المكتب الرئيسي — طرطوس</strong><span>المحكمة — خلف شركة الأعلاف</span><a href="tel:+963182222568">+963 182 222 568</a></div></div>
              <div class="mc-contact-row"><div class="mc-contact-icon"><i class="fa-solid fa-phone"></i></div><div><strong>الهاتف</strong><a href="tel:+963998942124">+963 998 942 124</a></div></div>
              <div class="mc-contact-row"><div class="mc-contact-icon"><i class="fa-solid fa-envelope"></i></div><div><strong>البريد الإلكتروني</strong><a href="mailto:info@medlifesy.org">info@medlifesy.org</a></div></div>
              <div class="mc-contact-row"><div class="mc-contact-icon"><i class="fa-brands fa-telegram"></i></div><div><strong>الاستشارات الطبية</strong><span>بوت الاستشارات الطبية</span><a href="https://t.me/Medlife2024bot" target="_blank" rel="noopener noreferrer">فتح البوت</a></div></div>
            </div>
            <div class="mc-forum"><h4>منتدى ميدلايف — طرطوس</h4><p>مساحة للتعلم والتدريب والأنشطة والفعاليات.</p><div class="mc-forum-actions"><a href="tel:+963182220555">اتصال</a><a href="tel:+963989913713">موبايل</a><a class="alt" href="mailto:Forum@medlifesy.org">إيميل المنتدى</a></div></div>
          </article>
          <article class="mc-card">
            <div class="mc-card-head"><img src="${BRAND}" alt="MedLife"><div><h3>منصاتنا الرسمية</h3><p>تابع أخبار ومبادرات ميدلايف</p></div></div>
            <div class="mc-social-grid">
              <a class="mc-social" href="https://www.facebook.com/medlifesy" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook"></i><div><strong>MedLife ميدلايف</strong><small>Facebook</small></div></a>
              <a class="mc-social" href="https://www.facebook.com/medlifesyathar" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook"></i><div><strong>Athar Medlife</strong><small>Facebook</small></div></a>
              <a class="mc-social" href="https://www.instagram.com/medlifesy" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-instagram"></i><div><strong>MedLife</strong><small>Instagram</small></div></a>
              <a class="mc-social" href="https://www.instagram.com/medlifesy_athar" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-instagram"></i><div><strong>Athar Medlife</strong><small>Instagram</small></div></a>
              <a class="mc-social" href="https://www.instagram.com/medlifesy_trends" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-instagram"></i><div><strong>ميدلايف تريند</strong><small>Instagram</small></div></a>
            </div>
            <div class="mc-note">المكتب الرئيسي في طرطوس، بينما تمثل الخريطة مواقع حضور فرق ميدلايف في المحافظات السبع.</div>
          </article>
        </section>
      </main>
    `;

    const nav=document.querySelector('body > header.medlife-global-header');
    if(nav) nav.insertAdjacentElement('afterend',page); else document.body.prepend(page);
  }

  function initMap(){
    const el=document.getElementById('syriaMap');
    if(!el || !window.L) return;
    const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true,minZoom:6,maxZoom:11});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    const icon=L.divIcon({className:'mc-marker-wrap',html:'<div class="mc-marker"><img src="'+BRAND+'" alt="MedLife"></div>',iconSize:[48,58],iconAnchor:[24,53],popupAnchor:[0,-48]});
    const bounds=[];
    locations.forEach(([name,lat,lng,desc])=>{
      bounds.push([lat,lng]);
      L.marker([lat,lng],{icon,title:name,alt:name}).addTo(map).bindPopup('<div dir="rtl"><strong style="display:block;font-size:15px;color:#12203a">'+name+'</strong><span style="color:#667487;font-size:11px">'+desc+'</span></div>');
    });
    map.fitBounds(bounds,{padding:[40,40],maxZoom:7.7});
    setTimeout(()=>map.invalidateSize(),350);
    window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
  }

  function init(){
    buildPage();
    const boot=()=>initMap();
    if(window.L) boot();
    else loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(boot).catch(()=>{});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();