export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    if (/\/(admin|admin-members|articles-admin|support-admin|support-applications-admin)\.html$/.test(path)) return response;

    const html = await response.text();
    const scripts = ['/site-nav.js'];
    if (path.endsWith('/support.html')) scripts.push('/support-page.js');
    if (path.endsWith('/support-request.html')) scripts.push('/support-request.js');
    const marker = scripts.map(src => `<script src="${src}" defer></script>`).join('');
    if (scripts.every(src => html.includes(src))) return response;

    const updated = html.includes('</body>') ? html.replace('</body>', `${marker}</body>`) : `${html}${marker}`;
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store, no-cache, must-revalidate');
    return new Response(updated, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    if (response) return response;
    return new Response('Service unavailable', { status: 503 });
  }
}
