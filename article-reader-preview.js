(()=>{
  'use strict';
  const get=(...ids)=>ids.map(id=>document.getElementById(id)).find(Boolean);
  const val=(...ids)=>{const e=get(...ids);return e?(e.value??e.textContent??''):''};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const sanitize=html=>{
    const doc=new DOMParser().parseFromString(String(html||''),'text/html');
    doc.querySelectorAll('script,style,iframe,object,embed,form,link,meta').forEach(e=>e.remove());
    doc.querySelectorAll('*').forEach(el=>{
      [...el.attributes].forEach(a=>{
        const n=a.name.toLowerCase(),v=a.value||'';
        if(n.startsWith('on')||n==='srcdoc'||(n==='href'&&/^\s*javascript:/i.test(v))||(n==='src'&&/^\s*javascript:/i.test(v))) el.removeAttribute(a.name);
      });
      if(el.tagName==='A') { el.setAttribute('target','_blank'); el.setAttribute('rel','noopener noreferrer'); }
      if(el.tagName==='IMG') { el.setAttribute('loading','lazy'); el.removeAttribute('width'); el.removeAttribute('height'); }
    });
    return doc.body.innerHTML;
  };
  const slug=s=>String(s||'section').normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'').slice(0,80);
  const buildToc=container=>{
    const heads=[...container.querySelectorAll('h2,h3')];
    const used=new Set();
    heads.forEach((h,i)=>{let id=h.id||slug(h.textContent)||`section-${i+1}`,base=id,n=2;while(used.has(id)){id=`${base}-${n++}`}used.add(id);h.id=id;});
    return heads.map((h,i)=>({id:h.id,title:h.textContent.trim(),level:h.tagName==='H3'?3:2}));
  };
  const styles=`
    #medlifeSitePreview{position:fixed;inset:0;z-index:100000;background:rgba(9,18,32,.76);padding:16px;overflow:auto;font-family:Cairo,Arial,sans-serif;color:#263247}
    #medlifeSitePreview *{box-sizing:border-box}
    #medlifeSitePreview .ms-shell{width:min(1180px,100%);margin:auto;background:#f7f9fc;border-radius:22px;overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,.3)}
    #medlifeSitePreview .ms-top{position:sticky;top:0;z-index:5;background:rgba(255,255,255,.97);backdrop-filter:blur(10px);border-bottom:1px solid #e4e9f0;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    #medlifeSitePreview .ms-brand{display:flex;align-items:center;gap:10px}.ms-brand img{height:40px;width:auto}.ms-back{border:0;background:#fff;color:#ff2a54;font-weight:900;cursor:pointer;padding:9px 12px;border-radius:10px}.ms-back:hover{background:#fff0f3}
    #medlifeSitePreview .ms-hero{padding:46px 24px 36px;text-align:center;background:radial-gradient(circle at 90% 10%,rgba(255,42,84,.10),transparent 30%),linear-gradient(135deg,#fff,#fafbfd)}
    #medlifeSitePreview .ms-hero-inner{max-width:920px;margin:auto}.ms-tag{color:#ff2a54;font-size:12px;font-weight:900}.ms-hero h1{font-size:clamp(30px,5vw,52px);line-height:1.35;color:#151d36;margin:10px 0 14px}.ms-excerpt{max-width:820px;margin:auto;color:#6b778c;font-size:15px}.ms-meta{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:14px;color:#7b8794;font-size:11px}
    #medlifeSitePreview .ms-main{padding:20px}.ms-layout{display:grid;grid-template-columns:260px minmax(0,1fr);gap:22px;align-items:start}.ms-side{position:sticky;top:78px;background:#fff;border:1px solid #e4e9f0;border-radius:16px;padding:15px;box-shadow:0 10px 25px rgba(21,29,54,.05)}.ms-side h3{margin:0 0 10px;color:#151d36;font-size:17px}.ms-toc a{display:block;padding:7px 8px;border-radius:8px;color:#6b778c;text-decoration:none;font-size:11px;font-weight:700}.ms-toc a:hover{background:#fff0f3;color:#ff2a54}.ms-toc a.h3{padding-right:18px;font-weight:600}
    #medlifeSitePreview .ms-article{background:#fff;border:1px solid #e4e9f0;border-radius:20px;overflow:hidden;box-shadow:0 14px 34px rgba(21,29,54,.07)}.ms-head{padding:12px 18px;background:#fcfdff;border-bottom:1px solid #e4e9f0;color:#6b778c;font-size:11px}.ms-body{padding:clamp(22px,5vw,56px);line-height:2.05}.ms-body .ms-intro{background:#eef4ff;border:1px solid #d8e6ff;border-radius:14px;padding:17px 18px;margin-bottom:25px}.ms-body h2{color:#151d36;font-size:26px;line-height:1.45;margin:38px 0 15px;padding-right:12px;border-right:4px solid #ff2a54}.ms-body h3{color:#151d36;font-size:20px;margin:25px 0 10px}.ms-body p{font-size:16px;line-height:2.12;margin:0 0 16px}.ms-body ul,.ms-body ol{padding-right:25px;margin:7px 0 22px}.ms-body li{margin-bottom:7px}.ms-body img{display:block;max-width:100%;height:auto;margin:22px auto;border-radius:15px;border:1px solid #e4e9f0}.ms-body blockquote{margin:22px 0;padding:15px 17px;border-right:4px solid #ff2a54;background:#fff0f3;border-radius:12px}.ms-body table{width:100%;min-width:600px;border-collapse:collapse;font-size:13px}.ms-body .table-wrap,.ms-body .tableWrap{overflow:auto;margin:22px 0;border:1px solid #e4e9f0;border-radius:12px}.ms-body th{background:#151d36;color:#fff;padding:11px;text-align:right}.ms-body td{padding:11px;border-bottom:1px solid #e4e9f0;vertical-align:top}.ms-body tr:nth-child(even) td{background:#fbfcfe}.ms-body hr{border:0;border-top:1px solid #e4e9f0;margin:30px 0}.ms-foot{padding:20px;text-align:center;color:#6b778c;font-size:10px;border-top:1px solid #e4e9f0}
    @media(max-width:800px){#medlifeSitePreview{padding:0}.ms-layout{grid-template-columns:1fr}.ms-side{position:static}.ms-toc{display:grid;grid-template-columns:1fr 1fr;gap:2px}.ms-body{padding:22px 16px}.ms-body p{font-size:15px}.ms-hero h1{font-size:30px}}@media(max-width:520px){.ms-toc{grid-template-columns:1fr}.ms-top{padding:10px 12px}.ms-brand img{height:34px}}
  `;
  function preview(){
    document.getElementById('medlifeSitePreview')?.remove();
    const title=val('title','title_ar')||'مقال MedLife';
    const author=val('author','author_name')||'MedLife';
    const category=val('category')||'مقال طبي';
    const excerpt=val('excerpt','excerpt_ar');
    const source=get('content','content_ar');
    const raw=source?(source.innerHTML||''):'';
    const wrapper=document.createElement('div');
    wrapper.innerHTML=sanitize(raw);
    wrapper.querySelectorAll('.toc').forEach(e=>e.remove());
    wrapper.querySelectorAll('table').forEach(t=>{if(!t.parentElement.classList.contains('table-wrap')&&!t.parentElement.classList.contains('tableWrap')){const w=document.createElement('div');w.className='table-wrap';t.parentNode.insertBefore(w,t);w.appendChild(t)}});
    const toc=buildToc(wrapper);
    const tocHtml=toc.length?toc.map((h,i)=>`<a class="${h.level===3?'h3':''}" href="#${h.id}">${String(i+1).padStart(2,'0')} · ${esc(h.title)}</a>`).join(''):'<span style="font-size:11px;color:#6b778c">لا توجد عناوين H2/H3 بعد.</span>';
    const modal=document.createElement('div');modal.id='medlifeSitePreview';
    modal.innerHTML=`<style>${styles}</style><div class="ms-shell"><div class="ms-top"><div class="ms-brand"><img src="/logo.PNG" alt="MedLife"><strong style="color:#151d36">معاينة الموقع الحقيقي</strong></div><button class="ms-back" id="msClose">إغلاق المعاينة ✕</button></div><section class="ms-hero"><div class="ms-hero-inner"><div class="ms-tag">♥ MedLife Knowledge · معاينة قبل النشر</div><h1>${esc(title)}</h1>${excerpt?`<p class="ms-excerpt">${esc(excerpt)}</p>`:''}<div class="ms-meta"><span>✍️ ${esc(author)}</span><span>📚 ${esc(category)}</span><span>👁️ شكل مطابق للقارئ المنشور</span></div></div></section><main class="ms-main"><div class="ms-layout"><aside class="ms-side"><div style="font-size:10px;color:#ff2a54;font-weight:900;margin-bottom:4px">MEDLIFE KNOWLEDGE</div><h3>📚 فهرس المقال</h3><nav class="ms-toc">${tocHtml}</nav></aside><article class="ms-article"><div class="ms-head">مقالة طبية تثقيفية · معاينة قبل النشر</div><div class="ms-body">${excerpt?`<div class="ms-intro"><strong>مقدمة:</strong> ${esc(excerpt)}</div>`:''}${wrapper.innerHTML||'<p>لا يوجد محتوى بعد.</p>'}</div></article></div></main><div class="ms-foot">MedLife Syria — الشكل المتوقع للمقال بعد النشر</div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#msClose').onclick=()=>modal.remove();
    modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
    modal.querySelectorAll('.ms-toc a').forEach(a=>a.onclick=e=>{e.preventDefault();modal.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth',block:'start'})});
  }
  window.__medlifePreview=preview;
  const wire=()=>{['preview','previewSide','articlePreviewStatic','visualPreviewStatic'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.dataset.msPreviewBound){e.dataset.msPreviewBound='1';e.addEventListener('click',e2=>{e2.preventDefault();e2.stopImmediatePropagation();preview()},true)}})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{wire();setTimeout(wire,300);setTimeout(wire,1000)});else{wire();setTimeout(wire,300);setTimeout(wire,1000)}
})();
