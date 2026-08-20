import { json } from './_auth.js';

const EXISTING_ADMIN_MEMBER_EMAIL = 'dr.ameen@medlifesy.org';
const ADMIN_USERNAME = 'admin';
const PBKDF2_ITERATIONS = 120000;
const enc = new TextEncoder();
function hex(bytes){return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function createPasswordHash(password){const salt=new Uint8Array(16);crypto.getRandomValues(salt);const key=await crypto.subtle.importKey('raw',enc.encode(password),{name:'PBKDF2'},false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:PBKDF2_ITERATIONS,hash:'SHA-256'},key,256);return {hash:`pbkdf2$sha256$${PBKDF2_ITERATIONS}$${hex(salt)}$${hex(bits)}`,salt:hex(salt)};}
export async function onRequest({request,env}){
 if(request.method!=='POST')return json({success:false,error:'Method not allowed.'},405);
 if(!env.MEMBERS_DB)return json({success:false,error:'Database binding is not configured.'},500);
 if(!env.ADMIN_BOOTSTRAP_SECRET)return json({success:false,error:'Admin bootstrap is not configured yet.'},503);
 try{
  const body=await request.json();const secret=String(body.secret||'');const password=String(body.password||'');const confirmPassword=String(body.confirmPassword||'');
  if(secret!==String(env.ADMIN_BOOTSTRAP_SECRET))return json({success:false,error:'رمز التهيئة غير صحيح.'},403);
  if(password.length<12)return json({success:false,error:'كلمة المرور يجب أن تكون 12 محرفاً على الأقل.'},400);
  if(password!==confirmPassword)return json({success:false,error:'كلمتا المرور غير متطابقتين.'},400);
  const db=env.MEMBERS_DB;
  const member=await db.prepare(`SELECT id,full_name,email,status FROM members WHERE lower(COALESCE(email,''))=? LIMIT 1`).bind(EXISTING_ADMIN_MEMBER_EMAIL).first();
  if(!member)return json({success:false,error:'لم يتم العثور على العضو الإداري الموجود.',error_code:'EXISTING_MEMBER_NOT_FOUND'},404);
  const existing=await db.prepare('SELECT id FROM member_accounts WHERE member_id=? OR lower(username)=lower(?) LIMIT 1').bind(member.id,ADMIN_USERNAME).first();
  const passwordData=await createPasswordHash(password);
  if(existing){
   await db.prepare(`UPDATE member_accounts SET member_id=?,username=?,password_hash=?,password_salt=?,role='admin',account_status='active',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(member.id,ADMIN_USERNAME,passwordData.hash,passwordData.salt,existing.id).run();
  }else{
   await db.prepare(`INSERT INTO member_accounts(member_id,username,password_hash,password_salt,role,account_status,created_at,updated_at) VALUES(?,?,?,?, 'admin','active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(member.id,ADMIN_USERNAME,passwordData.hash,passwordData.salt).run();
  }
  return json({success:true,message:'تم إنشاء/تحديث حساب إدارة المقالات بنجاح.',member_id:member.id,username:ADMIN_USERNAME});
 }catch(error){console.error('admin-bootstrap error:',error);return json({success:false,error:'تعذر إنشاء حساب الإدارة.'},500);}
}
