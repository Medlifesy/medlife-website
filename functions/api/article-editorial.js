import { authenticateArticleAdmin, json } from './article-admin-session.js';

const REVIEW_MODEL = '@cf/meta/llama-3.1-8b-instruct';

export async function onRequest({ request, env }) {
  const user = await authenticateArticleAdmin(request, env.DB);
  if (!user) return json({ success:false, error:'غير مصرح بالدخول إلى الاستوديو التحريري.' }, 401);
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'review';
  try {
    if (request.method === 'GET') {
      const articleId = Number(url.searchParams.get('article_id'));
      if (!Number.isInteger(articleId) || articleId <= 0) return json({success:false,error:'معرّف المقال غير صالح.'},400);
      if (action === 'references') return listReferences(env.DB, articleId);
      if (action === 'revisions') return listRevisions(env.DB, articleId);
      return json({success:false,error:'الإجراء غير صالح.'},400);
    }
    if (request.method !== 'POST') return json({success:false,error:'Method not allowed.'},405);
    const body = await request.json().catch(()=>({}));
    const articleId = Number(body.article_id);
    if (!Number.isInteger(articleId) || articleId <= 0) return json({success:false,error:'معرّف المقال غير صالح.'},400);
    if (action === 'references') return replaceReferences(env.DB, articleId, body.references || []);
    if (action === 'revision') return saveRevision(env.DB, articleId, user, body);
    if (action === 'review') return runEditorialReview(env, articleId, body);
    return json({success:false,error:'الإجراء غير صالح.'},400);
  } catch (error) {
    console.error('Editorial Studio error:', error);
    return json({success:false,error:'تعذر تنفيذ العملية التحريرية حالياً.'},500);
  }
}

async function listReferences(db, articleId) {
  const rows = await db.prepare(`SELECT id,article_id,title,organization,reference_type,year,url,doi,citation_text,is_primary,verified_status,verification_note,created_at,updated_at FROM article_references WHERE article_id=? ORDER BY is_primary DESC,year DESC,id ASC`).bind(articleId).all();
  return json({success:true,references:rows.results||[]});
}

async function replaceReferences(db, articleId, rawReferences) {
  const references = Array.isArray(rawReferences) ? rawReferences.slice(0,30) : [];
  await db.prepare('DELETE FROM article_references WHERE article_id=?').bind(articleId).run();
  for (const item of references) {
    const title = clean(item.title,500);
    if (!title) continue;
    const year = Number(item.year);
    await db.prepare(`INSERT INTO article_references(article_id,title,organization,reference_type,year,url,doi,citation_text,is_primary,verified_status,verification_note,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`)
      .bind(articleId,title,clean(item.organization,300),clean(item.reference_type,80),Number.isInteger(year)&&year>0?year:null,clean(item.url,2000),clean(item.doi,300),clean(item.citation_text,2000),item.is_primary?1:0,['unverified','verified','needs_review','broken'].includes(item.verified_status)?item.verified_status:'unverified',clean(item.verification_note,1000)).run();
  }
  return listReferences(db,articleId);
}

async function listRevisions(db, articleId) {
  const rows = await db.prepare(`SELECT id,article_id,editor_account_id,editor_role,revision_type,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,change_summary,created_at FROM article_revisions WHERE article_id=? ORDER BY datetime(created_at) DESC,id DESC LIMIT 50`).bind(articleId).all();
  return json({success:true,revisions:rows.results||[]});
}

async function saveRevision(db, articleId, user, body) {
  await db.prepare(`INSERT INTO article_revisions(article_id,editor_account_id,editor_role,revision_type,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,change_summary,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
    .bind(articleId,user.account_id||null,user.role||'',clean(body.revision_type,50)||'manual',clean(body.title_ar,500),clean(body.title_en,500),clean(body.excerpt_ar,2000),clean(body.excerpt_en,2000),clean(body.content_ar,100000),clean(body.content_en,100000),clean(body.change_summary,2000)).run();
  return json({success:true,message:'تم حفظ نسخة المراجعة.'});
}

async function runEditorialReview(env, articleId, body) {
  const article = await env.DB.prepare(`SELECT id,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,author_name,category,image_url,status FROM articles WHERE id=? LIMIT 1`).bind(articleId).first();
  if (!article) return json({success:false,error:'المقال غير موجود.'},404);
  const refs = await env.DB.prepare(`SELECT title,organization,reference_type,year,url,doi,citation_text,verified_status FROM article_references WHERE article_id=? ORDER BY year DESC,id ASC`).bind(articleId).all();
  const references = refs.results || [];
  const review = await aiReview(env, article, references);
  return json({success:true,article_id:articleId,review,references});
}

async function aiReview(env, article, references) {
  const prompt = `You are the MedLife medical editorial quality reviewer. Review the Arabic medical article below against the references explicitly supplied by the author. Do not invent references, medical facts, doses, recommendations, statistics, or citations. Your job is to identify issues, not silently rewrite the article. Return ONLY JSON with: overall_score (0-100), readiness ('ready','needs_revision','high_risk'), language_issues (array of concise strings), structure_issues (array), unsupported_claims (array of objects with claim, severity, reason), reference_gaps (array of objects with claim, reason), contradictions (array), safety_flags (array), style_suggestions (array), recommended_actions (array). Score should reflect the evidence available in the provided references, not generic medical knowledge. Treat absence of evidence as a review flag, not proof that the claim is false.\n\nARTICLE:\n${JSON.stringify({title_ar:article.title_ar,title_en:article.title_en,excerpt_ar:article.excerpt_ar,excerpt_en:article.excerpt_en,content_ar:String(article.content_ar||'').slice(0,24000),category:article.category,author_name:article.author_name})}\n\nAUTHOR REFERENCES:\n${JSON.stringify(references).slice(0,18000)}`;
  if (env?.AI?.run) {
    const result = await Promise.race([
      env.AI.run(REVIEW_MODEL,{prompt,max_tokens:2600,temperature:0.1}),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('AI review timeout')),25000))
    ]);
    const text = String(result?.response || result?.result || result?.text || '').trim();
    if (!text) throw new Error('لم تُرجع خدمة AI نتيجة مراجعة.');
    return parseJson(text);
  }
  return {
    overall_score: references.length ? 70 : 45,
    readiness: references.length ? 'needs_revision' : 'high_risk',
    language_issues: [], structure_issues: ['لم يتم تشغيل محرك المراجعة الذكي لأن Workers AI غير مفعّل.'],
    unsupported_claims: [], reference_gaps: references.length ? [] : [{claim:'المقال يحتاج مراجع معتمدة.',reason:'لم يتم إدخال مراجع مرتبطة بالمقال.'}],
    contradictions: [], safety_flags: ['المراجعة البشرية الطبية مطلوبة قبل النشر.'], style_suggestions: [], recommended_actions:['أضف المراجع المعتمدة ثم أعد المراجعة.']
  };
}

function parseJson(text) {
  const cleanText = String(text).replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
  try { return JSON.parse(cleanText); } catch {}
  const start = cleanText.indexOf('{'), end = cleanText.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(cleanText.slice(start,end+1));
  throw new Error('نتيجة المراجعة ليست JSON صالحاً.');
}
function clean(value,max){return String(value??'').trim().slice(0,max);}
