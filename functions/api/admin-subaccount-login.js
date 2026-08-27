import { hashToken, verifyPassword, randomToken, cookie, json } from './_auth.js';

const COOKIE = 'medlife_subadmin_session';

async function ensure(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_subaccounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    permissions_json TEXT NOT NULL DEFAULT '[]',
    full_admin INTEGER NOT NULL DEFAULT 0,
    account_status TEXT NOT NULL DEFAULT 'active',
    linked_member_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_subsessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);
  const db = env.DB;
  try {
    await ensure(db);
    const action = new URL(request.url).searchParams.get('action') || 'login';

    if (request.method === 'POST' && action === 'login') {
      const body = await request.json().catch(() => ({}));
      const username = String(body.identifier || body.username || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!username || !password) return json({ success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور.' }, 400);
      const account = await db.prepare('SELECT * FROM admin_subaccounts WHERE lower(username)=? LIMIT 1').bind(username).first();
      if (!account || account.account_status !== 'active') return json({ success: false, error: 'بيانات الدخول غير صحيحة أو الحساب غير مفعل.' }, 401);
      if (!(await verifyPassword(password, account.password_hash))) return json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, 401);
      const token = randomToken();
      await db.prepare('DELETE FROM admin_subsessions WHERE account_id=?').bind(account.id).run();
      await db.prepare(`INSERT INTO admin_subsessions(account_id,token_hash,expires_at) VALUES(?,?,datetime('now','+7 days'))`).bind(account.id, await hashToken(token)).run();
      await db.prepare('UPDATE admin_subaccounts SET last_login_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(account.id).run();
      const response = json({ success: true, admin: { id: account.id, username: account.username, full_name: account.full_name, email: account.email || null, role: account.full_admin ? 'admin' : 'custom', full_admin: Boolean(account.full_admin), permissions: JSON.parse(account.permissions_json || '[]') } });
      const headers = new Headers(response.headers);
      headers.set('Set-Cookie', cookie(COOKIE, token, 7 * 86400));
      return new Response(response.body, { status: response.status, headers });
    }

    if (request.method === 'POST' && action === 'logout') {
      const raw = request.headers.get('Cookie') || '';
      const part = raw.split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='));
      if (part) {
        const token = decodeURIComponent(part.slice(COOKIE.length + 1));
        await db.prepare('DELETE FROM admin_subsessions WHERE token_hash=?').bind(await hashToken(token)).run();
      }
      const response = json({ success: true });
      const headers = new Headers(response.headers);
      headers.set('Set-Cookie', cookie(COOKIE, '', 0));
      return new Response(response.body, { status: response.status, headers });
    }

    return json({ success: false, error: 'Method or action not allowed.' }, 405);
  } catch (error) {
    console.error('admin-subaccount-login error:', error);
    return json({ success: false, error: 'تعذر تنفيذ جلسة الحساب الإداري.' }, 500);
  }
}
