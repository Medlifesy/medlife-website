/* =========================================================
   MEDLIFE ADMIN DASHBOARD
   js/admin.js
   ========================================================= */

"use strict";


/* =========================================================
   1. ADMIN STATE
========================================================= */

const AdminState = {

    currentSection: "dashboard",

    currentFilter: "all",

    searchQuery: "",

    selectedArticleId: null,

    articles: [

        {
            id: 1,
            title: "أهمية التوعية الصحية في المجتمع",
            author: "د. أحمد محمد",
            category: "health",
            status: "pending",
            date: "2026-08-14",
            excerpt:
                "مقال توعوي حول أهمية نشر الثقافة الصحية والوقاية من الأمراض."
        },

        {
            id: 2,
            title: "دور الشباب في العمل التطوعي",
            author: "سارة علي",
            category: "volunteering",
            status: "approved",
            date: "2026-08-12",
            excerpt:
                "كيف يمكن للشباب أن يكونوا جزءاً فعالاً من المبادرات المجتمعية."
        },

        {
            id: 3,
            title: "أساسيات الإسعافات الأولية",
            author: "د. خالد أحمد",
            category: "education",
            status: "pending",
            date: "2026-08-10",
            excerpt:
                "مجموعة من المبادئ الأساسية التي يجب معرفتها في الإسعافات الأولية."
        },

        {
            id: 4,
            title: "الصحة النفسية وأهمية الدعم المجتمعي",
            author: "د. نور حسن",
            category: "health",
            status: "rejected",
            date: "2026-08-08",
            excerpt:
                "مقال يناقش أهمية الدعم النفسي والاجتماعي داخل المجتمع."
        }

    ]

};


/* =========================================================
   2. DOM HELPERS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));


/* =========================================================
   3. INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initSidebar();

    initNavigation();

    initFilters();

    initSearch();

    initModals();

    initNotifications();

    initArticleActions();

    initDashboard();

    renderArticles();

    updateStatistics();

});


/* =========================================================
   4. SIDEBAR
========================================================= */

function initSidebar() {

    const menuToggle =
        $("#adminMenuToggle");

    const sidebar =
        $(".admin-sidebar");

    const overlay =
        $(".sidebar-overlay");

    const closeButton =
        $(".sidebar-close");


    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("active");

            if (overlay) {
                overlay.classList.toggle("active");
            }

            menuToggle.setAttribute(
                "aria-expanded",
                sidebar.classList.contains("active")
            );

        });

    }


    if (closeButton) {

        closeButton.addEventListener("click", closeSidebar);

    }


    if (overlay) {

        overlay.addEventListener("click", closeSidebar);

    }


    function closeSidebar() {

        if (sidebar) {
            sidebar.classList.remove("active");
        }

        if (overlay) {
            overlay.classList.remove("active");
        }

        if (menuToggle) {

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }

}


/* =========================================================
   5. NAVIGATION
========================================================= */

function initNavigation() {

    const navLinks =
        $$("[data-admin-section]");


    navLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const section =
                link.dataset.adminSection;

            if (!section) return;

            switchSection(section);

        });

    });

}


function switchSection(sectionName) {

    AdminState.currentSection =
        sectionName;


    /*
       Sidebar active state
    */

    $$("[data-admin-section]")
        .forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.adminSection === sectionName
            );

        });


    /*
       Sections
    */

    $$(".admin-section")
        .forEach(section => {

            const isActive =
                section.dataset.section === sectionName;

            section.classList.toggle(
                "active",
                isActive
            );

        });


    /*
       Page title
    */

    updatePageTitle(sectionName);


    /*
       Close mobile sidebar
    */

    const sidebar =
        $(".admin-sidebar");

    const overlay =
        $(".sidebar-overlay");

    if (window.innerWidth <= 900) {

        sidebar?.classList.remove("active");

        overlay?.classList.remove("active");

    }


    /*
       Scroll to top
    */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function updatePageTitle(sectionName) {

    const title =
        $("#adminPageTitle");

    if (!title) return;


    const titles = {

        dashboard: "لوحة التحكم",

        articles: "إدارة المقالات",

        pending: "المقالات قيد المراجعة",

        approved: "المقالات المنشورة",

        rejected: "المقالات المرفوضة",

        volunteers: "المتطوعون",

        users: "الأعضاء",

        settings: "الإعدادات"

    };


    title.textContent =
        titles[sectionName] ||
        "لوحة التحكم";

}


/* =========================================================
   6. DASHBOARD
========================================================= */

function initDashboard() {

    const refreshButton =
        $("#refreshDashboard");

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            () => {

                updateStatistics();

                renderArticles();

                showNotification(
                    "تم تحديث لوحة التحكم",
                    "success"
                );

            }
        );

    }

}


function updateStatistics() {

    const total =
        AdminState.articles.length;

    const pending =
        AdminState.articles.filter(
            article => article.status === "pending"
        ).length;

    const approved =
        AdminState.articles.filter(
            article => article.status === "approved"
        ).length;

    const rejected =
        AdminState.articles.filter(
            article => article.status === "rejected"
        ).length;


    updateElement(
        "#totalArticles",
        total
    );

    updateElement(
        "#pendingArticles",
        pending
    );

    updateElement(
        "#approvedArticles",
        approved
    );

    updateElement(
        "#rejectedArticles",
        rejected
    );

}


function updateElement(selector, value) {

    const element =
        $(selector);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   7. ARTICLE FILTERS
========================================================= */

function initFilters() {

    const filterButtons =
        $$("[data-article-filter]");


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            AdminState.currentFilter =
                button.dataset.articleFilter ||
                "all";


            filterButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            button.classList.add("active");

            renderArticles();

        });

    });

}


/* =========================================================
   8. ARTICLE SEARCH
========================================================= */

function initSearch() {

    const searchInput =
        $("#articleSearch");


    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        event => {

            AdminState.searchQuery =
                event.target.value
                    .trim()
                    .toLowerCase();

            renderArticles();

        }
    );

}


/* =========================================================
   9. ARTICLE RENDERING
========================================================= */

function renderArticles() {

    const containers =
        $$("[data-articles-container]");


    if (!containers.length) return;


    let articles =
        [...AdminState.articles];


    /*
       Filter
    */

    if (
        AdminState.currentFilter !== "all"
    ) {

        articles =
            articles.filter(
                article =>
                    article.status ===
                    AdminState.currentFilter
            );

    }


    /*
       Search
    */

    if (AdminState.searchQuery) {

        articles =
            articles.filter(article => {

                const searchable = [

                    article.title,

                    article.author,

                    article.excerpt,

                    article.category

                ]
                    .join(" ")
                    .toLowerCase();


                return searchable.includes(
                    AdminState.searchQuery
                );

            });

    }


    containers.forEach(container => {

        container.innerHTML = "";


        if (!articles.length) {

            container.innerHTML = `

                <div class="admin-empty-state">

                    <div class="admin-empty-icon">

                        <i class="fa-solid fa-file-circle-xmark"></i>

                    </div>

                    <h3>
                        لا توجد مقالات
                    </h3>

                    <p>
                        لا توجد نتائج مطابقة للبحث أو الفلتر الحالي.
                    </p>

                </div>

            `;

            return;

        }


        articles.forEach(article => {

            container.appendChild(
                createArticleCard(article)
            );

        });

    });

}


/* =========================================================
   10. ARTICLE CARD
========================================================= */

function createArticleCard(article) {

    const card =
        document.createElement("article");

    card.className =
        "admin-article-card";

    card.dataset.articleId =
        article.id;


    const status =
        getStatusData(article.status);


    const category =
        getCategoryName(article.category);


    card.innerHTML = `

        <div class="admin-article-main">

            <div class="admin-article-category">
                ${escapeHTML(category)}
            </div>

            <h3 class="admin-article-title">
                ${escapeHTML(article.title)}
            </h3>

            <p class="admin-article-excerpt">
                ${escapeHTML(article.excerpt)}
            </p>

            <div class="admin-article-meta">

                <span>
                    <i class="fa-solid fa-user"></i>
                    ${escapeHTML(article.author)}
                </span>

                <span>
                    <i class="fa-regular fa-calendar"></i>
                    ${formatDate(article.date)}
                </span>

            </div>

        </div>


        <div class="admin-article-side">

            <span
                class="article-status ${status.className}">
                ${status.icon}
                ${status.label}
            </span>


            <div class="admin-article-actions">

                <button
                    type="button"
                    class="admin-action-btn view"
                    data-action="view"
                    data-id="${article.id}"
                    title="عرض">

                    <i class="fa-solid fa-eye"></i>

                </button>


                ${
                    article.status === "pending"
                    ? `

                    <button
                        type="button"
                        class="admin-action-btn approve"
                        data-action="approve"
                        data-id="${article.id}"
                        title="موافقة">

                        <i class="fa-solid fa-check"></i>

                    </button>

                    <button
                        type="button"
                        class="admin-action-btn reject"
                        data-action="reject"
                        data-id="${article.id}"
                        title="رفض">

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                    `
                    : ""
                }


                <button
                    type="button"
                    class="admin-action-btn delete"
                    data-action="delete"
                    data-id="${article.id}"
                    title="حذف">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;


    return card;

}


/* =========================================================
   11. ARTICLE ACTIONS
========================================================= */

function initArticleActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) return;


            const action =
                button.dataset.action;

            const id =
                Number(button.dataset.id);


            if (!id) return;


            switch (action) {

                case "view":
                    viewArticle(id);
                    break;

                case "approve":
                    approveArticle(id);
                    break;

                case "reject":
                    rejectArticle(id);
                    break;

                case "delete":
                    deleteArticle(id);
                    break;

            }

        }
    );

}


/* =========================================================
   12. VIEW ARTICLE
========================================================= */

function viewArticle(id) {

    const article =
        findArticle(id);


    if (!article) return;


    AdminState.selectedArticleId =
        id;


    const modal =
        $("#articleModal");


    if (!modal) {

        showNotification(
            article.title,
            "info"
        );

        return;

    }


    const title =
        modal.querySelector(
            "[data-modal-title]"
        );

    const content =
        modal.querySelector(
            "[data-modal-content]"
        );


    if (title) {

        title.textContent =
            article.title;

    }


    if (content) {

        content.innerHTML = `

            <div class="article-preview-meta">

                <span>
                    <strong>الكاتب:</strong>
                    ${escapeHTML(article.author)}
                </span>

                <span>
                    <strong>التصنيف:</strong>
                    ${escapeHTML(
                        getCategoryName(article.category)
                    )}
                </span>

                <span>
                    <strong>التاريخ:</strong>
                    ${formatDate(article.date)}
                </span>

            </div>

            <p>
                ${escapeHTML(article.excerpt)}
            </p>

        `;

    }


    openModal(modal);

}


/* =========================================================
   13. APPROVE ARTICLE
========================================================= */

function approveArticle(id) {

    const article =
        findArticle(id);


    if (!article) return;


    article.status =
        "approved";


    renderArticles();

    updateStatistics();


    showNotification(
        "تمت الموافقة على المقال ونشره بنجاح",
        "success"
    );

}


/* =========================================================
   14. REJECT ARTICLE
========================================================= */

function rejectArticle(id) {

    const article =
        findArticle(id);


    if (!article) return;


    article.status =
        "rejected";


    renderArticles();

    updateStatistics();


    showNotification(
        "تم رفض المقال",
        "warning"
    );

}


/* =========================================================
   15. DELETE ARTICLE
========================================================= */

function deleteArticle(id) {

    const article =
        findArticle(id);


    if (!article) return;


    const confirmed =
        window.confirm(
            `هل أنت متأكد من حذف المقال:\n\n${article.title}`
        );


    if (!confirmed) return;


    AdminState.articles =
        AdminState.articles.filter(
            item => item.id !== id
        );


    renderArticles();

    updateStatistics();


    showNotification(
        "تم حذف المقال بنجاح",
        "success"
    );

}


/* =========================================================
   16. FIND ARTICLE
========================================================= */

function findArticle(id) {

    return AdminState.articles.find(
        article =>
            article.id === Number(id)
    );

}


/* =========================================================
   17. STATUS DATA
========================================================= */

function getStatusData(status) {

    const statuses = {

        pending: {

            label: "قيد المراجعة",

            className: "status-pending",

            icon:
                '<i class="fa-solid fa-clock"></i>'

        },

        approved: {

            label: "منشور",

            className: "status-approved",

            icon:
                '<i class="fa-solid fa-check-circle"></i>'

        },

        rejected: {

            label: "مرفوض",

            className: "status-rejected",

            icon:
                '<i class="fa-solid fa-circle-xmark"></i>'

        }

    };


    return statuses[status] ||
        statuses.pending;

}


/* =========================================================
   18. CATEGORY NAMES
========================================================= */

function getCategoryName(category) {

    const categories = {

        health:
            "توعية صحية",

        education:
            "التعليم الطبي",

        volunteering:
            "التطوع",

        humanitarian:
            "إنساني",

        technology:
            "تقنية وابتكار"

    };


    return categories[category] ||
        "عام";

}


/* =========================================================
   19. DATE FORMAT
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return new Intl.DateTimeFormat(
        "ar-SY",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(date);

}


/* =========================================================
   20. MODALS
========================================================= */

function initModals() {

    /*
       Generic close buttons
    */

    $$("[data-modal-close]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const modal =
                        button.closest(".admin-modal");

                    closeModal(modal);

                }
            );

        });


    /*
       Click outside
    */

    $$(".admin-modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        closeModal(modal);

                    }

                }
            );

        });


    /*
       Escape
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) return;


            $$(".admin-modal.active")
                .forEach(modal => {

                    closeModal(modal);

                });

        }
    );

}


function openModal(modal) {

    if (!modal) return;


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    if (!modal) return;


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !$(".admin-modal.active")
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   21. NOTIFICATIONS
========================================================= */

function initNotifications() {

    const notificationButton =
        $("#notificationButton");


    if (!notificationButton) return;


    notificationButton.addEventListener(
        "click",
        () => {

            showNotification(
                "لا توجد إشعارات جديدة",
                "info"
            );

        }
    );

}


function showNotification(
    message,
    type = "info"
) {

    let container =
        $(".admin-notifications");


    if (!container) {

        container =
            document.createElement("div");

        container.className =
            "admin-notifications";

        document.body.appendChild(
            container
        );

    }


    const notification =
        document.createElement("div");


    notification.className =
        `admin-notification ${type}`;


    const icons = {

        success:
            "fa-circle-check",

        warning:
            "fa-triangle-exclamation",

        error:
            "fa-circle-xmark",

        info:
            "fa-circle-info"

    };


    notification.innerHTML = `

        <i class="fa-solid ${
            icons[type] ||
            icons.info
        }"></i>

        <span>
            ${escapeHTML(message)}
        </span>

        <button
            type="button"
            aria-label="Close">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;


    container.appendChild(
        notification
    );


    const closeButton =
        notification.querySelector(
            "button"
        );


    closeButton.addEventListener(
        "click",
        () => {

            removeNotification(
                notification
            );

        }
    );


    requestAnimationFrame(() => {

        notification.classList.add(
            "show"
        );

    });


    setTimeout(() => {

        removeNotification(
            notification
        );

    }, 4000);

}


function removeNotification(
    notification
) {

    if (!notification) return;


    notification.classList.remove(
        "show"
    );


    setTimeout(() => {

        notification.remove();

    }, 300);

}


/* =========================================================
   22. ESCAPE HTML
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


/* =========================================================
   23. WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (window.innerWidth > 900) {

            $(".admin-sidebar")
                ?.classList.remove("active");

            $(".sidebar-overlay")
                ?.classList.remove("active");

        }

    }
);


/* =========================================================
   24. GLOBAL ADMIN API
========================================================= */

window.MedLifeAdmin = {

    state:
        AdminState,

    switchSection,

    renderArticles,

    updateStatistics,

    approveArticle,

    rejectArticle,

    deleteArticle,

    viewArticle,

    showNotification

};


/* =========================================================
   END OF ADMIN.JS
========================================================= */
