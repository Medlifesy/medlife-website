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
    brand.innerHTML='<a href="/index.html" aria-label="مؤسسة ميدلايف - الرئيسية"><img src="/logo.PNG" alt="مؤسسة ميدلايف"></a>';
    const st=document.createElement('style');
    st.id='medlife-contact-branding-style';
    st.textContent='.hero #medlife-contact-branding{display:flex;justify-content:center;margin:0 auto 14px;position:relative;z-index:2}.hero #medlife-contact-branding a{display:inline-flex;align-items:center;justify-content:center;padding:8px 14px;border-radius:18px;background:rgba(255,255,255,.96);box-shadow:0 10px 30px rgba(0,0,0,.14);border:1px solid rgba(255,255,255,.6)}.hero #medlife-contact-branding img{height:62px;width:auto;display:block;object-fit:contain}@media(max-width:560px){.hero #medlife-contact-branding img{height:52px}}';
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
      const iconHtml='<div style="width:38px;height:38px;border-radius:50%;background:#fff;border:2px solid #e83d63;box-shadow:0 7px 18px rgba(232,61,99,.28);display:flex;align-items:center;justify-content:center;overflow:hidden;padding:4px"><img src="/logo.PNG" alt="MedLife" style="width:100%;height:100%;object-fit:contain;display:block"></div>';
      const icon=L.divIcon({className:'',html:iconHtml,iconSize:[42,42],iconAnchor:[21,21],popupAnchor:[0,-22]});
      L.marker([34.8959,35.8867],{icon}).addTo(map).bindPopup('<div style="font-family:Cairo;text-align:right"><strong>مؤسسة ميدلايف — طرطوس</strong><br><span>المكتب الرئيسي — المحكمة، خلف شركة الأعلاف</span></div>').openPopup();
      [['اللاذقية',35.5317,35.7914],['حمص',34.7324,36.7137],['دمشق',33.5138,36.2765],['حلب',36.2021,37.1343],['الحسكة',36.5024,40.7477]].forEach(([n,lat,lng])=>L.marker([lat,lng],{icon}).addTo(map).bindPopup('<div style="font-family:Cairo;text-align:right"><strong>'+n+'</strong><br><span>حضور ومبادرات ميدلايف</span></div>'));
      setTimeout(()=>map.invalidateSize(),400);
      window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
    };
    if(window.L)run();else loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(run).catch(()=>{el.innerHTML='<div style="height:100%;display:grid;place-items:center;padding:24px;text-align:center;font-family:Cairo,sans-serif;color:#687587;background:#eef6f8;border-radius:18px">تعذر تحميل الخريطة حالياً. يمكنك التواصل معنا مباشرة عبر بيانات الاتصال.</div>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();