/* =========================================================
   MEDLIFE ADMIN PANEL
   Article Approval Management
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const articlesTable =
        document.getElementById("articlesTable");

    const loading =
        document.getElementById("adminLoading");

    const emptyState =
        document.getElementById("adminEmpty");

    const filterStatus =
        document.getElementById("filterStatus");

    const searchInput =
        document.getElementById("adminSearch");

    const refreshBtn =
        document.getElementById("refreshArticles");


    let articles = [];


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadArticles();


    /* =====================================================
       LOAD ARTICLES
    ===================================================== */

    async function loadArticles() {

        showLoading();

        try {

            /*
             * Change this endpoint later if your
             * admin API uses a different route.
             */

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


            renderArticles();


        } catch (error) {

            console.error(
                "Admin articles error:",
                error
            );


            showError(
                "تعذر تحميل المقالات حالياً."
            );
        }
    }


    /* =====================================================
       RENDER ARTICLES
    ===================================================== */

    function renderArticles() {

        if (!articlesTable) {
            return;
        }


        const status =
            filterStatus
                ? filterStatus.value
                : "all";


        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        let filtered =
            articles.filter(
                article => {

                    /*
                     * Status filter
                     */

                    if (
                        status !== "all" &&
                        article.status !== status
                    ) {

                        return false;
                    }


                    /*
                     * Search
                     */

                    if (!search) {
                        return true;
                    }


                    const title =
                        String(
                            article.title_ar ||
                            article.title_en ||
                            ""
                        ).toLowerCase();


                    const author =
                        String(
                            article.author_name ||
                            ""
                        ).toLowerCase();


                    return (
                        title.includes(search) ||
                        author.includes(search)
                    );

                }
            );


        if (
            loading
        ) {

            loading.style.display =
                "none";
        }


        if (
            emptyState
        ) {

            emptyState.style.display =
                filtered.length === 0
                    ? "block"
                    : "none";
        }


        /*
         * If there are no filtered articles
         */
        if (
            filtered.length === 0
        ) {

            articlesTable.innerHTML =
                "";

            return;
        }


        articlesTable.innerHTML =
            filtered
                .map(
                    article =>
                        createArticleRow(
                            article
                        )
                )
                .join("");


        attachRowEvents();
    }


    /* =====================================================
       CREATE ARTICLE ROW
    ===================================================== */

    function createArticleRow(
        article
    ) {

        const id =
            article.id;


        const title =
            escapeHTML(
                article.title_ar ||
                article.title_en ||
                "بدون عنوان"
            );


        const author =
            escapeHTML(
                article.author_name ||
                "غير معروف"
            );


        const category =
            escapeHTML(
                article.category ||
                "غير مصنف"
            );


        const status =
            String(
                article.status ||
                "pending"
            );


        const date =
            formatDate(
                article.created_at
            );


        const statusLabel =
            getStatusLabel(
                status
            );


        return `

            <tr data-id="${id}">

                <td>

                    <strong>
                        ${title}
                    </strong>

                </td>


                <td>
                    ${author}
                </td>


                <td>
                    ${category}
                </td>


                <td>
                    <span
                        class="admin-status status-${status}">
                        ${statusLabel}
                    </span>
                </td>


                <td>
                    ${date}
                </td>


                <td>

                    <div class="admin-actions">

                        <button
                            type="button"
                            class="admin-view"
                            data-action="view"
                            data-id="${id}">

                            <i class="fa-solid fa-eye"></i>

                            عرض

                        </button>


                        ${
                            status === "pending"
                            ? `

                                <button
                                    type="button"
                                    class="admin-approve"
                                    data-action="approve"
                                    data-id="${id}">

                                    <i class="fa-solid fa-check"></i>

                                    موافقة

                                </button>


                                <button
                                    type="button"
                                    class="admin-reject"
                                    data-action="reject"
                                    data-id="${id}">

                                    <i class="fa-solid fa-xmark"></i>

                                    رفض

                                </button>

                            `
                            : ""
                        }

                    </div>

                </td>

            </tr>

        `;
    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function attachRowEvents() {

        document
            .querySelectorAll(
                "[data-action='view']"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset.id;

                            viewArticle(id);

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-action='approve']"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset.id;

                            updateArticleStatus(
                                id,
                                "approved"
                            );

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-action='reject']"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset.id;

                            rejectArticle(
                                id
                            );

                        }
                    );

                }
            );
    }


    /* =====================================================
       VIEW ARTICLE
    ===================================================== */

    function viewArticle(id) {

        const article =
            articles.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!article) {
            return;
        }


        /*
         * If article.html exists,
         * open the public article page.
         */

        if (
            article.id
        ) {

            window.open(
                `/article.html?id=${encodeURIComponent(
                    article.id
                )}`,
                "_blank"
            );

        }

    }


    /* =====================================================
       APPROVE
    ===================================================== */

    async function approveArticle(
        id
    ) {

        const article =
            articles.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!article) {
            return;
        }


        const confirmed =
            confirm(
                "هل أنت متأكد من الموافقة على نشر هذا المقال؟"
            );


        if (!confirmed) {
            return;
        }


        await updateArticleStatus(
            id,
            "approved"
        );
    }


    /* =====================================================
       REJECT
    ===================================================== */

    async function rejectArticle(
        id
    ) {

        const reason =
            prompt(
                "اكتب سبب رفض المقال:"
            );


        if (
            reason === null
        ) {
            return;
        }


        const cleanReason =
            reason.trim();


        if (!cleanReason) {

            alert(
                "يرجى إدخال سبب الرفض."
            );

            return;
        }


        await updateArticleStatus(
            id,
            "rejected",
            cleanReason
        );
    }


    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    async function updateArticleStatus(
        id,
        status,
        rejectionReason = null
    ) {

        try {

            const response =
                await fetch(
                    `/api/articles/${encodeURIComponent(id)}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                status:
                                    status,

                                rejection_reason:
                                    rejectionReason

                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to update article."
                );
            }


            /*
             * Update local data
             */

            const article =
                articles.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            if (article) {

                article.status =
                    status;


                article.rejection_reason =
                    rejectionReason;
            }


            renderArticles();


            showAdminMessage(
                status === "approved"
                    ? "تمت الموافقة على المقال ونشره."
                    : "تم رفض المقال.",
                "success"
            );


        } catch (error) {

            console.error(
                "Update article error:",
                error
            );


            showAdminMessage(
                "تعذر تحديث حالة المقال.",
                "error"
            );
        }
    }


    /* =====================================================
       FILTERS
    ===================================================== */

    if (filterStatus) {

        filterStatus.addEventListener(
            "change",
            renderArticles
        );
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderArticles
        );
    }


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadArticles
        );
    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        if (loading) {

            loading.style.display =
                "block";
        }


        if (emptyState) {

            emptyState.style.display =
                "none";
        }


        if (articlesTable) {

            articlesTable.innerHTML =
                "";
        }
    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError(
        message
    ) {

        if (loading) {

            loading.style.display =
                "none";
        }


        if (articlesTable) {

            articlesTable.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center;padding:40px;">

                        <i
                            class="fa-solid fa-circle-exclamation">
                        </i>

                        <br>

                        ${escapeHTML(message)}

                    </td>

                </tr>

            `;
        }
    }


    /* =====================================================
       ADMIN MESSAGE
    ===================================================== */

    function showAdminMessage(
        message,
        type = "success"
    ) {

        let box =
            document.getElementById(
                "adminToast"
            );


        if (!box) {

            box =
                document.createElement(
                    "div"
                );


            box.id =
                "adminToast";


            box.className =
                "admin-toast";


            document.body.appendChild(
                box
            );
        }


        box.textContent =
            message;


        box.dataset.type =
            type;


        box.classList.add(
            "show"
        );


        setTimeout(
            () => {

                box.classList.remove(
                    "show"
                );

            },
            3500
        );
    }


    /* =====================================================
       STATUS LABEL
    ===================================================== */

    function getStatusLabel(
        status
    ) {

        switch (
            status
        ) {

            case "approved":
                return "منشور";

            case "rejected":
                return "مرفوض";

            case "pending":
                return "قيد المراجعة";

            default:
                return status;

        }
    }


    /* =====================================================
       DATE
    ===================================================== */

    function formatDate(
        dateValue
    ) {

        if (!dateValue) {
            return "-";
        }


        const date =
            new Date(
                dateValue
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";
        }


        return date.toLocaleDateString(
            "ar-SY",
            {
                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric"
            }
        );
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(
        value
    ) {

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

});
