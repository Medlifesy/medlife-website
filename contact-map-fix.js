(() => {
  'use strict';

  const BRAND = '/logo.PNG?v=20260831-contact4';

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
    if(document.getElementById('medlife-contact-redesign-style')) return;
    const st=document.createElement('style');
    st.id='medlife-contact-redesign-style';
    st.textContent=`
      :root{--ml-navy:#12203a;--ml-blue:#0d668c;--ml-cyan:#1b9ac0;--ml-pink:#e83d63;--ml-soft:#f5f8fb;--ml-line:#e3eaf1}
      body{background:var(--ml-soft);color:var(--ml-navy)}
      body > header.hero{background:linear-gradient(135deg,#12203a 0%,#163b5f 68%,#0d668c 100%);padding:82px 20px 76px;text-align:center}
      body > header.hero:before,body > header.hero:after{border-color:rgba(255,255,255,.08)}
      body > header.hero .hero-inner{max-width:900px}
      #medlife-contact-branding{display:flex;justify-content:center;margin:0 auto 22px;position:relative;z-index:5}
      #medlife-contact-branding a{display:inline-flex;text-decoration:none}
      .medlife-contact-brand-circle{width:168px;height:168px;border-radius:50%;background:#fff;display:grid;place-items:center;padding:15px;border:4px solid rgba(255,255,255,.96);box-shadow:0 22px 56px rgba(0,0,0,.26);position:relative;overflow:visible;animation:medlifeContactBounce 3s ease-in-out infinite}
      .medlife-contact-brand-circle:before{content:"";position:absolute;inset:-12px;border-radius:50%;border:1px solid rgba(255,255,255,.28)}
      .medlife-contact-brand-circle img{width:100%;height:100%;object-fit:contain;display:block;border-radius:50%;background:#fff}
      @keyframes medlifeContactBounce{0%,100%{transform:translateY(0)}12%{transform:translateY(-12px)}22%{transform:translateY(0)}31%{transform:translateY(-6px)}40%,100%{transform:translateY(0)}}
      .hero h1{margin:6px 0 12px;color:#fff;letter-spacing:-.2px}
      .hero p{max-width:760px;color:rgba(255,255,255,.9)}
      .back{background:#fff;color:var(--ml-navy)}
      .wrap{max-width:1220px;padding:42px 18px 78px}
      .grid{grid-template-columns:minmax(0,1.12fr) minmax(360px,.88fr);gap:26px;align-items:start}
      .card{border:1px solid var(--ml-line);border-radius:24px;background:#fff;box-shadow:0 16px 42px rgba(18,32,58,.08);padding:25px}
      .card h2{color:var(--ml-navy);font-size:24px}
      .lead{color:#687587;line-height:1.95}
      .map-shell{border:1px solid #dbe6ee;border-radius:20px;box-shadow:0 10px 28px rgba(18,32,58,.06);background:#eef6f9}
      #syriaMap{height:620px;background:#eaf4f7}
      .map-badge{top:14px;right:14px;background:rgba(255,255,255,.96);color:var(--ml-navy);border:1px solid #e1e8ef}
      .map-card-title,.contact-card-title{display:flex;align-items:center;gap:11px;margin-bottom:10px}
      .map-card-title img,.contact-card-title img{width:44px;height:44px;border-radius:50%;background:#fff;object-fit:contain;padding:5px;border:2px solid var(--ml-pink);box-shadow:0 6px 14px rgba(18,32,58,.1)}
      .map-card-title h2,.contact-card-title h2{margin:0}
      .contact-list{gap:10px}
      .item{padding:14px;border-radius:16px;border-color:#e4ebf1;background:#fff}
      .icon{background:#edf7fb;color:var(--ml-blue)}
      .forum-card{border-color:#d8e8ee;background:linear-gradient(135deg,#f4fbfd,#fff)}
      .social a{background:#fff;border-color:#e4ebf1}
      .note{background:#f1f8fb;color:#4e697a}
      .medlife-map-logo-icon{background:transparent!important;border:0!important;overflow:visible!important}
      .medlife-map-logo-marker{position:relative;width:50px;height:58px;border-radius:50% 50% 50% 0;background:var(--ml-pink);border:3px solid #fff;box-shadow:0 9px 22px rgba(18,32,58,.3);display:grid;place-items:center;padding:7px;transform:rotate(-45deg)}
      .medlife-map-logo-marker:after{content:"";position:absolute;width:12px;height:12px;border-radius:50%;background:#fff;left:16px;top:16px;z-index:0}
      .medlife-map-logo-marker img{position:relative;z-index:1;width:100%;height:100%;object-fit:contain;display:block;border-radius:50%;background:#fff;transform:rotate(45deg);padding:2px}
      .leaflet-marker-icon{overflow:visible!important}
      .leaflet-popup-content-wrapper{border-radius:16px;border:1px solid #e1e8ef;box-shadow:0 18px 42px rgba(18,32,58,.18)}
      .leaflet-popup-content{font-family:Cairo,Arial,sans-serif;line-height:1.8;margin:12px 14px}
      .leaflet-popup-close-button{color:var(--ml-navy)!important}
      @media(max-width:900px){.grid{grid-template-columns:1fr}#syriaMap{height:540px}}
      @media(max-width:560px){body > header.hero{padding:62px 16px 60px}.medlife-contact-brand-circle{width:138px;height:138px;padding:12px}.wrap{padding:28px 12px 58px}.card{padding:18px;border-radius:20px}#syriaMap{height:460px}}
      @media(prefers-reduced-motion:reduce){.medlife-contact-brand-circle{animation:none}}
    `;
    document.head.appendChild(st);
  }

  function addBranding(){
    injectStyles();
    if(document.getElementById('medlife-contact-branding')) return;
    const hero=document.querySelector('body > header.hero');
    const inner=hero?.querySelector('.hero-inner');
    if(!inner) return;
    const brand=document.createElement('div');
    brand.id='medlife-contact-branding';
    brand.innerHTML='<a href="/index.html" aria-label="مؤسسة ميدلايف - الرئيسية"><span class="medlife-contact-brand-circle"><img src="'+BRAND+'" alt="شعار مؤسسة ميدلايف"></span></a>';
    inner.prepend(brand);
  }

  function addSectionBranding(){
    const mapCard=document.querySelector('#syriaMap')?.closest('.card');
    const infoCard=document.querySelector('.contact-list')?.closest('.card');
    if(mapCard && !mapCard.querySelector('.map-card-title')){
      const h2=mapCard.querySelector('h2');
      if(h2){
        const wrap=document.createElement('div');
        wrap.className='map-card-title';
        wrap.innerHTML='<img src="'+BRAND+'" alt="MedLife"><div></div>';
        wrap.lastElementChild.appendChild(h2);
        mapCard.insertBefore(wrap,mapCard.querySelector('.lead')||mapCard.querySelector('.map-shell'));
      }
    }
    if(infoCard && !infoCard.querySelector('.contact-card-title')){
      const h2=infoCard.querySelector('h2');
      if(h2){
        const wrap=document.createElement('div');
        wrap.className='contact-card-title';
        wrap.innerHTML='<img src="'+BRAND+'" alt="MedLife"><div></div>';
        wrap.lastElementChild.appendChild(h2);
        infoCard.insertBefore(wrap,infoCard.querySelector('.lead')||infoCard.firstChild.nextSibling);
      }
    }
  }

  function initMap(){
    const el=document.getElementById('syriaMap');
    if(!el||el.dataset.ready==='1') return;

    const run=()=>{
      if(!window.L) return;
      el.dataset.ready='1';
      const locations=[
        ['ميدلايف طرطوس',34.8959,35.8867,'المكتب الرئيسي لمؤسسة ميدلايف في طرطوس.'],
        ['ميدلايف بانياس',35.1818,35.9486,'فريق ميدلايف في بانياس.'],
        ['ميدلايف اللاذقية',35.5317,35.7914,'فريق ميدلايف في اللاذقية.'],
        ['ميدلايف حمص',34.7324,36.7137,'فريق ميدلايف في حمص.'],
        ['ميدلايف دمشق',33.5138,36.2765,'فريق ميدلايف في دمشق.'],
        ['ميدلايف حلب',36.2021,37.1343,'فريق ميدلايف في حلب.'],
        ['ميدلايف الحسكة',36.5024,40.7477,'فريق ميدلايف في الحسكة.']
      ];
      const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true,minZoom:6,maxZoom:12});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);

      const iconHtml='<div class="medlife-map-logo-marker"><img src="'+BRAND+'" alt="MedLife"></div>';
      const icon=L.divIcon({className:'medlife-map-logo-icon',html:iconHtml,iconSize:[50,58],iconAnchor:[25,52],popupAnchor:[0,-48]});
      const bounds=[];

      locations.forEach(([name,lat,lng,desc])=>{
        bounds.push([lat,lng]);
        L.marker([lat,lng],{icon,title:name,alt:name}).addTo(map).bindPopup('<div dir="rtl"><strong style="font-size:16px;color:#12203a">'+name+'</strong><br><span style="color:#687587">'+desc+'</span></div>');
      });

      map.fitBounds(bounds,{paddingTopLeft:[30,30],paddingBottomRight:[30,30],maxZoom:7.8});
      setTimeout(()=>map.invalidateSize(),500);
      window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
    };

    if(window.L) run();
    else loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(run).catch(()=>{
      el.innerHTML='<div style="height:100%;display:grid;place-items:center;padding:24px;text-align:center;font-family:Cairo,sans-serif;color:#687587;background:#eef6f8;border-radius:18px">تعذر تحميل الخريطة حالياً. يمكنك التواصل معنا مباشرة عبر بيانات الاتصال.</div>';
    });
  }

  function init(){
    addBranding();
    addSectionBranding();
    initMap();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();