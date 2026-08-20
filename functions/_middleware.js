export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    if (path.endsWith('/articles-admin.html')) {
      let html = await response.text();

      // The legacy AI UI is embedded directly in articles-admin.html.
      // Hide it at the HTML/CSS level as well as disabling the old script,
      // so it cannot flash or reappear before the new Editorial Studio loads.
      html = html.replace(/<script\s+src=["']\/article-ai-studio\.js["'][^>]*><\/script>/gi, '');
      html = html.replace(/<head>/i, '<head><style id="medlife-disable-legacy-ai">.ai-studio{display:none!important}.ai-studio *{display:none!important}</style>');

      const scripts = [
        '/article-ai-legacy-hide.js?v=20260820-3',
        '/article-ai-editorial-v2.js?v=20260820-3'
      ];
      for (const src of scripts) {
        const name = src.split('?')[0];
        if (!html.includes(name)) {
          const marker = `<script src="${src}" defer></script>`;
          html = html.includes('</body>') ? html.replace('</body>', `${marker}</body>`) : `${html}${marker}`;
        }
      }

      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
      headers.set('pragma','no-cache');
      return new Response(html,{status:response.status,statusText:response.statusText,headers});
    }
    return response;
  } catch (error) {
    return response || new Response('Middleware error',{status:500});
  }
}
