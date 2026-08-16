/* =========================================================
   MEDLIFE HOMEPAGE
   Featured Articles + Dynamic Full Gallery + Membership Navigation
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    addHomepageArticles();
    initGallery();
    initVolunteerRegistrationLinks();
    initMemberLoginLink();
});

/* =========================================================
   NEW MEMBER REGISTRATION
========================================================= */
function initVolunteerRegistrationLinks() {
    const registrationUrl = "join-us.html";

    document.querySelectorAll("[data-volunteer-trigger]").forEach(trigger => {
        trigger.setAttribute("href", registrationUrl);
        trigger.addEventListener("click", event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            window.location.href = registrationUrl;
        }, true);
    });

    document.querySelectorAll(".volunteer-btn, a[href='#volunteer']").forEach(trigger => {
        trigger.setAttribute("href", registrationUrl);
        trigger.addEventListener("click", event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            window.location.href = registrationUrl;
        }, true);
    });

    const volunteerSection = document.getElementById("volunteer");
    if (volunteerSection) {
        const buttons = volunteerSection.querySelectorAll("a, button");
        buttons.forEach(button => {
            const text = (button.textContent || "").trim();
            if (/تطوع|انضم|طلب|join|volunteer|apply/i.test(text)) {
                if (button.tagName === "A") button.setAttribute("href", registrationUrl);
                button.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    window.location.href = registrationUrl;
                }, true);
            }
        });
    }

    const volunteerText = document.querySelector("#volunteer p[data-ar]");
    if (volunteerText) {
        volunteerText.dataset.ar = "في ميدلايف، لا نبحث فقط عن الأشخاص الذين يمتلكون الخبرة. نبحث أيضاً عن الأشخاص الذين يمتلكون الشغف والرغبة بالتعلم وصناعة الأثر. يمكنك الآن تقديم طلب الانضمام إلى فريق ميدلايف عبر نموذج التسجيل، وسيتم مراجعة طلبك من قبل فريق الإدارة.";
        volunteerText.dataset.en = "At MedLife, we look not only for people with experience, but also for people with passion, curiosity, and a desire to create impact. You can now submit your application to join the MedLife team through our registration form, and your application will be reviewed by the administration team.";
        volunteerText.textContent = volunteerText.dataset.ar;
    }

    document.querySelectorAll("[data-volunteer-trigger] span").forEach(label => {
        label.dataset.ar = "انضم إلى فريق ميدلايف";
        label.dataset.en = "Join the MedLife Team";
        label.textContent = "انضم إلى فريق ميدلايف";
    });

    const heroJoin = document.querySelector('a[href="join-us.html"]');
    if (heroJoin) {
        heroJoin.className = "btn btn-primary";
        heroJoin.setAttribute("aria-label", "الانضمام إلى فريق MedLife");
    }
}

/* =========================================================
   EXISTING MEMBER ACCESS
========================================================= */
function initMemberLoginLink() {
    const memberUrl = "members.html";

    [document.getElementById("loginBtn"), document.getElementById("mobileLoginBtn")]
        .filter(Boolean)
        .forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopImmediatePropagation();
                window.location.href = memberUrl;
            }, true);
        });

    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        const text = loginModal.querySelector("p");
        if (text) {
            text.dataset.ar = "إذا كنت عضواً في MedLife يمكنك الدخول إلى منصة الأعضاء. وإذا لم يكن لديك حساب بعد، استخدم خيار إنشاء الحساب بعد اعتماد طلبك.";
            text.dataset.en = "If you are a MedLife member, you can access the members platform. If you do not have an account yet, use the account creation option after your application has been approved.";
            text.textContent = text.dataset.ar;
        }

        loginModal.querySelectorAll("button, a").forEach(action => {
            const label = (action.textContent || "").trim();
            if (/حسناً|OK|دخول|login/i.test(label)) {
                action.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    window.location.href = memberUrl;
                }, true);
            }
        });
    }
}

/* =========================================================
   FEATURED ARTICLES
========================================================= */
function addHomepageArticles() {
    const articleGrid = document.querySelector("#articles .article-grid");
    if (!articleGrid) return;

    const articles = [
        {
            id: "tension-headache-home-article",
            icon: "fa-head-side-virus",
            category: "توعية صحية",
            title: "صداع التوتر: رحلتك نحو الراحة",
            description: "دليل طبي مبسط حول صداع التوتر، أسبابه وأعراضه وعلامات الخطر والعلاج والوقاية.",
            url: "articles/tension-headache.html"
        },
        {
            id: "endometriosis-home-article",
            icon: "fa-dna",
            category: "Global Journal Club",
            title: "الاختبارات التشخيصية الحديثة وغير الباضعة للانتباذ البطاني الرحمي",
            description: "مناقشة علمية لـ Endotest وEndoSure، من الدقة التشخيصية إلى الفائدة السريرية والنقد المنهجي للدليل.",
            url: "articles/endometriosis-endotest-endosure.html"
        }
    ];

    articles.forEach(article => {
        if (document.getElementById(article.id)) return;
        const card = document.createElement("article");
        card.id = article.id;
        card.className = "article-card reveal show";
        card.innerHTML = `
            <div class="article-top"><i class="fa-solid ${article.icon}"></i></div>
            <div class="article-body">
                <div class="article-category">${escapeHomeHtml(article.category)}</div>
                <h3>${escapeHomeHtml(article.title)}</h3>
                <p>${escapeHomeHtml(article.description)}</p>
                <a href="${article.url}" class="article-link">اقرأ المقال ←</a>
            </div>`;
        articleGrid.appendChild(card);
    });
}

function escapeHomeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   FULL DYNAMIC GALLERY
   Every image returned by /api/gallery is displayed.
   New images added to /images appear automatically.
========================================================= */
async function initGallery() {
    injectDynamicGalleryStyles();
    const photoTrack = ensureHomepageGallery();
    if (!photoTrack) return;

    try {
        const response = await fetch("/api/gallery", {
            method: "GET",
            headers: { "Accept": "application/json" },
            cache: "no-store"
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || "Unable to load gallery.");
        }

        const images = Array.isArray(data.images) ? data.images.filter(image => image && image.url) : [];

        if (!images.length) {
            photoTrack.innerHTML = `<div class="gallery-empty"><i class="fa-regular fa-images"></i><span>لا توجد صور منشورة حالياً.</span></div>`;
            return;
        }

        photoTrack.innerHTML = "";

        // Duplicate the complete set once to create a seamless continuous marquee.
        const items = [...images, ...images];
        items.forEach((image, index) => {
            photoTrack.appendChild(createGalleryCard(image, index % images.length));
        });

        const section = document.getElementById("homepageGallery");
        const count = section?.querySelector("[data-gallery-count]");
        if (count) count.textContent = `${images.length} صورة من أنشطة ومبادرات ميدلايف`;

    } catch (error) {
        console.error("MedLife Gallery error:", error);
        photoTrack.innerHTML = `<div class="gallery-empty"><i class="fa-solid fa-circle-exclamation"></i><span>تعذر تحميل صور ميدلايف حالياً.</span></div>`;
    }
}

function ensureHomepageGallery() {
    let track = document.getElementById("photoTrack");
    if (track) return track;

    const main = document.querySelector("main") || document.body;
    const section = document.createElement("section");
    section.id = "homepageGallery";
    section.className = "section medlife-photo-section";
    section.innerHTML = `
        <div class="wrap">
            <div class="section-title">
                <div class="eyebrow">صورنا</div>
                <h2>من أنشطة ومبادرات ميدلايف</h2>
                <p>لقطات من العمل الميداني، المبادرات الصحية والإنسانية، التدريب، التطوع، والفعاليات التي شارك فيها فريق ميدلايف.</p>
                <div class="gallery-count" data-gallery-count>جاري تحميل الصور...</div>
            </div>
            <div class="photo-marquee" aria-label="صور أنشطة ومبادرات ميدلايف">
                <div class="photo-track" id="photoTrack"></div>
            </div>
            <p class="gallery-hint">اضغط على أي صورة لمشاهدتها بحجم أكبر</p>
        </div>`;

    // Put the gallery before the contact section so it becomes a natural homepage section.
    const contact = main.querySelector("#contact");
    if (contact) main.insertBefore(section, contact.closest("section") || contact);
    else main.appendChild(section);

    track = section.querySelector("#photoTrack");
    return track;
}

function createGalleryCard(image, originalIndex) {
    const card = document.createElement("article");
    card.className = "photo-card";

    const title = buildImageTitle(image.name, originalIndex);
    const description = buildImageDescription(image.name, originalIndex);

    card.innerHTML = `
        <div class="photo-image-wrap">
            <img src="${escapeHomeHtml(image.url)}" alt="${escapeHomeHtml(title)}" loading="lazy" decoding="async">
            <div class="photo-shade"></div>
            <div class="photo-info">
                <strong>${escapeHomeHtml(title)}</strong>
                <span>${escapeHomeHtml(description)}</span>
            </div>
        </div>`;

    const img = card.querySelector("img");
    img.onerror = () => card.remove();

    card.addEventListener("click", () => openGalleryLightbox(image.url, title, description));
    return card;
}

function buildImageTitle(name, index) {
    const clean = String(name || "").replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
    if (clean && !/^\d+$/.test(clean)) return clean;

    const titles = [
        "من ميدان العمل التطوعي",
        "مبادرة صحية من ميدلايف",
        "فريق ميدلايف في الميدان",
        "معاً نصنع الأثر",
        "من أنشطة ميدلايف المجتمعية",
        "لقطة من مسيرة العطاء",
        "ميدلايف تجمعنا",
        "نحو مجتمع أكثر صحة"
    ];
    return titles[index % titles.length];
}

function buildImageDescription(name, index) {
    const lower = String(name || "").toLowerCase();
    if (/رمضان|ramadan|eid/.test(lower)) return "من المبادرات الإنسانية والمجتمعية لميدلايف.";
    if (/طفل|اطفال|children|kids|hospital/.test(lower)) return "من الأنشطة الموجهة للأطفال والدعم المجتمعي.";
    if (/course|training|كورس|تدريب|تعليم/.test(lower)) return "من برامج التدريب والتعليم وبناء المهارات.";
    if (/health|medical|طب|صحة|سكر|ضغط/.test(lower)) return "من المبادرات الصحية والتوعية الطبية.";
    return "لقطة من أنشطة ومبادرات فريق ميدلايف.";
}

/* =========================================================
   DYNAMIC GALLERY STYLES
========================================================= */
function injectDynamicGalleryStyles() {
    if (document.getElementById("medlife-gallery-runtime-style")) return;

    const style = document.createElement("style");
    style.id = "medlife-gallery-runtime-style";
    style.textContent = `
        .medlife-photo-section{background:linear-gradient(180deg,#fff,#f6f8fc)}
        .gallery-count{display:inline-flex;margin-top:13px;padding:7px 13px;border-radius:999px;background:#fff0f3;color:#ff2a54;font-size:12px;font-weight:800}
        .photo-marquee{position:relative;overflow:hidden;border-radius:30px;padding:8px 0 18px;mask-image:linear-gradient(to right,transparent,#000 5%,#000 95%,transparent);-webkit-mask-image:linear-gradient(to right,transparent,#000 5%,#000 95%,transparent)}
        .photo-track{display:flex;width:max-content;gap:18px;animation:medlifeGalleryMove 70s linear infinite;direction:ltr}
        .photo-marquee:hover .photo-track{animation-play-state:paused}
        .photo-card{position:relative;flex:0 0 290px;height:330px;border-radius:24px;overflow:hidden;background:#fff;border:1px solid #e2e8f0;box-shadow:0 15px 45px rgba(21,29,54,.1);cursor:zoom-in;transition:transform .35s,box-shadow .35s}
        .photo-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:0 25px 65px rgba(21,29,54,.18)}
        .photo-image-wrap,.photo-image-wrap img{width:100%;height:100%}
        .photo-image-wrap{position:relative}
        .photo-image-wrap img{object-fit:cover;display:block;transition:transform .7s ease,filter .5s}
        .photo-card:hover img{transform:scale(1.07);filter:saturate(1.08)}
        .photo-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(7,12,28,.92) 100%)}
        .photo-info{position:absolute;right:0;left:0;bottom:0;padding:22px 18px 17px;color:#fff;text-align:right;direction:rtl}
        .photo-info strong{display:block;font-size:16px;line-height:1.5}
        .photo-info span{display:block;color:#dbe4f0;font-size:11px;line-height:1.7;margin-top:5px}
        .gallery-hint{text-align:center;color:#64748b;font-size:12px;margin-top:6px}
        .gallery-empty{min-width:100%;padding:45px;text-align:center;color:#64748b;background:#fff;border:1px solid #e2e8f0;border-radius:22px}
        .gallery-empty i{font-size:30px;color:#ff2a54;display:block;margin-bottom:8px}
        .gallery-lightbox{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:25px;background:rgba(6,10,22,.94);opacity:0;pointer-events:none;transition:opacity .25s}
        .gallery-lightbox.active{opacity:1;pointer-events:auto}
        .gallery-lightbox-content{position:relative;max-width:min(1100px,94vw);max-height:92vh;text-align:center}
        .gallery-lightbox-content img{max-width:100%;max-height:78vh;display:block;border-radius:18px;box-shadow:0 30px 100px rgba(0,0,0,.5)}
        .gallery-caption{color:#fff;margin-top:13px;font-family:Cairo,sans-serif}
        .gallery-caption strong{display:block;font-size:18px}
        .gallery-caption span{display:block;color:#cbd5e1;font-size:12px;margin-top:3px}
        .gallery-close{position:fixed;top:18px;left:22px;width:48px;height:48px;border:0;border-radius:50%;background:#fff;color:#151d36;font-size:22px;cursor:pointer;z-index:2}
        @keyframes medlifeGalleryMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @media(max-width:700px){.photo-card{flex-basis:245px;height:290px}.photo-track{gap:12px;animation-duration:52s}.photo-marquee{mask-image:none;-webkit-mask-image:none}}
        @media(prefers-reduced-motion:reduce){.photo-track{animation:none!important}.photo-card{transition:none!important}}
    `;
    document.head.appendChild(style);
}

function openGalleryLightbox(url, title, description) {
    let lightbox = document.getElementById("galleryLightbox");

    if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.id = "galleryLightbox";
        lightbox.className = "gallery-lightbox";
        lightbox.innerHTML = `
            <div class="gallery-lightbox-content">
                <button class="gallery-close" type="button" aria-label="إغلاق">×</button>
                <img id="galleryPreview" src="" alt="MedLife">
                <div id="galleryCaption" class="gallery-caption"></div>
            </div>`;
        document.body.appendChild(lightbox);

        lightbox.querySelector(".gallery-close").addEventListener("click", closeGalleryLightbox);
        lightbox.addEventListener("click", event => {
            if (event.target === lightbox) closeGalleryLightbox();
        });
    }

    const preview = lightbox.querySelector("#galleryPreview");
    const caption = lightbox.querySelector("#galleryCaption");
    preview.src = url;
    preview.alt = title || "MedLife";
    caption.innerHTML = `<strong>${escapeHomeHtml(title || "من أنشطة ميدلايف")}</strong><span>${escapeHomeHtml(description || "")}</span>`;
    lightbox.classList.add("active");
}

function closeGalleryLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    if (lightbox) lightbox.classList.remove("active");
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeGalleryLightbox();
});
