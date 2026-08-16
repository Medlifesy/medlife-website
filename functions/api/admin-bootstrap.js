import { hashPassword, json } from './_auth.js';

const ADMIN_EMAIL = 'admin@medlifesy.org';
const EXISTING_ADMIN_MEMBER_EMAIL = 'dr.ameen@medlifesy.org';

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

    let existingMember;
    try {
      existingMember = await db.prepare(`
        SELECT id, full_name, email, status, account_email, medlife_role
        FROM members
        WHERE lower(COALESCE(email,''))=?
        LIMIT 1
      `).bind(EXISTING_ADMIN_MEMBER_EMAIL).first();
    } catch (error) {
      console.error('admin-bootstrap member lookup failed:', error);
      return json({ success: false, error: 'تعذر الوصول إلى جدول الأعضاء.', error_code: 'DB_LOOKUP_FAILED' }, 500);
    }

    if (!existingMember) {
      return json({ success: false, error: 'لم يتم العثور على العضو الإداري الموجود.', error_code: 'EXISTING_MEMBER_NOT_FOUND' }, 404);
    }

    let emailOwner;
    try {
      emailOwner = await db.prepare(`
        SELECT id, email, account_email
        FROM members
        WHERE id<>?
          AND (lower(COALESCE(email,''))=? OR lower(COALESCE(account_email,''))=?)
        LIMIT 1
      `).bind(existingMember.id, ADMIN_EMAIL, ADMIN_EMAIL).first();
    } catch (error) {
      console.error('admin-bootstrap email owner lookup failed:', error);
      return json({ success: false, error: 'تعذر التحقق من البريد الإداري.', error_code: 'EMAIL_LOOKUP_FAILED' }, 500);
    }

    if (emailOwner) {
      return json({ success: false, error: 'البريد الإداري مستخدم من عضو آخر.', error_code: 'ADMIN_EMAIL_ALREADY_USED' }, 409);
    }

    let passwordHash;
    try {
      passwordHash = await hashPassword(password);
    } catch (error) {
      console.error('admin-bootstrap password hashing failed:', error);
      return json({ success: false, error: 'تعذر تجهيز كلمة المرور.', error_code: 'PASSWORD_HASH_FAILED' }, 500);
    }

    const memberCode = `ADMIN-${Date.now()}`;

    let result;
    try {
      result = await db.prepare(`
        UPDATE members
        SET account_email=?,
            password_hash=?,
            account_status='active',
            medlife_role='admin',
            status='active',
            member_code=?,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).bind(ADMIN_EMAIL, passwordHash, memberCode, existingMember.id).run();
    } catch (error) {
      console.error('admin-bootstrap member update failed:', error);
      return json({ success: false, error: 'تعذر تحديث سجل العضو الإداري.', error_code: 'MEMBER_UPDATE_FAILED' }, 500);
    }

    const changes = Number(result?.meta?.changes ?? 0);
    if (changes !== 1) {
      console.error('admin-bootstrap unexpected update changes:', changes);
      return json({ success: false, error: 'لم يتم تحديث سجل العضو الإداري.', error_code: 'MEMBER_UPDATE_NO_CHANGE' }, 500);
    }

    return json({
      success: true,
      message: 'تم تفعيل حساب الإدارة على العضو الموجود بنجاح.',
      member_id: existingMember.id,
      email: ADMIN_EMAIL
    });
  } catch (error) {
    console.error('admin-bootstrap unexpected error:', error);
    return json({
      success: false,
      error: 'تعذر إنشاء حساب الإدارة.',
      error_code: 'ADMIN_BOOTSTRAP_ERROR'
    }, 500);
  }
}
