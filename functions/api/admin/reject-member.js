import { json } from '../_auth.js';

async function teamApi(env, path, body) {
 const payload=JSON.stringify(body);
 if(env.TEAM_API) return env.TEAM_API.fetch(new Request(`https://internal${path}`,{method:'POST',headers:{'content-type':'application/json'},body:payload}));
 if(!env.TEAM_API_URL||!env.ADMIN_API_KEY)throw new Error('Team API binding/configuration is missing.');
 return fetch(`${env.TEAM_API_URL}${path}`,{method:'POST',headers:{'content-type':'application/json','X-Admin-Key':env.ADMIN_API_KEY},body:payload});
}

export async function onRequest({request,env}){
 if(request.method!=='POST')return json({success:false,error:'Method not allowed.'},405);
 if(!env.MEMBERS_DB)return json({success:false,error:'Database binding is not configured.'},500);
 if(!env.ADMIN_API_KEY||request.headers.get('X-Admin-Key')!==env.ADMIN_API_KEY)return json({success:false,error:'غير مصرح.'},401);
 try{
  const b=await request.json().catch(()=>({})),type=String(b.type||''),id=b.id,reason=String(b.reason||'').trim().slice(0,1000);
  if(!['new','current'].includes(type)||id===undefined||id===null||String(id).trim()==='')return json({success:false,error:'بيانات الرفض غير صالحة.'},400);
  const response=await teamApi(env,'/internal/admin/members/reject',{type,id:String(id),reason});
  const data=await response.json().catch(()=>({success:false,error:'Team API returned invalid JSON.'}));
  return json(data,response.status);
 }catch(e){console.error(e);return json({success:false,error:'تعذر رفض الطلب حالياً.'},500)}
}
