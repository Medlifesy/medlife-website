import { json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json({ success:false, error:'Method not allowed.' },405);
  if (!env.MEMBERS_DB) return json({ success:false, error:'Database binding MEMBERS_DB is not configured.' },500);
  try {
    const admin = await authenticateAdmin(request, env.MEMBERS_DB);
    if (!admin) return json({ success:false, error:'غير مصرح.' },401);

    let response;
    if (env.TEAM_API) {
      const url = new URL(request.url);
      url.pathname = '/internal/recovery-requests';
      url.search = '?status=pending';
      response = await env.TEAM_API.fetch(new Request(url.toString(), { method:'GET' }));
    } else {
      if (!env.TEAM_RECOVERY_API_URL || !env.TEAM_RECOVERY_BRIDGE_TOKEN) {
        return json({ success:false, error:'Recovery bridge is not configured.' },503);
      }
      const upstream = `${String(env.TEAM_RECOVERY_API_URL).replace(/\/$/,'')}/internal/recovery-requests?status=pending`;
      response = await fetch(upstream, { headers: { 'X-MedLife-Recovery-Bridge': env.TEAM_RECOVERY_BRIDGE_TOKEN } });
    }

    const data = await response.json().catch(()=>({}));
    if (!response.ok || !data.success) {
      console.error('Recovery bridge upstream failure:', { status:response.status, data });
      return json({ success:false, error:'تعذر تحميل طلبات استعادة الحساب حالياً.', debug:{ upstreamStatus:response.status, upstreamError:data?.error||null, serviceBinding:Boolean(env.TEAM_API) } },502);
    }
    return json(data);
  } catch (error) {
    console.error('Recovery bridge error:', error);
    return json({ success:false, error:'تعذر الاتصال بنظام طلبات الاستعادة حالياً.', debug:{ message:String(error), serviceBinding:Boolean(env.TEAM_API) } },502);
  }
}
