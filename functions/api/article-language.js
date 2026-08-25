import { authenticateArticleAdmin, json } from './article-admin-session.js';

const MODEL='@cf/meta/llama-3.1-8b-instruct';

export async function onRequestPost({request,env}){
  if(!env?.DB)return json({success:false,error:'Database binding DB is not configured.'},500);
  if(!(await authenticateArticleAdmin(request,env.DB)))return json({success:false,error:'غير مصرح.'},401);
  const body=await request.json().catch(()=>({}));
  const mode=['proofread','diacritize'].includes(body?.mode)?body.mode:'proofread';
  const content=String(body?.content||'').trim();
  if(!content)return json({success:false,error:'محتوى المقال فارغ.'},400);
  const prompt=mode==='proofread'?`أنت مدقق لغوي عربي محترف لمحتوى طبي. صحح الأخطاء الإملائية والنحوية وعلامات الترقيم والمسافات فقط. لا تغيّر المعنى الطبي، ولا تضف أو تحذف معلومات، ولا تعدّل الجرعات أو المراجع. حافظ على العناوين والقوائم والترقيم. أعد JSON فقط بالشكل {"content":"النص المصحح","changes":["..."],"warnings":["..."]}. النص:\n${content.slice(0,50000)}`:`أنت محرر عربي متخصص في تشكيل النصوص الطبية. أضف الحركات الضرورية فقط للكلمات التي قد يلتبس نطقها أو معناها، وخصوصًا المصطلحات الطبية والعناوين، دون الإفراط في التشكيل. لا تغيّر الكلمات أو ترتيبها أو معناها ولا تضف معلومات. أعد JSON فقط بالشكل {"content":"النص المشكول","changes":["..."],"warnings":["..."]}. النص:\n${content.slice(0,50000)}`;
  if(env?.AI?.run){
    try{
      const result=await Promise.race([env.AI.run(MODEL,{prompt,max_tokens:7000,temperature:0.05}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('AI timeout')),25000))]);
      const text=String(result?.response||result?.result||result?.text||'').trim();
      const parsed=parseJson(text);
      if(parsed?.content)return json({success:true,mode,provider:'cloudflare-workers-ai',...parsed});
    }catch(error){
      return json({success:true,mode,provider:'safe-fallback',content:basicCleanup(content),changes:['تنظيف المسافات وعلامات الترقيم الشائعة فقط.'],warnings:[`تعذر تشغيل التدقيق الذكي: ${error?.message||'failed'}`]});
    }
  }
  return json({success:true,mode,provider:'safe-fallback',content:basicCleanup(content),changes:['تنظيف المسافات وعلامات الترقيم الشائعة فقط.'],warnings:['Workers AI غير متاح؛ لم يتم إجراء تصحيح لغوي دلالي أو تشكيل آلي.']});
}
function basicCleanup(s){return String(s).replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/[ ]+([،؛؟:.!])/g,'$1').replace(/([،؛؟:.!])([\u0600-\u06FF])/g,'$1 $2').replace(/\n[ \t]+/g,'\n').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();}
function parseJson(text){const s=String(text).replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();try{return JSON.parse(s)}catch{}const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a>=0&&b>a)return JSON.parse(s.slice(a,b+1));throw new Error('نتيجة JSON غير صالحة.');}
