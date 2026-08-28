import { json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

async function teamApi(env, path, body) {
  const payload = JSON.stringify(body);
  if (env.TEAM_API) return env.TEAM_API.fetch(new Request(`https://internal${path}`, { method:'PUT', headers:{'content-type':'application/json'}, body:payload }));
  if (!env.TEAM_API_URL || !env.ADMIN_API_KEY) throw new Error('Team API binding/configuration is missing.');
  return fetch(`${env.TEAM_API_URL}${path}`, { method:'PUT', headers:{'content-type':'application/json','X-Admin-Key':env.ADMIN_API_KEY}, body:payload });
}

export async function onRequest({ request, env }) {
  if (request.method !== 'PUT') return json({success:false,error:'Method not allowed.'},405);
  if (!env.MEMBERS_DB) return json({success:false,error:'Database binding MEMBERS_DB is not configured.'},500);
  try {
    const admin = await authenticateAdmin(request, env.MEMBERS_DB);
    if (!admin) return json({success:false,error:'غير مصرح.'},401);
    const body = await request.json().catch(()=>({}));
    const response = await teamApi(env,'/internal/admin/members',body);
    const data = await response.json().catch(()=>({success:false,error:'Team API returned invalid JSON.'}));
    return json(data,response.status);
  } catch (error) {
    console.error('Admin update member error:', error);
    return json({success:false,error:'تعذر تحديث بيانات العضو حالياً.'},500);
  }
}
