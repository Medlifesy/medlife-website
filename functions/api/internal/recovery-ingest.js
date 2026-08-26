function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function normalize(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ success: false, error: 'Method not allowed.' }, 405);
  if (!env.DB) return json({ success: false, error: 'Database binding DB is not configured.' }, 500);

  const expected = env.TEAM_RECOVERY_BRIDGE_TOKEN;
  const provided = request.headers.get('X-MedLife-Recovery-Bridge');
  if (!expected || !provided || provided !== expected) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json();
    const id = String(body?.id || '').trim();
    const fullName = String(body?.full_name || '').trim();
    const telegramUserId = String(body?.telegram_user_id || '').trim();
    if (!id || !fullName || !telegramUserId) {
      return json({ success: false, error: 'Missing required recovery request fields.' }, 400);
    }

    const profile = normalize(body?.profile);
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS recovery_requests (
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
      )
    `).run();

    const stamp = new Date().toISOString();
    await env.DB.prepare(`
      INSERT INTO recovery_requests
        (id, full_name, phone, email, telegram_user_id, status, profile_json, submitted_at, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6, ?7, ?7, ?7)
      ON CONFLICT(id) DO UPDATE SET
        full_name=excluded.full_name,
        phone=excluded.phone,
        email=excluded.email,
        telegram_user_id=excluded.telegram_user_id,
        profile_json=excluded.profile_json,
        updated_at=excluded.updated_at
    `).bind(
      id,
      fullName,
      body?.phone ? String(body.phone) : null,
      body?.email ? String(body.email) : null,
      telegramUserId,
      JSON.stringify(profile),
      body?.submitted_at ? String(body.submitted_at) : stamp,
    ).run();

    return json({ success: true, id, stored: true });
  } catch (error) {
    console.error('Recovery ingest error:', error);
    return json({ success: false, error: 'Failed to store recovery request.' }, 500);
  }
}
