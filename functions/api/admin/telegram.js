import { authenticateAdmin } from '../_admin-auth.js';

const WORKER_URL = 'https://medlife-team-api.broad-frog-3978.workers.dev';

export async function onRequest(context) {
  const { request, env } = context;
  const admin = await authenticateAdmin(request, env.DB);
  if (!admin) return new Response(JSON.stringify({ success:false, error:'Unauthorized' }), { status:401, headers:{'content-type':'application/json; charset=utf-8'} });

  const bridgeToken = env.RECOVERY_BRIDGE_TOKEN || env.MEDLIFE_TEAM_API_BRIDGE_TOKEN;
  if (!bridgeToken) return new Response(JSON.stringify({ success:false, error:'Telegram bridge is not configured on the website.' }), { status:503, headers:{'content-type':'application/json; charset=utf-8'} });

  const worker = (env.MEDLIFE_TEAM_API_URL || WORKER_URL).replace(/\/$/, '');
  const headers = { 'X-MedLife-Recovery-Bridge': bridgeToken };
  let body;
  if (request.method !== 'GET') {
    body = await request.text();
    headers['content-type'] = 'application/json';
  }

  try {
    const response = await fetch(`${worker}/internal/admin/telegram`, {
      method: request.method,
      headers,
      body: request.method === 'GET' ? undefined : body,
    });
    const text = await response.text();
    return new Response(text, { status: response.status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'} });
  } catch (error) {
    return new Response(JSON.stringify({ success:false, error:`تعذر الاتصال بخدمة Telegram: ${error instanceof Error ? error.message : String(error)}` }), { status:502, headers:{'content-type':'application/json; charset=utf-8'} });
  }
}
