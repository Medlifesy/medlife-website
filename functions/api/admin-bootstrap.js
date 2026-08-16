import { json } from './_auth.js';

const ADMIN_EMAIL = 'admin@medlifesy.org';
const EXISTING_ADMIN_MEMBER_EMAIL = 'dr.ameen@medlifesy.org';
const PBKDF2_ITERATIONS = 120000;
const enc = new TextEncoder();

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createPasswordHash(password) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return `pbkdf2$sha256$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(bits)}`;
}

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

    const existingMember = await db.prepare(`
      SELECT id, full_name, email, status, account_email, medlife_role
      FROM members
      WHERE lower(COALESCE(email,''))=?
      LIMIT 1
    `).bind(EXISTING_ADMIN_MEMBER_EMAIL).first();

    if (!existingMember) {
      return json({ success: false, error: 'لم يتم العثور على العضو الإداري الموجود.', error_code: 'EXISTING_MEMBER_NOT_FOUND' }, 404);
    }

    const emailOwner = await db.prepare(`
      SELECT id
      FROM members
      WHERE id<>?
        AND (lower(COALESCE(email,''))=? OR lower(COALESCE(account_email,''))=?)
      LIMIT 1
    `).bind(existingMember.id, ADMIN_EMAIL, ADMIN_EMAIL).first();

    if (emailOwner) {
      return json({ success: false, error: 'البريد الإداري مستخدم من عضو آخر.', error_code: 'ADMIN_EMAIL_ALREADY_USED' }, 409);
    }

    let passwordHash;
    try {
      passwordHash = await createPasswordHash(password);
    } catch (error) {
      console.error('admin-bootstrap password hashing failed:', error);
      return json({ success: false, error: 'تعذر تجهيز كلمة المرور.', error_code: 'PASSWORD_HASH_FAILED' }, 500);
    }

    const memberCode = `ADMIN-${Date.now()}`;

    const result = await db.prepare(`
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

    const changes = Number(result?.meta?.changes ?? 0);
    if (changes !== 1) {
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
    return json({ success: false, error: 'تعذر إنشاء حساب الإدارة.', error_code: 'ADMIN_BOOTSTRAP_ERROR' }, 500);
  }
}
