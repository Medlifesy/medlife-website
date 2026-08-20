(()=>{
  const boot=()=>{
    const editor=document.getElementById('editor');
    if(!editor||document.getElementById('medlifeAiFinalPolish')) return;

    // Hide the legacy AI panel so admins see one clear MedLife AI editor.
    editor.querySelectorAll('.ai-studio').forEach(el=>{
      if(el.id!=='medlifeAiEnhanced') el.style.display='none';
    });

    const enhanced=document.getElementById('medlifeAiEnhanced');
    if(!enhanced) return;
    enhanced.id='medlifeAiFinalPolish';

    const content=document.getElementById('content_ar');
    if(!content) return;

    const bar=document.createElement('div');
    bar.style.cssText='margin-top:14px;padding:12px 14px;border-radius:14px;background:#f8fbff;border:1px solid #dfe8f2;color:#526174;font:600 11px/1.9 Cairo,Arial,sans-serif';
    bar.innerHTML='<b style="color:#12203a">🛡️ وضع التحرير الآمن:</b> يحافظ على النص العلمي كاملًا، ولا يغيّر المقال الأصلي قبل اعتمادك للمعاينة.';
    enhanced.appendChild(bar);

    const preview=document.createElement('div');
    preview.id='medlifeAiPreviewPanel';
    preview.style.cssText='display:none;margin-top:12px;background:#fff;border:1px solid #dfe8f2;border-radius:16px;padding:16px;line-height:2;color:#243047';
    enhanced.appendChild(preview);

    const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    const countWords=t=>(String(t||'').trim().match(/\S+/g)||[]).length;

    const original=()=>({title:document.getElementById('title_ar')?.value||'',content:content.value||''});
    const showPreview=()=>{
      const cards=document.getElementById('aiEnhancedCards');
      if(!cards||cards.style.display==='none') return;
      const current=original();
      preview.style.display='block';
      preview.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px"><b>👁️ معاينة قبل الاعتماد</b><span style="font-size:10px;color:#6b778c">النص الحالي: '+countWords(current.content)+' كلمة</span></div><div style="padding:13px;border-radius:12px;background:#fbfcff;border:1px solid #edf1f6"><h2 style="margin:0 0 8px;color:#12203a">'+esc(current.title)+'</h2><div style="white-space:pre-wrap">'+esc(current.content)+'</div></div>';
      preview.scrollIntoView({behavior:'smooth',block:'nearest'});
    };

    const watch=()=>{
      const apply=document.getElementById('aiApplyEnhanced');
      if(apply && !apply.dataset.finalBound){
        apply.dataset.finalBound='1';
        apply.addEventListener('click',()=>setTimeout(showPreview,50),true);
      }
    };
    const obs=new MutationObserver(watch);
    obs.observe(enhanced,{childList:true,subtree:true});
    watch();
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,150));
  else setTimeout(boot,150);
})();
