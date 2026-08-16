/* MedLife Support Fund API
   Public read access + admin-only writes.
   Support applications are private until reviewed and approved.
   Uses the existing MEMBERS_DB D1 binding.
*/
import { json } from './_auth.js';

async function ensure(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS support_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'case',
    title TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    target_amount INTEGER NOT NULL DEFAULT 0,
    funded_amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    urgent INTEGER NOT NULL DEFAULT 0,
    governorate TEXT,
    public_notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS support_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    donor_name TEXT,
    donor_public INTEGER NOT NULL DEFAULT 0,
    reference TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS support_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    public INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS support_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_code TEXT NOT NULL UNIQUE,
    applicant_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    governorate TEXT NOT NULL,
    area TEXT,
    request_type TEXT NOT NULL,
    beneficiary_relation TEXT,
    beneficiary_age TEXT,
    beneficiary_gender TEXT,
    need_summary TEXT NOT NULL,
    medical_details TEXT,
    requested_amount INTEGER NOT NULL DEFAULT 0,
    family_income TEXT,
    existing_support TEXT,
    document_urls TEXT,
    preferred_contact TEXT,
    consent INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function admin(request,env){return !!env.ADMIN_API_KEY && request.headers.get('X-Admin-Key')===env.ADMIN_API_KEY}
function cleanCase(x,docs=[]){return {...x,urgent:Boolean(x.urgent),target_amount:Number(x.target_amount||0),funded_amount:Number(x.funded_amount||0),documents:docs.filter(d=>d.public!==0)}}
function text(v,max=5000){return String(v??'').trim().slice(0,max)}
function validPhone(v){return /^[+0-9()\-\s]{7,25}$/.test(String(v||'').trim())}

export async function onRequest({request,env}){
  if(!env.MEMBERS_DB)return json({success:false,error:'Database binding is not configured.'},500);
  try{
    await ensure(env.MEMBERS_DB);

    if(request.method==='GET'){
      const rows=await env.MEMBERS_DB.prepare(`SELECT * FROM support_cases WHERE status IN ('active','funded') ORDER BY CASE WHEN status='active' THEN 0 ELSE 1 END, urgent DESC, id DESC`).all();
      const cases=[];for(const x of (rows.results||[])){const d=await env.MEMBERS_DB.prepare(`SELECT label,url,public FROM support_documents WHERE case_id=? AND public=1 ORDER BY id DESC`).bind(x.id).all();cases.push(cleanCase(x,d.results||[]))}
      const total=await env.MEMBERS_DB.prepare(`SELECT COALESCE(SUM(funded_amount),0) total FROM support_cases`).first();
      return json({success:true,cases,totalFunded:Number(total?.total||0)});
    }

    if(request.method==='POST'){
      const body=await request.json();

      // Public request for help. It is never published automatically.
      if(body.action==='apply'){
        if(body.website) return json({success:true,message:'تم استلام الطلب.'});
        const applicant=text(body.applicant_name,160), phone=text(body.phone,40), governorate=text(body.governorate,80);
        const requestType=text(body.request_type,80), need=text(body.need_summary,2000);
        if(!applicant||!phone||!governorate||!requestType||!need||!body.consent) return json({success:false,error:'يرجى تعبئة الحقول المطلوبة والموافقة على معالجة الطلب.'},400);
        if(!validPhone(phone)) return json({success:false,error:'يرجى إدخال رقم هاتف صحيح.'},400);
        const amount=Math.max(0,Math.min(100000000000,Number(body.requested_amount||0)));
        if(!Number.isFinite(amount)) return json({success:false,error:'قيمة المبلغ غير صحيحة.'},400);
        const code=`MSA-${Date.now().toString(36).toUpperCase()}`;
        const docs=Array.isArray(body.document_urls)?body.document_urls.map(v=>text(v,600)).filter(Boolean).slice(0,10):[];
        await env.MEMBERS_DB.prepare(`INSERT INTO support_applications(application_code,applicant_name,phone,email,governorate,area,request_type,beneficiary_relation,beneficiary_age,beneficiary_gender,need_summary,medical_details,requested_amount,family_income,existing_support,document_urls,preferred_contact,consent) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
          code,applicant,phone,text(body.email,160),governorate,text(body.area,120),requestType,text(body.beneficiary_relation,100),text(body.beneficiary_age,30),text(body.beneficiary_gender,30),need,text(body.medical_details,3000),amount,text(body.family_income,500),text(body.existing_support,1000),JSON.stringify(docs),text(body.preferred_contact,80),1
        ).run();
        return json({success:true,application_code:code,message:'تم استلام طلبك. سيقوم فريق ميدلايف بمراجعته والتواصل معك.'},201);
      }

      if(!admin(request,env))return json({success:false,error:'غير مصرح.'},401);
      const action=body.action;
      if(action==='create'){
        const code=text(body.code,80)||`ML-${Date.now().toString(36).toUpperCase()}`;
        const r=await env.MEMBERS_DB.prepare(`INSERT INTO support_cases(code,type,title,summary,description,target_amount,status,urgent,governorate,public_notes) VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(code,text(body.type,30)||'case',text(body.title,180),text(body.summary,600),text(body.description,4000),Math.max(0,Number(body.target_amount||0)),text(body.status,30)||'active',body.urgent?1:0,text(body.governorate,80),text(body.public_notes,1500)).run();
        return json({success:true,id:r.meta?.last_row_id,code});
      }
      if(action==='applications'){
        const status=body.status?text(body.status,30):null;
        const q=status?await env.MEMBERS_DB.prepare(`SELECT * FROM support_applications WHERE status=? ORDER BY id DESC`).bind(status).all():await env.MEMBERS_DB.prepare(`SELECT * FROM support_applications ORDER BY id DESC`).all();
        return json({success:true,applications:q.results||[]});
      }
      if(action==='application_update'){
        const id=Number(body.id);if(!id)return json({success:false,error:'معرف الطلب غير صحيح.'},400);
        const allowed=['pending','under_review','verified','approved','rejected','closed'];
        const status=allowed.includes(body.status)?body.status:'pending';
        await env.MEMBERS_DB.prepare(`UPDATE support_applications SET status=?,admin_notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(status,text(body.admin_notes,3000),id).run();
        return json({success:true,status});
      }
      if(action==='update'){
        const id=Number(body.id);const current=await env.MEMBERS_DB.prepare('SELECT * FROM support_cases WHERE id=?').bind(id).first();if(!current)return json({success:false,error:'الحالة غير موجودة.'},404);
        const target=Math.max(0,Number(body.target_amount??current.target_amount));const funded=Math.max(0,Number(body.funded_amount??current.funded_amount));const status=funded>=target&&target>0?'funded':(body.status||current.status);
        await env.MEMBERS_DB.prepare(`UPDATE support_cases SET title=?,summary=?,description=?,target_amount=?,funded_amount=?,status=?,urgent=?,governorate=?,public_notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(body.title??current.title,body.summary??current.summary,body.description??current.description,target,funded,status,body.urgent==null?current.urgent:(body.urgent?1:0),body.governorate??current.governorate,body.public_notes??current.public_notes,id).run();
        return json({success:true,status});
      }
      if(action==='contribution'){
        const id=Number(body.case_id),amount=Math.max(0,Number(body.amount||0));if(!id||!amount)return json({success:false,error:'بيانات المساهمة غير مكتملة.'},400);
        await env.MEMBERS_DB.prepare(`INSERT INTO support_contributions(case_id,amount,donor_name,donor_public,reference,status,note) VALUES(?,?,?,?,?,?,?)`).bind(id,amount,body.donor_public?String(body.donor_name||'متبرع'):null,body.donor_public?1:0,text(body.reference,200),text(body.status,30)||'confirmed',text(body.note,1000)).run();
        await env.MEMBERS_DB.prepare(`UPDATE support_cases SET funded_amount=MIN(target_amount,funded_amount+?),status=CASE WHEN target_amount>0 AND funded_amount+?>=target_amount THEN 'funded' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(amount,amount,id).run();
        return json({success:true});
      }
      if(action==='document'){
        const id=Number(body.case_id);if(!id||!body.label||!body.url)return json({success:false,error:'بيانات الوثيقة غير مكتملة.'},400);
        await env.MEMBERS_DB.prepare(`INSERT INTO support_documents(case_id,label,url,public) VALUES(?,?,?,?)`).bind(id,text(body.label,120),text(body.url,1000),body.public===false?0:1).run();return json({success:true});
      }
      if(action==='close'){const id=Number(body.id);await env.MEMBERS_DB.prepare(`UPDATE support_cases SET status='closed',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();return json({success:true})}
      return json({success:false,error:'Unknown action.'},400);
    }
    return json({success:false,error:'Method not allowed.'},405);
  }catch(e){console.error(e);return json({success:false,error:'تعذر تنفيذ العملية حالياً.'},500)}
}
