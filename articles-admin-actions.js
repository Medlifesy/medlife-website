(() => {
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();
  ready(() => {
    const app = document.getElementById('appView');
    const panel = document.getElementById('editorPanel');
    const status = document.getElementById('status');
    const badge = document.getElementById('statusBadge');
    const deleteBtn = document.getElementById('deleteBtn');
    const publishBtn = document.getElementById('publishBtn');
    const publishBottomBtn = document.getElementById('publishBottomBtn');
    if (!app || !panel) return;

    const makeButton = (id, text, cls = 'btn') => {
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('button');
        el.type = 'button';
        el.id = id;
        el.className = cls;
      }
      el.textContent = text;
      return el;
    };

    const unpublishBtn = makeButton('unpublishBtn', 'إلغاء النشر', 'btn light');
    const right = document.querySelector('#editorPanel .bar-right');
    if (right && !unpublishBtn.parentElement) right.insertBefore(unpublishBtn, publishBottomBtn || null);

    const sync = () => {
      const value = String(status?.value || '').toLowerCase();
      const published = value === 'published' || !!badge?.classList.contains('published');
      const hasArticle = !panel.classList.contains('hidden');

      if (!hasArticle) {
        [unpublishBtn, deleteBtn].forEach((el) => { if (el) el.style.display = 'none'; });
        return;
      }

      if (deleteBtn) {
        deleteBtn.style.display = published ? 'none' : '';
        deleteBtn.textContent = published ? 'حذف' : 'حذف المقال';
        deleteBtn.classList.toggle('danger', !published);
      }
      if (unpublishBtn) unpublishBtn.style.display = published ? '' : 'none';
      if (publishBtn) publishBtn.style.display = published ? 'none' : '';
      if (publishBottomBtn) publishBottomBtn.style.display = published ? 'none' : '';
    };

    unpublishBtn.onclick = async () => {
      if (unpublishBtn.dataset.busy === '1') return;
      const title = document.getElementById('title_ar')?.value?.trim() || 'هذا المقال';
      if (!confirm(`هل تريد إلغاء نشر «${title}»؟\n\nسيبقى المقال محفوظًا ويمكن نشره مجددًا لاحقًا.`)) return;
      const original = status?.value;
      try {
        unpublishBtn.dataset.busy = '1';
        unpublishBtn.disabled = true;
        if (status) status.value = 'draft';
        if (typeof window.save === 'function') {
          await window.save('save');
        } else {
          throw new Error('تعذر الوصول إلى وظيفة الحفظ.');
        }
      } catch (e) {
        if (status && original) status.value = original;
        alert(e?.message || 'تعذر إلغاء نشر المقال.');
      } finally {
        delete unpublishBtn.dataset.busy;
        unpublishBtn.disabled = false;
        sync();
      }
    };

    if (deleteBtn) {
      const originalDelete = deleteBtn.onclick;
      deleteBtn.addEventListener('click', () => {
        const value = String(status?.value || '').toLowerCase();
        if (value === 'published') {
          alert('لا يمكن حذف مقال منشور مباشرة. استخدم «إلغاء النشر» أولًا، ثم احذف المقال.');
        }
      }, true);
      if (!originalDelete) deleteBtn.type = 'button';
    }

    const observer = new MutationObserver(sync);
    if (badge) observer.observe(badge, { attributes: true, childList: true, subtree: true });
    if (status) status.addEventListener('change', sync);

    sync();
    setTimeout(sync, 300);
    setTimeout(sync, 1000);
  });
})();
