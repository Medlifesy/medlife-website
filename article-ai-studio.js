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

  /* =========================================================
     MEDLIFE ARTICLE IMAGE STUDIO
     Uses the existing /api/article-image R2 endpoint.
  ========================================================= */
  function initImages(){
    if(document.getElementById('medlifeImageStudio'))return;
    const editor=document.getElementById('editor');
    if(!editor||!document.getElementById('image_url'))return;
    const css=document.createElement('style');
    css.textContent=`#medlifeImageStudio{margin:24px 0;padding:22px;border:1px solid #dfe5ee;border-radius:20px;background:linear-gradient(135deg,#fbfcff,#f5f7fb);box-shadow:0 12px 30px rgba(18,32,58,.06)}#medlifeImageStudio h3{margin:0;color:#12203a;font-size:18px}#medlifeImageStudio .ais-sub{color:#6b778c;font-size:11px;margin:5px 0 16px}.ais-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ais-card{background:#fff;border:1px solid #e5eaf1;border-radius:15px;padding:14px}.ais-card label{display:block;font-size:11px;font-weight:800;color:#12203a;margin:8px 0 5px}.ais-card input,.ais-card select{width:100%;border:1px solid #e5eaf1;border-radius:10px;padding:9px;font:inherit;background:#fbfcfe}.ais-drop{border:2px dashed #cfd7e5;border-radius:14px;padding:18px;text-align:center;color:#6b778c;cursor:pointer}.ais-preview{width:100%;max-height:230px;object-fit:cover;border-radius:12px;margin-top:10px;display:none}.ais-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.ais-btn{border:0;border-radius:11px;padding:10px 13px;font:800 11px Cairo;cursor:pointer}.ais-primary{background:#6d4aff;color:#fff}.ais-soft{background:#eef2f7;color:#12203a}.ais-ok{background:#e8f8f2;color:#087f5b}.ais-status{margin-top:10px;font-size:11px;line-height:1.9}.ais-ai-list{display:grid;gap:8px;margin-top:10px}.ais-ai-item{padding:10px;border:1px solid #e5dcff;border-radius:12px;background:#fff}.ais-ai-item button{margin-top:7px}.ais-hidden{display:none!important}@media(max-width:700px){.ais-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(css);
    const box=document.createElement('section');box.id='medlifeImageStudio';
    box.innerHTML=`<h3>🖼️ صور المقالة — MedLife Visual Studio</h3><div class="ais-sub">ارفع صورة الغلاف أو صورًا داخل المقال. سيتم تخزينها تلقائيًا في R2 عبر ARTICLES_IMAGES.</div><div class="ais-grid"><div class="ais-card"><label>صورة الغلاف</label><div class="ais-drop" id="aisDrop">📁 اضغط لاختيار صورة أو اسحبها إلى هنا<input id="aisFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="ais-hidden"></div><img id="aisPreview" class="ais-preview" alt="معاينة صورة المقال"><label>عنوان الصورة</label><input id="aisCaption" placeholder="مثلاً: استشارة طبية حول تنظيم الأسرة"><label>Alt Text</label><input id="aisAlt" placeholder="وصف مختصر ودقيق للصورة"></div><div class="ais-card"><label>مكان ظهور الصورة</label><select id="aisPosition"><option>صورة الغلاف</option><option>بعد المقدمة</option><option>بعد القسم الثاني</option><option>بعد القسم الثالث</option><option>داخل المقال</option></select><label>اقتراحات الذكاء الاصطناعي</label><div class="ais-actions"><button id="aisSuggest" class="ais-btn ais-primary">🤖 اقترح صورًا مناسبة</button><button id="aisUpload" class="ais-btn ais-ok">☁️ رفع الصورة</button></div><div id="aisStatus" class="ais-status"></div><div id="aisSuggestions" class="ais-ai-list"></div></div></div>`;
    const imageField=document.getElementById('image_url');
    imageField.closest('.field')?.after(box);
    const file=document.getElementById('aisFile'),drop=document.getElementById('aisDrop'),preview=document.getElementById('aisPreview'),status=document.getElementById('aisStatus');
    let selectedFile=null;
    const setFile=f=>{if(!f||!f.type.startsWith('image/'))return status.textContent='اختر JPG أو PNG أو WEBP أو GIF.';if(f.size>5*1024*1024)return status.textContent='حجم الصورة يجب ألا يتجاوز 5 ميغابايت.';selectedFile=f;preview.src=URL.createObjectURL(f);preview.style.display='block';status.textContent='تم اختيار الصورة: '+f.name};
    drop.onclick=()=>file.click();file.onchange=()=>setFile(file.files?.[0]);['dragenter','dragover'].forEach(e=>drop.addEventListener(e,x=>{x.preventDefault();drop.style.borderColor='#6d4aff'}));drop.addEventListener('dragleave',e=>{e.preventDefault();drop.style.borderColor=''});drop.addEventListener('drop',e=>{e.preventDefault();drop.style.borderColor='';setFile(e.dataTransfer.files?.[0])});
    document.getElementById('aisUpload').onclick=async()=>{if(!selectedFile)return status.textContent='اختر صورة أولاً.';status.textContent='⏳ جارٍ رفع الصورة إلى R2...';try{const r=await fetch('/api/article-image',{method:'POST',credentials:'include',headers:{'Content-Type':selectedFile.type},body:selectedFile});const d=await r.json();if(!r.ok||!d.success)throw Error(d.error||'تعذر رفع الصورة');imageField.value=d.image_url;document.getElementById('aisAlt').value=document.getElementById('aisAlt').value||document.getElementById('aisCaption').value||'';status.innerHTML='✅ تم رفع الصورة بنجاح. تم وضع رابطها في صورة المقال.'; }catch(e){status.textContent='❌ '+e.message}};
    document.getElementById('aisSuggest').onclick=async()=>{const out=document.getElementById('aisSuggestions');out.innerHTML='⏳ جارٍ تحليل المقال واقتراح الصور...';try{const article=collect();const r=await fetch('/api/article-ai',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action:'visual',language:'ar',article})});const d=await r.json();if(!r.ok||!d.success)throw Error(d.error||'تعذر اقتراح الصور');const arr=d.article?.image_suggestions||[];out.innerHTML=arr.length?arr.map((x,i)=>`<div class="ais-ai-item"><b>🖼️ ${esc(x.placement||'صورة')}</b><div>${esc(x.purpose||'')}</div><small>${esc(x.prompt||'')}</small><br><button type="button" class="ais-btn ais-soft" data-copy="${i}">📋 استخدام كـوصف للصورة</button></div>`).join(''):'لم يقترح الذكاء الاصطناعي صورًا لهذه المقالة.';out.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{const x=arr[+b.dataset.copy];document.getElementById('aisAlt').value=x?.purpose||x?.prompt||'';document.getElementById('aisCaption').value=x?.placement||'صورة توضيحية للمقال';status.textContent='تم نقل الاقتراح إلى بيانات الصورة. يمكنك الآن رفع صورة مناسبة من جهازك.'});}catch(e){out.textContent='❌ '+e.message}};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initImages);else initImages();
})();
