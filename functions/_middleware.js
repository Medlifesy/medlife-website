export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    const isArticleReader = path === '/article-reader-v5.html' || path.startsWith('/articles/');

    // Administration pages are static entrypoints and intentionally have no
    // middleware-specific behavior. Article-reader enhancement remains the
    // only HTML transformation owned by this middleware.
    if (!isArticleReader) return response;

    let html = await response.text();
    const tag = '<script src="/article-reader-rich-content.js?v=20260828-1" defer></script>';
    if (!html.includes('/article-reader-rich-content.js')) {
      html = html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : `${html}${tag}`;
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
    headers.set('pragma','no-cache');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  } catch(error) {
    return response || new Response('Middleware error',{status:500});
  }
}
