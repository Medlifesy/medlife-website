import { json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

const clean = (v,max=300)=>String(v??'').trim().slice(0,max);
const SLUG=/^[a-z0-9_\-]+$/;
const MANAGEMENT_ROLES=new Set(['general_team_supervisor','advisor','medical_director','general_cell_supervisor','cell_supervisor','assistant_supervisor']);
const ADMIN_CREATOR_ROLES=new Set(['general_team_supervisor','advisor','medical_director']);

export async function onRequest({request,env}){
  if(!env.MEMBERS_DB) return json({success:false,error:'Database binding MEMBERS_DB is not configured.'},500);
  try{
    const admin=await authenticateAdmin(request,env.MEMBERS_DB);
    if(!admin) return json({success:false,error:'غير مصرح.'},401);
    await ensureOrgTables(env.MEMBERS_DB);
    if(request.method==='GET') return listOrganization(env.MEMBERS_DB);
    if(request.method==='POST'){
      const body=await request.json().catch(()=>({}));
      const action=clean(body.action,40);
      const actor=normalizeAdminRole(admin);
      if(action==='create_section') return createSection(env.MEMBERS_DB,body,actor);
      if(action==='create_cell') return createCell(env.MEMBERS_DB,body,actor);
      if(action==='assign_role') return assignRole(env.MEMBERS_DB,body,actor);
      if(action==='remove_role') return removeRole(env.MEMBERS_DB,body,actor);
      return json({success:false,error:'الإجراء غير صالح.'},400);
    }
    return json({success:false,error:'Method not allowed.'},405);
  }catch(e){console.error('Organization API error:',e);return json({success:false,error:'تعذر تنفيذ عملية الهيكل التنظيمي حالياً.'},500)}
}

async function ensureOrgTables(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_org_sections (id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL UNIQUE,name_ar TEXT NOT NULL,name_en TEXT,section_type TEXT NOT NULL DEFAULT 'department',is_system INTEGER NOT NULL DEFAULT 0,is_active INTEGER NOT NULL DEFAULT 1,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_org_cells (id INTEGER PRIMARY KEY AUTOINCREMENT,section_id INTEGER NOT NULL,code TEXT NOT NULL UNIQUE,name_ar TEXT NOT NULL,name_en TEXT,is_system INTEGER NOT NULL DEFAULT 0,is_active INTEGER NOT NULL DEFAULT 1,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(section_id) REFERENCES medlife_org_sections(id) ON DELETE CASCADE)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS medlife_org_assignments (id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL,role_key TEXT NOT NULL,section_id INTEGER,cell_id INTEGER,notes TEXT,is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,FOREIGN KEY(section_id) REFERENCES medlife_org_sections(id) ON DELETE SET NULL,FOREIGN KEY(cell_id) REFERENCES medlife_org_cells(id) ON DELETE SET NULL)`).run();
}

function normalizeAdminRole(admin){
  const raw=String(admin.medlife_role||'').toLowerCase();
  if(raw.includes('مستشار')||raw.includes('advisor')) return 'advisor';
  if(raw.includes('المدير الطبي')||raw.includes('medical director')) return 'medical_director';
  if(raw.includes('مشرف عام')||raw.includes('general supervisor')||raw.includes('general_supervisor')) return 'general_team_supervisor';
  if(raw.includes('مشرف خلية')) return 'cell_supervisor';
  if(raw.includes('مساعد مشرف')) return 'assistant_supervisor';
  return raw;
}
function canCreate(actor){return ADMIN_CREATOR_ROLES.has(actor)}

async function listOrganization(db){
  const sections=(await db.prepare(`SELECT id,code,name_ar,name_en,section_type,is_system,is_active,sort_order FROM medlife_org_sections WHERE is_active=1 ORDER BY sort_order,id`).all()).results||[];
  const cells=(await db.prepare(`SELECT c.id,c.section_id,c.code,c.name_ar,c.name_en,c.is_system,c.is_active,c.sort_order FROM medlife_org_cells c JOIN medlife_org_sections s ON s.id=c.section_id WHERE c.is_active=1 AND s.is_active=1 ORDER BY c.section_id,c.sort_order,c.id`).all()).results||[];
  const assignments=(await db.prepare(`SELECT o.id,o.member_id,o.role_key,o.section_id,o.cell_id,o.notes,m.full_name,m.member_code,m.email,sec.name_ar AS section_name,cell.name_ar AS cell_name FROM medlife_org_assignments o JOIN members m ON m.id=o.member_id LEFT JOIN medlife_org_sections sec ON sec.id=o.section_id LEFT JOIN medlife_org_cells cell ON cell.id=o.cell_id WHERE o.is_active=1 AND m.status IN ('active','approved') ORDER BY o.role_key,m.full_name`).all()).results||[];
  return json({success:true,sections,cells,assignments});
}

async function createSection(db,b,actor){
  if(!canCreate(actor)) return json({success:false,error:'إضافة قسم جديد مخصصة للمشرف العام للفريق والمستشار والمدير الطبي.'},403);
  const code=clean(b.code,80).toLowerCase(),nameAr=clean(b.name_ar,200),nameEn=clean(b.name_en,200);const type=['department','field','administration'].includes(b.section_type)?b.section_type:'department';
  if(!SLUG.test(code)||!nameAr)return json({success:false,error:'الكود والاسم العربي مطلوبان.'},400);
  try{const r=await db.prepare(`INSERT INTO medlife_org_sections(code,name_ar,name_en,section_type,is_system,is_active,sort_order) VALUES(?,?,?,?,0,1,?)`).bind(code,nameAr,nameEn,type,Number(b.sort_order)||999).run();return json({success:true,id:r.meta?.last_row_id??null,message:'تمت إضافة القسم بنجاح.'},201)}catch(e){return json({success:false,error:'يوجد قسم آخر بنفس الكود.'},409)}
}

async function createCell(db,b,actor){
  if(!canCreate(actor)) return json({success:false,error:'إضافة خلية جديدة مخصصة للمشرف العام للفريق والمستشار والمدير الطبي.'},403);
  const sectionId=Number(b.section_id),code=clean(b.code,80).toLowerCase(),nameAr=clean(b.name_ar,200),nameEn=clean(b.name_en,200);
  if(!Number.isInteger(sectionId)||sectionId<1||!SLUG.test(code)||!nameAr)return json({success:false,error:'القسم والكود والاسم العربي مطلوبة.'},400);
  const sec=await db.prepare('SELECT id FROM medlife_org_sections WHERE id=? AND is_active=1').bind(sectionId).first();if(!sec)return json({success:false,error:'القسم غير موجود.'},404);
  try{const r=await db.prepare(`INSERT INTO medlife_org_cells(section_id,code,name_ar,name_en,is_system,is_active,sort_order) VALUES(?,?,?,?,0,1,?)`).bind(sectionId,code,nameAr,nameEn,Number(b.sort_order)||999).run();return json({success:true,id:r.meta?.last_row_id??null,message:'تمت إضافة الخلية بنجاح.'},201)}catch(e){return json({success:false,error:'يوجد عنصر آخر بنفس الكود.'},409)}
}

async function assignRole(db,b,actor){
  const memberId=Number(b.member_id),role=clean(b.role_key,60),sectionId=b.section_id?Number(b.section_id):null,cellId=b.cell_id?Number(b.cell_id):null,notes=clean(b.notes,500);
  if(!Number.isInteger(memberId)||memberId<1||!MANAGEMENT_ROLES.has(role))return json({success:false,error:'بيانات التكليف الإداري غير صالحة.'},400);
  if(role==='general_cell_supervisor'&&!cellId)return json({success:false,error:'المشرف العام للخلايا يجب تحديد الخلايا التابعة له.'},400);
  if(['cell_supervisor','assistant_supervisor'].includes(role)&&!cellId)return json({success:false,error:'يجب تحديد الخلية لهذا الدور.'},400);
  if(['general_team_supervisor','advisor','medical_director'].includes(role)&&(cellId||sectionId))return json({success:false,error:'هذا الدور إداري عام ولا يحتاج اختيار خلية.'},400);
  if(sectionId){const s=await db.prepare('SELECT id FROM medlife_org_sections WHERE id=? AND is_active=1').bind(sectionId).first();if(!s)return json({success:false,error:'القسم غير موجود.'},404)}
  if(cellId){const c=await db.prepare('SELECT id,section_id FROM medlife_org_cells WHERE id=? AND is_active=1').bind(cellId).first();if(!c)return json({success:false,error:'الخلية غير موجودة.'},404)}
  await db.prepare(`UPDATE medlife_org_assignments SET is_active=0,updated_at=CURRENT_TIMESTAMP WHERE member_id=? AND role_key=? AND COALESCE(section_id,0)=COALESCE(?,0) AND COALESCE(cell_id,0)=COALESCE(?,0)`).bind(memberId,role,sectionId,cellId).run();
  const r=await db.prepare(`INSERT INTO medlife_org_assignments(member_id,role_key,section_id,cell_id,notes,is_active) VALUES(?,?,?,?,?,1)`).bind(memberId,role,sectionId,cellId,notes).run();
  return json({success:true,id:r.meta?.last_row_id??null,message:'تم حفظ التكليف الإداري.'});
}

async function removeRole(db,b){const id=Number(b.id);if(!Number.isInteger(id)||id<1)return json({success:false,error:'التكليف غير صالح.'},400);await db.prepare('UPDATE medlife_org_assignments SET is_active=0,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(id).run();return json({success:true,message:'تم إلغاء التكليف الإداري.'})}
