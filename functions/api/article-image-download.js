const REPO_PREFIX='https://raw.githubusercontent.com/Medlifesy/medlife-website/main/uploads/articles/';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}

export async function onRequestGet({request}){
  try{
    const value=new URL(request.url).searchParams.get('url')||'';
    if(!value.startsWith(REPO_PREFIX))return json({success:false,error:'رابط الصورة غير مسموح.'},400);
    const upstream=await fetch(value,{headers:{'User-Agent':'MedLife-Article-Image-Download'}});
    if(!upstream.ok)return json({success:false,error:'تعذر العثور على الصورة.'},404);
    const type=upstream.headers.get('content-type')||'application/octet-stream';
    if(!type.startsWith('image/'))return json({success:false,error:'الملف المطلوب ليس صورة.'},400);
    const path=new URL(value).pathname;
    const name=decodeURIComponent(path.split('/').pop()||'medlife-article-image').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(0,100);
    const headers=new Headers();
    headers.set('Content-Type',type);
    headers.set('Content-Disposition',`attachment; filename="${name}"`);
    headers.set('Cache-Control','public, max-age=86400');
    return new Response(upstream.body,{status:200,headers});
  }catch(error){
    console.error('article-image-download error:',error);
    return json({success:false,error:'تعذر تحميل الصورة حالياً.'},500);
  }
}
