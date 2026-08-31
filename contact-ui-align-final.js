(()=>{
'use strict';
const ID='medlife-contact-ui-align-final';
if(document.getElementById(ID))return;
const style=document.createElement('style');
style.id=ID;
style.textContent=`
/* Telegram official card: normal state only; red belongs to hover */
#medlife-contact-v8 .mc7-social-card.mc-official{
  border-color:#e7e1dd!important;
  background:#fff!important;
  color:#10182f!important;
}
#medlife-contact-v8 .mc7-social-card.mc-official .mc7-social-icon{
  background:#fff1f4!important;
  color:#e92850!important;
}
#medlife-contact-v8 .mc7-social-card.mc-official:hover{
  border-color:#e92850!important;
  background:#fff9fa!important;
}

/* Contact action buttons: equal boxes, aligned text and identical heights */
#medlife-contact-v8 .mc8-actions{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:9px!important;
  align-items:stretch!important;
  width:100%!important;
}
#medlife-contact-v8 .mc8-actions .mc8-action{
  width:100%!important;
  min-height:46px!important;
  margin:0!important;
  box-sizing:border-box!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  text-align:center!important;
  padding:10px 12px!important;
  line-height:1.55!important;
  white-space:normal!important;
  transform:none!important;
}
#medlife-contact-v8 .mc8-actions .mc8-action:hover{
  transform:translateY(-2px)!important;
}
@media(max-width:640px){
  #medlife-contact-v8 .mc8-actions{
    grid-template-columns:1fr!important;
    gap:7px!important;
  }
  #medlife-contact-v8 .mc8-actions .mc8-action{
    min-height:44px!important;
  }
}
`;
document.head.appendChild(style);
function init(){
 const page=document.getElementById('medlife-contact-v8');
 if(!page)return;
 const telegram=page.querySelector('.mc7-social-card[href="https://t.me/medlife0"]');
 if(telegram)telegram.classList.remove('mc-official');
 page.querySelectorAll('.mc8-actions .mc8-action').forEach(a=>{
   a.style.width='100%';
   a.style.minHeight='46px';
   a.style.margin='0';
   a.style.display='flex';
   a.style.alignItems='center';
   a.style.justifyContent='center';
   a.style.textAlign='center';
   a.style.boxSizing='border-box';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,500);setTimeout(init,1200);setTimeout(init,2000);
})();
