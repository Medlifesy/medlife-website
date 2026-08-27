/* MEDLIFE ARTICLES API
   Public: GET /api/articles, POST /api/articles (submission)
   Admin: GET /api/articles?admin=1, PUT /api/articles, DELETE /api/articles?id=123
   Admin authentication uses member_accounts + member_sessions in the existing DB binding.
*/
import { authenticateArticleAdmin, json } from '../article-admin-session.js';

export async function onRequest({ request, env }) {
  const method = request.method.toUpperCase();
  if (method === 'OPTIONS') return json({ success: true });
  if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);
  try {
    const url = new URL(request.url), isAdmin = url.searchParams.get('admin') === '1';
    if (method === 'GET') {
      if (isAdmin) {
        const user = await authenticateArticleAdmin(request, env.DB);
        if (!user) return json({ success:false,error:'غير مصرح بالدخول إلى إدارة المقالات.' },401);
        return listAllArticles(env.DB,user);
      }
      return listPublishedArticles(env.DB);
    }
    if (method === 'POST') {
      const user = await authenticateArticleAdmin(request, env.DB);
      return createArticle(request, env.DB, user, !user);
    }
    if (method === 'PUT') {
      const user=await authenticateArticleAdmin(request,env.DB);
      if(!user)return json({success:false,error:'غير مصرح بالدخول إلى إدارة المقالات.'},401);
      return updateArticle(request,env.DB,user);
    }
    if (method === 'DELETE') {
      const user=await authenticateArticleAdmin(request,env.DB);
      if(!user)return json({success:false,error:'غير مصرح بالدخول إلى إدارة المقالات.'},401);
      if(user.role!=='admin')return json({success:false,error:'حذف المقالات متاح لمدير النظام فقط.'},403);
      return deleteArticle(request,env.DB);
    }
    return json({success:false,error:'Method not allowed.'},405);
  } catch (error) {
    console.error('Articles API error:',error);
    return json({success:false,error:'تعذر تنفيذ طلب المقالات حالياً.'},500);
  }
}

async function ensureEditorialBriefTable(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS article_editorial_briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL UNIQUE,
    article_type TEXT DEFAULT '',
    intended_audience TEXT DEFAULT '',
    suggested_sections TEXT DEFAULT '',
    key_questions TEXT DEFAULT '',
    desired_tone TEXT DEFAULT '',
    visual_preferences TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

async function readBrief(db,articleId){
  try{await ensureEditorialBriefTable(db);return await db.prepare('SELECT * FROM article_editorial_briefs WHERE article_id=? LIMIT 1').bind(articleId).first();}
  catch{return null;}
}

async function saveBrief(db,articleId,brief){
  if(!brief)return;
  await ensureEditorialBriefTable(db);
  await db.prepare(`INSERT INTO article_editorial_briefs(article_id,article_type,intended_audience,suggested_sections,key_questions,desired_tone,visual_preferences,notes,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ON CONFLICT(article_id) DO UPDATE SET article_type=excluded.article_type,intended_audience=excluded.intended_audience,suggested_sections=excluded.suggested_sections,key_questions=excluded.key_questions,desired_tone=excluded.desired_tone,visual_preferences=excluded.visual_preferences,notes=excluded.notes,updated_at=CURRENT_TIMESTAMP`)
    .bind(articleId,clean(brief.article_type,100),clean(brief.intended_audience,500),clean(brief.suggested_sections,4000),clean(brief.key_questions,4000),clean(brief.desired_tone,500),clean(brief.visual_preferences,1000),clean(brief.notes,4000)).run();
}

async function listPublishedArticles(db){
  const result=await db.prepare(`SELECT id,title_ar,title_en,excerpt_ar,excerpt_en,author_member_id,author_name,author_email,category,image_url,status,rejection_reason,published_at,created_at,updated_at FROM articles WHERE status='published' ORDER BY COALESCE(published_at,created_at) DESC,id DESC`).all();
  const seen=new Set(),articles=[];
  for(const article of result.results||[]){const key=normalizeTitle(article.title_ar)||normalizeTitle(article.title_en);if(!key||!seen.has(key)){articles.push(article);if(key)seen.add(key);}}
  return json({success:true,articles,count:articles.length});
}

async function listAllArticles(db,user){
  const result=await db.prepare(`SELECT id,title_ar,title_en,content_ar,content_en,excerpt_ar,excerpt_en,author_member_id,author_name,author_email,category,image_url,status,rejection_reason,published_at,created_at,updated_at FROM articles ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'draft' THEN 1 WHEN 'published' THEN 2 WHEN 'rejected' THEN 3 ELSE 4 END,datetime(created_at) DESC,id DESC`).all();
  const articles=result.results||[];
  await ensureEditorialBriefTable(db);
  for(const article of articles) article.editorial_brief=await readBrief(db,article.id);
  return json({success:true,admin:{member_id:user.member_id,account_id:user.account_id,username:user.username,role:user.role,display_name:user.display_name||user.username},articles,summary:{total:articles.length,pending:articles.filter(a=>a.status==='pending').length,published:articles.filter(a=>a.status==='published').length,rejected:articles.filter(a=>a.status==='rejected').length,draft:articles.filter(a=>a.status==='draft').length}});
}

async function createArticle(request,db,user,publicSubmission=false){
  const b=await request.json(),titleAr=clean(b.title_ar,500),titleEn=clean(b.title_en,500),contentAr=cleanContent(b.content_ar),contentEn=cleanContent(b.content_en),excerptAr=clean(b.excerpt_ar,2000),excerptEn=clean(b.excerpt_en,2000),authorName=clean(b.author_name||user?.display_name||user?.username,200),authorEmail=clean(b.author_email,200),category=clean(b.category,100),imageUrl=clean(b.image_url,2000),requestedMemberId=Number(b.author_member_id),requestedStatus=clean(b.status,30);
  const contentError=validateContentSize(contentAr,contentEn);if(contentError)return json({success:false,error:contentError},413);
  if(!titleAr||!contentAr||!authorName)return json({success:false,error:'العنوان العربي والمحتوى العربي واسم الكاتب حقول مطلوبة.'},400);
  const duplicate=await db.prepare(`SELECT id,status FROM articles WHERE lower(trim(title_ar))=lower(trim(?)) AND status IN ('published','pending','draft') ORDER BY id DESC LIMIT 1`).bind(titleAr).first();
  if(duplicate)return json({success:false,error:'يوجد مقال آخر بالعنوان نفسه بالفعل.',duplicate_id:duplicate.id,duplicate_status:duplicate.status},409);

  let authorMemberId=publicSubmission?null:user?.member_id;
  if(!publicSubmission && Number.isInteger(requestedMemberId)&&requestedMemberId>0){
    if(user.role!=='admin'&&requestedMemberId!==user.member_id)return json({success:false,error:'لا يمكنك إنشاء مقال باسم عضو آخر.'},403);
    const member=await db.prepare('SELECT id FROM members WHERE id=? LIMIT 1').bind(requestedMemberId).first();
    if(!member)return json({success:false,error:'عضو MedLife غير موجود.'},400);
    authorMemberId=member.id;
  }

  const status=publicSubmission?'pending':(['draft','published'].includes(requestedStatus)&&['admin','reviewer'].includes(String(user?.role||'').toLowerCase())?requestedStatus:'pending');
  const result=await db.prepare(`INSERT INTO articles(title_ar,title_en,content_ar,content_en,excerpt_ar,excerpt_en,author_member_id,author_name,author_email,category,image_url,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?, ?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(titleAr,titleEn,contentAr,contentEn,excerptAr,excerptEn,authorMemberId,authorName,authorEmail,category,imageUrl,status).run();
  const articleId=result.meta?.last_row_id??null;
  const references=Array.isArray(b.references)?b.references.slice(0,50):[];
  if(articleId&&references.length){for(const item of references){const title=clean(item?.title,500);if(!title)continue;const year=Number(item?.year);await db.prepare(`INSERT INTO article_references(article_id,title,organization,reference_type,year,url,doi,citation_text,is_primary,verified_status,verification_note,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(articleId,title,clean(item.organization,300),clean(item.reference_type,80),Number.isInteger(year)&&year>0?year:null,clean(item.url,2000),clean(item.doi,300),clean(item.citation_text,2000),item.is_primary?1:0,'unverified','').run();}}
  await saveBrief(db,articleId,b.editorial_brief);
  return json({success:true,message:'تم إرسال المقال للمراجعة بنجاح.',id:articleId,status},201);
}

async function updateArticle(request,db,user){
  const b=await request.json(),id=Number(b.id),status=clean(b.status,30),rejectionReason=clean(b.rejection_reason,2000);if(!Number.isInteger(id)||id<=0)return json({success:false,error:'معرّف المقال غير صالح.'},400);if(!['draft','pending','published','rejected'].includes(status))return json({success:false,error:'حالة المقال غير صالحة.'},400);if((status==='published'||status==='rejected')&&!['admin','reviewer'].includes(user.role))return json({success:false,error:'هذه العملية تتطلب صلاحية مدير أو مراجع.'},403);const article=await db.prepare('SELECT * FROM articles WHERE id=? LIMIT 1').bind(id).first();if(!article)return json({success:false,error:'المقال غير موجود.'},404);if(status==='rejected'&&!rejectionReason)return json({success:false,error:'يرجى كتابة سبب رفض المقال.'},400);
  const titleAr=clean(b.title_ar??article.title_ar,500),titleEn=clean(b.title_en??article.title_en,500),contentAr=cleanContent(b.content_ar??article.content_ar),contentEn=cleanContent(b.content_en??article.content_en),excerptAr=clean(b.excerpt_ar??article.excerpt_ar,2000),excerptEn=clean(b.excerpt_en??article.excerpt_en,2000),authorName=clean(b.author_name??article.author_name,200),authorEmail=clean(b.author_email??article.author_email,200),category=clean(b.category??article.category,100),imageUrl=clean(b.image_url??article.image_url,2000);
  const contentError=validateContentSize(contentAr,contentEn);if(contentError)return json({success:false,error:contentError},413);
  if(!titleAr||!contentAr||!authorName)return json({success:false,error:'العنوان العربي والمحتوى العربي واسم الكاتب حقول مطلوبة.'},400);if(status!=='rejected'){const duplicate=await db.prepare(`SELECT id FROM articles WHERE id<>? AND lower(trim(title_ar))=lower(trim(?)) AND status IN ('published','pending','draft') LIMIT 1`).bind(id,titleAr).first();if(duplicate)return json({success:false,error:'يوجد مقال آخر بالعنوان نفسه بالفعل.',duplicate_id:duplicate.id},409)}const publishedAt=status==='published'?(article.published_at||new Date().toISOString()):null;await db.prepare(`UPDATE articles SET title_ar=?,title_en=?,content_ar=?,content_en=?,excerpt_ar=?,excerpt_en=?,author_name=?,author_email=?,category=?,image_url=?,status=?,rejection_reason=?,published_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(titleAr,titleEn,contentAr,contentEn,excerptAr,excerptEn,authorName,authorEmail,category,imageUrl,status,status==='rejected'?rejectionReason:null,publishedAt,id).run();await saveBrief(db,id,b.editorial_brief);return json({success:true,message:status==='published'?'تم حفظ التعديلات ونشر المقال.':status==='rejected'?'تم رفض المقال وحفظ سبب الرفض.':'تم حفظ تعديلات المقال.',id,status});}
async function deleteArticle(request,db){const id=Number(new URL(request.url).searchParams.get('id'));if(!Number.isInteger(id)||id<=0)return json({success:false,error:'معرّف المقال غير صالح.'},400);const result=await db.prepare('DELETE FROM articles WHERE id=?').bind(id).run();if(!result.meta?.changes)return json({success:false,error:'المقال غير موجود.'},404);return json({success:true,message:'تم حذف المقال بنجاح.',id});}
function clean(value,max){return String(value??'').trim().slice(0,max)}
function cleanContent(value){return String(value??'').trim()}
function validateContentSize(contentAr,contentEn){const limit=1800000;const enc=new TextEncoder();if(enc.encode(contentAr).byteLength>limit)return 'المحتوى العربي كبير جداً على قاعدة البيانات. لم يتم قصّه؛ يرجى تقليل حجم المحتوى أو الصور المضمّنة ثم إعادة الإرسال.';if(enc.encode(contentEn).byteLength>limit)return 'المحتوى الإنكليزي كبير جداً على قاعدة البيانات. لم يتم قصّه؛ يرجى تقليل حجمه ثم إعادة الإرسال.';return null}
function normalizeTitle(value){return String(value??'').normalize('NFKC').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[إأآٱ]/g,'ا').replace(/[ى]/g,'ي').replace(/[ؤ]/g,'و').replace(/[ئ]/g,'ي').replace(/[ـ]/g,'').replace(/[“”\"'`]/g,'').replace(/[،,:؛.!؟?()\[\]{}]/g,' ').replace(/\s+/g,' ').trim().toLowerCase()}
