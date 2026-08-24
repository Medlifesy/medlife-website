(()=>{
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fields=['title_ar','category','author_name','excerpt_ar','content_ar'];
  const form=()=>Object.fromEntries(fields.map(k=>[k,$(k)?.value||'']));

  function install(){
    const editor=$('editor');
    if(!editor||$('medlifeFastChat'))return;
    const box=document.createElement('section');
    box.id='medlifeFastChat';
    box.style.cssText='margin:22px 0;padding:20px;border:1px solid #dbe4f0;border-radius:22px;background:linear-gradient(135deg,#f9fbff,#fff);box-shadow:0 14px 34px rgba(18,32,58,.06)';
    box.innerHTML=`<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap"><div><div style="font-size:10px;font-weight:900;color:#e51f45">MEDLIFE × CHATGPT</div><h3 style="margin:4px 0;color:#12203a;font-size:20px">⚡ محرر MedLife السريع</h3><p style="margin:4px 0;color:#64748b;font-size:11px;line-height:1.9">تواصل مباشر مع محرر الذكاء الاصطناعي لتنسيق المقال وفق بنية MedLife، مع إبقاء النص الحالي دون تغيير حتى تعتمد النتيجة.</p></div><span style="background:#e8f8f2;color:#08704f;border-radius:999px;padding:5px 10px;font-size:10px;font-weight:900">PREVIEW FIRST</span></div><div style="margin-top:12px"><label style="display:block;font-size:11px;font-weight:900;color:#12203a;margin-bottom:6px">تعليمات إضافية للمحرر</label><textarea id="medlifeChatInstruction" rows="2" placeholder="مثلاً: اجعل المقدمة أقصر، رقّم العناوين، افصل علامات الخطر، وخلي الأسلوب قريب من مقالات MedLife." style="width:100%;border:1px solid #dbe4f0;border-radius:12px;padding:11px;font:inherit;resize:vertical;background:#fff"></textarea></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button id="medlifeFastFormat" class="btn primary" type="button">⚡ إعادة تنسيق سريعة عبر ChatGPT</button><button id="medlifeChatRefine" class="btn soft" type="button">💬 تحسين حسب تعليماتي</button></div><div id="medlifeFastStatus" style="margin-top:12px"></div><div id="medlifeFastResult" style="display:none;margin-top:12px"></div>`;
    editor.insertBefore(box,editor.querySelector('.editor-footer')||null);

    const status=(text,type='ok')=>{const e=$('medlifeFastStatus');if(!e)return;e.className='msg '+type;e.innerHTML=esc(text)};
    const signature=()=>[form().title_ar,form().category,form().content_ar].join('\n').trim();

    async function run(){
      const f=form();
      if(!f.content_ar.trim())return status('أدخل محتوى المقال أولاً.','error');
      const buttons=box.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);
      const started=Date.now();
      status('⏳ يتم الآن تنسيق المقال عبر محرر MedLife…');
      try{
        const r=await fetch('/api/article-format-fast',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({instruction:$('medlifeChatInstruction')?.value||'',article:{title:f.title_ar,category:f.category,author_name:f.author_name,excerpt:f.excerpt_ar,content:f.content_ar}})});
        const d=await r.json().catch(()=>({}));
        if(!r.ok||!d.success)throw Error(d.error||'تعذر تنفيذ التنسيق الذكي.');
        const a=d.article||{};
        const result=$('medlifeFastResult');
        let html='<div style="background:#fff;border:1px solid #dbe4f0;border-radius:16px;padding:14px"><strong style="color:#12203a">✅ اقتراح MedLife جاهز</strong>';
        if(a.title)html+='<p><b>العنوان:</b> '+esc(a.title)+'</p>';
        if(a.excerpt)html+='<p><b>الملخص:</b> '+esc(a.excerpt)+'</p>';
        if(a.sections?.length)html+='<p><b>عدد الأقسام:</b> '+esc(a.sections.length)+'</p>';
        html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button id="medlifeFastApply" class="btn primary" type="button">✅ اعتماد التنسيق</button><button id="medlifeFastKeep" class="btn soft" type="button">↩️ إبقاء المقال الحالي</button></div></div>';
        result.style.display='block';result.innerHTML=html;
        $('medlifeFastApply').onclick=()=>{
          if(a.title)$("title_ar").value=a.title;
          if(a.excerpt)$("excerpt_ar").value=a.excerpt;
          const parts=[];
          if(a.introduction)parts.push(a.introduction);
          (a.sections||[]).forEach(s=>{if(s.heading)parts.push(s.heading);if(s.content)parts.push(s.content)});
          if(a.conclusion)parts.push('الخلاصة\n'+a.conclusion);
          if(parts.length)$("content_ar").value=parts.join('\n\n').trim();
          $("content_ar")?.dispatchEvent(new Event('input',{bubbles:true}));
          result.innerHTML='<div class="msg ok">✅ تم اعتماد التنسيق. الآن استخدم «👁️ معاينة المقالة» قبل الحفظ والنشر.</div>';
        };
        $('medlifeFastKeep').onclick=()=>{result.style.display='none';status('تم إبقاء المقال الحالي كما هو.','ok')};
        status(`✅ اكتمل التنسيق خلال ${((Date.now()-started)/1000).toFixed(1)} ثانية. لم يتغير المقال حتى تضغط «اعتماد التنسيق».`,'ok');
      }catch(e){status(e.message||'تعذر تنفيذ التنسيق الذكي.','error')}
      finally{buttons.forEach(b=>b.disabled=false)}
    }

    $('medlifeFastFormat').onclick=run;
    $('medlifeChatRefine').onclick=run;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  setTimeout(install,400);setTimeout(install,1000);
})();
