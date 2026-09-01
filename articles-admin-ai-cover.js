(() => {
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();
  ready(() => {
    const input=document.getElementById('image_url');
    const panel=document.getElementById('editorPanel');
    if(!input||!panel) return;
    const field=input.closest('.field');
    if(!field||document.getElementById('aiCoverBox')) return;

    const box=document.createElement('div');
    box.id='aiCoverBox';
    box.className='ai-cover-box';
    box.innerHTML=`<div class="ai-cover-head"><div><strong>صورة الغلاف</strong><span>يولّدها الذكاء الاصطناعي وفق محتوى المقال</span></div><button type="button" class="btn primary" id="generateAiCover">توليد صورة AI</button></div><div class="ai-cover-preview" id="aiCoverPreview"><span>لم يتم توليد صورة بعد</span></div><div class="ai-cover-meta" id="aiCoverMeta"></div>`;
    field.appendChild(box);

    const preview=document.getElementById('aiCoverPreview');
    const meta=document.getElementById('aiCoverMeta');
    const button=document.getElementById('generateAiCover');
    const title=document.getElementById('title_ar');
    const excerpt=document.getElementById('excerpt_ar');
    const category=document.getElementById('category');
    const content=document.getElementById('contentEditor');

    const render=()=>{
      const url=String(input.value||'').trim();
      if(!url){preview.innerHTML='<span>لم يتم تحديد صورة للغلاف</span>';return;}
      preview.innerHTML=`<img src="${url.replace(/"/g,'&quot;')}" alt="معاينة صورة الغلاف">`;
    };
    input.addEventListener('input',render);

    button.addEventListener('click',async()=>{
      if(button.dataset.busy==='1') return;
      const article={
        title_ar:title?.value||'',
        excerpt_ar:excerpt?.value||'',
        category:category?.value||'',
        content_ar:content?.innerHTML||''
      };
      if(!String(article.title_ar).trim()&&!String(article.excerpt_ar).trim()&&!String(article.content_ar).trim()){
        alert('أدخل محتوى المقال أولاً حتى يستطيع الذكاء الاصطناعي فهم موضوعه.');
        return;
      }
      try{
        button.dataset.busy='1';
        button.disabled=true;
        button.textContent='جارٍ التوليد…';
        preview.innerHTML='<div class="ai-cover-loading"><span>جارٍ إنشاء صورة غلاف مناسبة للمقال…</span></div>';
        meta.textContent='';
        const response=await fetch('/api/article-image-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(article)});
        const data=await response.json().catch(()=>({}));
        if(!response.ok||!data.success) throw new Error(data.error||'تعذر توليد الصورة.');
        input.value=data.image_url||'';
        input.dispatchEvent(new Event('input',{bubbles:true}));
        render();
        meta.textContent='تم توليد صورة مخصصة للمقال بواسطة MedLife AI.';
        if(typeof window.setDirty==='function') window.setDirty(true);
        else input.dispatchEvent(new Event('change',{bubbles:true}));
      }catch(error){
        preview.innerHTML='<span>تعذر توليد الصورة حالياً</span>';
        meta.textContent=error?.message||'تعذر توليد صورة الغلاف.';
        alert(meta.textContent);
      }finally{
        delete button.dataset.busy;
        button.disabled=false;
        button.textContent='توليد صورة AI';
      }
    });
    render();
  });
})();
