/* =========================================================
   MEDLIFE ARTICLES
   Public Articles Page
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const articlesContainer =
        document.getElementById("articlesContainer");

    const articlesLoading =
        document.getElementById("articlesLoading");

    const articlesEmpty =
        document.getElementById("articlesEmpty");

    const articlesError =
        document.getElementById("articlesError");

    const searchInput =
        document.getElementById("articleSearch");

    const categoryFilter =
        document.getElementById("categoryFilter");


    let articles = [];


    /* =====================================================
       LOAD ARTICLES
    ===================================================== */

    loadArticles();


    async function loadArticles() {

        showLoading();

        try {

            const response =
                await fetch(
                    "/api/articles",
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


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to load articles."
                );

            }


            articles =
                Array.isArray(data.articles)
                    ? data.articles
                    : Array.isArray(data)
                        ? data
                        : [];


            /*
             * The API already returns only published
             * articles for public visitors.
             *
             * We keep a second safety filter here
             * using the correct database status:
             *
             * published
             */

            articles =
                articles.filter(
                    article =>
                        String(
                            article.status || ""
                        ).toLowerCase() ===
                        "published"
                );


            populateCategories();

            renderArticles();


        } catch (error) {

            console.error(
                "MedLife articles error:",
                error
            );


            showError();

        }

    }


    /* =====================================================
       RENDER ARTICLES
    ===================================================== */

    function renderArticles() {

        if (!articlesContainer) {
            return;
        }


        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const category =
            categoryFilter
                ? categoryFilter.value
                : "all";


        const filtered =
            articles.filter(
                article => {

                    /* Category */

                    if (
                        category !== "all" &&
                        String(
                            article.category || ""
                        ) !== category
                    ) {

                        return false;
                    }


                    /* Search */

                    if (!search) {
                        return true;
                    }


                    const title =
                        String(
                            article.title_ar ||
                            article.title_en ||
                            ""
                        ).toLowerCase();


                    const excerpt =
                        String(
                            article.excerpt_ar ||
                            article.excerpt_en ||
                            ""
                        ).toLowerCase();


                    const author =
                        String(
                            article.author_name ||
                            ""
                        ).toLowerCase();


                    return (
                        title.includes(search) ||
                        excerpt.includes(search) ||
                        author.includes(search)
                    );

                }
            );


        hideLoading();


        if (articlesEmpty) {

            articlesEmpty.style.display =
                filtered.length === 0
                    ? "block"
                    : "none";

        }


        if (filtered.length === 0) {

            articlesContainer.innerHTML = "";

            return;

        }


        articlesContainer.innerHTML =
            filtered
                .map(
                    article =>
                        createArticleCard(
                            article
                        )
                )
                .join("");

    }


    /* =====================================================
       ARTICLE CARD
    ===================================================== */

    function createArticleCard(article) {

        const id =
            article.id;


        const title =
            escapeHTML(
                article.title_ar ||
                article.title_en ||
                "بدون عنوان"
            );


        const excerpt =
            escapeHTML(
                article.excerpt_ar ||
                article.excerpt_en ||
                "اضغط لقراءة المقال كاملاً."
            );


        const category =
            escapeHTML(
                article.category ||
                "Medical Knowledge"
            );


        const author =
            escapeHTML(
                article.author_name ||
                "MedLife"
            );


        const date =
            formatDate(
                article.created_at
            );


        /* =================================================
           IMAGE
        ================================================= */

        const image =
            article.image_url
                ? escapeAttribute(
                    article.image_url
                )
                : "";


        const imageHTML =
            image

                ? `
                    <img
                        src="${image}"
                        alt="${title}"
                        loading="lazy"
                        onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;article-placeholder&quot;><i class=&quot;fa-solid fa-book-medical&quot;></i></div>';">
                  `

                : `
                    <div class="article-placeholder">

                        <i
                            class="fa-solid fa-book-medical">
                        </i>

                    </div>
                  `;


        return `

            <article
                class="public-article-card">


                <a
                    href="article.html?id=${encodeURIComponent(id)}"
                    class="article-image">

                    ${imageHTML}

                </a>


                <div
                    class="public-article-content">


                    <div
                        class="public-article-category">

                        ${category}

                    </div>


                    <h3>

                        <a
                            href="article.html?id=${encodeURIComponent(id)}">

                            ${title}

                        </a>

                    </h3>


                    <p>

                        ${excerpt}

                    </p>


                    <div
                        class="public-article-meta">


                        <span>

                            <i
                                class="fa-solid fa-user">
                            </i>

                            ${author}

                        </span>


                        <span>

                            <i
                                class="fa-regular fa-calendar">
                            </i>

                            ${date}

                        </span>


                    </div>


                    <a
                        href="article.html?id=${encodeURIComponent(id)}"
                        class="public-article-link">

                        اقرأ المقال

                        <i
                            class="fa-solid fa-arrow-left">
                        </i>

                    </a>


                </div>


            </article>

        `;

    }


    /* =====================================================
       CATEGORIES
    ===================================================== */

    function populateCategories() {

        if (!categoryFilter) {
            return;
        }


        const categories =
            [
                ...new Set(
                    articles
                        .map(
                            article =>
                                String(
                                    article.category || ""
                                ).trim()
                        )
                        .filter(Boolean)
                )
            ];


        categoryFilter.innerHTML = `

            <option value="all">
                جميع التصنيفات
            </option>

            ${
                categories
                    .map(
                        category => `

                            <option
                                value="${escapeAttribute(
                                    category
                                )}">

                                ${escapeHTML(
                                    category
                                )}

                            </option>

                        `
                    )
                    .join("")
            }

        `;

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderArticles
        );

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            renderArticles
        );

    }


    /* =====================================================
       LOADING STATE
    ===================================================== */

    function showLoading() {

        if (articlesLoading) {

            articlesLoading.style.display =
                "flex";

        }


        if (articlesEmpty) {

            articlesEmpty.style.display =
                "none";

        }


        if (articlesError) {

            articlesError.style.display =
                "none";

        }

    }


    function hideLoading() {

        if (articlesLoading) {

            articlesLoading.style.display =
                "none";

        }

    }


    /* =====================================================
       ERROR STATE
    ===================================================== */

    function showError() {

        hideLoading();


        if (articlesEmpty) {

            articlesEmpty.style.display =
                "none";

        }


        if (articlesError) {

            articlesError.style.display =
                "block";

        }


        if (articlesContainer) {

            articlesContainer.innerHTML =
                "";

        }

    }


    /* =====================================================
       DATE
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return date.toLocaleDateString(
            "ar-SY",
            {
                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"
            }
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    /* =====================================================
       ESCAPE ATTRIBUTE
    ===================================================== */

    function escapeAttribute(value) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

    }

});
