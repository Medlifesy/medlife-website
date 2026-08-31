(()=>{
'use strict';
const ID='medlife-contact-nav-final';
if(document.getElementById(ID))return;
const s=document.createElement('style');s.id=ID;s.textContent=`
/* Contact uses the same compact global navigation language as the rest of MedLife */
body{padding-top:0!important}
.medlife-global-header{position:sticky!important;top:0!important;z-index:2500!important;background:rgba(255,255,255,.97)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;border-bottom:1px solid #e5eaf1!important;box-shadow:0 6px 18px rgba(16,24,47,.055)!important}
.medlife-global-wrap{width:min(1240px,calc(100% - 24px))!important;min-height:64px!important;gap:12px!important}
.medlife-global-brand img{height:43px!important;width:auto!important}
.medlife-global-nav{min-height:64px!important}
.medlife-global-nav a{padding-inline:9px!important;font-size:11px!important}
.medlife-global-nav a::after{bottom:7px!important;left:9px!important;right:9px!important;height:2px!important;background:#e92850!important}
.medlife-global-nav a.active{color:#e92850!important}
.medlife-global-actions a{padding:7px 10px!important;border-radius:9px!important;font-size:10px!important}
.medlife-global-menu{font-size:11px!important;padding:8px 11px!important}
.medlife-global-mobile a{font-size:12px!important}
@media(max-width:900px){.medlife-global-wrap{min-height:60px!important}.medlife-global-nav,.medlife-global-actions{display:none!important}.medlife-global-menu{display:block!important;margin-inline-start:auto}.medlife-global-brand img{height:41px!important}}
`;
document.head.appendChild(s);
function init(){const h=document.querySelector('.medlife-global-header');if(!h)return;document.querySelectorAll('.medlife-global-nav a').forEach(a=>{if(a.dataset.key==='contact')a.classList.add('active')})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,700);
})();