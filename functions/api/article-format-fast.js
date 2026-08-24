const OPENAI_URL = 'https://api.openai.com/v1/responses';
const FALLBACK_WORKER = 'https://medlife-articles-api.broad-frog-3978.workers.dev/api/article-ai';

const MEDLIFE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    excerpt: { type: 'string' },
    introduction: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          heading: { type: 'string' },
          content: { type: 'string' }
        },
        required: ['heading', 'content']
      }
    },
    conclusion: { type: 'string' },
    editor_notes: { type: 'array', items: { type: 'string' } }
  },
  required: ['title', 'excerpt', 'introduction', 'sections', 'conclusion', 'editor_notes']
};

async function isAdmin(request) {
  const cookie = request.headers.get('Cookie') || '';
  if (!cookie) return false;
  const url = new URL('/api/article-admin-session?action=me', request.url);
  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json', Cookie: cookie }
  });
  return response.ok && (await response.json().catch(() => ({ success: false }))).success;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!(await isAdmin(request))) return json({ success: false, error: 'غير مصرح.' }, 401);

    const input = await request.json();
    const article = input.article || {};
    const userInstruction = String(input.instruction || '').trim();
    const content = String(article.content || '').trim();
    if (!content) return json({ success: false, error: 'محتوى المقال فارغ.' }, 400);

    // Keep the request lean: the formatter only needs the Arabic editorial fields.
    const payload = {
      title: String(article.title || '').slice(0, 300),
      category: String(article.category || '').slice(0, 160),
      excerpt: String(article.excerpt || '').slice(0, 1200),
      content: content.slice(0, 26000),
      instruction: userInstruction.slice(0, 1200)
    };

    const developer = `You are the dedicated MedLife Syria Arabic medical editorial formatter.
Your only task is to restructure and lightly edit an existing Arabic medical article so it follows the editorial pattern used by MedLife articles such as tension-headache.
Use this structure:
1) concise engaging title;
2) concise reader-friendly excerpt;
3) a short introductory paragraph/callout;
4) numbered H2-style sections with clear medical headings;
5) short readable Arabic paragraphs;
6) bullets or numbered lists when they improve scanability;
7) a red-flags section only when medically appropriate;
8) treatment/management section only from information already present;
9) prevention/lifestyle section when relevant;
10) concise conclusion.
Never invent diagnoses, doses, contraindications, references, statistics, or claims not present in the source. Preserve the author's meaning and medical facts. Improve grammar, hierarchy, repetition, transitions, and readability. Do not return HTML or Markdown. Return only the requested JSON structure.`;

    const user = JSON.stringify(payload);

    if (env?.OPENAI_API_KEY) {
      const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: env.MEDLIFE_FORMAT_MODEL || 'gpt-4.1-mini',
          input: [
            { role: 'developer', content: developer },
            { role: 'user', content: user }
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'medlife_article_format',
              strict: true,
              schema: MEDLIFE_SCHEMA
            }
          },
          store: false
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return json({ success: false, error: data?.error?.message || 'تعذر الاتصال بـChatGPT.' }, response.status);
      }

      const text = data?.output_text || '';
      const formatted = JSON.parse(text);
      return json({ success: true, article: formatted, provider: 'openai', model: env.MEDLIFE_FORMAT_MODEL || 'gpt-4.1-mini' });
    }

    // Backward-compatible fallback until OPENAI_API_KEY is configured.
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    const cookie = request.headers.get('Cookie');
    if (cookie) headers.set('Cookie', cookie);
    const fallback = await fetch(FALLBACK_WORKER, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'full_edit',
        language: 'ar',
        article: {
          title: payload.title,
          category: payload.category,
          content: payload.content,
          requirements: developer + (userInstruction ? `\nAdditional editor instruction: ${userInstruction}` : '')
        }
      })
    });
    const fallbackData = await fallback.json().catch(() => ({}));
    if (!fallback.ok || !fallbackData.success) {
      return json({ success: false, error: fallbackData.error || 'تعذر تشغيل محرر MedLife الذكي.' }, 502);
    }
    return json({ success: true, article: fallbackData.article, provider: 'medlife-worker-fallback' });
  } catch (error) {
    console.error('article-format-fast error', error);
    return json({ success: false, error: 'تعذر تشغيل التنسيق الذكي حالياً.' }, 500);
  }
}
