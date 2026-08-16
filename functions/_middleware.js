export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  if (url.pathname !== "/" && url.pathname !== "/index.html") return response;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  html = html.replace(/<li><a href="#activities">[\s\S]*?<\/a><\/li>/i,'<li><a href="#homepageGallery">صورنا</a></li>');
  html = html.replace(/<a href="#activities">[\s\S]*?<\/a>/i,'<a href="#homepageGallery">صورنا</a>');
  html = html.replace(/<section[^>]+id=["']activities["'][\s\S]*?<\/section>/gi, "");
  html = html.replace(/<section[^>]+id=["']homepageGallery["'][\s\S]*?<\/section>/gi, "");

  const OWNER="Medlifesy", REPO="medlife-website", BRANCH="main";
  const allowed=/\.(jpe?g|png|webp|gif|avif)$/i;
  const category=(name="")=>{const n=name.toLowerCase();if(/training|course|lecture|workshop|education|تدريب|دورة|كورس|محاضرة|تعليم/.test(n))return"التدريب والتعليم";if(/health|medical|screen|screening|doctor|clinic|medicine|طب|صحة|طبي|عيادة|فحص|سكر|ضغط/.test(n))return"الحملات الصحية";if(/ramadan|eid|child|children|hospital|gift|food|aid|human|رمضان|عيد|طفل|أطفال|مشفى|هدايا|سلة|إنساني/.test(n))return"الأنشطة الإنسانية";return"المبادرات المجتمعية"};
  const text={"التدريب والتعليم":"نتعلم معاً، ونحوّل المعرفة والمهارات إلى أثر مستمر.","الحملات الصحية":"مبادرات تضع الصحة والوعي الطبي في قلب العمل المجتمعي.","الأنشطة الإنسانية":"لأن العطاء الحقيقي يبدأ من الإنسان ويصل إلى الإنسان.","المبادرات المجتمعية":"خطوات صغيرة يصنعها المتطوعون وتكبر بأثرها في المجتمع."};

  let cards="";
  try{
    const gh=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/images?ref=${BRANCH}`,{headers:{"Accept":"application/vnd.github+json","User-Agent":"MedLife-Website","X-GitHub-Api-Version":"2022-11-28"}});
    if(gh.ok){
      const files=await gh.json();
      const images=Array.isArray(files)?files.filter(f=>f&&f.type==="file"&&allowed.test(f.name)&&!/^logo\./i.test(f.name)):[];
      images.sort((a,b)=>String(a.name).localeCompare(String(b.name),undefined,{numeric:true,sensitivity:"base"}));
      const featured=images.slice(0,8);
      cards=featured.map(image=>{const c=category(image.name);const src=image.download_url||`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${image.path.split('/').map(encodeURIComponent).join('/')}`;const safe=String(src).replace(/&/g,'&amp;').replace(/"/g,'&quot;');const title=c.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');const desc=text[c].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');return `<article class="photo-card"><img src="${safe}" alt="${title}" loading="lazy" decoding="async"><div class="photo-shade"></div><div class="photo-info"><strong>${title}</strong><span>${desc}</span></div></article>`}).join("");
    }
  }catch(_){ }
  if(!cards)cards='<div class="gallery-empty">تعذر تحميل الصور حالياً.</div>';else cards+=cards;

  const gallerySection=`<section class="section soft reveal medlife-photo-section" id="homepageGallery"><div class="wrap"><div class="section-title"><div class="eyebrow">صورنا</div><h2>من أنشطة ميدلايف</h2><p>لقطات مختارة من الحملات الصحية، المبادرات الإنسانية، التدريب والعمل المجتمعي.</p></div><div class="photo-marquee" aria-label="صور من أنشطة ميدلايف"><div class="photo-track">${cards}</div></div><div class="gallery-more-wrap"><a class="gallery-more-btn" href="gallery.html"><span>رؤية المزيد من الصور</span><i class="fa-solid fa-arrow-left"></i></a></div></div></section>`;
  html=html.replace(/<section class="section contact"[^>]*>/i,`${gallerySection}\n$&`);

  const style=`<style id="medlife-home-gallery-style">.medlife-photo-section{background:linear-gradient(180deg,#fff,#f6f8fc)}.medlife-photo-section .photo-marquee{overflow:hidden;position:relative;padding:8px 0 20px;mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}.medlife-photo-section .photo-track{display:flex;gap:18px;width:max-content;direction:ltr;animation:medlifePhotoMove 42s linear infinite}.medlife-photo-section .photo-marquee:hover .photo-track{animation-play-state:paused}.medlife-photo-section .photo-card{position:relative;flex:0 0 290px;height:330px;border-radius:24px;overflow:hidden;background:#fff;border:1px solid #e2e8f0;box-shadow:0 15px 45px rgba(21,29,54,.1);cursor:pointer;transition:transform .35s,box-shadow .35s}.medlife-photo-section .photo-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:0 25px 65px rgba(21,29,54,.18)}.medlife-photo-section .photo-card>img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}.medlife-photo-section .photo-card:hover>img{transform:scale(1.07)}.medlife-photo-section .photo-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(8,12,25,.9))}.medlife-photo-section .photo-info{position:absolute;right:0;left:0;bottom:0;padding:20px 17px;color:#fff;text-align:right}.medlife-photo-section .photo-info strong{display:block;font-size:16px}.medlife-photo-section .photo-info span{display:block;margin-top:4px;color:#e2e8f0;font-size:11px}.gallery-empty{padding:40px;color:#64748b;background:#fff;border-radius:20px}.gallery-more-wrap{text-align:center;margin-top:10px}.gallery-more-btn{display:inline-flex;align-items:center;gap:10px;padding:13px 22px;border-radius:14px;background:#ff2a54;color:#fff;font-weight:900;box-shadow:0 12px 30px rgba(255,42,84,.22);transition:.25s}.gallery-more-btn:hover{transform:translateY(-3px)}@keyframes medlifePhotoMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(max-width:700px){.medlife-photo-section .photo-card{flex-basis:250px;height:290px}.medlife-photo-section .photo-track{gap:12px;animation-duration:32s}.gallery-more-btn{width:100%;justify-content:center}}@media(prefers-reduced-motion:reduce){.medlife-photo-section .photo-track{animation:none!important}}</style>`;
  if(!html.includes('id="medlife-home-gallery-style"'))html=html.replace("</head>",`${style}</head>`);
  const headers=new Headers(response.headers);headers.set("cache-control","no-cache, no-store, must-revalidate");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
