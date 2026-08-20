import { authenticateArticleAdmin } from './article-admin-session.js';

const MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({success:false,error:"Database binding 'DB' is not configured."},500);
    const admin=await authenticateArticleAdmin(request,env.DB);
    if(!admin)return json({success:false,error:'يجب تسجيل الدخول إلى لوحة الإدارة أولاً.'},401);
    if(!['admin','editor','reviewer'].includes(String(admin.role).toLowerCase()))return json({success:false,error:'لا تملك صلاحية استخدام محرر المقالات الذكي.'},403);

    const body=await request.json().catch(()=>({}));
    const action=String(body.action||'full_edit').trim().toLowerCase();
    const article=body.article&&typeof body.article==='object'?body.article:{};
    const content=String(article.content||'').trim().slice(0,45000);
    if(!content)return json({success:false,error:'محتوى المقال مطلوب.'},400);

    const task={full_edit:'حرر المقال تحريراً طبياً ومؤسسياً شاملاً: بنية، لغة، مصطلحات، مقدمة، عناوين، فهرس، ملخص، SEO، واقتراحات بصرية.',format:'نسّق المقال وأعد بناء عناوينه وفقراته دون تغيير المعنى.',proofread:'دقق المقال لغوياً وإملائياً ونحوياً واجعل الأسلوب رسمياً طبياً.',medical:'حسّن الصياغة الطبية والمصطلحات والتسلسل العلمي دون اختراع حقائق.',seo:'أنشئ عنواناً تحريرياً وملخصاً ووصف SEO وكلمات مفتاحية.',visual:'اقترح حتى خمس صور أو رسومات طبية وإنفوغرافيك وأماكن إدراجها.'}[action]||'حرر المقال تحريراً طبياً ومؤسسياً شاملاً.';
    const system=`أنت MedLife AI، محرر محتوى طبي. المهمة: ${task}\nاكتب بالعربية الفصحى الطبية الرسمية. حافظ على معنى الكاتب ولا تخترع حقائق أو جرعات أو مراجع. أي ادعاء يحتاج تحققاً ضعه في editor_notes. اقترح صوراً فقط ولا تدّع أنك أنشأتها. أعد JSON فقط بهذا الشكل: {"title":"","excerpt":"","introduction":"","sections":[{"heading":"","content":""}],"conclusion":"","toc":[{"level":2,"title":""}],"seo":{"title":"","description":"","keywords":[]},"image_suggestions":[{"placement":"cover|section","purpose":"","prompt":""}],"editor_notes":[],"polish_score":0}`;
    const user=`العنوان: ${String(article.title||'').slice(0,500)}\nالتصنيف: ${String(article.category||'').slice(0,200)}\nكاتب المحتوى: ${String(article.author_name||'').slice(0,200)}\n\nالمحتوى:\n${content}`;

    let data;
    if(env.OPENAI_API_KEY){
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.OPENAI_API_KEY}`},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5-mini',input:[{role:'developer',content:system},{role:'user',content:user}],max_output_tokens:12000})});
      const result=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error('openai');
      data=parseResult(extractText(result));
    } else if(env.AI){
      const prompt=`${system}\n\n${user}`;
      const result=await env.AI.run(MODEL,{messages:[{role:'system',content:system},{role:'user',content:prompt}],max_tokens:12000,temperature:0.2});
      const text=typeof result==='string'?result:(result?.response||result?.result||'');
      data=parseResult(text);
    } else {
      return json({success:false,error:'لم يتم ربط OpenAI أو Workers AI بهذا الـWorker. أضف AI binding أو OPENAI_API_KEY من إعدادات Cloudflare.'},500);
    }
    if(!data)return json({success:false,error:'تعذر قراءة نتيجة الذكاء الاصطناعي. حاول مرة أخرى.'},502);
    return json({success:true,action,editor:admin.display_name||admin.username,article:sanitize(data)});
  }catch(e){console.error('article-ai error',e);return json({success:false,error:'تعذر تنفيذ التحرير الذكي حالياً.'},500)}
}
function extractText(d){if(typeof d.output_text==='string')return d.output_text;if(Array.isArray(d.output))return d.output.flatMap(x=>Array.isArray(x.content)?x.content:[]).filter(x=>x.type==='output_text'&&typeof x.text==='string').map(x=>x.text).join('\n');return ''}
function parseResult(text){try{return JSON.parse(stripFences(text))}catch{return null}}
function stripFences(v){const s=String(v||'').trim().replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/\s*```$/,'');const a=s.indexOf('{'),b=s.lastIndexOf('}');return a>=0&&b>a?s.slice(a,b+1):s}
function clean(v,max=20000){return String(v??'').trim().slice(0,max)}
function sanitize(x){const sections=Array.isArray(x.sections)?x.sections.slice(0,30).map(s=>({heading:clean(s?.heading,300),content:clean(s?.content,12000)})).filter(s=>s.heading||s.content):[];const toc=Array.isArray(x.toc)?x.toc.slice(0,30).map(t=>({level:Number(t?.level)||2,title:clean(t?.title,300)})).filter(t=>t.title):[];const imgs=Array.isArray(x.image_suggestions)?x.image_suggestions.slice(0,5).map(i=>({placement:clean(i?.placement,40),purpose:clean(i?.purpose,500),prompt:clean(i?.prompt,1500)})).filter(i=>i.prompt):[];const notes=Array.isArray(x.editor_notes)?x.editor_notes.slice(0,30).map(clean).filter(Boolean):[];const seo=x.seo&&typeof x.seo==='object'?{title:clean(x.seo.title,300),description:clean(x.seo.description,500),keywords:Array.isArray(x.seo.keywords)?x.seo.keywords.slice(0,20).map(clean).filter(Boolean):[]}:{title:'',description:'',keywords:[]};return{title:clean(x.title,500),excerpt:clean(x.excerpt,1000),introduction:clean(x.introduction,8000),sections,toc,conclusion:clean(x.conclusion,5000),seo,image_suggestions:imgs,editor_notes:notes,polish_score:Math.max(0,Math.min(100,Number(x.polish_score)||0))}}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'}})}