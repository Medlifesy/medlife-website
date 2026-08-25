import { json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json({ success:false, error:'Method not allowed.' },405);
  if (!env.MEMBERS_DB || !env.DB) return json({ success:false, error:'Database binding is not configured.' },500);
  try {
    const admin = await authenticateAdmin(request, env.MEMBERS_DB);
    if (!admin) return json({ success:false, error:'غير مصرح.' },401);

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS recovery_requests (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      telegram_user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      profile_json TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`).run();

    const rows = await env.DB.prepare(`
      SELECT id, full_name, phone, email, telegram_user_id, status, profile_json,
             submitted_at, created_at, updated_at
      FROM recovery_requests
      WHERE status='pending'
      ORDER BY submitted_at DESC, id DESC
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
        application_kind: 'member_recovery',
        submitted_at: row.submitted_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profile: { ...profile, phone: profile.phone || row.phone, email: profile.email || row.email },
      };
    });

    return json({ success:true, requests, source:'LOCAL_RECOVERY_INBOX' });
  } catch (error) {
    console.error('Recovery request list error:', error);
    return json({ success:false, error:'تعذر تحميل طلبات استعادة الحساب حالياً.' },500);
  }
}
