import { ensureAdminTables } from './_admin-auth.js';
import { hashPassword, json } from './_auth.js';

const ADMIN_EMAIL = 'admin@medlifesy.org';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ success: false, error: 'Method not allowed.' }, 405);
  if (!env.MEMBERS_DB) return json({ success: false, error: 'Database binding is not configured.' }, 500);
  if (!env.ADMIN_BOOTSTRAP_SECRET) return json({ success: false, error: 'Admin bootstrap is not configured yet.' }, 503);

  try {
    const body = await request.json();
    const secret = String(body.secret || '');
    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');

    if (secret !== String(env.ADMIN_BOOTSTRAP_SECRET)) return json({ success: false, error: 'رمز التهيئة غير صحيح.' }, 403);
    if (password.length < 12) return json({ success: false, error: 'كلمة المرور يجب أن تكون 12 محرفاً على الأقل.' }, 400);
    if (password !== confirmPassword) return json({ success: false, error: 'كلمتا المرور غير متطابقتين.' }, 400);

    const db = env.MEMBERS_DB;
    await ensureAdminTables(db);

    const existingAdmin = await db.prepare(`SELECT m.id FROM members m WHERE lower(COALESCE(m.account_email,''))=? AND (lower(COALESCE(m.medlife_role,'')) LIKE '%admin%' OR lower(COALESCE(m.medlife_role,'')) LIKE '%administrator%' OR lower(COALESCE(m.medlife_role,'')) LIKE '%مشرف%' OR lower(COALESCE(m.medlife_role,'')) LIKE '%إدارة%' OR lower(COALESCE(m.medlife_role,'')) LIKE '%مدير%' OR lower(COALESCE(m.medlife_role,'')) LIKE '%رئيس%') LIMIT 1`).bind(ADMIN_EMAIL).first();
    if (existingAdmin) return json({ success: false, error: 'حساب الإدارة الأول موجود بالفعل. استخدم صفحة تسجيل الدخول.' }, 409);

    const existingEmail = await db.prepare(`SELECT id FROM members WHERE lower(COALESCE(email,''))=? OR lower(COALESCE(account_email,''))=? LIMIT 1`).bind(ADMIN_EMAIL, ADMIN_EMAIL).first();
    if (existingEmail) return json({ success: false, error: 'البريد الإلكتروني مستخدم مسبقاً.' }, 409);

    const passwordHash = await hashPassword(password);
    const memberCode = `ADMIN-${Date.now()}`;
    const fullName = 'MedLife Administrator';
    const nationalId = `ADMIN-${Date.now()}`;

    const result = await db.prepare(`INSERT INTO members (full_name,mother_name,national_id,email,gender,education_level,governorate,medlife_role,cell,join_date,volunteer_certificate,status,account_email,password_hash,account_status,member_code) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      fullName,
      'MedLife',
      nationalId,
      ADMIN_EMAIL,
      'not_specified',
      'administrator',
      'Tartous',
      'admin',
      'administration',
      new Date().toISOString().slice(0, 10),
      'no',
      'active',
      ADMIN_EMAIL,
      passwordHash,
      'active',
      memberCode
    ).run();

    return json({ success: true, message: 'تم إنشاء حساب الإدارة بنجاح.', member_id: result.meta?.last_row_id || null, email: ADMIN_EMAIL });
  } catch (error) {
    console.error('admin-bootstrap error:', error);
    return json({ success: false, error: 'تعذر إنشاء حساب الإدارة.' }, 500);
  }
}
