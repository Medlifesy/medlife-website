export async function onRequest(context) {
  const url = new URL(context.request.url);
  url.pathname = '/submit-article-v6.html';

  const request = new Request(url.toString(), context.request);
  return context.env.ASSETS.fetch(request);
}
