import { authenticateArticleAdmin, json } from '../article-admin-session.js';

const ALLOWED_STATUS = new Set(['draft','pending','reviewed','scheduled','published','rejected']);
function normalizeContent(value){let s=String(value??'').trim();s=s.replace(/\\(?=<\/?[a-z][^>]*>)/gi,'');s=s.replace(/&nbsp;/gi,' ');s=s.replace(/&#x20;/gi,' ');return s;}
function slugify(value){return String(value||'article').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'article';}
async function ensureCanonical(db){for(const [column,type] of [['slug','TEXT'],['canonical_path','TEXT']]){try{await db.prepare(`ALTER TABLE articles ADD COLUMN ${column} ${type}`).run();}catch(e){if(!String(e?.message||e).toLowerCase().includes('duplicate column'))throw e;}}try{await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug_unique ON articles(slug)').run();}catch{}}
async function uniqueSlug(db,title,id=null){const base=slugify(title);let candidate=base;for(let i=0;i<20;i++){const row=id?await db.prepare('SELECT id FROM articles WHERE slug=? AND id<>? LIMIT 1').bind(candidate,id).first():await db.prepare('SELECT id FROM articles WHERE slug=? LIMIT 1').bind(candidate).first();if(!row)return candidate;candidate=`${base}-${crypto.randomUUID().slice(0,8)}`;}return `${base}-${Date.now().toString(36)}`;}
function cleanBody(body={}){const status=String(body.status||'draft').trim();return {title_ar:String(body.title_ar||'').trim(),title_en:String(body.title_en||'').trim(),excerpt_ar:String(body.excerpt_ar||'').trim(),excerpt_en:String(body.excerpt_en||'').trim(),content_ar:normalizeContent(body.content_ar),content_en:normalizeContent(body.content_en),author_name:String(body.author_name||'').trim(),author_email:String(body.author_email||'').trim(),category:String(body.category||'').trim(),image_url:String(body.image_url||'').trim(),status:ALLOWED_STATUS.has(status)?status:'draft',slug:String(body.slug||'').trim(),author_member_id:body.author_member_id ?? body.member_id ?? null,rejection_reason:String(body.rejection_reason||'').trim()};}
export async function onRequest({request,env}){
  if(!env.DB)return json({success:false,error:"Database binding 'DB' is not configured."},500);
  const admin=await authenticateArticleAdmin(request,env.DB);
  if(!admin)return json({success:false,authenticated:false,error:'تعذر التحقق من جلسة الإدارة.'},401);
  try{
    const db=env.DB;await ensureCanonical(db);const url=new URL(request.url);let id=Number(url.searchParams.get('id'));let body=null;
    if(request.method==='POST'||request.method==='PUT'){body=await request.json().catch(()=>({}));if((!Number.isInteger(id)||id<=0)&&body?.id!=null)id=Number(body.id);}
    if(request.method==='GET'){
      if(Number.isInteger(id)&&id>0){const row=await db.prepare('SELECT * FROM articles WHERE id=? LIMIT 1').bind(id).first();return row?json({success:true,article:row}):json({success:false,error:'المقال غير موجود.'},404);}
      const rows=(await db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all()).results||[];return json({success:true,articles:rows,summary:{total:rows.length,pending:rows.filter(x=>x.status==='pending').length,published:rows.filter(x=>x.status==='published').length,rejected:rows.filter(x=>x.status==='rejected').length,draft:rows.filter(x=>x.status==='draft').length}});
    }
    if(request.method==='POST'){
      const b=cleanBody(body||{});if(!b.title_ar||!b.author_name)return json({success:false,error:'عنوان المقال واسم الكاتب مطلوبان.'},400);const articleSlug=await uniqueSlug(db,b.slug||b.title_ar||b.title_en);const r=await db.prepare(`INSERT INTO articles (title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,author_name,author_email,category,image_url,status,slug,canonical_path,author_member_id,rejection_reason) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(b.title_ar,b.title_en,b.excerpt_ar,b.excerpt_en,b.content_ar,b.content_en,b.author_name,b.author_email,b.category,b.image_url,b.status,articleSlug,'/articles/'+articleSlug,b.author_member_id,b.rejection_reason).run();const article=await db.prepare('SELECT * FROM articles WHERE id=?').bind(r.meta.last_row_id).first();return json({success:true,...article},201);
    }
    if(request.method==='PUT'){
      if(!Number.isInteger(id)||id<=0)return json({success:false,error:'معرّف المقال غير صالح.'},400);const current=await db.prepare('SELECT * FROM articles WHERE id=? LIMIT 1').bind(id).first();if(!current)return json({success:false,error:'المقال غير موجود.'},404);const b=cleanBody(body||{});if(!b.title_ar||!b.author_name)return json({success:false,error:'عنوان المقال واسم الكاتب مطلوبان.'},400);const articleSlug=await uniqueSlug(db,b.slug||current.slug||b.title_ar||b.title_en,id);await db.prepare(`UPDATE articles SET title_ar=?,title_en=?,excerpt_ar=?,excerpt_en=?,content_ar=?,content_en=?,author_name=?,author_email=?,category=?,image_url=?,status=?,slug=?,canonical_path=?,author_member_id=?,rejection_reason=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(b.title_ar,b.title_en,b.excerpt_ar,b.excerpt_en,b.content_ar,b.content_en,b.author_name,b.author_email,b.category,b.image_url,b.status,articleSlug,'/articles/'+articleSlug,b.author_member_id,b.rejection_reason,id).run();const article=await db.prepare('SELECT * FROM articles WHERE id=?').bind(id).first();return json({success:true,...article});
    }
    if(request.method==='DELETE'){
      if(!Number.isInteger(id)||id<=0)return json({success:false,error:'معرّف المقال غير صالح.'},400);const current=await db.prepare('SELECT id,status FROM articles WHERE id=? LIMIT 1').bind(id).first();if(!current)return json({success:false,error:'المقال غير موجود.'},404);if(current.status==='published')return json({success:false,error:'لا يمكن حذف مقال منشور من هذه الواجهة.'},409);await db.prepare('DELETE FROM articles WHERE id=?').bind(id).run();return json({success:true});
    }
    return json({success:false,error:'Method not allowed.'},405);
  }catch(error){console.error('Articles admin D1 API error',error);return json({success:false,error:'تعذر تنفيذ عملية إدارة المقالات حالياً.'},500);}
}
