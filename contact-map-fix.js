(() => {
  'use strict';
  const BRAND='/logo.PNG?v=20260831-contact6';
  const locations=[
    ['ميدلايف طرطوس',34.8959,35.8867,'المكتب الرئيسي لمؤسسة ميدلايف في طرطوس.'],
    ['ميدلايف بانياس',35.1818,35.9486,'فريق ميدلايف في بانياس.'],
    ['ميدلايف اللاذقية',35.5317,35.7914,'فريق ميدلايف في اللاذقية.'],
    ['ميدلايف حمص',34.7324,36.7137,'فريق ميدلايف في حمص.'],
    ['ميدلايف دمشق',33.5138,36.2765,'فريق ميدلايف في دمشق.'],
    ['ميدلايف حلب',36.2021,37.1343,'فريق ميدلايف في حلب.'],
    ['ميدلايف الحسكة',36.5024,40.7477,'فريق ميدلايف في الحسكة.']
  ];
  function load(src){return new Promise((ok,no)=>{if(window.L)return ok();const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
  function css(){if(document.getElementById('ml-contact-v6-css'))return;const s=document.createElement('style');s.id='ml-contact-v6-css';s.textContent=`
    body{background:#fff!important;color:#111!important}
    body>header.hero{background:#fff!important;color:#111!important;padding:34px 18px 28px!important;text-align:center;border-bottom:1px solid #ececec!important}
    body>header.hero:before,body>header.hero:after{display:none!important}
    .hero .hero-inner{max-width:900px!important}
    #ml-contact-brand{display:flex;justify-content:center;margin:0 auto 14px}
    #ml-contact-brand a{display:inline-flex}
    #ml-contact-brand .circle{width:150px;height:150px;border-radius:50%;background:#fff;border:4px solid #e83d63;padding:13px;display:grid;place-items:center;box-shadow:0 12px 28px rgba(0,0,0,.10);animation:mlBounce 2.8s ease-in-out infinite}
    #ml-contact-brand img{width:100%;height:100%;object-fit:contain;border-radius:50%}
    @keyframes mlBounce{0%,100%{transform:translateY(0)}12%{transform:translateY(-9px)}24%{transform:translateY(0)}34%{transform:translateY(-4px)}44%,100%{transform:translateY(0)}}
    .hero h1{margin:5px 0 6px!important;color:#111!important;font:900 clamp(32px,5vw,48px)/1.2 Cairo,sans-serif!important}
    .hero p{max-width:700px!important;color:#555!important;font:500 14px/1.9 Cairo,sans-serif!important}
    .back{background:#e83d63!important;color:#fff!important;box-shadow:none!important;margin-top:18px!important;border:0!important}
    body>main.wrap{max-width:1180px!important;padding:32px 18px 60px!important}
    .grid{display:block!important}
    .card{background:#fff!important;border:1px solid #e9e9e9!important;border-radius:22px!important;box-shadow:0 8px 24px rgba(0,0,0,.05)!important;padding:22px!important;margin-bottom:22px!important}
    .card h2{color:#111!important;font-size:24px!important}
    .lead{color:#6a6a6a!important}
    .map-shell{border:1px solid #e6e6e6!important;border-radius:18px!important;box-shadow:none!important}
    #syriaMap{height:600px!important;background:#f4f4f4!important}
    .map-badge{background:#fff!important;color:#111!important;border:1px solid #e5e5e5!important;box-shadow:0 5px 14px rgba(0,0,0,.07)!important}
    .contact-list{display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
    .item{background:#fff!important;border:1px solid #ededed!important;box-shadow:none!important;border-radius:15px!important;padding:13px!important}
    .icon{background:#f8f8f8!important;color:#e83d63!important}
    .item strong{color:#111!important}.item small{color:#777!important}.item a{color:#444!important}.item a:hover{color:#e83d63!important}
    .forum-card{background:#fafafa!important;border:1px solid #ececec!important;border-radius:18px!important}
    .forum-icon{background:#fff!important;color:#e83d63!important}
    .forum-head h3{color:#111!important}.forum-head small,.forum-details span,.forum-details a{color:#666!important}.forum-actions a{background:#e83d63!important}.forum-actions a.alt{background:#fff!important;color:#e83d63!important;border:1px solid #efbdc8!important}
    .social a{background:#fff!important;border:1px solid #ededed!important;color:#111!important}.social i{color:#e83d63!important}.social small{color:#777!important}
    .note{background:#fafafa!important;color:#666!important;border:1px solid #ededed!important}
    .mc-marker-wrap{background:transparent!important;border:0!important}
    .mc-marker-pin{position:relative;width:48px;height:58px;background:#e83d63;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 7px 16px rgba(0,0,0,.22);display:grid;place-items:center}
    .mc-marker-pin:after{content:"";position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;left:13px;top:13px}
    .mc-marker-pin img{position:relative;z-index:2;width:25px;height:25px;object-fit:contain;border-radius:50%;background:#fff;padding:2px;transform:rotate(45deg);display:block}
    .leaflet-marker-icon{overflow:visible!important}.leaflet-popup-content-wrapper{border-radius:13px!important}.leaflet-popup-content{font-family:Cairo,Arial,sans-serif!important;line-height:1.7!important}
    @media(max-width:760px){.contact-list{grid-template-columns:1fr!important}#syriaMap{height:490px!important}}
    @media(max-width:460px){#ml-contact-brand .circle{width:122px;height:122px;padding:10px}#syriaMap{height:420px!important}.card{padding:17px!important}}
    @media(prefers-reduced-motion:reduce){#ml-contact-brand .circle{animation:none}}
  `;document.head.appendChild(s)}
  function branding(){css();const hero=document.querySelector('body>header.hero .hero-inner');if(!hero||document.getElementById('ml-contact-brand'))return;const b=document.createElement('div');b.id='ml-contact-brand';b.innerHTML='<a href="/index.html" aria-label="مؤسسة ميدلايف"><span class="circle"><img src="'+BRAND+'" alt="شعار مؤسسة ميدلايف"></span></a>';hero.prepend(b)}
  function initMap(){const el=document.getElementById('syriaMap');if(!el||!window.L)return;const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true,minZoom:6,maxZoom:11});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);const icon=L.divIcon({className:'mc-marker-wrap',html:'<div class="mc-marker-pin"><img src="'+BRAND+'" alt="MedLife"></div>',iconSize:[48,58],iconAnchor:[24,53],popupAnchor:[0,-48]});const bounds=[];locations.forEach(([name,lat,lng,desc])=>{bounds.push([lat,lng]);L.marker([lat,lng],{icon,title:name,alt:name}).addTo(map).bindPopup('<div dir="rtl"><strong style="display:block;font-size:15px;color:#111">'+name+'</strong><span style="color:#666;font-size:11px">'+desc+'</span></div>')});map.fitBounds(bounds,{padding:[42,42],maxZoom:7.4});setTimeout(()=>map.invalidateSize(),400);window.addEventListener('resize',()=>map.invalidateSize(),{passive:true})}
  function init(){branding();initMap()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();