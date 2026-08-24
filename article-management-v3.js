(()=>{
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let creating=false;

  const fields=['title_ar','title_en','category','author_name','author_email','image_url','excerpt_ar','excerpt_en','content_ar','content_en'];
  const getForm=()=>Object.fromEntries(fields.map(k=>[k,$(k)?.value||'']));
  const clearForm=()=>fields.forEach(k=>{if($(k))$(k).value=''});
  const setCreating=v=>{
    creating=v;
    const editor=$('editor');
    if(!editor)return;
    editor.classList.remove('hidden');
    const meta=$('editorMeta');
    if(meta)meta.textContent=v?'مقالة جديدة · سيتم حفظها كقيد مراجعة بعد الإنشاء.':'تحرير المقال';
    const reject=$('reject');
    if(reject)reject.style.display=v?'none':'';
    const save=$('save'); if(save)save.textContent=v?'إنشاء وحفظ كمراجعة':'حفظ كمراجعة';
    const publish=$('publish'); if(publish)publish.textContent=v?'إنشاء ونشر':'حفظ ونشر';
    const draft=$('draft'); if(draft)draft.textContent=v?'إنشاء كمسودة':'حفظ كمسودة';
  };

  async function api(url,options={}){
    const r=await fetch(url,{...options,credentials:'include',headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.success)throw Error(d.error||'تعذر تنفيذ العملية');
    return d;
  }
  const formMessage=(text,type='ok')=>{const el=$('editMsg');if(el){el.className='msg '+type;el.textContent=text}};

  async function createArticle(status){
    const body=getForm();
    if(!body.title_ar.trim()||!body.content_ar.trim()||!body.author_name.trim())return formMessage('العنوان العربي والمحتوى العربي واسم الكاتب حقول مطلوبة.','error');
    try{
      ['save','publish','draft'].forEach(id=>{if($(id))$(id).disabled=true});
      const created=await api('/api/articles',{method:'POST',body:JSON.stringify(body)});
      if(status!=='pending'){
        await api('/api/articles',{method:'PUT',body:JSON.stringify({...body,id:created.id,status})});
      }
      formMessage(status==='published'?'✅ تم إنشاء المقال ونشره.':status==='draft'?'✅ تم إنشاء المقال كمسودة.':'✅ تم إنشاء المقال وإرساله للمراجعة.');
      creating=false;
      ['save','publish','draft'].forEach(id=>{if($(id))$(id).disabled=false});
      if(typeof window.load==='function')await window.load(); else location.reload();
    }catch(e){
      formMessage(e.message,'error');
      ['save','publish','draft'].forEach(id=>{if($(id))$(id).disabled=false});
    }
  }

  function addNewButton(){
    const hero=document.querySelector('.hero');
    if(!hero||document.getElementById('addNewArticleV3'))return;
    const b=document.createElement('button');
    b.id='addNewArticleV3';b.className='btn primary';b.type='button';b.textContent='➕ إضافة مقالة جديدة';
    b.style.marginTop='14px';b.style.width='100%';b.onclick=()=>{clearForm();setCreating(true);window.scrollTo({top:document.getElementById('editor')?.offsetTop||0,behavior:'smooth'})};
    hero.appendChild(b);
  }

  function patchButtons(){
    const save=$('save'),publish=$('publish'),draft=$('draft');
    if(save)save.onclick=()=>creating?createArticle('pending'):window.__medlifeOriginalSave?.();
    if(publish)publish.onclick=()=>creating?createArticle('published'):window.__medlifeOriginalPublish?.();
    if(draft)draft.onclick=()=>creating?createArticle('draft'):window.__medlifeOriginalDraft?.();
    const close=$('close');if(close)close.onclick=()=>{creating=false;$('editor')?.classList.add('hidden')};
  }

  function patchExistingHandlers(){
    const save=$('save'),publish=$('publish'),draft=$('draft');
    if(save&&!window.__medlifeOriginalSave)window.__medlifeOriginalSave=save.onclick;
    if(publish&&!window.__medlifeOriginalPublish)window.__medlifeOriginalPublish=publish.onclick;
    if(draft&&!window.__medlifeOriginalDraft)window.__medlifeOriginalDraft=draft.onclick;
    const oldEdit=window.editArticle;
    if(typeof oldEdit==='function'&&!oldEdit.__medlifeWrapped){
      const wrapped=function(id){creating=false;const r=oldEdit(id);setTimeout(()=>{setCreating(false);hideUploadControls();},0);return r};
      wrapped.__medlifeWrapped=true;window.editArticle=wrapped;
    }
  }

  function hideUploadControls(){
    const studio=document.querySelector('[data-article-images]');
    if(!studio||studio.dataset.noStorageReady)return;
    studio.dataset.noStorageReady='1';
    const upload=$('uploadImages');const input=$('imageFiles');
    if(upload)upload.style.display='none';
    if(input)input.style.display='none';
    const add=$('addImages');if(add)add.style.display='none';
    const oldAi=studio.querySelector('.image-actions .btn.green');if(oldAi)oldAi.style.display='none';
    const note=document.createElement('div');note.className='msg ok';note.style.marginTop='12px';note.textContent='🔒 وضع بدون تخزين: الصور المقترحة لا تُرفع إلى GitHub ولا تُحفظ ضمن ملفات الموقع.';
    studio.insertBefore(note,studio.querySelector('#imageList')||null);
  }

  function injectVisualStudio(){
    const editor=$('editor');
    if(!editor||document.getElementById('noStorageVisualStudio'))return;
    const box=document.createElement('section');box.id='noStorageVisualStudio';box.style.cssText='margin:24px 0;padding:22px;border:1px solid #dbe4f0;border-radius:22px;background:linear-gradient(135deg,#f9fbff,#fff)';
    box.innerHTML=`<div style="display:flex;align-items:center;gap:12px"><div style="width:46px;height:46px;border-radius:15px;background:#12203a;color:#fff;display:grid;place-items:center;font-size:21px">🖼️</div><div><h3 style="margin:0;color:#12203a">MedLife AI Visual Studio — بدون تخزين</h3><p style="margin:3px 0;color:#6b778c;font-size:11px">الذكاء يقرأ المقال ويقترح أماكن الصور، ثم نعرض صوراً مفتوحة أو رسومات توضيحية محلية بدون رفع ملفات.</p></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="visualPlanBtn" class="btn primary" type="button">✨ تحليل المقال واقتراح الصور</button><button id="localIllustrationBtn" class="btn soft" type="button">🎨 إنشاء رسم توضيحي مجاني</button></div><div id="visualPlanResult" style="margin-top:14px"></div>`;
    editor.insertBefore(box,editor.querySelector('.editor-footer')||null);
    box.querySelector('#visualPlanBtn').onclick=planVisuals;
    box.querySelector('#localIllustrationBtn').onclick=createIllustration;
  }

  async function planVisuals(){
    const result=$('visualPlanResult'),title=$('title_ar')?.value||'',content=$('content_ar')?.value||'',category=$('category')?.value||'';
    if(!content.trim()){result.innerHTML='<div class="msg error">أدخل محتوى المقال أولاً.</div>';return}
    result.innerHTML='<div class="msg">⏳ الذكاء الاصطناعي يحلل المقال ويقترح أنواع ومواقع الصور...</div>';
    try{
      const d=await api('/api/article-ai',{method:'POST',body:JSON.stringify({action:'visual',language:'ar',article:{title,category,content}})});
      const items=(d.article?.image_suggestions||d.result?.image_suggestions||[]).slice(0,5);
      if(!items.length){result.innerHTML='<div class="msg">لم يتم اقتراح صور لهذا المقال.</div>';return}
      result.innerHTML='<div class="suggestion-list">'+items.map((x,i)=>`<div class="suggestion"><b>📍 ${esc(x.placement||'صورة '+(i+1))}</b><p>${esc(x.purpose||'رسم توضيحي مناسب للمحتوى')}</p><small>${esc(x.query||x.prompt||x.description||'medical illustration')}</small><div style="margin-top:8px"><button type="button" class="btn soft" data-wiki="${i}">🔎 البحث عن صورة مفتوحة</button></div></div>`).join('')+'</div>';
      result.querySelectorAll('[data-wiki]').forEach(b=>b.onclick=()=>searchCommons(items[+b.dataset.wiki],result));
    }catch(e){result.innerHTML='<div class="msg error">❌ '+esc(e.message)+'</div>'}
  }

  async function searchCommons(item,result){
    const q=item?.query||item?.prompt||item?.description||$('title_ar')?.value||'medical illustration';
    result.insertAdjacentHTML('beforeend','<div class="msg">⏳ البحث في Wikimedia Commons...</div>');
    try{
      const u='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(q)+'&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1000&format=json&origin=*';
      const r=await fetch(u);const d=await r.json();const pages=Object.values(d?.query?.pages||{});
      const safe=pages.filter(p=>p.imageinfo?.[0]?.url).slice(0,4);
      const wrap=document.createElement('div');wrap.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px';
      safe.forEach((p)=>{const info=p.imageinfo[0],license=info.extmetadata?.LicenseShortName?.value||'تحقق من الترخيص';const card=document.createElement('div');card.style.cssText='border:1px solid #e5eaf1;border-radius:14px;padding:8px;background:#fff';card.innerHTML=`<img src="${esc(info.thumburl||info.url)}" alt="" style="width:100%;height:130px;object-fit:cover;border-radius:10px"><div style="font-size:10px;margin-top:5px"><b>${esc(p.title?.replace(/^File:/,'')||'صورة')}</b><br>${esc(license)}</div><button class="btn soft" type="button" style="margin-top:7px;width:100%">➕ إدراج الرابط</button>`;card.querySelector('button').onclick=()=>insertRemoteImage(info.url,p.title,license);wrap.appendChild(card)});
      result.appendChild(wrap);
      if(!safe.length)result.insertAdjacentHTML('beforeend','<div class="msg">لم نجد نتيجة مناسبة. جرّب زر الرسم التوضيحي.</div>');
    }catch(e){result.insertAdjacentHTML('beforeend','<div class="msg error">تعذر البحث عن الصور المفتوحة.</div>')}
  }

  function insertRemoteImage(url,title,license){
    const field=$('content_ar');if(!field)return;
    const line=`\n\n[صورة توضيحية — ${String(title||'').replace(/^File:/,'')}]\n${url}\n[الترخيص: ${license}]\n`;
    field.value+=line;
    formMessage('✅ تمت إضافة رابط الصورة فقط إلى المقال. لم يتم رفع الصورة إلى خوادم MedLife.');
  }

  function createIllustration(){
    const field=$('content_ar');if(!field)return;
    const title=$('title_ar')?.value||'رسم توضيحي طبي';
    const safeTitle=esc(title.slice(0,90));
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" rx="32" fill="#f7f9fc"/><rect x="70" y="70" width="1060" height="120" rx="24" fill="#151d36"/><text x="600" y="145" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#fff">${safeTitle}</text><circle cx="360" cy="390" r="130" fill="#fff" stroke="#ff2a54" stroke-width="10"/><circle cx="840" cy="390" r="130" fill="#fff" stroke="#2f6bff" stroke-width="10"/><path d="M490 390h220" stroke="#64748b" stroke-width="12" stroke-linecap="round"/><text x="360" y="395" text-anchor="middle" font-family="Arial" font-size="26" fill="#151d36">المعلومة</text><text x="840" y="395" text-anchor="middle" font-family="Arial" font-size="26" fill="#151d36">التوضيح</text></svg>`;
    const uri='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
    field.value+=`\n\n[رسم توضيحي مجاني]\n${uri}\n`;
    formMessage('✅ تم إنشاء رسم توضيحي محلي مجاني. لا يوجد ملف محفوظ على السيرفر.');
  }

  function boot(){
    addNewButton();injectVisualStudio();hideUploadControls();patchExistingHandlers();patchButtons();
    const again=()=>{patchExistingHandlers();patchButtons();hideUploadControls()};
    setTimeout(again,250);setTimeout(again,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();