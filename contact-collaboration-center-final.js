(()=>{
'use strict';
const ID='medlife-contact-collaboration-center-final';
if(document.getElementById(ID))return;
const style=document.createElement('style');
style.id=ID;
style.textContent=`
#medlife-contact-v8 a[href^="mailto:"][href*="subject="]{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  text-align:center!important;
  width:min(100%,360px)!important;
  min-height:42px!important;
  margin-inline:auto!important;
  box-sizing:border-box!important;
  white-space:normal!important;
  line-height:1.6!important;
}
#medlife-contact-v8 a[href^="mailto:"][href*="subject="]::before{display:none!important}
@media(max-width:640px){
  #medlife-contact-v8 a[href^="mailto:"][href*="subject="]{width:100%!important;max-width:360px!important}
}
`;
document.head.appendChild(style);
function init(){
 const page=document.getElementById('medlife-contact-v8');
 if(!page)return;
 page.querySelectorAll('a[href^="mailto:"][href*="subject="]').forEach(a=>{
   if(!String(a.textContent||'').includes('التعاون والشراكات'))return;
   a.style.display='flex';
   a.style.alignItems='center';
   a.style.justifyContent='center';
   a.style.textAlign='center';
   a.style.marginInline='auto';
   a.style.width='min(100%,360px)';
   a.style.minHeight='42px';
   a.style.boxSizing='border-box';
   const parent=a.parentElement;
   if(parent){
     const display=getComputedStyle(parent).display;
     if(display==='grid'){
       a.style.gridColumn='1 / -1';
       a.style.justifySelf='center';
     }
     if(display==='flex')a.style.alignSelf='center';
   }
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,700);setTimeout(init,1500);
})();