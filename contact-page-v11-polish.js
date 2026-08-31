(() => {
  'use strict';
  const id='medlife-contact-v11-polish';
  if(document.getElementById(id)) return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
    /* MedLife Contact final institutional polish */
    #medlife-contact-v8{
      background:#fffaf7!important;
      color:#10182f!important;
      min-height:100vh!important;
    }
    #medlife-contact-v8 .mc8-hero{
      background:#fff!important;
      border-bottom:1px solid #eee7e3!important;
      padding:54px 18px 42px!important;
      position:relative!important;
      overflow:hidden!important;
    }
    #medlife-contact-v8 .mc8-hero:before{
      content:""!important;
      position:absolute!important;
      top:0!important;left:0!important;right:0!important;
      height:7px!important;
      background:#e92850!important;
      z-index:3!important;
    }
    #medlife-contact-v8 .mc8-hero:after{
      content:""!important;
      position:absolute!important;
      width:280px!important;height:280px!important;
      border-radius:50%!important;
      background:#fff0f3!important;
      top:-175px!important;right:6%!important;
      pointer-events:none!important;
    }
    #medlife-contact-v8 .mc8-wrap{position:relative!important;z-index:2!important}
    #medlife-contact-v8 .mc8-logo{
      width:128px!important;height:128px!important;
      border:3px solid #e92850!important;
      box-shadow:0 13px 30px rgba(16,24,47,.10)!important;
      animation:mc11float 4.8s ease-in-out infinite!important;
    }
    @keyframes mc11float{
      0%,100%{transform:translateY(0)}
      50%{transform:translateY(-7px)}
    }
    #medlife-contact-v8 .mc8-kicker{
      background:#fff0f3!important;
      border-color:#f2d8de!important;
      color:#e92850!important;
    }
    #medlife-contact-v8 h1{
      color:#10182f!important;
      font-size:clamp(36px,5vw,52px)!important;
      letter-spacing:-.4px!important;
    }
    #medlife-contact-v8 .mc8-content{
      padding:58px 0 88px!important;
    }
    #medlife-contact-v8 .mc8-title{
      margin-bottom:32px!important;
    }
    #medlife-contact-v8 .mc8-title small{
      color:#e92850!important;
      letter-spacing:.2px!important;
    }
    #medlife-contact-v8 .mc8-title h2{
      font-size:30px!important;
      margin:5px 0 8px!important;
    }
    #medlife-contact-v8 .mc8-title p{
      color:#69758b!important;
      font-size:13px!important;
    }
    /* Desktop: contact left, map right */
    #medlife-contact-v8 .mc8-main{
      display:grid!important;
      grid-template-columns:minmax(0,1.16fr) minmax(340px,.84fr)!important;
      gap:34px!important;
      align-items:start!important;
      direction:ltr!important;
    }
    #medlife-contact-v8 .mc8-contact-card{
      grid-column:1!important;
      grid-row:1!important;
      direction:rtl!important;
    }
    #medlife-contact-v8 .mc8-map-card{
      grid-column:2!important;
      grid-row:1!important;
      direction:rtl!important;
    }
    #medlife-contact-v8 .mc8-card{
      background:#fff!important;
      border:1px solid #e8e2df!important;
      border-radius:24px!important;
      box-shadow:0 14px 34px rgba(16,24,47,.055)!important;
      padding:25px!important;
    }
    #medlife-contact-v8 .mc8-contact-card .mc8-card-head,
    #medlife-contact-v8 .mc8-map-card .mc8-card-head{
      margin-bottom:17px!important;
    }
    #medlife-contact-v8 .mc8-card-head img{
      border-color:#e92850!important;
    }
    #medlife-contact-v8 .mc8-map{
      height:392px!important;
      border-radius:18px!important;
      border:1px solid #ddd7d3!important;
      overflow:hidden!important;
      background:#dceef7!important;
    }
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane{
      filter:none!important;
    }
    #medlife-contact-v8 .mc8-team-list{
      grid-template-columns:repeat(4,1fr)!important;
      gap:8px!important;
      margin-top:13px!important;
    }
    #medlife-contact-v8 .mc8-team-list button{
      min-height:54px!important;
      border:1px solid #e8e2df!important;
      background:#fff!important;
      color:#10182f!important;
      border-radius:11px!important;
      font-weight:800!important;
    }
    #medlife-contact-v8 .mc8-team-list button:before{
      background:#e92850!important;
    }
    #medlife-contact-v8 .mc8-contact-list{
      grid-template-columns:1fr 1fr!important;
      gap:0 22px!important;
    }
    #medlife-contact-v8 .mc8-item{
      min-height:82px!important;
      padding:15px 0!important;
    }
    #medlife-contact-v8 .mc8-item a[href^="tel:"],
    #medlife-contact-v8 .mc8-item a[href^="mailto:"]{
      direction:ltr!important;
      unicode-bidi:plaintext!important;
      text-align:right!important;
      display:inline-block!important;
      letter-spacing:.1px!important;
    }
    #medlife-contact-v8 .mc8-icon{
      background:#fff0f3!important;
      color:#e92850!important;
    }
    #medlife-contact-v8 .mc8-actions{
      grid-template-columns:repeat(2,1fr)!important;
      gap:9px!important;
      margin-top:21px!important;
    }
    #medlife-contact-v8 .mc8-action{
      background:#fff!important;
      color:#10182f!important;
      border:1px solid #e8e2df!important;
      padding:11px!important;
    }
    #medlife-contact-v8 .mc8-action:hover{
      color:#e92850!important;
      border-color:#e92850!important;
    }
    #medlife-contact-v8 .mc8-forum{
      background:#fff0f3!important;
      border:1px solid #f0d3da!important;
      border-radius:18px!important;
      padding:19px!important;
      margin-top:20px!important;
    }
    #medlife-contact-v8 .mc10-forum-details{
      grid-template-columns:1fr 1fr!important;
      gap:9px 18px!important;
      margin-top:14px!important;
    }
    #medlife-contact-v8 .mc10-forum-detail{
      border-top:1px solid #f0d8de!important;
      padding-top:9px!important;
    }
    #medlife-contact-v8 .mc10-forum-detail i{
      color:#e92850!important;
    }
    #medlife-contact-v8 .mc10-forum-detail a,
    #medlife-contact-v8 .mc10-forum-detail span{
      color:#616a78!important;
    }
    #medlife-contact-v8 .mc10-forum-detail a{
      direction:ltr!important;
      unicode-bidi:plaintext!important;
      text-align:right!important;
      display:inline-block!important;
    }
    #medlife-contact-v8 .mc10-forum-social a{
      background:#fff!important;
      color:#10182f!important;
      border:1px solid #eadfe1!important;
    }
    #medlife-contact-v8 .mc10-forum-social a:hover{
      color:#e92850!important;
      border-color:#e92850!important;
    }
    #medlife-contact-v8 .mc8-lower{
      grid-template-columns:1fr 1fr!important;
      gap:22px!important;
      margin-top:30px!important;
    }
    #medlife-contact-v8 .mc8-lower-card{
      background:#fff!important;
      border:1px solid #e8e2df!important;
      border-radius:20px!important;
      box-shadow:0 10px 28px rgba(16,24,47,.045)!important;
      padding:21px!important;
    }
    #medlife-contact-v8 .mc8-quote{
      margin-top:40px!important;
      padding:24px 10px 8px!important;
      color:#69758b!important;
      border-top:1px solid #eadfdc!important;
      font-size:13px!important;
    }
    #medlife-contact-v8 .mc8-pin-wrap{
      background:transparent!important;
      border:0!important;
    }
    #medlife-contact-v8 .mc8-pin{
      width:40px!important;
      height:50px!important;
      background:#e92850!important;
      border:3px solid #fff!important;
      border-radius:50% 50% 50% 0!important;
      box-shadow:0 8px 17px rgba(16,24,47,.23)!important;
      transform:rotate(-45deg)!important;
      padding:3px!important;
    }
    #medlife-contact-v8 .mc8-pin img{
      width:21px!important;
      height:21px!important;
      background:#fff!important;
      border-radius:50%!important;
      padding:2px!important;
      object-fit:contain!important;
      transform:rotate(45deg)!important;
    }
    #medlife-contact-v8 .mc8-pin:before{
      content:""!important;
      position:absolute!important;
      inset:-6px!important;
      border:1px solid rgba(233,40,80,.20)!important;
      border-radius:50%!important;
      animation:mc11pulse 2.5s ease-out infinite!important;
    }
    @keyframes mc11pulse{
      0%{opacity:.5;transform:scale(.82)}
      100%{opacity:0;transform:scale(1.18)}
    }
    @media(max-width:900px){
      #medlife-contact-v8 .mc8-main{
        grid-template-columns:1fr!important;
        direction:rtl!important;
      }
      #medlife-contact-v8 .mc8-map-card,
      #medlife-contact-v8 .mc8-contact-card{
        grid-column:1!important;
        grid-row:auto!important;
      }
      #medlife-contact-v8 .mc8-map-card{order:1!important}
      #medlife-contact-v8 .mc8-contact-card{order:2!important}
    }
    @media(max-width:640px){
      #medlife-contact-v8 .mc8-hero{padding:40px 14px 32px!important}
      #medlife-contact-v8 .mc8-logo{width:106px!important;height:106px!important}
      #medlife-contact-v8 .mc8-content{padding:42px 0 62px!important}
      #medlife-contact-v8 .mc8-card{padding:19px!important;border-radius:20px!important}
      #medlife-contact-v8 .mc8-map{height:345px!important}
      #medlife-contact-v8 .mc8-contact-list{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc8-item:nth-last-child(-n+2){border-bottom:1px solid #efebea!important}
      #medlife-contact-v8 .mc8-item:last-child{border-bottom:0!important}
      #medlife-contact-v8 .mc8-team-list{grid-template-columns:repeat(2,1fr)!important}
      #medlife-contact-v8 .mc8-actions{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc10-forum-details{grid-template-columns:1fr!important}
    }
    @media(prefers-reduced-motion:reduce){
      #medlife-contact-v8 .mc8-logo,#medlife-contact-v8 .mc8-pin:before{animation:none!important}
    }
  `;
  document.head.appendChild(s);
})();
