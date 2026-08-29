const ARTICLES_WORKER_URL = 'https://medlife-articles-api.broad-frog-3978.workers.dev/articles';

export async function onRequest({ request }) {
  try {
    const incoming = new URL(request.url);
    const target = new URL(ARTICLES_WORKER_URL);
    target.search = incoming.search;

    const headers = new Headers(request.headers);
    headers.delete('host');

    // Pass the existing article-admin session through unchanged.
    const response = await fetch(target.toString(), {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual'
    });

    const outHeaders = new Headers(response.headers);
    outHeaders.delete('content-length');
    outHeaders.set('cache-control', 'no-store');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outHeaders
    });
  } catch (error) {
    console.error('articles worker proxy error', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'تعذر الاتصال بخدمة مقالات MedLife حالياً.'
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store'
      }
    });
  }
}
