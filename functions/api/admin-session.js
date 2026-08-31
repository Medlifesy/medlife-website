import { authenticateAdmin, loginAdmin, logoutAdmin } from './_admin-auth.js';

// General administration uses the team database. Article content remains in DB.
export async function onRequest({ request, env }) {
  const db = env.TEAM_DB || env.MEMBERS_DB || env.DB;
  if (!db) {
    return new Response(JSON.stringify({ success: false, error: "Database binding 'TEAM_DB'/'MEMBERS_DB'/'DB' is not configured." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-store' }
    });
  }

  const action = new URL(request.url).searchParams.get('action') || 'me';
  try {
    if (request.method === 'POST' && action === 'login') return await loginAdmin(request, db);
    if (request.method === 'POST' && action === 'logout') return await logoutAdmin(request, db);
    if (request.method === 'GET' && action === 'me') {
      const admin = await authenticateAdmin(request, db);
      if (!admin) return new Response(JSON.stringify({ success: false, authenticated: false }), { status: 401, headers: { 'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store' } });
      return new Response(JSON.stringify({ success:true, authenticated:true, admin:{ id:admin.member_id, member_id:admin.member_id, full_name:admin.full_name, email:admin.account_email||admin.email||null, medlife_role:admin.medlife_role||null, org_role:admin.org_role||null } }), { status:200, headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'} });
    }
    return new Response(JSON.stringify({ success:false,error:'Method or action not allowed.' }), { status:405, headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'} });
  } catch(error) {
    console.error('admin-session error:', error);
    return new Response(JSON.stringify({ success:false,error:'تعذر تنفيذ جلسة الإدارة.',detail:String(error?.message||error||'') }), { status:500, headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'} });
  }
}
