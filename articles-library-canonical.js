(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(async () => {
    try {
      const response = await fetch('/api/articles', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const articles = Array.isArray(data?.articles) ? data.articles : [];
      const bySlug = new Map();
      for (const article of articles) {
        const slug = String(article?.slug || '').trim();
        const canonicalPath = String(article?.canonical_path || '').trim();
        if (slug && canonicalPath) bySlug.set(slug, canonicalPath);
      }

      const rewrite = () => {
        document.querySelectorAll('a[href^="/articles/"]').forEach((link) => {
          try {
            const url = new URL(link.getAttribute('href'), location.origin);
            const key = decodeURIComponent(url.pathname.slice('/articles/'.length));
            const canonicalPath = bySlug.get(key);
            if (canonicalPath) {
              link.setAttribute('href', `/articles/${encodeURIComponent(canonicalPath)}`);
            }
          } catch (_) {}
        });
      };

      rewrite();
      new MutationObserver(rewrite).observe(document.body, { childList: true, subtree: true });
    } catch (_) {}
  });
})();
