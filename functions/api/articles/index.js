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

    if (request.method === 'GET') {
      target.search = incoming.search;
      target.searchParams.set('admin', '1');
    } else if (request.method === 'PUT' || request.method === 'PATCH') {
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

            // The Worker expects item routes as /articles/:id and status routes as
            // /articles/:id/status. The admin UI may send the id in the JSON body.
            if ((request.method === 'PUT' || request.method === 'PATCH') && payload.id !== undefined && payload.id !== null && String(payload.id).trim() !== '') {
              const id = encodeURIComponent(String(payload.id));
              target.pathname = request.method === 'PATCH'
                ? `${target.pathname.replace(/\/$/, '')}/${id}/status`
                : `${target.pathname.replace(/\/$/, '')}/${id}`;
              delete payload.id;
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

    if (request.method === 'DELETE') {
      const id = incoming.searchParams.get('id');
      if (id) target.pathname = `${target.pathname.replace(/\/$/, '')}/${encodeURIComponent(id)}`;
      target.searchParams.set('admin', '1');
    }

    // Also support status routes where the client puts the id in the URL.
    if (request.method === 'PATCH' && !target.pathname.endsWith('/status')) {
      const parts = incoming.pathname.split('/').filter(Boolean);
      const articleIndex = parts.indexOf('articles');
      const id = articleIndex >= 0 ? parts[articleIndex + 1] : null;
      if (id) target.pathname = `${target.pathname.replace(/\/$/, '')}/${encodeURIComponent(id)}/status`;
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

    if (response.ok && ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();

        if (request.method === 'GET') {
          if (Array.isArray(data)) {
            const articles = data;
            const summary = {
              total: articles.length,
              pending: articles.filter(a => a?.status === 'pending').length,
              published: articles.filter(a => a?.status === 'published').length,
              rejected: articles.filter(a => a?.status === 'rejected').length,
              draft: articles.filter(a => a?.status === 'draft').length
            };
            return new Response(JSON.stringify({ success: true, articles, summary }), {
              status: response.status,
              statusText: response.statusText,
              headers: outHeaders
            });
          }
          if (data && typeof data === 'object' && data.success === true) return new Response(JSON.stringify(data), { status: response.status, statusText: response.statusText, headers: outHeaders });
        }

        if (data && typeof data === 'object' && data.success === true) {
          return new Response(JSON.stringify(data), {
            status: response.status,
            statusText: response.statusText,
            headers: outHeaders
          });
        }

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return new Response(JSON.stringify({ success: true, ...data }), {
            status: response.status,
            statusText: response.statusText,
            headers: outHeaders
          });
        }
      }
    }

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
