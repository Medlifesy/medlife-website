(() => {
  const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
  const OWNER = "Medlifesy";
  const REPO = "medlife-website";
  const BRANCH = "main";

  document.addEventListener("DOMContentLoaded", async () => {
    // Navigation: simple text only, no icon.
    document.querySelectorAll('a[href="#activities"]').forEach(link => {
      link.textContent = "صورنا";
      link.href = "#homepageGallery";
    });

    // Remove the old fixed gallery completely; the new one is generated below.
    document.getElementById("activities")?.remove();

    const section = document.createElement("section");
    section.id = "homepageGallery";
    section.className = "section medlife-photo-section";
    section.innerHTML = `
      <div class="wrap">
        <div class="section-title">
          <div class="eyebrow">صورنا</div>
          <h2>صور من أنشطة ميدلايف</h2>
          <p>لقطات من المبادرات الصحية والإنسانية، التدريب، التطوع والفعاليات التي شارك فيها فريق ميدلايف.</p>
        </div>
        <div class="photo-marquee" aria-label="صور من أنشطة ميدلايف">
          <div class="photo-track" id="medlifePhotoTrack"></div>
        </div>
        <p class="gallery-hint">اضغط على أي صورة لمشاهدتها بحجم أكبر</p>
      </div>`;

    const contact = document.querySelector("#contact");
    const main = document.querySelector("main");
    if (!main) return;
    if (contact) main.insertBefore(section, contact.closest("section") || contact);
    else main.appendChild(section);

    addStyles();
    const track = section.querySelector("#medlifePhotoTrack");

    try {
      let images = [];
      try {
        const r = await fetch("/api/gallery", { cache: "no-store", headers: { Accept: "application/json" } });
        if (r.ok) {
          const data = await r.json();
          if (data.success && Array.isArray(data.images)) images = data.images;
        }
      } catch (_) {}

      // Reliable fallback: read the public images directory directly from GitHub.
      if (!images.length) {
        const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/images?ref=${BRANCH}`, {
          headers: { Accept: "application/vnd.github+json" },
          cache: "no-store"
        });
        if (!r.ok) throw new Error("Unable to read images directory");
        const files = await r.json();
        images = files
          .filter(f => f.type === "file" && IMAGE_EXT.test(f.name))
          .map(f => ({ name: f.name, url: f.download_url }))
          .filter(f => f.url);
      }

      if (!images.length) {
        track.innerHTML = '<div class="gallery-empty">لا توجد صور منشورة حالياً.</div>';
        return;
      }

      images.sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: "base" }));
      const cards = [...images, ...images];
      cards.forEach((image, i) => track.appendChild(card(image, i % images.length)));
    } catch (error) {
      console.error("MedLife gallery:", error);
      track.innerHTML = '<div class="gallery-empty">تعذر تحميل صور ميدلايف حالياً.</div>';
    }
  });

  function card(image, index) {
    const el = document.createElement("article");
    el.className = "photo-card";
    const title = titleFor(image.name, index);
    const description = "لقطة من أنشطة ومبادرات فريق ميدلايف.";
    el.innerHTML = `<img src="${safe(image.url)}" alt="${safe(title)}" loading="lazy" decoding="async"><div class="photo-shade"></div><div class="photo-info"><strong>${safe(title)}</strong><span>${description}</span></div>`;
    const img = el.querySelector("img");
    img.onerror = () => el.remove();
    el.addEventListener("click", () => {
      const box = document.createElement("div");
      box.className = "photo-lightbox";
      box.innerHTML = `<button aria-label="إغلاق">×</button><img src="${safe(image.url)}" alt="${safe(title)}">`;
      box.addEventListener("click", e => { if (e.target === box || e.target.tagName === "BUTTON") box.remove(); });
      document.body.appendChild(box);
    });
    return el;
  }

  function titleFor(name, index) {
    const clean = String(name || "").replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
    if (clean && !/^\d+$/.test(clean)) return clean;
    const titles = ["من ميدان العمل التطوعي", "مبادرة صحية من ميدلايف", "فريق ميدلايف في الميدان", "معاً نصنع الأثر", "من أنشطة ميدلايف المجتمعية", "لقطة من مسيرة العطاء", "ميدلايف تجمعنا", "نحو مجتمع أكثر صحة"];
    return titles[index % titles.length];
  }

  function safe(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function addStyles() {
    if (document.getElementById("medlife-home-gallery-style")) return;
    const style = document.createElement("style");
    style.id = "medlife-home-gallery-style";
    style.textContent = `
      .medlife-photo-section{background:linear-gradient(180deg,#fff,#f6f8fc)}
      .photo-marquee{overflow:hidden;position:relative;padding:8px 0 20px;mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
      .photo-track{display:flex;gap:18px;width:max-content;direction:ltr;animation:medlifePhotoMove 75s linear infinite}
      .photo-marquee:hover .photo-track{animation-play-state:paused}
      .photo-card{position:relative;flex:0 0 290px;height:330px;border-radius:24px;overflow:hidden;background:#fff;border:1px solid #e2e8f0;box-shadow:0 15px 45px rgba(21,29,54,.1);cursor:zoom-in;transition:transform .35s,box-shadow .35s}
      .photo-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:0 25px 65px rgba(21,29,54,.18)}
      .photo-card>img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}
      .photo-card:hover>img{transform:scale(1.07)}
      .photo-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(8,12,25,.88))}
      .photo-info{position:absolute;right:0;left:0;bottom:0;padding:22px 18px;color:#fff;text-align:right}
      .photo-info strong{display:block;font-size:17px}.photo-info span{display:block;margin-top:3px;color:#e2e8f0;font-size:12px}
      .gallery-hint{text-align:center;color:#64748b;font-size:13px;margin-top:12px}
      .gallery-empty{padding:40px;color:#64748b;background:#fff;border:1px solid #e2e8f0;border-radius:20px;text-align:center;min-width:320px}
      .photo-lightbox{position:fixed;inset:0;z-index:5000;background:rgba(5,8,18,.94);display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out}
      .photo-lightbox img{max-width:94vw;max-height:88vh;border-radius:18px;object-fit:contain;box-shadow:0 30px 100px rgba(0,0,0,.55)}
      .photo-lightbox button{position:absolute;top:18px;left:22px;width:48px;height:48px;border:0;border-radius:50%;background:#fff;color:#151d36;font-size:30px;cursor:pointer}
      @keyframes medlifePhotoMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @media(max-width:700px){.photo-card{flex-basis:250px;height:290px}.photo-track{gap:12px;animation-duration:60s}}
      @media(prefers-reduced-motion:reduce){.photo-track{animation:none!important}}
    `;
    document.head.appendChild(style);
  }
})();
