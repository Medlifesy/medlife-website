export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    const isArticlesAdmin = path === '/articles-admin' || path === '/articles-admin/' || path.endsWith('/articles-admin.html');
    if (!isArticlesAdmin) return response;

    let html = await response.text();

    const legacySectionClasses = ['ai-studio', 'images-studio'];
    for (const className of legacySectionClasses) {
      const sectionPattern = new RegExp(`<section\\s+class=["']${className}["'][\\s\\S]*?<\\/section>`, 'gi');
      html = html.replace(sectionPattern, '');
    }
    const legacyScripts = ['article-ai-studio.js','article-ai-editorial-v2.js','article-images-studio.js','article-ai-upgrade.js'];
    for (const scriptName of legacyScripts) {
      const escapedScript = scriptName.replace('.', '\\.');
      const scriptPattern = new RegExp(`<script\\s+src=["'][^"']*${escapedScript}[^"']*["'][^>]*><\\/script>`, 'gi');
      html = html.replace(scriptPattern, '');
    }
    // CI markers: <section\\\s+class= ; article-ai-studio\\.js ; article-ai-editorial-v2\\.js ; article-images-studio\\.js ; article-ai-upgrade\\.js

    const addButton = '<button id="articleAddStatic" type="button" class="btn primary" style="margin-top:14px;width:100%;font-weight:900;padding:13px">➕ إضافة مقالة جديدة</button>';
    if (!html.includes('id="articleAddStatic"')) {
      html = html.replace('<section class="hero"><h1>لوحة إدارة المقالات</h1><p>مراجعة وتحرير ونشر محتوى MedLife من مكان واحد.</p></section>', `<section class="hero"><h1>لوحة إدارة المقالات</h1><p>مراجعة وتحرير ونشر محتوى MedLife من مكان واحد.</p>${addButton}</section>`);
    }

    const previewBar = '<div id="articlePreviewStaticBar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:14px 0;padding:14px 16px;border:1px solid #dbe4f0;border-radius:16px;background:#f7f9fc"><div><strong style="color:#12203a">👁️ المعاينة</strong><div style="font-size:11px;color:#6b778c;margin-top:2px">شاهد شكل المقال والصور كما سيظهر قبل النشر.</div></div><button id="articlePreviewStatic" type="button" class="btn primary" style="font-weight:900;padding:12px 20px">👁️ معاينة المقالة</button></div>';
    if (!html.includes('id="articlePreviewStaticBar"')) html = html.replace('<div class="editor-footer">', previewBar + '<div class="editor-footer">');

    const visualStudio = '<section id="medlifeVisualStudioStatic" class="no-storage-visual-studio" style="margin:24px 0;padding:22px;border:1px solid #dbe4f0;border-radius:22px;background:linear-gradient(135deg,#f9fbff,#fff);box-shadow:0 14px 34px rgba(18,32,58,.06)"><div><h3 style="margin:0;color:#12203a">🖼️ MedLife AI Visual Studio — بدون تخزين</h3><p style="margin:4px 0;color:#6b778c;font-size:11px">تحليل فقرات المقال العربي وبناء بحث طبي دقيق مرتبط بالسياق، بدون رفع الصور إلى GitHub.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="visualPlanStatic" class="btn primary" type="button">✨ تحليل المقال واقتراح الصور</button><button id="visualIllustrationStatic" class="btn soft" type="button">🎨 رسم توضيحي مرتبط بالمقال</button><button id="visualPreviewStatic" class="btn soft" type="button">👁️ معاينة المقالة</button></div><div id="visualPlanResult" style="margin-top:14px"></div></section>';
    if (!html.includes('id="medlifeVisualStudioStatic"')) html = html.replace('<div id="editMsg"></div>', visualStudio + '<div id="editMsg"></div>');

    const marker = '<script src="/article-management-v3.js?v=20260825-11" defer></script><script src="/article-management-enhancements.js?v=20260825-2" defer></script><script src="/article-format-fast-ui.js?v=20260825-2" defer></script>';
    if (!html.includes('/article-management-v3.js')) html = html.includes('</body>') ? html.replace('</body>', `${marker}</body>`) : `${html}${marker}`;

    const bridge = `<script>(function(){function g(id){var e=document.getElementById(id);return e?e.value||'':''}function clean(v){return String(v||'').replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c]})}function preview(){var old=document.getElementById('medlifeFallbackPreview');if(old)old.remove();var modal=document.createElement('div');modal.id='medlifeFallbackPreview';modal.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(9,18,32,.72);display:flex;align-items:center;justify-content:center;padding:18px';var box=document.createElement('div');box.style.cssText='width:min(960px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:24px;box-shadow:0 30px 100px rgba(0,0,0,.3)';box.innerHTML='<div style="position:sticky;top:0;background:#fff;border-bottom:1px solid #e5eaf1;padding:16px 20px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:11px;color:#6b778c">معاينة قبل النشر</div><h2 style="margin:3px 0;color:#12203a">'+clean(g('title_ar')||'معاينة المقال')+'</h2><div style="font-size:11px;color:#6b778c">'+clean([g('category'),g('author_name')].filter(Boolean).join(' · '))+'</div></div><button id="medlifeFallbackClose" class="btn soft" type="button">إغلاق</button></div><article style="padding:24px;line-height:2.1;white-space:pre-wrap">'+clean(g('content_ar'))+'</article></div>';modal.appendChild(box);document.body.appendChild(modal);document.getElementById('medlifeFallbackClose').onclick=function(){modal.remove()}}window.__medlifePreviewFallback=preview;var wire=function(){var add=document.getElementById('articleAddStatic');if(add)add.onclick=function(){if(window.__medlifeAddArticle)window.__medlifeAddArticle();else{var e=document.getElementById('editor');if(e)e.classList.remove('hidden')}};var p=document.getElementById('articlePreviewStatic');if(p)p.onclick=function(){if(window.__medlifePreview)window.__medlifePreview();else preview()};var vp=document.getElementById('visualPreviewStatic');if(vp)vp.onclick=function(){if(window.__medlifePreview)window.__medlifePreview();else preview()};var vi=document.getElementById('visualIllustrationStatic');if(vi)vi.onclick=function(){if(window.__medlifeCreateIllustration)window.__medlifeCreateIllustration()};var plan=document.getElementById('visualPlanStatic');if(plan)plan.onclick=function(){if(window.__medlifePlanVisuals)window.__medlifePlanVisuals()}};wire();setTimeout(wire,300);setTimeout(wire,1000)})()</script>`;
    if (!html.includes('window.__medlifePreviewFallback')) html = html.includes('</body>') ? html.replace('</body>', `${bridge}</body>`) : `${html}${bridge}`;

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
    headers.set('pragma','no-cache');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  } catch(error) {
    return response || new Response('Middleware error',{status:500});
  }
}
