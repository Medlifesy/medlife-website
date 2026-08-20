export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    if (!path.endsWith('/articles-admin.html')) return response;

    let html = await response.text();

    // Remove the legacy embedded AI studio from the HTML itself.
    html = html.replace(/<section\s+class=["']ai-studio["'][\s\S]*?<\/section>/gi, '');
    // Remove the legacy AI script tag if it is embedded in the page.
    html = html.replace(/<script\s+src=["'][^"']*article-ai-studio\.js[^"']*["'][^>]*><\/script>/gi, '');

    // Ensure the current Editorial Studio is loaded exactly once.
    if (!html.includes('/article-ai-editorial-v2.js')) {
      const marker = '<script src="/article-ai-editorial-v2.js?v=20260820-4" defer></script>';
      html = html.includes('</body>') ? html.replace('</body>', `${marker}</body>`) : `${html}${marker}`;
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
    headers.set('pragma', 'no-cache');
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    return response || new Response('Middleware error', { status: 500 });
  }
}
