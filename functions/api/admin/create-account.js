import { ensureAuthTables, hashPassword, json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

const ACCOUNT_ROLES = new Set(['admin','administrator','medical_director','general_team_supervisor','advisor','editor','reviewer']);

export async function onRequest({request,env}){
  if(request.method!=='POST') return json({success:false,error:'Method not allowed.'},405);
  const db=env.TEAM_DB || env.MEMBERS_DB || env.DB;
  if(!db) return json({success:false,error:'Database binding is not configured.'},500);
  try{
    await ensureAuthTables(db);
    const admin=await authenticateAdmin(request,db);
    if(!admin) return json({success:false,error:'غير مصرح بإنشاء الحسابات.'},401);
    const body=await request.json().catch(()=>({}));
    const memberId=Number(body.member_id||0);
    const email=String(body.email||'').trim().toLowerCase();
    const password=String(body.password||'');
    const confirm=String(body.confirmPassword||'');
    const role=String(body.role||'editor').trim().toLowerCase();
    const accountStatus=body.status==='inactive'?'inactive':'active';
    if(!Number.isInteger(memberId)||memberId<1) return json({success:false,error:'يجب اختيار عضو صحيح.'},400);
    if(!email||!/\S+@\S+\.\S+/.test(email)) return json({success:false,error:'يرجى إدخال بريد إلكتروني صالح.'},400);
    if(password.length<12) return json({success:false,error:'كلمة المرور يجب أن تكون 12 محرفاً على الأقل.'},400);
    if(password!==confirm) return json({success:false,error:'كلمتا المرور غير متطابقتين.'},400);
    if(!ACCOUNT_ROLES.has(role)) return json({success:false,error:'الدور الإداري غير صالح.'},400);
    const member=await db.prepare('SELECT id,full_name,email,status,account_email FROM members WHERE id=? LIMIT 1').bind(memberId).first();
    if(!member) return json({success:false,error:'العضو غير موجود.'},404);
    if(!(member.status==='active'||member.status==='approved')) return json({success:false,error:'لا يمكن إنشاء حساب لعضوية غير معتمدة.'},403);
    await db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,password_salt TEXT,role TEXT NOT NULL DEFAULT 'editor',account_status TEXT NOT NULL DEFAULT 'active',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,last_login_at TEXT)`).run();
    const conflict=await db.prepare('SELECT id FROM member_accounts WHERE lower(username)=? AND member_id<>? LIMIT 1').bind(email,memberId).first();
    if(conflict) return json({success:false,error:'اسم المستخدم مستخدم بالفعل.'},409);
    const passwordHash=await hashPassword(password);
    const existing=await db.prepare('SELECT id FROM member_accounts WHERE member_id=? LIMIT 1').bind(memberId).first();
    if(existing) await db.prepare('UPDATE member_accounts SET username=?,password_hash=?,role=?,account_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(email,passwordHash,role,accountStatus,existing.id).run();
    else await db.prepare('INSERT INTO member_accounts(member_id,username,password_hash,role,account_status) VALUES(?,?,?,?,?)').bind(memberId,email,passwordHash,role,accountStatus).run();
    await db.prepare('UPDATE members SET account_email=?,account_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(email,accountStatus,memberId).run();
    return json({success:true,message:`تم إنشاء حساب ${member.full_name} بنجاح.`,member_id:memberId,username:email,role,account_status:accountStatus});
  }catch(error){
    console.error('admin create account error:',error);
    return json({success:false,error:'تعذر إنشاء الحساب الإداري حالياً.',detail:String(error?.message||error||'')},500);
  }
}
