const AI_WORKER_URL = 'https://medlife-articles-api.broad-frog-3978.workers.dev/api/article-ai';

export async function onRequestPost({ request }) {
  try {
    const body = await request.text();
    const headers = new Headers({
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
      'Accept': 'application/json'
    });

    // Forward the existing MedLife article-admin session cookie to the AI Worker.
    // The Worker performs the real authentication and uses its Workers AI binding.
    const cookie = request.headers.get('Cookie');
    if (cookie) headers.set('Cookie', cookie);

    const response = await fetch(AI_WORKER_URL, {
      method: 'POST',
      headers,
      body
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('article-ai proxy error', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'تعذر الاتصال بخدمة MedLife AI حالياً. حاول مرة أخرى بعد قليل.'
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store'
      }
    });
  }
}
