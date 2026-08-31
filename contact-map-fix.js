(() => {
  'use strict';
  function loadScript(src){return new Promise((resolve,reject)=>{if(window.L)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  function addBranding(){
    if(document.getElementById('medlife-contact-branding')) return;
    const hero=document.querySelector('body > header.hero');
    if(!hero) return;
    const inner=hero.querySelector('.hero-inner');
    if(!inner) return;
    const brand=document.createElement('div');
    brand.id='medlife-contact-branding';
    brand.innerHTML='<a href="/index.html" aria-label="مؤسسة ميدلايف - الرئيسية"><span class="medlife-contact-brand-circle"><img src="/logo.PNG" alt="مؤسسة ميدلايف"></span></a>';
    const st=document.createElement('style');
    st.id='medlife-contact-branding-style';
    st.textContent=`
      #medlife-contact-branding{display:flex;justify-content:center;margin:0 auto 16px;position:relative;z-index:2}
      #medlife-contact-branding a{display:inline-flex;text-decoration:none}
      .medlife-contact-brand-circle{width:112px;height:112px;border-radius:50%;background:#fff;display:grid;place-items:center;padding:12px;border:3px solid rgba(255,255,255,.86);box-shadow:0 16px 42px rgba(0,0,0,.23);position:relative;overflow:visible;animation:medlifeContactBrandIn .55s ease both}
      .medlife-contact-brand-circle:before{content:"";position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(255,255,255,.3)}
      .medlife-contact-brand-circle img{width:100%;height:100%;object-fit:contain;border-radius:50%;display:block}
      @keyframes medlifeContactBrandIn{from{opacity:0;transform:translateY(-10px) scale(.94)}to{opacity:1;transform:none}}
      @media(max-width:560px){.medlife-contact-brand-circle{width:92px;height:92px;padding:10px}}
    `;
    document.head.appendChild(st);
    inner.prepend(brand);
  }
  function init(){
    addBranding();
    const el=document.getElementById('syriaMap');
    if(!el||el.dataset.ready==='1')return;
    const run=()=>{
      if(!window.L)return;
      el.dataset.ready='1';
      const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true}).setView([34.8021,38.9968],7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
      const iconHtml='<div class="medlife-map-logo-marker"><img src="/logo.PNG" alt="MedLife"></div>';
      const icon=L.divIcon({className:'',html:iconHtml,iconSize:[50,50],iconAnchor:[25,25],popupAnchor:[0,-28]});
      const markerStyle=document.createElement('style');
      markerStyle.id='medlife-map-logo-marker-style';
      markerStyle.textContent=`
        .medlife-map-logo-marker{width:50px;height:50px;border-radius:50%;background:#fff;border:3px solid #e83d63;box-shadow:0 8px 22px rgba(21,36,61,.28);display:grid;place-items:center;padding:6px;overflow:visible}
        .medlife-map-logo-marker:after{content:"";position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);border-left:8px solid transparent;border-right:8px solid transparent;border-top:11px solid #e83d63}
        .medlife-map-logo-marker img{width:100%;height:100%;object-fit:contain;display:block;border-radius:50%}
      `;
      document.head.appendChild(markerStyle);
      const locations=[
        ['ميدلايف طرطوس',34.8959,35.8867,'المكتب الرئيسي لمؤسسة ميدلايف في طرطوس.'],
        ['ميدلايف بانياس',35.1818,35.9486,'فريق ميدلايف في بانياس.'],
        ['ميدلايف اللاذقية',35.5317,35.7914,'فريق ميدلايف في اللاذقية.'],
        ['ميدلايف حمص',34.7324,36.7137,'فريق ميدلايف في حمص.'],
        ['ميدلايف دمشق',33.5138,36.2765,'فريق ميدلايف في دمشق.'],
        ['ميدلايف حلب',36.2021,37.1343,'فريق ميدلايف في حلب.'],
        ['ميدلايف الحسكة',36.5024,40.7477,'فريق ميدلايف في الحسكة.']
      ];
      locations.forEach(([n,lat,lng,desc])=>L.marker([lat,lng],{icon}).addTo(map).bindPopup('<div style="font-family:Cairo;text-align:right"><strong style="font-size:15px">'+n+'</strong><br><span style="color:#687587">'+desc+'</span></div>'));
      setTimeout(()=>map.invalidateSize(),450);
      window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
    };
    if(window.L)run();else loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(run).catch(()=>{el.innerHTML='<div style="height:100%;display:grid;place-items:center;padding:24px;text-align:center;font-family:Cairo,sans-serif;color:#687587;background:#eef6f8;border-radius:18px">تعذر تحميل الخريطة حالياً. يمكنك التواصل معنا مباشرة عبر بيانات الاتصال.</div>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();