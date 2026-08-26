import { authenticateArticleAdmin, json } from '../article-admin-session.js';

async function ensureTable(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS article_editorial_briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL UNIQUE,
    article_type TEXT DEFAULT '',
    intended_audience TEXT DEFAULT '',
    goal TEXT DEFAULT '',
    suggested_sections TEXT DEFAULT '',
    key_questions TEXT DEFAULT '',
    desired_tone TEXT DEFAULT '',
    visual_preferences TEXT DEFAULT '',
    source_types TEXT DEFAULT '',
    required_sources TEXT DEFAULT '',
    medical_safety TEXT DEFAULT '',
    safety_focus TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
  const columns=[
    ['goal','TEXT DEFAULT \'\''],
    ['source_types','TEXT DEFAULT \'\''],
    ['required_sources','TEXT DEFAULT \'\''],
    ['medical_safety','TEXT DEFAULT \'\''],
    ['safety_focus','TEXT DEFAULT \'\'']
  ];
  for(const [name,type] of columns){try{await db.prepare(`ALTER TABLE article_editorial_briefs ADD COLUMN ${name} ${type}`).run()}catch{}}
}
const clean=(v,max)=>String(v??'').trim().slice(0,max);
export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return json({success:true});
  if(!env.DB)return json({success:false,error:"Database binding 'DB' is not configured."},500);
  const user=await authenticateArticleAdmin(request,env.DB);
  if(!user)return json({success:false,error:'غير مصرح بالدخول إلى إدارة المقالات.'},401);
  if(!['admin','reviewer','editor'].includes(String(user.role||'').toLowerCase()))return json({success:false,error:'لا تملك صلاحية تعديل الـEditorial Brief.'},403);
  try{
    await ensureTable(env.DB);
    if(request.method==='GET'){
      const id=Number(new URL(request.url).searchParams.get('article_id'));
      if(!Number.isInteger(id)||id<=0)return json({success:false,error:'معرّف المقال غير صالح.'},400);
      const brief=await env.DB.prepare('SELECT * FROM article_editorial_briefs WHERE article_id=? LIMIT 1').bind(id).first();
      return json({success:true,brief:brief||null});
    }
    if(request.method!=='POST'&&request.method!=='PUT')return json({success:false,error:'Method not allowed.'},405);
    const b=await request.json().catch(()=>({}));
    const articleId=Number(b.article_id);
    if(!Number.isInteger(articleId)||articleId<=0)return json({success:false,error:'معرّف المقال غير صالح.'},400);
    const article=await env.DB.prepare('SELECT id FROM articles WHERE id=? LIMIT 1').bind(articleId).first();
    if(!article)return json({success:false,error:'المقال غير موجود.'},404);
    const brief=b.editorial_brief||b.brief||{};
    await env.DB.prepare(`INSERT INTO article_editorial_briefs(article_id,article_type,intended_audience,goal,suggested_sections,key_questions,desired_tone,visual_preferences,source_types,required_sources,medical_safety,safety_focus,notes,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      ON CONFLICT(article_id) DO UPDATE SET article_type=excluded.article_type,intended_audience=excluded.intended_audience,goal=excluded.goal,suggested_sections=excluded.suggested_sections,key_questions=excluded.key_questions,desired_tone=excluded.desired_tone,visual_preferences=excluded.visual_preferences,source_types=excluded.source_types,required_sources=excluded.required_sources,medical_safety=excluded.medical_safety,safety_focus=excluded.safety_focus,notes=excluded.notes,updated_at=CURRENT_TIMESTAMP`)
      .bind(articleId,clean(brief.article_type,100),clean(brief.intended_audience,500),clean(brief.goal,4000),clean(brief.suggested_sections,4000),clean(brief.key_questions,4000),clean(brief.desired_tone,500),clean(brief.visual_preferences,1000),Array.isArray(brief.source_types)?brief.source_types.slice(0,30).map(x=>clean(x,100)).join(' | '):clean(brief.source_types,2000),clean(brief.required_sources,4000),clean(brief.medical_safety,50),clean(brief.safety_focus,2000),clean(brief.notes,4000)).run();
    return json({success:true,message:'تم حفظ الـEditorial Brief.',article_id:articleId});
  }catch(error){console.error('Editorial brief API error:',error);return json({success:false,error:error?.message||'تعذر حفظ الـEditorial Brief.'},500)}
}