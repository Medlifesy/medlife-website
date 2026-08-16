export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Never interfere with static assets or non-HTML responses.
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('text/html')) return response;

  // Keep public pages directly accessible. Only inject optional enhancement
  // scripts after the page has been successfully served.
  const publicPages = new Set([
    '/', '/index.html',
    '/about-medlife.html', '/about-medlife-foundation.html',
    '/articles.html', '/article.html',
    '/forum.html', '/forum', '/forum-v3.html',
    '/join-options.html', '/join-us.html',
    '/login.html', '/contact.html'
  ]);

  if (!publicPages.has(pathname) || response.status < 200 || response.status >= 300) {
    return response;
  }

  try {
    const rewriter = new HTMLRewriter()
      .on('a[href="#volunteer"]', { element(el) { el.setAttribute('href', '/join-options.html'); } })
      .on('a[href="index.html#volunteer"]', { element(el) { el.setAttribute('href', '/join-options.html'); } })
      .on('a[href="/#volunteer"]', { element(el) { el.setAttribute('href', '/join-options.html'); } })
      .on('a[href="#contact"]', { element(el) { el.setAttribute('href', '/contact.html'); } })
      .on('a[href="index.html#contact"]', { element(el) { el.setAttribute('href', '/contact.html'); } })
      .on('a[href="/#contact"]', { element(el) { el.setAttribute('href', '/contact.html'); } })
      .on('body', {
        element(el) {
          if (pathname === '/' || pathname === '/index.html') {
            el.append('<script src="/js/members.js" defer></script>', { html: true });
            el.append('<script src="/js/home-enhancements.js" defer></script>', { html: true });
            el.append('<script src="/support-medlife.js?v=20260816" defer></script>', { html: true });
          }
          if (pathname === '/articles.html') {
            el.append('<script src="/js/articles.js?v=20260814" defer></script>', { html: true });
          }
          if (pathname === '/forum.html' || pathname === '/forum' || pathname === '/forum-v3.html') {
            el.append('<script src="/forum-booking.js?v=20260816" defer></script>', { html: true });
            el.append('<script src="/support-medlife.js?v=20260816" defer></script>', { html: true });
          }
        }
      });

    return rewriter.transform(response);
  } catch (_) {
    // If enhancement fails for any reason, serve the original page untouched.
    return response;
  }
}
