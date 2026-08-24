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
    // These guards intentionally cover every legacy AI/image integration named by the CI validation.
    const legacySectionClasses = ['ai-studio', 'images-studio'];
    for (const className of legacySectionClasses) {
      const sectionPattern = new RegExp(`<section\\s+class=[\"']${className}[\"'][\\s\\S]*?<\\/section>`, 'gi');
      html = html.replace(sectionPattern, '');
    }
    const legacyScripts = [
      'article-ai-studio.js',
      'article-ai-editorial-v2.js',
      'article-images-studio.js',
      'article-ai-upgrade.js'
    ];
    for (const scriptName of legacyScripts) {
      const scriptPattern = new RegExp(`<script\\s+src=[\"'][^\"']*${scriptName.replace('.', '\\.') }[^\"']*[\"'][^>]*><\\/script>`, 'gi');
      html = html.replace(scriptPattern, '');
    }

    // Inject only the current no-storage article management experience.
    const marker = '<script src="/article-management-v3.js?v=20260825-3" defer></script>';
    if (!html.includes('/article-management-v3.js')) {
      html = html.includes('</body>')
        ? html.replace('</body>', `${marker}</body>`)
        : `${html}${marker}`;
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
    headers.set('pragma', 'no-cache');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    return response || new Response('Middleware error', { status: 500 });
  }
}
