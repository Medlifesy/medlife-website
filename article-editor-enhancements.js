(()=>{
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const form=()=>({title_ar:$('title_ar')?.value||'',category:$('category')?.value||'',author_name:$('author_name')?.value||'',content_ar:$('content_ar')?.value||'',excerpt_ar:$('excerpt_ar')?.value||'',image_url:$('image_url')?.value||''});
  const api=async(body)=>{const r=await fetch('/api/article-ai',{method:'POST',credentials:'include',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw Error(d.error||'تعذر تشغيل MedLife AI');return d};
  const msg=t=>{const e=$('editMsg');if(e){e.className='msg ok';e.textContent=t}};
  function addPanel(){
    const editor=$('editor');if(!editor||$('medlifeArticleEnhancements'))return;
    const panel=document.createElement('section');panel.id='medlifeArticleEnhancements';panel.style.cssText='margin:20px 0;padding:20px;border:1px solid #dbe4f0;border-radius:20px;background:#fff;box-shadow:0 10px 30px rgba(18,32,58,.06)';
    panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><h3 style="margin:0;color:#12203a">✦ مساعد MedLife للمقال</h3><p style="margin:4px 0;color:#6b778c;font-size:11px">رتّب المقال بنفس أسلوب مقالات MedLife، ثم اربط الصور بكل قسم من المحتوى.</p></div><span style="font-size:11px;color:#6b778c">ChatGPT · بدون تخزين للصور</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:15px"><button id="medlifeFormatArticle" class="btn primary" type="button">🤖 إعادة تنسيق المقال بأسلوب MedLife</button><button id="medlifeAnalyzeImages" class="btn soft" type="button">🖼️ تحليل المقال واقتراح الصور</button><button id="medlifeCreateIllustration" class="btn soft" type="button">🎨 إنشاء رسم توضيحي</button><button id="medlifePreviewEnhancement" class="btn soft" type="button">👁️ معاينة المقالة</button></div><div id="medlifeEnhancementResult" class="msg" style="display:none"></div></section>';
    editor.appendChild(panel);
    $('medlifeFormatArticle').onclick=reformatArticle;
    $('medlifeAnalyzeImages').onclick=analyzeImages;
    $('medlifeCreateIllustration').onclick=createIllustration;
    $('medlifePreviewEnhancement').onclick=()=>{if(typeof window.__medlifePreview==='function')window.__medlifePreview();else if(typeof window.openPreview==='function')window.openPreview()};
  }
  function result(t,ok=true){const e=$('medlifeEnhancementResult');if(!e)return;e.style.display='block';e.className='msg '+(ok?'ok':'error');e.innerHTML=esc(t)}
  async function reformatArticle(){
    const f=form();if(!f.content_ar.trim())return result('أدخل نص المقال أولاً.',false);
    const b=$('medlifeFormatArticle');b.disabled=true;b.textContent='⏳ جارٍ إعادة تنسيق المقال...';
    try{
      const d=await api({action:'full_edit',language:'ar',article:{title:f.title_ar,category:f.category,author_name:f.author_name,content:f.content_ar,excerpt:f.excerpt_ar},requirements:'Rewrite and structurally format this Arabic medical article to match the MedLife editorial style. Preserve factual meaning. Use a clear Arabic title, short introduction, descriptive H2-style section headings, short readable paragraphs, bullet lists only where useful, a practical conclusion, and a brief warning/when-to-see-doctor section when medically appropriate. Do not invent citations, diagnoses, statistics, medications, or claims. Keep medical terminology accurate and natural Arabic. Return structured fields: title, excerpt, introduction, sections[{heading,content}], conclusion, editor_notes.'}});
      const x=d.article||d.result||{};
      if(x.title)$('title_ar').value=x.title;
      if(x.excerpt)$('excerpt_ar').value=x.excerpt;
      const parts=[];if(x.introduction)parts.push(x.introduction);(x.sections||[]).forEach(s=>{if(s.heading)parts.push('## '+s.heading);if(s.content)parts.push(s.content)});if(x.conclusion)parts.push('## الخلاصة\n'+x.conclusion);
      if(parts.length)$('content_ar').value=parts.join('\n\n');
      result('✅ تمت إعادة تنسيق المقال بأسلوب MedLife. راجع النص ثم استخدم «👁️ معاينة المقالة» قبل النشر.');
      if(typeof window.__medlifeMarkDirty==='function')window.__medlifeMarkDirty();
    }catch(e){result(e.message,false)}finally{b.disabled=false;b.textContent='🤖 إعادة تنسيق المقال بأسلوب MedLife'}
  }
  async function analyzeImages(){
    const f=form();if(!f.content_ar.trim())return result('أدخل نص المقال أولاً.',false);
    const b=$('medlifeAnalyzeImages');b.disabled=true;b.textContent='⏳ جارٍ تحليل أقسام المقال...';
    try{
      const contexts=f.content_ar.split(/\n\s*\n|\n(?=#+\s|[-•]\s)/).map(x=>x.trim()).filter(Boolean).slice(0,8);
      const d=await api({action:'visual',language:'ar',article:{title:f.title_ar,category:f.category,content:f.content_ar,contexts,requirements:'For each important section, return a precise English medical search_query_en tied to the exact section. Prefer clinical photographs, anatomy diagrams, imaging, procedures, or clean educational illustrations. Avoid generic stock photos, logos, ads, branded infographics, and unrelated lifestyle photos.'}});
      const items=(d.article?.image_suggestions||d.result?.image_suggestions||[]).slice(0,6);
      const html=items.length?items.map((x,i)=>`<div style="margin-top:9px;padding:11px;border:1px solid #e5eaf1;border-radius:12px;background:#fff"><b>${esc(x.placement||'القسم '+(i+1))}</b><div style="font-size:11px;color:#64748b;margin-top:4px">${esc(x.context||x.purpose||'')}</div><div style="font-size:11px;color:#4655a6;margin-top:5px"><b>Search:</b> ${esc(x.search_query_en||x.query_en||x.prompt||'')}</div></div>`).join(''):'لم يتم إرجاع اقتراحات صور مناسبة.';
      result('🖼️ اقتراحات الصور:\n'+html.replace(/\n/g,'<br>'));
    }catch(e){result(e.message,false)}finally{b.disabled=false;b.textContent='🖼️ تحليل المقال واقتراح الصور'}
  }
  function createIllustration(){
    const f=form();if(!f.content_ar.trim())return result('أدخل نص المقال أولاً.',false);
    const safeTitle=f.title_ar.replace(/[<>&"']/g,'').slice(0,80);const context=f.content_ar.replace(/\s+/g,' ').replace(/[<>&"']/g,'').slice(0,180);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" rx="32" fill="#f7f9fc"/><rect x="55" y="45" width="1090" height="145" rx="24" fill="#12203a"/><text x="600" y="105" text-anchor="middle" font-family="Arial" font-size="32" font-weight="700" fill="#fff">${safeTitle}</text><text x="600" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#dbe4f0">${context}</text><circle cx="350" cy="430" r="125" fill="#fff" stroke="#e51f45" stroke-width="10"/><circle cx="850" cy="430" r="125" fill="#fff" stroke="#2f6bff" stroke-width="10"/><path d="M475 430h250" stroke="#64748b" stroke-width="10" stroke-linecap="round"/><text x="350" y="438" text-anchor="middle" font-family="Arial" font-size="26" fill="#12203a">المشكلة</text><text x="850" y="438" text-anchor="middle" font-family="Arial" font-size="26" fill="#12203a">التوضيح</text></svg>`;
    const field=$('content_ar');field.value += `\n\n[رسم توضيحي طبي — مرتبط بمحتوى المقال]\n${svg}\n`;msg('✅ أُضيف الرسم التوضيحي إلى المقال. افتح المعاينة لرؤيته.');
  }
  function boot(){addPanel();setTimeout(addPanel,400);setTimeout(addPanel,1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
