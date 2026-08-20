export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const path = new URL(context.request.url).pathname.toLowerCase();
    if (/\/(admin|admin-members|articles-admin|support-admin|support-applications-admin)\.html$/.test(path)) {
      if (path.endsWith('/articles-admin.html')) {
        let html = await response.text();
        // Load ONLY the current editorial AI studio. The legacy AI layers are intentionally disabled.
        const src = '/article-ai-editorial-v2.js?v=20260820-2';
        if (!html.includes('/article-ai-editorial-v2.js')) {
          const marker = `<script src="${src}" defer></script>`;
          html = html.includes('</body>') ? html.replace('</body>', `${marker}</body>`) : `${html}${marker}`;
        }
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
        headers.set('pragma','no-cache');
        return new Response(html,{status:response.status,statusText:response.statusText,headers});
      }
    }
    return response;
  } catch (error) {
    return response || new Response('Middleware error',{status:500});
  }
}
