(()=>{
'use strict';
const ID='medlife-contact-social-roles-final';
if(document.getElementById(ID)) return;
const style=document.createElement('style');
style.id=ID;
style.textContent=`
#medlife-contact-v8 .mc7-social-card small{
  direction:rtl!important;
  unicode-bidi:plaintext!important;
  text-align:center!important;
  line-height:1.75!important;
  display:block!important;
}
#medlife-contact-v8 .mc7-social-card.mc-official{
  border-color:#e92850!important;
  background:#fff9fa!important;
}
#medlife-contact-v8 .mc7-social-card.mc-official .mc7-social-icon{
  background:#e92850!important;
  color:#fff!important;
}
#medlife-contact-v8 .mc7-social-card strong{
  color:#10182f!important;
}
`;
document.head.appendChild(style);
function init(){
 const page=document.getElementById('medlife-contact-v8');
 if(!page)return;
 page.querySelectorAll('.mc7-social-card').forEach(card=>{
   const href=card.getAttribute('href')||'';
   const small=card.querySelector('small');
   const strong=card.querySelector('strong');
   if(!small)return;
   if(href==='https://www.instagram.com/medlifesy/'){
     small.textContent='المحتوى الطبي';
   } else if(href==='https://www.instagram.com/medlifesy_trends/'){
     small.textContent='الريلز والأنشطة ضمن الجامعات';
   } else if(href==='https://www.instagram.com/medlifesy_athar/'){
     small.textContent='الأنشطة الميدانية والمبادرات';
   } else if(href==='https://www.instagram.com/medlifesy_forum/'){
     small.textContent='منتدى ميدلايف';
   } else if(href==='https://t.me/medlife0'){
     small.textContent='القناة الرسمية لميدلايف على Telegram';
     card.classList.add('mc-official');
   } else if(href==='https://t.me/medlifesy_clinical'){
     small.textContent='المحتوى السريري والطبي';
   } else if(href==='https://www.facebook.com/Medlifesy'){
     small.textContent='الصفحة الرسمية لمؤسسة ميدلايف';
   } else if(href==='https://www.facebook.com/medlifesyathar/'){
     small.textContent='أثر ميدلايف — الأنشطة والمبادرات';
   } else if(href==='https://www.youtube.com/@medlifesy'){
     small.textContent='الفيديو والمحتوى المرئي';
   } else if(href==='https://www.linkedin.com/company/med-life-syria'){
     small.textContent='الحضور المهني والمؤسسي';
   }
   if(strong && href==='https://t.me/medlife0') strong.textContent='Telegram — القناة الرسمية';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,700);setTimeout(init,1500);
})();