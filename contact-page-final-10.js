(()=>{
'use strict';
const ID='medlife-contact-final-10';
if(document.getElementById(ID)) return;
const s=document.createElement('style');
s.id=ID;
s.textContent=`
@media(max-width:900px){
  body{overflow-x:hidden!important}
  #medlife-contact-v8{width:100%!important;overflow:hidden!important}
  #medlife-contact-v8 .mc8-hero{padding:22px 12px 18px!important}
  #medlife-contact-v8 .mc8-wrap{width:100%!important;box-sizing:border-box!important;padding:25px 18px 24px!important;border-radius:20px!important;box-shadow:0 10px 28px rgba(16,24,47,.09)!important}
  #medlife-contact-v8 .mc8-brand{margin-bottom:11px!important}
  #medlife-contact-v8 .mc8-logo{width:104px!important;height:104px!important;border-width:2px!important;box-shadow:0 8px 18px rgba(16,24,47,.12)!important}
  #medlife-contact-v8 h1{font-size:31px!important;line-height:1.25!important;margin:8px 0 6px!important}
  #medlife-contact-v8 .mc8-hero p{font-size:11px!important;line-height:1.9!important;margin:0 auto!important;max-width:100%!important}
  #medlife-contact-v8 .mc8-content{width:calc(100% - 20px)!important;box-sizing:border-box!important;padding:24px 0 46px!important}
  #medlife-contact-v8 .mc8-title{margin-bottom:16px!important;text-align:right!important}
  #medlife-contact-v8 .mc8-title h2{font-size:24px!important;line-height:1.45!important;margin:6px 0!important}
  #medlife-contact-v8 .mc8-title p{font-size:10px!important;line-height:1.9!important}
  #medlife-contact-v8 .mc8-main{display:flex!important;flex-direction:column!important;gap:14px!important;width:100%!important}
  #medlife-contact-v8 .mc8-contact-card,#medlife-contact-v8 .mc8-map-card{width:100%!important;box-sizing:border-box!important;order:initial!important}
  #medlife-contact-v8 .mc8-contact-card{order:1!important}
  #medlife-contact-v8 .mc8-map-card{order:2!important}
  #medlife-contact-v8 .mc8-card{width:100%!important;box-sizing:border-box!important;padding:17px!important;border-radius:17px!important;box-shadow:0 7px 20px rgba(16,24,47,.045)!important}
  #medlife-contact-v8 .mc8-contact-card .mc8-card-head h3{font-size:18px!important;line-height:1.5!important}
  #medlife-contact-v8 .mc10-contact-label{font-size:9px!important;padding:5px 9px!important;margin-bottom:9px!important}
  #medlife-contact-v8 .mc8-item{padding:11px 0!important}
  #medlife-contact-v8 .mc8-item strong{font-size:10px!important}
  #medlife-contact-v8 .mc8-item small,#medlife-contact-v8 .mc8-item a{font-size:10px!important;line-height:1.7!important}
  #medlife-contact-v8 .mc8-map{height:285px!important;border-radius:13px!important}
  #medlife-contact-v8 .mc8-team-list{grid-template-columns:1fr 1fr!important;gap:6px!important;margin-top:8px!important}
  #medlife-contact-v8 .mc8-team-list button{min-height:40px!important;padding:7px 6px!important;font-size:9px!important;border-radius:9px!important}
  #medlife-contact-v8 .mc7-forum-row{padding:8px 0!important;gap:8px!important}
  #medlife-contact-v8 .mc7-forum-row strong{font-size:9px!important}
  #medlife-contact-v8 .mc7-forum-row span,#medlife-contact-v8 .mc7-forum-row a{font-size:9px!important;line-height:1.7!important}
  #medlife-contact-v8 .mc7-num{font-size:10px!important}
  #medlife-contact-v8 .mc10-forum-social{display:grid!important;grid-template-columns:1fr!important;gap:6px!important;margin-top:11px!important}
  #medlife-contact-v8 .mc10-forum-social a{width:100%!important;box-sizing:border-box!important;min-height:38px!important;padding:8px 10px!important;font-size:9px!important}
  #medlife-contact-v8 .mc7-social{margin-top:20px!important;padding-top:20px!important}
  #medlife-contact-v8 .mc7-social-head{margin-bottom:13px!important}
  #medlife-contact-v8 .mc7-social-head h3{font-size:20px!important;line-height:1.5!important}
  #medlife-contact-v8 .mc7-social-head p{font-size:9px!important;line-height:1.8!important}
  #medlife-contact-v8 .mc7-social-grid{grid-template-columns:1fr 1fr!important;gap:7px!important}
  #medlife-contact-v8 .mc7-social-card{min-height:67px!important;padding:9px 7px!important;border-radius:12px!important;gap:6px!important}
  #medlife-contact-v8 .mc7-social-icon{width:34px!important;height:34px!important;border-radius:10px!important;font-size:15px!important}
  #medlife-contact-v8 .mc7-social-card strong{font-size:9px!important;line-height:1.4!important}
  #medlife-contact-v8 .mc7-social-card small{font-size:7px!important}
  #medlife-contact-v8 .mc8-lower{grid-template-columns:1fr!important;gap:12px!important;margin-top:15px!important}
  #medlife-contact-v8 .mc8-lower-card{width:100%!important;box-sizing:border-box!important;padding:16px!important;border-radius:15px!important}
  #medlife-contact-v8 .mc7-footer{margin-top:24px!important;padding:26px 13px 18px!important;border-radius:18px 18px 0 0!important}
  #medlife-contact-v8 .mc7-footer-in{width:100%!important}
  #medlife-contact-v8 .mc7-footer-top{gap:14px!important}
  #medlife-contact-v8 .mc7-footer-brand{gap:10px!important}
  #medlife-contact-v8 .mc7-footer-brand img{width:46px!important;height:46px!important}
  #medlife-contact-v8 .mc7-footer-brand strong{font-size:11px!important;line-height:1.5!important}
  #medlife-contact-v8 .mc7-footer-brand span{font-size:8px!important}
  #medlife-contact-v8 .mc7-footer-links{width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important}
  #medlife-contact-v8 .mc7-footer-links a{text-align:center!important;font-size:8px!important;padding:7px 5px!important}
  #medlife-contact-v8 .mc7-footer-copy{font-size:7px!important;margin-top:14px!important;padding-top:11px!important}
}
@media(max-width:430px){
  #medlife-contact-v8 .mc8-wrap{padding-left:14px!important;padding-right:14px!important}
  #medlife-contact-v8 .mc7-social-grid{grid-template-columns:1fr!important}
  #medlife-contact-v8 .mc8-team-list{grid-template-columns:1fr 1fr!important}
}
`;
document.head.appendChild(s);

function init(){
  const page=document.getElementById('medlife-contact-v8');
  if(!page)return;
  page.querySelectorAll('a[href^="tel:"]').forEach(a=>{
    a.setAttribute('dir','ltr');
    a.style.direction='ltr';
    a.style.unicodeBidi='isolate';
    a.style.whiteSpace='nowrap';
    a.style.display='inline-block';
  });
  page.querySelectorAll('a[href^="mailto:"]').forEach(a=>{
    a.setAttribute('dir','ltr');
    a.style.direction='ltr';
    a.style.unicodeBidi='isolate';
    a.style.whiteSpace='nowrap';
    a.style.display='inline-block';
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,500);setTimeout(init,1200);
})();
