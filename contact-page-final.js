(() => {
  'use strict';
  const ID='medlife-contact-final-polish';
  if(document.getElementById(ID)) return;
  const style=document.createElement('style');
  style.id=ID;
  style.textContent=`
    #medlife-contact-v8{background:#fffaf7!important;color:#10182f!important}
    #medlife-contact-v8 .mc8-hero{background:#fffaf7!important;border:0!important;padding:48px 18px 38px!important}
    #medlife-contact-v8 .mc8-wrap{width:min(900px,100%)!important;background:#fff!important;border:1px solid #eee7e3!important;border-radius:28px!important;box-shadow:0 16px 42px rgba(16,24,47,.055)!important;padding:32px 34px!important;overflow:hidden!important}
    #medlife-contact-v8 .mc8-wrap:before{display:none!important}
    #medlife-contact-v8 .mc8-wrap:after{background:#fff1f4!important;width:180px!important;height:180px!important;right:-86px!important;top:-94px!important}
    #medlife-contact-v8 .mc8-brand{margin:0 auto 17px!important}
    #medlife-contact-v8 .mc8-logo{width:142px!important;height:142px!important;border:3px solid #e92850!important;padding:0!important;background:#fff!important;box-shadow:0 12px 28px rgba(16,24,47,.08)!important;animation:mcfinalfloat 4.5s ease-in-out infinite!important;overflow:hidden!important}
    #medlife-contact-v8 .mc8-logo img{width:116%!important;height:116%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;border-radius:50%!important;transform:translate(-8%,-8%)!important;display:block!important}
    @keyframes mcfinalfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    #medlife-contact-v8 .mc8-kicker{font-size:10px!important;background:#fff3f5!important;color:#e92850!important;border-color:#f1d7de!important}
    #medlife-contact-v8 h1{font-size:clamp(34px,4.5vw,48px)!important;margin:10px 0 6px!important;letter-spacing:-.3px!important}
    #medlife-contact-v8 .mc8-hero p{font-size:13px!important;max-width:620px!important;color:#727887!important}
    #medlife-contact-v8 .mc8-content{width:min(1120px,calc(100% - 32px))!important;padding:42px 0 76px!important}
    #medlife-contact-v8 .mc8-title{margin-bottom:24px!important}
    #medlife-contact-v8 .mc8-title small{font-size:10px!important;background:#fff3f5!important;color:#e92850!important;padding:5px 10px!important;border-radius:999px!important}
    #medlife-contact-v8 .mc8-title h2{font-size:28px!important;margin:9px 0 5px!important}
    #medlife-contact-v8 .mc8-title p{font-size:12px!important;color:#727887!important}
    #medlife-contact-v8 .mc8-main{grid-template-columns:minmax(0,1.08fr) minmax(300px,.92fr)!important;gap:26px!important;align-items:stretch!important}
    #medlife-contact-v8 .mc8-contact-card{grid-column:1!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-map-card{grid-column:2!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-card{padding:22px!important;border-radius:21px!important;border:1px solid #e9e3df!important;box-shadow:0 10px 30px rgba(16,24,47,.045)!important}
    #medlife-contact-v8 .mc8-card-head{margin-bottom:14px!important}
    #medlife-contact-v8 .mc8-card-head img{width:38px!important;height:38px!important;padding:2px!important;border:2px solid #e92850!important}
    #medlife-contact-v8 .mc8-card-head h3{font-size:18px!important}
    #medlife-contact-v8 .mc8-card-head p{font-size:10px!important;color:#727887!important}
    #medlife-contact-v8 .mc8-contact-list{grid-template-columns:1fr!important}
    #medlife-contact-v8 .mc8-item{padding:13px 0!important}
    #medlife-contact-v8 .mc8-icon{width:40px!important;height:40px!important;border-radius:12px!important;background:#fff2f4!important;color:#e92850!important}
    #medlife-contact-v8 .mc8-item strong{font-size:11px!important}
    #medlife-contact-v8 .mc8-item small{font-size:10px!important;color:#727887!important}
    #medlife-contact-v8 .mc8-item a{font-size:11px!important}
    #medlife-contact-v8 .mc8-item a[href^="tel:"],#medlife-contact-v8 .mc8-item a[href^="mailto:"]{direction:ltr!important;unicode-bidi:plaintext!important;text-align:right!important}
    #medlife-contact-v8 .mc8-actions{grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:18px!important}
    #medlife-contact-v8 .mc8-action{min-height:40px!important;padding:9px!important;font-size:10px!important;border-radius:10px!important}
    #medlife-contact-v8 .mc8-forum{margin-top:18px!important;padding:17px!important;border-radius:16px!important;background:#fff3f5!important;border-color:#f0d8df!important}
    #medlife-contact-v8 .mc8-forum h4{font-size:16px!important}
    #medlife-contact-v8 .mc8-forum p{font-size:10px!important}
    #medlife-contact-v8 .mc8-map{height:355px!important;border-radius:16px!important}
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:none!important}
    #medlife-contact-v8 .mc8-team-list{grid-template-columns:1fr 1fr!important;gap:7px!important;margin-top:10px!important}
    #medlife-contact-v8 .mc8-team-list button{min-height:44px!important;padding:7px!important;font-size:10px!important;border-radius:10px!important}
    #medlife-contact-v8 .mc8-pin{width:36px!important;height:46px!important;background:#e92850!important;border:3px solid #fff!important;box-shadow:0 7px 15px rgba(16,24,47,.2)!important;padding:0!important}
    #medlife-contact-v8 .mc8-pin img{width:17px!important;height:17px!important;padding:1px!important;background:#fff!important;border-radius:50%!important;display:block!important;transform:rotate(45deg)!important}
    #medlife-contact-v8 .mc8-pin:before{animation:none!important;border:0!important}
    #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr 1fr!important;gap:18px!important;margin-top:22px!important}
    #medlife-contact-v8 .mc8-lower-card{border:1px solid #e9e3df!important;border-radius:18px!important;box-shadow:0 8px 24px rgba(16,24,47,.04)!important;padding:19px!important}
    #medlife-contact-v8 .mc8-links a{font-size:9px!important}
    #medlife-contact-v8 .mc8-quote{margin-top:28px!important;padding:20px 10px!important;border-top:1px solid #eadfdc!important;font-size:12px!important}
    @media(max-width:900px){#medlife-contact-v8 .mc8-main{grid-template-columns:1fr!important}.mc8-contact-card,.mc8-map-card{grid-column:1!important;grid-row:auto!important}.mc8-contact-card{order:1}.mc8-map-card{order:2}}
    @media(max-width:640px){#medlife-contact-v8 .mc8-hero{padding:24px 12px 22px!important}#medlife-contact-v8 .mc8-wrap{padding:27px 16px 24px!important;border-radius:21px!important}#medlife-contact-v8 .mc8-logo{width:120px!important;height:120px!important}#medlife-contact-v8 .mc8-content{width:calc(100% - 20px)!important;padding:30px 0 52px!important}#medlife-contact-v8 .mc8-card{padding:17px!important;border-radius:18px!important}#medlife-contact-v8 .mc8-map{height:320px!important}#medlife-contact-v8 .mc8-lower{grid-template-columns:1fr!important}#medlife-contact-v8 .mc8-actions{grid-template-columns:1fr!important}}
    @media(prefers-reduced-motion:reduce){#medlife-contact-v8 .mc8-logo{animation:none!important}}
  `;
  document.head.appendChild(style);
})();