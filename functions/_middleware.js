export async function onRequest(context) {
  try {
    const response = await context.next();
    const contentType = response.headers.get('content-type') || '';

    // Only touch HTML responses. Everything else passes through untouched.
    if (!contentType.includes('text/html')) return response;

    const html = await response.text();
    let updated = html;

    // Clean, formal top navigation. This is intentionally a simple exact replacement
    // so a malformed page can never cause a Worker exception.
    const oldNav = `<ul class="links"><li><a href="about-medlife.html"><i class="fa-solid fa-landmark"></i> عن ميدلايف</a></li><li><a href="#programs">مجالات العمل</a></li><li><a href="#activities">أنشطة ميدلايف</a></li><li><a href="articles.html">المقالات</a></li><li><a href="forum-v3.html">منتدى ميدلايف</a></li><li><a href="contact.html">تواصل معنا</a></li></ul>`;
    const newNav = `<ul class="links"><li><a href="index.html">الرئيسية</a></li><li><a href="about-medlife.html">عن المؤسسة</a></li><li><a href="#programs">مجالات العمل</a></li><li><a href="#activities">صورنا</a></li><li><a href="articles.html">المقالات</a></li><li><a href="forum-v3.html">المنتدى</a></li><li><a href="support.html">صندوق الدعم</a></li><li><a href="contact.html">تواصل معنا</a></li></ul>`;

    if (updated.includes(oldNav)) updated = updated.replace(oldNav, newNav);

    // Keep the mobile menu consistent with the formal desktop navigation.
    const oldMobile = `<div class="mobile" id="mobile"><div class="wrap"><a href="about-medlife.html">عن مؤسسة ميدلايف</a><a href="#about">من نحن</a><a href="#programs">مجالات العمل</a><a href="#activities">أنشطة ميدلايف</a><a href="articles.html">المقالات</a><a href="forum-v3.html">منتدى ميدلايف</a><a href="login.html">دخول الأعضاء</a><a href="join-options.html">الانضمام إلى ميدلايف</a><a href="contact.html">تواصل معنا</a></div></div>`;
    const newMobile = `<div class="mobile" id="mobile"><div class="wrap"><a href="index.html">الرئيسية</a><a href="about-medlife.html">عن المؤسسة</a><a href="#programs">مجالات العمل</a><a href="#activities">صورنا</a><a href="articles.html">المقالات</a><a href="forum-v3.html">المنتدى</a><a href="support.html">صندوق الدعم</a><a href="login.html">دخول الأعضاء</a><a href="join-options.html">الانضمام إلى ميدلايف</a><a href="contact.html">تواصل معنا</a></div></div>`;

    if (updated.includes(oldMobile)) updated = updated.replace(oldMobile, newMobile);

    if (updated === html) return response;

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    // Never let navigation enhancement break the entire website.
    return context.next();
  }
}
