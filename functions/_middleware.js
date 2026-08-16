export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  if (url.pathname !== "/" && url.pathname !== "/index.html") return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  let html = await response.text();

  const images = [
    ["./images/image.png", "المبادرات المجتمعية", "خطوات صغيرة يصنعها المتطوعون وتكبر بأثرها في المجتمع."],
    ["./images/photo_104@25-11-2024_18-50-27_thumb.jpg", "العمل المجتمعي", "حين تجتمع الطاقات الشبابية حول هدف واحد: خدمة المجتمع."],
    ["./images/photo_10@16-11-2024_01-51-40_thumb.jpg", "فريق ميدلايف", "أشخاص مختلفون، مهارات مختلفة، ورسالة واحدة."],
    ["./images/photo_12@10-11-2024_02-15-37.jpg", "المبادرات الإنسانية", "العطاء الحقيقي يبدأ من الإنسان ويصل إلى الإنسان."],
    ["./images/photo_134@05-12-2024_15-35-35_thumb.jpg", "من أنشطة ميدلايف", "لحظات من العمل الميداني الذي يصنع الفرق."],
    ["./images/photo_135@05-12-2024_15-36-07.jpg", "التدريب والتعليم", "نتعلم معاً، ونحوّل المعرفة والمهارات إلى أثر مستمر."],
    ["./images/photo_136@05-12-2024_15-36-07_thumb.jpg", "التطوع", "كل متطوع يضيف شيئاً إلى حكاية ميدلايف."],
    ["./images/photo_13_2026-01-01_19-20-24.jpg", "ميدلايف مستمرة", "رحلة مستمرة في خدمة المجتمع وصناعة الأثر."]
  ];
  const esc = v => String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
  const cards = images.map(([src,title,text]) => `<article class="medlife-photo-card"><img src="${esc(src)}" alt="${esc(title)}" loading="lazy" decoding="async"><div class="medlife-photo-shade"></div><div class="medlife-photo-info"><strong>${esc(title)}</strong><span>${esc(text)}</span></div></article>`).join("");
  const section = `<section class="section soft medlife-photo-section" id="homepageGallery"><div class="wrap"><div class="section-title"><div class="eyebrow">صورنا</div><h2>صور من أنشطة ميدلايف</h2><p>لحظات مختارة من المبادرات الصحية والإنسانية والتدريب والعمل المجتمعي.</p></div><div class="medlife-photo-marquee"><div class="medlife-photo-track">${cards}${cards}</div></div><div class="medlife-photo-more"><a href="gallery.html">رؤية المزيد من الصور <i class="fa-solid fa-arrow-left"></i></a></div></div></section>`;

  html = html.replace(/<section[^>]*id=["']activities["'][^>]*>[\s\S]*?<\/section>/gi, "");
  html = html.replace(/<section[^>]*id=["']homepageGallery["'][^>]*>[\s\S]*?<\/section>/gi, "");
  const contact = /<section\b[^>]*\bclass=["'][^"']*\bcontact\b[^"']*["'][^>]*>/i;
  if (contact.test(html)) html = html.replace(contact, section + "\n" + "$&");
  else html = html.replace(/<\/main>/i, section + "\n</main>");
  html = html.replace(/(<a[^>]+href=["']#activities["'][^>]*>)[\s\S]*?(<\/a>)/gi, "$1صورنا$2");

  const style = `<style id="medlife-home-gallery-style">.medlife-photo-section{background:linear-gradient(180deg,#fff,#f6f8fc);overflow:hidden}.medlife-photo-marquee{overflow:hidden;width:100%;padding:8px 0 18px;direction:ltr;mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}.medlife-photo-track{display:flex;width:max-content;gap:18px;animation:medlifeGalleryMove 38s linear infinite}.medlife-photo-marquee:hover .medlife-photo-track{animation-play-state:paused}.medlife-photo-card{position:relative;flex:0 0 285px;height:330px;overflow:hidden;border-radius:24px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 15px 45px rgba(21,29,54,.1);transition:.35s;cursor:pointer}.medlife-photo-card:hover{transform:translateY(-8px);box-shadow:0 25px 65px rgba(21,29,54,.18)}.medlife-photo-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}.medlife-photo-card:hover img{transform:scale(1.08)}.medlife-photo-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 38%,rgba(8,12,25,.9))}.medlife-photo-info{position:absolute;right:0;left:0;bottom:0;padding:20px 17px;color:#fff;text-align:right}.medlife-photo-info strong{display:block;font-size:16px}.medlife-photo-info span{display:block;color:#e2e8f0;font-size:11px;margin-top:4px}.medlife-photo-more{text-align:center;margin-top:12px}.medlife-photo-more a{display:inline-flex;align-items:center;gap:9px;background:#ff2a54;color:#fff;padding:13px 22px;border-radius:14px;font-weight:900;box-shadow:0 12px 30px rgba(255,42,84,.22);transition:.25s}.medlife-photo-more a:hover{transform:translateY(-3px)}@keyframes medlifeGalleryMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(max-width:700px){.medlife-photo-card{flex-basis:245px;height:290px}.medlife-photo-track{gap:12px;animation-duration:30s}.medlife-photo-more a{width:100%;justify-content:center}}@media(prefers-reduced-motion:reduce){.medlife-photo-track{animation:none!important}}</style>`;
  if (!html.includes('id="medlife-home-gallery-style"')) html = html.replace("</head>", style + "</head>");
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return new Response(html, {status: response.status, statusText: response.statusText, headers});
}
