import { authenticateArticleAdmin, json } from '../article-admin-session.js';

const ADMIN_ERROR = 'تعذر التحقق من جلسة الإدارة.';
const FALLBACK_COVER = (id) => `/api/article-cover?id=${encodeURIComponent(id)}`;

function publicArticle(row){
  if(!row) return null;
  const {
    author_email,
    author_member_id,
    rejection_reason,
    ...safe
  } = row;
  if(String(safe.status||'').toLowerCase()==='published' && !String(safe.image_url||'').trim() && safe.id){
    safe.image_url = FALLBACK_COVER(safe.id);
  }
  return safe;
}

function createPublicPath(){
  return `article-${crypto.randomUUID().replaceAll('-', '').slice(0, 20)}`;
}

async function ensurePublicPath(db, row){
  if(row?.canonical_path) return row.canonical_path;
  for(let attempt=0; attempt<5; attempt++){
    const path = createPublicPath();
    const exists = await db.prepare('SELECT id FROM articles WHERE canonical_path=? LIMIT 1').bind(path).first();
    if(exists) continue;
    const result = await db.prepare('UPDATE articles SET canonical_path=?, updated_at=? WHERE id=? AND (canonical_path IS NULL OR canonical_path=?)')
      .bind(path, new Date().toISOString(), row.id, '')
      .run();
    if(result.meta?.changes){
      row.canonical_path = path;
      return path;
    }
    const latest = await db.prepare('SELECT canonical_path FROM articles WHERE id=? LIMIT 1').bind(row.id).first();
    if(latest?.canonical_path) {
      row.canonical_path = latest.canonical_path;
      return latest.canonical_path;
    }
  }
  throw new Error('تعذر إنشاء المسار الدائم للمقال.');
}

async function normalizePublishedCover(db, id, status, imageUrl){
  const cleanStatus = String(status||'draft').trim().toLowerCase();
  const cleanImage = String(imageUrl||'').trim();
  if(cleanStatus !== 'published' || cleanImage || !Number.isInteger(id) || id<=0) return cleanImage;
  const fallback = FALLBACK_COVER(id);
  await db.prepare('UPDATE articles SET image_url=?, updated_at=? WHERE id=? AND (image_url IS NULL OR TRIM(image_url)=?)')
    .bind(fallback, new Date().toISOString(), id, '')
    .run();
  return fallback;
}

function summary(rows){
  return {
    total: rows.length,
    published: rows.filter((row)=>row?.status==='published').length,
    pending: rows.filter((row)=>['pending','review','under_review'].includes(row?.status)).length,
    drafts: rows.filter((row)=>['draft','rejected'].includes(row?.status)).length
  };
}

export async function onRequest({request,env}){
  if(!env.DB)return json({success:false,error:'قاعدة البيانات غير متاحة.'},500);

  const db=env.DB;
  const admin=await authenticateArticleAdmin(request,db);
  const url=new URL(request.url);
  const rawId=url.searchParams.get('id');
  let id=rawId===null||rawId===''?null:Number(rawId);

  try{
    if(request.method==='GET'){
      if(Number.isInteger(id)&&id>0){
        const row=admin
          ? await db.prepare('SELECT * FROM articles WHERE id=? LIMIT 1').bind(id).first()
          : await db.prepare("SELECT * FROM articles WHERE id=? AND status='published' LIMIT 1").bind(id).first();
        if(!row)return json({success:false,error:'المقال غير موجود.'},404);
        if(admin)return json({success:true,article:row});
        await ensurePublicPath(db,row);
        return json({success:true,article:publicArticle(row)});
      }

      const rows=admin
        ? ((await db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all()).results||[])
        : ((await db.prepare("SELECT * FROM articles WHERE status='published' ORDER BY COALESCE(published_at, created_at) DESC").all()).results||[]);

      if(!admin){
        for(const row of rows){
          await ensurePublicPath(db,row);
          await normalizePublishedCover(db,row.id,row.status,row.image_url);
        }
      }

      const visibleRows=admin ? rows : rows.map(publicArticle);
      return json({success:true,articles:visibleRows,summary:summary(rows)});
    }

    /* Public article submission: no admin session is required. */
    if(request.method==='POST' && !admin){
      const body=await request.json().catch(()=>({}));
      const now=new Date().toISOString();
      const title_ar=String(body.title_ar||'').trim();
      const title_en=String(body.title_en||'').trim();
      const excerpt_ar=String(body.excerpt_ar||'').trim();
      const excerpt_en=String(body.excerpt_en||'').trim();
      const content_ar=String(body.content_ar||'').trim();
      const content_en=String(body.content_en||'').trim();
      const author_name=String(body.author_name||'').trim();
      const author_email=String(body.author_email||'').trim();
      const category=String(body.category||'').trim();
      const image_url=String(body.image_url||'').trim();
      const author_member_id=body.author_member_id||body.member_id||null;

      if(!title_ar || !content_ar || !author_name){
        return json({success:false,error:'يرجى إدخال عنوان المقال واسم الكاتب والمحتوى الكامل.'},400);
      }

      const canonical_path=createPublicPath();
      const slugBase=(title_ar||title_en||'article')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g,'')
        .replace(/[^\p{L}\p{N}]+/gu,'-')
        .replace(/^-+|-+$/g,'')
        .slice(0,80) || `article-${Date.now()}`;
      const slug=`${slugBase}-${crypto.randomUUID().replaceAll('-','').slice(0,6)}`;

      const result=await db.prepare(`
        INSERT INTO articles
        (title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,author_name,author_email,category,image_url,status,slug,author_member_id,rejection_reason,canonical_path,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,
        author_name,author_email,category,image_url,'pending',slug,
        author_member_id,null,canonical_path,now,now
      ).run();

      const insertedId=Number(result.meta?.last_row_id);
      return json({
        success:true,
        id:insertedId,
        status:'pending',
        slug,
        canonical_path,
        message:'تم إرسال المقال بنجاح، وهو الآن قيد المراجعة.'
      },201);
    }

    if(!admin)return json({success:false,authenticated:false,error:ADMIN_ERROR},401);

    if(request.method==='POST'){
      const body=await request.json();
      const now=new Date().toISOString();
      const title_ar=(body.title_ar||'').trim();
      const title_en=(body.title_en||'').trim();
      const excerpt_ar=(body.excerpt_ar||'').trim();
      const excerpt_en=(body.excerpt_en||'').trim();
      const content_ar=(body.content_ar||'').trim();
      const content_en=(body.content_en||'').trim();
      const author_name=(body.author_name||'').trim();
      const author_email=(body.author_email||'').trim();
      const category=(body.category||'').trim();
      const image_url=String(body.image_url||'').trim();
      const status=(body.status||'draft').trim();
      const slug=(body.slug||'').trim();
      const author_member_id=body.author_member_id||null;
      const rejection_reason=(body.rejection_reason||'').trim();
      const canonical_path=(body.canonical_path||'').trim() || createPublicPath();

      const result=await db.prepare(`
        INSERT INTO articles
        (title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,author_name,author_email,category,image_url,status,slug,author_member_id,rejection_reason,canonical_path,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,author_name,author_email,category,image_url,status,slug,author_member_id,rejection_reason,canonical_path,now,now
      ).run();

      const insertedId=Number(result.meta?.last_row_id);
      const finalImageUrl=status.toLowerCase()==='published' && insertedId>0 && !image_url
        ? await normalizePublishedCover(db,insertedId,status,'')
        : image_url;

      return json({success:true,id:insertedId,canonical_path,image_url:finalImageUrl});
    }

    if(request.method==='PUT'){
      const body=await request.json().catch(()=>({}));
      if(!(Number.isInteger(id)&&id>0)){
        const bodyId=Number(body.id);
        if(Number.isInteger(bodyId)&&bodyId>0) id=bodyId;
      }
      if(!Number.isInteger(id)||id<=0)return json({success:false,error:'معرّف المقال غير صالح.'},400);
      const current=await db.prepare('SELECT * FROM articles WHERE id=? LIMIT 1').bind(id).first();
      if(!current)return json({success:false,error:'المقال غير موجود.'},404);

      const now=new Date().toISOString();
      const status=String(body.status??current.status??'draft').trim();
      const suppliedImage=String(body.image_url??current.image_url??'').trim();
      const image_url=await normalizePublishedCover(db,id,status,suppliedImage);
      const fields={
        title_ar:String(body.title_ar??current.title_ar??'').trim(),
        title_en:String(body.title_en??current.title_en??'').trim(),
        excerpt_ar:String(body.excerpt_ar??current.excerpt_ar??'').trim(),
        excerpt_en:String(body.excerpt_en??current.excerpt_en??'').trim(),
        content_ar:String(body.content_ar??current.content_ar??'').trim(),
        content_en:String(body.content_en??current.content_en??'').trim(),
        author_name:String(body.author_name??current.author_name??'').trim(),
        author_email:String(body.author_email??current.author_email??'').trim(),
        category:String(body.category??current.category??'').trim(),
        image_url,
        status,
        slug:String(body.slug??current.slug??'').trim(),
        author_member_id:body.author_member_id??current.author_member_id??null,
        rejection_reason:String(body.rejection_reason??current.rejection_reason??'').trim(),
        canonical_path:String(body.canonical_path??current.canonical_path??'').trim() || current.canonical_path || createPublicPath(),
        updated_at:now
      };

      await db.prepare(`
        UPDATE articles SET
        title_ar=?,title_en=?,excerpt_ar=?,excerpt_en=?,content_ar=?,content_en=?,author_name=?,author_email=?,category=?,image_url=?,status=?,slug=?,author_member_id=?,rejection_reason=?,canonical_path=?,updated_at=?
        WHERE id=?
      `).bind(
        fields.title_ar,fields.title_en,fields.excerpt_ar,fields.excerpt_en,fields.content_ar,fields.content_en,fields.author_name,fields.author_email,fields.category,fields.image_url,fields.status,fields.slug,fields.author_member_id,fields.rejection_reason,fields.canonical_path,fields.updated_at,id
      ).run();
      return json({success:true,id,canonical_path:fields.canonical_path,image_url:fields.image_url});
    }

    if(request.method==='DELETE'){
      if(!Number.isInteger(id)||id<=0)return json({success:false,error:'معرّف المقال غير صالح.'},400);
      const result=await db.prepare('DELETE FROM articles WHERE id=?').bind(id).run();
      return result.meta?.changes
        ? json({success:true,id})
        : json({success:false,error:'المقال غير موجود.'},404);
    }

    return json({success:false,error:'الطريقة غير مدعومة.'},405);
  }catch(error){
    return json({success:false,error:error?.message||'حدث خطأ غير متوقع.'},500);
  }
}