const SUPABASE_UPLOAD='https://ypitdhekgggumvmhnmdh.supabase.co/functions/v1/media-center-upload';

export async function onRequest({request}){
  const url=new URL(request.url);
  const target=new URL(SUPABASE_UPLOAD);
  for(const [k,v] of url.searchParams) target.searchParams.set(k,v);
  const headers=new Headers(request.headers);
  headers.delete('host');
  headers.set('origin',url.origin);
  const cookie=request.headers.get('cookie');
  if(cookie) headers.set('cookie',cookie);
  try{
    const upstream=await fetch(target.toString(),{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,redirect:'follow'});
    const text=await upstream.text();
    if(request.method==='POST'&&upstream.ok){
      try{
        const data=JSON.parse(text);
        if(Array.isArray(data.files)){
          data.files=data.files.map(x=>{const p=new URL('/api/media-center-upload',url.origin);p.searchParams.set('path',x.path||'');p.searchParams.set('token',x.token||'');return {...x,signedUrl:p.toString()}});
        }
        return new Response(JSON.stringify(data),{status:upstream.status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'}});
      }catch{}
    }
    const out=new Headers(upstream.headers);out.delete('content-length');out.set('Cache-Control','no-store');return new Response(text,{status:upstream.status,headers:out});
  }catch(e){return new Response(JSON.stringify({error:'تعذر الاتصال بخدمة رفع الصور.',detail:String(e?.message||e||'')}),{status:502,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'}})}
}
