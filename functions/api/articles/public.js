const WORKER="https://medlife-articles-api.broad-frog-3978.workers.dev/public/articles";

export async function onRequestGet({request}) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    const target = slug ? `${WORKER}/${encodeURIComponent(slug)}` : WORKER;
    const response = await fetch(target, {
      headers: { Accept: 'application/json' },
      cf: { cacheTtl: 0, cacheEverything: false }
    });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'تعذر تحميل المقالات المنشورة حالياً.'
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store'
      }
    });
  }
}
