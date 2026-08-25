import { authenticateArticleAdmin, json } from './article-admin-session.js';

const REVIEW_MODEL='@cf/meta/llama-3.1-8b-instruct';

export async function onRequest({request,env}){
  if(!env?.DB)return json({success:false,error:'Database binding DB is not configured.'},500);
  const user=await authenticateArticleAdmin(request,env.DB);
  if(!user)return json({success:false,error:'غير مصرح بالدخول إلى الاستوديو التحريري.'},401);
  try{
    await ensureEditorialSchema(env.DB);
    const url=new URL(request.url),action=url.searchParams.get('action')||'review';
    if(request.method==='GET'){
      const articleId=validId(url.searchParams.get('article_id'));if(!articleId)return json({success:false,error:'معرّف المقال غير صالح.'},400);
      if(action==='references')return listReferences(env.DB,articleId);
      if(action==='revisions')return listRevisions(env.DB,articleId);
      return json({success:false,error:'الإجراء غير صالح.'},400);
    }
    if(request.method!=='POST')return json({success:false,error:'Method not allowed.'},405);
    const body=await request.json().catch(()=>({})),articleId=validId(body.article_id);if(!articleId)return json({success:false,error:'معرّف المقال غير صالح.'},400);
    if(action==='references')return replaceReferences(env.DB,articleId,body.references||[]);
    if(action==='revision')return saveRevision(env.DB,articleId,user,body);
    if(action==='review')return runEditorialReview(env,articleId);
    return json({success:false,error:'الإجراء غير صالح.'},400);
  }catch(error){console.error('Editorial Studio error',error);return json({success:false,error:`تعذر تنفيذ العملية التحريرية حالياً: ${error?.message||'Unknown error'}`},500);}
}

function validId(v){const n=Number(v);return Number.isInteger(n)&&n>0?n:0;}
function clean(v,max){return String(v??'').trim().slice(0,max);}

async function ensureEditorialSchema(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS article_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT, article_id INTEGER NOT NULL, title TEXT NOT NULL,
    organization TEXT, reference_type TEXT, year INTEGER, url TEXT, doi TEXT, citation_text TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0, verified_status TEXT NOT NULL DEFAULT 'unverified', verification_note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_article_references_article ON article_references(article_id)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_article_references_status ON article_references(verified_status)').run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS article_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, article_id INTEGER NOT NULL,
    editor_account_id INTEGER, editor_role TEXT, revision_type TEXT NOT NULL DEFAULT 'manual',
    title_ar TEXT, title_en TEXT, excerpt_ar TEXT, excerpt_en TEXT, content_ar TEXT, content_en TEXT,
    change_summary TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_article_revisions_article ON article_revisions(article_id)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_article_revisions_created ON article_revisions(created_at)').run();
}

async function listReferences(db,articleId){
  const r=await db.prepare(`SELECT id,article_id,title,organization,reference_type,year,url,doi,citation_text,is_primary,verified_status,verification_note,created_at,updated_at FROM article_references WHERE article_id=? ORDER BY is_primary DESC,year DESC,id ASC`).bind(articleId).all();
  return json({success:true,references:r.results||[]});
}

async function replaceReferences(db,articleId,raw){
  const refs=Array.isArray(raw)?raw.slice(0,30):[];
  await db.prepare('DELETE FROM article_references WHERE article_id=?').bind(articleId).run();
  for(const item of refs){
    const title=clean(item.title,500);if(!title)continue;const year=Number(item.year);
    await db.prepare(`INSERT INTO article_references(article_id,title,organization,reference_type,year,url,doi,citation_text,is_primary,verified_status,verification_note,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`)
      .bind(articleId,title,clean(item.organization,300),clean(item.reference_type,80),Number.isInteger(year)&&year>0?year:null,clean(item.url,2000),clean(item.doi,300),clean(item.citation_text,2000),item.is_primary?1:0,['unverified','verified','needs_review','broken'].includes(item.verified_status)?item.verified_status:'unverified',clean(item.verification_note,1000)).run();
  }
  return listReferences(db,articleId);
}

async function listRevisions(db,articleId){
  const r=await db.prepare(`SELECT id,article_id,editor_account_id,editor_role,revision_type,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,change_summary,created_at FROM article_revisions WHERE article_id=? ORDER BY datetime(created_at) DESC,id DESC LIMIT 50`).bind(articleId).all();
  return json({success:true,revisions:r.results||[]});
}

async function saveRevision(db,articleId,user,body){
  await db.prepare(`INSERT INTO article_revisions(article_id,editor_account_id,editor_role,revision_type,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,change_summary,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
    .bind(articleId,user.account_id||null,user.role||'',clean(body.revision_type,50)||'manual',clean(body.title_ar,500),clean(body.title_en,500),clean(body.excerpt_ar,2000),clean(body.excerpt_en,2000),clean(body.content_ar,100000),clean(body.content_en,100000),clean(body.change_summary,2000)).run();
  return json({success:true,message:'تم حفظ نسخة المراجعة.'});
}

async function runEditorialReview(env,articleId){
  const article=await env.DB.prepare(`SELECT id,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,author_name,category,image_url,status FROM articles WHERE id=? LIMIT 1`).bind(articleId).first();
  if(!article)return json({success:false,error:'المقال غير موجود.'},404);
  const refs=await env.DB.prepare(`SELECT title,organization,reference_type,year,url,doi,citation_text,verified_status FROM article_references WHERE article_id=? ORDER BY year DESC,id ASC`).bind(articleId).all();
  const references=refs.results||[];
  return json({success:true,article_id:articleId,review:await aiReview(env,article,references),references});
}

async function aiReview(env,article,references){
  if(env?.AI?.run){
    const prompt=`You are the MedLife medical editorial quality reviewer. Review the Arabic medical article against ONLY the references supplied by the author. Do not invent facts, references, doses, recommendations, statistics, or citations. Return ONLY JSON with keys: overall_score,readiness,language_issues,structure_issues,unsupported_claims,reference_gaps,contradictions,safety_flags,style_suggestions,recommended_actions. unsupported_claims and reference_gaps must be arrays of objects. Score evidence availability, not generic medical knowledge.\nARTICLE:\n${JSON.stringify({title_ar:article.title_ar,title_en:article.title_en,excerpt_ar:article.excerpt_ar,content_ar:String(article.content_ar||'').slice(0,24000),category:article.category})}\nAUTHOR REFERENCES:\n${JSON.stringify(references).slice(0,18000)}`;
    try{
      const result=await Promise.race([env.AI.run(REVIEW_MODEL,{prompt,max_tokens:2600,temperature:0.1}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('AI review timeout')),25000))]);
      const text=String(result?.response||result?.result||result?.text||'').trim();if(!text)throw new Error('AI returned no result');
      return parseJson(text);
    }catch(error){return deterministicReview(article,references,`Workers AI unavailable: ${error?.message||'failed'}`);}
  }
  return deterministicReview(article,references,'Workers AI binding AI غير مفعّل.');
}

function deterministicReview(article,references,reason){
  const content=String(article.content_ar||'').trim(),blocks=content.split(/\n\s*\n+/).map(x=>x.trim()).filter(Boolean),language=[],structure=[],gaps=[],safety=['المراجعة البشرية الطبية مطلوبة قبل النشر.'];
  if(!references.length)gaps.push({claim:'المقال ككل',reason:'لا توجد مراجع قدمها الكاتب للمقارنة.'});
  if(blocks.length<3)structure.push('المقال يحتاج تقسيمًا أوضح إلى مقدمة وأقسام.');
  if(blocks.some(x=>x.length>900))structure.push('توجد فقرة طويلة يفضّل تقسيمها.');
  if(/\s{2,}/.test(content))language.push('توجد مسافات متكررة يمكن تنظيفها.');
  if(['جرعة','mg','ملغ','دواء','مضاد','حامل','الحمل','طفل','طوارئ','نزف','ضغط الدم'].some(t=>content.toLowerCase().includes(t.toLowerCase())))safety.push('يوجد محتوى طبي/دوائي حساس يحتاج تحققًا بشريًا من المراجع.');
  let score=55;if(references.length)score+=15;if(blocks.length>=3)score+=10;if(!language.length)score+=5;if(!structure.length)score+=5;
  return {overall_score:Math.min(90,score),readiness:(!references.length||safety.length>1)?'needs_revision':'ready',language_issues:language,structure_issues:structure,unsupported_claims:[],reference_gaps:gaps,contradictions:[],safety_flags:[...safety,`ملاحظة تقنية: ${reason}`],style_suggestions:['استخدم عناوين فرعية واضحة وفقرات قصيرة ونقاط عند الحاجة.'],recommended_actions:references.length?['تحقق من الادعاءات الطبية المهمة مقابل المراجع المعتمدة.','راجع التقرير البشري النهائي قبل النشر.']:['أضف المراجع المعتمدة ثم أعد المراجعة.','راجع المحتوى طبيًا قبل النشر.']};
}

function parseJson(text){const s=String(text).replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();try{return JSON.parse(s);}catch{}const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a>=0&&b>a)return JSON.parse(s.slice(a,b+1));throw new Error('نتيجة المراجعة ليست JSON صالحاً.');}
