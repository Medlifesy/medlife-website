import { authenticateAdmin } from './_admin-auth.js';
import { hashPassword, json, ensureAuthTables } from './_auth.js';

const ROLES = {
  content_manager: 'مدير المحتوى',
  content_editor: 'محرر المحتوى',
  medical_reviewer: 'مراجع طبي',
  members_manager: 'مدير الأعضاء',
  support_manager: 'مدير الدعم',
  complaints_manager: 'مدير الشكاوى'
};

function systemAdmin(me) {
  const r = String(me?.medlife_role || '').toLowerCase();
  return r.includes('admin') || r.includes('administrator') || r.includes('إدارة') || r.includes('مدير') || me?.org_role === 'medical_director';
}

function validEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim());
}

async function createUsername(db, email, memberId) {
  let base = String(email || `admin${memberId}`).split('@')[0].replace(/[^a-z0-9._-]/gi, '-').toLowerCase().slice(0, 30);
  if (base.length < 4) base = `admin${memberId}`;
  let username = base;
  let counter = 1;
  while (await db.prepare('SELECT id FROM member_accounts WHERE lower(username)=? LIMIT 1').bind(username).first()) {
    username = `${base.slice(0, 25)}-${counter++}`;
  }
  return username.slice(0, 40);
}

const ROLE_DESCRIPTIONS = {
  content_manager: 'إدارة دورة المحتوى ومراجعة المقالات ونشرها وأرشفتها.',
  content_editor: 'تحرير وإنشاء المقالات ضمن نطاق المحتوى.',
  medical_reviewer: 'مراجعة المحتوى الطبي قبل اعتماده.',
  members_manager: 'إدارة الأعضاء وطلبات الانضمام.',
  support_manager: 'إدارة عمليات الدعم والمتابعة.',
  complaints_manager: 'إدارة الشكاوى ومتابعتها.'
};

export async function onRequest({ request, env }) {
  const db = env.TEAM_DB || env.MEMBERS_DB || env.DB;
  if (!db) return json({ success: false, error: 'Database unavailable' }, 500);

  try {
    await ensureAuthTables(db);
    const me = await authenticateAdmin(request, db);
    if (!me || !systemAdmin(me)) return json({ success: false, error: 'هذه العملية متاحة لمدير النظام فقط.' }, 403);

    if (request.method === 'GET') {
      const membersPromise = db.prepare('SELECT id,full_name,email,member_code,status,account_email,account_status FROM members ORDER BY full_name').all();
      const roles = Object.entries(ROLES).map(([key, name]) => ({ key, name, description: ROLE_DESCRIPTIONS[key] || 'صلاحيات إدارية محددة حسب الدور.' }));
      const members = await membersPromise;
      return json({ success: true, members: members.results || [], roles });
    }

    if (request.method !== 'POST') return json({ success: false, error: 'Method not allowed.' }, 405);

    const body = await request.json().catch(() => ({}));
    const memberId = Number(body.member_id || 0);
    const fullName = String(body.full_name || '').trim();
    const email = String(body.account_email || body.email || '').trim().toLowerCase();
    const memberCode = String(body.member_code || '').trim();
    const role = String(body.role_key || '').trim();
    const password = String(body.password || '');

    if (!ROLES[role]) return json({ success: false, error: 'الدور المحدد غير صالح.' }, 400);
    if (password.length < 8) return json({ success: false, error: 'كلمة المرور يجب أن تكون 8 محارف على الأقل.' }, 400);
    if (!validEmail(email)) return json({ success: false, error: 'يرجى إدخال بريد إلكتروني صالح.' }, 400);

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS member_accounts (
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
      )
    `).run();

    let member;

    if (Number.isInteger(memberId) && memberId > 0) {
      member = await db.prepare('SELECT id,full_name,email,account_email,member_code,status FROM members WHERE id=? LIMIT 1').bind(memberId).first();
      if (!member) return json({ success: false, error: 'العضو غير موجود.' }, 404);
      const existingAccount = await db.prepare('SELECT id FROM member_accounts WHERE member_id=? LIMIT 1').bind(member.id).first();
      if (existingAccount) return json({ success: false, error: 'هذا العضو لديه حساب دخول بالفعل.' }, 409);
    } else {
      if (fullName.length < 2) return json({ success: false, error: 'يرجى إدخال الاسم الكامل.' }, 400);

      const duplicate = await db.prepare(`
        SELECT id,full_name,email,account_email,member_code,status,account_status
        FROM members
        WHERE lower(COALESCE(email,''))=? OR lower(COALESCE(account_email,''))=?
        LIMIT 1
      `).bind(email, email).first();
      if (duplicate) return json({ success: false, error: 'هذا البريد مرتبط بعضو موجود مسبقًا. استخدم خيار العضو الموجود.' }, 409);

      const next = await db.prepare('SELECT COALESCE(MAX(id),0)+1 AS next_id FROM members').first();
      const newId = Number(next?.next_id || 1);
      const generatedCode = memberCode || `ML-${String(newId).padStart(5, '0')}`;
      const passwordHash = await hashPassword(password);

      await db.prepare(`
        INSERT INTO members (
          id, full_name, email, status, account_email, password_hash,
          account_status, member_code, medlife_role, created_at, updated_at
        ) VALUES (?, ?, ?, 'active', ?, ?, 'active', ?, 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(newId, fullName, email, email, passwordHash, generatedCode).run();

      member = { id: newId, full_name: fullName, email, account_email: email, member_code: generatedCode };
    }

    const passwordHash = await hashPassword(password);
    const salt = (() => {
      const parts = String(passwordHash || '').split('$');
      return parts.length === 5 && parts[0] === 'pbkdf2' && parts[1] === 'sha256' ? parts[3] : null;
    })();
    const username = await createUsername(db, email, member.id);

    await db.prepare(`
      INSERT INTO member_accounts
        (member_id,username,password_hash,password_salt,role,account_status,created_at,updated_at)
      VALUES (?,?,?,?,?,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    `).bind(member.id, username, passwordHash, salt, 'admin').run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS medlife_admin_user_roles (
        member_id INTEGER NOT NULL,
        role_key TEXT NOT NULL,
        PRIMARY KEY(member_id,role_key)
      )
    `).run();
    await db.prepare('INSERT OR IGNORE INTO medlife_admin_user_roles(member_id,role_key) VALUES(?,?)').bind(member.id, role).run();

    await db.prepare(`
      UPDATE members
      SET account_email=?, password_hash=?, account_status='active', updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(email, passwordHash, member.id).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS medlife_admin_audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_member_id INTEGER,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        details TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await db.prepare('INSERT INTO medlife_admin_audit_log(actor_member_id,action,target_type,target_id,details) VALUES(?,?,?,?,?)')
      .bind(me.member_id, 'إنشاء حساب إداري', 'member', String(member.id), `${ROLES[role]} — ${email}`).run();

    return json({
      success: true,
      message: 'تمت إضافة العضو وإنشاء الحساب الإداري بنجاح.',
      member: { id: member.id, name: member.full_name, email },
      account: { username, email, role: ROLES[role] }
    });
  } catch (e) {
    console.error(e);
    return json({ success: false, error: 'تعذر إنشاء الحساب الإداري.', detail: String(e?.message || e) }, 500);
  }
}
