import { json } from '../_auth.js';
export async function onRequest({request,env}){
 if(request.method!=='POST')return json({success:false,error:'Method not allowed.'},405);
 if(!env.MEMBERS_DB)return json({success:false,error:'Database binding is not configured.'},500);
 if(!env.ADMIN_API_KEY||request.headers.get('X-Admin-Key')!==env.ADMIN_API_KEY)return json({success:false,error:'غير مصرح.'},401);
 try{const b=await request.json(),type=String(b.type||''),id=Number(b.id),reason=String(b.reason||'').trim().slice(0,1000);if(!['new','current'].includes(type)||!Number.isInteger(id)||id<1)return json({success:false,error:'بيانات الرفض غير صالحة.'},400);if(type==='new')await env.MEMBERS_DB.prepare("UPDATE new_member_applications SET status='rejected',rejection_reason=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(reason,id).run();else await env.MEMBERS_DB.prepare("UPDATE members SET status='rejected',account_status='rejected',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();return json({success:true,message:'تم رفض الطلب.'});}catch(e){console.error(e);return json({success:false,error:'تعذر رفض الطلب حالياً.'},500)}
}
