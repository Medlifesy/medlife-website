(()=>{
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fields=['title_ar','title_en','category','author_name','author_email','image_url','excerpt_ar','excerpt_en','content_ar','content_en'];
  const form=()=>Object.fromEntries(fields.map(k=>[k,$(k)?.value||'']));

  async function api(url,options={}){
    const r=await fetch(url,{...options,credentials:'include',headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.success)throw Error(d.error||'تعذر تنفيذ العملية');
    return d;
  }

  function ensurePanel(){
    const editor=$('editor');
    if(!editor||$('medlifeEnhancementPanel'))return;
    const box=document.createElement('section');
    box.id='medlifeEnhancementPanel';
    box.style.cssText='margin:22px 0;padding:22px;border:1px solid #e2e8f0;border-radius:22px;background:linear-gradient(135deg,#fff,#f8fafc);box-shadow:0 14px 34px rgba(21,29,54,.06)';
    box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap"><div><div style="font-size:10px;font-weight:900;color:#ff2a54">MEDLIFE EDITORIAL AI</div><h3 style="margin:4px 0;color:#151d36;font-size:20px">✨ تنسيق المقال بأسلوب MedLife</h3><p style="margin:4px 0;color:#64748b;font-size:11px;line-height:1.9">يعيد الذكاء الاصطناعي ترتيب المقال العربي ليشبه بنية مقالات MedLife: مقدمة واضحة، عناوين منظمة، فقرات قصيرة، قوائم، تنبيهات وعلامات خطر، خلاصة، ومراجع.</p></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button id="medlifeFormatBtn" type="button" class="btn primary">✨ إعادة تنسيق المقال مثل MedLife</button><button id="medlifeVisualBtn" type="button" class="btn soft">🖼️ تحليل المقال للصور</button><button id="medlifeIllustrationBtn" type="button" class="btn soft">🎨 إنشاء رسم توضيحي مرتبط</button><button id="medlifePreviewBtn" type="button" class="btn soft">👁️ معاينة المقالة</button></div><div id="medlifeEnhancementResult" style="margin-top:12px"></div></section>`;
    const footer=editor.querySelector('.editor-footer');
    editor.insertBefore(box,footer||null);
    $('medlifeFormatBtn').onclick=()=>formatLikeMedLife();
    $('medlifeVisualBtn').onclick=()=>analyzeVisuals();
    $('medlifeIllustrationBtn').onclick=()=>createIllustration();
    $('medlifePreviewBtn').onclick=()=>window.__medlifePreview?window.__medlifePreview():fallbackPreview();
  }

  function status(text,type='ok'){const el=$('medlifeEnhancementResult');if(!el)return;el.innerHTML=`<div class="msg ${type}">${esc(text)}</div>`}

  async function formatLikeMedLife(){
    const f=form();
    if(!f.content_ar.trim()){status('أدخل محتوى المقال العربي أولاً.','error');return}
    const b=$('medlifeFormatBtn');if(b)b.disabled=true;
    status('⏳ جارٍ إعادة بناء المقال وفق أسلوب MedLife التحريري...');
    try{
      const requirements=`You are the MedLife Syria medical editorial formatter. Re-structure the Arabic article to match the visual/editorial structure of MedLife's existing medical articles.
Reference structure:
- A strong educational title and concise excerpt.
- A short introductory callout at the beginning.
- A clear table of contents / section hierarchy.
- Numbered H2-style medical sections with practical sub-structure.
- Short readable paragraphs, usually 2-4 lines.
- Bullets or ordered lists when information is better scanned.
- Clear danger/red-flag section when medically relevant.
- Treatment section split into appropriate approaches, without inventing medical facts.
- Prevention / lifestyle section when relevant.
- A concise conclusion.
- References section when the source material provides references; never fabricate citations.
- Keep Arabic language, medical accuracy, and the original meaning. Do not add unsupported diagnoses, doses, or claims.
- Return clean editorial sections: introduction, sections[{heading,content}], conclusion, toc, editor_notes, seo, title, excerpt.
Do not return HTML; return structured content only.`;
      const d=await api('/api/article-ai',{method:'POST',body:JSON.stringify({action:'full_edit',language:'ar',article:{title:f.title_ar,category:f.category,author_name:f.author_name,excerpt:f.excerpt_ar,content:f.content_ar,editorial_reference:'articles/tension-headache.html',requirements}})});
      const x=d.article||{};
      if(x.title)$('title_ar').value=x.title;
      if(x.excerpt)$('excerpt_ar').value=x.excerpt;
      const parts=[];
      if(x.introduction)parts.push(x.introduction);
      (x.sections||[]).forEach(s=>{if(s.heading)parts.push(`## ${s.heading}`);if(s.content)parts.push(s.content)});
      if(x.conclusion)parts.push(`## الخلاصة\n${x.conclusion}`);
      if(parts.length)$('content_ar').value=parts.join('\n\n');
      status('✅ تمت إعادة تنسيق المقال. راجع المحتوى ثم استخدم «معاينة المقالة» قبل النشر.');
    }catch(e){status(e.message||'تعذر تنسيق المقال.','error')}
    finally{if(b)b.disabled=false}
  }

  function sectionContexts(text){
    return String(text||'').split(/\n\s*\n|\n(?=##\s|#\s|\d+[.)]\s)/).map(s=>s.trim()).filter(Boolean).slice(0,8);
  }

  async function analyzeVisuals(){
    const f=form();
    if(!f.content_ar.trim()){status('أدخل محتوى المقال أولاً.','error');return}
    status('⏳ يجري تحليل أقسام المقال واستخراج أوصاف بحث طبية دقيقة...');
    try{
      const contexts=sectionContexts(f.content_ar);
      const d=await api('/api/article-ai',{method:'POST',body:JSON.stringify({action:'visual',language:'ar',article:{title:f.title_ar,category:f.category,content:f.content_ar,contexts,requirements:'For each important section return placement, purpose, context and a precise English medical image search query. Prefer anatomy, disease mechanisms, clinical signs, treatment concepts, prevention, or population-specific imagery. Avoid generic stock photos and avoid unrelated lifestyle photos.'}})});
      const list=(d.article?.image_suggestions||d.result?.image_suggestions||[]).slice(0,6);
      const holder=$('medlifeEnhancementResult');
      if(!holder)return;
      holder.innerHTML=`<div class="msg ok"><b>اقتراحات الصور المرتبطة بالمقال</b><div style="margin-top:8px">${(list.length?list:contexts.map((c,i)=>({placement:`بعد القسم ${i+1}`,purpose:'صورة طبية مرتبطة مباشرة بالقسم',context:c,search_query_en:`${f.title_ar} ${c} medical illustration`}))).map((x,i)=>`<div class="suggestion"><b>📍 ${esc(x.placement||`القسم ${i+1}`)}</b><p>${esc(x.purpose||'')}</p><div style="font-size:11px;color:#64748b"><b>السياق:</b> ${esc(String(x.context||'').slice(0,360))}</div><div style="font-size:11px;color:#4655a6;margin-top:5px"><b>بحث:</b> ${esc(x.search_query_en||x.query_en||x.query||'')}</div><button class="btn soft" type="button" data-medlife-search="${i}" style="margin-top:8px">🔎 عرض صور هذا القسم</button></div>`).join('')}</div></div>`;
      holder.querySelectorAll('[data-medlife-search]').forEach((btn,i)=>btn.onclick=()=>searchImages(list[i]||{}));
    }catch(e){status(e.message||'تعذر تحليل الصور.','error')}
  }

  async function searchImages(item){
    const f=form();
    const base=String(item.search_query_en||item.query_en||item.query||`${f.title_ar} ${f.category} ${item.context||''} medical illustration`).replace(/\s+/g,' ').trim();
    const queries=[`${base} medical illustration`,`${base} anatomy diagram`,`${base} clinical finding`];
    const found=[];
    status('⏳ نبحث في Wikimedia Commons عن صور مرتبطة بالسياق...');
    for(const q of queries){
      try{
        const u='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=10&gsrsort=relevance&gsrsearch='+encodeURIComponent(q)+'&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&format=json&origin=*';
        const r=await fetch(u);const d=await r.json();
        for(const p of Object.values(d?.query?.pages||{})){const info=p.imageinfo?.[0];if(info?.url)found.push({p,info})}
      }catch{}
    }
    const unique=[...new Map(found.map(x=>[x.info.url,x])).values()].slice(0,6);
    const holder=$('medlifeEnhancementResult');
    if(!holder)return;
    holder.innerHTML='<div class="msg ok"><b>صور مرتبطة بالقسم</b><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:10px">'+(unique.length?unique.map(x=>`<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:10px"><img src="${esc(x.info.thumburl||x.info.url)}" alt="" style="width:100%;height:150px;object-fit:cover;border-radius:12px"><div style="font-size:10px;line-height:1.7;margin-top:6px">${esc(x.p.title?.replace(/^File:/,'')||'صورة')}</div><button class="btn primary" type="button" style="width:100%;margin-top:7px" data-pick="${esc(x.info.url)}" data-title="${esc(x.p.title||'صورة')}">اختيار</button></div>`).join(''):'<div class="msg">لم نجد صورة قوية بما يكفي لهذا السياق.</div>')+'</div></div>';
    holder.querySelectorAll('[data-pick]').forEach(btn=>btn.onclick=()=>insertImage(btn.dataset.pick,btn.dataset.title,item.context||''));
  }

  function insertImage(url,title,context){
    const field=$('content_ar');if(!field)return;
    const block=`\n\n[MEDIA]\n${url}\n[CAPTION] ${String(title||'صورة طبية').replace(/^File:/,'')} — صورة مرتبطة بسياق القسم.\n[CONTEXT] ${String(context||'').slice(0,300)}\n[/MEDIA]\n`;
    field.value+=block;
    field.dispatchEvent(new Event('input',{bubbles:true}));
    status('✅ تمت إضافة الصورة كرابط خارجي فقط. لن تُخزّن على سيرفر MedLife.');
  }

  function createIllustration(){
    const f=form();const context=String(f.content_ar||'').replace(/\s+/g,' ').slice(0,220);if(!context){status('أدخل محتوى المقال أولاً.','error');return}
    const title=String(f.title_ar||'رسم توضيحي طبي').replace(/[<&>"]+/g,'').slice(0,80);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" rx="36" fill="#f7f9fc"/><rect x="60" y="50" width="1080" height="140" rx="28" fill="#151d36"/><text x="600" y="115" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#fff">${title}</text><text x="600" y="157" text-anchor="middle" font-family="Arial" font-size="18" fill="#cbd5e1">MedLife · Medical illustration</text><circle cx="350" cy="420" r="130" fill="#fff" stroke="#ff2a54" stroke-width="10"/><circle cx="850" cy="420" r="130" fill="#fff" stroke="#2f6bff" stroke-width="10"/><path d="M485 420h230" stroke="#64748b" stroke-width="12" stroke-linecap="round"/><text x="350" y="430" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="#151d36">المشكلة</text><text x="850" y="430" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="#151d36">التوضيح</text></svg>`;
    const field=$('content_ar');field.value+=`\n\n[MEDIA]\ndata:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}\n[CAPTION] رسم توضيحي طبي مرتبط مباشرة بمحتوى المقال.\n[CONTEXT] ${context}\n[/MEDIA]\n`;field.dispatchEvent(new Event('input',{bubbles:true}));
    status('✅ تمت إضافة رسم توضيحي مبني على سياق المقال وبدون رفع ملف إلى الخادم.');
  }

  function fallbackPreview(){
    const old=$('medlifeFallbackPreview');if(old)old.remove();
    const m=document.createElement('div');m.id='medlifeFallbackPreview';m.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(9,18,32,.72);display:flex;align-items:center;justify-content:center;padding:18px';
    const f=form();const box=document.createElement('div');box.style.cssText='width:min(960px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:24px;padding:30px;line-height:2.15';
    box.innerHTML=`<button id="mepClose" class="btn soft" style="float:left">إغلاق</button><div style="clear:both"></div><div style="font-size:11px;color:#64748b;margin-top:8px">معاينة MedLife</div><h1 style="color:#151d36">${esc(f.title_ar||'معاينة المقال')}</h1><div style="color:#64748b;font-size:12px">${esc([f.category,f.author_name].filter(Boolean).join(' · '))}</div><hr><div style="white-space:pre-wrap">${esc(f.content_ar)}</div>`;
    m.appendChild(box);document.body.appendChild(m);$('mepClose').onclick=()=>m.remove();
  }

  function boot(){ensurePanel();setTimeout(ensurePanel,300);setTimeout(ensurePanel,1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();