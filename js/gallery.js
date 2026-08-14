/* =========================================================
   MEDLIFE DYNAMIC GALLERY + FEATURED ARTICLE
========================================================= */

(function () {

    function addFeaturedArticle() {

        const articleGrid =
            document.querySelector("#articles .article-grid");

        if (!articleGrid) {
            return false;
        }

        if (
            document.getElementById(
                "tension-headache-home-article"
            )
        ) {
            return true;
        }

        const card = document.createElement("article");

        card.id =
            "tension-headache-home-article";

        card.className =
            "article-card reveal show";

        card.innerHTML = `

            <div class="article-top">

                <i class="fa-solid fa-head-side-virus"></i>

            </div>

            <div class="article-body">

                <div
                    class="article-category"
                    data-ar="توعية صحية"
                    data-en="Health Awareness"
                >
                    توعية صحية
                </div>

                <h3
                    data-ar="صداع التوتر: رحلتك نحو الراحة"
                    data-en="Tension-Type Headache: Your Journey to Relief"
                >
                    صداع التوتر: رحلتك نحو الراحة
                </h3>

                <p
                    data-ar="تعرف على صداع التوتر، أسبابه وأعراضه، علامات الخطر، العلاج المتكامل وطرق الوقاية."
                    data-en="Learn about tension-type headache, its symptoms, warning signs, integrated treatment and prevention."
                >
                    تعرف على صداع التوتر، أسبابه وأعراضه، علامات الخطر، العلاج المتكامل وطرق الوقاية.
                </p>

                <a
                    href="articles/tension-headache.html"
                    class="article-link"
                    data-ar="اقرأ المقال ←"
                    data-en="Read the article →"
                >
                    اقرأ المقال ←
                </a>

            </div>

        `;

        articleGrid.insertBefore(
            card,
            articleGrid.firstElementChild
        );

        return true;
    }


    function initFeaturedArticle() {

        if (addFeaturedArticle()) {
            return;
        }

        setTimeout(
            addFeaturedArticle,
            300
        );

        setTimeout(
            addFeaturedArticle,
            1000
        );

        setTimeout(
            addFeaturedArticle,
            2000
        );
    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initFeaturedArticle,
            { once: true }
        );

    } else {

        initFeaturedArticle();

    }


    window.addEventListener(
        "load",
        initFeaturedArticle,
        { once: true }
    );


    /* =========================================================
       GALLERY
    ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            const photoTrack =
                document.getElementById(
                    "photoTrack"
                );

            if (!photoTrack) {
                return;
            }

            let galleryImages = [];

            loadGallery();


            async function loadGallery() {

                showLoading();

                try {

                    const response =
                        await fetch(
                            "/api/gallery",
                            {
                                method: "GET",
                                headers: {
                                    "Accept": "application/json"
                                },
                                cache: "no-store"
                            }
                        );

                    const data =
                        await response.json();

                    if (
                        !response.ok ||
                        !data.success
                    ) {
                        throw new Error(
                            data.error ||
                            "Unable to load gallery."
                        );
                    }

                    galleryImages =
                        Array.isArray(
                            data.images
                        )
                            ? data.images
                            : [];

                    if (!galleryImages.length) {
                        showEmpty();
                        return;
                    }

                    renderGallery();

                } catch (error) {

                    console.error(
                        "MedLife Gallery:",
                        error
                    );

                    showError();
                }
            }


            function renderGallery() {

                photoTrack.innerHTML = "";

                galleryImages.forEach(
                    image => {
                        photoTrack.appendChild(
                            createPhotoCard(image)
                        );
                    }
                );

                galleryImages.forEach(
                    image => {
                        photoTrack.appendChild(
                            createPhotoCard(
                                image,
                                true
                            )
                        );
                    }
                );
            }


            function createPhotoCard(
                image,
                duplicate = false
            ) {

                const card =
                    document.createElement("div");

                card.className =
                    "photo-card";

                const img =
                    document.createElement("img");

                img.src =
                    image.url;

                img.alt =
                    image.name || "MedLife";

                img.decoding =
                    "async";

                img.loading =
                    duplicate
                        ? "lazy"
                        : "eager";

                img.onerror = () => {
                    card.remove();
                };

                card.appendChild(img);

                card.addEventListener(
                    "click",
                    () => {
                        openLightbox(
                            image.url,
                            image.name
                        );
                    }
                );

                card.setAttribute(
                    "tabindex",
                    "0"
                );

                card.setAttribute(
                    "role",
                    "button"
                );

                card.setAttribute(
                    "aria-label",
                    "فتح صورة ميدلايف"
                );

                card.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                            openLightbox(
                                image.url,
                                image.name
                            );
                        }
                    }
                );

                return card;
            }


            function openLightbox(
                imageUrl,
                imageName
            ) {

                let lightbox =
                    document.getElementById(
                        "galleryLightbox"
                    );

                if (!lightbox) {

                    lightbox =
                        document.createElement("div");

                    lightbox.id =
                        "galleryLightbox";

                    lightbox.className =
                        "gallery-lightbox";

                    lightbox.innerHTML = `

                        <div class="gallery-lightbox-content">

                            <button
                                class="gallery-close"
                                id="galleryClose"
                                type="button"
                                aria-label="Close"
                            >
                                ×
                            </button>

                            <img
                                id="galleryPreview"
                                src=""
                                alt="MedLife"
                            >

                            <div
                                id="galleryCaption"
                                class="gallery-caption"
                            ></div>

                        </div>

                    `;

                    document.body.appendChild(
                        lightbox
                    );

                    document
                        .getElementById(
                            "galleryClose"
                        )
                        .addEventListener(
                            "click",
                            closeLightbox
                        );

                    lightbox.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target ===
                                lightbox
                            ) {
                                closeLightbox();
                            }
                        }
                    );
                }

                const preview =
                    document.getElementById(
                        "galleryPreview"
                    );

                const caption =
                    document.getElementById(
                        "galleryCaption"
                    );

                preview.src =
                    imageUrl;

                preview.alt =
                    imageName ||
                    "MedLife Photo";

                if (
                    caption &&
                    imageName
                ) {
                    caption.textContent =
                        imageName;
                }

                lightbox.classList.add(
                    "active"
                );

                document.body.classList.add(
                    "ai-open"
                );
            }


            function closeLightbox() {

                const lightbox =
                    document.getElementById(
                        "galleryLightbox"
                    );

                const preview =
                    document.getElementById(
                        "galleryPreview"
                    );

                const caption =
                    document.getElementById(
                        "galleryCaption"
                    );

                if (!lightbox) {
                    return;
                }

                lightbox.classList.remove(
                    "active"
                );

                if (preview) {
                    preview.src = "";
                }

                if (caption) {
                    caption.textContent = "";
                }

                document.body.classList.remove(
                    "ai-open"
                );
            }


            function showLoading() {

                photoTrack.innerHTML = `

                    <div class="gallery-loading">

                        <i class="fa-solid fa-spinner fa-spin"></i>

                        <span>
                            جاري تحميل صور ميدلايف...
                        </span>

                    </div>

                `;
            }


            function showEmpty() {

                photoTrack.innerHTML = `

                    <div class="gallery-empty">

                        <i class="fa-regular fa-images"></i>

                        <span>
                            لا توجد صور منشورة حالياً.
                        </span>

                    </div>

                `;
            }


            function showError() {

                photoTrack.innerHTML = `

                    <div class="gallery-empty">

                        <i class="fa-solid fa-circle-exclamation"></i>

                        <span>
                            تعذر تحميل صور ميدلايف حالياً.
                        </span>

                    </div>

                `;
            }

        }
    );


})();
