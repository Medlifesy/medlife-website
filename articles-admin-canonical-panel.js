(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const panel = document.getElementById('editorPanel');
    const grid = panel?.querySelector('.grid');
    if (!panel || !grid) return;

    if (!document.getElementById('publicPathField')) {
      const field = document.createElement('div');
      field.id = 'publicPathField';
      field.className = 'field full';
      field.innerHTML = `
        <label>الرابط الدائم للمقال</label>
        <input id="canonicalPath" type="text" readonly dir="ltr" placeholder="سيتم إنشاؤه تلقائيًا عند الحفظ">
        <div class="hint" id="canonicalPathHint">هذا المسار فريد للمقال ولا يعتمد على الـSlug العربي أو رقم المقال الداخلي.</div>
        <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:7px">
          <a id="canonicalOpen" class="btn light" href="#" target="_blank" rel="noopener" style="display:none">فتح الرابط</a>
          <button id="canonicalCopy" type="button" class="btn" style="display:none">نسخ الرابط</button>
        </div>`;

      const titleField = document.getElementById('title_ar')?.closest('.field');
      if (titleField) titleField.parentNode.insertBefore(field, titleField.nextElementSibling || null);
      else grid.prepend(field);
    }

    const pathInput = document.getElementById('canonicalPath');
    const openBtn = document.getElementById('canonicalOpen');
    const copyBtn = document.getElementById('canonicalCopy');
    const list = document.getElementById('articleList');
    const sideContent = document.getElementById('sideContent');
    let articles = [];
    let activePath = '';
    let lastSyncedId = null;
    let busyRedirect = false;

    const normalizePath = (value) => {
      let path = String(value || '').trim();
      path = path.replace(/^https?:\/\/[^/]+/i, '');
      path = path.replace(/^\/+/, '');
      path = path.replace(/^articles\//i, '');
      return path;
    };

    const articleUrl = (value) => {
      const path = normalizePath(value);
      return path ? new URL(`/articles/${encodeURIComponent(path)}`, location.origin).href : '';
    };

    const selectedId = () => {
      const item = list?.querySelector('.article-item.active');
      const id = Number(item?.dataset?.id || '');
      return Number.isInteger(id) && id > 0 ? id : null;
    };

    const currentId = () => {
      const id = Number(window.state?.current?.id || '');
      if (Number.isInteger(id) && id > 0) return id;
      const value = Number(panel.dataset.articleId || '');
      return Number.isInteger(value) && value > 0 ? value : selectedId();
    };

    const render = (value) => {
      activePath = normalizePath(value);
      const displayPath = activePath ? `/articles/${activePath}` : '';
      const url = articleUrl(activePath);
      if (pathInput) pathInput.value = displayPath;
      if (openBtn) {
        openBtn.style.display = url ? '' : 'none';
        openBtn.href = url || '#';
      }
      if (copyBtn) copyBtn.style.display = url ? '' : 'none';

      const canonicalBlocks = document.querySelectorAll('#sideContent .canonical');
      canonicalBlocks.forEach((block) => {
        block.textContent = displayPath || 'سيظهر بعد حفظ المقال.';
      });
    };

    const applyArticle = (article) => {
      if (!article) {
        render('');
        panel.dataset.articleId = '';
        lastSyncedId = null;
        return;
      }
      const id = Number(article.id);
      if (Number.isInteger(id) && id > 0) panel.dataset.articleId = String(id);
      render(article.canonical_path || '');
      lastSyncedId = id || null;
    };

    const syncFromSelection = async () => {
      const id = selectedId() || currentId();
      if (!id) {
        const isNew = !panel.classList.contains('hidden') && !document.querySelector('#articleList .article-item.active');
        if (isNew) applyArticle(null);
        return;
      }

      let article = articles.find((item) => Number(item?.id) === id);
      if (!article?.canonical_path) {
        try {
          const response = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, { cache: 'no-store', credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            article = data?.article || article;
          }
        } catch (_) {}
      }
      applyArticle(article || null);
    };

    const loadArticles = async () => {
      try {
        const response = await fetch('/api/articles', { cache: 'no-store', credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data?.articles)) {
          articles = data.articles;
          await syncFromSelection();
        }
      } catch (_) {}
    };

    const sync = () => {
      if (panel.classList.contains('hidden')) {
        const field = document.getElementById('publicPathField');
        if (field) field.style.display = 'none';
        return;
      }
      const field = document.getElementById('publicPathField');
      if (field) field.style.display = '';
      const id = selectedId() || currentId();
      if (id && id !== lastSyncedId) {
        syncFromSelection();
      } else if (!id && lastSyncedId !== null) {
        applyArticle(null);
      }
    };

    const publishDirect = async (event) => {
      if (busyRedirect) return;
      if (typeof window.save !== 'function') return;
      const publishButton = event.currentTarget;
      busyRedirect = true;
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        publishButton.disabled = true;
        await window.save('publish');

        const id = Number(window.state?.current?.id || publishButton.dataset.articleId || selectedId() || '');
        let canonical = '';

        if (Number.isInteger(id) && id > 0) {
          try {
            const response = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, { cache: 'no-store', credentials: 'include' });
            if (response.ok) {
              const data = await response.json();
              canonical = normalizePath(data?.article?.canonical_path || '');
              if (canonical) {
                articles = Array.isArray(articles) ? articles : [];
                const index = articles.findIndex((item) => Number(item?.id) === id);
                if (index >= 0) articles[index] = data.article;
                else articles.push(data.article);
              }
            }
          } catch (_) {}
        }

        if (!canonical) canonical = normalizePath(activePath);
        if (!canonical) throw new Error('تم نشر المقال، لكن تعذر الحصول على رابطه الدائم.');

        render(canonical);
        location.assign(articleUrl(canonical));
      } catch (error) {
        busyRedirect = false;
        publishButton.disabled = false;
        alert(error?.message || 'تعذر نشر المقال.');
      }
    };

    const attachPublish = () => {
      const buttons = [
        document.getElementById('publishBtn'),
        document.getElementById('publishBottomBtn')
      ].filter(Boolean);
      buttons.forEach((button) => {
        if (button.dataset.canonicalPublishBound === '1') return;
        button.dataset.canonicalPublishBound = '1';
        button.addEventListener('click', publishDirect, true);
      });
    };

    copyBtn?.addEventListener('click', async () => {
      const url = articleUrl(activePath);
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'تم النسخ';
        setTimeout(() => { copyBtn.textContent = 'نسخ الرابط'; }, 1200);
      } catch (_) {}
    });

    const originalFetch = window.fetch;
    if (!originalFetch.__medlifeCanonicalWrapped) {
      const wrappedFetch = async (...args) => {
        const response = await originalFetch(...args);
        try {
          const input = args[0];
          const url = typeof input === 'string' ? input : input?.url || '';
          if (String(url).includes('/api/articles')) {
            response.clone().json().then(async (data) => {
              if (Array.isArray(data?.articles)) {
                articles = data.articles;
                await syncFromSelection();
              } else if (data?.article?.canonical_path) {
                const id = Number(data.article.id);
                const index = articles.findIndex((item) => Number(item?.id) === id);
                if (index >= 0) articles[index] = data.article;
                else articles.push(data.article);
                applyArticle(data.article);
              } else if (data?.canonical_path) {
                render(data.canonical_path);
              }
            }).catch(() => {});
          }
        } catch (_) {}
        return response;
      };
      wrappedFetch.__medlifeCanonicalWrapped = true;
      window.fetch = wrappedFetch;
    }

    const observer = new MutationObserver(() => {
      attachPublish();
      sync();
      const canonical = document.querySelector('#sideContent .canonical');
      if (canonical && activePath) canonical.textContent = `/articles/${activePath}`;
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-id'] });

    panel.addEventListener('input', (event) => {
      if (event.target?.id !== 'title_ar') return;
      // A title edit must never change the permanent public path.
      render(activePath);
    });

    render('');
    attachPublish();
    loadArticles();
  });
})();
