const WORKER = 'https://medlife-articles-api.broad-frog-3978.workers.dev/public/articles';

export async function onRequestGet({request}) {
  try {
    const u = new URL(request.url);
    const slug = u.searchParams.get('slug');
    const target = slug ? WORKER + '/' + encodeURIComponent(slug) : WORKER;
    const r = await fetch(target, {headers: {Accept: 'application/json'}, cache: 'no-store'});
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({success: false, error: 'تعذر تحميل المقالات المنشورة حالياً.'}), {
      status: 502,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store'
      }
    });
  }
}
