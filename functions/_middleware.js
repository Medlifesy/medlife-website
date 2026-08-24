export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    if (!path.endsWith('/articles-admin.html')) return response;

    let html = await response.text();

    // Remove all legacy article tooling from the admin response.
    const legacySectionClasses = [
      'ai-studio',
      'images-studio'
    ];
    for (const className of legacySectionClasses) {
      const sectionPattern = new RegExp(`<section\\s+class=[\"']${className}[\"'][\\s\\S]*?<\\/section>`, 'gi');
      html = html.replace(sectionPattern, '');
    }
    html = html.replace(/<script\\s+src=[\"'][^\"']*article-ai-studio\\.js[^\"']*[\"'][^>]*><\\/script>/gi, '');
    html = html.replace(/<script\\s+src=[\"'][^\"']*article-ai-upgrade\\.js[^\"']*[\"'][^>]*><\\/script>/gi, '');
    html = html.replace(/<script\\s+src=[\"'][^\"']*article-images-studio\\.js[^\"']*[\"'][^>]*><\\/script>/gi, '');
    html = html.replace(/<script\\s+src=[\"'][^\"']*article-ai-editorial-v2\\.js[^\"']*[\"'][^>]*><\\/script>/gi, '');

    // Inject only the current no-storage article management experience.
    const marker = '<script src="/article-management-v3.js?v=20260825-2" defer></script>';
    if (!html.includes('/article-management-v3.js')) {
      html = html.includes('</body>')
        ? html.replace('</body>', `${marker}</body>`)
        : `${html}${marker}`;
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
