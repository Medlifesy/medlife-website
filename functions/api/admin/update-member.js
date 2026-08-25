import { json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

const CELLS = new Set([
  'plasma_cell','neuron_cell','astrocyte_cell','leukocyte_cell','heart_cell','red_blood_cell',
  'blog','design','video_editing','visual_media','instagram','telegram','administration',
  'voice_over','coordination','university_media','field','consultations'
]);
const ROLES = new Set(['volunteer','supervisor','general_supervisor','assistant_supervisor']);
const STATUSES = new Set(['pending','active','suspended','inactive','approved']);

const clean = (v, max=500) => String(v ?? '').trim().slice(0, max);

export async function onRequest({ request, env }) {
  if (request.method !== 'PUT') return json({success:false,error:'Method not allowed.'},405);
  if (!env.MEMBERS_DB) return json({success:false,error:'Database binding MEMBERS_DB is not configured.'},500);
  try {
    const admin = await authenticateAdmin(request, env.MEMBERS_DB);
    if (!admin) return json({success:false,error:'غير مصرح.'},401);
    const body = await request.json().catch(()=>({}));
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) return json({success:false,error:'معرّف العضو غير صالح.'},400);
    const current = await env.MEMBERS_DB.prepare('SELECT * FROM members WHERE id=? LIMIT 1').bind(id).first();
    if (!current) return json({success:false,error:'العضو غير موجود.'},404);

    const fullName = clean(body.full_name ?? current.full_name,200);
    const email = clean(body.email ?? current.email,200);
    const phone = clean(body.phone ?? current.phone,80);
    const governorate = clean(body.governorate ?? current.governorate,100);
    const role = clean(body.medlife_role ?? current.medlife_role,50);
    const cell = clean(body.cell ?? current.cell,50);
    const specialty = clean(body.consultation_specialty ?? current.consultation_specialty,200);
    const employment = clean(body.employment_status ?? current.employment_status,100);
    const profession = clean(body.profession ?? current.profession,150);
    const workplace = clean(body.workplace ?? current.workplace,250);
    const status = clean(body.status ?? current.status,30);

    if (!fullName) return json({success:false,error:'اسم العضو مطلوب.'},400);
    if (!CELLS.has(cell)) return json({success:false,error:'الفريق/الخلية المحددة غير صالحة.'},400);
    if (!ROLES.has(role)) return json({success:false,error:'الدور المحدد غير صالح.'},400);
    if (!STATUSES.has(status)) return json({success:false,error:'الحالة المحددة غير صالحة.'},400);

    await env.MEMBERS_DB.prepare(`UPDATE members SET full_name=?,email=?,phone=?,governorate=?,medlife_role=?,cell=?,consultation_specialty=?,employment_status=?,profession=?,workplace=?,status=?,account_status=CASE WHEN ? IN ('active','approved') THEN 'active' ELSE COALESCE(account_status,'active') END,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(fullName,email,phone,governorate,role,cell,specialty,employment,profession,workplace,status,status,id).run();

    return json({success:true,message:'تم تحديث بيانات العضو بنجاح.',member_id:id});
  } catch (error) {
    console.error('Admin update member error:', error);
    return json({success:false,error:'تعذر تحديث بيانات العضو حالياً.'},500);
  }
}
