import { ensureAuthTables, json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

async function teamApi(request, env, path, options = {}) {
  if (env.TEAM_API) return env.TEAM_API.fetch(new Request(`https://internal${path}`, { ...options, headers: new Headers({ ...(options.headers || {}) }) }));
  if (!env.TEAM_API_URL || !env.ADMIN_API_KEY) throw new Error('Team API binding/configuration is missing.');
  const headers = new Headers(options.headers || {});
  headers.set('X-Admin-Key', env.ADMIN_API_KEY);
  return fetch(`${env.TEAM_API_URL}${path}`, { ...options, headers });
}

export async function onRequest({request,env}){
  if(request.method!=='GET') return json({success:false,error:'Method not allowed.'},405);
  if(!env.MEMBERS_DB) return json({success:false,error:'Database binding is not configured.'},500);
  try{
    await ensureAuthTables(env.MEMBERS_DB);
    const admin=await authenticateAdmin(request,env.MEMBERS_DB);
    if(!admin) return json({success:false,error:'غير مصرح.'},401);
    const response=await teamApi(request,env,'/internal/admin/members');
    const data=await response.json().catch(()=>({success:false,error:'Team API returned invalid JSON.'}));
    return json(data,response.status);
  }catch(e){console.error(e);return json({success:false,error:'تعذر تحميل بيانات الأعضاء حالياً.'},500)}
}
