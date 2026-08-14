/* =========================================================
   MEDLIFE HOMEPAGE
   Gallery + Featured Articles + AI + Feedback + Support
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    addHomepageArticles();
    injectHomepageEnhancements();
    initGallery();
});

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
   HOMEPAGE ENHANCEMENTS
========================================================= */
function injectHomepageEnhancements() {
    if (!document.body) return;

    if (!document.getElementById("medlifeHomepageEnhancementStyles")) {
        const style = document.createElement("style");
        style.id = "medlifeHomepageEnhancementStyles";
        style.textContent = `
            .ml-enhancement-section{padding:75px 20px;background:#F7F9FC}
            .ml-enhancement-container{width:min(1180px,100%);margin:auto}
            .ml-donation-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:22px}
            .ml-donation-card,.ml-feedback-card{background:#fff;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 18px 45px rgba(21,29,54,.08);padding:30px}
            .ml-support-badge{display:inline-flex;align-items:center;gap:8px;background:#FFF0F3;color:#FF2A54;padding:8px 12px;border-radius:999px;font-weight:900;font-size:12px}
            .ml-donation-card h3,.ml-feedback-card h3{margin:15px 0 8px;color:#151D36;font-size:24px}
            .ml-donation-note{color:#64748B;margin-bottom:20px}
            .ml-donation-methods{display:grid;grid-template-columns:1fr 1fr;gap:12px}
            .ml-donation-method{padding:16px;border:1px solid #E2E8F0;border-radius:16px;background:#F8FAFC}
            .ml-donation-method strong{display:block;color:#151D36;margin-bottom:5px}
            .ml-donation-method span{display:block;color:#334155;font-size:13px;line-height:1.8;word-break:break-word}
            .ml-donation-footer{margin-top:18px;padding:16px;border-radius:16px;background:linear-gradient(135deg,#151D36,#2B3659);color:#fff;text-align:center;font-weight:800}
            .ml-feedback-form{display:grid;gap:12px}
            .ml-feedback-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
            .ml-feedback-form input,.ml-feedback-form select,.ml-feedback-form textarea{width:100%;border:1px solid #E2E8F0;border-radius:13px;padding:13px 14px;font-family:inherit;font-size:14px;outline:none;background:#FBFCFE}
            .ml-feedback-form textarea{min-height:135px;resize:vertical}
            .ml-primary-btn{border:0;border-radius:13px;padding:13px 18px;background:#FF2A54;color:#fff;font-family:inherit;font-weight:900;cursor:pointer}
            .ml-primary-btn:disabled{opacity:.65;cursor:wait}
            .ml-form-status{display:none;padding:11px 13px;border-radius:12px;font-size:13px}.ml-form-status.show{display:block}.ml-form-status.success{background:#ECFDF5;color:#047857}.ml-form-status.error{background:#FFF1F2;color:#B42318}
            .ml-ai-button{position:fixed;bottom:24px;inset-inline-end:24px;z-index:5000;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:#fff;border:0;box-shadow:0 14px 35px rgba(79,70,229,.35);cursor:pointer;font-size:24px}
            .ml-ai-panel{position:fixed;bottom:96px;inset-inline-end:24px;z-index:4999;width:min(390px,calc(100vw - 28px));height:min(580px,calc(100vh - 130px));background:#fff;border:1px solid #E2E8F0;border-radius:22px;box-shadow:0 30px 80px rgba(21,29,54,.2);display:none;overflow:hidden}.ml-ai-panel.open{display:flex;flex-direction:column}
            .ml-ai-head{padding:15px 16px;background:linear-gradient(135deg,#151D36,#2B3659);color:#fff;display:flex;align-items:center;justify-content:space-between}.ml-ai-head strong{font-size:15px}.ml-ai-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer}
            .ml-ai-messages{flex:1;overflow:auto;padding:14px;background:#F7F9FC;display:flex;flex-direction:column;gap:10px}.ml-ai-msg{max-width:86%;padding:11px 13px;border-radius:15px;font-size:13px;line-height:1.8;white-space:pre-wrap}.ml-ai-msg.assistant{align-self:flex-start;background:#fff;border:1px solid #E2E8F0;color:#334155}.ml-ai-msg.user{align-self:flex-end;background:#FF2A54;color:#fff}
            .ml-ai-form{display:flex;gap:8px;padding:10px;border-top:1px solid #E2E8F0;background:#fff}.ml-ai-input{flex:1;border:1px solid #E2E8F0;border-radius:12px;padding:11px 12px;font-family:inherit;outline:none}.ml-ai-send{width:44px;border:0;border-radius:12px;background:#151D36;color:#fff;cursor:pointer}
            @media(max-width:850px){.ml-donation-grid{grid-template-columns:1fr}}
            @media(max-width:550px){.ml-feedback-row,.ml-donation-methods{grid-template-columns:1fr}.ml-enhancement-section{padding:55px 14px}.ml-donation-card,.ml-feedback-card{padding:22px}.ml-ai-button{bottom:16px;inset-inline-end:16px}.ml-ai-panel{bottom:88px;inset-inline-end:14px}}
        `;
        document.head.appendChild(style);
    }

    if (!document.getElementById("medlifeHomepageEnhancements")) {
        const footer = document.querySelector("footer");
        if (footer) {
            const wrapper = document.createElement("div");
            wrapper.id = "medlifeHomepageEnhancements";
            wrapper.innerHTML = `
                <section class="ml-enhancement-section">
                    <div class="ml-enhancement-container">
                        <div class="ml-donation-grid">
                            <div class="ml-donation-card">
                                <span class="ml-support-badge"><i class="fa-solid fa-heart"></i> ادعمونا</span>
                                <h3>ساهموا معنا في صنع الأثر</h3>
                                <p class="ml-donation-note">مساهمتكم معنا ستحدث فرقًا كبيرًا وتترك أثرًا لا يُنسى.</p>
                                <div class="ml-donation-methods">
                                    <div class="ml-donation-method"><strong>شركة الهرم</strong><span>مؤسسة ميدلايف الطبية الخيرية التطوعية<br>0998942124</span></div>
                                    <div class="ml-donation-method"><strong>سيرياتيل كاش</strong><span>رمز 00497549</span></div>
                                    <div class="ml-donation-method"><strong>MTN كاش</strong><span>رمز 4524-0602-1501-8298</span></div>
                                    <div class="ml-donation-method"><strong>بنك الشرق</strong><span>رقم الحساب 5557977</span></div>
                                </div>
                                <div class="ml-donation-footer">مساهمتكم معنا ستحدث فرقًا كبيرًا وتترك أثرًا لا يُنسى ❤️</div>
                            </div>
                            <div class="ml-feedback-card">
                                <span class="ml-support-badge"><i class="fa-regular fa-message"></i> صوتكم يهمنا</span>
                                <h3>شكوى أو ملاحظة</h3>
                                <p class="ml-donation-note">شاركنا رأيك أو ملاحظتك أو أي شكوى، وسنحرص على متابعتها.</p>
                                <form class="ml-feedback-form" id="medlifeFeedbackForm">
                                    <div class="ml-feedback-row">
                                        <input id="mlFeedbackName" type="text" placeholder="الاسم">
                                        <input id="mlFeedbackPhone" type="tel" placeholder="رقم الهاتف">
                                    </div>
                                    <input id="mlFeedbackEmail" type="email" placeholder="البريد الإلكتروني (اختياري)">
                                    <select id="mlFeedbackType"><option value="complaint">شكوى</option><option value="feedback" selected>ملاحظة / اقتراح</option><option value="thanks">رسالة شكر</option></select>
                                    <textarea id="mlFeedbackMessage" required placeholder="اكتب رسالتك هنا..."></textarea>
                                    <button class="ml-primary-btn" id="mlFeedbackSubmit" type="submit">إرسال الرسالة</button>
                                    <div class="ml-form-status" id="mlFeedbackStatus"></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            footer.parentNode.insertBefore(wrapper, footer);
        }
    }

    const feedbackForm = document.getElementById("medlifeFeedbackForm");
    if (feedbackForm && !feedbackForm.dataset.bound) {
        feedbackForm.dataset.bound = "1";
        feedbackForm.addEventListener("submit", async event => {
            event.preventDefault();
            const submit = document.getElementById("mlFeedbackSubmit");
            const status = document.getElementById("mlFeedbackStatus");
            submit.disabled = true;
            submit.textContent = "جاري الإرسال...";
            status.className = "ml-form-status";
            try {
                const response = await fetch("/api/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({
                        type: document.getElementById("mlFeedbackType").value,
                        name: document.getElementById("mlFeedbackName").value,
                        phone: document.getElementById("mlFeedbackPhone").value,
                        email: document.getElementById("mlFeedbackEmail").value,
                        message: document.getElementById("mlFeedbackMessage").value
                    })
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || "تعذر إرسال الرسالة.");
                status.className = "ml-form-status show success";
                status.textContent = "تم استلام رسالتكم بنجاح، شكراً لتواصلكم معنا.";
                feedbackForm.reset();
            } catch (error) {
                status.className = "ml-form-status show error";
                status.textContent = error.message || "تعذر إرسال الرسالة حالياً.";
            } finally {
                submit.disabled = false;
                submit.textContent = "إرسال الرسالة";
            }
        });
    }

    if (!document.getElementById("mlAiButton")) {
        const widget = document.createElement("div");
        widget.innerHTML = `
            <button class="ml-ai-button" id="mlAiButton" type="button" aria-label="مساعد MedLife الذكي"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
            <div class="ml-ai-panel" id="mlAiPanel" aria-label="MedLife AI">
                <div class="ml-ai-head"><strong><i class="fa-solid fa-wand-magic-sparkles"></i> مساعد MedLife الذكي</strong><button class="ml-ai-close" id="mlAiClose" type="button">×</button></div>
                <div class="ml-ai-messages" id="mlAiMessages"><div class="ml-ai-msg assistant">مرحباً بك في MedLife 👋\nأنا مساعدك الذكي. اسألني عن ميدلايف أو عن المعلومات الصحية العامة.</div></div>
                <form class="ml-ai-form" id="mlAiForm"><input class="ml-ai-input" id="mlAiInput" type="text" maxlength="3000" placeholder="اكتب سؤالك هنا..." autocomplete="off"><button class="ml-ai-send" type="submit" aria-label="إرسال"><i class="fa-solid fa-paper-plane"></i></button></form>
            </div>
        `;
        document.body.appendChild(widget);

        const panel = document.getElementById("mlAiPanel");
        const input = document.getElementById("mlAiInput");
        const messages = document.getElementById("mlAiMessages");
        const aiForm = document.getElementById("mlAiForm");
        let history = [];

        document.getElementById("mlAiButton").addEventListener("click", () => {
            panel.classList.toggle("open");
            if (panel.classList.contains("open")) input.focus();
        });

        document.getElementById("mlAiClose").addEventListener("click", () => panel.classList.remove("open"));

        aiForm.addEventListener("submit", async event => {
            event.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            addAIMessage(messages, text, "user");
            input.value = "";
            const pending = addAIMessage(messages, "جاري التفكير...", "assistant");

            try {
                const response = await fetch("/api/ai", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ message: text, language: "ar", history: history.slice(-10) })
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || "تعذر الحصول على رد من المساعد.");
                pending.textContent = data.answer || "لم يصل رد من المساعد.";
                history.push({ role: "user", content: text });
                history.push({ role: "assistant", content: data.answer || "" });
            } catch (error) {
                pending.textContent = error.message || "تعذر الاتصال بالمساعد حالياً.";
            }
        });
    }
}

function addAIMessage(container, text, role) {
    const message = document.createElement("div");
    message.className = `ml-ai-msg ${role}`;
    message.textContent = text;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
    return message;
}

/* =========================================================
   GALLERY
========================================================= */
async function initGallery() {
    const photoTrack = document.getElementById("photoTrack");
    if (!photoTrack) return;

    try {
        const response = await fetch("/api/gallery", { method: "GET", headers: { "Accept": "application/json" }, cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Unable to load gallery.");

        const images = Array.isArray(data.images) ? data.images : [];
        if (!images.length) {
            photoTrack.innerHTML = `<div class="gallery-empty"><i class="fa-regular fa-images"></i><span>لا توجد صور منشورة حالياً.</span></div>`;
            return;
        }

        photoTrack.innerHTML = "";
        images.forEach(image => photoTrack.appendChild(createGalleryCard(image)));
        images.forEach(image => photoTrack.appendChild(createGalleryCard(image)));
    } catch (error) {
        console.error("MedLife Gallery error:", error);
        photoTrack.innerHTML = `<div class="gallery-empty"><i class="fa-solid fa-circle-exclamation"></i><span>تعذر تحميل صور ميدلايف حالياً.</span></div>`;
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
    card.addEventListener("click", () => openGalleryLightbox(image.url, image.name));
    return card;
}

function openGalleryLightbox(url, name) {
    let lightbox = document.getElementById("galleryLightbox");
    if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.id = "galleryLightbox";
        lightbox.className = "gallery-lightbox";
        lightbox.innerHTML = `<div class="gallery-lightbox-content"><button class="gallery-close" type="button">×</button><img id="galleryPreview" src="" alt="MedLife"><div id="galleryCaption" class="gallery-caption"></div></div>`;
        document.body.appendChild(lightbox);
        lightbox.querySelector(".gallery-close").addEventListener("click", closeGalleryLightbox);
        lightbox.addEventListener("click", event => { if (event.target === lightbox) closeGalleryLightbox(); });
    }
    document.getElementById("galleryPreview").src = url;
    document.getElementById("galleryPreview").alt = name || "MedLife";
    document.getElementById("galleryCaption").textContent = name || "";
    lightbox.classList.add("active");
}

function closeGalleryLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    if (lightbox) lightbox.classList.remove("active");
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeGalleryLightbox();
});
