import { ensureAuthTables, hashPassword, json } from '../_auth.js';

const BOOTSTRAP_ROLES = new Set(['admin']);

async function ensureMemberSchema(db) {
  const exists = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='members' LIMIT 1").first();
  if (!exists) {
    await db.prepare(`CREATE TABLE members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT,
      status TEXT DEFAULT 'active',
      account_email TEXT,
      password_hash TEXT,
      account_status TEXT DEFAULT 'active',
      member_code TEXT,
      medlife_role TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`).run();
    return;
  }
  await ensureAuthTables(db);
}

export async function onRequest({ request, env }) {
  const db = env.TEAM_DB;
  if (!db) return json({ success:false, error:'قاعدة بيانات الفريق غير مهيأة.' },500);
  try {
    await ensureMemberSchema(db);
    const admin = await db.prepare("SELECT id FROM members WHERE lower(COALESCE(medlife_role,''))='admin' AND COALESCE(account_status,'active')='active' AND password_hash IS NOT NULL LIMIT 1").first();
    if (admin) return json({ success:false, locked:true, error:'تم إغلاق التهيئة الأولى لأن حساب مدير النظام موجود بالفعل.' },409);

    if (request.method === 'GET') {
      return json({ success:true, available:true, message:'تهيئة حساب مدير النظام متاحة لمرة واحدة.' });
    }
    if (request.method !== 'POST') return json({ success:false,error:'Method not allowed.' },405);

    const body=await request.json().catch(()=>({}));
    const fullName=String(body.full_name||'').trim();
    const email=String(body.email||'').trim().toLowerCase();
    const password=String(body.password||'');
    const confirm=String(body.confirmPassword||'');
    if(fullName.length<2) return json({success:false,error:'يرجى إدخال الاسم الكامل.'},400);
    if(!/^\S+@\S+\.\S+$/.test(email)) return json({success:false,error:'يرجى إدخال بريد إلكتروني صالح.'},400);
    if(password.length<12) return json({success:false,error:'كلمة المرور يجب أن تكون 12 محرفاً على الأقل.'},400);
    if(password!==confirm) return json({success:false,error:'كلمتا المرور غير متطابقتين.'},400);

    const conflict=await db.prepare("SELECT id FROM members WHERE lower(COALESCE(account_email,''))=? OR lower(COALESCE(email,''))=? LIMIT 1").bind(email,email).first();
    if(conflict) return json({success:false,error:'البريد الإلكتروني مستخدم مسبقاً.'},409);

    const passwordHash=await hashPassword(password);
    const memberCode='SYS-ADMIN-001';
    await db.prepare(`INSERT INTO members(full_name,email,status,account_email,password_hash,account_status,member_code,medlife_role,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(fullName,email,'active',email,passwordHash,'active',memberCode,'admin').run();
    return json({success:true,message:'تم إنشاء حساب مدير النظام بنجاح.','login_url':'/admin-login'});
  } catch(error) {
    console.error('admin bootstrap error:',error);
    return json({success:false,error:'تعذر إنشاء حساب مدير النظام.',detail:String(error?.message||error||'')},500);
  }
}
