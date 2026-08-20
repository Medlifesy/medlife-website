import { authenticateArticleAdmin } from './article-admin-session.js';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/jpeg','jpg'],['image/png','png'],['image/webp','webp'],['image/gif','gif']
]);

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();
  if (method === 'OPTIONS') return json({ success:true });
  if (!env.ARTICLES_IMAGES) return json({success:false,error:"Image storage binding 'ARTICLES_IMAGES' is not configured."},500);
  try {
    if (method === 'POST') {
      if (!env.DB) return json({success:false,error:"Database binding 'DB' is not configured."},500);
      const admin = await authenticateArticleAdmin(request, env.DB);
      if (!admin || !['admin','editor'].includes(String(admin.role).toLowerCase())) return json({success:false,error:'يجب تسجيل الدخول بصلاحية محرر أو مدير لرفع الصور.'},403);
      return await uploadImage(request, env.ARTICLES_IMAGES);
    }
    if (method === 'GET') return await serveImage(request, env.ARTICLES_IMAGES);
    return json({success:false,error:'Method not allowed.'},405);
  } catch (error) {
    console.error('Article image API error:', error);
    return json({success:false,error:'تعذر معالجة صورة المقال حالياً.'},500);
  }
}

async function uploadImage(request,bucket){
  const contentType=(request.headers.get('Content-Type')||'').toLowerCase();
  const extension=ALLOWED_TYPES.get(contentType);
  if(!extension)return json({success:false,error:'نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو GIF.'},400);
  const contentLength=Number(request.headers.get('Content-Length')||0);
  if(contentLength>MAX_BYTES)return json({success:false,error:'حجم الصورة يجب ألا يتجاوز 5 ميغابايت.'},413);
  const buffer=await request.arrayBuffer();
  if(!buffer.byteLength)return json({success:false,error:'لم يتم اختيار صورة.'},400);
  if(buffer.byteLength>MAX_BYTES)return json({success:false,error:'حجم الصورة يجب ألا يتجاوز 5 ميغابايت.'},413);
  const key=`articles/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${extension}`;
  await bucket.put(key,buffer,{httpMetadata:{contentType,cacheControl:'public, max-age=31536000, immutable'},customMetadata:{source:'medlife-article-upload'}});
  return json({success:true,key,image_url:`/api/article-image?key=${encodeURIComponent(key)}`},201);
}

async function serveImage(request,bucket){
  const url=new URL(request.url),key=url.searchParams.get('key')||'';
  if(!key||!key.startsWith('articles/')||key.includes('..'))return json({success:false,error:'رابط الصورة غير صالح.'},400);
  const object=await bucket.get(key);
  if(!object)return new Response('Image not found',{status:404});
  const headers=new Headers();object.writeHttpMetadata(headers);headers.set('etag',object.httpEtag);headers.set('Cache-Control','public, max-age=31536000, immutable');
  return new Response(object.body,{headers});
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'}})}