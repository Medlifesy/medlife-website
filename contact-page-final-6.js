(() => {
  'use strict';
  const ID='medlife-contact-final-6';
  if(document.getElementById(ID)) return;
  const s=document.createElement('style');
  s.id=ID;
  s.textContent=`
    :root{--ml-navy:#10182f;--ml-red:#e92850;--ml-cream:#fbfaf8;--ml-white:#fff;--ml-muted:#707888}
    #medlife-contact-v8 .mc8-wrap{background:linear-gradient(135deg,rgba(16,24,47,.94),rgba(16,24,47,.88))!important;border:1px solid rgba(255,255,255,.13)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;box-shadow:0 20px 52px rgba(16,24,47,.16)!important}
    #medlife-contact-v8 .mc8-wrap:before,#medlife-contact-v8 .mc8-wrap:after{display:none!important}
    #medlife-contact-v8 .mc8-logo{border:0!important;background:#fff!important;box-shadow:0 10px 26px rgba(0,0,0,.17)!important;width:136px!important;height:136px!important}
    #medlife-contact-v8 .mc8-logo img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 50%!important;transform:none!important;border-radius:50%!important;display:block!important}
    #medlife-contact-v8 .mc8-kicker{background:rgba(255,255,255,.10)!important;border-color:rgba(255,255,255,.18)!important;color:#ff5574!important}
    #medlife-contact-v8 h1{color:#fff!important}
    #medlife-contact-v8 h1 span{color:#ff5574!important}
    #medlife-contact-v8 .mc8-hero p{color:#e6e9ef!important}
    #medlife-contact-v8 .mc5-social{margin-top:30px;padding:30px 0 0!important;border-top:1px solid #e5dfdb!important}
    #medlife-contact-v8 .mc5-social-head{text-align:center;margin-bottom:18px}
    #medlife-contact-v8 .mc5-social-head span{display:inline-block;padding:5px 10px;border-radius:999px;background:#fff1f4;border:1px solid #f0d4dc;color:#e92850;font:900 10px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc5-social-head h3{margin:8px 0 5px;color:#10182f;font:900 25px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc5-social-head p{margin:0;color:#707888;font:500 11px/1.8 Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc6-social-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    #medlife-contact-v8 .mc6-social-card{min-height:78px;padding:12px 10px;border:1px solid #e7e1dd;border-radius:15px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;text-decoration:none;color:#10182f;transition:.2s ease}
    #medlife-contact-v8 .mc6-social-card:hover{border-color:#e92850;box-shadow:0 8px 20px rgba(16,24,47,.06);transform:translateY(-2px)}
    #medlife-contact-v8 .mc6-social-card.disabled{cursor:default;opacity:.62}
    #medlife-contact-v8 .mc6-social-card.disabled:hover{transform:none;border-color:#e7e1dd;box-shadow:none}
    #medlife-contact-v8 .mc6-social-icon{width:38px;height:38px;border-radius:11px;background:#fff1f4;color:#e92850;display:grid;place-items:center;font-size:18px}
    #medlife-contact-v8 .mc6-social-card strong{font:900 10px Cairo,Arial,sans-serif;color:#10182f;text-align:center}
    #medlife-contact-v8 .mc6-social-card small{font:500 8px Cairo,Arial,sans-serif;color:#7c8492;text-align:center}
    #medlife-contact-v8 .mc6-social-note{margin-top:10px;text-align:center;color:#8b929d;font:500 9px/1.7 Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc5-social-note{display:none!important}
    #medlife-contact-v8 .mc5-footer{margin-top:0!important;background:#10182f!important;border-radius:0!important}
    #medlife-contact-v8 .mc5-footer-inner{width:min(1120px,calc(100% - 30px));margin:auto}
    @media(max-width:1050px){#medlife-contact-v8 .mc6-social-grid{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:640px){#medlife-contact-v8 .mc6-social-grid{grid-template-columns:1fr 1fr}#medlife-contact-v8 .mc8-logo{width:116px!important;height:116px!important}}
  `;
  document.head.appendChild(s);

  function rebuildSocial(){
    const page=document.getElementById('medlife-contact-v8');
    if(!page) return;
    const old=page.querySelector('.mc5-social');
    if(!old) return;
    if(old.dataset.mc6==='1') return;
    old.dataset.mc6='1';
    old.innerHTML=`
      <div class="mc5-social-head"><span>قنوات ميدلايف الرسمية</span><h3>تابع ميدلايف أينما كنت</h3><p>تابع أخبار المؤسسة وأنشطتها ومبادراتها ومحتواها الطبي عبر قنواتها الرقمية.</p></div>
      <div class="mc6-social-grid">
        <a class="mc6-social-card" href="https://www.facebook.com/Medlifesy" target="_blank" rel="noopener noreferrer"><span class="mc6-social-icon"><i class="fa-brands fa-facebook-f"></i></span><strong>Facebook</strong><small>صفحة المؤسسة الرسمية</small></a>
        <a class="mc6-social-card" href="https://www.facebook.com/medlifesyathar/" target="_blank" rel="noopener noreferrer"><span class="mc6-social-icon"><i class="fa-brands fa-facebook-f"></i></span><strong>Facebook</strong><small>أثر ميدلايف</small></a>
        <div class="mc6-social-card disabled"><span class="mc6-social-icon"><i class="fa-brands fa-instagram"></i></span><strong>Instagram</strong><small>الحساب الرسمي</small></div>
        <a class="mc6-social-card" href="https://t.me/medlife0" target="_blank" rel="noopener noreferrer"><span class="mc6-social-icon"><i class="fa-brands fa-telegram"></i></span><strong>Telegram</strong><small>قناة ميدلايف</small></a>
        <a class="mc6-social-card" href="https://t.me/medlifesy_clinical" target="_blank" rel="noopener noreferrer"><span class="mc6-social-icon"><i class="fa-brands fa-telegram"></i></span><strong>Telegram</strong><small>MedLife Clinical</small></a>
        <a class="mc6-social-card" href="https://www.youtube.com/@medlifesy" target="_blank" rel="noopener noreferrer"><span class="mc6-social-icon"><i class="fa-brands fa-youtube"></i></span><strong>YouTube</strong><small>@medlifesy</small></a>
        <a class="mc6-social-card" href="https://www.linkedin.com/company/med-life-syria" target="_blank" rel="noopener noreferrer"><span class="mc6-social-icon"><i class="fa-brands fa-linkedin-in"></i></span><strong>LinkedIn</strong><small>Med Life Syria</small></a>
        <a class="mc6-social-card" href="https://www.facebook.com/Medlifesyforum" target="_blank" rel="noopener noreferrer"><span class="mc6-social-icon"><i class="fa-brands fa-facebook-f"></i></span><strong>Facebook المنتدى</strong><small>MedLife Forum</small></a>
      </div>`;
  }

  function init(){
    const page=document.getElementById('medlife-contact-v8');
    if(!page) return;
    rebuildSocial();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,800);setTimeout(init,1600);
})();
