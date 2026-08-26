export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const target = new URL('/articles/tension-headache.html', url.origin);
  return env.ASSETS.fetch(new Request(target.toString(), request));
}
