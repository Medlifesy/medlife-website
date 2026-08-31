(() => {
  'use strict';

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

  function addBranding(){
    if(document.getElementById('medlife-contact-branding')) return;
    const hero=document.querySelector('body > header.hero');
    if(!hero) return;
    const inner=hero.querySelector('.hero-inner');
    if(!inner) return;

    const brand=document.createElement('div');
    brand.id='medlife-contact-branding';
    brand.innerHTML='<a href="/index.html" aria-label="مؤسسة ميدلايف - الرئيسية"><span class="medlife-contact-brand-circle"><img src="/logo.PNG?v=20260831-contact" alt="شعار مؤسسة ميدلايف"></span></a>';

    const st=document.createElement('style');
    st.id='medlife-contact-branding-style';
    st.textContent=`
      #medlife-contact-branding{display:flex;justify-content:center;margin:0 auto 18px;position:relative;z-index:5}
      #medlife-contact-branding a{display:inline-flex;text-decoration:none}
      .medlife-contact-brand-circle{
        width:154px;height:154px;border-radius:50%;background:#fff;
        display:grid;place-items:center;padding:14px;
        border:4px solid rgba(255,255,255,.95);
        box-shadow:0 20px 55px rgba(0,0,0,.25);
        position:relative;overflow:visible;
        animation:medlifeContactBounce 2.7s ease-in-out infinite;
      }
      .medlife-contact-brand-circle:before{
        content:"";position:absolute;inset:-11px;border-radius:50%;
        border:1px solid rgba(255,255,255,.34);
      }
      .medlife-contact-brand-circle img{
        width:100%;height:100%;object-fit:contain;display:block;
        border-radius:50%;background:#fff;
      }
      @keyframes medlifeContactBounce{
        0%,100%{transform:translateY(0) scale(1)}
        12%{transform:translateY(-9px) scale(1.015)}
        24%{transform:translateY(0) scale(1)}
        36%{transform:translateY(-5px) scale(1.008)}
        48%,100%{transform:translateY(0) scale(1)}
      }
      .hero h1{margin-top:12px;letter-spacing:-.3px}
      .hero p{max-width:760px}
      .map-shell{box-shadow:0 14px 35px rgba(21,36,61,.08)}
      .map-card-title,.contact-card-title{display:flex;align-items:center;gap:12px;margin-bottom:18px}
      .map-card-title img,.contact-card-title img{width:42px;height:42px;border-radius:50%;background:#fff;object-fit:contain;padding:5px;border:2px solid #e83d63;box-shadow:0 6px 14px rgba(21,36,61,.12)}
      .map-card-title h2,.contact-card-title h2{margin:0}
      .medlife-map-logo-marker{
        position:relative;width:58px;height:58px;border-radius:50%;background:#fff;
        border:3px solid #e83d63;box-shadow:0 9px 22px rgba(21,36,61,.28);
        display:grid;place-items:center;padding:6px;overflow:visible;
      }
      .medlife-map-logo-marker:before{
        content:"";position:absolute;inset:-6px;border-radius:50%;
        border:1px solid rgba(232,61,99,.3);
      }
      .medlife-map-logo-marker:after{
        content:"";position:absolute;left:50%;bottom:-13px;transform:translateX(-50%);
        width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;
        border-top:14px solid #e83d63;
      }
      .medlife-map-logo-marker img{
        width:100%;height:100%;object-fit:contain;display:block;
        border-radius:50%;background:#fff;position:relative;z-index:1;
      }
      .leaflet-marker-icon{overflow:visible!important}
      .leaflet-marker-pane{z-index:600!important}
      @media(max-width:560px){
        .medlife-contact-brand-circle{width:124px;height:124px;padding:11px}
        .medlife-map-logo-marker{width:50px;height:50px}
      }
      @media(prefers-reduced-motion:reduce){.medlife-contact-brand-circle{animation:none}}
    `;
    document.head.appendChild(st);
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
        wrap.innerHTML='<img src="/logo.PNG?v=20260831-contact" alt="MedLife"><div></div>';
        wrap.lastElementChild.appendChild(h2);
        mapCard.insertBefore(wrap,mapCard.querySelector('.lead')||mapCard.querySelector('.map-shell'));
      }
    }
    if(infoCard && !infoCard.querySelector('.contact-card-title')){
      const h2=infoCard.querySelector('h2');
      if(h2){
        const wrap=document.createElement('div');
        wrap.className='contact-card-title';
        wrap.innerHTML='<img src="/logo.PNG?v=20260831-contact" alt="MedLife"><div></div>';
        wrap.lastElementChild.appendChild(h2);
        infoCard.insertBefore(wrap,infoCard.querySelector('.lead')||infoCard.firstChild.nextSibling);
      }
    }
  }

  function init(){
    addBranding();
    addSectionBranding();
    const el=document.getElementById('syriaMap');
    if(!el||el.dataset.ready==='1') return;

    const run=()=>{
      if(!window.L) return;
      el.dataset.ready='1';
      const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true}).setView([34.8021,38.9968],7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);

      const iconHtml='<div class="medlife-map-logo-marker"><img src="/logo.PNG?v=20260831-contact" alt="MedLife"></div>';
      const icon=L.divIcon({className:'medlife-map-logo-icon',html:iconHtml,iconSize:[58,72],iconAnchor:[29,65],popupAnchor:[0,-60]});

      const locations=[
        ['ميدلايف طرطوس',34.8959,35.8867,'المكتب الرئيسي لمؤسسة ميدلايف في طرطوس.'],
        ['ميدلايف بانياس',35.1818,35.9486,'فريق ميدلايف في بانياس.'],
        ['ميدلايف اللاذقية',35.5317,35.7914,'فريق ميدلايف في اللاذقية.'],
        ['ميدلايف حمص',34.7324,36.7137,'فريق ميدلايف في حمص.'],
        ['ميدلايف دمشق',33.5138,36.2765,'فريق ميدلايف في دمشق.'],
        ['ميدلايف حلب',36.2021,37.1343,'فريق ميدلايف في حلب.'],
        ['ميدلايف الحسكة',36.5024,40.7477,'فريق ميدلايف في الحسكة.']
      ];

      locations.forEach(([name,lat,lng,desc])=>{
        L.marker([lat,lng],{icon,title:name,alt:name}).addTo(map)
          .bindPopup('<div style="font-family:Cairo;text-align:right"><strong style="font-size:15px;color:#071b3a">'+name+'</strong><br><span style="color:#687587">'+desc+'</span></div>');
      });

      setTimeout(()=>map.invalidateSize(),450);
      window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
    };

    if(window.L) run();
    else loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(run).catch(()=>{
      el.innerHTML='<div style="height:100%;display:grid;place-items:center;padding:24px;text-align:center;font-family:Cairo,sans-serif;color:#687587;background:#eef6f8;border-radius:18px">تعذر تحميل الخريطة حالياً. يمكنك التواصل معنا مباشرة عبر بيانات الاتصال.</div>';
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();