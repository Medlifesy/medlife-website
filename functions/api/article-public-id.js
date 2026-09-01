function makePublicId() {
  return `article-${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
}

export function onRequestGet({ request, env }) {
  if (!env?.DB) return new Response('Article service unavailable', { status: 502 });
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json; charset=UTF-8' } });
}

export { makePublicId };
