import { authenticateAdmin, loginAdmin, logoutAdmin } from './_admin-auth.js';

function dbForAdmin(env) {
  return env.TEAM_DB || env.MEMBERS_DB || env.DB;
}

export async function onRequest({ request, env }) {
  const db = dbForAdmin(env);
  if (!db) return new Response(JSON.stringify({ success:false, error:'قاعدة بيانات الإدارة غير مهيأة.' }), { status:500, headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'} });
  const action = new URL(request.url).searchParams.get('action') || 'me';
  try {
    if (request.method === 'POST' && action === 'login') return await loginAdmin(request, db);
    if (request.method === 'POST' && action === 'logout') return await logoutAdmin(request, db);
    if (request.method === 'GET' && action === 'me') {
      const admin = await authenticateAdmin(request, db);
      if (!admin) return new Response(JSON.stringify({ success:false, authenticated:false }), { status:401, headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'} });
      return new Response(JSON.stringify({
        success:true,
        authenticated:true,
        admin:{
          id:admin.member_id,
          member_id:admin.member_id,
          full_name:admin.full_name,
          email:admin.email || null,
          username:admin.username || null,
          medlife_role:admin.medlife_role || null,
          role:admin.admin_role || null
        }
      }), { status:200, headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'} });
    }
    return new Response(JSON.stringify({ success:false,error:'Method or action not allowed.' }), { status:405, headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'} });
  } catch (error) {
    console.error('media-center-session error:', error);
    return new Response(JSON.stringify({ success:false,error:'تعذر تنفيذ جلسة المركز الإعلامي.' }), { status:500, headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'} });
  }
}
