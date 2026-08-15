/* MEDLIFE - NEW MEMBER APPLICATION
   POST /api/new-member
   New applicants are intentionally kept separate from the members table.
*/
export async function onRequest(context){
 const {request,env}=context;
 if(request.method==='OPTIONS') return out({success:true});
 if(request.method!=='POST') return out({success:false,error:'Method not allowed.'},405);
 if(!env.MEMBERS_DB) return out({success:false,error:"Database binding 'MEMBERS_DB' is not configured."},500);
 try{
  const b=await request.json();
  const clean=(v,n=5000)=>String(v??'').trim().slice(0,n);
  const full_name=clean(b.full_name,150),mother_name=clean(b.mother_name,150),national_id=clean(b.national_id,40),gender=clean(b.gender,20),email=clean(b.email,200).toLowerCase(),phone=clean(b.phone,40),governorate=clean(b.governorate,100),address=clean(b.address,500),academic_status=clean(b.academic_status,30),interest=clean(b.interest,150),motivation=clean(b.motivation,2000);
  if(!full_name||!mother_name||!national_id||!gender||!phone||!governorate||!academic_status||!interest) return out({success:false,error:'يرجى تعبئة جميع الحقول الأساسية المطلوبة.'},400);
  if(!['male','female'].includes(gender)) return out({success:false,error:'الجنس المحدد غير صالح.'},400);
  if(!['student','graduate','doctor','resident','specialist','other'].includes(academic_status)) return out({success:false,error:'الحالة الأكاديمية غير صالحة.'},400);
  if(email&&!/^\S+@\S+\.\S+$/.test(email)) return out({success:false,error:'البريد الإلكتروني غير صالح.'},400);
  await env.MEMBERS_DB.prepare(`CREATE TABLE IF NOT EXISTS new_member_applications (
   id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, mother_name TEXT NOT NULL, national_id TEXT NOT NULL UNIQUE,
   gender TEXT NOT NULL, email TEXT, phone TEXT NOT NULL, governorate TEXT NOT NULL, address TEXT,
   academic_status TEXT NOT NULL, university TEXT, faculty TEXT, study_year TEXT, graduation_year TEXT,
   profession TEXT, workplace TEXT, resident_specialty TEXT, residency_year TEXT, residency_hospital TEXT,
   doctor_graduation_year TEXT, doctor_specialty TEXT, doctor_workplace TEXT, specialty TEXT,
   specialist_graduation_year TEXT, specialist_workplace TEXT, interest TEXT NOT NULL, motivation TEXT,
   status TEXT NOT NULL DEFAULT 'pending', rejection_reason TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  const exists=await env.MEMBERS_DB.prepare('SELECT id FROM new_member_applications WHERE national_id=? LIMIT 1').bind(national_id).first();
  if(exists) return out({success:false,error:'يوجد طلب انضمام سابق مرتبط بهذا الرقم الوطني.'},409);
  const fields=['university','faculty','study_year','graduation_year','profession','workplace','resident_specialty','residency_year','residency_hospital','doctor_graduation_year','doctor_specialty','doctor_workplace','specialty','specialist_graduation_year','specialist_workplace'];
  const vals=Object.fromEntries(fields.map(k=>[k,clean(b[k],250)]));
  const r=await env.MEMBERS_DB.prepare(`INSERT INTO new_member_applications (full_name,mother_name,national_id,gender,email,phone,governorate,address,academic_status,university,faculty,study_year,graduation_year,profession,workplace,resident_specialty,residency_year,residency_hospital,doctor_graduation_year,doctor_specialty,doctor_workplace,specialty,specialist_graduation_year,specialist_workplace,interest,motivation) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(full_name,mother_name,national_id,gender,email,phone,governorate,address,academic_status,vals.university,vals.faculty,vals.study_year,vals.graduation_year,vals.profession,vals.workplace,vals.resident_specialty,vals.residency_year,vals.residency_hospital,vals.doctor_graduation_year,vals.doctor_specialty,vals.doctor_workplace,vals.specialty,vals.specialist_graduation_year,vals.specialist_workplace,interest,motivation).run();
  return out({success:true,id:r.meta?.last_row_id??null,status:'pending',message:'تم استلام طلب الانضمام بنجاح.'},201);
 }catch(e){console.error(e);return out({success:false,error:'تعذر إرسال طلب الانضمام حالياً.'},500)}
}
function out(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'}})}
