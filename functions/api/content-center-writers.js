const NOTION_VERSION = '2025-09-03';
const COOKIE = 'medlife_content_center_session';
const enc = new TextEncoder();

const WRITER_DS = {
  'Neuron Cells': '7c5df679-7ca3-479a-bb0f-016c7834c583',
  'Brain Cells': '1653de24-5d4c-800b-9da5-000bbd1c9b79',
  'Stem Cells': '42c000f4-799e-4b3b-90ad-68ef76809e6d',
  'Leukocyte': '38201ea2-a074-4dfb-b707-9d6485c41260',
  'Red Blood': 'fb2da9b3-010b-45cb-955c-c6c3ef48c34d',
  'Heart Cell': 'a43004a2-9400-458c-9f11-93fbbaa06e30',
  'Plasma Cell': '842398ff-cf96-4740-bdf0-5f9ab6f6caa0'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
}
function hex(bytes) { return Array.from(new Uint8Array(bytes)).map(x => x.toString(16).padStart(2, '0')).join(''); }
async function sha(value) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(value))); }
function cookieValue(request) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const p = part.trim();
    if (p.startsWith(COOKIE + '=')) return decodeURIComponent(p.slice(COOKIE.length + 1));
  }
  return null;
}
function text(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return (prop.title || []).map(x => x.plain_text || '').join('').trim();
  if (prop.type === 'rich_text') return (prop.rich_text || []).map(x => x.plain_text || '').join('').trim();
  if (prop.type === 'select') return prop.select?.name || '';
  return '';
}
function writerName(properties) {
  return text(properties?.['اسم الكاتب']) || text(properties?.Name) || text(properties?.الاسم) || '';
}
async function notion(env, path, init = {}) {
  if (!env.NOTION_API_TOKEN) throw Error('NOTION_API_TOKEN is not configured');
  const response = await fetch('https://api.notion.com' + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.NOTION_API_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(data.message || data.code || `Notion ${response.status}`);
  return data;
}
async function identity(request, env, db) {
  const token = cookieValue(request);
  if (!token) return null;
  const row = await db.prepare("SELECT account_page_id FROM content_center_sessions WHERE token_hash=?1 AND datetime(expires_at)>datetime('now') LIMIT 1").bind(await sha(token)).first();
  if (!row) return null;
  const page = await notion(env, `/v1/pages/${row.account_page_id}`);
  const p = page.properties || {};
  return { cell: text(p['الخلية']), role: text(p['الدور']), status: text(p['الحالة']) };
}
async function queryAll(env, dataSourceId) {
  let out = [], cursor;
  for (let i = 0; i < 10; i++) {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const data = await notion(env, `/v1/data_sources/${dataSourceId}/query`, { method: 'POST', body: JSON.stringify(body) });
    out.push(...(data.results || []));
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return out;
}
function title(value) { return { title: [{ text: { content: String(value) } }] }; }
function select(value) { return { select: { name: String(value) } }; }
function number(value) { return { number: Number(value) }; }
function richText(value) { return { rich_text: value ? [{ text: { content: String(value) } }] : [] }; }

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ success: false, error: 'Database binding DB is not configured.' }, 500);
  try {
    const me = await identity(request, env, env.DB);
    if (!me || me.status !== 'فعّال' || !['مسؤول خلية', 'مشرف خلية'].includes(me.role)) return json({ success: false, error: 'Unauthorized' }, 401);
    const ds = WRITER_DS[String(me.cell || '').trim()];
    if (!ds) return json({ success: false, error: `لم يتم ربط قائمة كتّاب الخلية «${me.cell || 'غير محددة'}» بعد.` }, 404);

    if (request.method === 'GET') {
      const rows = await queryAll(env, ds);
      const writers = rows.map(page => {
        const p = page.properties || {};
        return { id: page.id, name: writerName(p), status: text(p['الحالة']) || 'فعال' };
      }).filter(x => x.name && x.status !== 'منسحب').sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      return json({ success: true, cell: me.cell, writers });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const name = String(body.name || '').trim();
      if (!name) return json({ success: false, error: 'اسم الكاتب مطلوب.' }, 400);
      const rows = await queryAll(env, ds);
      const existing = rows.find(page => writerName(page.properties || '') === name);
      if (existing) return json({ success: true, existing: true, writer: { id: existing.id, name } });

      const properties = ds === WRITER_DS['Plasma Cell']
        ? {
            'اسم الكاتب': title(name),
            'الخلية': select(me.cell),
            'الحالة': select('فعال'),
            'المنشورات': number(0),
            'المكتمل': number(0),
            'التقييم': number(0),
            'ملاحظات': richText('')
          }
        : { Name: title(name) };

      const page = await notion(env, '/v1/pages', {
        method: 'POST',
        body: JSON.stringify({ parent: { data_source_id: ds }, properties })
      });
      return json({ success: true, writer: { id: page.id, name } }, 201);
    }

    return json({ success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('content-center-writers', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'تعذر تنفيذ الطلب.' }, 502);
  }
}
