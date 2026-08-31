(() => {
  'use strict';
  const id = 'medlife-contact-v10-polish';
  const BRAND = '/logo.PNG?v=20260831-contact10';
  const locations = [
    ['ميدلايف طرطوس', 34.8959, 35.8867, 'المكتب الرئيسي لمؤسسة ميدلايف في طرطوس.'],
    ['ميدلايف بانياس', 35.1818, 35.9486, 'فريق ميدلايف في بانياس.'],
    ['ميدلايف اللاذقية', 35.5317, 35.7914, 'فريق ميدلايف في اللاذقية.'],
    ['ميدلايف حمص', 34.7324, 36.7137, 'فريق ميدلايف في حمص.'],
    ['ميدلايف دمشق', 33.5138, 36.2765, 'فريق ميدلايف في دمشق.'],
    ['ميدلايف حلب', 36.2021, 37.1343, 'فريق ميدلايف في حلب.'],
    ['ميدلايف الحسكة', 36.5024, 40.7477, 'فريق ميدلايف في الحسكة.']
  ];

  function injectStyles() {
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      #medlife-contact-v8{
        background:#fffaf7!important;
        color:#10182f!important;
      }
      #medlife-contact-v8 .mc8-hero{
        position:relative!important;
        background:#fff!important;
        border-bottom:0!important;
        padding:44px 18px 34px!important;
      }
      #medlife-contact-v8 .mc8-hero:before{
        content:""!important;
        position:absolute!important;
        top:0!important;left:0;right:0;height:6px!important;
        background:#e92850!important;
      }
      #medlife-contact-v8 .mc8-hero:after{
        content:""!important;
        position:absolute!important;
        width:210px;height:210px!important;
        border-radius:50%!important;
        background:#fff0f3!important;
        right:-90px;top:-80px!important;
        pointer-events:none!important;
      }
      #medlife-contact-v8 .mc8-wrap{position:relative;z-index:1}
      #medlife-contact-v8 .mc8-logo{
        width:122px!important;height:122px!important;
        border:3px solid #e92850!important;
        box-shadow:0 12px 28px rgba(16,24,47,.08)!important;
        animation:mc10float 4s ease-in-out infinite!important;
      }
      @keyframes mc10float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      #medlife-contact-v8 .mc8-kicker{
        background:#fff0f3!important;color:#e92850!important;border-color:#f2d0d8!important;
      }
      #medlife-contact-v8 h1{color:#10182f!important;font-size:clamp(35px,5vw,50px)!important}
      #medlife-contact-v8 .mc8-content{
        padding:52px 0 82px!important;
      }
      #medlife-contact-v8 .mc8-title{margin-bottom:30px!important}
      #medlife-contact-v8 .mc8-title h2{font-size:30px!important}
      #medlife-contact-v8 .mc8-title p{font-size:13px!important}
      #medlife-contact-v8 .mc8-main{
        grid-template-columns:minmax(360px,.88fr) minmax(0,1.12fr)!important;
        gap:28px!important;
        align-items:stretch!important;
      }
      #medlife-contact-v8 .mc8-map-card{grid-column:1!important;grid-row:1!important}
      #medlife-contact-v8 .mc8-contact-card{grid-column:2!important;grid-row:1!important}
      #medlife-contact-v8 .mc8-card{
        border:1px solid #e8e2df!important;
        border-radius:24px!important;
        box-shadow:0 14px 36px rgba(16,24,47,.055)!important;
        padding:24px!important;
      }
      #medlife-contact-v8 .mc8-map{height:385px!important;border-radius:18px!important}
      #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:none!important}
      #medlife-contact-v8 .mc8-map-card .mc8-card-head{margin-bottom:16px!important}
      #medlife-contact-v8 .mc8-card-head img{border-color:#e92850!important}
      #medlife-contact-v8 .mc8-team-list{margin-top:14px!important;grid-template-columns:repeat(4,1fr)!important;gap:8px!important}
      #medlife-contact-v8 .mc8-team-list button{
        min-height:54px!important;
        border-color:#e8e1de!important;
        background:#fff!important;
      }
      #medlife-contact-v8 .mc8-team-list button:before{background:#e92850!important}
      #medlife-contact-v8 .mc8-contact-list{grid-template-columns:1fr!important;gap:0!important}
      #medlife-contact-v8 .mc8-item{padding:16px 0!important}
      #medlife-contact-v8 .mc8-item:last-child{border-bottom:0!important}
      #medlife-contact-v8 .mc8-icon{background:#fff0f3!important;color:#e92850!important}
      #medlife-contact-v8 .mc8-item a[href^="tel:"],
      #medlife-contact-v8 .mc8-item a[href^="mailto:"]{
        direction:ltr!important;
        unicode-bidi:plaintext!important;
        text-align:right!important;
        display:inline-block!important;
      }
      #medlife-contact-v8 .mc8-actions{grid-template-columns:repeat(2,1fr)!important;margin-top:22px!important;gap:9px!important}
      #medlife-contact-v8 .mc8-action{border-color:#e8e1de!important;background:#fff!important}
      #medlife-contact-v8 .mc8-action:hover{border-color:#e92850!important;color:#e92850!important}
      #medlife-contact-v8 .mc8-forum{
        margin-top:20px!important;
        padding:19px!important;
        border-radius:18px!important;
        background:#fff0f3!important;
        border:1px solid #f1d4db!important;
      }
      #medlife-contact-v8 .mc8-forum h4{font-size:17px!important;margin:0 0 7px!important}
      #medlife-contact-v8 .mc8-forum p{font-size:11px!important;color:#5f6775!important;margin:0!important}
      #medlife-contact-v8 .mc10-forum-details{
        display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;margin-top:14px;
      }
      #medlife-contact-v8 .mc10-forum-detail{
        display:flex;gap:8px;align-items:flex-start;padding-top:9px;border-top:1px solid #f0d8de;
      }
      #medlife-contact-v8 .mc10-forum-detail i{color:#e92850;width:18px;padding-top:3px}
      #medlife-contact-v8 .mc10-forum-detail strong{display:block;font-size:10px;color:#10182f}
      #medlife-contact-v8 .mc10-forum-detail span,
      #medlife-contact-v8 .mc10-forum-detail a{display:block;margin-top:2px;color:#616a78;font-size:10px;line-height:1.7;text-decoration:none}
      #medlife-contact-v8 .mc10-forum-detail a{direction:ltr;unicode-bidi:plaintext;text-align:right}
      #medlife-contact-v8 .mc10-forum-social{
        display:flex;flex-wrap:wrap;gap:7px;margin-top:13px;
      }
      #medlife-contact-v8 .mc10-forum-social a{
        display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border-radius:10px;
        background:#fff;border:1px solid #eadfe1;color:#10182f;font-size:10px;font-weight:900;text-decoration:none;
      }
      #medlife-contact-v8 .mc10-forum-social a:hover{border-color:#e92850;color:#e92850}
      #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr 1fr!important;gap:22px!important;margin-top:28px!important}
      #medlife-contact-v8 .mc8-lower-card{
        background:#fff!important;border:1px solid #e8e2df!important;border-radius:20px!important;
        padding:22px!important;box-shadow:0 12px 30px rgba(16,24,47,.045)!important;
      }
      #medlife-contact-v8 .mc8-quote{
        margin-top:34px!important;padding:24px 10px!important;border-top:1px solid #eadfdc!important;color:#69758b!important;
        font-size:13px!important;
      }
      #medlife-contact-v8 .mc8-quote strong{color:#10182f!important}
      #medlife-contact-v8 .mc8-pin-wrap{background:transparent!important;border:0!important}
      #medlife-contact-v8 .mc8-pin{
        width:38px!important;height:48px!important;
        background:#e92850!important;border:3px solid #fff!important;
        border-radius:50% 50% 50% 0!important;
        transform:rotate(-45deg)!important;
        box-shadow:0 8px 17px rgba(16,24,47,.22)!important;
        display:grid!important;place-items:center!important;
        padding:0!important;
      }
      #medlife-contact-v8 .mc8-pin img{
        width:17px!important;height:17px!important;
        object-fit:contain!important;background:#fff!important;
        border-radius:50%!important;padding:3px!important;
        transform:rotate(45deg)!important;display:block!important;
      }
      #medlife-contact-v8 .mc8-pin:before{
        content:""!important;position:absolute!important;inset:-7px!important;
        border:1px solid rgba(233,40,80,.22)!important;border-radius:50%!important;
        animation:mc10pulse 2.3s ease-out infinite!important;
      }
      @keyframes mc10pulse{0%{opacity:.55;transform:scale(.8)}100%{opacity:0;transform:scale(1.18)}}
      @media(max-width:900px){
        #medlife-contact-v8 .mc8-main{grid-template-columns:1fr!important;gap:18px!important}
        #medlife-contact-v8 .mc8-map-card,#medlife-contact-v8 .mc8-contact-card{grid-column:1!important;grid-row:auto!important}
      }
      @media(max-width:640px){
        #medlife-contact-v8 .mc8-hero{padding:38px 14px 30px!important}
        #medlife-contact-v8 .mc8-logo{width:104px!important;height:104px!important}
        #medlife-contact-v8 .mc8-content{padding:38px 0 58px!important}
        #medlife-contact-v8 .mc8-card{padding:18px!important;border-radius:19px!important}
        #medlife-contact-v8 .mc8-map{height:330px!important}
        #medlife-contact-v8 .mc8-team-list{grid-template-columns:repeat(2,1fr)!important}
        #medlife-contact-v8 .mc8-actions{grid-template-columns:1fr!important}
        #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr!important}
        #medlife-contact-v8 .mc10-forum-details{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(s);
  }

  function improveForum() {
    const forum = document.querySelector('#medlife-contact-v8 .mc8-forum');
    if (!forum || forum.dataset.v10 === '1') return;
    forum.dataset.v10 = '1';
    forum.innerHTML = `
      <h4>منتدى ميدلايف — طرطوس</h4>
      <p>مساحة للتعلم والتدريب والأنشطة والفعاليات.</p>
      <div class="mc10-forum-details">
        <div class="mc10-forum-detail"><i class="fa-solid fa-location-dot"></i><div><strong>العنوان</strong><span>الجمعية — خلف مستوصف السل — جنوب الفقاسة، طرطوس</span></div></div>
        <div class="mc10-forum-detail"><i class="fa-solid fa-phone"></i><div><strong>الهاتف</strong><a href="tel:+963182220555">+963 182 220 555</a></div></div>
        <div class="mc10-forum-detail"><i class="fa-solid fa-mobile-screen-button"></i><div><strong>الموبايل</strong><a href="tel:+963989913713">+963 989 913 713</a></div></div>
        <div class="mc10-forum-detail"><i class="fa-solid fa-envelope"></i><div><strong>البريد الإلكتروني</strong><a href="mailto:Forum@medlifesy.org">Forum@medlifesy.org</a></div></div>
      </div>
      <div class="mc10-forum-social">
        <a href="/forum-v3.html"><i class="fa-solid fa-arrow-up-right-from-square"></i> زيارة المنتدى</a>
        <a href="https://www.facebook.com/Medlifesyforum" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook"></i> Facebook المنتدى</a>
      </div>
    `;
  }

  function fixPhoneDirection() {
    document.querySelectorAll('#medlife-contact-v8 a[href^="tel:"],#medlife-contact-v8 a[href^="mailto:"]').forEach(a => {
      a.setAttribute('dir','ltr');
      a.style.direction='ltr';
      a.style.unicodeBidi='plaintext';
    });
  }

  function improveMapPins() {
    document.querySelectorAll('#medlife-contact-v8 .mc8-pin').forEach(pin => {
      const img = pin.querySelector('img');
      if (img) {
        img.src = BRAND;
        img.alt = 'MedLife';
      }
    });
  }

  function init() {
    if (!document.getElementById('medlife-contact-v8')) return;
    injectStyles();
    improveForum();
    fixPhoneDirection();
    improveMapPins();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  setTimeout(init, 900);
  setTimeout(init, 1800);
})();
