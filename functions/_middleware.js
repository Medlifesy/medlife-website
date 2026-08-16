export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  let html = await response.text();

  // MedLife site navigation/gallery/support integration — deployment marker 2026-08-16.
  if (url.pathname === "/support.html") {
    const requestBox = `<div style="max-width:1120px;margin:18px auto 0;padding:0 14px"><div style="display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 22px;border-radius:20px;background:linear-gradient(135deg,#151d36,#293351);color:#fff;box-shadow:0 15px 45px rgba(21,29,54,.12)"><div><strong style="font-size:18px">هل تحتاج إلى دعم؟</strong><div style="color:#cbd5e1;font-size:12px;margin-top:3px">قدّم طلبك إلى فريق ميدلايف ليتم مراجعته والتحقق من الوثائق قبل نشر أي حالة.</div></div><a href="support-request.html" style="flex:none;background:#ff2a54;color:#fff;text-decoration:none;padding:11px 17px;border-radius:12px;font-weight:900">تقديم طلب دعم</a></div></div>`;
    if (!html.includes('href="support-request.html"')) html = html.replace(/<section\b/i, requestBox + "<section");
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }

  if (url.pathname !== "/" && url.pathname !== "/index.html") return response;

  const images = [
    ["./images/image.png", "المبادرات المجتمعية", "لحظة من العمل التطوعي الذي يجمع الفريق حول خدمة المجتمع."],
    ["./images/photo_104@25-11-2024_18-50-27_thumb.jpg", "الأنشطة الإنسانية", "مشهد من مبادرات ميدلايف التي تضع الإنسان واحتياجاته في المقدمة."],
    ["./images/photo_10@16-11-2024_01-51-40_thumb.jpg", "فريق ميدلايف", "روح الفريق والتعاون التي تجعل كل مبادرة أكثر أثراً."],
    ["./images/photo_12@10-11-2024_02-15-37.jpg", "المبادرات الصحية", "من العمل الصحي والتوعوي الذي يقرّب المعرفة والخدمة من المجتمع."],
    ["./images/photo_134@05-12-2024_15-35-35_thumb.jpg", "العمل الميداني", "لحظات من الحضور الميداني والعمل التطوعي في المجتمع."],
    ["./images/photo_135@05-12-2024_15-36-07.jpg", "التدريب والتعليم", "نتعلم معاً ونحوّل المعرفة والمهارات إلى أثر مستمر."],
    ["./images/photo_136@05-12-2024_15-36-07_thumb.jpg", "التطوع", "كل متطوع يضيف خبرة ووقتاً وطاقة إلى مسيرة ميدلايف."],
    ["./images/photo_13_2026-01-01_19-20-24.jpg", "فعاليات ميدلايف", "لحظات تجمع الفريق والمتطوعين حول رسالة واحدة: صناعة الأثر."]
  ];
  const esc = v => String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
  const cards = images.map(([src,title,text]) => `<article class="medlife-photo-card"><img src="${esc(src)}" alt="${esc(title)}" loading="lazy" decoding="async"><div class="medlife-photo-shade"></div><div class="medlife-photo-info"><strong>${esc(title)}</strong><span>${esc(text)}</span></div></article>`).join("");
  const section = `<section class="section soft medlife-photo-section" id="homepageGallery"><div class="wrap"><div class="section-title"><div class="eyebrow">صورنا</div><h2>صور من أنشطة ميدلايف</h2><p>لمحات من العمل الصحي والإنساني والتطوعي والتدريب والفعاليات المجتمعية.</p></div><div class="medlife-photo-marquee"><div class="medlife-photo-track">${cards}${cards}</div></div><div class="medlife-photo-more"><a href="gallery.html">رؤية المزيد من الصور <span aria-hidden="true">←</span></a></div></div></section>`;

  html = html.replace(/<section[^>]*id=["']activities["'][^>]*>[\s\S]*?<\/section>/gi, "");
  html = html.replace(/<section[^>]*id=["']homepageGallery["'][^>]*>[\s\S]*?<\/section>/gi, "");
  const contact = /<section\b[^>]*\bclass=["'][^"']*\bcontact\b[^"']*["'][^>]*>/i;
  if (contact.test(html)) html = html.replace(contact, section + "\n" + "$&");
  else html = html.replace(/<\/main>/i, section + "\n</main>");
  html = html.replace(/href=["']#activities["']/gi, 'href="#homepageGallery"');

  const cleanNav = `<nav class="medlife-clean-nav" aria-label="التنقل الرئيسي"><a href="index.html">الرئيسية</a><a href="about-medlife.html">عن المؤسسة</a><a href="#programs">مجالات العمل</a><a href="#homepageGallery">صورنا</a><a href="articles.html">المقالات</a><a href="forum.html">المنتدى</a><a href="support.html">صندوق الدعم</a><a href="#contact">تواصل معنا</a></nav>`;
  html = html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/i, cleanNav);

  const mobileStart = html.match(/<div\b[^>]*class=["'][^"']*\bmobile\b[^"']*["'][^>]*>/i);
  if (mobileStart) {
    const start = mobileStart.index;
    const after = start + mobileStart[0].length;
    const nextMain = html.indexOf("<main", after);
    if (nextMain > after) {
      const cleanMobile = `<div class="mobile" id="mobile"><div class="wrap"><a href="index.html">الرئيسية</a><a href="about-medlife.html">عن المؤسسة</a><a href="#programs">مجالات العمل</a><a href="#homepageGallery">صورنا</a><a href="articles.html">المقالات</a><a href="forum.html">المنتدى</a><a href="support.html">صندوق الدعم</a><a href="#contact">تواصل معنا</a><a href="login.html">دخول الأعضاء</a><a href="join-options.html">الانضمام إلى المؤسسة</a></div></div>`;
      html = html.slice(0, start) + cleanMobile + html.slice(nextMain);
    }
  }

  if (!html.includes('id="supportFundHome"')) {
    const supportCard = `<section class="section reveal" id="supportFundHome"><div class="wrap"><div class="support-home-card"><div><div class="eyebrow">صندوق الدعم</div><h2>ساهم في تأمين احتياج حقيقي</h2><p>تعرّف على الحالات والمشاريع التي تحتاج إلى دعم، واطّلع على المبلغ المطلوب وما تم تأمينه والوثائق المتاحة لكل حالة.</p></div><a class="support-home-btn" href="support.html">استكشف صندوق الدعم</a></div></div></section>`;
    if (contact.test(html)) html = html.replace(contact, supportCard + "\n" + "$&");
    else html = html.replace(/<\/main>/i, supportCard + "\n</main>");
  }

  const style = `<style id="medlife-home-gallery-style">.medlife-clean-nav{display:flex;align-items:center;justify-content:center;gap:26px;flex-wrap:wrap}.medlife-clean-nav a{display:inline-flex;align-items:center;padding:8px 0;color:#151d36!important;font-size:13px;font-weight:800;text-decoration:none;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}.medlife-clean-nav a:hover{color:#ff2a54!important;border-bottom-color:#ff2a54}.medlife-clean-nav a[href="support.html"]{color:#ff2a54!important}.medlife-photo-section{background:linear-gradient(180deg,#fff,#f6f8fc);overflow:hidden}.medlife-photo-marquee{overflow:hidden;width:100%;padding:8px 0 18px;direction:ltr;mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}.medlife-photo-track{display:flex;width:max-content;gap:18px;animation:medlifeGalleryMove 38s linear infinite}.medlife-photo-marquee:hover .medlife-photo-track{animation-play-state:paused}.medlife-photo-card{position:relative;flex:0 0 285px;height:330px;overflow:hidden;border-radius:24px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 15px 45px rgba(21,29,54,.1);transition:.35s;cursor:pointer}.medlife-photo-card:hover{transform:translateY(-8px);box-shadow:0 25px 65px rgba(21,29,54,.18)}.medlife-photo-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}.medlife-photo-card:hover img{transform:scale(1.08)}.medlife-photo-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 38%,rgba(8,12,25,.9))}.medlife-photo-info{position:absolute;right:0;left:0;bottom:0;padding:20px 17px;color:#fff;text-align:right}.medlife-photo-info strong{display:block;font-size:16px}.medlife-photo-info span{display:block;color:#e2e8f0;font-size:11px;margin-top:4px}.medlife-photo-more{text-align:center;margin-top:12px}.medlife-photo-more a{display:inline-flex;align-items:center;gap:9px;background:#ff2a54;color:#fff;padding:13px 22px;border-radius:14px;font-weight:900;box-shadow:0 12px 30px rgba(255,42,84,.22);transition:.25s}.medlife-photo-more a:hover{transform:translateY(-3px)}.support-home-card{display:flex;align-items:center;justify-content:space-between;gap:28px;padding:35px;border-radius:28px;background:linear-gradient(135deg,#151d36,#293351);color:#fff;box-shadow:0 25px 70px rgba(21,29,54,.16);position:relative;overflow:hidden}.support-home-card h2{font-size:clamp(26px,4vw,40px);line-height:1.3}.support-home-card p{color:#cbd5e1;max-width:700px;margin-top:8px}.support-home-card .eyebrow{position:relative}.support-home-btn{flex:none;display:inline-flex;align-items:center;gap:9px;background:#ff2a54;color:#fff;padding:14px 20px;border-radius:14px;font-weight:900;box-shadow:0 12px 30px rgba(255,42,84,.25);transition:.25s}.support-home-btn:hover{transform:translateY(-3px)}@keyframes medlifeGalleryMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(max-width:1100px){.medlife-clean-nav{display:none}}@media(max-width:700px){.medlife-photo-card{flex-basis:245px;height:290px}.medlife-photo-track{gap:12px;animation-duration:30s}.medlife-photo-more a{width:100%;justify-content:center}.support-home-card{flex-direction:column;align-items:stretch;text-align:center;padding:28px 20px}.support-home-btn{justify-content:center}}@media(prefers-reduced-motion:reduce){.medlife-photo-track{animation:none!important}}</style>`;
  if (!html.includes('id="medlife-home-gallery-style"')) html = html.replace("</head>", style + "</head>");

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  headers.set("X-MedLife-Deployment", "2026-08-16-support-gallery-nav-v2");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}
