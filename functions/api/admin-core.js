import { authenticateAdmin } from './_admin-auth.js';
import { hashPassword, json } from './_auth.js';

const PERMISSIONS = [
  ['system.dashboard','لوحة الإدارة العامة'],['system.users','إدارة الحسابات الإدارية'],['system.roles','الأدوار والصلاحيات'],['system.audit','سجل النشاط'],['system.sessions','الجلسات'],['system.settings','إعدادات النظام'],
  ['articles.view','مشاهدة المقالات'],['articles.create','إنشاء المقالات'],['articles.edit','تعديل المقالات'],['articles.review','مراجعة المقالات'],['articles.publish','نشر المقالات'],['articles.archive','أرشفة المقالات'],
  ['members.view','مشاهدة الأعضاء'],['members.manage','إدارة الأعضاء'],['join.view','طلبات الانضمام'],['join.manage','إدارة طلبات الانضمام'],['support.view','طلبات صندوق الدعم'],['support.manage','إدارة صندوق الدعم'],['complaints.view','الشكاوى'],['complaints.manage','إدارة الشكاوى']
];
const ROLES = {
  system_admin:{name:'مدير النظام',permissions:['*']},
  content_manager:{name:'مدير المحتوى',permissions:['articles.view','articles.create','articles.edit','articles.review','articles.publish','articles.archive']},
  content_editor:{name:'محرر المحتوى',permissions:['articles.view','articles.create','articles.edit']},
  medical_reviewer:{name:'مراجع طبي',permissions:['articles.view','articles.review']},
  members_manager:{name:'مدير الأعضاء',permissions:['members.view','members.manage','join.view','join.manage']},
  support_manager:{name:'مدير الدعم',permissions:['support.view','support.manage']},
  complaints_manager:{name:'مدير الشكاوى',permissions:['complaints.view','complaints.manage']}
};

async function ensure(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_roles (role_key TEXT PRIMARY KEY,name TEXT NOT NULL,description TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_permissions (permission_key TEXT PRIMARY KEY,name TEXT NOT NULL)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_role_permissions (role_key TEXT NOT NULL,permission_key TEXT NOT NULL,PRIMARY KEY(role_key,permission_key))`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_user_roles (member_id INTEGER NOT NULL,role_key TEXT NOT NULL,PRIMARY KEY(member_id,role_key))`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT,actor_member_id INTEGER,action TEXT NOT NULL,target_type TEXT,target_id TEXT,details TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_admin_notifications (id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER,title TEXT NOT NULL,body TEXT,link TEXT,is_read INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  for(const [key,name] of PERMISSIONS) await db.prepare('INSERT OR IGNORE INTO medlife_admin_permissions(permission_key,name) VALUES(?,?)').bind(key,name).run();
  for(const [key,r] of Object.entries(ROLES)){
    await db.prepare('INSERT OR IGNORE INTO medlife_admin_roles(role_key,name) VALUES(?,?)').bind(key,r.name).run();
    for(const p of r.permissions) await db.prepare('INSERT OR IGNORE INTO medlife_admin_role_permissions(role_key,permission_key) VALUES(?,?)').bind(key,p).run();
  }
}
async function actor(request,db){return await authenticateAdmin(request,db)}
async function audit(db,actorId,action,type='',id='',details=''){await db.prepare('INSERT INTO medlife_admin_audit_log(actor_member_id,action,target_type,target_id,details) VALUES(?,?,?,?,?)').bind(actorId,action,type,String(id||''),details).run()}

export async function onRequest({request,env}){
  const db=env.TEAM_DB||env.MEMBERS_DB||env.DB;if(!db)return json({success:false,error:'Database unavailable'},500);
  try{
    await ensure(db); const me=await actor(request,db); if(!me)return json({success:false,error:'غير مصرح.'},401);
    const u=new URL(request.url), action=u.searchParams.get('action')||'dashboard';
    if(action==='dashboard'){
      const [members,pending,admins,audit,notes]=await Promise.all([
        db.prepare("SELECT COUNT(*) n FROM members").first(),db.prepare("SELECT COUNT(*) n FROM members WHERE status='pending'").first(),db.prepare("SELECT COUNT(*) n FROM members WHERE account_status='active' AND password_hash IS NOT NULL").first(),db.prepare("SELECT a.*,m.full_name actor_name FROM medlife_admin_audit_log a LEFT JOIN members m ON m.id=a.actor_member_id ORDER BY a.id DESC LIMIT 12").all(),db.prepare('SELECT * FROM medlife_admin_notifications WHERE member_id=? ORDER BY id DESC LIMIT 20').bind(me.member_id).all()
      ]); return json({success:true,admin:me,stats:{members:members?.n||0,pending:pending?.n||0,admins:admins?.n||0},audit:audit.results||[],notifications:notes.results||[]});
    }
    if(action==='roles'){
      const roles=await db.prepare('SELECT r.role_key,r.name,COUNT(ur.member_id) users FROM medlife_admin_roles r LEFT JOIN medlife_admin_user_roles ur ON ur.role_key=r.role_key GROUP BY r.role_key,r.name ORDER BY r.name').all();return json({success:true,roles:roles.results||[],permissions:PERMISSIONS.map(([key,name])=>({key,name}))});
    }
    if(action==='users'){
      const rows=await db.prepare(`SELECT m.id,m.full_name,m.account_email,m.account_status,m.status,m.member_code,GROUP_CONCAT(ur.role_key) roles FROM members m JOIN medlife_admin_user_roles ur ON ur.member_id=m.id GROUP BY m.id ORDER BY m.full_name`).all();return json({success:true,users:rows.results||[]});
    }
    if(action==='audit') {const rows=await db.prepare('SELECT a.*,m.full_name actor_name FROM medlife_admin_audit_log a LEFT JOIN members m ON m.id=a.actor_member_id ORDER BY a.id DESC LIMIT 100').all();return json({success:true,items:rows.results||[]});}
    if(action==='notifications') {const rows=await db.prepare('SELECT * FROM medlife_admin_notifications WHERE member_id=? ORDER BY id DESC LIMIT 50').bind(me.member_id).all();return json({success:true,items:rows.results||[]});}
    if(request.method==='POST'&&action==='assign-role'){
      const b=await request.json();if(!b.member_id||!ROLES[b.role_key])return json({success:false,error:'الدور غير صالح.'},400);await db.prepare('INSERT OR IGNORE INTO medlife_admin_user_roles(member_id,role_key) VALUES(?,?)').bind(Number(b.member_id),b.role_key).run();await audit(db,me.member_id,'تعيين دور','member',b.member_id,b.role_key);return json({success:true,message:'تم تعيين الدور.'});
    }
    if(request.method==='POST'&&action==='remove-role'){
      const b=await request.json();await db.prepare('DELETE FROM medlife_admin_user_roles WHERE member_id=? AND role_key=?').bind(Number(b.member_id),b.role_key).run();await audit(db,me.member_id,'إزالة دور','member',b.member_id,b.role_key);return json({success:true,message:'تمت إزالة الدور.'});
    }
    if(request.method==='POST'&&action==='mark-notification') {const b=await request.json();await db.prepare('UPDATE medlife_admin_notifications SET is_read=1 WHERE id=? AND member_id=?').bind(Number(b.id),me.member_id).run();return json({success:true});}
    return json({success:false,error:'Action not found.'},404);
  }catch(e){console.error(e);return json({success:false,error:'تعذر تنفيذ العملية.',detail:String(e?.message||e)},500)}
}
