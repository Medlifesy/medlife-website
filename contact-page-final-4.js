(() => {
  'use strict';
  const ID = 'medlife-contact-final-4';
  if (document.getElementById(ID)) return;

  const style = document.createElement('style');
  style.id = ID;
  style.textContent = `
    :root{--ml-navy:#10182f;--ml-red:#e92850;--ml-cream:#fbfaf8;--ml-white:#fff;--ml-muted:#6f7787;}
    body{background:var(--ml-cream)!important;color:var(--ml-navy)!important}

    #medlife-contact-v8{background:var(--ml-cream)!important;color:var(--ml-navy)!important}

    /* Hero: calm institutional panel */
    #medlife-contact-v8 .mc8-hero{background:var(--ml-cream)!important;padding:48px 18px 38px!important;border:0!important}
    #medlife-contact-v8 .mc8-wrap{background:var(--ml-white)!important;border:1px solid #e7e3df!important;border-radius:28px!important;box-shadow:0 18px 45px rgba(16,24,47,.06)!important;padding:32px 34px 30px!important}
    #medlife-contact-v8 .mc8-wrap:before{display:none!important}
    #medlife-contact-v8 .mc8-wrap:after{background:#fdf0f3!important;width:170px!important;height:170px!important;right:-86px!important;top:-82px!important}
    #medlife-contact-v8 .mc8-logo{width:128px!important;height:128px!important;padding:0!important;border:2px solid var(--ml-red)!important;border-radius:50%!important;overflow:hidden!important;background:#fff!important;box-shadow:0 10px 24px rgba(16,24,47,.08)!important;animation:none!important}
    #medlife-contact-v8 .mc8-logo img{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;transform:scale(1.06)!important;border-radius:50%!important;display:block!important}
    #medlife-contact-v8 .mc8-kicker{background:#fff2f5!important;border-color:#f1d6de!important;color:var(--ml-red)!important}
    #medlife-contact-v8 h1{color:var(--ml-navy)!important;font-size:clamp(35px,4.8vw,49px)!important;margin:10px 0 7px!important}
    #medlife-contact-v8 h1 span{color:var(--ml-red)!important}
    #medlife-contact-v8 .mc8-hero p{color:var(--ml-muted)!important}

    /* Content rhythm */
    #medlife-contact-v8 .mc8-content{width:min(1120px,calc(100% - 32px))!important;padding:42px 0 70px!important}
    #medlife-contact-v8 .mc8-title small{background:#fff2f5!important;color:var(--ml-red)!important;border-color:#f1d6de!important}
    #medlife-contact-v8 .mc8-title h2{color:var(--ml-navy)!important;font-size:29px!important}
    #medlife-contact-v8 .mc8-title p{color:var(--ml-muted)!important}

    /* Contact left / map right */
    #medlife-contact-v8 .mc8-main{grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr)!important;gap:28px!important}
    #medlife-contact-v8 .mc8-contact-card{grid-column:1!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-map-card{grid-column:2!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-card{background:var(--ml-white)!important;border:1px solid #e6e1dd!important;border-radius:22px!important;box-shadow:0 10px 28px rgba(16,24,47,.045)!important;padding:23px!important}
    #medlife-contact-v8 .mc8-card-head h3,#medlife-contact-v8 .mc8-contact-card .mc8-card-head h3{color:var(--ml-navy)!important}
    #medlife-contact-v8 .mc10-contact-label{background:#fff2f5!important;color:var(--ml-red)!important;border-color:#f1d6de!important}
    #medlife-contact-v8 .mc8-icon{background:#fff2f5!important;color:var(--ml-red)!important}
    #medlife-contact-v8 .mc8-item strong{color:var(--ml-navy)!important}
    #medlife-contact-v8 .mc8-item a{color:#263044!important}
    #medlife-contact-v8 .mc8-item a:hover{color:var(--ml-red)!important}
    #medlife-contact-v8 .mc8-action{background:#fff!important;border-color:#e4ded9!important;color:var(--ml-navy)!important}
    #medlife-contact-v8 .mc8-action:hover{border-color:var(--ml-red)!important;color:var(--ml-red)!important;background:#fff9fa!important}

    /* Map */
    #medlife-contact-v8 .mc8-map{height:350px!important;border-radius:16px!important;border:1px solid #dfd9d5!important;overflow:hidden!important}
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:none!important}
    #medlife-contact-v8 .mc8-pin-wrap{background:transparent!important;border:0!important}
    #medlife-contact-v8 .mc8-pin{width:35px!important;height:35px!important;background:var(--ml-red)!important;border:3px solid #fff!important;border-radius:50%!important;box-shadow:0 6px 14px rgba(16,24,47,.22)!important;transform:none!important;display:grid!important;place-items:center!important;padding:0!important}
    #medlife-contact-v8 .mc8-pin:before{display:none!important;content:none!important}
    #medlife-contact-v8 .mc8-pin:after{content:""!important;width:9px!important;height:9px!important;border-radius:50%!important;background:#fff!important;position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important}
    #medlife-contact-v8 .mc8-pin img{display:none!important}
    #medlife-contact-v8 .mc8-team-list button{background:#fff!important;color:var(--ml-navy)!important;border-color:#e6dfdb!important}
    #medlife-contact-v8 .mc8-team-list button:before{background:var(--ml-red)!important}
    #medlife-contact-v8 .mc8-team-list button:hover,#medlife-contact-v8 .mc8-team-list button.active{background:#fff8fa!important;border-color:var(--ml-red)!important;color:var(--ml-red)!important}

    /* Forum block */
    #medlife-contact-v8 .mc8-forum{background:#fff2f5!important;border-color:#f0d5dc!important;border-radius:17px!important}
    #medlife-contact-v8 .mc10-forum-title{color:var(--ml-navy)!important}
    #medlife-contact-v8 .mc10-forum-detail i{color:var(--ml-red)!important}
    #medlife-contact-v8 .mc10-forum-social a{color:var(--ml-navy)!important;border-color:#e8dfe1!important;background:#fff!important}
    #medlife-contact-v8 .mc10-forum-social a:hover{color:var(--ml-red)!important;border-color:var(--ml-red)!important}

    /* Lower cards */
    #medlife-contact-v8 .mc8-lower-card{background:#fff!important;border-color:#e7e1dd!important;color:var(--ml-navy)!important}
    #medlife-contact-v8 .mc8-quote{color:#72798a!important;border-color:#e7e0dc!important}
    #medlife-contact-v8 .mc8-quote strong{color:var(--ml-navy)!important}

    /* Social channels */
    #medlife-contact-v8 .mc4-social{margin-top:28px;padding-top:28px;border-top:1px solid #e6e0dc}
    #medlife-contact-v8 .mc4-social-head{text-align:center;max-width:720px;margin:0 auto 18px}
    #medlife-contact-v8 .mc4-social-kicker{display:inline-block;padding:5px 10px;border-radius:999px;background:#fff2f5;border:1px solid #f1d6de;color:var(--ml-red);font:900 10px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc4-social-head h3{margin:8px 0 5px;font:900 25px Cairo,Arial,sans-serif;color:var(--ml-navy)}
    #medlife-contact-v8 .mc4-social-head p{margin:0;color:var(--ml-muted);font:500 11px/1.8 Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc4-social-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
    #medlife-contact-v8 .mc4-social-card{min-height:78px;padding:12px 10px;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid #e6dfdb;border-radius:14px;background:#fff;text-decoration:none;color:var(--ml-navy);transition:.2s ease}
    #medlife-contact-v8 .mc4-social-card:hover{transform:translateY(-2px);border-color:var(--ml-red);box-shadow:0 9px 20px rgba(16,24,47,.05)}
    #medlife-contact-v8 .mc4-social-icon{width:38px;height:38px;border-radius:11px;background:#fff2f5;color:var(--ml-red);display:grid;place-items:center;font-size:17px;flex:none}
    #medlife-contact-v8 .mc4-social-card strong{display:block;font:900 11px Cairo,Arial,sans-serif;color:var(--ml-navy)}
    #medlife-contact-v8 .mc4-social-card small{display:block;margin-top:2px;color:#7c8492;font:500 8px/1.4 Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc4-social-card.is-pending{cursor:default;opacity:.86}
    #medlife-contact-v8 .mc4-social-card.is-pending:hover{transform:none;border-color:#e6dfdb;box-shadow:none}
    #medlife-contact-v8 .mc4-social-note{text-align:center;margin-top:9px;color:#8a919c;font:500 9px/1.6 Cairo,Arial,sans-serif}

    /* Navy footer */
    #medlife-contact-v8 .mc4-footer{margin-top:42px;background:var(--ml-navy);color:#fff;border-radius:24px 24px 0 0;overflow:hidden}
    #medlife-contact-v8 .mc4-footer-inner{width:min(1120px,calc(100% - 32px));margin:auto;padding:28px 0 20px}
    #medlife-contact-v8 .mc4-footer-top{display:flex;align-items:center;justify-content:space-between;gap:24px}
    #medlife-contact-v8 .mc4-footer-brand{display:flex;align-items:center;gap:12px}
    #medlife-contact-v8 .mc4-footer-brand img{width:48px;height:48px;border-radius:50%;object-fit:cover;background:#fff;padding:1px}
    #medlife-contact-v8 .mc4-footer-brand strong{display:block;font:900 14px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc4-footer-brand span{display:block;margin-top:2px;color:#cbd0dc;font:500 9px Cairo,Arial,sans-serif}
    #medlife-contact-v8 .mc4-footer-links{display:flex;flex-wrap:wrap;gap:8px}
    #medlife-contact-v8 .mc4-footer-links a{color:#fff;text-decoration:none;padding:7px 10px;border:1px solid rgba(255,255,255,.16);border-radius:9px;font:800 9px Cairo,Arial,sans-serif;transition:.2s ease}
    #medlife-contact-v8 .mc4-footer-links a:hover{background:#e92850;border-color:#e92850}
    #medlife-contact-v8 .mc4-footer-bottom{margin-top:20px;padding-top:13px;border-top:1px solid rgba(255,255,255,.13);display:flex;justify-content:space-between;gap:15px;color:#b8bfcd;font:500 8px/1.6 Cairo,Arial,sans-serif}

    @media(max-width:1050px){#medlife-contact-v8 .mc4-social-grid{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:900px){
      #medlife-contact-v8 .mc8-main{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc8-contact-card,#medlife-contact-v8 .mc8-map-card{grid-column:1!important;grid-row:auto!important}
      #medlife-contact-v8 .mc8-contact-card{order:1}.mc8-map-card{order:2}
      #medlife-contact-v8 .mc4-footer-top{align-items:flex-start;flex-direction:column}
    }
    @media(max-width:640px){
      #medlife-contact-v8 .mc8-hero{padding:24px 12px 22px!important}
      #medlife-contact-v8 .mc8-wrap{padding:27px 16px 24px!important;border-radius:21px!important}
      #medlife-contact-v8 .mc8-logo{width:116px!important;height:116px!important}
      #medlife-contact-v8 .mc8-content{width:calc(100% - 20px)!important;padding:28px 0 48px!important}
      #medlife-contact-v8 .mc8-card{padding:17px!important;border-radius:18px!important}
      #medlife-contact-v8 .mc8-map{height:315px!important}
      #medlife-contact-v8 .mc4-social-grid{grid-template-columns:1fr}
      #medlife-contact-v8 .mc4-footer{border-radius:20px 20px 0 0}
      #medlife-contact-v8 .mc4-footer-bottom{flex-direction:column}
    }
  `;
  document.head.appendChild(style);

  function addSocialAndFooter(){
    const page=document.getElementById('medlife-contact-v8');
    if(!page || page.dataset.final4==='1') return;
    const lower=page.querySelector('.mc8-lower');
    if(!lower) return;
    page.dataset.final4='1';

    const social=document.createElement('section');
    social.className='mc4-social';
    social.innerHTML=`
      <div class="mc4-social-head">
        <span class="mc4-social-kicker">الحضور الرقمي لميدلايف</span>
        <h3>تابع ميدلايف عبر منصاتها الرسمية</h3>
        <p>آخر المبادرات والأنشطة والمحتوى الطبي والأخبار من القنوات الرقمية لميدلايف.</p>
      </div>
      <div class="mc4-social-grid">
        <a class="mc4-social-card" href="https://www.linkedin.com/company/med-life-syria" target="_blank" rel="noopener noreferrer"><span class="mc4-social-icon"><i class="fa-brands fa-linkedin-in"></i></span><span><strong>LinkedIn</strong><small>Med Life Syria</small></span></a>
        <a class="mc4-social-card" href="https://www.youtube.com/@medlifesy" target="_blank" rel="noopener noreferrer"><span class="mc4-social-icon"><i class="fa-brands fa-youtube"></i></span><span><strong>YouTube</strong><small>@medlifesy</small></span></a>
        <a class="mc4-social-card" href="https://www.facebook.com/Medlifesyforum" target="_blank" rel="noopener noreferrer"><span class="mc4-social-icon"><i class="fa-brands fa-facebook-f"></i></span><span><strong>Facebook المنتدى</strong><small>MedLife Forum</small></span></a>
        <div class="mc4-social-card is-pending"><span class="mc4-social-icon"><i class="fa-brands fa-instagram"></i></span><span><strong>Instagram</strong><small>الحساب الرسمي</small></span></div>
        <div class="mc4-social-card is-pending"><span class="mc4-social-icon"><i class="fa-brands fa-telegram"></i></span><span><strong>Telegram</strong><small>القناة الرسمية</small></span></div>
      </div>
      <div class="mc4-social-note">تم ربط الحسابات التي أمكن التحقق من عناوينها رسمياً، وستُفعّل روابط Instagram وTelegram الرئيسية عند التحقق من العنوان الدقيق.</div>
    `;
    lower.parentNode.insertBefore(social,lower.nextSibling);

    const footer=document.createElement('footer');
    footer.className='mc4-footer';
    footer.innerHTML=`
      <div class="mc4-footer-inner">
        <div class="mc4-footer-top">
          <a class="mc4-footer-brand" href="/index.html" style="text-decoration:none;color:inherit">
            <img src="/logo.PNG" alt="شعار مؤسسة ميدلايف"><span><strong>مؤسسة ميدلايف الطبية الخيرية التطوعية</strong><span>الصحة · التوعية · التطوع · الإنسانية</span></span>
          </a>
          <nav class="mc4-footer-links" aria-label="روابط سريعة">
            <a href="/about-medlife.html">عن المؤسسة</a>
            <a href="/articles.html">المقالات</a>
            <a href="/forum-v3.html">المنتدى</a>
            <a href="/support.html">صندوق الدعم</a>
            <a href="/join-options.html">الانضمام</a>
          </nav>
        </div>
        <div class="mc4-footer-bottom"><span>© مؤسسة ميدلايف الطبية الخيرية التطوعية</span><span>نعمل بالمحبة والتطوع لنصنع أثراً يستحق أن يبقى.</span></div>
      </div>
    `;
    page.appendChild(footer);
  }

  function init(){
    if(!document.getElementById('medlife-contact-v8')) return;
    addSocialAndFooter();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,900);setTimeout(init,1800);
})();
