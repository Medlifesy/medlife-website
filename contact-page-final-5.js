(() => {
  'use strict';
  const ID='medlife-contact-final-5';
  if(document.getElementById(ID)) return;
  const BRAND='/logo.PNG?v=20260831-contact-final5';
  const s=document.createElement('style');
  s.id=ID;
  s.textContent=`
    #medlife-contact-v8{background:#fbfaf8!important;color:#10182f!important}
    #medlife-contact-v8 .mc8-hero{background:#fbfaf8!important;border:0!important;padding:38px 18px 34px!important}
    #medlife-contact-v8 .mc8-wrap{width:min(980px,100%)!important;background:#10182f!important;color:#fff!important;border:0!important;border-radius:26px!important;box-shadow:0 18px 48px rgba(16,24,47,.15)!important;padding:34px 38px 30px!important;overflow:hidden!important;position:relative!important}
    #medlife-contact-v8 .mc8-wrap:before,#medlife-contact-v8 .mc8-wrap:after{display:none!important}
    #medlife-contact-v8 .mc8-brand{margin:0 auto 16px!important;position:relative!important;z-index:1!important}
    #medlife-contact-v8 .mc8-logo{width:138px!important;height:138px!important;padding:0!important;border:3px solid #fff!important;background:#fff!important;border-radius:50%!important;overflow:hidden!important;box-shadow:0 12px 28px rgba(0,0,0,.16)!important;animation:mc5float 4.8s ease-in-out infinite!important}
    #medlife-contact-v8 .mc8-logo img{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;object-position:center!important;transform:none!important;border-radius:50%!important;display:block!important}
    @keyframes mc5float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    #medlife-contact-v8 .mc8-kicker{background:rgba(255,255,255,.09)!important;border:1px solid rgba(255,255,255,.18)!important;color:#ff4b6e!important}
    #medlife-contact-v8 h1{color:#fff!important;font-size:clamp(34px,4.6vw,48px)!important;margin:10px 0 6px!important}
    #medlife-contact-v8 h1 span{color:#ff4b6e!important}
    #medlife-contact-v8 .mc8-hero p{color:#e7eaf0!important;max-width:680px!important;font-size:13px!important}
    #medlife-contact-v8 .mc8-content{width:min(1120px,calc(100% - 32px))!important;padding:38px 0 64px!important}
    #medlife-contact-v8 .mc8-title small{background:#fff0f3!important;color:#e92850!important;border-color:#f0d4dc!important}
    #medlife-contact-v8 .mc8-title h2{color:#10182f!important}
    #medlife-contact-v8 .mc8-title p{color:#707888!important}
    #medlife-contact-v8 .mc8-main{grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr)!important;gap:28px!important;align-items:start!important}
    #medlife-contact-v8 .mc8-contact-card{grid-column:1!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-map-card{grid-column:2!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-card{background:#fff!important;border:1px solid #e8e2df!important;border-radius:22px!important;box-shadow:0 10px 28px rgba(16,24,47,.055)!important;padding:23px!important}
    #medlife-contact-v8 .mc8-contact-card .mc8-card-head h3{font-size:21px!important;color:#10182f!important}
    #medlife-contact-v8 .mc8-icon{background:#fff1f4!important;color:#e92850!important}
    #medlife-contact-v8 .mc8-item strong{color:#10182f!important}
    #medlife-contact-v8 .mc8-item small{color:#717988!important}
    #medlife-contact-v8 .mc8-map{height:350px!important;border-radius:16px!important}
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:none!important}
    #medlife-contact-v8 .mc8-pin{width:34px!important;height:34px!important;border-radius:50%!important;background:#e92850!important;border:3px solid #fff!important;box-shadow:0 5px 14px rgba(16,24,47,.24)!important;transform:none!important}
    #medlife-contact-v8 .mc8-pin:after{content:""!important;position:absolute!important;width:8px!important;height:8px!important;border-radius:50%!important;background:#fff!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important}
    #medlife-contact-v8 .mc8-pin img{display:none!important}
    #medlife-contact-v8 .mc8-team-list button{background:#fff!important;color:#10182f!important;border-color:#e8e1dd!important}
    #medlife-contact-v8 .mc8-team-list button:before{background:#e92850!important}
    #medlife-contact-v8 .mc8-team-list button.active,#medlife-contact-v8 .mc8-team-list button:hover{background:#fff8fa!important;border-color:#e92850!important;color:#e92850!important}
    #medlife-contact-v8 .mc10-contact-label{background:#fff1f4!important;color:#e92850!important;border-color:#f0d4dc!important}
    #medlife-contact-v8 .mc8-forum{background:#fff1f4!important;border-color:#f0d4dc!important}
    #medlife-contact-v8 .mc8-lower-card{background:#fff!important;border-color:#e8e2df!important}
    #medlife-contact-v8 .mc5-social{margin-top:30px;padding-top:30px;border-top:1px solid #e8e1dd}
    #medlife-contact-v8 .mc5-social-head{text-align:center;margin-bottom:18px}
    #medlife-contact-v8 .mc5-social-head span{display:inline-block;padding:5px 10px;border-radius:999px;background:#fff1f4;border:1px solid #f0d4dc;color:#e92850;font:900 10px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc5-social-head h3{margin:8px 0 5px;color:#10182f;font:900 25px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc5-social-head p{margin:0;color:#707888;font:500 11px/1.8 Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc5-social-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}
    #medlife-contact-v8 .mc5-social-card{min-height:78px;padding:12px 10px;border:1px solid #e8e2df;border-radius:15px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;text-decoration:none;color:#10182f;transition:.2s ease}
    #medlife-contact-v8 .mc5-social-card:hover{border-color:#e92850;box-shadow:0 8px 20px rgba(16,24,47,.06);transform:translateY(-2px)}
    #medlife-contact-v8 .mc5-social-card.disabled{opacity:.62;cursor:default}
    #medlife-contact-v8 .mc5-social-icon{width:38px;height:38px;border-radius:11px;background:#fff1f4;color:#e92850;display:grid;place-items:center;font-size:18px}
    #medlife-contact-v8 .mc5-social-card strong{font:900 10px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc5-footer{margin-top:34px;background:#10182f;color:#fff;padding:34px 18px 26px}
    #medlife-contact-v8 .mc5-footer-inner{width:min(1120px,calc(100% - 30px));margin:auto;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center}
    #medlife-contact-v8 .mc5-footer-brand{display:flex;align-items:center;gap:13px}.mc5-footer-brand img{width:58px;height:58px;border-radius:50%;background:#fff;object-fit:cover;border:2px solid rgba(255,255,255,.9)}
    #medlife-contact-v8 .mc5-footer-brand strong{display:block;font:900 15px Cairo,Arial,sans-serif}.mc5-footer-brand span{display:block;margin-top:3px;color:#cdd3df;font:500 10px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc5-footer-links{display:flex;flex-wrap:wrap;gap:7px;justify-content:flex-end}.mc5-footer-links a{color:#fff;text-decoration:none;font:800 10px Cairo,Arial,sans-serif;padding:7px 9px;border:1px solid rgba(255,255,255,.18);border-radius:9px}.mc5-footer-links a:hover{border-color:#ff4b6e;color:#ff4b6e}
    #medlife-contact-v8 .mc5-footer-copy{text-align:center;margin:20px auto 0;padding-top:15px;border-top:1px solid rgba(255,255,255,.11);color:#aeb7c7;font:500 9px/1.7 Cairo,Arial,sans-serif;width:min(1120px,calc(100% - 30px))}
    #medlife-contact-v8 .mc4-social,#medlife-contact-v8 .mc4-footer{display:none!important}
    #medlife-contact-v8 .mc3-social-note,#medlife-contact-v8 .mc4-social-note{display:none!important}
    @media(max-width:900px){#medlife-contact-v8 .mc8-main{grid-template-columns:1fr!important}.mc8-contact-card,.mc8-map-card{grid-column:1!important;grid-row:auto!important}.mc5-social-grid{grid-template-columns:repeat(3,1fr)!important}.mc5-footer-inner{grid-template-columns:1fr!important}.mc5-footer-links{justify-content:flex-start!important}}
    @media(max-width:640px){#medlife-contact-v8 .mc8-wrap{padding:27px 16px 24px!important;border-radius:22px!important}#medlife-contact-v8 .mc8-logo{width:116px!important;height:116px!important}.mc5-social-grid{grid-template-columns:repeat(2,1fr)!important}.mc5-footer{padding:28px 14px 22px!important}}
    @media(prefers-reduced-motion:reduce){#medlife-contact-v8 .mc8-logo{animation:none!important}}
  `;
  document.head.appendChild(s);
  function cleanup(){
    const page=document.getElementById('medlife-contact-v8');
    if(!page)return;
    page.querySelectorAll('.mc3-social-note,.mc4-social-note,.mc4-social,.mc4-footer').forEach(el=>el.remove());
  }
  function addSocial(){
    const page=document.getElementById('medlife-contact-v8');
    if(!page||page.querySelector('.mc5-social'))return;
    const anchor=page.querySelector('.mc8-lower')||page.querySelector('.mc8-content');
    if(!anchor)return;
    const sec=document.createElement('section');sec.className='mc5-social';
    sec.innerHTML=`<div class="mc5-social-head"><span>الحضور الرقمي لميدلايف</span><h3>تابع ميدلايف عبر منصاتها الرسمية</h3><p>آخر المبادرات والأنشطة والمحتوى الطبي والتحديثات الرسمية.</p></div><div class="mc5-social-grid"><a class="mc5-social-card" href="https://www.facebook.com/Medlifesyforum" target="_blank" rel="noopener noreferrer"><span class="mc5-social-icon"><i class="fa-brands fa-facebook-f"></i></span><strong>Facebook المنتدى</strong></a><div class="mc5-social-card disabled"><span class="mc5-social-icon"><i class="fa-brands fa-instagram"></i></span><strong>Instagram</strong></div><div class="mc5-social-card disabled"><span class="mc5-social-icon"><i class="fa-brands fa-telegram"></i></span><strong>Telegram</strong></div><a class="mc5-social-card" href="https://www.youtube.com/@medlifesy" target="_blank" rel="noopener noreferrer"><span class="mc5-social-icon"><i class="fa-brands fa-youtube"></i></span><strong>YouTube</strong></a><a class="mc5-social-card" href="https://www.linkedin.com/company/med-life-syria" target="_blank" rel="noopener noreferrer"><span class="mc5-social-icon"><i class="fa-brands fa-linkedin-in"></i></span><strong>LinkedIn</strong></a></div>`;
    anchor.parentNode.insertBefore(sec,anchor.nextSibling);
  }
  function addFooter(){
    const page=document.getElementById('medlife-contact-v8');
    if(!page||page.querySelector('.mc5-footer'))return;
    const footer=document.createElement('footer');footer.className='mc5-footer';
    footer.innerHTML=`<div class="mc5-footer-inner"><div class="mc5-footer-brand"><img src="${BRAND}" alt="شعار مؤسسة ميدلايف"><div><strong>مؤسسة ميدلايف الطبية الخيرية التطوعية</strong><span>طرطوس — سوريا</span></div></div><div class="mc5-footer-links"><a href="/about-medlife.html">عن ميدلايف</a><a href="/forum-v3.html">المنتدى</a><a href="/support.html">صندوق الدعم</a><a href="/contact.html">تواصل معنا</a></div></div><div class="mc5-footer-copy">بالعمل التطوعي نصنع الأثر.</div>`;
    page.appendChild(footer);
  }
  function init(){if(!document.getElementById('medlife-contact-v8'))return;cleanup();addSocial();addFooter()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(init,700);setTimeout(init,1500);
})();
