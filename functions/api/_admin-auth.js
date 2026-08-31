import { hashToken, randomToken, verifyPassword, getCookie, json, cookie, ensureAuthTables } from './_auth.js';

const ADMIN_SESSION_COOKIE = 'medlife_admin_session';
const ADMIN_SESSION_DAYS = 7;
const ADMIN_SESSION_TABLE = 'medlife_system_admin_sessions_v2';
const ORG_ADMIN_ROLES = new Set(['general_team_supervisor','advisor','medical_director']);

async function getOrgAdminRole(db,memberId){
  try{
    const exists=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='medlife_org_assignments' LIMIT 1").first();
    if(!exists) return null;
    const row=await db.prepare(`SELECT role_key FROM medlife_org_assignments WHERE member_id=? AND is_active=1 AND role_key IN ('general_team_supervisor','advisor','medical_director') ORDER BY CASE role_key WHEN 'medical_director' THEN 1 WHEN 'general_team_supervisor' THEN 2 WHEN 'advisor' THEN 3 ELSE 9 END LIMIT 1`).bind(memberId).first();
    return row?.role_key||null;
  }catch{return null}
}

export async function ensureAdminTables(db) {
  await ensureAuthTables(db);
  await db.prepare(`CREATE TABLE IF NOT EXISTS ${ADMIN_SESSION_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_${ADMIN_SESSION_TABLE}_member ON ${ADMIN_SESSION_TABLE}(member_id)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_${ADMIN_SESSION_TABLE}_expires ON ${ADMIN_SESSION_TABLE}(expires_at)`).run();
}

export async function issueAdminSession(db,memberId) {
  await ensureAdminTables(db);
  const token=randomToken();
  const tokenHash=await hashToken(token);
  await db.prepare(`DELETE FROM ${ADMIN_SESSION_TABLE} WHERE datetime(expires_at)<=datetime('now') OR member_id=?`).bind(memberId).run();
  await db.prepare(`INSERT INTO ${ADMIN_SESSION_TABLE}(member_id,token_hash,expires_at,created_at,last_seen_at) VALUES(?,?,datetime('now','+7 days'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(memberId,tokenHash).run();
  return token;
}

export async function authenticateAdmin(request, db) {
  await ensureAdminTables(db);
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const row = await db.prepare(`SELECT s.member_id, m.full_name, m.email, m.account_email, m.medlife_role, m.account_status, m.status FROM ${ADMIN_SESSION_TABLE} s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now') LIMIT 1`).bind(tokenHash).first();
  if (!row) return null;
  if (row.account_status && row.account_status !== 'active') return null;
  if (!(row.status === 'active' || row.status === 'approved')) return null;
  row.org_role = await getOrgAdminRole(db,row.member_id);
  await db.prepare(`UPDATE ${ADMIN_SESSION_TABLE} SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?`).bind(tokenHash).run();
  return row;
}

export async function loginAdmin(request, db) {
  await ensureAuthTables(db);
  await ensureAdminTables(db);
  const body = await request.json();
  const identifier = String(body.identifier || body.email || body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!identifier || !password) return json({success:false,error:'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور.'},400);
  const member = await db.prepare(`SELECT id,full_name,email,account_email,password_hash,account_status,status,medlife_role,member_code FROM members WHERE lower(COALESCE(account_email,''))=? OR lower(COALESCE(email,''))=? OR lower(COALESCE(member_code,''))=? LIMIT 1`).bind(identifier,identifier,identifier).first();
  if (!member) return json({success:false,error:'بيانات الدخول غير صحيحة.'},401);
  if (!(member.status === 'active' || member.status === 'approved')) return json({success:false,error:'العضوية لم تُعتمد بعد من الإدارة.'},403);
  if (member.account_status && member.account_status !== 'active') return json({success:false,error:'الحساب غير مفعل حالياً.'},403);
  const role = String(member.medlife_role || '').toLowerCase();
  const orgRole = await getOrgAdminRole(db,member.id);
  const isAdmin = role.includes('admin') || role.includes('administrator') || role.includes('مشرف') || role.includes('إدارة') || role.includes('مدير') || role.includes('رئيس') || role.includes('مستشار') || ORG_ADMIN_ROLES.has(orgRole);
  if (!isAdmin) return json({success:false,error:'هذا الحساب لا يملك صلاحية الإدارة.'},403);
  if (!member.password_hash || !(await verifyPassword(password, member.password_hash))) return json({success:false,error:'بيانات الدخول غير صحيحة.'},401);
  const token=await issueAdminSession(db,member.id);
  const response = json({success:true,admin:{id:member.id,full_name:member.full_name,email:member.account_email || member.email,medlife_role:member.medlife_role,org_role:orgRole}});
  const headers = new Headers(response.headers);
  headers.set('Set-Cookie', cookie(ADMIN_SESSION_COOKIE, encodeURIComponent(token), ADMIN_SESSION_DAYS*86400));
  return new Response(response.body,{status:response.status,headers});
}

export async function logoutAdmin(request, db) {
  await ensureAdminTables(db);
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (token) await db.prepare(`DELETE FROM ${ADMIN_SESSION_TABLE} WHERE token_hash=?`).bind(await hashToken(token)).run();
  const response = json({success:true});
  const headers = new Headers(response.headers);
  headers.set('Set-Cookie', cookie(ADMIN_SESSION_COOKIE,'',0));
  return new Response(response.body,{status:response.status,headers});
}

export { ADMIN_SESSION_COOKIE };