(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(async () => {
    const API = '/api/articles';
    let articles = [];
    let bySlug = new Map();
    let byId = new Map();
    let byTitle = new Map();

    const normalize = (value) => {
      let path = String(value || '').trim();
      path = path.replace(/^https?:\/\/[^/]+/i, '');
      path = path.replace(/^\/+/, '');
      path = path.replace(/^articles\//i, '');
      return path;
    };

    const articleUrl = (articleOrPath) => {
      const path = normalize(typeof articleOrPath === 'object'
        ? articleOrPath?.canonical_path
        : articleOrPath);
      return path ? new URL(`/articles/${encodeURIComponent(path)}`, location.origin).href : '';
    };

    const rebuildMaps = () => {
      bySlug = new Map();
      byId = new Map();
      byTitle = new Map();
      for (const article of articles) {
        if (!article) continue;
        const id = Number(article.id);
        const slug = String(article.slug || '').trim();
        const title = String(article.title_ar || '').trim();
        if (Number.isInteger(id) && id > 0) byId.set(id, article);
        if (slug) bySlug.set(slug, article);
        if (title) byTitle.set(title, article);
      }
    };

    const rewriteLinks = () => {
      document.querySelectorAll('a[href^="/articles/"]').forEach((link) => {
        try {
          const raw = link.getAttribute('href') || '';
          const url = new URL(raw, location.origin);
          const key = decodeURIComponent(url.pathname.slice('/articles/'.length));
          const article = bySlug.get(key) || byId.get(Number(key));
          if (article?.canonical_path) {
            const target = articleUrl(article);
            if (target) link.setAttribute('href', target);
          }
        } catch (_) {}
      });
    };

    const identifyArticle = (target) => {
      let node = target instanceof Element ? target : null;
      if (!node) return null;

      const explicitId = Number(
        node.closest('[data-article-id]')?.getAttribute('data-article-id') ||
        node.closest('[data-id]')?.getAttribute('data-id') || ''
      );
      if (Number.isInteger(explicitId) && explicitId > 0 && byId.has(explicitId)) return byId.get(explicitId);

      const explicitPath = normalize(
        node.closest('[data-canonical-path]')?.getAttribute('data-canonical-path') ||
        node.closest('[data-slug]')?.getAttribute('data-slug') || ''
      );
      if (explicitPath) {
        const byCanonical = articles.find((a) => normalize(a?.canonical_path) === explicitPath);
        if (byCanonical) return byCanonical;
        if (bySlug.has(explicitPath)) return bySlug.get(explicitPath);
      }

      const link = node.closest('a[href]');
      if (link) {
        try {
          const href = link.getAttribute('href') || '';
          const url = new URL(href, location.origin);
          if (url.pathname.startsWith('/articles/')) {
            const key = decodeURIComponent(url.pathname.slice('/articles/'.length));
            if (bySlug.has(key)) return bySlug.get(key);
            const numeric = Number(key);
            if (Number.isInteger(numeric) && byId.has(numeric)) return byId.get(numeric);
            const byCanonical = articles.find((a) => normalize(a?.canonical_path) === normalize(key));
            if (byCanonical) return byCanonical;
          }
        } catch (_) {}
      }

      const card = node.closest('.card, .feature, .feature-compact');
      const titleNode = card?.querySelector('h3, h2');
      const title = String(titleNode?.textContent || '').replace(/\s+/g, ' ').trim();
      if (title && byTitle.has(title)) return byTitle.get(title);

      return null;
    };

    const load = async () => {
      try {
        const response = await fetch(API, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        articles = Array.isArray(data?.articles) ? data.articles : [];
        rebuildMaps();
        rewriteLinks();
      } catch (_) {}
    };

    document.addEventListener('click', (event) => {
      const article = identifyArticle(event.target);
      if (!article?.canonical_path) return;
      const target = articleUrl(article);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      location.assign(target);
    }, true);

    try {
      new MutationObserver(() => rewriteLinks()).observe(document.body, { childList: true, subtree: true });
    } catch (_) {}

    window.addEventListener('pageshow', () => rewriteLinks());
    await load();
  });
})();
