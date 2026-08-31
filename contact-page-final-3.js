(() => {
  'use strict';
  const ID='medlife-contact-final-3';
  if(document.getElementById(ID)) return;
  const s=document.createElement('style');
  s.id=ID;
  s.textContent=`
    #medlife-contact-v8{background:#fbfaf8!important;color:#10182f!important}
    #medlife-contact-v8 .mc8-hero{background:#fbfaf8!important;border:0!important;padding:52px 18px 42px!important}
    #medlife-contact-v8 .mc8-wrap{width:min(900px,100%)!important;background:#fff!important;border:1px solid #e8e4df!important;border-radius:28px!important;box-shadow:0 18px 48px rgba(16,24,47,.055)!important;padding:34px 36px 31px!important;overflow:hidden!important}
    #medlife-contact-v8 .mc8-wrap:before{display:none!important}
    #medlife-contact-v8 .mc8-wrap:after{background:#fff0f3!important;width:190px!important;height:190px!important;right:-88px!important;top:-100px!important}
    #medlife-contact-v8 .mc8-logo{width:132px!important;height:132px!important;padding:0!important;border:3px solid #e92850!important;background:#fff!important;border-radius:50%!important;overflow:hidden!important;box-shadow:0 12px 28px rgba(16,24,47,.08)!important;animation:mc3float 4.8s ease-in-out infinite!important}
    #medlife-contact-v8 .mc8-logo img{width:108%!important;height:108%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;border-radius:50%!important;transform:translate(-4%,-4%)!important;display:block!important}
    @keyframes mc3float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    #medlife-contact-v8 .mc8-kicker,#medlife-contact-v8 .mc8-title small{background:#fff0f3!important;border-color:#f0d4dc!important;color:#e92850!important}
    #medlife-contact-v8 h1,#medlife-contact-v8 .mc8-title h2{color:#10182f!important}
    #medlife-contact-v8 h1 span{color:#e92850!important}
    #medlife-contact-v8 .mc8-hero p,#medlife-contact-v8 .mc8-title p{color:#707888!important}
    #medlife-contact-v8 .mc8-content{width:min(1120px,calc(100% - 32px))!important;padding:40px 0 76px!important}
    #medlife-contact-v8 .mc8-main{grid-template-columns:minmax(0,1.12fr) minmax(300px,.88fr)!important;gap:28px!important;align-items:start!important}
    #medlife-contact-v8 .mc8-contact-card{grid-column:1!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-map-card{grid-column:2!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-card{background:#fff!important;border:1px solid #e8e3df!important;border-radius:22px!important;box-shadow:0 10px 30px rgba(16,24,47,.045)!important;padding:23px!important}
    #medlife-contact-v8 .mc8-contact-card .mc8-card-head h3{color:#10182f!important;font-size:21px!important}
    #medlife-contact-v8 .mc10-contact-label{display:inline-block!important;margin:0 0 13px!important;padding:6px 11px!important;border-radius:999px!important;background:#fff0f3!important;border:1px solid #f0d4dc!important;color:#e92850!important;font:900 10px Cairo,Arial,sans-serif!important}
    #medlife-contact-v8 .mc8-icon{background:#fff0f3!important;color:#e92850!important}
    #medlife-contact-v8 .mc8-item{border-bottom-color:#eee9e5!important}
    #medlife-contact-v8 .mc8-item strong{color:#10182f!important}
    #medlife-contact-v8 .mc8-item a{color:#263044!important}
    #medlife-contact-v8 .mc8-item a:hover{color:#e92850!important}
    #medlife-contact-v8 .mc8-action{background:#fff!important;border-color:#e6e0dc!important;color:#10182f!important}
    #medlife-contact-v8 .mc8-action:hover{border-color:#e92850!important;color:#e92850!important;background:#fff8fa!important}
    #medlife-contact-v8 .mc8-forum{background:#fff0f3!important;border-color:#f0d4dc!important}
    #medlife-contact-v8 .mc8-map{height:350px!important;border-radius:16px!important;border:1px solid #e5dfdb!important;overflow:hidden!important}
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:none!important}
    #medlife-contact-v8 .mc8-team-list button{background:#fff!important;border-color:#e7e1dd!important;color:#10182f!important}
    #medlife-contact-v8 .mc8-team-list button:before{background:#e92850!important}
    #medlife-contact-v8 .mc8-team-list button.active,#medlife-contact-v8 .mc8-team-list button:hover{background:#fff8fa!important;border-color:#e92850!important;color:#e92850!important}
    /* calm, clear red map markers */
    #medlife-contact-v8 .mc8-pin-wrap{background:transparent!important;border:0!important}
    #medlife-contact-v8 .mc8-pin{width:34px!important;height:34px!important;border-radius:50%!important;background:#e92850!important;border:3px solid #fff!important;box-shadow:0 5px 14px rgba(16,24,47,.24)!important;transform:none!important;padding:0!important;display:grid!important;place-items:center!important}
    #medlife-contact-v8 .mc8-pin:after{content:""!important;position:absolute!important;width:8px!important;height:8px!important;border-radius:50%!important;background:#fff!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important}
    #medlife-contact-v8 .mc8-pin img{display:none!important}
    #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr 1fr!important;gap:20px!important;margin-top:24px!important}
    #medlife-contact-v8 .mc8-lower-card{background:#fff!important;border:1px solid #e8e3df!important;border-radius:18px!important;box-shadow:0 8px 24px rgba(16,24,47,.035)!important}
    #medlife-contact-v8 .mc3-social-section{margin-top:24px;padding:28px 0 4px;border-top:1px solid #e9e2de}
    #medlife-contact-v8 .mc3-social-head{text-align:center;max-width:720px;margin:0 auto 19px}
    #medlife-contact-v8 .mc3-social-kicker{display:inline-block;padding:5px 10px;border-radius:999px;background:#fff0f3;border:1px solid #f0d4dc;color:#e92850;font:900 10px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc3-social-head h3{margin:8px 0 5px;font:900 25px Cairo,Arial,sans-serif;color:#10182f}
    #medlife-contact-v8 .mc3-social-head p{margin:0;color:#707888;font:500 11px/1.8 Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc3-social-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    #medlife-contact-v8 .mc3-social-card{display:flex;align-items:center;gap:11px;min-height:72px;padding:13px 14px;border:1px solid #e7e1dd;border-radius:15px;background:#fff;text-decoration:none;color:#10182f;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
    #medlife-contact-v8 .mc3-social-card:hover{transform:translateY(-2px);border-color:#e92850;box-shadow:0 10px 22px rgba(16,24,47,.06)}
    #medlife-contact-v8 .mc3-social-icon{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex:none;background:#fff0f3;color:#e92850;font-size:18px}
    #medlife-contact-v8 .mc3-social-card strong{display:block;font:900 12px Cairo,Arial,sans-serif;color:#10182f}
    #medlife-contact-v8 .mc3-social-card small{display:block;margin-top:2px;color:#7a8290;font:500 9px/1.5 Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc3-social-note{margin-top:10px;text-align:center;color:#8a919d;font:500 9px/1.7 Cairo,Arial,sans-serif}
    @media(max-width:900px){
      #medlife-contact-v8 .mc8-main{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc8-contact-card,#medlife-contact-v8 .mc8-map-card{grid-column:1!important;grid-row:auto!important}
      #medlife-contact-v8 .mc8-contact-card{order:1}.mc8-map-card{order:2}
      #medlife-contact-v8 .mc3-social-grid{grid-template-columns:1fr 1fr}
    }
    @media(max-width:640px){
      #medlife-contact-v8 .mc8-hero{padding:24px 12px 22px!important}
      #medlife-contact-v8 .mc8-wrap{padding:27px 16px 24px!important;border-radius:21px!important}
      #medlife-contact-v8 .mc8-logo{width:116px!important;height:116px!important}
      #medlife-contact-v8 .mc8-content{width:calc(100% - 20px)!important;padding:28px 0 52px!important}
      #medlife-contact-v8 .mc8-card{padding:17px!important;border-radius:18px!important}
      #medlife-contact-v8 .mc8-map{height:320px!important}
      #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc3-social-grid{grid-template-columns:1fr}
    }
    @media(prefers-reduced-motion:reduce){#medlife-contact-v8 .mc8-logo{animation:none!important}}
  `;
  document.head.appendChild(s);

  function addSocial(){
    const page=document.getElementById('medlife-contact-v8');
    if(!page || page.querySelector('.mc3-social-section')) return;
    const anchor=page.querySelector('.mc8-lower') || page.querySelector('.mc8-content > section:last-of-type');
    if(!anchor || !anchor.parentNode) return;
    const section=document.createElement('section');
    section.className='mc3-social-section';
    section.innerHTML=`
      <div class="mc3-social-head">
        <span class="mc3-social-kicker">مجتمع ميدلايف الرقمي</span>
        <h3>تابع ميدلايف عبر منصاتها الرسمية</h3>
        <p>تابع آخر المبادرات والمحتوى الطبي والأخبار والأنشطة من القنوات الرسمية لمؤسسة ميدلايف.</p>
      </div>
      <div class="mc3-social-grid">
        <a class="mc3-social-card" href="https://www.linkedin.com/company/med-life-syria" target="_blank" rel="noopener noreferrer"><span class="mc3-social-icon"><i class="fa-brands fa-linkedin-in"></i></span><span><strong>LinkedIn</strong><small>Med Life Syria</small></span></a>
        <a class="mc3-social-card" href="https://www.youtube.com/@medlifesy" target="_blank" rel="noopener noreferrer"><span class="mc3-social-icon"><i class="fa-brands fa-youtube"></i></span><span><strong>YouTube</strong><small>@medlifesy</small></span></a>
        <a class="mc3-social-card" href="https://www.facebook.com/Medlifesyforum" target="_blank" rel="noopener noreferrer"><span class="mc3-social-icon"><i class="fa-brands fa-facebook-f"></i></span><span><strong>Facebook المنتدى</strong><small>MedLife Forum</small></span></a>
      </div>
      <div class="mc3-social-note">نضيف بقية الحسابات الرسمية لميدلايف هنا فور توثيق روابطها الرسمية.</div>
    `;
    anchor.parentNode.insertBefore(section,anchor.nextSibling);
  }

  function init(){
    if(!document.getElementById('medlife-contact-v8')) return;
    addSocial();
    const label=document.querySelector('#medlife-contact-v8 .mc8-contact-card .mc10-contact-label');
    if(label) label.textContent='معلومات التواصل مع ميدلايف';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,900);setTimeout(init,1800);
})();
