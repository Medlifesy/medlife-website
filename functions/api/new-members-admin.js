/* MEDLIFE NEW APPLICANTS ADMIN API
   GET /api/new-members-admin
   PATCH /api/new-members-admin
   DELETE /api/new-members-admin?id=...
*/
const ROLES=['volunteer','supervisor','general_supervisor','assistant_supervisor'];
const CELLS=['plasma_cell','neuron_cell','astrocyte_cell','leukocyte_cell','heart_cell','red_blood_cell','blog','design','video_editing','visual_media','instagram','telegram','administration','voice_over','coordination','university_media','field'];
const FIELDS=['damascus','aleppo','tartous','latakia','homs','hasakah'];
export async function onRequest({request,env}){
 if(request.method==='OPTIONS')return out({success:true});
 if(!env.MEMBERS_DB)return out({success:false,error:"Database binding 'MEMBERS_DB' is not configured."},500);
 if(!env.ADMIN_KEY)return out({success:false,error:"Admin secret 'ADMIN_KEY' is not configured."},500);
 if(!auth(request,env.ADMIN_KEY))return out({success:false,error:'غير مصرح بالدخول.'},401);
 try{
  await env.MEMBERS_DB.prepare(`CREATE TABLE IF NOT EXISTS new_member_applications (id INTEGER PRIMARY KEY AUTOINCREMENT,full_name TEXT NOT NULL,mother_name TEXT NOT NULL,national_id TEXT NOT NULL UNIQUE,gender TEXT NOT NULL,email TEXT,phone TEXT NOT NULL,governorate TEXT NOT NULL,address TEXT,academic_status TEXT NOT NULL,university TEXT,faculty TEXT,study_year TEXT,graduation_year TEXT,profession TEXT,workplace TEXT,resident_specialty TEXT,residency_year TEXT,residency_hospital TEXT,doctor_graduation_year TEXT,doctor_specialty TEXT,doctor_workplace TEXT,specialty TEXT,specialist_graduation_year TEXT,specialist_workplace TEXT,interest TEXT NOT NULL,motivation TEXT,status TEXT NOT NULL DEFAULT 'pending',rejection_reason TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  if(request.method==='GET'){const r=await env.MEMBERS_DB.prepare('SELECT * FROM new_member_applications ORDER BY CASE status WHEN \'pending\' THEN 0 WHEN \'accepted\' THEN 1 ELSE 2 END,datetime(created_at) DESC LIMIT 300').all();return out({success:true,applications:r.results||[]})}
  if(request.method==='DELETE'){const id=Number(new URL(request.url).searchParams.get('id'));if(!id)return out({success:false,error:'معرّف غير صالح.'},400);await env.MEMBERS_DB.prepare('DELETE FROM new_member_applications WHERE id=?').bind(id).run();return out({success:true})}
  if(request.method==='PATCH'){
   const b=await request.json();const id=Number(b.id),status=String(b.status||'').trim();if(!Number.isInteger(id)||!['accepted','rejected'].includes(status))return out({success:false,error:'البيانات غير صالحة.'},400);
   const a=await env.MEMBERS_DB.prepare('SELECT * FROM new_member_applications WHERE id=?').bind(id).first();if(!a)return out({success:false,error:'الطلب غير موجود.'},404);
   if(status==='rejected'){await env.MEMBERS_DB.prepare('UPDATE new_member_applications SET status=\'rejected\',rejection_reason=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(String(b.rejection_reason||'').slice(0,1000),id).run();return out({success:true,status})}
   const role=String(b.medlife_role||'').trim(),cell=String(b.cell||'').trim(),field=String(b.field_location||'').trim(),join=String(b.join_date||new Date().toISOString().slice(0,10)).trim(),cert=b.volunteer_certificate==='yes'?'yes':'no';
   if(!ROLES.includes(role)||!CELLS.includes(cell))return out({success:false,error:'يجب تحديد الصفة والخلية عند قبول العضو.'},400);if(cell==='field'&&!FIELDS.includes(field))return out({success:false,error:'يجب تحديد المحافظة الميدانية.'},400);
   const existing=await env.MEMBERS_DB.prepare('SELECT id FROM members WHERE national_id=? LIMIT 1').bind(a.national_id).first();if(existing)return out({success:false,error:'يوجد عضو بهذا الرقم الوطني مسبقاً.'},409);
   const r=await env.MEMBERS_DB.prepare(`INSERT INTO members(full_name,mother_name,national_id,email,phone,gender,education_level,study_year,university,resident_specialty,residency_year,residency_hospital,address,governorate,medlife_role,cell,field_location,join_date,volunteer_certificate,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(a.full_name,a.mother_name,a.national_id,a.email,a.phone,a.gender,a.academic_status,a.study_year,a.university,a.resident_specialty,a.residency_year,a.residency_hospital,a.address,a.governorate,role,cell,cell==='field'?field:null,join,cert).run();
   await env.MEMBERS_DB.prepare('UPDATE new_member_applications SET status=\'accepted\',updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(id).run();return out({success:true,status:'accepted',member_id:r.meta?.last_row_id??null});
  }
  return out({success:false,error:'Method not allowed.'},405);
 }catch(e){console.error(e);return out({success:false,error:'تعذر تنفيذ العملية حالياً.'},500)}
}
function auth(req,key){const h=req.headers.get('Authorization')||'';return h===`Bearer ${key}`}
function out(d,s=200){return new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, PATCH, DELETE, OPTIONS'}})}
