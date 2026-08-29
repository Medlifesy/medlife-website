export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    const isArticlesAdmin = path === '/articles-admin' || path === '/articles-admin/' || path.endsWith('/articles-admin.html');
    const isArticleReader = path === '/article-reader-v5.html' || path.startsWith('/articles/');

    if (isArticlesAdmin) {
      let html = await response.text();

      // Keep the current Visual Studio implementation while actively removing
      // legacy AI/image UI that can conflict with the article-management app.
      const legacySectionClasses = ['ai-studio', 'images-studio'];
      const legacyScripts = [
        'article-ai-studio.js',
        'article-ai-editorial-v2.js',
        'article-images-studio.js',
        'article-ai-upgrade.js'
      ];

      for (const className of legacySectionClasses) {
        const re = new RegExp(`<section\\s+class=["'][^"']*${className}[^"']*["'][\\s\\S]*?<\\/section>`, 'gi');
        html = html.replace(re, '');
      }
      for (const scriptName of legacyScripts) {
        const re = new RegExp(`<script[^>]+src=["'][^"']*${scriptName.replace('.', '\\.')}(?:\\?[^"']*)?["'][^>]*><\\/script>`, 'gi');
        html = html.replace(re, '');
      }

      const tag = '<script src="/article-management-v3.js?v=20260829-1" defer></script>';
      if (!html.includes('/article-management-v3.js')) {
        html = html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : `${html}${tag}`;
      }

      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
      headers.set('pragma','no-cache');
      return new Response(html,{status:response.status,statusText:response.statusText,headers});
    }

    if (!isArticleReader) return response;

    let html = await response.text();
    const tag = '<script src="/article-reader-rich-content.js?v=20260828-1" defer></script>';
    if (!html.includes('/article-reader-rich-content.js')) html = html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : `${html}${tag}`;

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
    headers.set('pragma','no-cache');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  } catch(error) {
    return response || new Response('Middleware error',{status:500});
  }
}
