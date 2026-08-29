import { authenticateArticleAdmin } from './article-admin-session.js';

const DATA_SOURCE_ID = '6fdacc1d-7b08-4a25-8e85-4cbeff40bc25';
const NOTION_VERSION = '2025-09-03';
const DEFAULT_PAGE_SIZE = 100;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store, no-cache, must-revalidate, max-age=0' } });
}
function textProperty(property) {
  if (!property) return '';
  if (property.type === 'title') return (property.title ?? []).map(x => x?.plain_text ?? '').join('').trim();
  if (property.type === 'rich_text') return (property.rich_text ?? []).map(x => x?.plain_text ?? '').join('').trim();
  if (property.type === 'url') return String(property.url ?? '').trim();
  if (property.type === 'number') return property.number == null ? '' : String(property.number);
  if (property.type === 'select') return property.select?.name ?? '';
  if (property.type === 'status') return property.status?.name ?? '';
  if (property.type === 'people') return (property.people ?? []).map(x => x?.name ?? '').filter(Boolean).join('، ');
  if (property.type === 'relation') return (property.relation ?? []).map(x => x?.id ?? '').filter(Boolean).join(',');
  return '';
}
function dateProperty(property) { return property?.date?.start ?? ''; }
function mapPage(page) {
  const p = page?.properties ?? {};
  return { id: page.id, url: page.url ?? null, title: textProperty(p['عنوان المحتوى']), cell: textProperty(p['الخلية']), unit: textProperty(p['القسم / الوحدة']), status: textProperty(p['الحالة']), priority: textProperty(p['الأولوية']), author: textProperty(p['الكاتب']), cellManager: textProperty(p['مسؤول الخلية']), due: dateProperty(p['تاريخ التسليم الفعلي']), publish: dateProperty(p['تاريخ النشر']), updated: page.last_edited_time ?? '', published: p['تم النشر']?.checkbox === true, designUrl: textProperty(p['رابط التصميم']) || null, publishedUrl: textProperty(p['رابط المنشور']) || null };
}
async function notionQuery(env, body = {}) {
  if (!env.NOTION_API_TOKEN) throw new Error('NOTION_API_TOKEN is not configured');
  const response = await fetch(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`, { method: 'POST', headers: { Authorization: `Bearer ${env.NOTION_API_TOKEN}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' }, body: JSON.stringify({ page_size: DEFAULT_PAGE_SIZE, ...body }) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || payload?.code || `Notion API returned ${response.status}`);
  return payload;
}
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (url.searchParams.get('action') !== 'list') return json({ success: false, error: 'Unsupported action.' }, 405);
  if (request.method !== 'GET') return json({ success: false, error: 'Method not allowed.' }, 405);
  if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);
  const admin = await authenticateArticleAdmin(request, env.DB);
  if (!admin) return json({ success: false, authenticated: false, error: 'يجب تسجيل الدخول بحساب إدارة مصرح له.' }, 401);
  try {
    const cell = url.searchParams.get('cell')?.trim() || '';
    const status = url.searchParams.get('status')?.trim() || '';
    const body = {};
    const filters = [];
    if (cell) filters.push({ property: 'الخلية', select: { equals: cell } });
    if (status) filters.push({ property: 'الحالة', select: { equals: status } });
    if (filters.length === 1) body.filter = filters[0];
    if (filters.length > 1) body.filter = { and: filters };
    body.sorts = [{ timestamp: 'last_edited_time', direction: 'descending' }];
    const payload = await notionQuery(env, body);
    return json({ success: true, identity: { label: admin.display_name || admin.username || 'مركز المحتوى' }, dataSourceId: DATA_SOURCE_ID, items: (payload.results ?? []).map(mapPage), hasMore: Boolean(payload.has_more), nextCursor: payload.next_cursor ?? null });
  } catch (error) {
    console.error('content-center notion error', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Unable to load Notion data.' }, 502);
  }
}
