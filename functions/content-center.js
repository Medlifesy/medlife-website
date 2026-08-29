export async function onRequest(context) {
  const target = new URL('/content-center.html', context.request.url);
  target.search = '';

  const response = await context.env.ASSETS.fetch(new Request(target.toString(), {
    method: 'GET',
    headers: { 'Accept': 'text/html' }
  }));

  if (!response.ok) return response;

  let html = await response.text();
  const writerScript = `<script>(async function(){\ntry{\n const identity=await fetch('/api/content-center?action=me',{credentials:'include',cache:'no-store'}).then(r=>r.ok?r.json():null);\n if(!identity||!identity.authenticated)return;\n const role=identity.identity?.role||'';\n if(!['مسؤول خلية','مشرف خلية'].includes(role))return;\n const cell=identity.identity?.cell||'';\n const field=document.getElementById('postAuthor');\n if(!field)return;\n const select=document.createElement('select');\n select.id='postAuthor';select.name='postAuthor';select.className=field.className;select.required=true;\n select.innerHTML='<option value="">جاري تحميل كتّاب المحتوى...</option>';\n field.replaceWith(select);\n const r=await fetch('/api/content-center-writers'+(cell?'?cell='+encodeURIComponent(cell):''),{credentials:'include',cache:'no-store'});\n const d=await r.json().catch(()=>({}));\n if(!r.ok||!d.success)throw new Error(d.error||'تعذر تحميل القائمة');\n select.innerHTML='<option value="">اختر كاتب المحتوى</option>'+(d.writers||[]).map(w=>'<option value="'+String(w.name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')+'">'+String(w.name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')+'</option>').join('');\n}catch(e){const s=document.getElementById('postAuthor');if(s&&s.tagName==='SELECT'){s.innerHTML='<option value="">تعذر تحميل القائمة</option>';s.disabled=true;console.error('Content Center writers:',e)}}\n})();</script>`;
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
