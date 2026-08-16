import { ensureAdminTables, authenticateAdmin, loginAdmin, logoutAdmin } from './_admin-auth.js';
import { json } from './_auth.js';

export async function onRequest({request,env}) {
  if (!env.MEMBERS_DB) return json({success:false,error:'Database binding is not configured.'},500);
  const db = env.MEMBERS_DB;
  try {
    await ensureAdminTables(db);
    const action = new URL(request.url).searchParams.get('action') || 'me';
    if (request.method === 'POST' && action === 'login') return await loginAdmin(request,db);
    if (request.method === 'POST' && action === 'logout') return await logoutAdmin(request,db);
    if (request.method === 'GET' && action === 'me') {
      const admin = await authenticateAdmin(request,db);
      if (!admin) return json({success:false,authenticated:false},401);
      return json({success:true,authenticated:true,admin});
    }
    return json({success:false,error:'Method or action not allowed.'},405);
  } catch (error) {
    console.error('admin-session error:',error);
    return json({success:false,error:'حدث خطأ أثناء تنفيذ جلسة الإدارة.'},500);
  }
}
