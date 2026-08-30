const ACCOUNTS_DS='8450cfc9-2ecf-4dcb-8fe3-80a0ecb81efb';
const NOTION_VERSION='2025-09-03';
const COOKIE='medlife_content_center_session_v3';
const enc=new TextEncoder();
const out=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
const sha=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(v)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const txt=p=>{if(!p)return'';if(p.type==='title'||p.type==='rich_text')return(p[p.type]||[]).map(x=>x.plain_text||x.text?.content||'').join('').trim();if(p.type==='select')return p.select?.name||'';return''};
const token=req=>{for(const p of (req.headers.get('Cookie')||'').split(';')){const x=p.trim();if(x.startsWith(COOKIE+'='))return decodeURIComponent(x.slice(COOKIE.length+1))}return null};
async function notion(env,path,init={}){if(!env.NOTION_API_TOKEN)throw Error('NOTION_API_TOKEN is not configured');const r=await fetch('https://api.notion.com'+path,{...init,headers:{Authorization:`Bearer ${env.NOTION_API_TOKEN}`,'Notion-Version':NOTION_VERSION,'Content-Type':'application/json',...(init.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.message||d.code||`Notion API ${r.status}`);return d}
export async function onRequest({request,env}){
 if(request.method!=='POST'||!env.DB)return out({success:false,error:'طلب غير صالح.'},400);
 try{
  const t=token(request);if(!t)return out({success:false,error:'انتهت جلسة الدخول.'},401);
  const h=await sha(t),s=await env.DB.prepare("SELECT account_page_id FROM content_center_sessions_v3 WHERE token_hash=?1 AND datetime(expires_at)>datetime('now') LIMIT 1").bind(h).first();
  if(!s)return out({success:false,error:'انتهت جلسة الدخول.'},401);
  const account=await notion(env,`/v1/pages/${s.account_page_id}`),ap=account.properties||{},role=txt(ap['الدور']);
  if(!['مشرف التصميم','إدارة المحتوى','مدير النظام'].includes(role))return out({success:false,error:'هذه العملية مخصصة لمشرف التصميم.'},403);
  const b=await request.json(),id=String(b.page_id||'').trim();if(!id)return out({success:false,error:'المنشور غير محدد.'},400);
  const p=await notion(env,`/v1/pages/${id}`),x=p.properties||{};if(!x['عنوان المحتوى'])return out({success:false,error:'المنشور غير موجود.'},404);
  await notion(env,`/v1/pages/${id}`,{method:'PATCH',body:JSON.stringify({properties:{'حالة التصميم':{select:{name:'مكتمل'}},'ملاحظات':{rich_text:[{text:{content:'لا يحتاج تصميم — تم اعتماد عدم الحاجة للتصميم من مشرف التصميم.'}}]}}})});
  return out({success:true,message:'تم اعتماد المنشور: لا يحتاج تصميم.'});
 }catch(e){console.error('content-center-skip-design',e);return out({success:false,error:e.message||'حدث خطأ غير متوقع.'},502)}
}
