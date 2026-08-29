export async function onRequest(context) {
  const target = new URL('/content-center.html', context.request.url);
  const response = await context.env.ASSETS.fetch(new Request(target.toString(), { method: 'GET' }));
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.delete('content-length');

  if (!response.ok) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const html = await response.text();
  const guard = `<script>
(() => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || (typeof input !== 'string' ? input?.method : 'GET')).toUpperCase();
    if (method === 'GET' && /[?&]action=me(?:&|$)/.test(url)) {
      return Promise.resolve(new Response(JSON.stringify({success:true,authenticated:false}), {
        status: 401,
        headers: {'content-type':'application/json; charset=utf-8'}
      }));
    }
    return originalFetch(input, init);
  };
})();
</script>`;

  const bodyMarker = '<body>';
  const output = html.includes(bodyMarker)
    ? html.replace(bodyMarker, bodyMarker + guard)
    : html;

  return new Response(output, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
