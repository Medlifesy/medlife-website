const OPENAI_URL = 'https://api.openai.com/v1/responses';
const FALLBACK_WORKER = 'https://medlife-articles-api.broad-frog-3978.workers.dev/api/article-ai';
const MODEL = 'gpt-4.1-mini';
const CF_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const TIMEOUT_MS = 25000;
const FALLBACK_TIMEOUT_MS = 15000;

const SCHEMA = {
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
        properties: { heading: { type: 'string' }, content: { type: 'string' } },
        required: ['heading', 'content']
      }
    },
    conclusion: { type: 'string' },
    editor_notes: { type: 'array', items: { type: 'string' } }
  },
  required: ['title', 'excerpt', 'introduction', 'sections', 'conclusion', 'editor_notes']
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-store' }
  });
}

function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const item = part.trim();
    if (item.startsWith(name + '=')) return decodeURIComponent(item.slice(name.length + 1));
  }
  return '';
}

async function verifyAdmin(request, env) {
  if (!env?.DB) return false;
  const token = getCookie(request, 'medlife_articles_session');
  if (!token) return false;
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const hash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    const row = await env.DB.prepare(`
      SELECT a.id AS account_id, a.role, a.account_status
      FROM member_sessions s
      JOIN member_accounts a ON a.id=s.account_id
      WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now')
      LIMIT 1
    `).bind(hash).first();
    return !!row && row.account_status === 'active' && ['admin', 'editor', 'reviewer'].includes(String(row.role || '').toLowerCase());
  } catch {
    return false;
  }
}

async function fetchTimed(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function extractText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const chunks = [];
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    for (const part of Array.isArray(item?.content) ? item.content : []) {
      if (typeof part?.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
}

function extractModelText(data) {
  if (typeof data === 'string') return data.trim();
  if (typeof data?.response === 'string') return data.response.trim();
  if (typeof data?.result === 'string') return data.result.trim();
  if (typeof data?.text === 'string') return data.text.trim();
  return '';
}

function buildDeveloperInstruction(extra = '') {
  return `You are the dedicated MedLife Arabic medical editorial formatter.

Match the structure used by MedLife's published Arabic medical articles: a strong title/excerpt, one clean introductory passage, a table-of-contents style overview when present, real section headings taken from the author's own numbered headings, short readable paragraphs, useful lists, and a final references section when references are supplied.

IMPORTANT:
- Preserve the author's medical meaning and all supported facts.
- Do NOT create generic headings such as "القسم 1" or "Section 1".
- Use the author's real section heading, for example "ما هو تنظيم الأسرة وما أهميته؟".
- Do not turn the table of contents into article sections.
- Do not duplicate the table of contents as a body section.
- Keep reference entries intact; never invent or delete references.
- Do not invent diagnoses, doses, contraindications, statistics, recommendations, or claims.
- Do not silently correct a medical claim by replacing it with a new claim; flag it in editor_notes instead.
- Do not output HTML or Markdown. Return only the requested JSON.${extra ? `\nAdditional editor instruction: ${extra}` : ''}`;
}

function extractJsonObject(text) {
  const clean = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(clean); } catch {}
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
  throw new Error('لم يرجع نموذج الذكاء الاصطناعي JSON صالحاً.');
}

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function normalizeDigits(value) {
  return String(value || '').replace(/[٠-٩]/g, d => String(AR_DIGITS.indexOf(d)));
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b|\u200c|\u200d/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isTocBlock(block) {
  const lines = normalizeText(block).split('\n').map(x => x.trim()).filter(Boolean);
  if (lines.length < 5) return false;
  const numbered = lines.filter(line => /^(?:\d{1,2}|[١-٩٠-٩]{1,2})\s*[-.)ـ:]/.test(line));
  return numbered.length >= Math.max(5, Math.floor(lines.length * 0.6));
}

function cleanHeading(raw) {
  let h = normalizeText(raw);
  h = h.replace(/^[*•–—\-]+\s*/, '').trim();
  h = h.replace(/^[-–—]+\s*/, '').trim();
  h = h.replace(/\s+[؟?]+$/, '؟');
  return h;
}

function headingFromLine(line) {
  const raw = normalizeText(line);
  const match = raw.match(/^(?:(\d{1,2})|([١-٩٠-٩]{1,2}))\s*(?:[-.)ـ:]|\s*[ـ-]\s*)\s*(.+)$/);
  if (!match) return null;
  const heading = cleanHeading(match[3]);
  if (!heading || heading.length < 4) return null;
  return { number: Number(match[1] || normalizeDigits(match[2])), heading };
}

function looksLikeHeadingParagraph(block) {
  const lines = normalizeText(block).split('\n').map(x => x.trim()).filter(Boolean);
  if (!lines.length) return null;
  const first = headingFromLine(lines[0]);
  if (!first) return null;
  if (lines.length === 1) return first;
  if (lines[0].length > 180) return null;
  return first;
}

function splitStructuredBlocks(raw) {
  const normalized = normalizeText(raw);
  const blocks = normalized.split(/\n\s*\n+/).map(normalizeText).filter(Boolean);
  const out = [];
  for (const block of blocks) {
    if (isTocBlock(block)) continue;
    const lines = block.split('\n').map(x => x.trim()).filter(Boolean);
    let current = null;
    let parts = [];
    const flush = () => {
      if (current) {
        out.push({ heading: current.heading, content: normalizeText(parts.join('\n\n')), order: current.number });
      } else if (parts.length) {
        out.push({ heading: '', content: normalizeText(parts.join('\n\n')), order: null });
      }
      current = null;
      parts = [];
    };

    for (const line of lines) {
      const heading = headingFromLine(line);
      if (heading) {
        flush();
        current = heading;
      } else {
        parts.push(line);
      }
    }
    flush();
  }
  return out;
}

function removeEmbeddedToc(content) {
  const lines = normalizeText(content).split('\n').map(x => x.trim());
  const result = [];
  let inToc = false;
  let tocCount = 0;
  for (const line of lines) {
    if (/^(?:لنتعرف|سوف نتعرف|في هذا المقال سنتعرف|محاور المقال|فيما يلي)/i.test(line)) {
      inToc = true;
      continue;
    }
    if (inToc) {
      if (headingFromLine(line)) {
        tocCount += 1;
        if (tocCount >= 2 && /^(?:١|1)\s*[-.)ـ:]/.test(line)) {
          // A new real section starts here only when the text following the number is long enough.
          inToc = false;
          result.push(line);
        }
        continue;
      }
      if (!line) continue;
      // The first real prose paragraph ends a TOC block.
      inToc = false;
    }
    result.push(line);
  }
  return normalizeText(result.join('\n'));
}

function extractReferencesBlock(content) {
  const normalized = normalizeText(content);
  const match = normalized.match(/(?:^|\n)(المصادر العلمية|المصادر والمراجع|المراجع العلمية|المراجع)\s*$/m);
  if (!match) return { body: normalized, references: '' };
  const index = match.index + (match[0].startsWith('\n') ? 1 : 0);
  return {
    body: normalizeText(normalized.slice(0, index)),
    references: normalizeText(normalized.slice(index))
  };
}

function deterministicFormat(article) {
  const title = normalizeText(article.title);
  const excerpt = normalizeText(article.excerpt);
  let raw = removeEmbeddedToc(article.content);
  const refSplit = extractReferencesBlock(raw);
  raw = refSplit.body;

  const structured = splitStructuredBlocks(raw);
  const notes = [];
  let introduction = '';
  const sections = [];
  const pendingIntro = [];

  for (const item of structured) {
    if (!item.heading) {
      if (sections.length === 0 && pendingIntro.length === 0) {
        pendingIntro.push(item.content);
      } else if (sections.length) {
        const last = sections[sections.length - 1];
        last.content = normalizeText([last.content, item.content].filter(Boolean).join('\n\n'));
      } else {
        pendingIntro.push(item.content);
      }
      continue;
    }

    const cleanH = cleanHeading(item.heading);
    if (/^(المصادر العلمية|المصادر والمراجع|المراجع العلمية|المراجع)$/i.test(cleanH)) continue;
    if (cleanH.length < 4) continue;
    sections.push({ heading: cleanH, content: item.content || '' });
  }

  if (pendingIntro.length) introduction = normalizeText(pendingIntro.join('\n\n'));

  // If the source has headings, never invent numbered generic headings.
  // If it has no headings at all, keep the body intact as one editorial section.
  if (!sections.length && raw) {
    const firstBreak = raw.indexOf('\n\n');
    if (firstBreak > 0 && firstBreak < 1200) {
      introduction = introduction || normalizeText(raw.slice(0, firstBreak));
      const rest = normalizeText(raw.slice(firstBreak + 2));
      if (rest) sections.push({ heading: 'محتوى المقال', content: rest });
    } else {
      introduction = introduction || raw;
    }
    notes.push('لم توجد عناوين مرقمة واضحة في النص الأصلي؛ تم الحفاظ على المحتوى بدل اختراع عناوين.');
  }

  // Convert obvious bullet markers to clean bullets while preserving meaning.
  for (const section of sections) {
    section.content = normalizeText(section.content)
      .replace(/^\s*\*\s+/gm, '• ')
      .replace(/^\s*[-–—]\s+/gm, '• ')
      .replace(/\n{3,}/g, '\n\n');
  }

  if (refSplit.references) {
    sections.push({ heading: 'المصادر والمراجع', content: refSplit.references.replace(/^المصادر العلمية\s*/i, '').replace(/^المصادر والمراجع\s*/i, '').replace(/^المراجع العلمية\s*/i, '').replace(/^المراجع\s*/i, '').trim() });
  }

  const contributor = normalizeText(article.author_name);
  if (contributor) notes.push(`إعداد المحتوى: ${contributor}.`);
  notes.push('تم الحفاظ على الحقائق والمراجع الأصلية دون اختراع معلومات طبية جديدة.');

  return {
    title,
    excerpt,
    introduction,
    sections,
    conclusion: '',
    editor_notes: notes
  };
}

export async function onRequestPost({ request, env }) {
  if (!(await verifyAdmin(request, env))) return json({ success: false, error: 'غير مصرح.' }, 401);
  let input;
  try { input = await request.json(); } catch { return json({ success: false, error: 'بيانات الطلب غير صالحة.' }, 400); }
  const article = input?.article || {};
  const content = String(article.content || '').trim();
  if (!content) return json({ success: false, error: 'محتوى المقال فارغ.' }, 400);

  const payload = {
    title: String(article.title || '').slice(0, 300),
    category: String(article.category || '').slice(0, 160),
    excerpt: String(article.excerpt || '').slice(0, 1200),
    author_name: String(article.author_name || '').slice(0, 300),
    content: content.slice(0, 20000),
    instruction: String(input?.instruction || '').trim().slice(0, 1200)
  };
  const developer = buildDeveloperInstruction(payload.instruction);
  const failures = [];

  if (env?.AI?.run) {
    try {
      const prompt = `${developer}\n\nReturn EXACTLY one JSON object matching this shape:\n{"title":"","excerpt":"","introduction":"","sections":[{"heading":"","content":""}],"conclusion":"","editor_notes":[]}\n\nARTICLE:\n${JSON.stringify(payload)}`;
      const result = await Promise.race([
        env.AI.run(CF_MODEL, { prompt, max_tokens: 3200, temperature: 0.15 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cloudflare AI timeout')), 25000))
      ]);
      const text = extractModelText(result);
      if (!text) throw new Error('Workers AI لم يُرجع نتيجة.');
      const formatted = extractJsonObject(text);
      if (Array.isArray(formatted.sections) && formatted.sections.some(s => /^القسم\s+\d+$/i.test(String(s?.heading || '').trim()))) {
        throw new Error('نتيجة AI استخدمت عناوين عامة غير مقبولة.');
      }
      return json({ success: true, provider: 'cloudflare-workers-ai', model: CF_MODEL, article: formatted });
    } catch (error) {
      failures.push(`workers-ai: ${error?.message || 'failed'}`);
    }
  } else {
    failures.push('workers-ai: binding AI غير مفعّل');
  }

  if (env?.OPENAI_API_KEY) {
    try {
      const response = await fetchTimed(OPENAI_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: env.MEDLIFE_FORMAT_MODEL || MODEL,
          store: false,
          input: [
            { role: 'developer', content: developer },
            { role: 'user', content: JSON.stringify(payload) }
          ],
          text: { format: { type: 'json_schema', name: 'medlife_article_format', strict: true, schema: SCHEMA } }
        })
      }, TIMEOUT_MS);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${response.status}`);
      const text = extractText(data);
      if (!text) throw new Error('ChatGPT لم يُرجع محتوى قابلاً للقراءة.');
      const formatted = extractJsonObject(text);
      if (Array.isArray(formatted.sections) && formatted.sections.some(s => /^القسم\s+\d+$/i.test(String(s?.heading || '').trim()))) {
        throw new Error('نتيجة OpenAI استخدمت عناوين عامة غير مقبولة.');
      }
      return json({ success: true, provider: 'openai', model: env.MEDLIFE_FORMAT_MODEL || MODEL, article: formatted });
    } catch (error) {
      failures.push(`openai: ${error?.message || 'failed'}`);
    }
  }

  try {
    const headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
    const cookie = request.headers.get('Cookie');
    if (cookie) headers.set('Cookie', cookie);
    const response = await fetchTimed(FALLBACK_WORKER, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'full_edit',
        language: 'ar',
        article: { title: payload.title, category: payload.category, content: payload.content, requirements: developer }
      })
    }, FALLBACK_TIMEOUT_MS);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) throw new Error(data?.error || `HTTP ${response.status}`);
    const formatted = data.article || {};
    if (Array.isArray(formatted.sections) && formatted.sections.some(s => /^القسم\s+\d+$/i.test(String(s?.heading || '').trim()))) {
      throw new Error('مسار MedLife الاحتياطي استخدم عناوين عامة غير مقبولة.');
    }
    return json({ success: true, provider: 'medlife-worker', article: formatted });
  } catch (error) {
    failures.push(`medlife-worker: ${error?.message || 'failed'}`);
  }

  const articleFormatted = deterministicFormat(payload);
  return json({
    success: true,
    provider: 'medlife-deterministic-editorial',
    degraded: true,
    warnings: failures,
    article: articleFormatted
  });
}
