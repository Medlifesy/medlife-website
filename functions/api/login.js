import { ensureAuthTables, verifyPassword, randomToken, hashToken, cookie, json } from './_auth.js';

export async function onRequest({request,env}){
  if(request.method==='OPTIONS') return json({success:true});
  if(request.method!=='POST') return json({success:false,error:'Method not allowed.'},405);
  if(!env.MEMBERS_DB) return json({success:false,error:"Database binding 'MEMBERS_DB' is not configured."},500);
  try{
    await ensureAuthTables(env.MEMBERS_DB);
    const b=await request.json();
    const email=String(b.email||'').trim().toLowerCase();
    const password=String(b.password||'');
    if(!/^\S+@\S+\.\S+$/.test(email)||!password) return json({success:false,error:'يرجى إدخال البريد الإلكتروني وكلمة المرور.'},400);
    const member=await env.MEMBERS_DB.prepare(`SELECT id,full_name,email,account_email,password_hash,status,account_status,member_code,medlife_role,cell FROM members WHERE lower(COALESCE(account_email,email,''))=? LIMIT 1`).bind(email).first();
    if(!member||!member.password_hash) return json({success:false,error:'بيانات الدخول غير صحيحة أو لم يتم تفعيل الحساب بعد.'},401);
    if(member.status!=='active'||member.account_status!=='active') return json({success:false,error:'الحساب بانتظار موافقة الإدارة أو غير مفعّل حالياً.'},403);
    if(!(await verifyPassword(password,member.password_hash))) return json({success:false,error:'بيانات الدخول غير صحيحة.'},401);
    const rawToken=randomToken(),tokenHash=await hashToken(rawToken);
    const expires=new Date(Date.now()+1000*60*60*24*30).toISOString();
    await env.MEMBERS_DB.prepare('DELETE FROM member_sessions WHERE member_id=? OR expires_at<=CURRENT_TIMESTAMP').bind(member.id).run();
    await env.MEMBERS_DB.prepare('INSERT INTO member_sessions(member_id,token_hash,expires_at) VALUES(?,?,?)').bind(member.id,tokenHash,expires).run();
    return json({success:true,user:{id:member.id,member_code:member.member_code,full_name:member.full_name,email:member.account_email||member.email,role:member.medlife_role,cell:member.cell}},200,{'Set-Cookie':cookie('medlife_session',rawToken,60*60*24*30)});
  }catch(e){console.error(e);return json({success:false,error:'تعذر تسجيل الدخول حالياً.'},500)}
}
