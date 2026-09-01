import { issueAdminSession, ADMIN_SESSION_COOKIE, ensureAdminTables } from './_admin-auth.js';
import { verifyPassword, json } from './_auth.js';

const SESSION_COOKIE = 'medlife_member_session';
const SESSION_DAYS = 30;

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return json({ success: true });
  if (request.method !== 'POST') return json({ success: false, error: 'Method not allowed.' }, 405);
  const db = env.MEMBERS_DB || env.DB || env.TEAM_DB;
  if (!db) return json({ success: false, error: 'Database binding is not configured.' }, 500);

  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier || body.username || body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!identifier || !password) return json({ success: false, error: 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور.' }, 400);

    await ensureAccountsTable(db);
    const account = await db.prepare(`
      SELECT a.id AS account_id,a.member_id,a.username,a.password_hash AS account_password_hash,a.account_status,a.role,
             m.id,m.full_name,m.email,m.status,m.account_email,m.account_status AS member_account_status
      FROM member_accounts a JOIN members m ON m.id=a.member_id
      WHERE lower(COALESCE(a.username,''))=? OR lower(COALESCE(m.email,''))=? OR lower(COALESCE(m.account_email,''))=?
      LIMIT 1`).bind(identifier, identifier, identifier).first();

    if (!account) return json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, 401);
    if (!(account.status === 'active' || account.status === 'approved')) return json({ success: false, error: 'عضويتك لم تُعتمد بعد من الإدارة.' }, 403);
    if (account.account_status !== 'active') return json({ success: false, error: 'حسابك غير مفعل حالياً.' }, 403);
    if (!(await verifyPassword(password, account.account_password_hash))) return json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, 401);

    await ensureSessionTable(db);
    const token = randomToken();
    await db.prepare(`INSERT INTO member_sessions_v2(id,token_hash,member_id,expires_at) VALUES(?,?,?,datetime('now','+30 days'))`)
      .bind(token, await sha256(token), account.member_id).run();
    await db.prepare(`UPDATE member_accounts SET last_login_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(account.account_id).run();

    const adminRole = mapAdminRole(account.role);
    let redirect = '/members.html';
    let adminToken = null;
    if (adminRole) {
      await ensureAdminTables(db);
      await ensureRoutingTables(db);
      await db.prepare(`INSERT OR IGNORE INTO medlife_admin_user_roles(member_id,role_key) VALUES(?,?)`).bind(account.member_id, adminRole).run();
      adminToken = await issueAdminSession(db, account.member_id);
      redirect = redirectForRole(adminRole);
    }

    const response = json({ success: true, member: { id: account.member_id, full_name: account.full_name, email: account.email }, redirect });
    const headers = new Headers(response.headers);
    headers.append('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${SESSION_DAYS * 86400}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    if (adminToken) headers.append('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(adminToken)}; Max-Age=${7 * 86400}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error('unified member login error:', error);
    return json({ success: false, error: 'حدث خطأ أثناء تنفيذ تسجيل الدخول.' }, 500);
  }
}

async function ensureAccountsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL UNIQUE,username TEXT UNIQUE,password_hash TEXT NOT NULL,password_salt TEXT,role TEXT NOT NULL DEFAULT 'member',account_status TEXT NOT NULL DEFAULT 'active',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,last_login_at TEXT)`).run();
}
async function ensureSessionTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_sessions_v2 (id TEXT PRIMARY KEY,token_hash TEXT NOT NULL UNIQUE,member_id INTEGER NOT NULL,expires_at DATETIME NOT NULL,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
}
async function ensureRoutingTables(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_roles (role_key TEXT PRIMARY KEY,name TEXT NOT NULL,description TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_permissions (permission_key TEXT PRIMARY KEY,name TEXT NOT NULL)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_role_permissions (role_key TEXT NOT NULL,permission_key TEXT NOT NULL,PRIMARY KEY(role_key,permission_key))`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_user_roles (member_id INTEGER NOT NULL,role_key TEXT NOT NULL,PRIMARY KEY(member_id,role_key))`).run();
  const roles=[['system_admin','مدير النظام'],['content_manager','مدير المحتوى'],['content_editor','محرر المحتوى'],['medical_reviewer','مراجع طبي'],['members_manager','مدير الأعضاء'],['support_manager','مدير الدعم'],['complaints_manager','مدير الشكاوى']];
  for(const [key,name] of roles) await db.prepare(`INSERT OR IGNORE INTO medlife_admin_roles(role_key,name) VALUES(?,?)`).bind(key,name).run();
  await db.prepare(`INSERT OR IGNORE INTO medlife_admin_permissions(permission_key,name) VALUES('*','جميع الصلاحيات')`).run();
  await db.prepare(`INSERT OR IGNORE INTO medlife_admin_role_permissions(role_key,permission_key) VALUES('system_admin','*')`).run();
}
function mapAdminRole(role){const r=String(role||'').toLowerCase();if(['admin','administrator','medical_director','general_team_supervisor'].includes(r))return 'system_admin';if(r==='editor')return 'content_editor';if(r==='reviewer')return 'medical_reviewer';if(r==='members_manager')return 'members_manager';if(r==='support_manager')return 'support_manager';if(r==='complaints_manager')return 'complaints_manager';if(r==='content_manager')return 'content_manager';return null;}
function redirectForRole(role){if(role==='system_admin')return '/admin-system.html';if(['content_manager','content_editor','medical_reviewer'].includes(role))return '/articles-admin';if(role==='members_manager')return '/members-admin';if(role==='support_manager')return '/support-admin';if(role==='complaints_manager')return '/complaints-admin';return '/members.html';}
function randomToken(){const b=new Uint8Array(32);crypto.getRandomValues(b);return bytesToHex(b)}
async function sha256(v){return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))))}
function bytesToHex(b){return [...b].map(x=>x.toString(16).padStart(2,'0')).join('')}
