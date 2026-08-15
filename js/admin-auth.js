/* =========================================================
   MEDLIFE ADMIN ARTICLE AUTH
   The secret itself is NEVER stored in this file.
   It is entered by the administrator and kept only for the
   current browser tab/session in sessionStorage.
========================================================= */
(function () {
    "use strict";

    const STORAGE_KEY = "medlife_articles_admin_key";
    const API_PATH = "/api/articles";
    const originalFetch = window.fetch.bind(window);

    function getKey() {
        try {
            return sessionStorage.getItem(STORAGE_KEY) || "";
        } catch (_) {
            return "";
        }
    }

    function setKey(value) {
        try {
            sessionStorage.setItem(STORAGE_KEY, value);
        } catch (_) {}
    }

    function clearKey() {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
    }

    function askForKey() {
        const value = window.prompt("أدخل كلمة مرور إدارة المقالات:");
        if (value === null) return "";
        const trimmed = value.trim();
        if (trimmed) setKey(trimmed);
        return trimmed;
    }

    function isArticlesRequest(input) {
        try {
            const url = typeof input === "string"
                ? new URL(input, location.origin)
                : new URL(input.url, location.origin);
            return url.origin === location.origin &&
                   (url.pathname === API_PATH || url.pathname === API_PATH + "/");
        } catch (_) {
            return false;
        }
    }

    window.fetch = async function (input, init) {
        if (!isArticlesRequest(input)) {
            return originalFetch(input, init);
        }

        const options = { ...(init || {}) };
        const headers = new Headers(
            input instanceof Request ? input.headers : undefined
        );
        new Headers(options.headers || {}).forEach((value, key) => {
            headers.set(key, value);
        });

        let key = getKey();
        if (!key) key = askForKey();
        if (!key) {
            return new Response(
                JSON.stringify({ success: false, error: "لم يتم إدخال كلمة مرور الإدارة." }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        headers.set("Authorization", "Bearer " + key);
        options.headers = headers;

        let response = await originalFetch(input, options);

        if (response.status === 401) {
            clearKey();
            key = askForKey();
            if (!key) return response;
            headers.set("Authorization", "Bearer " + key);
            options.headers = headers;
            response = await originalFetch(input, options);
        }

        return response;
    };

    window.medLifeAdminLogout = function () {
        clearKey();
        window.location.reload();
    };
})();
