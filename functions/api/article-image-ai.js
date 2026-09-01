import { authenticateArticleAdmin } from './article-admin-session.js';

const MODEL='@cf/black-forest-labs/flux-1-schnell';
const MAX_PROMPT=2048;
const MAX_SOURCE=9000;
const enc=new TextEncoder();

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'}})}
function clean(v,max){return String(v??'').replace(/\s+/g,' ').trim().slice(0,max)}
function toBytes(base64){const binary=atob(base64);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes}
function promptFromArticle(body={}){
  const title=clean(body.title_ar,700), excerpt=clean(body.excerpt_ar,900), category=clean(body.category,180), content=clean(String(body.content_ar||'').replace(/<[^>]+>/g,' '),6500);
  const source=[title&&`Title: ${title}`,category&&`Category: ${category}`,excerpt&&`Summary: ${excerpt}`,content&&`Content: ${content}`].filter(Boolean).join('\n');
  return clean(`Create a premium editorial cover image for a medical education article for MedLife, a Syrian medical charitable organization. Use the article context below to create a clinically appropriate visual concept. Elegant, trustworthy, modern medical editorial photography/illustration, realistic but not sensational, clean composition, professional healthcare aesthetic, soft natural lighting, navy and warm cream atmosphere with subtle MedLife red accents. No text, no letters, no numbers, no logos, no watermark, no blood, no graphic surgery, no identifiable patient, no brand marks. Landscape 16:9 composition with a clear visual focal point and enough calm negative space for a website title overlay. Article context:\n${source}`,MAX_PROMPT)}

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return json({success:true});
  if(request.method!=='POST')return json({success:false,error:'Method not allowed.'},405);
  if(!env.AI)return json({success:false,error:"Workers AI binding 'AI' is not configured."},500);
  if(!env.ARTICLES_IMAGES)return json({success:false,error:"Image storage binding 'ARTICLES_IMAGES' is not configured."},500);
  if(!env.DB)return json({success:false,error:"Database binding 'DB' is not configured."},500);
  try{
    const admin=await authenticateArticleAdmin(request,env.DB);
    if(!admin||!['admin','editor'].includes(String(admin.role||'').toLowerCase()))return json({success:false,error:'تحتاج إلى صلاحية مدير أو محرر لتوليد صورة الغلاف.'},403);
    const body=await request.json().catch(()=>({}));
    const prompt=promptFromArticle(body);
    if(prompt.length<80)return json({success:false,error:'أدخل عنوان المقال أو ملخصه قبل توليد صورة الغلاف.'},400);
    const result=await env.AI.run(MODEL,{prompt,steps:4,seed:Math.floor(Math.random()*2147483647)});
    if(!result?.image)return json({success:false,error:'تعذر توليد صورة الغلاف من نموذج الذكاء الاصطناعي.'},502);
    const image=toBytes(result.image);
    if(image.byteLength>5*1024*1024)return json({success:false,error:'الصورة المولدة أكبر من الحجم المسموح.'},413);
    const date=new Date().toISOString().slice(0,10);
    const key=`articles/ai/${date}/${crypto.randomUUID()}.jpg`;
    await env.ARTICLES_IMAGES.put(key,image,{httpMetadata:{contentType:'image/jpeg',cacheControl:'public, max-age=31536000, immutable'},customMetadata:{source:'medlife-ai-cover',model:MODEL}});
    return json({success:true,image_url:`/api/article-image?key=${encodeURIComponent(key)}`,key,model:MODEL,bytes:image.byteLength},201);
  }catch(error){
    console.error('AI article cover error:',error);
    return json({success:false,error:'تعذر توليد صورة الغلاف حالياً. تحقق من إعدادات Workers AI وتخزين الصور.'},500);
  }
}
