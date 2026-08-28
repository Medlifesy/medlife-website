(function(){
  'use strict';
  if (window.__medlifePublishSlugUI) return;
  window.__medlifePublishSlugUI = true;

  const clean = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
  const title = () => String(document.getElementById('title_ar')?.value || document.getElementById('title')?.value || '').trim();
  const defaultSlug = () => clean(title()) || ('article-' + Date.now().toString(36));

  function mount(){
    const publishButton = document.getElementById('publish');
    if (!publishButton || document.getElementById('medlifePublishSlugModal')) return !!publishButton;
    const style = document.createElement('style');
    style.id = 'medlife-publish-slug-style';
    style.textContent = `#medlifePublishSlugModal{display:none;position:fixed;inset:0;z-index:99999;background:rgba(8,18,40,.68);align-items:center;justify-content:center;padding:18px}#medlifePublishSlugModal.on{display:flex}#medlifePublishSlugBox{width:min(620px,100%);background:#fff;border-radius:22px;padding:24px;box-shadow:0 24px 70px rgba(0,0,0,.25);font-family:Cairo,Arial,sans-serif;direction:rtl}#medlifePublishSlugBox h2{margin:0 0 7px;color:#10233f;font-size:22px}#medlifePublishSlugBox p{margin:0 0 15px;color:#667085;font-size:12px;line-height:1.9}#medlifePublishSlugPreview{display:flex;align-items:center;gap:4px;background:#f7f9fc;border:1px solid #e2e8f0;border-radius:12px;padding:11px 13px;margin-bottom:10px;color:#667085;font-size:12px;direction:ltr;text-align:left;overflow:auto}#medlifePublishSlugPreview strong{color:#10233f}#medlifePublishSlugBox label{display:block;font-size:11px;font-weight:900;color:#10233f;margin:12px 0 6px}#medlifePublishSlug{width:100%;box-sizing:border-box;border:1px solid #d8e0ea;border-radius:12px;padding:12px 13px;font:700 13px Cairo,Arial,sans-serif;outline:none;direction:ltr;text-align:left}#medlifePublishSlug:focus{border-color:#2457c5;box-shadow:0 0 0 3px rgba(36,87,197,.1)}#medlifePublishSlugHelp{margin-top:7px;font-size:10px;color:#667085;line-height:1.7}#medlifePublishSlugStatus{min-height:18px;margin-top:8px;font-size:10px;font-weight:800}#medlifePublishSlugActions{display:flex;gap:8px;justify-content:flex-start;margin-top:18px;flex-wrap:wrap}#medlifePublishSlugActions button{border:1px solid #e2e8f0;background:#fff;color:#10233f;border-radius:11px;padding:10px 14px;font:800 11px Cairo,Arial,sans-serif;cursor:pointer}#medlifePublishSlugActions .primary{background:#087f5b;border-color:#087f5b;color:#fff}`;
    document.head.appendChild(style);
    const modal = document.createElement('div');
    modal.id = 'medlifePublishSlugModal';
    modal.innerHTML = `<div id="medlifePublishSlugBox" role="dialog" aria-modal="true" aria-labelledby="medlifePublishSlugTitle"><h2 id="medlifePublishSlugTitle">🚀 نشر المقالة</h2><p>كل مقالة منشورة في MedLife لها رابط دائم وفريد. اكتب الاسم الذي تريده، أو اتركه فارغاً ليتم توليده تلقائياً من عنوان المقال.</p><div id="medlifePublishSlugPreview"><span>https://medlifesy.org/articles/</span><strong>—</strong></div><label for="medlifePublishSlug">اسم الرابط (Slug)</label><input id="medlifePublishSlug" autocomplete="off" placeholder="مثال: family-planning"><div id="medlifePublishSlugHelp">سيتم تنظيف الاسم تلقائياً. إذا كان مستخدماً مسبقاً، سيقوم الخادم بإضافة رمز فريد مع الحفاظ على الرابط الدائم.</div><div id="medlifePublishSlugStatus"></div><div id="medlifePublishSlugActions"><button type="button" id="medlifePublishSlugCancel">إلغاء</button><button type="button" class="primary" id="medlifePublishSlugConfirm">🚀 نشر بالمسمى المحدد</button></div></div>`;
    document.body.appendChild(modal);
    const input = document.getElementById('medlifePublishSlug');
    const preview = document.querySelector('#medlifePublishSlugPreview strong');
    const status = document.getElementById('medlifePublishSlugStatus');
    const close = () => { modal.classList.remove('on'); modal.setAttribute('aria-hidden','true'); };
    const refresh = () => { const slug = clean(input.value) || defaultSlug(); preview.textContent = slug; status.textContent = input.value.trim() ? 'سيتم تثبيت هذا الاسم كرابط المقالة.' : 'سيتم إنشاء الرابط تلقائياً من عنوان المقال.'; status.style.color = '#667085'; };
    input.addEventListener('input', refresh);
    document.getElementById('medlifePublishSlugCancel').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('on')) close(); });
    publishButton.addEventListener('click', e => { if (window.__medlifePublishSlugConfirmed) { window.__medlifePublishSlugConfirmed = false; return; } e.preventDefault(); e.stopImmediatePropagation(); input.value = ''; refresh(); modal.classList.add('on'); modal.setAttribute('aria-hidden','false'); setTimeout(() => input.focus(), 30); }, true);
    document.getElementById('medlifePublishSlugConfirm').onclick = () => { const slug = clean(input.value) || defaultSlug(); window.__medlifePublishSlug = slug; window.__medlifePublishSlugConfirmed = true; close(); publishButton.click(); };
    refresh();
    return true;
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = function(resource, options){
    const slug = window.__medlifePublishSlug;
    if (!slug || !options || !options.body) return nativeFetch(resource, options);
    try {
      const method = String(options.method || 'GET').toUpperCase();
      if (!['POST','PUT','PATCH'].includes(method)) return nativeFetch(resource, options);
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : null;
      if (!body || body.status !== 'published') return nativeFetch(resource, options);
      body.slug = slug;
      window.__medlifePublishSlug = null;
      const request = nativeFetch(resource, {...options,body:JSON.stringify(body),headers:{...(options.headers||{}),'Content-Type':'application/json'}});
      if (method !== 'PATCH') return request;
      return request.then(async response => {
        try {
          const clone = response.clone();
          const data = await clone.json();
          const article = data && data.id ? data : (data && data.article && data.article.id ? data.article : null);
          if (article && article.id && article.slug !== slug) {
            const fixed = {...article,slug};
            await nativeFetch('/articles/' + encodeURIComponent(article.id), {method:'PUT',credentials:'include',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(fixed)});
          }
        } catch (_) {}
        return response;
      });
    } catch (_) { return nativeFetch(resource, options); }
  };

  if (!mount()) {
    const observer = new MutationObserver(() => { if (mount()) observer.disconnect(); });
    observer.observe(document.documentElement, {childList:true,subtree:true});
    setTimeout(() => observer.disconnect(), 15000);
  }
})();
