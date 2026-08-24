const OPENAI_URL = 'https://api.openai.com/v1/responses';
const FALLBACK_WORKER = 'https://medlife-articles-api.broad-frog-3978.workers.dev/api/article-ai';
const OPENAI_TIMEOUT_MS = 20000;
const FALLBACK_TIMEOUT_MS = 7000;

const MEDLIFE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    excerpt: { type: 'string' },
    introduction: { type: 'string' },
    sections: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { heading: { type: 'string' }, content: { type: 'string' } }, required: ['heading', 'content'] } },
    conclusion: { type: 'string' },
    editor_notes: { type: 'array', items: { type: 'string' } }
  },
  required: ['title', 'excerpt', 'introduction', 'sections', 'conclusion', 'editor_notes']
};

async function isAdmin(request) {
  const cookie = request.headers.get('Cookie') || '';
  if (!cookie) return false;
  const url = new URL('/api/article-admin-session?action=me', request.url);
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json', Cookie: cookie } });
  return response.ok && (await response.json().catch(() => ({ success: false }))).success;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-store' } });
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!(await isAdmin(request))) return json({ success: false, error: 'غير مصرح.' }, 401);

    const input = await request.json();
    const article = input.article || {};
    const userInstruction = String(input.instruction || '').trim();
    const content = String(article.content || '').trim();
    if (!content) return json({ success: false, error: 'محتوى المقال فارغ.' }, 400);

    const payload = {
      title: String(article.title || '').slice(0, 300),
      category: String(article.category || '').slice(0, 160),
      excerpt: String(article.excerpt || '').slice(0, 1200),
      content: content.slice(0, 18000),
      instruction: userInstruction.slice(0, 1200)
    };

    const developer = `You are the dedicated MedLife Syria Arabic medical editorial formatter. Restructure and lightly edit the existing Arabic article to match MedLife's editorial pattern: concise title and excerpt, brief introduction, numbered medical sections, short readable paragraphs, lists when useful, red-flags only when medically appropriate, treatment/management only from source material, prevention when relevant, and a concise conclusion. Preserve the original medical facts and meaning. Never invent doses, diagnoses, contraindications, statistics, references, or claims. Do not return HTML or Markdown. Return only the requested JSON structure.`;
    const user = JSON.stringify(payload);

    if (env?.OPENAI_API_KEY) {
      try {
        const response = await fetchWithTimeout(OPENAI_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: env.MEDLIFE_FORMAT_MODEL || 'gpt-4.1-mini',
            input: [{ role: 'developer', content: developer }, { role: 'user', content: user }],
            text: { format: { type: 'json_schema', name: 'medlife_article_format', strict: true, schema: MEDLIFE_SCHEMA } },
            store: false
          })
        }, OPENAI_TIMEOUT_MS);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return json({ success: false, error: data?.error?.message || 'تعذر الاتصال بـChatGPT.' }, response.status);
        const text = data?.output_text || '';
        if (!text) return json({ success: false, error: 'ChatGPT لم يُرجع نتيجة.' }, 502);
        return json({ success: true, article: JSON.parse(text), provider: 'openai', model: env.MEDLIFE_FORMAT_MODEL || 'gpt-4.1-mini' });
      } catch (error) {
        if (String(error).includes('timeout') || error?.name === 'AbortError') return json({ success: false, error: 'انتهت مهلة ChatGPT (20 ثانية). خفّف طول المقال أو أعد المحاولة.' }, 504);
        throw error;
      }
    }

    try {
      const headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
      const cookie = request.headers.get('Cookie');
      if (cookie) headers.set('Cookie', cookie);
      const fallback = await fetchWithTimeout(FALLBACK_WORKER, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'full_edit', language: 'ar', article: { title: payload.title, category: payload.category, content: payload.content, requirements: developer + (userInstruction ? `\nAdditional editor instruction: ${userInstruction}` : '') } })
      }, FALLBACK_TIMEOUT_MS);
      const fallbackData = await fallback.json().catch(() => ({}));
      if (!fallback.ok || !fallbackData.success) return json({ success: false, error: fallbackData.error || 'تعذر تشغيل محرر MedLife الذكي.' }, 502);
      return json({ success: true, article: fallbackData.article, provider: 'medlife-worker-fallback' });
    } catch (error) {
      if (String(error).includes('timeout') || error?.name === 'AbortError') return json({ success: false, error: 'خدمة MedLife AI الاحتياطية لم تُجب خلال 7 ثوانٍ. أضف OPENAI_API_KEY لتشغيل محرر ChatGPT السريع.' }, 504);
      throw error;
    }
  } catch (error) {
    console.error('article-format-fast error', error);
    return json({ success: false, error: 'تعذر تشغيل التنسيق الذكي حالياً.' }, 500);
  }
}
