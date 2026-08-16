export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);

  // Only enhance the homepage. Every other page remains untouched.
  if (url.pathname !== "/" && url.pathname !== "/index.html") return response;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();

  // Remove the old fixed nine-image gallery.
  html = html.replace(
    /<section class="section soft reveal" id="activities">[\s\S]*?<\/section>/i,
    ""
  );

  // Add the dynamic full gallery before Contact.
  if (!html.includes('id="homepageGallery"')) {
    const gallerySection = `
<section class="section soft reveal" id="homepageGallery">
  <div class="wrap">
    <div class="section-title">
      <div class="eyebrow">صورنا</div>
      <h2>من أنشطة ومبادرات ميدلايف</h2>
      <p>لقطات من العمل الميداني، المبادرات الصحية والإنسانية، التدريب، التطوع والفعاليات التي شارك فيها فريق ميدلايف.</p>
      <div class="gallery-count" data-gallery-count>جاري تحميل الصور...</div>
    </div>
    <div class="photo-marquee" aria-label="صور أنشطة ومبادرات ميدلايف">
      <div class="photo-track" id="photoTrack"></div>
    </div>
    <p class="gallery-hint">اضغط على أي صورة لمشاهدتها بحجم أكبر</p>
  </div>
</section>`;

    html = html.replace(
      /<section class="section contact"[^>]*>/i,
      `${gallerySection}\n$&`
    );
  }

  // Desktop navigation.
  html = html.replace(
    '<li><a href="#activities">أنشطة ميدلايف</a></li>',
    '<li><a href="#homepageGallery"><i class="fa-solid fa-images"></i> صورنا</a></li>'
  );

  // Mobile navigation.
  html = html.replace(
    '<a href="#activities">أنشطة ميدلايف</a>',
    '<a href="#homepageGallery"><i class="fa-solid fa-images"></i> صورنا</a>'
  );

  // Load the existing controller that reads every image from /api/gallery.
  if (!html.includes('src="./js/gallery.js"') && !html.includes('src="/js/gallery.js"')) {
    html = html.replace('</body>', '<script src="/js/gallery.js"></script></body>');
  }

  // Visual styling for the continuous photo strip.
  if (!html.includes('id="medlife-dynamic-gallery-style"')) {
    const style = `<style id="medlife-dynamic-gallery-style">
      #homepageGallery{background:linear-gradient(180deg,#fff,#f6f8fc)}
      #homepageGallery .gallery-count{display:inline-flex;margin-top:13px;padding:7px 13px;border-radius:999px;background:#fff0f3;color:#ff2a54;font-size:12px;font-weight:800}
      #homepageGallery .photo-marquee{position:relative;overflow:hidden;border-radius:30px;padding:8px 0 18px;mask-image:linear-gradient(to right,transparent,#000 5%,#000 95%,transparent);-webkit-mask-image:linear-gradient(to right,transparent,#000 5%,#000 95%,transparent)}
      #homepageGallery .photo-track{display:flex;width:max-content;gap:18px;animation:medlifeHomepageGalleryMove 70s linear infinite;direction:ltr}
      #homepageGallery .photo-marquee:hover .photo-track{animation-play-state:paused}
      #homepageGallery .photo-card{position:relative;flex:0 0 290px;height:330px;border-radius:24px;overflow:hidden;background:#fff;border:1px solid #e2e8f0;box-shadow:0 15px 45px rgba(21,29,54,.1);cursor:zoom-in;transition:transform .35s,box-shadow .35s}
      #homepageGallery .photo-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:0 25px 65px rgba(21,29,54,.18)}
      #homepageGallery .photo-image-wrap,#homepageGallery .photo-image-wrap img{width:100%;height:100%}
      #homepageGallery .photo-image-wrap{position:relative}
      #homepageGallery .photo-image-wrap img{object-fit:cover;display:block}
      #homepageGallery .photo-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(8,12,25,.88))}
      #homepageGallery .photo-info{position:absolute;right:0;left:0;bottom:0;padding:24px 20px 18px;color:#fff;text-align:right}
      #homepageGallery .photo-info strong{display:block;font-size:17px}
      #homepageGallery .photo-info span{display:block;font-size:12px;color:#e2e8f0;margin-top:4px}
      #homepageGallery .gallery-hint{text-align:center;color:#64748b;font-size:13px;margin-top:18px}
      #homepageGallery .gallery-empty{display:flex;align-items:center;justify-content:center;gap:10px;min-height:150px;color:#64748b;font-weight:800}
      @keyframes medlifeHomepageGalleryMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @media(max-width:700px){#homepageGallery .photo-card{flex-basis:245px;height:285px}#homepageGallery .photo-track{gap:12px;animation-duration:55s}}
      @media(prefers-reduced-motion:reduce){#homepageGallery .photo-track{animation:none!important}}
    </style>`;
    html = html.replace('</head>', `${style}</head>`);
  }

  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-cache");
  return new Response(html, { status: response.status, headers });
}
