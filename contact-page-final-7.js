(()=>{
'use strict';
const ID='medlife-contact-final-7';
if(document.getElementById(ID)) return;
const s=document.createElement('style'); s.id=ID;
s.textContent=`
#medlife-contact-v8 .mc7-hero-wrap{background:rgba(16,24,47,.88)!important;border:1px solid rgba(255,255,255,.16)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 18px 48px rgba(16,24,47,.13)!important}
#medlife-contact-v8 .mc8-wrap{background:rgba(16,24,47,.88)!important;border-color:rgba(255,255,255,.14)!important}
#medlife-contact-v8 .mc8-logo{border:2px solid rgba(255,255,255,.92)!important;box-shadow:0 8px 24px rgba(0,0,0,.16)!important}
#medlife-contact-v8 .mc8-logo img{transform:none!important;object-fit:cover!important}
#medlife-contact-v8 .mc4-social,#medlife-contact-v8 .mc5-social{display:none!important}
#medlife-contact-v8 .mc7-social{margin-top:28px;padding-top:28px;border-top:1px solid #e6e0dc}
#medlife-contact-v8 .mc7-social-head{text-align:center;margin-bottom:18px}
#medlife-contact-v8 .mc7-social-head span{display:inline-block;padding:5px 10px;border-radius:999px;background:#fff1f4;border:1px solid #f0d4dc;color:#e92850;font:900 10px Cairo,Arial,sans-serif}
#medlife-contact-v8 .mc7-social-head h3{margin:8px 0 5px;color:#10182f;font:900 24px Cairo,Arial,sans-serif}
#medlife-contact-v8 .mc7-social-head p{margin:0;color:#707888;font:500 11px/1.8 Cairo,Arial,sans-serif}
#medlife-contact-v8 .mc7-social-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
#medlife-contact-v8 .mc7-social-card{min-height:72px;padding:11px 10px;display:flex;align-items:center;gap:10px;border:1px solid #e7e1dd;border-radius:15px;background:#fff;text-decoration:none;color:#10182f;transition:.2s ease}
#medlife-contact-v8 .mc7-social-card:hover{transform:translateY(-2px);border-color:#e92850;box-shadow:0 8px 20px rgba(16,24,47,.06)}
#medlife-contact-v8 .mc7-social-icon{width:38px;height:38px;border-radius:11px;background:#fff1f4;color:#e92850;display:grid;place-items:center;flex:none;font-size:17px}
#medlife-contact-v8 .mc7-social-card strong{display:block;font:900 10px Cairo,Arial,sans-serif}
#medlife-contact-v8 .mc7-social-card small{display:block;margin-top:2px;color:#7d8592;font:500 8px/1.5 Cairo,Arial,sans-serif}
#medlife-contact-v8 .mc7-forum{direction:rtl}
#medlife-contact-v8 .mc7-forum-row{display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-top:1px solid #f0dce1}
#medlife-contact-v8 .mc7-forum-row i{width:18px;color:#e92850;padding-top:3px;text-align:center}
#medlife-contact-v8 .mc7-forum-row strong{display:block;font:900 10px Cairo,Arial,sans-serif;color:#10182f}
#medlife-contact-v8 .mc7-forum-row a,#medlife-contact-v8 .mc7-forum-row span{display:block;margin-top:2px;color:#697282;font:500 10px/1.7 Cairo,Arial,sans-serif;text-decoration:none}
#medlife-contact-v8 .mc7-num{direction:ltr!important;unicode-bidi:isolate!important;text-align:left!important;display:inline-block!important;white-space:nowrap!important}
#medlife-contact-v8 .mc7-footer{margin-top:34px;background:#10182f;color:#fff;padding:34px 18px 24px}
#medlife-contact-v8 .mc7-footer-in{width:min(1120px,calc(100% - 30px));margin:auto}
#medlife-contact-v8 .mc7-footer-top{display:flex;align-items:center;justify-content:space-between;gap:22px}
#medlife-contact-v8 .mc7-footer-brand{display:flex;align-items:center;gap:12px}
#medlife-contact-v8 .mc7-footer-brand img{width:56px;height:56px;border-radius:50%;background:#fff;object-fit:cover;border:2px solid rgba(255,255,255,.85)}
#medlife-contact-v8 .mc7-footer-brand strong{display:block;font:900 14px Cairo,Arial,sans-serif}
#medlife-contact-v8 .mc7-footer-brand span{display:block;margin-top:2px;color:#cdd3df;font:500 9px Cairo,Arial,sans-serif}
#medlife-contact-v8 .mc7-footer-links{display:flex;flex-wrap:wrap;gap:7px;justify-content:flex-end}
#medlife-contact-v8 .mc7-footer-links a{color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.16);border-radius:9px;padding:7px 9px;font:800 9px Cairo,Arial,sans-serif}
#medlife-contact-v8 .mc7-footer-links a:hover{color:#fff;background:#e92850;border-color:#e92850}
#medlife-contact-v8 .mc7-footer-copy{text-align:center;margin-top:18px;padding-top:13px;border-top:1px solid rgba(255,255,255,.11);color:#adb6c6;font:500 8px/1.7 Cairo,Arial,sans-serif}
@media(max-width:900px){#medlife-contact-v8 .mc7-social-grid{grid-template-columns:1fr 1fr}#medlife-contact-v8 .mc7-footer-top{flex-direction:column;align-items:flex-start}#medlife-contact-v8 .mc7-footer-links{justify-content:flex-start}}
@media(max-width:640px){#medlife-contact-v8 .mc7-social-grid{grid-template-columns:1fr}#medlife-contact-v8 .mc7-footer{padding:28px 14px 21px}}
`;
document.head.appendChild(s);
function addSocial(){const page=document.getElementById('medlife-contact-v8'); if(!page||page.querySelector('.mc7-social'))return; const anchor=page.querySelector('.mc8-lower')||page.querySelector('.mc8-content'); if(!anchor)return; const sec=document.createElement('section'); sec.className='mc7-social'; sec.innerHTML=`
<div class="mc7-social-head"><span>منصات ميدلايف</span><h3>تابعنا عبر قنواتنا الرسمية</h3><p>المؤسسة، الأنشطة، المنتدى والمحتوى الطبي عبر منصات ميدلايف.</p></div>
<div class="mc7-social-grid">
<a class="mc7-social-card" href="https://www.facebook.com/Medlifesy" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-facebook-f"></i></span><span><strong>Facebook</strong><small>الصفحة الرسمية</small></span></a>
<a class="mc7-social-card" href="https://www.facebook.com/medlifesyathar/" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-facebook-f"></i></span><span><strong>أثر ميدلايف</strong><small>الأنشطة والمبادرات</small></span></a>
<a class="mc7-social-card" href="https://www.instagram.com/medlifesy/" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-instagram"></i></span><span><strong>Instagram</strong><small>@medlifesy</small></span></a>
<a class="mc7-social-card" href="https://www.instagram.com/medlifesy_trends/" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-instagram"></i></span><span><strong>Instagram</strong><small>@medlifesy_trends</small></span></a>
<a class="mc7-social-card" href="https://www.instagram.com/medlifesy_athar/" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-instagram"></i></span><span><strong>Instagram</strong><small>@medlifesy_athar</small></span></a>
<a class="mc7-social-card" href="https://www.instagram.com/medlifesy_forum/" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-instagram"></i></span><span><strong>Instagram</strong><small>@medlifesy_forum</small></span></a>
<a class="mc7-social-card" href="https://t.me/medlife0" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-telegram"></i></span><span><strong>Telegram</strong><small>@medlife0</small></span></a>
<a class="mc7-social-card" href="https://t.me/medlifesy_clinical" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-telegram"></i></span><span><strong>Telegram Clinical</strong><small>@medlifesy_clinical</small></span></a>
<a class="mc7-social-card" href="https://www.youtube.com/@medlifesy" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-youtube"></i></span><span><strong>YouTube</strong><small>@medlifesy</small></span></a>
<a class="mc7-social-card" href="https://www.linkedin.com/company/med-life-syria" target="_blank" rel="noopener noreferrer"><span class="mc7-social-icon"><i class="fa-brands fa-linkedin-in"></i></span><span><strong>LinkedIn</strong><small>Med Life Syria</small></span></a>
</div>`; anchor.parentNode.insertBefore(sec,anchor.nextSibling);}
function enhanceForum(){const page=document.getElementById('medlife-contact-v8'); const forum=page&&page.querySelector('.mc8-forum'); if(!forum||forum.dataset.mc7==='1')return; forum.dataset.mc7='1'; forum.classList.add('mc7-forum'); forum.innerHTML=`<span class="mc10-forum-title">منتدى ميدلايف — طرطوس</span><div class="mc10-forum-copy">مساحة للتعلم والتدريب والأنشطة والفعاليات.</div><div class="mc7-forum-row"><i class="fa-solid fa-location-dot"></i><div><strong>العنوان</strong><span>الجمعية — خلف مستوصف السل — جنوب الفقاسة، طرطوس</span></div></div><div class="mc7-forum-row"><i class="fa-solid fa-phone"></i><div><strong>الهاتف</strong><a class="mc7-num" href="tel:+963182220555">+963 182 220 555</a></div></div><div class="mc7-forum-row"><i class="fa-solid fa-mobile-screen-button"></i><div><strong>الموبايل</strong><a class="mc7-num" href="tel:+963989913713">+963 989 913 713</a></div></div><div class="mc7-forum-row"><i class="fa-solid fa-envelope"></i><div><strong>البريد الإلكتروني</strong><a dir="ltr" href="mailto:Forum@medlifesy.org">Forum@medlifesy.org</a></div></div><div class="mc10-forum-social"><a href="/forum-v3.html"><i class="fa-solid fa-arrow-up-right-from-square"></i> زيارة المنتدى</a><a href="https://www.facebook.com/Medlifesyforum" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook"></i> Facebook المنتدى</a><a href="https://www.instagram.com/medlifesy_forum/" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-instagram"></i> Instagram المنتدى</a></div>`;}
function addFooter(){const page=document.getElementById('medlife-contact-v8'); if(!page||page.querySelector('.mc7-footer'))return; const f=document.createElement('footer'); f.className='mc7-footer'; f.innerHTML=`<div class="mc7-footer-in"><div class="mc7-footer-top"><div class="mc7-footer-brand"><img src="${BRAND}" alt="شعار مؤسسة ميدلايف"><div><strong>مؤسسة ميدلايف الطبية الخيرية التطوعية</strong><span>طرطوس — سوريا</span></div></div><div class="mc7-footer-links"><a href="/">الرئيسية</a><a href="/about-medlife.html">عن المؤسسة</a><a href="/forum-v3.html">المنتدى</a><a href="/support.html">صندوق الدعم</a><a href="/contact.html">تواصل معنا</a></div></div><div class="mc7-footer-copy">ميدلايف — الصحة، التطوع، والإنسانية.</div></div>`; page.appendChild(f);}
function init(){if(!document.getElementById('medlife-contact-v8'))return;addSocial();enhanceForum();addFooter();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,800);setTimeout(init,1800);
})();