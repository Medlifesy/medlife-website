(()=>{
'use strict';
const ID='medlife-contact-nav-direct-final';
if(document.getElementById(ID))return;
const style=document.createElement('style');style.id=ID;style.textContent=`
.medlife-contact-direct-nav{position:sticky;top:0;z-index:2600;background:rgba(255,255,255,.98);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid #e6e9ee;box-shadow:0 5px 18px rgba(16,24,47,.06);font-family:Cairo,Arial,sans-serif}
.medlife-contact-direct-nav .inner{width:min(1320px,calc(100% - 24px));min-height:64px;margin:auto;display:flex;align-items:center;gap:14px}
.medlife-contact-direct-nav .brand{display:flex;align-items:center;flex:0 0 auto;text-decoration:none}.medlife-contact-direct-nav .brand img{width:auto;height:42px;display:block;object-fit:contain}
.medlife-contact-direct-nav nav{flex:1;display:flex;justify-content:center;align-items:stretch;min-height:64px;gap:1px;overflow:hidden}
.medlife-contact-direct-nav nav a{position:relative;display:flex;align-items:center;justify-content:center;padding:0 9px;color:#10182f;text-decoration:none;white-space:nowrap;font-weight:800;font-size:11px}
.medlife-contact-direct-nav nav a::after{content:"";position:absolute;left:10px;right:10px;bottom:7px;height:2px;border-radius:999px;background:#e92850;transform:scaleX(0);transition:transform .2s ease}
.medlife-contact-direct-nav nav a:hover{color:#e92850;background:#fff7f9;border-radius:8px}.medlife-contact-direct-nav nav a.active{color:#e92850}.medlife-contact-direct-nav nav a.active::after{transform:scaleX(1)}
.medlife-contact-direct-nav .actions{display:flex;gap:6px;flex:0 0 auto}.medlife-contact-direct-nav .actions a{padding:7px 10px;border:1px solid #dde2e9;border-radius:9px;color:#10182f;background:#fff;text-decoration:none;font-weight:800;font-size:10px}.medlife-contact-direct-nav .actions .join{background:#e92850;border-color:#e92850;color:#fff}
.medlife-contact-direct-nav .menu{display:none;border:1px solid #dde2e9;background:#fff;border-radius:9px;color:#10182f;padding:8px 11px;font-family:inherit;font-weight:800;font-size:11px}
.medlife-contact-direct-nav .mobile{display:none;border-top:1px solid #e6e9ee;background:#fff}.medlife-contact-direct-nav .mobile.open{display:block}.medlife-contact-direct-nav .mobile a{display:block;padding:11px 16px;border-bottom:1px solid #eef1f5;color:#10182f;text-decoration:none;font-weight:800;font-size:12px}.medlife-contact-direct-nav .mobile a.active{color:#e92850;background:#fff7f9;border-inline-start:3px solid #e92850}.medlife-contact-direct-nav .mobile a.join{margin:10px 14px;border:0;border-radius:10px;background:#e92850;color:#fff;text-align:center}
@media(max-width:1050px){.medlife-contact-direct-nav nav a{padding-inline:6px;font-size:10px}.medlife-contact-direct-nav .actions a{padding-inline:8px;font-size:9px}}
@media(max-width:820px){.medlife-contact-direct-nav .inner{min-height:60px}.medlife-contact-direct-nav nav,.medlife-contact-direct-nav .actions{display:none}.medlife-contact-direct-nav .brand img{height:40px}.medlife-contact-direct-nav .menu{display:block;margin-inline-start:auto}}
`;
document.head.appendChild(style);
function build(){
 if(document.querySelector('.medlife-contact-direct-nav'))return;
 document.querySelectorAll('.medlife-global-header').forEach(x=>x.remove());
 const header=document.createElement('header');header.className='medlife-contact-direct-nav';header.innerHTML=`<div class="inner"><a class="brand" href="/index.html" aria-label="مؤسسة ميدلايف"><img src="/logo.PNG?v=20260831-contact-nav-direct" alt="مؤسسة ميدلايف"></a><nav aria-label="التنقل الرئيسي"><a href="/index.html">الرئيسية</a><a href="/about-medlife.html">عن المؤسسة</a><a href="/index.html#programs">مجالات العمل</a><a href="/articles.html">المقالات</a><a href="/forum-v3.html">المنتدى</a><a href="/gallery.html">الصور</a><a href="/support.html">صندوق الدعم</a><a href="/contact.html" class="active">تواصل معنا</a></nav><div class="actions"><a href="/login.html">دخول الأعضاء</a><a href="/join-options.html" class="join">الانضمام</a></div><button class="menu" type="button" aria-expanded="false">القائمة</button></div><div class="mobile"><a href="/index.html">الرئيسية</a><a href="/about-medlife.html">عن المؤسسة</a><a href="/index.html#programs">مجالات العمل</a><a href="/articles.html">المقالات</a><a href="/forum-v3.html">المنتدى</a><a href="/gallery.html">الصور</a><a href="/support.html">صندوق الدعم</a><a href="/contact.html" class="active">تواصل معنا</a><a href="/login.html">دخول الأعضاء</a><a href="/join-options.html" class="join">الانضمام إلى ميدلايف</a></div>`;
 document.body.prepend(header);
 const btn=header.querySelector('.menu'),mobile=header.querySelector('.mobile');btn.addEventListener('click',()=>{const open=mobile.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();setTimeout(build,500);
})();
