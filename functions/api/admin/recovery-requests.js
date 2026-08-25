import { json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

function normalize(data) {
  const rows = Array.isArray(data) ? data : (data?.requests || []);
  return rows.map((row) => ({
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
    profile: row.profile || {},
  }));
}

async function fromWorker(env) {
  if (!env.TEAM_API) return null;
  const url = new URL('https://internal.medlife/api/internal/recovery-requests');
  url.search = '?status=pending';
  const headers = {};
  if (env.TEAM_RECOVERY_BRIDGE_TOKEN) headers['X-MedLife-Recovery-Bridge'] = env.TEAM_RECOVERY_BRIDGE_TOKEN;
  const response = await env.TEAM_API.fetch(new Request(url.toString(), { method:'GET', headers }));
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(`TEAM_API ${response.status}: ${data?.error || 'unknown error'}`);
  return normalize(data);
}

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json({ success:false, error:'Method not allowed.' },405);
  if (!env.MEMBERS_DB) return json({ success:false, error:'Database binding MEMBERS_DB is not configured.' },500);

  try {
    const admin = await authenticateAdmin(request, env.MEMBERS_DB);
    if (!admin) return json({ success:false, error:'غير مصرح.' },401);

    if (env.TEAM_DB) {
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
          profile: { ...profile, phone: profile.phone || row.phone, email: profile.email || row.email },
        };
      });
      return json({ success:true, requests, source:'TEAM_DB' });
    }

    const requests = await fromWorker(env);
    if (requests) return json({ success:true, requests, source:'TEAM_API' });

    return json({ success:false, error:'لم يتم تفعيل مصدر بيانات فريق MedLife في Production.' },503);
  } catch (error) {
    console.error('Recovery request list error:', error);
    return json({
      success:false,
      error:'تعذر تحميل طلبات استعادة الحساب حالياً.',
      debug: String(error),
    },500);
  }
}
