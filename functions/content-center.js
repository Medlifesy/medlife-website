export async function onRequest({ request, env }) {
  const u = new URL(request.url);
  const target = new URL('/content-center.html', u.origin);
  const r = await env.ASSETS.fetch(new Request(target, request));
  if (!r.ok) return r;
  const html = await r.text();
  const enhanced = html.replace('</body>', '<script src="/content-center-enhancements.js"></script></body>');
  return new Response(enhanced, {
    status: r.status,
    headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store' }
  });
}
