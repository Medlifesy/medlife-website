/**
 * MedLife Dynamic Gallery
 *
 * Loads all images from:
 * /api/gallery
 *
 * and displays them inside:
 * #photoTrack
 */

document.addEventListener("DOMContentLoaded", () => {

    const photoTrack =
        document.getElementById("photoTrack");

    if (!photoTrack) {
        return;
    }


    const currentLanguage =
        localStorage.getItem("medlifeLanguage") || "ar";


    loadGallery();


    async function loadGallery() {

        try {

            const response =
                await fetch(
                    "/api/gallery",
                    {
                        method: "GET",
                        headers: {
                            "Accept":
                                "application/json"
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
                    "Gallery request failed."
                );
            }


            const images =
                Array.isArray(data.images)
                    ? data.images
                    : [];


            photoTrack.innerHTML = "";


            if (images.length === 0) {

                showEmptyGallery();

                return;
            }


            /*
             * Create the first image set.
             */
            images.forEach(
                image => {

                    createPhotoCard(
                        image,
                        photoTrack
                    );

                }
            );


            /*
             * Duplicate the images.
             *
             * This is what allows the CSS animation
             * to create a continuous scrolling effect.
             */
            images.forEach(
                image => {

                    createPhotoCard(
                        image,
                        photoTrack,
                        true
                    );

                }
            );


            /*
             * Re-apply the current language
             * to dynamically generated elements.
             */
            updateGalleryLanguage();


        } catch (error) {

            console.error(
                "MedLife Gallery Error:",
                error
            );


            showGalleryError();

        }
    }


    /**
     * Create one photo card.
     */
    function createPhotoCard(
        image,
        container,
        duplicate = false
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "photo-card";


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
            currentLanguage === "en"
                ? "Open MedLife photo"
                : "فتح صورة من ميدلايف"
        );


        const img =
            document.createElement(
                "img"
            );


        img.src =
            image.url;


        img.alt =
            currentLanguage === "en"
                ? "MedLife activity"
                : "نشاط من ميدلايف";


        /*
         * Don't lazy-load the duplicated
         * first visible images too aggressively.
         */
        img.loading =
            duplicate
                ? "lazy"
                : "eager";


        img.decoding =
            "async";


        /*
         * Accessibility / fallback.
         */
        img.onerror =
            () => {

                card.remove();

            };


        card.appendChild(
            img
        );


        /*
         * Open image when clicked.
         */
        card.addEventListener(
            "click",
            () => {

                openGalleryPreview(
                    image.url
                );

            }
        );


        /*
         * Keyboard support.
         */
        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    openGalleryPreview(
                        image.url
                    );

                }

            }
        );


        container.appendChild(
            card
        );
    }


    /**
     * Open image preview.
     *
     * Creates the Lightbox dynamically,
     * so no extra HTML is required.
     */
    function openGalleryPreview(
        imageUrl
    ) {

        let lightbox =
            document.getElementById(
                "galleryLightbox"
            );


        /*
         * Create Lightbox if it doesn't exist.
         */
        if (!lightbox) {

            lightbox =
                document.createElement(
                    "div"
                );


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
                        aria-label="Close image">

                        ×

                    </button>

                    <img
                        id="galleryPreview"
                        src=""
                        alt="MedLife">

                </div>

            `;


            document.body.appendChild(
                lightbox
            );


            const closeButton =
                document.getElementById(
                    "galleryClose"
                );


            closeButton.addEventListener(
                "click",
                closeGallery
            );


            lightbox.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        lightbox
                    ) {

                        closeGallery();

                    }

                }
            );
        }


        const preview =
            document.getElementById(
                "galleryPreview"
            );


        preview.src =
            imageUrl;


        preview.alt =
            currentLanguage === "en"
                ? "MedLife Photo"
                : "صورة من ميدلايف";


        lightbox.classList.add(
            "active"
        );


        document.body.classList.add(
            "ai-open"
        );
    }


    /**
     * Close Lightbox.
     */
    function closeGallery() {

        const lightbox =
            document.getElementById(
                "galleryLightbox"
            );


        const preview =
            document.getElementById(
                "galleryPreview"
            );


        if (!lightbox) {
            return;
        }


        lightbox.classList.remove(
            "active"
        );


        if (preview) {

            preview.src =
                "";

        }


        document.body.classList.remove(
            "ai-open"
        );
    }


    /**
     * Empty state.
     */
    function showEmptyGallery() {

        photoTrack.innerHTML = `

            <div class="gallery-empty">

                <i class="fa-regular fa-images"></i>

                <span>

                    ${
                        currentLanguage === "en"
                            ? "No photos available yet."
                            : "لا توجد صور منشورة حالياً."
                    }

                </span>

            </div>

        `;
    }


    /**
     * Error state.
     */
    function showGalleryError() {

        photoTrack.innerHTML = `

            <div class="gallery-empty">

                <i class="fa-solid fa-circle-exclamation"></i>

                <span>

                    ${
                        currentLanguage === "en"
                            ? "Unable to load MedLife photos."
                            : "تعذر تحميل صور ميدلايف حالياً."
                    }

                </span>

            </div>

        `;
    }


    /**
     * Update dynamically created gallery text.
     */
    function updateGalleryLanguage() {

        document.querySelectorAll(
            ".photo-card"
        ).forEach(
            card => {

                card.setAttribute(
                    "aria-label",
                    currentLanguage === "en"
                        ? "Open MedLife photo"
                        : "فتح صورة من ميدلايف"
                );


                const img =
                    card.querySelector(
                        "img"
                    );


                if (img) {

                    img.alt =
                        currentLanguage === "en"
                            ? "MedLife activity"
                            : "نشاط من ميدلايف";

                }

            }
        );
    }


    /**
     * Listen for language changes.
     */
    window.addEventListener(
        "medlifeLanguageChanged",
        event => {

            if (
                event.detail &&
                event.detail.language
            ) {

                updateGalleryLanguage();

            }

        }
    );


    /**
     * Escape closes the image preview.
     */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeGallery();

            }

        }
    );

});
