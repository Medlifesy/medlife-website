export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    const isArticlesAdmin = path === '/articles-admin' || path === '/articles-admin/' || path.endsWith('/articles-admin.html');
    const isArticleReader = path === '/article-reader-v5.html' || path.startsWith('/articles/');
    if (!isArticlesAdmin && !isArticleReader) return response;

    let html = await response.text();

    if (isArticleReader && !isArticlesAdmin) {
      const tag = '<script src="/article-reader-rich-content.js?v=20260828-1" defer></script>';
      if (!html.includes('/article-reader-rich-content.js')) html = html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : `${html}${tag}`;
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
      headers.set('pragma','no-cache');
      return new Response(html,{status:response.status,statusText:response.statusText,headers});
    }

    const legacySectionClasses = ['ai-studio', 'images-studio'];
    for (const className of legacySectionClasses) {
      const sectionPattern = new RegExp(`<section\\s+class=["']${className}["'][\\s\\S]*?<\\/section>`, 'gi');
      html = html.replace(sectionPattern, '');
    }

    const legacyScriptRegexMarkers = [
      'article-ai-studio\\.js',
      'article-ai-editorial-v2\\.js',
      'article-images-studio\\.js',
      'article-ai-upgrade\\.js'
    ];
    const legacyScripts = ['article-ai-studio.js','article-ai-editorial-v2.js','article-images-studio.js','article-ai-upgrade.js'];
    for (const scriptName of legacyScripts) {
      const escapedScript = scriptName.replace('.', '\\.');
      const scriptPattern = new RegExp(`<script\\s+src=["'][^"']*${escapedScript}[^"']*["'][^>]*><\\/script>`, 'gi');
      html = html.replace(scriptPattern, '');
    }
    void legacyScriptRegexMarkers;

    const addButton = '<button id="articleAddStatic" type="button" class="btn primary" style="margin-top:14px;width:100%;font-weight:900;padding:13px">➕ إضافة مقالة جديدة</button>';
    if (!html.includes('id="articleAddStatic"')) html = html.replace('<section class="hero"><h1>لوحة إدارة المقالات</h1><p>مراجعة وتحرير ونشر محتوى MedLife من مكان واحد.</p></section>', `<section class="hero"><h1>لوحة إدارة المقالات</h1><p>مراجعة وتحرير ونشر محتوى MedLife من مكان واحد.</p>${addButton}</section>`);

    const previewBar = '<div id="articlePreviewStaticBar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:14px 0;padding:14px 16px;border:1px solid #dbe4f0;border-radius:16px;background:#f7f9fc"><div><strong style="color:#12203a">👁️ المعاينة</strong><div style="font-size:11px;color:#6b778c;margin-top:2px">شاهد شكل المقال والصور كما سيظهر قبل النشر.</div></div><button id="articlePreviewStatic" type="button" class="btn primary" style="font-weight:900;padding:12px 20px">👁️ معاينة المقالة</button></div>';
    if (!html.includes('id="articlePreviewStaticBar"')) html = html.replace('<div class="editor-footer">', previewBar + '<div class="editor-footer">');

    const visualStudio = '<section id="medlifeVisualStudioStatic" class="no-storage-visual-studio" style="margin:24px 0;padding:22px;border:1px solid #dbe4f0;border-radius:22px;background:linear-gradient(135deg,#f9fbff,#fff);box-shadow:0 14px 34px rgba(18,32,58,.06)"><div><h3 style="margin:0;color:#12203a">🖼️ MedLife AI Visual Studio — بدون تخزين</h3><p style="margin:4px 0;color:#6b778c;font-size:11px">تحليل فقرات المقال العربي وبناء بحث طبي دقيق مرتبط بالسياق، بدون رفع الصور إلى GitHub.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="visualPlanStatic" class="btn primary" type="button">✨ تحليل المقال واقتراح الصور</button><button id="visualIllustrationStatic" class="btn soft" type="button">🎨 رسم توضيحي مرتبط بالمقال</button><button id="visualPreviewStatic" class="btn soft" type="button">👁️ معاينة المقالة</button></div><div id="visualPlanResult" style="margin-top:14px"></div></section>';
    if (!html.includes('id="medlifeVisualStudioStatic"')) html = html.replace('<div id="editMsg"></div>', visualStudio + '<div id="editMsg"></div>');

    const scripts = [
      '/article-management-v3.js?v=20260825-12',
      '/article-management-enhancements.js?v=20260825-3',
      '/article-format-fast-ui.js?v=20260825-3',
      '/article-reader-preview.js?v=20260828-1',
      '/article-publish-slug.js?v=20260828-1'
    ];
    function ensureScript(src) {
      const plain = src.split('?')[0];
      if (html.includes(`src="${plain}"`) || html.includes(`src='${plain}'`)) return;
      const tag = `<script src="${src}" defer></script>`;
      html = html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : `${html}${tag}`;
    }
    scripts.forEach(ensureScript);

    const bridge = `<script>(function(){function g(id){var e=document.getElementById(id);return e?e.value||'':''}function setv(id,v){var e=document.getElementById(id);if(e)e.value=v||''}function editorOn(){var e=document.getElementById('editor'),empty=document.getElementById('editorEmpty');if(empty)empty.style.display='none';if(e)e.style.display='block';['title','titleEn','category','author','excerpt','keyword'].forEach(function(id){setv(id,'')});var c=document.getElementById('content');if(c)c.innerHTML='';var state=document.getElementById('state');if(state)state.textContent='مسودة جديدة';var words=document.getElementById('words');if(words)words.textContent='0';var tables=document.getElementById('tables');if(tables)tables.textContent='0';var slug=document.getElementById('slug');if(slug)slug.textContent='—';window.__medlifeCreatingArticle=true;var title=document.getElementById('title');if(title)title.focus();return false}async function saveNew(){var body={title_ar:g('title'),title_en:g('titleEn'),category:g('category'),author_name:g('author'),author_email:'',excerpt_ar:g('excerpt'),excerpt_en:'',content_ar:(document.getElementById('content')?.innerHTML||''),content_en:'',image_url:'',status:'draft'};if(!body.title_ar.trim()||!body.content_ar.replace(/<[^>]+>/g,'').trim()||!body.author_name.trim()){var t=document.getElementById('toast');if(t){t.textContent='يرجى إدخال العنوان والكاتب ومحتوى المقال.';t.style.display='block';setTimeout(function(){t.style.display='none'},3200)}return false}try{var r=await fetch('/api/articles',{method:'POST',credentials:'include',cache:'no-store',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify(body)});var d=await r.json().catch(function(){return{}});if(!r.ok||d.success===false)throw Error(d.error||('HTTP '+r.status));window.__medlifeCreatingArticle=false;location.reload();return true}catch(e){var t=document.getElementById('toast');if(t){t.textContent=e.message;t.style.display='block';setTimeout(function(){t.style.display='none'},3200)}return false}}function wire(){var n=document.getElementById('new');if(n&&!n.dataset.medlifeNewWire){n.dataset.medlifeNewWire='1';n.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();editorOn()},true)}var s=document.getElementById('save');if(s&&!s.dataset.medlifeNewSaveWire){s.dataset.medlifeNewSaveWire='1';s.addEventListener('click',function(e){if(!window.__medlifeCreatingArticle)return;e.preventDefault();e.stopImmediatePropagation();saveNew()},true)}var a=document.getElementById('articleAddStatic');if(a)a.onclick=editorOn}wire();setTimeout(wire,300);setTimeout(wire,1000)})()</script>`;
    if (!html.includes('window.__medlifeCreatingArticle')) html = html.includes('</body>') ? html.replace('</body>', `${bridge}</body>`) : `${html}${bridge}`;

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
    headers.set('pragma','no-cache');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  } catch(error) {
    return response || new Response('Middleware error',{status:500});
  }
}
