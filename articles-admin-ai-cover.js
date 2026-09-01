(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const input = document.getElementById('image_url');
    const panel = document.getElementById('editorPanel');
    if (!input || !panel) return;

    const field = input.closest('.field');
    if (!field) return;

    if (!document.getElementById('aiCoverBox')) {
      const box = document.createElement('div');
      box.id = 'aiCoverBox';
      box.className = 'ai-cover-box';
      box.innerHTML = `
        <div class="ai-cover-head">
          <div>
            <strong>صورة الغلاف</strong>
            <span>اختيارية — اترك الرابط فارغًا ليولّدها الذكاء الاصطناعي تلقائيًا وفق محتوى المقال</span>
          </div>
          <button type="button" class="btn primary" id="generateAiCover">توليد صورة AI</button>
        </div>
        <div class="ai-cover-preview" id="aiCoverPreview"><span>سيتم توليد الغلاف تلقائيًا عند الحفظ إذا لم تضع رابطًا</span></div>
        <div class="ai-cover-meta" id="aiCoverMeta"></div>`;
      field.appendChild(box);
    }

    const preview = document.getElementById('aiCoverPreview');
    const meta = document.getElementById('aiCoverMeta');
    const button = document.getElementById('generateAiCover');
    const title = document.getElementById('title_ar');
    const excerpt = document.getElementById('excerpt_ar');
    const category = document.getElementById('category');
    const content = document.getElementById('contentEditor');

    const render = () => {
      const url = String(input.value || '').trim();
      if (!url) {
        preview.innerHTML = '<span>لا توجد صورة محددة — سيتم إنشاء غلاف AI تلقائيًا عند الحفظ</span>';
        return;
      }
      preview.innerHTML = `<img src="${url.replace(/"/g, '&quot;')}" alt="معاينة صورة الغلاف">`;
    };

    const buildArticleContext = () => ({
      title_ar: title?.value || '',
      excerpt_ar: excerpt?.value || '',
      category: category?.value || '',
      content_ar: content?.innerHTML || ''
    });

    const generateCover = async () => {
      if (button?.dataset.busy === '1') return String(input.value || '').trim();
      const article = buildArticleContext();
      if (!String(article.title_ar).trim() && !String(article.excerpt_ar).trim() && !String(article.content_ar).trim()) {
        throw new Error('أدخل عنوان المقال أو محتواه أولاً حتى يستطيع الذكاء الاصطناعي فهم موضوعه.');
      }

      if (button) {
        button.dataset.busy = '1';
        button.disabled = true;
        button.textContent = 'جارٍ التوليد…';
      }
      preview.innerHTML = '<div class="ai-cover-loading"><span>جارٍ إنشاء غلاف طبي مناسب للمقال…</span></div>';
      meta.textContent = '';

      try {
        const response = await fetch('/api/article-image-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(article)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(data.error || 'تعذر توليد الصورة.');

        input.value = data.image_url || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        render();
        meta.textContent = 'تم إنشاء غلاف مخصص للمقال بواسطة MedLife AI.';
        if (typeof window.setDirty === 'function') window.setDirty(true);
        return String(input.value || '').trim();
      } finally {
        if (button) {
          delete button.dataset.busy;
          button.disabled = false;
          button.textContent = 'توليد صورة AI';
        }
      }
    };

    const ensureCover = async () => {
      const current = String(input.value || '').trim();
      if (current) return current;
      return await generateCover();
    };

    input.addEventListener('input', render);

    button?.addEventListener('click', async () => {
      try {
        await generateCover();
      } catch (error) {
        preview.innerHTML = '<span>تعذر توليد الصورة حالياً</span>';
        meta.textContent = error?.message || 'تعذر توليد صورة الغلاف.';
        alert(meta.textContent);
      }
    });

    const wrapAction = (name) => {
      const original = window[name];
      if (typeof original !== 'function' || original.__aiCoverWrapped) return;
      const wrapped = async function (...args) {
        try {
          await ensureCover();
        } catch (error) {
          meta.textContent = error?.message || 'تعذر إنشاء صورة الغلاف.';
          alert(meta.textContent);
          return;
        }
        return await original.apply(this, args);
      };
      wrapped.__aiCoverWrapped = true;
      wrapped.__aiCoverOriginal = original;
      window[name] = wrapped;
    };

    wrapAction('save');
    wrapAction('publish');

    render();
  });
})();
