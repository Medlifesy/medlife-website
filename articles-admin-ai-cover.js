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
            <span>اختيارية — عند النشر بدون صورة، ينشئ النظام غلافًا طبيًا تلقائيًا مرتبطًا بالمقال.</span>
          </div>
          <button type="button" class="btn primary" id="generateAiCover">إنشاء غلاف الآن</button>
        </div>
        <div class="ai-cover-preview" id="aiCoverPreview"><span>سيظهر غلاف تلقائي عند نشر المقال إذا بقي الحقل فارغًا</span></div>
        <div class="ai-cover-meta" id="aiCoverMeta"></div>`;
      field.appendChild(box);
    }

    const preview = document.getElementById('aiCoverPreview');
    const meta = document.getElementById('aiCoverMeta');
    const button = document.getElementById('generateAiCover');

    const articleId = () => {
      const fromPanel = Number(panel.dataset.articleId || '');
      if (Number.isInteger(fromPanel) && fromPanel > 0) return fromPanel;
      const active = document.querySelector('#articleList .article-item.active');
      const fromList = Number(active?.dataset?.id || '');
      return Number.isInteger(fromList) && fromList > 0 ? fromList : null;
    };

    const fallbackUrl = () => {
      const id = articleId();
      return id ? `/api/article-cover?id=${encodeURIComponent(id)}` : '';
    };

    const render = () => {
      const url = String(input.value || '').trim();
      if (!url) {
        preview.innerHTML = '<span>سيُنشأ الغلاف تلقائيًا عند النشر</span>';
        return;
      }
      preview.innerHTML = `<img src="${url.replace(/"/g, '&quot;')}" alt="معاينة صورة الغلاف">`;
    };

    const ensureCover = async () => {
      const current = String(input.value || '').trim();
      if (current) return current;
      const fallback = fallbackUrl();
      if (fallback) {
        input.value = fallback;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        meta.textContent = 'تم إنشاء غلاف MedLife تلقائي للمقال.';
        render();
        return fallback;
      }
      // المقال الجديد لا يملك رقمًا بعد؛ واجهة الـAPI ستنشئ الغلاف آليًا بعد INSERT عند النشر.
      meta.textContent = 'سيُنشأ الغلاف تلقائيًا بعد حفظ المقال ونشره.';
      return '';
    };

    input.addEventListener('input', render);

    button?.addEventListener('click', async () => {
      try {
        const url = await ensureCover();
        if (!url) return;
        if (typeof window.setDirty === 'function') window.setDirty(true);
      } catch (error) {
        meta.textContent = error?.message || 'تعذر إنشاء غلاف المقال.';
      }
    });

    const wrapAction = (name) => {
      const original = window[name];
      if (typeof original !== 'function' || original.__coverFallbackWrapped) return;
      const wrapped = async function (...args) {
        await ensureCover();
        return await original.apply(this, args);
      };
      wrapped.__coverFallbackWrapped = true;
      wrapped.__coverFallbackOriginal = original;
      window[name] = wrapped;
    };

    wrapAction('save');
    wrapAction('publish');
    render();
  });
})();
