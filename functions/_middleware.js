export async function onRequest(context) {
    const response = await context.next();
    const url = new URL(context.request.url);

    if (!["/", "/index.html", "/articles.html", "/admin.html"].includes(url.pathname)) return response;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    return new HTMLRewriter()
        .on('a[href="#volunteer"]', { element(element) { element.setAttribute("href", "join-options.html"); } })
        .on('a[href="index.html#volunteer"]', { element(element) { element.setAttribute("href", "join-options.html"); } })
        .on('a[href="/#volunteer"]', { element(element) { element.setAttribute("href", "join-options.html"); } })
        .on("head", {
            element(element) {
                if (url.pathname === "/admin.html") {
                    element.append('<script src="/js/admin-auth.js"></script>', { html: true });
                }
            }
        })
        .on("body", {
            element(element) {
                if (url.pathname === "/" || url.pathname === "/index.html") {
                    element.append('<script src="/js/members.js" defer></script>', { html: true });
                    element.append('<script src="/js/home-enhancements.js" defer></script>', { html: true });
                    element.append(`<script>(function(){document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('#loginBtn,#mobileLoginBtn,[data-volunteer-trigger]');if(!el)return;e.preventDefault();e.stopImmediatePropagation();location.href=(el.id==='loginBtn'||el.id==='mobileLoginBtn')?'/login.html':'/join-options.html'},true);var modal=document.getElementById('loginModal');if(modal){var p=modal.querySelector('p');if(p)p.textContent='يمكنك الآن تسجيل الدخول إلى حسابك في منصة MedLife.';var b=document.getElementById('closeLogin2');if(b){b.textContent='تسجيل الدخول';b.onclick=function(){location.href='/login.html'}}}})();</script>`, { html: true });
                }
                if (url.pathname === "/articles.html") {
                    element.append('<script src="/js/articles.js?v=20260814" defer></script>', { html: true });
                }
            }
        })
        .transform(response);
}
