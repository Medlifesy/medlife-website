(()=>{
  const $=id=>document.getElementById(id);
  if(!$('aiResult')||!document.querySelector('[data-ai]')) return;
  let pending=null;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const original=()=>({title:$('title_ar').value,excerpt:$('excerpt_ar').value,content:$('content_ar').value});
  const setResult=(title,html)=>{const el=$('aiResult');el.className='ai-result';el.innerHTML='<h4>'+esc(title)+'</h4>'+html};
  const contentPreview=text=>esc(text||'').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');
  const render=x=>{
    let h='<div style="background:#f7f8ff;border:1px solid #e5dcff;border-radius:12px;padding:12px;margin-bottom:12px"><b>🛡️ حماية المحتوى العلمي:</b> '+(x.content_ar?'تم فحص النسخة المقترحة قبل عرضها.':'لا يوجد تعديل على المحتوى.')+'</div>';
    if(x.title)h+='<h4>العنوان بعد التحرير</h4><div>'+esc(x.title)+'</div>';
    if(x.excerpt)h+='<h4>الملخص</h4><div>'+esc(x.excerpt)+'</div>';
    if(x.toc?.length)h+='<h4>📑 الفهرس</h4><ol>'+x.toc.map(t=>'<li>'+esc(t.title)+'</li>').join('')+'</ol>';
    if(x.image_suggestions?.length){h+='<h4>🖼️ أماكن الصور داخل المقال</h4>';x.image_suggestions.slice(0,5).forEach((i,n)=>h+='<div class="suggestion"><b>'+esc(i.placement||('الصورة '+(n+1)))+'</b><p>'+esc(i.purpose||'')+'</p><small>'+esc(i.prompt||'')+'</small></div>')}
    if(x.seo?.title)h+='<h4>🔎 SEO</h4><b>'+esc(x.seo.title)+'</b><br>'+esc(x.seo.description||'');
    if(x.editor_notes?.length)h+='<div class="note"><b>⚠️ تحتاج مراجعة بشرية:</b><ul>'+x.editor_notes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul></div>';
    if(x.polish_score!=null)h+='<div style="margin-top:10px">⭐ درجة الصقل: <b>'+esc(x.polish_score)+'/100</b></div>';
    if(x.content_ar)h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:15px"><button id="aiApplyUpgrade" class="btn green">✅ اعتماد التعديلات</button><button id="aiRejectUpgrade" class="btn soft">↩️ إلغاء</button></div>';
    setResult('✨ MedLife AI — معاينة قبل الاعتماد',h);
    if($('aiApplyUpgrade'))$('aiApplyUpgrade').onclick=()=>{const o=original();$('title_ar').value=pending.title||o.title;$('excerpt_ar').value=pending.excerpt||o.excerpt;$('content_ar').value=pending.content_ar||o.content;pending=null;renderPreview();setResult('✅ تم اعتماد النسخة المقترحة','تم تطبيق التعديلات على الحقول فقط. <b>لم يتم الحفظ في قاعدة البيانات بعد.</b> راجع المقال ثم اضغط حفظ.');};
    if($('aiRejectUpgrade'))$('aiRejectUpgrade').onclick=()=>{pending=null;setResult('↩️ تم الإلغاء','بقي المقال الأصلي دون أي تعديل.');};
  };
  function renderPreview(){const p=$('preview');if(!p)return;p.style.display='block';p.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><strong>👁️ معاينة الزائر</strong><span class="muted">هذه معاينة فقط</span></div><h1>'+esc($('title_ar').value)+'</h1><p><strong>'+esc($('excerpt_ar').value)+'</strong></p><hr><div class="article-ai-preview"><p>'+contentPreview($('content_ar').value)+'</p></div>'}
  async function run(action){
    const a=original();if(!a.content.trim())return setResult('تنبيه','أدخل محتوى المقال أولاً.');
    const bs=[...document.querySelectorAll('[data-ai]')];bs.forEach(b=>b.disabled=true);setResult('✦ MedLife AI','⏳ جارٍ تحليل المقال كاملًا دون اختصار أو حذف...');
    try{const r=await fetch('/api/article-ai',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action,language:'ar',article:{title:a.title,category:$('category').value,author_name:$('author_name').value,content:a.content}})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw Error(d.error||'تعذر تنفيذ الذكاء الاصطناعي.');pending=d.article||{};render(pending);if($('preview')){$('preview').style.display='block';$('preview').innerHTML='<div style="padding:10px;background:#fff8e8;border-radius:10px">👀 <b>المعاينة جاهزة.</b> لم يتم تغيير المقال الأصلي حتى تضغط اعتماد.</div>'};}
    catch(e){setResult('❌ تعذر تنفيذ MedLife AI',esc(e.message))}finally{bs.forEach(b=>b.disabled=false)}
  }
  document.querySelectorAll('[data-ai]').forEach(b=>{b.onclick=e=>{e.preventDefault();run(b.dataset.ai)}});
  if($('aiPreview'))$('aiPreview').onclick=renderPreview;
  if($('preview'))renderPreview();
})();
