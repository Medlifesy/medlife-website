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
    sections: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { heading: { type: 'string' }, content: { type: 'string' } }, required: ['heading', 'content'] } },
    conclusion: { type: 'string' },
    editor_notes: { type: 'array', items: { type: 'string' } }
  },
  required: ['title', 'excerpt', 'introduction', 'sections', 'conclusion', 'editor_notes']
};

function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-store' } }); }
function getCookie(request, name) { const raw = request.headers.get('Cookie') || ''; for (const part of raw.split(';')) { const item = part.trim(); if (item.startsWith(name + '=')) return decodeURIComponent(item.slice(name.length + 1)); } return ''; }

async function verifyAdmin(request, env) {
  if (!env?.DB) return false;
  const token = getCookie(request, 'medlife_articles_session');
  if (!token) return false;
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const hash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    const row = await env.DB.prepare(`SELECT a.id AS account_id, a.role, a.account_status FROM member_sessions s JOIN member_accounts a ON a.id=s.account_id WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now') LIMIT 1`).bind(hash).first();
    return !!row && row.account_status === 'active' && ['admin', 'editor', 'reviewer'].includes(String(row.role || '').toLowerCase());
  } catch { return false; }
}

async function fetchTimed(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function extractText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const chunks=[];
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    for (const part of Array.isArray(item?.content) ? item.content : []) if (typeof part?.text === 'string') chunks.push(part.text);
  }
  return chunks.join('\n').trim();
}
function extractModelText(data) { if (typeof data === 'string') return data.trim(); if (typeof data?.response === 'string') return data.response.trim(); if (typeof data?.result === 'string') return data.result.trim(); if (typeof data?.text === 'string') return data.text.trim(); return ''; }

function buildDeveloperInstruction(extra = '') {
  return `You are the dedicated MedLife Arabic medical editorial formatter. Restructure and lightly edit the provided Arabic medical article to match MedLife's established article pattern: concise title and excerpt, short introduction, numbered medical sections with clear headings, readable short paragraphs, useful bullet or numbered lists, red-flags only when medically appropriate, treatment/management only from information in the source, prevention when relevant, and a concise conclusion. Preserve the author's medical facts and meaning. Never invent diagnoses, doses, contraindications, statistics, references, or claims. Do not output HTML or Markdown. Return only the requested JSON.${extra ? `\nAdditional editor instruction: ${extra}` : ''}`;
}

function extractJsonObject(text) {
  const clean = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(clean); } catch {}
  const start = clean.indexOf('{'); const end = clean.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
  throw new Error('لم يرجع نموذج الذكاء الاصطناعي JSON صالحاً.');
}

function deterministicFormat(article) {
  const title = String(article.title || '').trim();
  const excerpt = String(article.excerpt || '').trim();
  const raw = String(article.content || '').replace(/\r/g, '').trim();
  const blocks = raw.split(/\n\s*\n+/).map(x => x.trim()).filter(Boolean);
  const sections = [];
  let introduction = '';
  let conclusion = '';
  let currentHeading = '';
  let currentParts = [];
  const flush = () => { if (currentHeading && currentParts.length) sections.push({ heading: currentHeading, content: currentParts.join('\n\n') }); else if (!currentHeading && currentParts.length && !introduction) introduction = currentParts.join('\n\n'); currentHeading=''; currentParts=[]; };
  for (const block of blocks) {
    const headingMatch = block.match(/^(?:#{1,4}\s*|(?:\d+[.)\-:]\s+))(.{3,180})$/);
    const isConclusion = /^(الخلاصة|الاستنتاج|الخاتمة|conclusion)\s*[:：]?$/i.test(block);
    if (isConclusion) { flush(); currentHeading='الخلاصة'; continue; }
    if (headingMatch) { flush(); currentHeading = headingMatch[1].trim(); continue; }
    if (!currentHeading && !introduction) introduction = block;
    else if (currentHeading === 'الخلاصة') conclusion += (conclusion ? '\n\n' : '') + block;
    else if (!currentHeading) introduction += (introduction ? '\n\n' : '') + block;
    else currentParts.push(block);
  }
  flush();
  if (!introduction && blocks.length) introduction = blocks[0];
  if (!sections.length && blocks.length > 1) {
    blocks.slice(introduction ? 1 : 0).forEach((b, i) => sections.push({ heading: `القسم ${i + 1}`, content: b }));
  }
  if (!conclusion && sections.length) {
    const last = sections[sections.length - 1];
    if (/الخلاصة|الاستنتاج|الختام/i.test(last.heading)) { conclusion = last.content; sections.pop(); }
  }
  return {
    title,
    excerpt,
    introduction,
    sections: sections.map((s, i) => ({ heading: s.heading || `القسم ${i + 1}`, content: s.content })),
    conclusion,
    editor_notes: ['تم استخدام منسق MedLife الأساسي لأن خدمة الذكاء الاصطناعي غير متاحة حاليًا. لم تتم إضافة معلومات طبية جديدة.']
  };
}

export async function onRequestPost({ request, env }) {
  if (!(await verifyAdmin(request, env))) return json({ success:false, error:'غير مصرح.' }, 401);
  let input; try { input = await request.json(); } catch { return json({ success:false, error:'بيانات الطلب غير صالحة.' }, 400); }
  const article = input?.article || {};
  const content = String(article.content || '').trim();
  if (!content) return json({ success:false, error:'محتوى المقال فارغ.' }, 400);

  const payload = { title:String(article.title||'').slice(0,300), category:String(article.category||'').slice(0,160), excerpt:String(article.excerpt||'').slice(0,1200), content:content.slice(0,16000), instruction:String(input?.instruction||'').trim().slice(0,1200) };
  const developer = buildDeveloperInstruction(payload.instruction);
  const failures = [];

  if (env?.AI?.run) {
    try {
      const prompt = `${developer}\n\nReturn EXACTLY one JSON object matching this shape:\n{"title":"","excerpt":"","introduction":"","sections":[{"heading":"","content":""}],"conclusion":"","editor_notes":[]}\n\nARTICLE:\n${JSON.stringify(payload)}`;
      const result = await Promise.race([
        env.AI.run(CF_MODEL, { prompt, max_tokens: 2200, temperature: 0.2 }),
        new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { name: 'AbortError' })), 25000))
      ]);
      const text = extractModelText(result);
      if (!text) throw new Error('Workers AI لم يُرجع نتيجة.');
      return json({ success:true, provider:'cloudflare-workers-ai', model:CF_MODEL, article:extractJsonObject(text) });
    } catch (error) { failures.push(`workers-ai: ${error?.message || 'failed'}`); }
  } else failures.push('workers-ai: binding AI غير مفعّل');

  if (env?.OPENAI_API_KEY) {
    try {
      const response = await fetchTimed(OPENAI_URL, { method:'POST', headers:{ Authorization:`Bearer ${env.OPENAI_API_KEY}`, 'Content-Type':'application/json' }, body:JSON.stringify({ model:env.MEDLIFE_FORMAT_MODEL||MODEL, store:false, input:[{role:'developer',content:developer},{role:'user',content:JSON.stringify(payload)}], text:{format:{type:'json_schema',name:'medlife_article_format',strict:true,schema:SCHEMA}} }) }, TIMEOUT_MS);
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(data?.error?.message||`OpenAI HTTP ${response.status}`);
      if (data?.status === 'incomplete') throw new Error(`ChatGPT incomplete: ${data?.incomplete_details?.reason || 'unknown'}`);
      const refusal = (data?.output||[]).flatMap(x=>Array.isArray(x?.content)?x.content:[]).find(x=>x?.type==='refusal');
      if (refusal?.refusal) throw new Error(refusal.refusal);
      const text = extractText(data); if (!text) throw new Error('ChatGPT لم يُرجع محتوى قابلاً للقراءة.');
      return json({ success:true, provider:'openai', model:env.MEDLIFE_FORMAT_MODEL||MODEL, article:extractJsonObject(text) });
    } catch (error) { failures.push(`openai: ${error?.message || 'failed'}`); }
  } else failures.push('openai: OPENAI_API_KEY غير مفعّل');

  try {
    const headers = new Headers({ 'Content-Type':'application/json', 'Accept':'application/json' });
    const cookie = request.headers.get('Cookie'); if (cookie) headers.set('Cookie', cookie);
    const response = await fetchTimed(FALLBACK_WORKER, { method:'POST', headers, body:JSON.stringify({ action:'full_edit', language:'ar', article:{ title:payload.title, category:payload.category, content:payload.content, requirements:developer } }) }, FALLBACK_TIMEOUT_MS);
    const data = await response.json().catch(()=>({}));
    if (!response.ok || !data?.success) throw new Error(data?.error || `HTTP ${response.status}`);
    return json({ success:true, provider:'medlife-worker', article:data.article });
  } catch (error) { failures.push(`medlife-worker: ${error?.message || 'failed'}`); }

  const articleFormatted = deterministicFormat(payload);
  return json({ success:true, provider:'medlife-deterministic-fallback', degraded:true, warnings:failures, article:articleFormatted });
}
