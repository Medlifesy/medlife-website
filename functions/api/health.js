import { ensureAuthTables, json } from './_auth.js';
export async function onRequest({request,env}){
 if(request.method!=='GET')return json({ok:false,error:'Method not allowed.'},405);
 try{
  const db=!!env.MEMBERS_DB; if(db) await ensureAuthTables(env.MEMBERS_DB);
  return json({ok:true,service:'medlife-members',database:db,auth:db,adminConfigured:!!env.ADMIN_API_KEY});
 }catch(e){console.error(e);return json({ok:false,service:'medlife-members',database:false,error:'Database check failed.'},500)}
}
