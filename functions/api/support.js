/* MedLife Support Fund API
   Public read access + admin-only writes.
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
}
function admin(request,env){return !!env.ADMIN_API_KEY && request.headers.get('X-Admin-Key')===env.ADMIN_API_KEY}
function cleanCase(x,docs=[]){return {...x,urgent:Boolean(x.urgent),target_amount:Number(x.target_amount||0),funded_amount:Number(x.funded_amount||0),documents:docs.filter(d=>d.public!==0)}}
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
    if(!admin(request,env))return json({success:false,error:'غير مصرح.'},401);
    if(request.method!=='POST')return json({success:false,error:'Method not allowed.'},405);
    const body=await request.json();const action=body.action;
    if(action==='create'){
      const code=String(body.code||`ML-${Date.now().toString(36).toUpperCase()}`).trim();
      const r=await env.MEMBERS_DB.prepare(`INSERT INTO support_cases(code,type,title,summary,description,target_amount,status,urgent,governorate,public_notes) VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(code,body.type||'case',body.title,body.summary||'',body.description||'',Math.max(0,Number(body.target_amount||0)),body.status||'active',body.urgent?1:0,body.governorate||'',body.public_notes||'').run();
      return json({success:true,id:r.meta?.last_row_id,code});
    }
    if(action==='update'){
      const id=Number(body.id);const current=await env.MEMBERS_DB.prepare('SELECT * FROM support_cases WHERE id=?').bind(id).first();if(!current)return json({success:false,error:'الحالة غير موجودة.'},404);
      const target=Math.max(0,Number(body.target_amount??current.target_amount));const funded=Math.max(0,Number(body.funded_amount??current.funded_amount));const status=funded>=target&&target>0?'funded':(body.status||current.status);
      await env.MEMBERS_DB.prepare(`UPDATE support_cases SET title=?,summary=?,description=?,target_amount=?,funded_amount=?,status=?,urgent=?,governorate=?,public_notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(body.title??current.title,body.summary??current.summary,body.description??current.description,target,funded,status,body.urgent==null?current.urgent:(body.urgent?1:0),body.governorate??current.governorate,body.public_notes??current.public_notes,id).run();
      return json({success:true,status});
    }
    if(action==='contribution'){
      const id=Number(body.case_id),amount=Math.max(0,Number(body.amount||0));if(!id||!amount)return json({success:false,error:'بيانات المساهمة غير مكتملة.'},400);
      await env.MEMBERS_DB.prepare(`INSERT INTO support_contributions(case_id,amount,donor_name,donor_public,reference,status,note) VALUES(?,?,?,?,?,?,?)`).bind(id,amount,body.donor_public?String(body.donor_name||'متبرع'):null,body.donor_public?1:0,body.reference||'',body.status||'confirmed',body.note||'').run();
      await env.MEMBERS_DB.prepare(`UPDATE support_cases SET funded_amount=MIN(target_amount,funded_amount+?),status=CASE WHEN target_amount>0 AND funded_amount+?>=target_amount THEN 'funded' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(amount,amount,id).run();
      return json({success:true});
    }
    if(action==='document'){
      const id=Number(body.case_id);if(!id||!body.label||!body.url)return json({success:false,error:'بيانات الوثيقة غير مكتملة.'},400);
      await env.MEMBERS_DB.prepare(`INSERT INTO support_documents(case_id,label,url,public) VALUES(?,?,?,?)`).bind(id,String(body.label),String(body.url),body.public===false?0:1).run();return json({success:true});
    }
    if(action==='close'){const id=Number(body.id);await env.MEMBERS_DB.prepare(`UPDATE support_cases SET status='closed',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();return json({success:true})}
    return json({success:false,error:'Unknown action.'},400);
  }catch(e){console.error(e);return json({success:false,error:'تعذر تنفيذ العملية حالياً.'},500)}
}
