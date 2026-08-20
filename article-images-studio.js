(()=>{
  const MAX=5, $=id=>document.getElementById(id), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function init(){
    const root=document.querySelector('[data-article-images]'); if(!root||root.dataset.aiImagesReady)return; root.dataset.aiImagesReady='1';
    const file=$('imageFiles'), list=$('imageList'), add=$('addImages'), upload=$('uploadImages'), count=$('imageCount'), msg=$('imageMsg');
    let items=[];
    const setMsg=(t,type='ok')=>{msg.className='msg '+type;msg.textContent=t};
    const update=()=>{count.textContent=`${items.length} / ${MAX} صور`; add.disabled=items.length>=MAX};
    const render=()=>{list.innerHTML=items.map((x,i)=>`<article class="image-card"><img src="${esc(x.preview||x.url||'')}" alt="${esc(x.alt||'')}" ${x.url||x.preview?'':'style="display:none"'}><div style="margin-top:8px"><b>${esc(x.name||'صورة')}</b><div class="muted">${esc(x.license||'')} ${x.source_url?`· <a href="${esc(x.source_url)}" target="_blank" rel="noopener">المصدر</a>`:''}</div><label class="muted">النص البديل<input data-i="${i}" data-k="alt" value="${esc(x.alt||'')}" style="width:100%;padding:8px;border:1px solid #e5eaf1;border-radius:8px"></label><label class="muted">الموضع<select data-i="${i}" data-k="placement" style="width:100%;padding:8px;border:1px solid #e5eaf1;border-radius:8px"><option ${x.placement==='صورة الغلاف'?'selected':''}>صورة الغلاف</option><option ${x.placement==='بعد المقدمة'?'selected':''}>بعد المقدمة</option><option ${x.placement==='داخل المقال'?'selected':''}>داخل المقال</option></select></label><div class="image-actions"><button class="btn soft" data-remove="${i}">حذف</button></div></div></article>`).join(''); list.querySelectorAll('[data-k]').forEach(e=>e.oninput=()=>items[+e.dataset.i][e.dataset.k]=e.value);list.querySelectorAll('[data-remove]').forEach(e=>e.onclick=()=>{items.splice(+e.dataset.remove,1);render();update()});update()};
    add.onclick=()=>file.click();
    file.onchange=e=>{const left=MAX-items.length;[...e.target.files].filter(f=>f.type.startsWith('image/')).slice(0,left).forEach(f=>items.push({name:f.name,preview:URL.createObjectURL(f),file:f,alt:'',placement:'داخل المقال'}));file.value='';render()};
    upload.onclick=async()=>{const fs=items.filter(x=>x.file);if(!fs.length)return setMsg('لا توجد صور جديدة للرفع.','error');upload.disabled=true;setMsg('⏳ جارٍ رفع الصور...');try{const fd=new FormData();fs.forEach(x=>fd.append('images',x.file));const r=await fetch('/api/article-images',{method:'POST',credentials:'include',body:fd});const d=await r.json();if(!r.ok||!d.success)throw Error(d.error||'تعذر رفع الصور');let j=0;items.forEach(x=>{if(x.file&&d.images?.[j]){Object.assign(x,d.images[j]);j++}});render();setMsg('✅ تم رفع الصور إلى تخزين MedLife.')}catch(e){setMsg(e.message,'error')}finally{upload.disabled=false}};
    const tools=root.querySelector('.image-actions');
    const aiBtn=document.createElement('button');aiBtn.className='btn green';aiBtn.textContent='🤖 الذكاء الاصطناعي: ابحث وأضف الصور';tools.appendChild(aiBtn);
    const result=document.createElement('div');result.className='msg';root.appendChild(result);
    aiBtn.onclick=async()=>{if(items.length>=MAX)return setMsg('⚠️ وصلت للحد الأقصى: 5 صور.','error');aiBtn.disabled=true;result.textContent='⏳ الذكاء الاصطناعي يحلل المقال ويبحث عن صور مناسبة ومرخّصة...';try{
      const article={title_ar:$('title_ar')?.value||'',content_ar:$('content_ar')?.value||'',category:$('category')?.value||''};
      const ar=await fetch('/api/article-ai',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'visual',language:'ar',article:{title:article.title_ar,category:article.category,content:article.content_ar}})});const ad=await ar.json();if(!ar.ok||!ad.success)throw Error(ad.error||'تعذر تحليل المقال');
      const suggestions=(ad.article?.image_suggestions||ad.result?.image_suggestions||[]).slice(0,MAX-items.length);if(!suggestions.length)throw Error('لم يقترح الذكاء الاصطناعي أماكن مناسبة للصور.');
      const qs=suggestions.map((s)=>({query:s.query||s.search_query||s.prompt||s.description||`${article.title_ar} medical illustration`,placement:s.placement||'داخل المقال'}));
      const ir=await fetch('/api/article-images-auto',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({queries:qs})});const id=await ir.json();if(!ir.ok||!id.success)throw Error(id.error||'تعذر البحث عن الصور');
      id.images.forEach(x=>items.push({...x,auto:true}));render();result.className='msg ok';result.innerHTML=`✅ تم العثور على <b>${id.images.length}</b> صور مرخّصة ورفعها تلقائيًا إلى GitHub. راجعها قبل نشر المقال.`;
    }catch(e){result.className='msg error';result.textContent='❌ '+e.message}finally{aiBtn.disabled=false}};
    render();
  }
  document.addEventListener('DOMContentLoaded',init); window.MedLifeArticleImages={init};
})();
