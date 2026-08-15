import { ensureAuthTables, json } from '../_auth.js';

export async function onRequest({request,env}){
 if(request.method!=='POST')return json({success:false,error:'Method not allowed.'},405);
 if(!env.MEMBERS_DB)return json({success:false,error:'Database binding is not configured.'},500);
 if(!env.ADMIN_API_KEY)return json({success:false,error:'ADMIN_API_KEY secret is not configured.'},500);
 if(request.headers.get('X-Admin-Key')!==env.ADMIN_API_KEY)return json({success:false,error:'غير مصرح.'},401);
 try{
  await ensureAuthTables(env.MEMBERS_DB);const b=await request.json();const type=String(b.type||''),id=Number(b.id);if(!['new','current'].includes(type)||!Number.isInteger(id)||id<1)return json({success:false,error:'بيانات الموافقة غير صالحة.'},400);
  if(type==='current'){
   const m=await env.MEMBERS_DB.prepare('SELECT id,member_code FROM members WHERE id=? LIMIT 1').bind(id).first();if(!m)return json({success:false,error:'العضو غير موجود.'},404);
   await env.MEMBERS_DB.prepare("UPDATE members SET status='active',account_status='active',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();return json({success:true,message:'تم تفعيل حساب العضو.',member_id:id,member_code:m.member_code});
  }
  const a=await env.MEMBERS_DB.prepare('SELECT * FROM new_member_applications WHERE id=? LIMIT 1').bind(id).first();if(!a)return json({success:false,error:'طلب الانضمام غير موجود.'},404);if(a.status==='approved')return json({success:false,error:'تمت الموافقة على هذا الطلب مسبقاً.'},409);
  const duplicate=await env.MEMBERS_DB.prepare('SELECT id FROM members WHERE national_id=? OR lower(COALESCE(account_email,email,\'\'))=? LIMIT 1').bind(a.national_id,String(a.email).toLowerCase()).first();if(duplicate)return json({success:false,error:'يوجد حساب عضو مرتبط مسبقاً بهذا الرقم الوطني أو البريد الإلكتروني.'},409);
  const code='ML-'+crypto.randomUUID().slice(0,8).toUpperCase();
  const r=await env.MEMBERS_DB.prepare(`INSERT INTO members(full_name,mother_name,national_id,email,account_email,password_hash,account_status,member_code,phone,gender,education_level,study_year,university,resident_specialty,residency_year,residency_hospital,address,governorate,join_date,volunteer_certificate,status,created_at,updated_at,academic_status,faculty,graduation_year,profession,workplace) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_DATE,'no','active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?,?,?,?,?)`).bind(a.full_name,a.mother_name,a.national_id,a.email,a.email,a.account_password_hash,'active',code,a.phone,a.gender,a.academic_status,a.study_year,a.university,a.resident_specialty,a.residency_year,a.residency_hospital,a.address,a.governorate,a.academic_status,a.faculty,a.graduation_year,a.profession,a.workplace).run();
  await env.MEMBERS_DB.prepare("UPDATE new_member_applications SET status='approved',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();return json({success:true,message:'تم قبول الطلب وإنشاء حساب العضو.',member_id:r.meta?.last_row_id??null,member_code:code});
 }catch(e){console.error(e);return json({success:false,error:'تعذر تنفيذ الموافقة حالياً.'},500)}
}
