export async function onRequest(context) {
    const response = await context.next();
    const url = new URL(context.request.url);

    if (url.pathname !== "/" && url.pathname !== "/index.html") {
        return response;
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
        return response;
    }

    return new HTMLRewriter()
        .on("body", {
            element(element) {
                element.append(
                    '<script src="/js/members.js" defer></script>',
                    { html: true }
                );
            }
        })
        .transform(response);
}
