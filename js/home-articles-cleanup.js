document.addEventListener("DOMContentLoaded", () => {
    removeLegacyHomepageArticles();
    setTimeout(removeLegacyHomepageArticles, 150);
    setTimeout(removeLegacyHomepageArticles, 500);
});

function removeLegacyHomepageArticles() {
    const grid = document.querySelector("#articles .article-grid");
    if (!grid) return;

    const legacyTitles = [
        "المعرفة الطبية في خدمة المجتمع",
        "التعليم الطبي والتعلم المستمر",
        "التطوع وصناعة الأثر"
    ];

    grid.querySelectorAll("article, .article-card").forEach(card => {
        const text = (card.textContent || "").replace(/\s+/g, " ").trim();

        if (legacyTitles.some(title => text.includes(title))) {
            card.remove();
            return;
        }

        const category = (card.querySelector(".article-category")?.textContent || "").trim();
        const heading = (card.querySelector("h3")?.textContent || "").trim();

        if (
            category === "Tوعية صحية" ||
            category === "Medical Education" ||
            category === "Volunteering" ||
            heading === "المعرفة الطبية في خدمة المجتمع" ||
            heading === "التعليم الطبي والتعلم المستمر" ||
            heading === "التطوع وصناعة الأثر"
        ) {
            card.remove();
        }
    });
}
