const ARTICLES_WORKER_URL = 'https://medlife-articles-api.broad-frog-3978.workers.dev/articles';

const ARTICLE_FIELDS = [
  'title_ar','title_en','excerpt_ar','excerpt_en',
  'content_ar','content_en','author_name','author_email',
  'category','image_url','status','slug','author_member_id','rejection_reason'
];

export async function onRequest({ request }) {
  try {
    const incoming = new URL(request.url);
    const target = new URL(ARTICLES_WORKER_URL);
    target.search = incoming.search;

    // GET/PUT/DELETE from the articles administration UI must request the
    // complete administrative dataset. The Worker still requires a valid
    // medlife_articles_session cookie before exposing non-public articles.
    if (request.method === 'GET' || request.method === 'PUT' || request.method === 'DELETE') {
      target.searchParams.set('admin', '1');
    }

    const headers = new Headers(request.headers);
    headers.delete('host');

    let body;
    if (!['GET', 'HEAD'].includes(request.method)) {
      const raw = await request.text();
      if (raw) {
        try {
          const payload = JSON.parse(raw);
          if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
            for (const field of ARTICLE_FIELDS) {
              if (payload[field] === undefined) payload[field] = null;
            }
            body = JSON.stringify(payload);
            headers.set('Content-Type', 'application/json');
          } else {
            body = raw;
          }
        } catch {
          body = raw;
        }
      } else {
        body = raw;
      }
    }

    const response = await fetch(target.toString(), {
      method: request.method,
      headers,
      body,
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
