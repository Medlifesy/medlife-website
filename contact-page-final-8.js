(()=>{
'use strict';
const ID='medlife-contact-final-8';
if(document.getElementById(ID)) return;
const s=document.createElement('style');
s.id=ID;
s.textContent=`
#medlife-contact-v8 .mc7-forum-row{direction:rtl!important;display:flex!important;align-items:flex-start!important;gap:10px!important;padding:10px 0!important;border-top:1px solid #eee7e4!important}
#medlife-contact-v8 .mc7-forum-row i{flex:0 0 18px!important;color:#e92850!important;text-align:center!important;padding-top:3px!important}
#medlife-contact-v8 .mc7-forum-row>div{min-width:0!important}
#medlife-contact-v8 .mc7-forum-row strong{display:block!important;color:#10182f!important;font:900 10px Cairo,Arial,sans-serif!important}
#medlife-contact-v8 .mc7-forum-row span,#medlife-contact-v8 .mc7-forum-row a{display:block!important;margin-top:2px!important;color:#697282!important;font:500 10px/1.75 Cairo,Arial,sans-serif!important;text-decoration:none!important}
#medlife-contact-v8 .mc7-num{direction:ltr!important;unicode-bidi:isolate!important;display:inline-block!important;white-space:nowrap!important;text-align:left!important;letter-spacing:.2px!important}
#medlife-contact-v8 a[href^="tel:"]{direction:ltr!important;unicode-bidi:isolate!important;display:inline-block!important;white-space:nowrap!important;text-align:left!important;letter-spacing:.15px!important}
#medlife-contact-v8 a[href^="mailto:"]{direction:ltr!important;unicode-bidi:isolate!important;display:inline-block!important;white-space:nowrap!important;text-align:left!important}
#medlife-contact-v8 .mc10-forum-social{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;margin-top:15px!important}
#medlife-contact-v8 .mc10-forum-social a{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-height:36px!important;padding:7px 11px!important;border-radius:10px!important;background:#fff!important;border:1px solid #e6dfe1!important;color:#10182f!important;text-decoration:none!important;font:800 9px Cairo,Arial,sans-serif!important;white-space:nowrap!important;transition:border-color .2s ease,color .2s ease,background .2s ease,transform .2s ease!important}
#medlife-contact-v8 .mc10-forum-social a i{color:#e92850!important;font-size:13px!important}
#medlife-contact-v8 .mc10-forum-social a:hover{border-color:#e92850!important;color:#e92850!important;background:#fff8fa!important;transform:translateY(-1px)!important}
#medlife-contact-v8 .mc7-social-card{min-height:76px!important;padding:11px 12px!important}
#medlife-contact-v8 .mc7-social-card strong{font-size:10px!important;color:#10182f!important}
#medlife-contact-v8 .mc7-social-card small{font-size:8px!important;color:#7d8592!important;direction:ltr!important;unicode-bidi:isolate!important}
#medlife-contact-v8 .mc7-social-icon{background:#fff1f4!important;color:#e92850!important}
@media(max-width:640px){#medlife-contact-v8 .mc10-forum-social{display:grid!important;grid-template-columns:1fr!important}#medlife-contact-v8 .mc10-forum-social a{width:100%!important;box-sizing:border-box!important}}
`;
document.head.appendChild(s);
function init(){
 const page=document.getElementById('medlife-contact-v8');
 if(!page)return;
 page.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.setAttribute('dir','ltr');a.style.direction='ltr';a.style.unicodeBidi='isolate';a.style.whiteSpace='nowrap';});
 page.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.setAttribute('dir','ltr');a.style.direction='ltr';a.style.unicodeBidi='isolate';a.style.whiteSpace='nowrap';});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,700);setTimeout(init,1500);
})();