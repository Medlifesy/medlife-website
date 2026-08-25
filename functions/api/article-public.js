export async function onRequest({ request, env }) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'GET') return json({ success: false, error: 'Method not allowed.' }, 405, cors);
  if (!env.DB) return json({ success: false, error: 'Database unavailable.' }, 500, cors);
  try {
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) return json({ success: false, error: 'معرّف المقال غير صالح.' }, 400, cors);
    const article = await env.DB.prepare(`SELECT id,title_ar,title_en,content_ar,content_en,excerpt_ar,excerpt_en,author_member_id,author_name,author_email,category,image_url,status,published_at,created_at,updated_at FROM articles WHERE id=? AND status='published' LIMIT 1`).bind(id).first();
    if (!article) return json({ success: false, error: 'المقال غير موجود أو غير منشور.' }, 404, cors);
    return json({ success: true, article }, 200, cors);
  } catch (error) {
    console.error('Public article API error:', error);
    return json({ success: false, error: 'تعذر تحميل المقال.' }, 500, cors);
  }
}
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra } });
}
