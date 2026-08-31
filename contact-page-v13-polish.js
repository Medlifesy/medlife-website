(() => {
  'use strict';
  const id='medlife-contact-v13-polish';
  if(document.getElementById(id)) return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
    #medlife-contact-v8{background:#fffaf7!important;color:#10182f!important}

    /* Hero: calm, premium, no top red line */
    #medlife-contact-v8 .mc8-hero{padding:48px 18px 38px!important;background:#fffaf7!important;border:0!important}
    #medlife-contact-v8 .mc8-wrap{width:min(860px,100%)!important;background:#fff!important;border:1px solid #eee6e2!important;border-radius:28px!important;box-shadow:0 18px 45px rgba(16,24,47,.06)!important;padding:34px 34px 30px!important;position:relative!important;overflow:hidden!important}
    #medlife-contact-v8 .mc8-wrap:before{display:none!important}
    #medlife-contact-v8 .mc8-wrap:after{width:170px!important;height:170px!important;right:-92px!important;top:-100px!important;background:#fff2f4!important}
    #medlife-contact-v8 .mc8-logo{width:138px!important;height:138px!important;padding:0!important;border:2px solid #e92850!important;background:#fff!important;border-radius:50%!important;overflow:hidden!important;box-shadow:0 10px 25px rgba(16,24,47,.08)!important}
    #medlife-contact-v8 .mc8-logo img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;display:block!important}
    #medlife-contact-v8 .mc8-kicker{background:#fff5f6!important;border-color:#f2d9de!important;color:#e92850!important}
    #medlife-contact-v8 h1{margin:12px 0 8px!important;font-size:clamp(36px,5vw,52px)!important;letter-spacing:-.5px!important}
    #medlife-contact-v8 .mc8-hero p{font-size:14px!important;max-width:620px!important;color:#6b7280!important}

    /* Better breathing room */
    #medlife-contact-v8 .mc8-content{padding:46px 0 78px!important}
    #medlife-contact-v8 .mc8-title{margin-bottom:28px!important}
    #medlife-contact-v8 .mc8-title h2{font-size:30px!important;margin:9px 0 6px!important}
    #medlife-contact-v8 .mc8-title p{font-size:12.5px!important}

    /* Main two-column relationship: contact left, map right */
    #medlife-contact-v8 .mc8-main{grid-template-columns:minmax(0,1.08fr) minmax(310px,.92fr)!important;gap:30px!important;align-items:start!important}
    #medlife-contact-v8 .mc8-contact-card{grid-column:1!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-map-card{grid-column:2!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-card{border:1px solid #ebe5e2!important;border-radius:22px!important;box-shadow:0 12px 34px rgba(16,24,47,.05)!important;padding:24px!important}

    /* Map */
    #medlife-contact-v8 .mc8-map-card{background:#fff!important}
    #medlife-contact-v8 .mc8-map{height:350px!important;border-radius:16px!important;border:1px solid #e5e0dd!important}
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:none!important}
    #medlife-contact-v8 .mc8-pin{width:40px!important;height:50px!important;background:#e92850!important;border:3px solid #fff!important;border-radius:50% 50% 50% 0!important;box-shadow:0 7px 16px rgba(16,24,47,.21)!important}
    #medlife-contact-v8 .mc8-pin img{width:18px!important;height:18px!important;padding:2px!important;background:#fff!important;border-radius:50%!important;display:block!important;transform:rotate(45deg)!important}
    #medlife-contact-v8 .mc8-team-list{grid-template-columns:repeat(2,1fr)!important;gap:7px!important;margin-top:12px!important}
    #medlife-contact-v8 .mc8-team-list button{min-height:46px!important;border-radius:10px!important;font-size:10px!important}

    /* Contact hierarchy */
    #medlife-contact-v8 .mc8-contact-list{grid-template-columns:1fr 1fr!important;gap:0 24px!important}
    #medlife-contact-v8 .mc8-item{padding:15px 0!important;min-height:74px!important}
    #medlife-contact-v8 .mc8-icon{width:40px!important;height:40px!important;border-radius:12px!important;background:#fff2f4!important;color:#e92850!important}
    #medlife-contact-v8 .mc8-item strong{font-size:12px!important}
    #medlife-contact-v8 .mc8-item small{font-size:10px!important}
    #medlife-contact-v8 .mc8-item a[href^="tel:"],#medlife-contact-v8 .mc8-item a[href^="mailto:"]{direction:ltr!important;unicode-bidi:plaintext!important;display:inline-block!important;text-align:right!important}
    #medlife-contact-v8 .mc8-actions{grid-template-columns:repeat(2,1fr)!important;gap:8px!important;margin-top:20px!important}
    #medlife-contact-v8 .mc8-action{min-height:42px!important;border-radius:11px!important;font-size:10.5px!important}

    /* Forum block: structured, not heavy */
    #medlife-contact-v8 .mc8-forum{margin-top:20px!important;padding:18px!important;background:#fff8fa!important;border:1px solid #f0dce1!important;border-radius:17px!important}
    #medlife-contact-v8 .mc8-forum h4{font-size:17px!important;margin:0 0 5px!important}
    #medlife-contact-v8 .mc10-forum-details{grid-template-columns:1fr 1fr!important;gap:8px 18px!important}
    #medlife-contact-v8 .mc10-forum-detail{padding-top:9px!important}
    #medlife-contact-v8 .mc10-forum-detail span,#medlife-contact-v8 .mc10-forum-detail a{font-size:9.5px!important}

    /* Lower content: elegant, restrained */
    #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr 1fr!important;gap:22px!important;margin-top:28px!important}
    #medlife-contact-v8 .mc8-lower-card{border:1px solid #ebe5e2!important;border-radius:18px!important;padding:20px!important;box-shadow:0 9px 24px rgba(16,24,47,.035)!important}
    #medlife-contact-v8 .mc8-quote{margin-top:30px!important;padding:22px 10px!important;border-top:1px solid #eadfdc!important;font-size:12.5px!important;color:#747b88!important}

    @media(max-width:900px){
      #medlife-contact-v8 .mc8-main{grid-template-columns:1fr!important;gap:18px!important}
      #medlife-contact-v8 .mc8-contact-card,#medlife-contact-v8 .mc8-map-card{grid-column:1!important;grid-row:auto!important}
      #medlife-contact-v8 .mc8-contact-card{order:1}.mc8-map-card{order:2}
    }
    @media(max-width:650px){
      #medlife-contact-v8 .mc8-hero{padding:24px 12px 22px!important}
      #medlife-contact-v8 .mc8-wrap{padding:28px 18px 24px!important;border-radius:22px!important}
      #medlife-contact-v8 .mc8-logo{width:112px!important;height:112px!important}
      #medlife-contact-v8 .mc8-content{padding:30px 0 54px!important}
      #medlife-contact-v8 .mc8-card{padding:18px!important;border-radius:18px!important}
      #medlife-contact-v8 .mc8-contact-list{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc8-item{border-bottom:1px solid #efebea!important}
      #medlife-contact-v8 .mc8-item:last-child{border-bottom:0!important}
      #medlife-contact-v8 .mc8-actions,#medlife-contact-v8 .mc8-lower{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc10-forum-details{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc8-map{height:320px!important}
    }
    @media(prefers-reduced-motion:reduce){#medlife-contact-v8 .mc8-logo{animation:none!important}}
  `;
  document.head.appendChild(s);
})();