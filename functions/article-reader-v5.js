export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);
  const slug = requestUrl.searchParams.get('slug');

  // Let the existing reader page render the article, then restore the public
  // canonical URL so readers see /articles/<slug> instead of /article-reader-v5.
  const assetUrl = new URL(requestUrl);
  assetUrl.pathname = '/article-reader-v5';

  const response = await context.env.ASSETS.fetch(assetUrl);
  if (!response.ok || !slug) return response;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  let html = await response.text();
  const safeSlug = encodeURIComponent(slug);
  const bridge = `<script>(function(){try{var s=${JSON.stringify(safeSlug)};if(s){history.replaceState({},document.title,'/articles/'+s)}}catch(e){}})();</script>`;

  html = html.replace('</body>', bridge + '</body>');

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}
