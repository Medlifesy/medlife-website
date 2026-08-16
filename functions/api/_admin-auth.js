import { hashToken, randomToken, verifyPassword, getCookie, json, cookie, ensureAuthTables } from './_auth.js';

const ADMIN_SESSION_COOKIE = 'medlife_admin_session';
const ADMIN_SESSION_DAYS = 7;

export async function ensureAdminTables(db) {
  await ensureAuthTables(db);
  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
}

export async function authenticateAdmin(request, db) {
  await ensureAdminTables(db);
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const row = await db.prepare(`SELECT a.member_id, m.full_name, m.email, m.account_email, m.medlife_role, m.account_status, m.status FROM admin_sessions a JOIN members m ON m.id=a.member_id WHERE a.token_hash=? AND datetime(a.expires_at)>datetime('now') LIMIT 1`).bind(tokenHash).first();
  if (!row) return null;
  if (row.account_status && row.account_status !== 'active') return null;
  if (!(row.status === 'active' || row.status === 'approved')) return null;
  await db.prepare(`UPDATE admin_sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?`).bind(tokenHash).run();
  return row;
}

export async function loginAdmin(request, db) {
  const body = await request.json();
  const identifier = String(body.identifier || body.email || body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!identifier || !password) return json({success:false,error:'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور.'},400);

  const member = await db.prepare(`SELECT id,full_name,email,account_email,password_hash,account_status,status,medlife_role,member_code FROM members WHERE lower(COALESCE(account_email,''))=? OR lower(COALESCE(email,''))=? OR lower(COALESCE(member_code,''))=? LIMIT 1`).bind(identifier,identifier,identifier).first();
  if (!member) return json({success:false,error:'بيانات الدخول غير صحيحة.'},401);
  if (!(member.status === 'active' || member.status === 'approved')) return json({success:false,error:'العضوية لم تُعتمد بعد من الإدارة.'},403);
  if (member.account_status && member.account_status !== 'active') return json({success:false,error:'الحساب غير مفعل حالياً.'},403);

  const role = String(member.medlife_role || '').toLowerCase();
  const isAdmin = role.includes('admin') || role.includes('administrator') || role.includes('مشرف') || role.includes('إدارة') || role.includes('مدير') || role.includes('رئيس');
  if (!isAdmin) return json({success:false,error:'هذا الحساب لا يملك صلاحية الإدارة.'},403);
  if (!member.password_hash || !(await verifyPassword(password, member.password_hash))) return json({success:false,error:'بيانات الدخول غير صحيحة.'},401);

  await ensureAdminTables(db);
  const token = randomToken();
  await db.prepare(`INSERT INTO admin_sessions(member_id,token_hash,expires_at) VALUES(?,?,datetime('now','+7 days'))`).bind(member.id,await hashToken(token)).run();
  const response = json({success:true,admin:{id:member.id,full_name:member.full_name,email:member.account_email || member.email,medlife_role:member.medlife_role}});
  const headers = new Headers(response.headers);
  headers.set('Set-Cookie', cookie(ADMIN_SESSION_COOKIE, encodeURIComponent(token), ADMIN_SESSION_DAYS*86400));
  return new Response(response.body,{status:response.status,headers});
}

export async function logoutAdmin(request, db) {
  await ensureAdminTables(db);
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (token) await db.prepare(`DELETE FROM admin_sessions WHERE token_hash=?`).bind(await hashToken(token)).run();
  const response = json({success:true});
  const headers = new Headers(response.headers);
  headers.set('Set-Cookie', cookie(ADMIN_SESSION_COOKIE,'',0));
  return new Response(response.body,{status:response.status,headers});
}

export { ADMIN_SESSION_COOKIE };
