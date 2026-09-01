import { issueAdminSession, ADMIN_SESSION_COOKIE, ensureAdminTables } from './_admin-auth.js';
import { verifyPassword, json, ensureAuthTables, hashPassword } from './_auth.js';

const SESSION_COOKIE = 'medlife_member_session';
const SESSION_DAYS = 30;

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return json({ success: true });
  if (request.method !== 'POST') return json({ success: false, error: 'Method not allowed.' }, 405);

  const db = env.TEAM_DB || env.MEMBERS_DB || env.DB;
  if (!db) return json({ success: false, error: 'Database binding is not configured.' }, 500);

  try {
    await ensureAuthTables(db);
    await ensureMemberAccounts(db);

    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier || body.username || body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!identifier || !password) return json({ success: false, error: 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور.' }, 400);

    const account = await db.prepare(`
      SELECT a.id AS account_id, a.member_id, a.username,
             a.password_hash AS account_password_hash, a.account_status, a.role,
             m.full_name, m.email, m.status, m.account_email,
             m.password_hash AS legacy_password_hash,
             m.medlife_role AS legacy_role
      FROM members m
      LEFT JOIN member_accounts a ON a.member_id = m.id
      WHERE lower(COALESCE(a.username,'')) = ?
         OR lower(COALESCE(m.email,'')) = ?
         OR lower(COALESCE(m.account_email,'')) = ?
      ORDER BY CASE WHEN a.id IS NOT NULL THEN 0 ELSE 1 END
      LIMIT 1
    `).bind(identifier, identifier, identifier).first();

    if (!account) return json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, 401);
    if (account.status !== 'active') return json({ success: false, error: 'عضويتك لم تُعتمد بعد من الإدارة.' }, 403);
    if (account.account_id && account.account_status !== 'active') return json({ success: false, error: 'حسابك غير مفعل حالياً.' }, 403);

    let valid = false;
    if (account.account_id && account.account_password_hash) {
      valid = await verifyPassword(password, account.account_password_hash);
    }

    if (!valid && account.legacy_password_hash) {
      valid = await verifyPassword(password, account.legacy_password_hash);
    }

    if (!valid) return json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, 401);

    let accountId = account.account_id;

    if (!accountId) {
      const username = await createUsername(db, account.email || account.account_email, account.member_id);
      const passwordHash = account.legacy_password_hash || await hashPassword(password);
      const role = normalizeAccountRole(account.legacy_role);

      const result = await db.prepare(`
        INSERT INTO member_accounts (
          member_id, username, password_hash, password_salt, role, account_status
        ) VALUES (?, ?, ?, NULL, ?, 'active')
      `).bind(account.member_id, username, passwordHash, role).run();

      accountId = result.meta?.last_row_id;
      if (!accountId) {
        const created = await db.prepare('SELECT id FROM member_accounts WHERE member_id=? LIMIT 1')
          .bind(account.member_id).first();
        accountId = created?.id;
      }
    }

    await db.prepare(`
      UPDATE member_accounts
      SET account_status='active',
          last_login_at=CURRENT_TIMESTAMP,
          updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(accountId).run();

    await ensureSessionTable(db);
    const token = randomToken();
    await db.prepare(`INSERT INTO member_sessions_v2(id,token_hash,member_id,expires_at) VALUES(?,?,?,datetime('now','+30 days'))`)
      .bind(randomToken(), await sha256(token), account.member_id).run();

    const adminRole = mapAdminRole(account.role || normalizeAccountRole(account.legacy_role));
    let redirect = '/members.html';
    let adminToken = null;
    if (adminRole) {
      await ensureAdminTables(db);
      await ensureRoutingTables(db);
      await db.prepare(`INSERT OR IGNORE INTO medlife_admin_user_roles(member_id,role_key) VALUES(?,?)`)
        .bind(account.member_id, adminRole).run();
      adminToken = await issueAdminSession(db, account.member_id);
      redirect = redirectForRole(adminRole);
    }

    const response = json({ success: true, member: { id: account.member_id, full_name: account.full_name, email: account.email }, redirect });
    const headers = new Headers(response.headers);
    headers.append('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${SESSION_DAYS * 86400}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    if (adminToken) headers.append('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(adminToken)}; Max-Age=${7 * 86400}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error('unified member login error:', error?.message || error);
    return json({ success: false, error: 'حدث خطأ أثناء تنفيذ تسجيل الدخول.' }, 500);
  }
}

async function ensureMemberAccounts(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    account_status TEXT NOT NULL DEFAULT 'active',
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

async function ensureSessionTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_sessions_v2 (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    member_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

async function ensureRoutingTables(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_roles (role_key TEXT PRIMARY KEY,name TEXT NOT NULL,description TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_permissions (permission_key TEXT PRIMARY KEY,name TEXT NOT NULL)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_role_permissions (role_key TEXT NOT NULL,permission_key TEXT NOT NULL,PRIMARY KEY(role_key,permission_key))`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_user_roles (member_id INTEGER NOT NULL,role_key TEXT NOT NULL,PRIMARY KEY(member_id,role_key))`).run();
  const roles = [['system_admin','مدير النظام'],['content_manager','مدير المحتوى'],['content_editor','محرر المحتوى'],['medical_reviewer','مراجع طبي'],['members_manager','مدير الأعضاء'],['support_manager','مدير الدعم'],['complaints_manager','مدير الشكاوى']];
  for (const [key, name] of roles) await db.prepare(`INSERT OR IGNORE INTO medlife_admin_roles(role_key,name) VALUES(?,?)`).bind(key, name).run();
  await db.prepare(`INSERT OR IGNORE INTO medlife_admin_permissions(permission_key,name) VALUES('*','جميع الصلاحيات')`).run();
  await db.prepare(`INSERT OR IGNORE INTO medlife_admin_role_permissions(role_key,permission_key) VALUES('system_admin','*')`).run();
}

function normalizeAccountRole(role) {
  const r = String(role || '').toLowerCase();
  return r === 'admin' || r === 'administrator' ? 'admin' : r || 'member';
}

function mapAdminRole(role) {
  const r = String(role || '').toLowerCase();
  if (['admin','administrator','medical_director','general_team_supervisor','system_admin'].includes(r)) return 'system_admin';
  if (r === 'editor') return 'content_editor';
  if (r === 'reviewer') return 'medical_reviewer';
  if (r === 'members_manager') return 'members_manager';
  if (r === 'support_manager') return 'support_manager';
  if (r === 'complaints_manager') return 'complaints_manager';
  if (r === 'content_manager') return 'content_manager';
  return null;
}

function redirectForRole(role) {
  if (role === 'system_admin') return '/admin.html';
  if (['content_manager','content_editor','medical_reviewer'].includes(role)) return '/articles-admin';
  if (role === 'members_manager') return '/members-admin';
  if (role === 'support_manager') return '/support-admin';
  if (role === 'complaints_manager') return '/complaints-admin';
  return '/members.html';
}

async function createUsername(db, email, memberId) {
  let base = String(email || `member${memberId}`).split('@')[0].replace(/[^a-z0-9._-]/gi, '-').toLowerCase().slice(0, 25);
  if (base.length < 4) base = `member${memberId}`;
  let username = base;
  let counter = 1;
  while (await db.prepare('SELECT id FROM member_accounts WHERE username=? LIMIT 1').bind(username).first()) {
    username = `${base.slice(0, 30)}-${counter++}`;
  }
  return username.slice(0, 40);
}

function randomToken() {
  const b = new Uint8Array(32); crypto.getRandomValues(b); return bytesToHex(b);
}
async function sha256(value) { return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))); }
function bytesToHex(bytes) { return [...bytes].map(x => x.toString(16).padStart(2, '0')).join(''); }
