export async function onRequest(context) {
  let response;

  try {
    response = await context.next();
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    const url = new URL(context.request.url);
    if (url.pathname !== "/" && url.pathname !== "/index.html") return response;

    const html = await response.text();
    let updated = html;

    updated = updated.replace(
      /<ul class="links">[\s\S]*?<\/ul>/,
      '<ul class="links"><li><a href="index.html">الرئيسية</a></li><li><a href="about-medlife.html">عن المؤسسة</a></li><li><a href="#programs">مجالات العمل</a></li><li><a href="#activities">صورنا</a></li><li><a href="articles.html">المقالات</a></li><li><a href="forum-v3.html">المنتدى</a></li><li><a href="support.html">صندوق الدعم</a></li><li><a href="contact.html">تواصل معنا</a></li></ul>'
    );

    updated = updated.replace(
      /<div class="mobile" id="mobile">[\s\S]*?<\/div><\/div>/,
      '<div class="mobile" id="mobile"><div class="wrap"><a href="index.html">الرئيسية</a><a href="about-medlife.html">عن المؤسسة</a><a href="#programs">مجالات العمل</a><a href="#activities">صورنا</a><a href="articles.html">المقالات</a><a href="forum-v3.html">المنتدى</a><a href="support.html">صندوق الدعم</a><a href="login.html">دخول الأعضاء</a><a href="join-options.html">الانضمام إلى ميدلايف</a><a href="contact.html">تواصل معنا</a></div></div>'
    );

    if (updated === html) return response;

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("cache-control", "no-store, no-cache, must-revalidate");

    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    // Never call context.next() twice. If rewriting fails, return the original response.
    if (response) return response;
    return new Response("Service unavailable", { status: 503 });
  }
}
