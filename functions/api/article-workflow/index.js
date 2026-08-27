import { authenticateArticleAdmin, json } from '../article-admin-session.js';

const ALLOWED = new Set(['draft','pending','reviewed','scheduled','published','rejected']);

export async function onRequest({ request, env }) {
  if (!env.DB) return json({success:false,error:"Database binding 'DB' is not configured."},500);
  const admin = await authenticateArticleAdmin(request, env.DB);
  if (!admin) return json({success:false,error:'غير مصرح بالدخول إلى إدارة المقالات.'},401);
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS article_workflow_states (article_id INTEGER PRIMARY KEY, workflow_status TEXT NOT NULL DEFAULT 'draft', scheduled_at TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_by INTEGER)`).run();
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (request.method === 'GET') {
      if (Number.isInteger(id) && id > 0) {
        const row = await env.DB.prepare('SELECT * FROM article_workflow_states WHERE article_id=? LIMIT 1').bind(id).first();
        return json({success:true,state:row||{article_id:id,workflow_status:null,scheduled_at:null}});
      }
      const rows = await env.DB.prepare('SELECT * FROM article_workflow_states ORDER BY updated_at DESC').all();
      return json({success:true,states:rows.results||[]});
    }
    if (request.method !== 'PUT') return json({success:false,error:'Method not allowed.'},405);
    const body = await request.json().catch(()=>({}));
    const articleId = Number(body.article_id ?? body.id);
    const state = String(body.workflow_status||body.status||'').trim();
    if (!Number.isInteger(articleId) || articleId <= 0) return json({success:false,error:'معرّف المقال غير صالح.'},400);
    if (!ALLOWED.has(state)) return json({success:false,error:'حالة سير العمل غير صالحة.'},400);
    const article = await env.DB.prepare('SELECT id,status FROM articles WHERE id=? LIMIT 1').bind(articleId).first();
    if (!article) return json({success:false,error:'المقال غير موجود.'},404);
    const scheduledAt = body.scheduled_at ? String(body.scheduled_at).slice(0,80) : null;
    await env.DB.prepare(`INSERT INTO article_workflow_states(article_id,workflow_status,scheduled_at,updated_at,updated_by) VALUES(?,?,?,CURRENT_TIMESTAMP,?) ON CONFLICT(article_id) DO UPDATE SET workflow_status=excluded.workflow_status,scheduled_at=excluded.scheduled_at,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`).bind(articleId,state,scheduledAt,admin.member_id||admin.account_id||null).run();
    return json({success:true,article_id:articleId,workflow_status:state,scheduled_at:scheduledAt});
  } catch (e) {
    console.error('Article workflow error',e);
    return json({success:false,error:'تعذر تحديث سير عمل المقال.'},500);
  }
}
