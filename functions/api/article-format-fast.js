const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MODEL = 'gpt-4.1-mini';
const TIMEOUT_MS = 25000;

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
    const row = await env.DB.prepare(`SELECT a.account_id, a.role, a.account_status FROM member_sessions s JOIN member_accounts a ON a.id=s.account_id WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now') LIMIT 1`).bind(hash).first();
    return !!row && row.account_status === 'active' && ['admin', 'editor', 'reviewer'].includes(String(row.role || '').toLowerCase());
  } catch { return false; }
}

async function fetchTimed(url, options, ms) { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), ms); try { return await fetch(url, { ...options, signal: controller.signal }); } finally { clearTimeout(timer); } }
function extractText(data) { if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim(); const chunks=[]; for (const item of Array.isArray(data?.output) ? data.output : []) for (const part of Array.isArray(item?.content) ? item.content : []) if (typeof part?.text === 'string') chunks.push(part.text); return chunks.join('\n').trim(); }

export async function onRequestPost({ request, env }) {
  if (!(await verifyAdmin(request, env))) return json({ success:false, error:'غير مصرح.' }, 401);
  let input; try { input = await request.json(); } catch { return json({ success:false, error:'بيانات الطلب غير صالحة.' }, 400); }
  const article = input?.article || {}; const content = String(article.content || '').trim();
  if (!content) return json({ success:false, error:'محتوى المقال فارغ.' }, 400);
  if (!env?.OPENAI_API_KEY) return json({ success:false, error:'OPENAI_API_KEY غير مضبوط في Cloudflare لهذا الـEnvironment.' }, 503);

  const payload = { title:String(article.title||'').slice(0,300), category:String(article.category||'').slice(0,160), excerpt:String(article.excerpt||'').slice(0,1200), content:content.slice(0,18000), instruction:String(input?.instruction||'').trim().slice(0,1200) };
  const developer = `You are the dedicated MedLife Arabic medical editorial formatter. Restructure and lightly edit the provided Arabic medical article to match MedLife's established article pattern: concise title and excerpt, short introduction, numbered medical sections with clear headings, readable short paragraphs, useful bullet or numbered lists, red-flags only when medically appropriate, treatment/management only from information in the source, prevention when relevant, and a concise conclusion. Preserve the author's medical facts and meaning. Never invent diagnoses, doses, contraindications, statistics, references, or claims. Do not output HTML or Markdown. Return only the requested JSON.`;

  try {
    const response = await fetchTimed(OPENAI_URL, { method:'POST', headers:{ Authorization:`Bearer ${env.OPENAI_API_KEY}`, 'Content-Type':'application/json' }, body:JSON.stringify({ model:env.MEDLIFE_FORMAT_MODEL||MODEL, store:false, input:[{role:'developer',content:developer},{role:'user',content:JSON.stringify(payload)}], text:{format:{type:'json_schema',name:'medlife_article_format',strict:true,schema:SCHEMA}} }) }, TIMEOUT_MS);
    const data = await response.json().catch(()=>({}));
    if (!response.ok) return json({success:false,error:data?.error?.message||`OpenAI API returned HTTP ${response.status}.`}, response.status);
    if (data?.status === 'incomplete') return json({success:false,error:`لم تكتمل استجابة ChatGPT: ${data?.incomplete_details?.reason || 'incomplete'}.`},502);
    const refusal = (data?.output||[]).flatMap(x=>Array.isArray(x?.content)?x.content:[]).find(x=>x?.type==='refusal');
    if (refusal?.refusal) return json({success:false,error:`ChatGPT رفض الطلب: ${refusal.refusal}`},502);
    const text = extractText(data); if (!text) return json({success:false,error:'ChatGPT لم يُرجع محتوى قابلاً للقراءة.'},502);
    let formatted; try { formatted=JSON.parse(text); } catch(e) { return json({success:false,error:`تعذر قراءة نتيجة ChatGPT كـJSON: ${e?.message||'parse error'}`},502); }
    return json({success:true,provider:'openai',model:env.MEDLIFE_FORMAT_MODEL||MODEL,article:formatted});
  } catch(error) {
    if (error?.name==='AbortError') return json({success:false,error:'انتهت مهلة ChatGPT بعد 25 ثانية. جرّب مقالاً أقصر أو أعد المحاولة.'},504);
    return json({success:false,error:`فشل الاتصال بـChatGPT: ${error?.message||'Unknown error'}`},502);
  }
}
