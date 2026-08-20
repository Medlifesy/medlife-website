(()=>{
  const $=id=>document.getElementById(id);
  if(!$('aiFormat')||!$('aiMedical'))return;
  let pending=null;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const show=(title,html)=>{const el=$('aiResult');el.className='ai-result';el.innerHTML='<b>'+esc(title)+'</b><br>'+html};
  const collect=()=>({title:$('title_ar')?.value||'',category:$('category')?.value||'',author_name:$('author_name')?.value||'',content:$('content_ar')?.value||''});
  const buildContent=a=>{const parts=[];if(a.introduction)parts.push(a.introduction);(a.sections||[]).forEach(s=>{if(s.heading)parts.push('\n'+s.heading+'\n');if(s.content)parts.push(s.content)});if(a.conclusion)parts.push('\nالخلاصة\n'+a.conclusion);return parts.join('\n\n').trim()};
  const renderResult=a=>{
    let html='';
    if(a.excerpt)html+='<div style="margin-bottom:8px"><strong>📰 الملخص المقترح</strong><br>'+esc(a.excerpt)+'</div>';
    if(a.toc?.length)html+='<div class="toc-box"><strong>📑 الفهرس المقترح</strong><ol>'+a.toc.map(t=>'<li>'+esc(t.title)+'</li>').join('')+'</ol></div>';
    if(a.image_suggestions?.length)html+='<br><strong>🖼️ اقتراحات بصرية</strong><ul>'+a.image_suggestions.map(i=>'<li><b>'+esc(i.placement)+'</b>: '+esc(i.purpose)+'<br><small>'+esc(i.prompt)+'</small></li>').join('')+'</ul>';
    if(a.seo)html+='<br><strong>🔎 SEO</strong><br>العنوان: '+esc(a.seo.title)+'<br>الوصف: '+esc(a.seo.description)+'<br>الكلمات: '+esc((a.seo.keywords||[]).join('، '));
    if(a.editor_notes?.length)html+='<br><strong>⚠️ نقاط تحتاج مراجعة</strong><ul>'+a.editor_notes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul>';
    html+='<br><strong>⭐ التقييم التحريري:</strong> '+esc(a.polish_score)+'/100';
    if(pending)html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="aiApply" class="btn primary">✅ اعتماد النسخة المقترحة</button><button id="aiKeep" class="btn soft">↩️ إبقاء النص الحالي</button></div>';
    show('✨ MedLife AI — نتيجة التحرير',html);
    if($('aiApply'))$('aiApply').onclick=applyPending;
    if($('aiKeep'))$('aiKeep').onclick=()=>{pending=null;show('تم الإبقاء على النص الحالي','لم يتم تغيير المقال.');};
  };
  function applyPending(){if(!pending)return;const a=pending;if(a.title)$('title_ar').value=a.title;if(a.excerpt)$('excerpt_ar').value=a.excerpt;const c=buildContent(a);if(c)$('content_ar').value=c;pending=null;renderResult({...a,editor_notes:['تم اعتماد التعديلات المقترحة. راجع المحتوى قبل النشر.']});}
  async function run(action){
    const article=collect();
    if(!article.content.trim())return show('تنبيه','أدخل محتوى المقال أولاً.');
    const btns=document.querySelectorAll('.ai-btn');btns.forEach(b=>b.disabled=true);pending=null;show('✨ MedLife AI','جاري تحليل المقال وإعادة بنائه تحريرياً...');
    try{
      const r=await fetch('/api/article-ai',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action,language:'ar',article})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.success)throw Error(d.error||'تعذر تنفيذ الذكاء الاصطناعي.');
      pending=d.article||{};renderResult(pending);
    }catch(e){show('تعذر تنفيذ MedLife AI',esc(e.message))}finally{btns.forEach(b=>b.disabled=false)}
  }
  $('aiFormat').onclick=()=>run('full_edit');
  $('aiMedical').onclick=()=>run('medical');
  $('aiSeo').onclick=()=>run('seo');
  $('aiToc').onclick=()=>run('format');
  if($('aiPreview'))$('aiPreview').onclick=()=>{
    const box=$('preview');
    if(!box)return;
    box.style.display=box.style.display==='block'?'none':'block';
    const title=esc($('title_ar')?.value),excerpt=esc($('excerpt_ar')?.value),content=esc($('content_ar')?.value).replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');
    box.innerHTML='<h1>'+title+'</h1><p><strong>'+excerpt+'</strong></p><hr><p>'+content+'</p>';
  };
})();
