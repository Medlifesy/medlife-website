/* =========================================================
   MEDLIFE DYNAMIC GALLERY + HOMEPAGE ENHANCEMENTS
========================================================= */

(function () {

    function addFeaturedArticle() {
        const articleGrid = document.querySelector("#articles .article-grid");
        if (!articleGrid) return false;
        if (document.getElementById("tension-headache-home-article")) return true;

        const card = document.createElement("article");
        card.id = "tension-headache-home-article";
        card.className = "article-card reveal show";
        card.innerHTML = `
            <div class="article-top"><i class="fa-solid fa-head-side-virus"></i></div>
            <div class="article-body">
                <div class="article-category" data-ar="توعية صحية" data-en="Health Awareness">توعية صحية</div>
                <h3 data-ar="صداع التوتر: رحلتك نحو الراحة" data-en="Tension-Type Headache: Your Journey to Relief">صداع التوتر: رحلتك نحو الراحة</h3>
                <p data-ar="تعرف على صداع التوتر، أسبابه وأعراضه، علامات الخطر، العلاج المتكامل وطرق الوقاية." data-en="Learn about tension-type headache, its symptoms, warning signs, integrated treatment and prevention.">تعرف على صداع التوتر، أسبابه وأعراضه، علامات الخطر، العلاج المتكامل وطرق الوقاية.</p>
                <a href="articles/tension-headache.html" class="article-link" data-ar="اقرأ المقال ←" data-en="Read the article →">اقرأ المقال ←</a>
            </div>
        `;
        articleGrid.insertBefore(card, articleGrid.firstElementChild);
        return true;
    }

    function initFeaturedArticle() {
        if (addFeaturedArticle()) return;
        [300, 1000, 2000].forEach(delay => setTimeout(addFeaturedArticle, delay));
    }

    function injectHomepageEnhancements() {
        if (!document.body || document.getElementById("medlifeHomepageEnhancements")) return;
        injectStyles();
        injectSections();
        injectAIWidget();
    }

    function injectStyles() {
        const style = document.createElement("style");
        style.id = "medlifeEnhancementStyles";
        style.textContent = `
            .ml-enhancement-section{padding:75px 20px;position:relative;overflow:hidden}
            .ml-enhancement-container{width:min(1180px,100%);margin:auto}
            .ml-donation-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:22px;align-items:stretch}
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
            .ml-feedback-form input:focus,.ml-feedback-form select:focus,.ml-feedback-form textarea:focus{border-color:#FF2A54;box-shadow:0 0 0 3px rgba(255,42,84,.08);background:#fff}
            .ml-feedback-form textarea{min-height:135px;resize:vertical}
            .ml-primary-btn{border:0;border-radius:13px;padding:13px 18px;background:#FF2A54;color:#fff;font-family:inherit;font-weight:900;cursor:pointer}
            .ml-primary-btn:disabled{opacity:.65;cursor:wait}
            .ml-form-status{display:none;padding:11px 13px;border-radius:12px;font-size:13px}.ml-form-status.show{display:block}.ml-form-status.success{background:#ECFDF5;color:#047857}.ml-form-status.error{background:#FFF1F2;color:#B42318}
            .ml-ai-button{position:fixed;bottom:24px;inset-inline-end:24px;z-index:5000;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:#fff;border:0;box-shadow:0 14px 35px rgba(79,70,229,.35);cursor:pointer;font-size:24px}
            .ml-ai-panel{position:fixed;bottom:96px;inset-inline-end:24px;z-index:4999;width:min(390px,calc(100vw - 28px));height:min(580px,calc(100vh - 130px));background:#fff;border:1px solid #E2E8F0;border-radius:22px;box-shadow:0 30px 80px rgba(21,29,54,.2);display:none;overflow:hidden}.ml-ai-panel.open{display:flex;flex-direction:column}
            .ml-ai-head{padding:15px 16px;background:linear-gradient(135deg,#151D36,#2B3659);color:#fff;display:flex;align-items:center;justify-content:space-between}.ml-ai-head strong{font-size:15px}.ml-ai-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer}
            .ml-ai-messages{flex:1;overflow:auto;padding:14px;background:#F7F9FC;display:flex;flex-direction:column;gap:10px}.ml-ai-msg{max-width:86%;padding:11px 13px;border-radius:15px;font-size:13px;line-height:1.8;white-space:pre-wrap}.ml-ai-msg.assistant{align-self:flex-start;background:#fff;border:1px solid #E2E8F0;color:#334155}.ml-ai-msg.user{align-self:flex-end;background:#FF2A54;color:#fff}
            .ml-ai-form{display:flex;gap:8px;padding:10px;border-top:1px solid #E2E8F0;background:#fff}.ml-ai-input{flex:1;border:1px solid #E2E8F0;border-radius:12px;padding:11px 12px;font-family:inherit;outline:none}.ml-ai-send{width:44px;border:0;border-radius:12px;background:#151D36;color:#fff;cursor:pointer}
            .ml-section-anchor{scroll-margin-top:100px}
            @media(max-width:850px){.ml-donation-grid{grid-template-columns:1fr}}
            @media(max-width:550px){.ml-feedback-row,.ml-donation-methods{grid-template-columns:1fr}.ml-enhancement-section{padding:55px 14px}.ml-donation-card,.ml-feedback-card{padding:22px}.ml-ai-button{bottom:16px;inset-inline-end:16px}.ml-ai-panel{bottom:88px;inset-inline-end:14px}}
        `;
        document.head.appendChild(style);
    }

    function injectSections() {
        const footer = document.querySelector("footer");
        if (!footer || !footer.parentNode) return;

        const wrapper = document.createElement("div");
        wrapper.id = "medlifeHomepageEnhancements";
        wrapper.innerHTML = `
            <section class="ml-enhancement-section ml-section-anchor" id="medlifeSupport">
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
                            <div class="ml-donation-footer">شكراً لثقتكم ودعمكم لميدلايف ❤️</div>
                        </div>

                        <div class="ml-feedback-card ml-section-anchor" id="complaints">
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
        bindFeedbackForm();
    }

    function bindFeedbackForm() {
        const form = document.getElementById("medlifeFeedbackForm");
        if (!form) return;

        form.addEventListener("submit", async event => {
            event.preventDefault();
            const button = document.getElementById("mlFeedbackSubmit");
            const status = document.getElementById("mlFeedbackStatus");
            button.disabled = true;
            button.textContent = "جاري الإرسال...";
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
                form.reset();
            } catch (error) {
                console.error("Feedback submission error:", error);
                status.className = "ml-form-status show error";
                status.textContent = error.message || "تعذر إرسال الرسالة حالياً.";
            } finally {
                button.disabled = false;
                button.textContent = "إرسال الرسالة";
            }
        });
    }

    function injectAIWidget() {
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
        let history = [];

        document.getElementById("mlAiButton").addEventListener("click", () => { panel.classList.toggle("open"); if (panel.classList.contains("open")) input.focus(); });
        document.getElementById("mlAiClose").addEventListener("click", () => panel.classList.remove("open"));

        document.getElementById("mlAiForm").addEventListener("submit", async event => {
            event.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            addAIMessage(text, "user");
            input.value = "";
            const pending = addAIMessage("جاري التفكير...", "assistant");

            try {
                const response = await fetch("/api/ai", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ message: text, language: document.documentElement.lang === "en" ? "en" : "ar", history })
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || "تعذر الحصول على رد من المساعد.");

                pending.textContent = data.answer || "لم يصل رد من المساعد.";
                history.push({ role: "user", content: text }, { role: "assistant", content: data.answer || "" });
                history = history.slice(-10);
            } catch (error) {
                console.error("MedLife AI widget error:", error);
                pending.textContent = "تعذر الاتصال بالمساعد حالياً. حاول مرة أخرى لاحقاً.";
            }
            messages.scrollTop = messages.scrollHeight;
        });

        function addAIMessage(text, role) {
            const bubble = document.createElement("div");
            bubble.className = `ml-ai-msg ${role}`;
            bubble.textContent = text;
            messages.appendChild(bubble);
            messages.scrollTop = messages.scrollHeight;
            return bubble;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            initFeaturedArticle();
            injectHomepageEnhancements();
        }, { once: true });
    } else {
        initFeaturedArticle();
        injectHomepageEnhancements();
    }

    window.addEventListener("load", () => {
        initFeaturedArticle();
        injectHomepageEnhancements();
    }, { once: true });

    document.addEventListener("DOMContentLoaded", () => {
        const photoTrack = document.getElementById("photoTrack");
        if (!photoTrack) return;

        let galleryImages = [];
        loadGallery();

        async function loadGallery() {
            showLoading();
            try {
                const response = await fetch("/api/gallery", { method: "GET", headers: { "Accept": "application/json" }, cache: "no-store" });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || "Unable to load gallery.");
                galleryImages = Array.isArray(data.images) ? data.images : [];
                if (!galleryImages.length) { showEmpty(); return; }
                renderGallery();
            } catch (error) {
                console.error("MedLife Gallery:", error);
                showError();
            }
        }

        function renderGallery() {
            photoTrack.innerHTML = "";
            galleryImages.forEach(image => photoTrack.appendChild(createPhotoCard(image)));
            galleryImages.forEach(image => photoTrack.appendChild(createPhotoCard(image, true)));
        }

        function createPhotoCard(image, duplicate = false) {
            const card = document.createElement("div");
            card.className = "photo-card";
            const img = document.createElement("img");
            img.src = image.url;
            img.alt = image.name || "MedLife";
            img.decoding = "async";
            img.loading = duplicate ? "lazy" : "eager";
            img.onerror = () => card.remove();
            card.appendChild(img);
            card.addEventListener("click", () => openLightbox(image.url, image.name));
            card.setAttribute("tabindex", "0");
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", "فتح صورة ميدلايف");
            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(image.url, image.name);
                }
            });
            return card;
        }

        function openLightbox(imageUrl, imageName) {
            let lightbox = document.getElementById("galleryLightbox");
            if (!lightbox) {
                lightbox = document.createElement("div");
                lightbox.id = "galleryLightbox";
                lightbox.className = "gallery-lightbox";
                lightbox.innerHTML = `<div class="gallery-lightbox-content"><button class="gallery-close" id="galleryClose" type="button" aria-label="Close">×</button><img id="galleryPreview" src="" alt="MedLife"><div id="galleryCaption" class="gallery-caption"></div></div>`;
                document.body.appendChild(lightbox);
                document.getElementById("galleryClose").addEventListener("click", closeLightbox);
                lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
            }
            document.getElementById("galleryPreview").src = imageUrl;
            document.getElementById("galleryPreview").alt = imageName || "MedLife Photo";
            document.getElementById("galleryCaption").textContent = imageName || "";
            lightbox.classList.add("active");
            document.body.classList.add("ai-open");
        }

        function closeLightbox() {
            const lightbox = document.getElementById("galleryLightbox");
            if (!lightbox) return;
            lightbox.classList.remove("active");
            const preview = document.getElementById("galleryPreview");
            if (preview) preview.src = "";
            document.body.classList.remove("ai-open");
        }

        function showLoading() { photoTrack.innerHTML = `<div class="gallery-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>جاري تحميل صور ميدلايف...</span></div>`; }
        function showEmpty() { photoTrack.innerHTML = `<div class="gallery-empty"><i class="fa-regular fa-images"></i><span>لا توجد صور منشورة حالياً.</span></div>`; }
        function showError() { photoTrack.innerHTML = `<div class="gallery-empty"><i class="fa-solid fa-circle-exclamation"></i><span>تعذر تحميل صور ميدلايف حالياً.</span></div>`; }
    });

})();
