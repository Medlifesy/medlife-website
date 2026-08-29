export async function onRequest(context) {
  const target = new URL('/content-center.html', context.request.url);
  const response = await context.env.ASSETS.fetch(new Request(target.toString(), { method: 'GET' }));
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.delete('content-length');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
