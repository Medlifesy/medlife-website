import { authenticateArticleAdmin } from './article-admin-session.js';

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({ success:false, error:"Database binding 'DB' is not configured." }, 500);
    const admin = await authenticateArticleAdmin(request, env.DB);
    if (!admin) return json({ success:false, error:'يجب تسجيل الدخول إلى لوحة الإدارة أولاً.' }, 401);
    if (!['admin','editor','reviewer'].includes(String(admin.role).toLowerCase())) {
      return json({ success:false, error:'لا تملك صلاحية استخدام محرر المقالات الذكي.' }, 403);
    }
    if (!env.AI || typeof env.AI.run !== 'function') {
      return json({ success:false, error:"Workers AI binding 'AI' is not configured." }, 500);
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || 'full_edit').trim().toLowerCase();
    const language = body.language === 'en' ? 'en' : 'ar';
    const article = body.article && typeof body.article === 'object' ? body.article : {};
    const content = String(article.content || '').trim().slice(0, 45000);
    if (!content) return json({ success:false, error:'محتوى المقال مطلوب.' }, 400);

    const task = {
      full_edit: 'حرر المقال تحريراً طبياً ومؤسسياً شاملاً: بنية، لغة، مصطلحات، مقدمة، عناوين، فهرس، ملخص، SEO، واقتراحات بصرية.',
      format: 'نسّق المقال وأعد بناء عناوينه وفقراته دون تغيير المعنى أو إضافة معلومات غير موجودة.',
      proofread: 'دقق المقال لغوياً وإملائياً ونحوياً واجعل الأسلوب رسمياً طبياً مع الحفاظ على المعنى.',
      medical: 'حسّن الصياغة الطبية والمصطلحات والتسلسل العلمي دون اختراع حقائق أو جرعات أو تشخيصات.',
      seo: 'أنشئ عنواناً تحريرياً وملخصاً ووصف SEO وكلمات مفتاحية مناسبة للمقال.',
      visual: 'اقترح صوراً ورسومات طبية وإنفوغرافيك وجداول وأماكن إدراجها لجعل المقال أكثر حيوية.'
    }[action] || 'حرر المقال تحريراً طبياً ومؤسسياً شاملاً.';

    const prompt = `أنت MedLife AI — محرر المحتوى الطبي في مؤسسة ميدلايف الطبية الخيرية التطوعية.\n\nالمهمة: ${task}\n\nاللغة: ${language === 'ar' ? 'العربية الفصحى الطبية الرسمية' : 'Medical English'}\n\nقواعد صارمة:\n- حافظ على المعنى والمعلومات التي قدمها الكاتب.\n- لا تخترع أرقاماً أو نتائج دراسات أو جرعات أو تشخيصات أو مراجع.\n- لا تنسب مرجعاً إلى WHO/ACOG/FIGO/RCOG/NICE/PubMed إلا إذا كان موجوداً في النص أو تم التحقق منه خارج النموذج.\n- إذا وجدت ادعاءً يحتاج تحققاً، ضعه في editor_notes.\n- لا تحوّل المقال إلى نص دعائي.\n- اجعل الأسلوب مؤسسياً، واضحاً، طبياً، وسهل القراءة.\n- اقترح صوراً أصلية كأوصاف نصية فقط؛ لا تدّعِ أنك أنشأتها.\n- لا تستخدم أسماء مرضى أو صوراً تحدد هوية أشخاص.\n- لا تغيّر حالة النشر.\n\nأعد JSON فقط بهذا الشكل:\n{\n  "title":"",\n  "excerpt":"",\n  "introduction":"",\n  "sections":[{"heading":"","content":""}],\n  "conclusion":"",\n  "toc":[{"level":2,"title":""}],\n  "seo":{"title":"","description":"","keywords":[]},\n  "image_suggestions":[{"placement":"cover|section","purpose":"","prompt":""}],\n  "editor_notes":[],\n  "polish_score":0\n}\n\nمعلومات المقال الحالية:\nالعنوان: ${String(article.title || '').slice(0,500)}\nالتصنيف: ${String(article.category || '').slice(0,200)}\nالكاتب: ${String(article.author_name || '').slice(0,200)}\n\nالمحتوى:\n${content}`;

    const result = await env.AI.run(MODEL, {
      prompt,
      max_tokens: 9000,
      temperature: 0.25,
      response_format: { type: 'json_object' }
    });

    const text = extractText(result);
    if (!text) return json({ success:false, error:'لم يُرجع الذكاء الاصطناعي نتيجة قابلة للمعالجة.' }, 502);
    let data;
    try { data = JSON.parse(stripFences(text)); } catch {
      return json({ success:false, error:'تعذر قراءة نتيجة الذكاء الاصطناعي. حاول مرة أخرى.' }, 502);
    }
    return json({ success:true, action, editor:admin.display_name || admin.username, article:sanitize(data) });
  } catch (e) {
    console.error('article-ai error', e);
    return json({ success:false, error:'تعذر تنفيذ التحرير الذكي حالياً.' }, 500);
  }
}

function extractText(result) {
  if (typeof result === 'string') return result;
  if (result && typeof result.response === 'string') return result.response;
  if (result && typeof result.output_text === 'string') return result.output_text;
  return JSON.stringify(result?.response ?? result ?? '');
}
function stripFences(v) {
  const s=String(v).trim().replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/\s*```$/,'');
  const a=s.indexOf('{'), b=s.lastIndexOf('}');
  return a>=0 && b>a ? s.slice(a,b+1) : s;
}
function clean(v,max=20000){return String(v??'').trim().slice(0,max)}
function sanitize(x){
  const sections=Array.isArray(x.sections)?x.sections.slice(0,30).map(s=>({heading:clean(s?.heading,300),content:clean(s?.content,12000)})).filter(s=>s.heading||s.content):[];
  const toc=Array.isArray(x.toc)?x.toc.slice(0,30).map(t=>({level:Number(t?.level)||2,title:clean(t?.title,300)})).filter(t=>t.title):[];
  const imgs=Array.isArray(x.image_suggestions)?x.image_suggestions.slice(0,8).map(i=>({placement:clean(i?.placement,40),purpose:clean(i?.purpose,500),prompt:clean(i?.prompt,1500)})).filter(i=>i.prompt):[];
  const notes=Array.isArray(x.editor_notes)?x.editor_notes.slice(0,30).map(clean).filter(Boolean):[];
  const seo=x.seo&&typeof x.seo==='object'?{title:clean(x.seo.title,300),description:clean(x.seo.description,500),keywords:Array.isArray(x.seo.keywords)?x.seo.keywords.slice(0,20).map(clean).filter(Boolean):[]}:{title:'',description:'',keywords:[]};
  return {title:clean(x.title,500),excerpt:clean(x.excerpt,1000),introduction:clean(x.introduction,8000),sections,conclusion:clean(x.conclusion,5000),toc,seo,image_suggestions:imgs,editor_notes:notes,polish_score:Math.max(0,Math.min(100,Number(x.polish_score)||0))};
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'}})}
