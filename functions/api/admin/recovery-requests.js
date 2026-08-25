import { json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json({ success:false, error:'Method not allowed.' },405);
  if (!env.MEMBERS_DB) return json({ success:false, error:'Database binding MEMBERS_DB is not configured.' },500);
  if (!env.TEAM_DB) return json({ success:false, error:'Database binding TEAM_DB is not configured.' },500);

  try {
    const admin = await authenticateAdmin(request, env.MEMBERS_DB);
    if (!admin) return json({ success:false, error:'غير مصرح.' },401);

    const rows = await env.TEAM_DB.prepare(`
      SELECT id, full_name, phone, email, telegram_user_id, status,
             application_kind, profile_json, submitted_at, created_at, updated_at
      FROM volunteer_applications
      WHERE application_kind='member_recovery' AND status='pending'
      ORDER BY COALESCE(submitted_at, created_at) DESC, id DESC
      LIMIT 100
    `).all();

    const requests = (rows.results || []).map((row) => {
      let profile = {};
      try {
        const parsed = row.profile_json ? JSON.parse(row.profile_json) : {};
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) profile = parsed;
      } catch {}
      return {
        id: row.id,
        full_name: row.full_name,
        phone: row.phone,
        email: row.email,
        telegram_user_id: row.telegram_user_id,
        status: row.status,
        application_kind: row.application_kind,
        submitted_at: row.submitted_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profile: {
          ...profile,
          phone: profile.phone || row.phone,
          email: profile.email || row.email,
        },
      };
    });

    return json({ success:true, requests });
  } catch (error) {
    console.error('Recovery request list error:', error);
    return json({ success:false, error:'تعذر تحميل طلبات استعادة الحساب حالياً.' },500);
  }
}
