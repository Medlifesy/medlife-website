export async function onRequest(context) {
    const response = await context.next();
    const url = new URL(context.request.url);

    if (![
        "/",
        "/index.html",
        "/articles.html"
    ].includes(url.pathname)) {
        return response;
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
        return response;
    }

    return new HTMLRewriter()
        .on('a[href="#volunteer"]', {
            element(element) {
                element.setAttribute("href", "join-us.html");
            }
        })
        .on('a[href="index.html#volunteer"]', {
            element(element) {
                element.setAttribute("href", "join-us.html");
            }
        })
        .on('a[href="/#volunteer"]', {
            element(element) {
                element.setAttribute("href", "join-us.html");
            }
        })
        .on("body", {
            element(element) {
                if (url.pathname === "/" || url.pathname === "/index.html") {
                    element.append(
                        '<script src="/js/members.js" defer></script>',
                        { html: true }
                    );
                    element.append(
                        '<script src="/js/home-enhancements.js" defer></script>',
                        { html: true }
                    );
                }

                if (url.pathname === "/articles.html") {
                    element.append(
                        '<script src="/js/articles.js?v=20260814" defer></script>',
                        { html: true }
                    );
                }
            }
        })
        .transform(response);
}
