/* MedLife — global public-site fixes */
(function(){'use strict';
const routes={contact:'/contact.html',gallery:'/initiatives-gallery.html',facebook:'https://www.facebook.com/medlifesy',facebookAthar:'https://www.facebook.com/medlifesyathar',instagram:'https://www.instagram.com/medlifesy',instagramAthar:'https://www.instagram.com/medlifesy_athar',trends:'https://www.instagram.com/medlifesy_trends',telegram:'https://t.me/Medlife2024bot'};
function fix(){
 document.querySelectorAll('a[href="#contact"],a[href="index.html#contact"],a[href="/#contact"]').forEach(a=>a.setAttribute('href',routes.contact));
 document.querySelectorAll('.counter[data-target="6"]').forEach(e=>e.setAttribute('data-target','7'));
 document.querySelectorAll('a[href="#"]').forEach(a=>{const text=(a.textContent||'').trim().toLowerCase(),icon=a.querySelector('i'),cls=icon?icon.className:'';let href=null;if(cls.includes('facebook'))href=text.includes('أثر')||text.includes('athar')?routes.facebookAthar:routes.facebook;else if(cls.includes('instagram'))href=text.includes('تريند')||text.includes('trend')?routes.trends:(text.includes('أثر')||text.includes('athar')?routes.instagramAthar:routes.instagram);else if(cls.includes('telegram'))href=routes.telegram;if(href){a.setAttribute('href',href);a.setAttribute('target','_blank');a.setAttribute('rel','noopener noreferrer')}});
 document.querySelectorAll('a[href="https://medlifesy.org"]').forEach(a=>{a.setAttribute('href','https://medlifesy.org/');a.setAttribute('target','_self')});
 document.querySelectorAll('a[href="tel:+963998942124"],a[href="tel:0998942124"],a[href="tel:+963182222568"],a[href="tel:0182222568"]').forEach(a=>{a.setAttribute('dir','ltr');a.style.direction='ltr';a.style.unicodeBidi='plaintext'});
 document.querySelectorAll('a').forEach(a=>{const t=(a.textContent||'').trim();if(/مبادراتنا|أنشطتنا/.test(t)&&!a.href.includes('initiatives-gallery.html'))a.href=routes.gallery});
}
function installClickGuard(){document.addEventListener('click',function(e){const a=e.target.closest&&e.target.closest('a');if(!a)return;const t=(a.textContent||'').trim();const h=a.getAttribute('href')||'';if(/تواصل معنا/.test(t)||h==='#contact'||h==='index.html#contact'||h==='/#contact'){e.preventDefault();e.stopImmediatePropagation();window.location.assign(routes.contact)}},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){fix();installClickGuard()});else{fix();installClickGuard()}
})();