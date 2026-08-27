import { onRequest as primarySession } from './article-admin-session.js';
import { loginSubaccount } from './admin-subaccounts.js';

export async function onRequest(context){
  const {request,env}=context;
  if(!env.DB)return primarySession(context);
  const action=new URL(request.url).searchParams.get('action')||'me';

  if(action==='login'){
    const subRequest=request.clone();
    const primary=await primarySession(context);
    if(primary.status===200)return primary;
    try{
      const subResponse=await loginSubaccount(subRequest,env.DB);
      if(subResponse.status!==401)return subResponse;
    }catch(error){console.error('subaccount login fallback:',error);}
    return primary;
  }

  // Preserve the existing primary-admin authentication path unchanged.
  const primary=await primarySession(context);
  if(primary.status===200)return primary;
  const subUrl=new URL(request.url);subUrl.pathname='/api/admin-subaccounts';subUrl.searchParams.set('action',action);
  const subRequest=new Request(subUrl,{method:request.method,headers:request.headers});
  const {onRequest}=await import('./admin-subaccounts.js');
  return onRequest({request:subRequest,env});
}
