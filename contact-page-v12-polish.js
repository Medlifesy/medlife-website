(() => {
  'use strict';
  const id='medlife-contact-v12-polish';
  if(document.getElementById(id)) return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
    #medlife-contact-v8{
      background:#fffaf7!important;
      padding-bottom:30px!important;
    }
    #medlife-contact-v8 .mc8-hero{
      background:#fffaf7!important;
      border:0!important;
      padding:54px 18px 42px!important;
    }
    #medlife-contact-v8 .mc8-wrap{
      width:min(920px,100%)!important;
      background:#fff!important;
      border:1px solid #eee5e1!important;
      border-radius:30px!important;
      box-shadow:0 18px 55px rgba(16,24,47,.075)!important;
      padding:34px 34px 30px!important;
      position:relative!important;
      overflow:hidden!important;
    }
    #medlife-contact-v8 .mc8-wrap:before{
      content:""!important;
      position:absolute!important;
      top:0!important;left:0!important;right:0!important;
      height:7px!important;
      background:#e92850!important;
    }
    #medlife-contact-v8 .mc8-wrap:after{
      content:""!important;
      position:absolute!important;
      width:190px!important;height:190px!important;
      border-radius:50%!important;
      background:#fff0f3!important;
      right:-92px!important;top:-108px!important;
      pointer-events:none!important;
    }
    #medlife-contact-v8 .mc8-brand{margin:3px auto 18px!important;position:relative!important;z-index:1!important}
    #medlife-contact-v8 .mc8-logo{
      width:150px!important;height:150px!important;
      border:3px solid #e92850!important;
      background:#fff!important;
      padding:3px!important;
      box-shadow:0 13px 32px rgba(16,24,47,.10)!important;
    }
    #medlife-contact-v8 .mc8-logo img{
      width:100%!important;height:100%!important;
      object-fit:cover!important;
      border-radius:50%!important;
      display:block!important;
    }
    #medlife-contact-v8 .mc8-kicker{position:relative!important;z-index:1!important}
    #medlife-contact-v8 h1{position:relative!important;z-index:1!important;margin:11px 0 7px!important;font-size:clamp(36px,5vw,53px)!important}
    #medlife-contact-v8 .mc8-hero p{position:relative!important;z-index:1!important;max-width:650px!important;font-size:14px!important;color:#6c7180!important}
    #medlife-contact-v8 .mc8-content{
      width:min(1120px,calc(100% - 30px))!important;
      padding:36px 0 70px!important;
    }
    #medlife-contact-v8 .mc8-title{
      margin:0 auto 26px!important;
      max-width:700px!important;
    }
    #medlife-contact-v8 .mc8-title small{
      display:inline-block!important;
      padding:5px 11px!important;
      border-radius:999px!important;
      background:#fff0f3!important;
      color:#e92850!important;
    }
    #medlife-contact-v8 .mc8-title h2{margin:9px 0 5px!important;font-size:31px!important}
    #medlife-contact-v8 .mc8-main{
      display:grid!important;
      grid-template-columns:minmax(0,1.08fr) minmax(315px,.92fr)!important;
      gap:30px!important;
      align-items:start!important;
    }
    #medlife-contact-v8 .mc8-contact-card{grid-column:1!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-map-card{grid-column:2!important;grid-row:1!important}
    #medlife-contact-v8 .mc8-card{
      border:1px solid #ebe3df!important;
      border-radius:24px!important;
      box-shadow:0 13px 36px rgba(16,24,47,.055)!important;
      padding:24px!important;
    }
    #medlife-contact-v8 .mc8-map-card{background:#fffdfc!important}
    #medlife-contact-v8 .mc8-card-head img{width:42px!important;height:42px!important;border-color:#e92850!important}
    #medlife-contact-v8 .mc8-contact-list{grid-template-columns:1fr!important}
    #medlife-contact-v8 .mc8-item{padding:15px 0!important}
    #medlife-contact-v8 .mc8-icon{background:#fff2f4!important;color:#e92850!important}
    #medlife-contact-v8 .mc8-item strong{font-size:12px!important}
    #medlife-contact-v8 .mc8-item small{font-size:10px!important;color:#727887!important}
    #medlife-contact-v8 .mc8-item a{font-size:11px!important;color:#252b37!important}
    #medlife-contact-v8 .mc8-item a:hover{color:#e92850!important}
    #medlife-contact-v8 .mc8-actions{grid-template-columns:repeat(2,1fr)!important;gap:9px!important;margin-top:22px!important}
    #medlife-contact-v8 .mc8-action{min-height:42px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-color:#ebe3df!important;background:#fff!important}
    #medlife-contact-v8 .mc8-action:hover{background:#fff8fa!important;border-color:#e92850!important;color:#e92850!important}
    #medlife-contact-v8 .mc8-forum{
      margin-top:20px!important;
      padding:20px!important;
      background:#fff0f3!important;
      border:1px solid #f2d4dc!important;
      border-radius:18px!important;
    }
    #medlife-contact-v8 .mc8-forum h4{font-size:18px!important;margin-bottom:7px!important}
    #medlife-contact-v8 .mc10-forum-details{gap:9px 20px!important}
    #medlife-contact-v8 .mc10-forum-detail{padding-top:10px!important}
    #medlife-contact-v8 .mc10-forum-detail i{color:#e92850!important}
    #medlife-contact-v8 .mc10-forum-social a{border-color:#eadfe1!important;background:#fff!important}
    #medlife-contact-v8 .mc10-forum-social a:hover{border-color:#e92850!important;color:#e92850!important}
    #medlife-contact-v8 .mc8-map{height:390px!important;border-radius:18px!important}
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:none!important}
    #medlife-contact-v8 .mc8-team-list{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
    #medlife-contact-v8 .mc8-team-list button{min-height:48px!important;font-size:10px!important}
    #medlife-contact-v8 .mc8-team-list button:before{background:#e92850!important}
    #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr 1fr!important;gap:22px!important;margin-top:30px!important}
    #medlife-contact-v8 .mc8-lower-card{border-color:#ebe3df!important;box-shadow:0 10px 28px rgba(16,24,47,.04)!important;padding:21px!important}
    #medlife-contact-v8 .mc8-quote{margin-top:35px!important;padding:23px 10px!important;color:#747b89!important}
    #medlife-contact-v8 .mc8-quote strong{color:#10182f!important}
    #medlife-contact-v8 .mc8-pin{background:#e92850!important;box-shadow:0 8px 18px rgba(16,24,47,.24)!important}
    #medlife-contact-v8 .mc8-pin img{width:18px!important;height:18px!important;background:#fff!important;padding:2px!important;display:block!important}
    @media(max-width:900px){
      #medlife-contact-v8 .mc8-wrap{padding:30px 22px 28px!important}
      #medlife-contact-v8 .mc8-main{grid-template-columns:1fr!important;gap:18px!important}
      #medlife-contact-v8 .mc8-contact-card,#medlife-contact-v8 .mc8-map-card{grid-column:1!important;grid-row:auto!important}
      #medlife-contact-v8 .mc8-map-card{order:2}.mc8-contact-card{order:1}
    }
    @media(max-width:640px){
      #medlife-contact-v8 .mc8-hero{padding:25px 12px 22px!important}
      #medlife-contact-v8 .mc8-wrap{padding:28px 17px 24px!important;border-radius:22px!important}
      #medlife-contact-v8 .mc8-logo{width:118px!important;height:118px!important}
      #medlife-contact-v8 .mc8-content{width:calc(100% - 20px)!important;padding:28px 0 52px!important}
      #medlife-contact-v8 .mc8-card{padding:18px!important;border-radius:19px!important}
      #medlife-contact-v8 .mc8-map{height:320px!important}
      #medlife-contact-v8 .mc8-team-list{grid-template-columns:1fr 1fr!important}
      #medlife-contact-v8 .mc8-actions{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr!important}
      #medlife-contact-v8 .mc10-forum-details{grid-template-columns:1fr!important}
    }
    @media(prefers-reduced-motion:reduce){#medlife-contact-v8 .mc8-logo{animation:none!important}}
  `;
  document.head.appendChild(s);
})();
