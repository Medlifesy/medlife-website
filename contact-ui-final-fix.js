(()=>{
'use strict';
const ID='medlife-contact-ui-final-fix';
if(document.getElementById(ID))return;
const style=document.createElement('style');style.id=ID;style.textContent=`
/* Prevent the legacy page from flashing before the rebuild is ready. */
body.contact-upgrade-pending>#medlife-contact-v8{visibility:hidden!important}

/* Telegram official card: normal state, red only on hover. */
#medlife-contact-v8 .mc7-social-card.mc-official{border-color:#e6dfdb!important;background:#fff!important}
#medlife-contact-v8 .mc7-social-card.mc-official .mc7-social-icon{background:#fff2f5!important;color:#e92850!important}
#medlife-contact-v8 .mc7-social-card.mc-official:hover{border-color:#e92850!important;background:#fff9fa!important}
#medlife-contact-v8 .mc7-social-card.mc-official:hover .mc7-social-icon{background:#e92850!important;color:#fff!important}

/* Action group: four equal, centered controls. */
#medlife-contact-v8 .mc8-actions{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important;align-items:stretch!important;width:100%!important}
#medlife-contact-v8 .mc8-actions .mc8-action{width:100%!important;min-width:0!important;min-height:46px!important;margin:0!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;white-space:normal!important;line-height:1.5!important}
#medlife-contact-v8 a[href^="mailto:"][href*="subject="]{grid-column:auto!important;width:100%!important;max-width:none!important;margin:0!important}
@media(max-width:900px){#medlife-contact-v8 .mc8-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:520px){#medlife-contact-v8 .mc8-actions{grid-template-columns:1fr!important}}
`;
document.head.appendChild(style);
function reveal(){document.body.classList.remove('contact-upgrade-pending');}
function init(){
 const page=document.getElementById('medlife-contact-v8');
 if(!page)return;
 page.querySelectorAll('.mc8-actions .mc8-action').forEach(a=>{a.style.display='flex';a.style.alignItems='center';a.style.justifyContent='center';a.style.textAlign='center';a.style.margin='0';a.style.width='100%';});
 reveal();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,50);setTimeout(init,300);setTimeout(init,800);
})();