(()=>{
const boot=()=>{
 const editor=document.getElementById('editor'); if(!editor||document.getElementById('medlifeEditorialV2')) return;
 const box=document.createElement('section'); box.id='medlifeEditorialV2'; box.style.cssText='margin-top:18px;padding:20px;border:1px solid #e7ddff;border-radius:20px;background:linear-gradient(180deg,#faf8ff,#fff)';
 box.innerHTML=`<div style="display:flex;align-items:center;gap:12px"><div style="width:46px;height:46px;border-radius:14px;background:#6d4aff;color:#fff;display:grid;place-items:center;font-size:22px">✦</div><div><h3 style="margin:0;color:#39227d">MedLife AI Editorial Studio</h3><p style="margin:3px 0;color:#716782;font-size:12px">حوّل المقال إلى صفحة طبية احترافية مع الحفاظ على كامل المحتوى العلمي.</p></div></div><button id="editorialV2Run" style="margin-top:16px;width:100%;padding:14px;border:0;border-radius:12px;background:#6d4aff;color:#fff;font-weight:800;cursor:pointer">✨ تنسيق المقال كصفحة MedLife احترافية</button><div id="editorialV2Preview" style="display:none;margin-top:16px"></div>`;
 editor.insertBefore(box,editor.querySelector('.editor-footer')||null);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
 const btn=box.querySelector('#editorialV2Run'), preview=box.querySelector('#editorialV2Preview');
 btn.onclick=async()=>{
  const content=document.getElementById('content_ar')?.value||''; const title=document.getElementById('title_ar')?.value||''; const excerpt=document.getElementById('excerpt_ar')?.value||'';
  if(!content.trim()){preview.style.display='block';preview.innerHTML='<b>⚠️ أدخل محتوى المقال أولًا.</b>';return;}
  btn.disabled=true;btn.textContent='⏳ الذكاء الاصطناعي ينسّق المقال ويجهز المعاينة...';preview.style.display='block';preview.innerHTML='<div style="padding:16px;border-radius:12px;background:#fff">جاري تحليل المقال كاملًا دون اختصار أو حذف...</div>';
  try{
   const r=await fetch('/api/article-ai',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'full_edit',title_ar:title,excerpt_ar:excerpt,content_ar:content,requirements:{preserve_all_scientific_content:true,no_summarization:true,formal_medical_arabic:true,create_toc:true,create_sections:true,convert_lists_and_tables:true,medical_editorial_style:true,visual_placeholders:true,seo:true}})});
   const data=await r.json(); if(!r.ok) throw new Error(data?.error||'تعذر تشغيل الذكاء الاصطناعي');
   const result=data.result||data.article||data;
   const originalNumbers=(content.match(/\b\d+(?:[.,]\d+)?\b/g)||[]); const missing=originalNumbers.filter(n=>!String(result.content_ar||result.html||'').includes(n));
   const html=result.html||result.content_ar||'';
   preview.innerHTML=`<div style="padding:14px;background:#fff;border-radius:14px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>👁️ معاينة المقال بعد التنسيق</b><span style="font-size:11px;color:${missing.length?'#b45309':'#16805c'}">${missing.length?'⚠️ يحتاج مراجعة':'🟢 فحص المحتوى سليم'}</span></div><div style="margin-top:12px;padding:18px;border:1px solid #eee;border-radius:12px;line-height:2">${html}</div><div style="display:flex;gap:8px;margin-top:12px"><button id="editorialV2Apply" style="flex:1;padding:11px;border:0;border-radius:10px;background:#16805c;color:#fff;font-weight:800" ${missing.length?'disabled':''}>✅ اعتماد التعديلات</button><button id="editorialV2Cancel" style="padding:11px 18px;border:1px solid #ddd;border-radius:10px;background:#fff">↩️ إلغاء</button></div></div>`;
   box.querySelector('#editorialV2Apply')?.addEventListener('click',()=>{ if(result.title_ar&&document.getElementById('title_ar'))document.getElementById('title_ar').value=result.title_ar; if(result.excerpt_ar&&document.getElementById('excerpt_ar'))document.getElementById('excerpt_ar').value=result.excerpt_ar; if(result.content_ar&&document.getElementById('content_ar'))document.getElementById('content_ar').value=result.content_ar; preview.innerHTML='<div style="padding:14px;border-radius:12px;background:#eefbf5;color:#146c43;font-weight:700">✅ تم اعتماد تنسيق المقال. اضغط حفظ المقال لحفظ التعديلات.</div>';});
   box.querySelector('#editorialV2Cancel')?.addEventListener('click',()=>preview.style.display='none');
  }catch(e){preview.innerHTML=`<div style="padding:14px;border-radius:12px;background:#fff1f2;color:#991b1b">❌ ${esc(e.message)}</div>`}
  finally{btn.disabled=false;btn.textContent='✨ تنسيق المقال كصفحة MedLife احترافية'}
 };
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
