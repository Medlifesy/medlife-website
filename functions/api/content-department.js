const CONTENT_DS='6fdacc1d-7b08-4a25-8e85-4cbeff40bc25';
const PLASMA_DS='1c22fca6-8017-49d6-a679-b3eb885bbd8c';
const DESIGNERS_DS='53b0c2db-327a-41b2-b83d-2a75d3c10771';
const COORDINATORS_DS='4dc70bee-8d7e-4107-b9cf-8eccd613c9ea';
const NOTION_VERSION='2025-09-03',COOKIE='medlife_content_center_session';
const enc=new TextEncoder();
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, max-age=0'}})}
function hex(bytes){return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('')}
async function sha(v){return hex(await crypto.subtle.digest('SHA-256',enc.encode(v)))}
function cookieValue(request){const raw=request.headers.get('Cookie')||'';for(const part of raw.split(';')){const p=part.trim();if(p.startsWith(COOKIE+'='))return decodeURIComponent(p.slice(COOKIE.length+1))}return null}
function text(p){if(!p)return '';if(p.type==='title')return(p.title||[]).map(x=>x.plain_text||'').join('').trim();if(p.type==='rich_text')return(p.rich_text||[]).map(x=>x.plain_text||'').join('').trim();if(p.type==='select')return p.select?.name||'';if(p.type==='number')return p.number==null?'':String(p.number);return ''}
function date(p){return p?.date?.start||''}
function title(v){return{title:[{text:{content:String(v)}}]}}
function rich(v){return{rich_text:v?[{text:{content:String(v)}}]:[]}}
function select(v){return{select:v?{name:String(v)}:null}}
function number(v){return{number:v===''||v==null?null:Number(v)}}
function dateProp(v){return{date:v?{start:String(v)}:null}}
async function notion(env,path,init={}){if(!env.NOTION_API_TOKEN)throw Error('NOTION_API_TOKEN is not configured');const r=await fetch('https://api.notion.com'+path,{...init,headers:{Authorization:`Bearer ${env.NOTION_API_TOKEN}`,'Notion-Version':NOTION_VERSION,'Content-Type':'application/json',...(init.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d?.message||d?.code||`Notion API returned ${r.status}`);return d}
async function queryAll(env,ds){let out=[],cursor;for(let i=0;i<10;i++){const body={page_size:100,...(cursor?{start_cursor:cursor}:{})};const d=await notion(env,`/v1/data_sources/${ds}/query`,{method:'POST',body:JSON.stringify(body)});out.push(...(d.results||[]));if(!d.has_more||!d.next_cursor)break;cursor=d.next_cursor}return out}
async function identity(request,db,env){const token=cookieValue(request);if(!token)return null;const row=await db.prepare(`SELECT account_page_id FROM content_center_sessions WHERE token_hash=?1 AND datetime(expires_at)>datetime('now') LIMIT 1`).bind(await sha(token)).first();if(!row)return null;const p=await notion(env,`/v1/pages/${row.account_page_id}`);const x=p.properties||{};return{pageId:p.id,username:text(x['اسم المستخدم']),cell:text(x['الخلية']),status:text(x['الحالة']),role:text(x['الدور'])}}
function map(page,plasma){const p=page.properties||{};return{id:page.id,url:page.url||'',title:text(p[plasma?'عنوان المنشور':'عنوان المحتوى']),cell:plasma?'Plasma Cell':text(p['الخلية']),author:text(p[plasma?'الكاتب - اسم':'الكاتب']),priority:text(p['الأولوية'])||'متوسطة',globalStatus:text(p['الحالة']),formatStatus:text(p['حالة التنسيق'])||'جديد',designStatus:text(p['حالة التصميم'])||'جديد',formatPerson:text(p['منسق المحتوى']),designPerson:text(p['المصمم']),formatRating:text(p['تقييم التنسيق']),designRating:text(p['تقييم التصميم']),speedFormat:text(p['تقييم سرعة التنسيق']),speedDesign:text(p['تقييم سرعة التصميم']),interaction:text(p['تقييم التفاعل']),body:text(p['نص المحتوى']),created:plasma?(text(p['تاريخ إنشاء المحتوى'])||page.created_time||''):(date(p['تاريخ إنشاء المحتوى'])||page.created_time||'')}}
async function findStaff(env,ds,name,titleProp){const rows=await queryAll(env,ds);return rows.find(p=>text(p.properties?.[titleProp])===name)||null}
export async function onRequest({request,env}){
 if(!env.DB)return json({success:false,error:'Database binding DB is not configured.'},500);let me=null;try{me=await identity(request,env.DB,env)}catch(e){return json({success:false,error:e.message},502)}
 if(!me||me.status!=='فعّال')return json({success:false,error:'Unauthorized'},401);
 const role=me.role, u=new URL(request.url), action=u.searchParams.get('action')||'me';
 if(action==='me')return json({success:true,authenticated:true,identity:{username:me.username,role,cell:me.cell}});
 const isAdmin=['إدارة المحتوى','مدير النظام'].includes(role), isCoord=role==='منسق', isDesign=role==='مصمم';
 if(!isAdmin&&!isCoord&&!isDesign)return json({success:false,error:'هذا القسم مخصص للمنسقين والمصممين فقط.'},403);
 try{
  if(action==='list'){
   const old=await queryAll(env,CONTENT_DS), plasma=await queryAll(env,PLASMA_DS);
   const items=[...old.map(p=>map(p,false)),...plasma.map(p=>map(p,true))].filter(x=>x.globalStatus!=='مؤرشف');
   const task=u.searchParams.get('task')||'open';
   const filtered=task==='all'?items:(isCoord?items.filter(x=>x.formatStatus!=='مكتمل'):isDesign?items.filter(x=>x.designStatus!=='مكتمل'):items);
   return json({success:true,items:filtered.sort((a,b)=>{const rank={عالية:0,متوسطة:1,منخفضة:2};return (rank[a.priority]??1)-(rank[b.priority]??1)||String(b.created).localeCompare(String(a.created))})});
  }
  if(action==='staff-list'){
   const ds=isCoord?COORDINATORS_DS:DESIGNERS_DS, titleProp=isCoord?'اسم المنسق':'اسم المصمم';
   const rows=await queryAll(env,ds);return json({success:true,staff:rows.map(p=>({id:p.id,name:text(p.properties?.[titleProp]),status:text(p.properties?.['الحالة'])||'فعال'})).filter(x=>x.name&&x.status!=='غير فعال')});
  }
  if(action==='staff-add'&&request.method==='POST'){
   if(!isCoord&&!isDesign&&!isAdmin)return json({success:false,error:'غير مصرح'},403);
   const b=await request.json().catch(()=>({})),name=String(b.name||'').trim();if(!name)return json({success:false,error:'الاسم مطلوب.'},400);
   const ds=isCoord?COORDINATORS_DS:DESIGNERS_DS,titleProp=isCoord?'اسم المنسق':'اسم المصمم';
   const existing=await findStaff(env,ds,name,titleProp);if(existing)return json({success:true,existing:true,staff:{id:existing.id,name}});
   const page=await notion(env,'/v1/pages',{method:'POST',body:JSON.stringify({parent:{data_source_id:ds},properties:{[titleProp]:title(name),'الحالة':select('فعال')}})});
   return json({success:true,staff:{id:page.id,name}},201);
  }
  if(action==='update'&&request.method==='POST'){
   const b=await request.json().catch(()=>({})),id=String(b.page_id||'').trim();if(!id)return json({success:false,error:'المحتوى غير محدد.'},400);
   const page=await notion(env,`/v1/pages/${id}`);const plasma=Boolean(page.properties?.['عنوان المنشور']);
   if(action==='update'){
    const props={};
    if(isCoord){const person=String(b.person||'').trim(),staff=await findStaff(env,COORDINATORS_DS,person,'اسم المنسق');if(!staff)return json({success:false,error:'المنسق غير موجود.'},400);props['منسق المحتوى']={relation:[{id:staff.id}]};props['حالة التنسيق']=select(String(b.status||'مكتمل'));props['تقييم التنسيق']=number(b.rating);props['تقييم سرعة التنسيق']=number(b.speed);props['تقييم التفاعل']=number(b.interaction);props['ملاحظات التنسيق']=rich(String(b.notes||''));props['تاريخ التنسيق']=dateProp(new Date().toISOString());}
    if(isDesign){const person=String(b.person||'').trim(),staff=await findStaff(env,DESIGNERS_DS,person,'اسم المصمم');if(!staff)return json({success:false,error:'المصمم غير موجود.'},400);props['المصمم']={relation:[{id:staff.id}]};props['حالة التصميم']=select(String(b.status||'مكتمل'));props['تقييم التصميم']=number(b.rating);props['تقييم سرعة التصميم']=number(b.speed);props['ملاحظات التصميم']=rich(String(b.notes||''));props['تاريخ التصميم']=dateProp(new Date().toISOString());}
    await notion(env,`/v1/pages/${id}`,{method:'PATCH',body:JSON.stringify({properties:props})});return json({success:true});
   }
  }
  return json({success:false,error:'Unsupported action.'},404);
 }catch(e){console.error('content-department',e);return json({success:false,error:e.message||'تعذر تنفيذ الطلب.'},502)}
}
