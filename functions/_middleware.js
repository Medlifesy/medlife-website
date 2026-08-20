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
        const scripts = ['/article-ai-studio.js?v=20260820-4','/article-ai-admin-enhanced.js?v=20260820-4','/article-ai-final-polish.js?v=20260820-1','/article-ai-editorial-v2.js?v=20260820-1'];
        const missing = scripts.filter(src => !html.includes(src.split('?')[0]));
        const marker = missing.map(src => `<script src="${src}" defer></script>`).join('');
        html = html.includes('</body>') ? html.replace('</body>', `${marker}</body>`) : `${html}${marker}`;
        const headers = new Headers(response.headers); headers.delete('content-length'); headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0'); headers.set('pragma','no-cache');
        return new Response(html,{status:response.status,statusText:response.statusText,headers});
      }
    }
    return response;
  } catch (error) {
    return response || new Response('Middleware error',{status:500});
  }
}
