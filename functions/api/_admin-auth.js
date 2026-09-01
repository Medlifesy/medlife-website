import { hashToken, randomToken, verifyPassword, getCookie, json, cookie } from './_auth.js';

const ADMIN_SESSION_COOKIE = 'medlife_admin_session';
const ADMIN_SESSION_DAYS = 7;
const ADMIN_SESSION_TABLE = 'medlife_system_admin_sessions_v2';

async function getAdminRole(db, memberId) {
  const row = await db.prepare(`
    SELECT role_key
    FROM medlife_admin_user_roles
    WHERE member_id = ?
    ORDER BY CASE role_key WHEN 'system_admin' THEN 1 ELSE 2 END
    LIMIT 1
  `).bind(memberId).first();
  return row?.role_key || null;
}

export async function ensureAdminTables(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS ${ADMIN_SESSION_TABLE} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_${ADMIN_SESSION_TABLE}_member ON ${ADMIN_SESSION_TABLE}(member_id)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_${ADMIN_SESSION_TABLE}_expires ON ${ADMIN_SESSION_TABLE}(expires_at)`).run();
}

export async function issueAdminSession(db, memberId) {
  await ensureAdminTables(db);
  const token = randomToken();
  const tokenHash = await hashToken(token);
  await db.prepare(`DELETE FROM ${ADMIN_SESSION_TABLE}
    WHERE datetime(expires_at) <= datetime('now') OR member_id = ?`).bind(memberId).run();
  await db.prepare(`INSERT INTO ${ADMIN_SESSION_TABLE}
    (member_id, token_hash, expires_at, created_at, last_seen_at)
    VALUES (?, ?, datetime('now','+7 days'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(memberId, tokenHash).run();
  return token;
}

export async function authenticateAdmin(request, db) {
  await ensureAdminTables(db);
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = await hashToken(token);
  const row = await db.prepare(`
    SELECT
      s.member_id,
      m.full_name,
      m.email,
      a.username,
      a.account_status,
      a.role AS account_role,
      s.expires_at
    FROM ${ADMIN_SESSION_TABLE} s
    JOIN members m ON m.id = s.member_id
    JOIN member_accounts a ON a.member_id = s.member_id
    WHERE s.token_hash = ?
      AND datetime(s.expires_at) > datetime('now')
      AND a.account_status = 'active'
    LIMIT 1
  `).bind(tokenHash).first();

  if (!row) return null;
  if (row.account_role !== 'admin') {
    const assignedRole = await getAdminRole(db, row.member_id);
    if (!assignedRole) return null;
    row.admin_role = assignedRole;
  } else {
    row.admin_role = await getAdminRole(db, row.member_id) || 'system_admin';
  }

  await db.prepare(`UPDATE ${ADMIN_SESSION_TABLE}
    SET last_seen_at = CURRENT_TIMESTAMP WHERE token_hash = ?`).bind(tokenHash).run();
  return row;
}

export async function loginAdmin(request, db) {
  await ensureAdminTables(db);
  const body = await request.json().catch(() => ({}));
  const identifier = String(body.identifier || body.email || body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!identifier || !password) return json({ success: false, error: 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور.' }, 400);

  const account = await db.prepare(`
    SELECT
      a.id AS account_id,
      a.member_id,
      a.username,
      a.password_hash,
      a.account_status,
      a.role,
      m.full_name,
      m.email,
      m.member_status
    FROM member_accounts a
    JOIN members m ON m.id = a.member_id
    WHERE lower(a.username) = ?
       OR lower(COALESCE(m.email,'')) = ?
    LIMIT 1
  `).bind(identifier, identifier).first();

  if (!account) return json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, 401);
  if (account.member_status !== 'active') return json({ success: false, error: 'عضويتك غير مفعلة حالياً.' }, 403);
  if (account.account_status !== 'active') return json({ success: false, error: 'حسابك غير مفعل حالياً.' }, 403);
  if (account.role !== 'admin') return json({ success: false, error: 'هذا الحساب لا يملك صلاحية الإدارة.' }, 403);
  if (!(await verifyPassword(password, account.password_hash))) return json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, 401);

  const adminRole = await getAdminRole(db, account.member_id);
  if (!adminRole) {
    await db.prepare(`INSERT OR IGNORE INTO medlife_admin_user_roles(member_id, role_key) VALUES (?, 'system_admin')`)
      .bind(account.member_id).run();
  }

  const token = await issueAdminSession(db, account.member_id);
  const response = json({
    success: true,
    admin: {
      id: account.member_id,
      member_id: account.member_id,
      full_name: account.full_name,
      email: account.email,
      username: account.username,
      role: adminRole || 'system_admin'
    }
  });
  const headers = new Headers(response.headers);
  headers.set('Set-Cookie', cookie(ADMIN_SESSION_COOKIE, encodeURIComponent(token), ADMIN_SESSION_DAYS * 86400));
  return new Response(response.body, { status: response.status, headers });
}

export async function logoutAdmin(request, db) {
  await ensureAdminTables(db);
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (token) {
    await db.prepare(`DELETE FROM ${ADMIN_SESSION_TABLE} WHERE token_hash = ?`)
      .bind(await hashToken(token)).run();
  }
  const response = json({ success: true });
  const headers = new Headers(response.headers);
  headers.set('Set-Cookie', cookie(ADMIN_SESSION_COOKIE, '', 0));
  return new Response(response.body, { status: response.status, headers });
}

export { ADMIN_SESSION_COOKIE };