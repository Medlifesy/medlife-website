(() => {
  'use strict';
  const id='medlife-contact-v9-polish';
  if(document.getElementById(id)) return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
    #medlife-contact-v8 .mc8-hero{position:relative;overflow:hidden}
    #medlife-contact-v8 .mc8-hero:before{content:"";position:absolute;inset:0 0 auto 0;height:6px;background:#e92850;z-index:4}
    #medlife-contact-v8 .mc8-hero:after{content:"";position:absolute;width:240px;height:240px;border-radius:50%;background:rgba(233,40,80,.07);top:-145px;right:7%;pointer-events:none}
    #medlife-contact-v8 .mc8-logo{border-color:#e92850;box-shadow:0 12px 28px rgba(16,24,47,.10)}
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane{filter:none!important}
    #medlife-contact-v8 .mc8-map{background:#dceef7}
    @media(max-width:640px){#medlife-contact-v8 .mc8-hero:after{right:-80px;top:-110px;width:190px;height:190px}}
  `;
  document.head.appendChild(s);
})();
