(() => {
  'use strict';

  // Keep the authentication gate invisible until the dedicated article session
  // has been resolved. This prevents the login card from flashing briefly
  // before an already-authenticated editor sees the Articles Admin workspace.
  const body = document.body;
  if (!body) return;

  body.style.visibility = 'hidden';

  const SESSION = '/api/article-admin-session?action=me';
  const show = (authenticated) => {
    const login = document.getElementById('loginView');
    const app = document.getElementById('appView');
    if (authenticated) {
      if (login) login.classList.add('hidden');
      if (app) app.classList.remove('hidden');
    } else {
      if (app) app.classList.add('hidden');
      if (login) login.classList.remove('hidden');
    }
    body.style.visibility = 'visible';
  };

  fetch(SESSION, { credentials: 'include', cache: 'no-store' })
    .then((r) => r.json().catch(() => ({})).then((data) => ({ ok: r.ok, data })))
    .then(({ ok, data }) => show(Boolean(ok && data && data.authenticated)))
    .catch(() => show(false));
})();
