export async function onRequest(context) {
  const url = new URL(context.request.url);
  url.pathname = '/content-center.html';

  const response = await context.env.ASSETS.fetch(new Request(url.toString(), context.request));
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
