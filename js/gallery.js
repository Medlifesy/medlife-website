/* =========================================================
   MEDLIFE HOMEPAGE
   Featured Articles + Gallery + Membership Navigation
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
                if (button.tagName === "A") {
                    button.setAttribute("href", registrationUrl);
                }
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
   The homepage member-login buttons now open the member platform.
========================================================= */
function initMemberLoginLink() {
    const memberUrl = "members.html";

    [
        document.getElementById("loginBtn"),
        document.getElementById("mobileLoginBtn")
    ].filter(Boolean).forEach(button => {
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

        const actions = loginModal.querySelectorAll("button, a");
        actions.forEach(action => {
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
            <div class="article-top">
                <i class="fa-solid ${article.icon}"></i>
            </div>
            <div class="article-body">
                <div class="article-category">${escapeHomeHtml(article.category)}</div>
                <h3>${escapeHomeHtml(article.title)}</h3>
                <p>${escapeHomeHtml(article.description)}</p>
                <a href="${article.url}" class="article-link">اقرأ المقال ←</a>
            </div>
        `;
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
   GALLERY
========================================================= */
async function initGallery() {
    const photoTrack = document.getElementById("photoTrack");
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

        const images = Array.isArray(data.images) ? data.images : [];

        if (!images.length) {
            photoTrack.innerHTML = `
                <div class="gallery-empty">
                    <i class="fa-regular fa-images"></i>
                    <span>لا توجد صور منشورة حالياً.</span>
                </div>
            `;
            return;
        }

        photoTrack.innerHTML = "";

        [...images, ...images].forEach(image => {
            photoTrack.appendChild(createGalleryCard(image));
        });

    } catch (error) {
        console.error("MedLife Gallery error:", error);

        photoTrack.innerHTML = `
            <div class="gallery-empty">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>تعذر تحميل صور ميدلايف حالياً.</span>
            </div>
        `;
    }
}

function createGalleryCard(image) {
    const card = document.createElement("div");
    card.className = "photo-card";

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.name || "MedLife";
    img.loading = "lazy";
    img.decoding = "async";

    img.onerror = () => card.remove();

    card.appendChild(img);

    card.addEventListener("click", () => {
        openGalleryLightbox(image.url, image.name);
    });

    return card;
}

function openGalleryLightbox(url, name) {
    let lightbox = document.getElementById("galleryLightbox");

    if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.id = "galleryLightbox";
        lightbox.className = "gallery-lightbox";

        lightbox.innerHTML = `
            <div class="gallery-lightbox-content">
                <button class="gallery-close" type="button" aria-label="Close">×</button>
                <img id="galleryPreview" src="" alt="MedLife">
                <div id="galleryCaption" class="gallery-caption"></div>
            </div>
        `;

        document.body.appendChild(lightbox);

        lightbox
            .querySelector(".gallery-close")
            .addEventListener("click", closeGalleryLightbox);

        lightbox.addEventListener("click", event => {
            if (event.target === lightbox) {
                closeGalleryLightbox();
            }
        });
    }

    const preview = document.getElementById("galleryPreview");
    const caption = document.getElementById("galleryCaption");

    preview.src = url;
    preview.alt = name || "MedLife";
    caption.textContent = name || "";

    lightbox.classList.add("active");
}

function closeGalleryLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    if (lightbox) {
        lightbox.classList.remove("active");
    }
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeGalleryLightbox();
    }
});
