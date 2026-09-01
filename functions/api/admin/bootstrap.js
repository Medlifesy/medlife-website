import { ensureAuthTables, hashPassword, json } from '../_auth.js';

async function ensureMemberSchema(db) {
  const exists = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='members' LIMIT 1").first();
  if (!exists) {
    await db.prepare(`CREATE TABLE members (id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, email TEXT, status TEXT DEFAULT 'active', account_email TEXT, password_hash TEXT, account_status TEXT DEFAULT 'active', member_code TEXT, medlife_role TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  } else await ensureAuthTables(db);
}

async function ensureMemberAccounts(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL UNIQUE, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, password_salt TEXT, role TEXT NOT NULL DEFAULT 'member', account_status TEXT NOT NULL DEFAULT 'active', last_login_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
}

function extractSalt(passwordHash) {
  const parts = String(passwordHash || '').split('$');
  return parts.length === 5 && parts[0] === 'pbkdf2' && parts[1] === 'sha256' ? parts[3] : null;
}

async function createUsername(db, email, memberId) {
  let base = String(email || `admin${memberId}`).split('@')[0].replace(/[^a-z0-9._-]/gi, '-').toLowerCase().slice(0, 30);
  if (base.length < 4) base = `admin${memberId}`;
  let username = base, counter = 1;
  while (await db.prepare('SELECT id FROM member_accounts WHERE lower(username)=? LIMIT 1').bind(username).first()) username = `${base.slice(0, 25)}-${counter++}`;
  return username.slice(0, 40);
}

export async function onRequest({ request, env }) {
  const db = env.TEAM_DB;
  if (!db) return json({ success:false, error:'قاعدة بيانات الفريق غير مهيأة.' },500);
  try {
    await ensureMemberSchema(db); await ensureMemberAccounts(db);
    const existingAccount = await db.prepare(`SELECT id FROM member_accounts WHERE lower(COALESCE(role,'')) IN ('admin','administrator','system_admin','medical_director','general_team_supervisor','advisor') LIMIT 1`).first();
    if (existingAccount) return json({ success:false, locked:true, error:'تم إغلاق التهيئة الأولى لأن حساباً إدارياً موجود بالفعل.' },409);
    if (request.method === 'GET') return json({ success:true, available:true, message:'تهيئة حساب مدير النظام متاحة لمرة واحدة.' });
    if (request.method !== 'POST') return json({ success:false,error:'Method not allowed.' },405);

    const body=await request.json().catch(()=>({}));
    const fullName=String(body.full_name||'').trim(); const email=String(body.email||'').trim().toLowerCase();
    const password=String(body.password||''); const confirm=String(body.confirmPassword||'');
    if(fullName.length<2) return json({success:false,error:'يرجى إدخال الاسم الكامل.'},400);
    if(!/^\S+@\S+\.\S+$/.test(email)) return json({success:false,error:'يرجى إدخال بريد إلكتروني صالح.'},400);
    if(password.length<12) return json({success:false,error:'كلمة المرور يجب أن تكون 12 محرفاً على الأقل.'},400);
    if(password!==confirm) return json({success:false,error:'كلمتا المرور غير متطابقتين.'},400);

    const existingMember=await db.prepare(`SELECT id,full_name,email,account_email,member_code,medlife_role,status FROM members WHERE lower(COALESCE(account_email,''))=? OR lower(COALESCE(email,''))=? LIMIT 1`).bind(email,email).first();
    const adminRoles=['admin','administrator','system_admin','medical_director','general_team_supervisor','advisor'];
    const canReuseExistingAdmin=existingMember && String(existingMember.status||'active').toLowerCase()==='active' && adminRoles.includes(String(existingMember.medlife_role||'').toLowerCase());
    if(existingMember && !canReuseExistingAdmin) return json({success:false,error:'البريد الإلكتروني مرتبط بعضو موجود مسبقاً وليس حساب إدارة عامة.'},409);

    const passwordHash=await hashPassword(password); const passwordSalt=extractSalt(passwordHash); let memberId;
    if(canReuseExistingAdmin){
      memberId=Number(existingMember.id);
      await db.prepare(`UPDATE members SET full_name=?,email=?,account_email=?,password_hash=?,account_status='active',member_code=COALESCE(member_code,?),medlife_role='admin',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(fullName,email,email,passwordHash,`SYS-ADMIN-${String(memberId).padStart(3,'0')}`,memberId).run();
    } else {
      const row=await db.prepare('SELECT COALESCE(MAX(id),0)+1 AS next_id FROM members').first(); memberId=Number(row?.next_id||1);
      await db.prepare(`INSERT INTO members(id,full_name,email,status,account_email,password_hash,account_status,member_code,medlife_role,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(memberId,fullName,email,'active',email,passwordHash,'active',`SYS-ADMIN-${String(memberId).padStart(3,'0')}`,'admin').run();
    }

    const username=await createUsername(db,email,memberId);
    await db.prepare(`INSERT INTO member_accounts(member_id,username,password_hash,password_salt,role,account_status,created_at,updated_at) VALUES(?,?,?,?,?,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(memberId,username,passwordHash,passwordSalt,'admin').run();
    return json({success:true,message:'تم إنشاء حساب مدير النظام بنجاح.',login_url:'/login',member_id:memberId,username,role:'admin'});
  } catch(error) {
    console.error('admin bootstrap error:',error);
    return json({success:false,error:'تعذر إنشاء حساب مدير النظام.',detail:String(error?.message||error||'')},500);
  }
}
