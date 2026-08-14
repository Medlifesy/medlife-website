/* =========================================================
   MEDLIFE ARTICLES — Public Articles Page
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const articlesContainer = document.getElementById("articlesContainer");
    const articlesLoading = document.getElementById("articlesLoading");
    const articlesEmpty = document.getElementById("articlesEmpty");
    const articlesError = document.getElementById("articlesError");
    const searchInput = document.getElementById("articleSearch");
    const categoryFilter = document.getElementById("categoryFilter");

    const staticArticles = [
        {
            id: "tension-headache",
            title_ar: "صداع التوتر: رحلتك نحو الراحة",
            title_en: "Tension-Type Headache: Your Journey to Relief",
            excerpt_ar: "تعرف على صداع التوتر، أسبابه وأعراضه وعلامات الخطر والعلاج المتكامل وطرق الوقاية.",
            author_name: "الصيدلانية دلع باسل العباس",
            category: "توعية صحية",
            image_url: "",
            status: "published",
            created_at: "2026-08-14T00:00:00",
            url: "articles/tension-headache.html",
            icon: "fa-head-side-virus"
        },
        {
            id: "endometriosis-endotest-endosure",
            title_ar: "الاختبارات التشخيصية الحديثة وغير الباضعة للانتباذ البطاني الرحمي",
            title_en: "Modern Non-Invasive Diagnostic Tests for Endometriosis",
            excerpt_ar: "Global Journal Club يناقش Endotest وEndoSure، مع قراءة نقدية للدليل العلمي والدقة التشخيصية والفائدة السريرية.",
            author_name: "د. أمين نحاس",
            category: "Global Journal Club",
            image_url: "",
            status: "published",
            created_at: "2026-08-14T00:00:00",
            url: "articles/endometriosis-endotest-endosure.html",
            icon: "fa-microscope"
        }
    ];

    let articles = [];

    loadArticles();

    async function loadArticles() {
        showLoading();

        try {
            const response = await fetch("/api/articles", {
                method: "GET",
                headers: { Accept: "application/json" },
                cache: "no-store"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to load articles.");
            }

            const remoteArticles = Array.isArray(data.articles)
                ? data.articles.filter(article => String(article.status || "").toLowerCase() === "published")
                : [];

            const remoteIds = new Set(remoteArticles.map(article => String(article.id)));
            const staticsToAdd = staticArticles.filter(article => !remoteIds.has(String(article.id)));

            articles = [...staticsToAdd, ...remoteArticles];
            populateCategories();
            renderArticles();

        } catch (error) {
            console.error("MedLife articles error:", error);
            articles = [...staticArticles];
            populateCategories();
            renderArticles();
        }
    }

    function renderArticles() {
        if (!articlesContainer) return;

        const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const category = categoryFilter ? categoryFilter.value : "all";

        const filtered = articles.filter(article => {
            if (category !== "all" && String(article.category || "") !== category) {
                return false;
            }

            if (!search) return true;

            const title = String(article.title_ar || article.title_en || "").toLowerCase();
            const excerpt = String(article.excerpt_ar || article.excerpt_en || "").toLowerCase();
            const author = String(article.author_name || "").toLowerCase();

            return title.includes(search) || excerpt.includes(search) || author.includes(search);
        });

        hideLoading();

        if (articlesEmpty) {
            articlesEmpty.style.display = filtered.length === 0 ? "block" : "none";
        }

        articlesContainer.innerHTML = filtered.map(createArticleCard).join("");
    }

    function createArticleCard(article) {
        const title = escapeHTML(article.title_ar || article.title_en || "بدون عنوان");
        const excerpt = escapeHTML(article.excerpt_ar || article.excerpt_en || "اضغط لقراءة المقال كاملاً.");
        const category = escapeHTML(article.category || "Medical Knowledge");
        const author = escapeHTML(article.author_name || "MedLife");
        const date = formatDate(article.created_at);
        const image = article.image_url ? escapeAttribute(article.image_url) : "";
        const url = article.url || `article.html?id=${encodeURIComponent(article.id)}`;
        const icon = escapeAttribute(article.icon || "fa-book-medical");

        const imageHTML = image
            ? `<img src="${image}" alt="${title}" loading="lazy">`
            : `<div class="article-placeholder"><i class="fa-solid ${icon}"></i></div>`;

        return `
            <article class="public-article-card">
                <a href="${url}" class="article-image">
                    ${imageHTML}
                </a>
                <div class="public-article-content">
                    <div class="public-article-category">${category}</div>
                    <h3><a href="${url}">${title}</a></h3>
                    <p>${excerpt}</p>
                    <div class="public-article-meta">
                        <span><i class="fa-solid fa-user"></i>${author}</span>
                        <span><i class="fa-regular fa-calendar"></i>${date}</span>
                    </div>
                    <a href="${url}" class="public-article-link">
                        اقرأ المقال <i class="fa-solid fa-arrow-left"></i>
                    </a>
                </div>
            </article>
        `;
    }

    function populateCategories() {
        if (!categoryFilter) return;

        const categories = [...new Set(
            articles
                .map(article => String(article.category || "").trim())
                .filter(Boolean)
        )];

        categoryFilter.innerHTML = `
            <option value="all">جميع التصنيفات</option>
            ${categories.map(category => `
                <option value="${escapeAttribute(category)}">${escapeHTML(category)}</option>
            `).join("")}
        `;
    }

    if (searchInput) searchInput.addEventListener("input", renderArticles);
    if (categoryFilter) categoryFilter.addEventListener("change", renderArticles);

    function showLoading() {
        if (articlesLoading) articlesLoading.style.display = "flex";
        if (articlesEmpty) articlesEmpty.style.display = "none";
        if (articlesError) articlesError.style.display = "none";
    }

    function hideLoading() {
        if (articlesLoading) articlesLoading.style.display = "none";
    }

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString("ar-SY", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
});
