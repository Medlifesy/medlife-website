(() => {
  'use strict';
  function loadScript(src){return new Promise((resolve,reject)=>{if(window.L)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  function init(){
    const el=document.getElementById('syriaMap');
    if(!el||el.dataset.ready==='1')return;
    const run=()=>{
      if(!window.L)return;
      el.dataset.ready='1';
      const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true}).setView([34.8021,38.9968],7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
      const icon=L.divIcon({className:'',html:'<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#e83d63;border:3px solid #fff;box-shadow:0 6px 16px rgba(232,61,99,.35);transform:rotate(-45deg);position:relative"><span style="position:absolute;width:8px;height:8px;background:#fff;border-radius:50%;left:8px;top:8px"></span></div>',iconSize:[30,30],iconAnchor:[15,30],popupAnchor:[0,-28]});
      L.marker([34.8959,35.8867],{icon}).addTo(map).bindPopup('<strong style="font-family:Cairo">مؤسسة ميدلايف — طرطوس</strong><br><span style="font-family:Cairo">المكتب الرئيسي — المحكمة، خلف شركة الأعلاف</span>').openPopup();
      [['اللاذقية',35.5317,35.7914],['حمص',34.7324,36.7137],['دمشق',33.5138,36.2765],['حلب',36.2021,37.1343],['الحسكة',36.5024,40.7477]].forEach(([n,lat,lng])=>L.circleMarker([lat,lng],{radius:5,color:'#e83d63',weight:2,fillColor:'#e83d63',fillOpacity:.85}).addTo(map).bindPopup('<strong style="font-family:Cairo">'+n+'</strong><br><span style="font-family:Cairo">حضور ومبادرات ميدلايف</span>'));
      setTimeout(()=>map.invalidateSize(),400);
      window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
    };
    if(window.L)run();else loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(run).catch(()=>{el.innerHTML='<div style="height:100%;display:grid;place-items:center;padding:24px;text-align:center;font-family:Cairo,sans-serif;color:#687587;background:#eef6f8;border-radius:18px">تعذر تحميل الخريطة حالياً. يمكنك التواصل معنا مباشرة عبر بيانات الاتصال.</div>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();