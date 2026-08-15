import { ensureAuthTables, json } from '../_auth.js';

export async function onRequest({request,env}){
  if(request.method!=='GET') return json({success:false,error:'Method not allowed.'},405);
  if(!env.MEMBERS_DB) return json({success:false,error:'Database binding is not configured.'},500);
  if(!env.ADMIN_API_KEY || request.headers.get('X-Admin-Key')!==env.ADMIN_API_KEY) return json({success:false,error:'غير مصرح.'},401);
  try{
    await ensureAuthTables(env.MEMBERS_DB);
    const cols=await env.MEMBERS_DB.prepare('PRAGMA table_info(members)').all();
    const have=new Set((cols.results||[]).map(x=>x.name));
    for(const [name,type] of [['employment_status','TEXT'],['consultation_specialty','TEXT']]) if(!have.has(name)) await env.MEMBERS_DB.prepare(`ALTER TABLE members ADD COLUMN ${name} ${type}`).run();
    const members=await env.MEMBERS_DB.prepare(`SELECT id,member_code,full_name,email,account_email,phone,governorate,medlife_role,cell,consultation_specialty,employment_status,profession,workplace,status,account_status,created_at FROM members ORDER BY id DESC`).all();
    const applications=await env.MEMBERS_DB.prepare(`SELECT id,full_name,email,phone,governorate,academic_status,interest,profession,workplace,status,created_at FROM new_member_applications ORDER BY id DESC`).all();
    return json({success:true,members:members.results||[],applications:applications.results||[]});
  }catch(e){console.error(e);return json({success:false,error:'تعذر تحميل بيانات الأعضاء حالياً.'},500)}
}
