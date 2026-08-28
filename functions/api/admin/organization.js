import { json } from '../_auth.js';
import { authenticateAdmin } from '../_admin-auth.js';

const TEAM_API_URL = 'https://medlife-team-api.broad-frog-3978.workers.dev';
const CREATOR_ROLES = new Set(['general_team_supervisor','advisor','medical_director']);
const ROLE_MAP = {
  member: 'member',
  general_team_supervisor: 'general_team_supervisor',
  advisor: 'consultant',
  medical_director: 'medical_director',
  general_cell_supervisor: 'cell_general_supervisor',
  cell_supervisor: 'cell_supervisor',
  assistant_supervisor: 'assistant_supervisor',
};
const clean=(v,max=300)=>String(v??'').trim().slice(0,max);

function normalizeRole(admin){
  const org=clean(admin?.org_role,80);
  if(CREATOR_ROLES.has(org)) return org;
  const raw=clean(admin?.medlife_role,200).toLowerCase();
  if(raw.includes('مستشار')||raw.includes('advisor')) return 'advisor';
  if(raw.includes('مدير طبي')||raw.includes('medical director')) return 'medical_director';
  if(raw.includes('مشرف عام')||raw.includes('general supervisor')) return 'general_team_supervisor';
  if(raw.includes('مشرف خلية')||raw.includes('cell supervisor')) return 'cell_supervisor';
  if(raw.includes('مساعد مشرف')||raw.includes('assistant supervisor')) return 'assistant_supervisor';
  return org||raw;
}
function canManageStructure(role){return CREATOR_ROLES.has(role)}
function teamApiKey(env){return clean(env.TEAM_API_ADMIN_KEY||env.ADMIN_API_KEY||'');}

async function teamApi(env,path,options={}){
  const key=teamApiKey(env);
  if(!key) throw new Error('Team D1 API key is not configured in Pages environment.');
  const headers=new Headers(options.headers||{});
  headers.set('Accept','application/json');
  headers.set('X-Admin-Key',key);
  if(options.body) headers.set('Content-Type','application/json');
  const response=await fetch(`${clean(env.TEAM_API_URL||TEAM_API_URL,200).replace(/\/$/,'')}${path}`,{...options,headers});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data?.success===false) throw new Error(data?.error||`Team API returned ${response.status}`);
  return data;
}

export async function onRequest({request,env}){
  if(!env.MEMBERS_DB) return json({success:false,error:'Database binding MEMBERS_DB is not configured.'},500);
  try{
    const admin=await authenticateAdmin(request,env.MEMBERS_DB);
    if(!admin) return json({success:false,error:'غير مصرح.'},401);
    const actor=normalizeRole(admin);

    if(request.method==='GET'){
      const data=await teamApi(env,'/internal/admin/organization');
      const units=data.units||[];
      const sections=units.filter(u=>['department','field_branch','admin_scope'].includes(u.unit_type)).map(u=>({id:u.id,code:u.id,name_ar:u.name_ar,name_en:u.name_en,section_type:u.unit_type==='field_branch'?'field':u.unit_type==='admin_scope'?'administration':'department',is_system:String(u.id).startsWith('dept-')||String(u.id).startsWith('field-')||u.id==='admin-general',is_active:Boolean(u.is_active),sort_order:u.sort_order}));
      const cells=units.filter(u=>u.unit_type==='cell').map(u=>({id:u.id,section_id:u.parent_unit_id,code:u.id,name_ar:u.name_ar,name_en:u.name_en,is_system:String(u.id).startsWith('cell-'),is_active:Boolean(u.is_active),sort_order:u.sort_order}));
      const assignments=(data.assignments||[]).map(a=>({id:a.id,member_id:a.member_id,role_key:a.assignment_role==='member'?'member':a.assignment_role==='cell_general_supervisor'?'general_cell_supervisor':a.assignment_role==='cell_supervisor'?'cell_supervisor':'assistant_supervisor',section_id:a.unit_type==='cell'?null:a.unit_id,cell_id:a.unit_type==='cell'?a.unit_id:null,notes:a.notes,full_name:a.full_name,member_code:a.member_code,section_name:a.unit_type==='cell'?'':a.unit_name,cell_name:a.unit_type==='cell'?a.unit_name:''}));
      const roleAssignments=(data.members||[]).length?await Promise.resolve([]):[];
      return json({success:true,actor_role:actor,can_manage_structure:canManageStructure(actor),units,sections,cells,assignments:[...assignments,...roleAssignments],members:data.members||[],roles:data.roles||[],source:'team-d1'});
    }

    if(request.method!=='POST') return json({success:false,error:'Method not allowed.'},405);
    const body=await request.json().catch(()=>({}));
    const action=clean(body.action,60);
    if(['create_section','create_cell'].includes(action)&&!canManageStructure(actor)) return json({success:false,error:'إضافة الأقسام والخلايا مخصصة للمشرف العام للفريق والمستشار والمدير الطبي.'},403);

    if(action==='create_section'){
      const type=body.section_type==='field'?'field_branch':body.section_type==='administration'?'admin_scope':'department';
      const data=await teamApi(env,'/internal/admin/organization/units',{method:'POST',body:JSON.stringify({name_ar:clean(body.name_ar,200),name_en:clean(body.name_en,200),unit_type:type,description:clean(body.description,1000),sort_order:Number(body.sort_order)||999})});
      return json({success:true,message:'تمت إضافة القسم بنجاح.',unit_id:data.unit_id},201);
    }
    if(action==='create_cell'){
      const data=await teamApi(env,'/internal/admin/organization/units',{method:'POST',body:JSON.stringify({name_ar:clean(body.name_ar,200),name_en:clean(body.name_en,200),unit_type:'cell',parent_unit_id:clean(body.section_id,100),sort_order:Number(body.sort_order)||999})});
      return json({success:true,message:'تمت إضافة الخلية بنجاح.',unit_id:data.unit_id},201);
    }
    if(action==='assign_role'){
      const roleKey=clean(body.role_key,60);
      const mapped=ROLE_MAP[roleKey];
      if(!mapped) return json({success:false,error:'الدور غير صالح.'},400);
      const cellIds=Array.isArray(body.cell_ids)?body.cell_ids:[body.cell_id].filter(Boolean);
      if(['member','general_cell_supervisor','cell_supervisor','assistant_supervisor'].includes(roleKey)&&!cellIds.length) return json({success:false,error:'يجب تحديد خلية.'},400);
      const results=[];
      if(roleKey==='member'){
        for(const cellId of cellIds) results.push(await teamApi(env,'/internal/admin/organization/assignments',{method:'POST',body:JSON.stringify({member_id:clean(body.member_id,100),unit_id:clean(cellId,100),assignment_role:'member',is_primary:body.is_primary!==false,notes:clean(body.notes,1000)})}));
      }else if(['general_team_supervisor','advisor','medical_director'].includes(roleKey)){
        results.push(await teamApi(env,'/internal/admin/organization/roles',{method:'POST',body:JSON.stringify({member_id:clean(body.member_id,100),role_code:mapped,notes:clean(body.notes,1000)})}));
      }else{
        for(const cellId of cellIds){
          results.push(await teamApi(env,'/internal/admin/organization/roles',{method:'POST',body:JSON.stringify({member_id:clean(body.member_id,100),role_code:mapped,scope_unit_id:clean(cellId,100),notes:clean(body.notes,1000)})}));
          results.push(await teamApi(env,'/internal/admin/organization/assignments',{method:'POST',body:JSON.stringify({member_id:clean(body.member_id,100),unit_id:clean(cellId,100),assignment_role:mapped==='cell_general_supervisor'?'cell_general_supervisor':mapped==='cell_supervisor'?'cell_supervisor':'supervisor_assistant',is_primary:false,notes:clean(body.notes,1000)})}));
        }
      }
      return json({success:true,message:'تم حفظ التكليف بنجاح.',results});
    }
    if(action==='remove_role'){
      await teamApi(env,'/internal/admin/organization/assignments',{method:'DELETE',body:JSON.stringify({id:clean(body.id,120)})});
      return json({success:true,message:'تم إلغاء التكليف.'});
    }
    return json({success:false,error:'الإجراء غير صالح.'},400);
  }catch(e){
    console.error('Organization D1 proxy error:',e);
    return json({success:false,error:e instanceof Error?e.message:'تعذر تنفيذ عملية الهيكل التنظيمي حالياً.'},502);
  }
}
