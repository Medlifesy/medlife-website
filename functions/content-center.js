export async function onRequest(context) {
  const target = new URL('/content-center.html', context.request.url);
  target.search = '';

  const response = await context.env.ASSETS.fetch(new Request(target.toString(), {
    method: 'GET',
    headers: { 'Accept': 'text/html' }
  }));

  if (!response.ok) return response;

  let html = await response.text();
  const writerScript = `<script>(async function(){
try{
 const identity=await fetch('/api/content-center?action=me',{credentials:'include',cache:'no-store'}).then(r=>r.ok?r.json():null);
 if(!identity||!identity.authenticated)return;
 const role=identity.identity?.role||'';
 if(!['مسؤول خلية','مشرف خلية'].includes(role))return;
 const cell=identity.identity?.cell||'';
 const field=document.getElementById('postAuthor');
 if(field){
  const select=document.createElement('select');
  select.id='postAuthor';select.name='postAuthor';select.className=field.className;select.required=true;
  select.innerHTML='<option value="">جاري تحميل كتّاب المحتوى...</option>';
  field.replaceWith(select);
  const r=await fetch('/api/content-center-writers'+(cell?'?cell='+encodeURIComponent(cell):''),{credentials:'include',cache:'no-store'});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.success)throw new Error(d.error||'تعذر تحميل القائمة');
  select.innerHTML='<option value="">اختر كاتب المحتوى</option>'+(d.writers||[]).map(w=>'<option value="'+String(w.name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')+'">'+String(w.name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')+'</option>').join('');
 }
 const title=document.getElementById('postTitle');
 const create=document.getElementById('createPost');
 const box=document.getElementById('createError');
 const priority=document.getElementById('postPriority');
 const body=document.getElementById('postBody');
 if(!title||!create)return;
 create.addEventListener('click',async function(ev){
  ev.preventDefault();ev.stopImmediatePropagation();
  if(create.dataset.busy==='1')return;
  const value=title.value.trim();
  const author=(document.getElementById('postAuthor')?.value||'').trim();
  if(!value){if(box){box.textContent='يرجى إدخال عنوان المنشور.';box.style.display='block';}return;}
  if(!author){if(box){box.textContent='يرجى اختيار كاتب المحتوى.';box.style.display='block';}return;}
  create.dataset.busy='1';create.disabled=true;create.textContent='جارٍ الحفظ...';
  try{
   const sr=await fetch('/api/content-center-similarity?title='+encodeURIComponent(value),{credentials:'include',cache:'no-store'});
   const sd=await sr.json().catch(()=>({}));
   if(!sr.ok||!sd.success)throw new Error(sd.error||'تعذر فحص تشابه المحتوى');
   if(sd.level==='high'||sd.level==='possible'){
    const lines=(sd.matches||[]).map(x=>'• '+x.cell+(x.score>=80?' — تشابه مرتفع':' — تشابه محتمل')).join('\n');
    const text=(sd.level==='high'?'⚠️ يوجد تشابه مرتفع مع محتوى مسجل لدى خلية أخرى.':'⚠️ توجد فكرة مشابهة مسجلة لدى خلية أخرى.')+'\n\n'+lines+'\n\nهل تريد المتابعة رغم التنبيه؟';
    if(!window.confirm(text)){create.dataset.busy='0';create.disabled=false;create.textContent='حفظ وإرسال للتنسيق';return;}
   }
   const cr=await fetch('/api/content-center?action=create',{method:'POST',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({title:value,author,priority:priority?.value||'متوسطة',body:body?.value||''})});
   const cd=await cr.json().catch(()=>({}));
   if(!cr.ok||!cd.success)throw new Error(cd.error||'تعذر حفظ المنشور');
   if(typeof closeCreate==='function')closeCreate();
   if(typeof msg==='function')msg('createError','');
   if(typeof load==='function')await load();else location.reload();
  }catch(e){
   if(box){box.textContent=e.message||'تعذر حفظ المنشور';box.style.display='block';}
  }finally{
   create.dataset.busy='0';create.disabled=false;create.textContent='حفظ وإرسال للتنسيق';
  }
 },true);
}catch(e){const s=document.getElementById('postAuthor');if(s&&s.tagName==='SELECT'){s.innerHTML='<option value="">تعذر تحميل القائمة</option>';s.disabled=true}console.error('Content Center:',e)}})();</script>`;
  html = html.includes('</body>') ? html.replace('</body>', writerScript + '</body>') : html + writerScript;

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('pragma', 'no-cache');
  headers.delete('content-length');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}