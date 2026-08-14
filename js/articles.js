/* =========================================================
   MEDLIFE — PUBLIC ARTICLES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadArticles();

});


async function loadArticles() {

    const container =
        document.querySelector(".article-grid");


    if (!container) return;


    try {

        const response =
            await fetch("/api/articles");


        if (!response.ok) {
            throw new Error("Failed to load articles");
        }


        const data =
            await response.json();


        const articles =
            data.articles || [];


        if (!articles.length) {

            container.innerHTML = `
                <div class="articles-empty">
                    <i class="fa-solid fa-book-open"></i>

                    <h3>
                        لا توجد مقالات منشورة حالياً
                    </h3>

                    <p>
                        سيتم نشر المقالات الجديدة بعد مراجعتها واعتمادها من فريق ميدلايف.
                    </p>
                </div>
            `;

            return;
        }


        container.innerHTML =
            articles
                .map(article => createArticleCard(article))
                .join("");


    } catch (error) {

        console.error(
            "Articles error:",
            error
        );

        container.innerHTML = `
            <div class="articles-empty">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h3>
                    تعذر تحميل المقالات
                </h3>

                <p>
                    يرجى المحاولة لاحقاً.
                </p>

            </div>
        `;
    }
}


/* =========================================================
   ARTICLE CARD
========================================================= */

function createArticleCard(article) {

    const image =
        article.image_url
            ? `
                <img
                    src="${escapeHTML(article.image_url)}"
                    alt="${escapeHTML(article.title_ar)}">
              `
            : `
                <div class="article-top">
                    <i class="fa-solid fa-book-medical"></i>
                </div>
              `;


    return `
        <article class="article-card reveal">

            ${image}

            <div class="article-body">

                <div class="article-category">

                    ${getCategoryName(article.category)}

                </div>


                <h3>

                    ${escapeHTML(article.title_ar)}

                </h3>


                <p>

                    ${escapeHTML(
                        article.excerpt_ar || ""
                    )}

                </p>


                <a
                    href="article.html?id=${article.id}"
                    class="article-link">

                    قراءة المقال ←

                </a>

            </div>

        </article>
    `;
}


/* =========================================================
   CATEGORY
========================================================= */

function getCategoryName(category) {

    const categories = {

        "health-awareness":
            "توعية صحية",

        "medical-education":
            "تعليم طبي",

        "research":
            "أبحاث",

        "volunteering":
            "تطوع",

        "humanitarian":
            "إنساني",

        "other":
            "أخرى"
    };


    return categories[category] || "مقالات";
}


/* =========================================================
   BASIC HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
