(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const panel = document.getElementById('editorPanel');
    const grid = panel?.querySelector('.grid');
    if (!panel || !grid || document.getElementById('publicPathField')) return;

    const field = document.createElement('div');
    field.id = 'publicPathField';
    field.className = 'field full';
    field.innerHTML = `
      <label>الرابط الدائم للمقال</label>
      <input id="canonicalPath" type="text" readonly dir="ltr" placeholder="سيتم إنشاؤه تلقائيًا عند حفظ المقال">
      <div class="hint" id="canonicalPathHint">هذا المسار فريد للمقال ولا يعتمد على الـSlug العربي أو رقم المقال الداخلي.</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:7px">
        <a id="canonicalOpen" class="btn light" href="#" target="_blank" rel="noopener" style="display:none">فتح الرابط</a>
        <button id="canonicalCopy" type="button" class="btn" style="display:none">نسخ الرابط</button>
      </div>`;

    const titleField = document.getElementById('title_ar')?.closest('.field');
    if (titleField) titleField.parentNode.insertBefore(field, titleField.nextElementSibling || null);
    else grid.prepend(field);

    const pathInput = document.getElementById('canonicalPath');
    const openBtn = document.getElementById('canonicalOpen');
    const copyBtn = document.getElementById('canonicalCopy');
    const title = document.getElementById('title_ar');

    let articles = [];
    let activePath = '';
    let lastTitle = '';

    const fullUrl = (value) => value ? new URL(`/articles/${encodeURIComponent(String(value).replace(/^\/articles\//,''))}`, location.origin).href : '';

    const render = (value) => {
      activePath = String(value || '').trim();
      if (pathInput) pathInput.value = activePath ? `/articles/${activePath.replace(/^\/articles\//,'')}` : '';
      const url = fullUrl(activePath);
      if (openBtn) {
        openBtn.style.display = url ? '' : 'none';
        openBtn.href = url || '#';
      }
      if (copyBtn) copyBtn.style.display = url ? '' : 'none';
    };

    const syncFromTitle = () => {
      const value = String(title?.value || '').trim();
      if (!value || value === lastTitle) return;
      lastTitle = value;
      const match = articles.find((article) => String(article?.title_ar || '').trim() === value);
      render(match?.canonical_path || '');
    };

    const load = async () => {
      try {
        const response = await fetch('/api/articles', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        articles = Array.isArray(data?.articles) ? data.articles : [];
        lastTitle = '';
        syncFromTitle();
      } catch (_) {}
    };

    title?.addEventListener('input', () => {
      lastTitle = '';
      syncFromTitle();
    });

    copyBtn?.addEventListener('click', async () => {
      const url = fullUrl(activePath);
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'تم النسخ';
        setTimeout(() => { copyBtn.textContent = 'نسخ الرابط'; }, 1200);
      } catch (_) {}
    });

    const observer = new MutationObserver(() => {
      syncFromTitle();
      field.style.display = panel.classList.contains('hidden') ? 'none' : '';
    });
    observer.observe(panel, { attributes: true, childList: true, subtree: true });

    const oldFetch = window.fetch;
    if (!oldFetch.__medlifeCanonicalWrapped) {
      const wrappedFetch = async (...args) => {
        const response = await oldFetch(...args);
        try {
          const input = args[0];
          const url = typeof input === 'string' ? input : input?.url || '';
          if (String(url).includes('/api/articles')) {
            response.clone().json().then((data) => {
              if (Array.isArray(data?.articles)) {
                articles = data.articles;
                lastTitle = '';
                setTimeout(syncFromTitle, 50);
              }
            }).catch(() => {});
          }
        } catch (_) {}
        return response;
      };
      wrappedFetch.__medlifeCanonicalWrapped = true;
      window.fetch = wrappedFetch;
    }

    render('');
    load();
  });
})();
