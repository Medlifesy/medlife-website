(() => {
  const items = [
    ['index.html', 'الرئيسية', 'home', 'fa-house'],
    ['about-medlife.html', 'عن المؤسسة', 'about', 'fa-building-columns'],
    ['index.html#programs', 'مجالات العمل', 'programs', 'fa-layer-group'],
    ['articles.html', 'المقالات', 'articles', 'fa-newspaper'],
    ['forum-v3.html', 'المنتدى', 'forum', 'fa-comments'],
    ['gallery.html', 'الصور', 'gallery', 'fa-images'],
    ['support.html', 'صندوق الدعم', 'support', 'fa-hand-holding-heart'],
    ['contact.html', 'تواصل معنا', 'contact', 'fa-envelope']
  ];

  const page = location.pathname.split('/').pop() || 'index.html';
  const home = page === '' || page === 'index.html';

  const activeKey = () => {
    if (page === 'gallery.html') return 'gallery';
    if (home && location.hash === '#programs') return 'programs';
    if (home && location.hash === '#homepageGallery') return 'gallery';
    if (home) return 'home';
    const match = items.find(item => item[0].split('#')[0] === page && !item[0].includes('#'));
    return match ? match[2] : '';
  };

  const setActive = key => {
    document.querySelectorAll('.medlife-global-nav a, .medlife-global-mobile a')
      .forEach(a => a.classList.toggle('active', a.dataset.key === key));
  };

  function build() {
    document.querySelectorAll('.medlife-global-header').forEach(h => h.remove());

    const current = activeKey();
    const header = document.createElement('header');
    header.className = 'medlife-global-header';
    header.innerHTML = `
      <div class="medlife-global-wrap">
        <a class="medlife-global-brand" href="/index.html" aria-label="مؤسسة ميدلايف — الرئيسية">
          <img src="/logo.PNG" alt="مؤسسة ميدلايف">
        </a>
        <nav class="medlife-global-nav" aria-label="التنقل الرئيسي">
          ${items.map(([url, label, key, icon]) => `
            <a href="${url}" data-key="${key}" class="${key === current ? 'active' : ''}">
              <i class="fa-solid ${icon}" aria-hidden="true"></i>
              <span>${label}</span>
            </a>
          `).join('')}
        </nav>
        <div class="medlife-global-actions" aria-label="إجراءات العضوية">
          <a class="member" href="/login.html"><i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i><span>دخول الأعضاء</span></a>
          <a class="join" href="/join-options.html"><i class="fa-solid fa-user-plus" aria-hidden="true"></i><span>الانضمام</span></a>
        </div>
        <button class="medlife-global-menu" type="button" aria-label="فتح قائمة التنقل" aria-expanded="false" aria-controls="medlife-global-mobile">
          <i class="fa-solid fa-bars" aria-hidden="true"></i><span>القائمة</span>
        </button>
      </div>
      <div id="medlife-global-mobile" class="medlife-global-mobile" hidden>
        ${items.map(([url, label, key, icon]) => `
          <a href="${url}" data-key="${key}" class="${key === current ? 'active' : ''}">
            <i class="fa-solid ${icon}" aria-hidden="true"></i><span>${label}</span>
          </a>
        `).join('')}
        <a href="/login.html"><i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i><span>دخول الأعضاء</span></a>
        <a class="mobile-join" href="/join-options.html"><i class="fa-solid fa-user-plus" aria-hidden="true"></i><span>الانضمام إلى ميدلايف</span></a>
      </div>
    `;

    document.body.prepend(header);

    if (!document.getElementById('medlife-global-nav-style')) {
      const style = document.createElement('style');
      style.id = 'medlife-global-nav-style';
      style.textContent = `
        .medlife-global-header{position:sticky;top:0;z-index:2500;background:rgba(255,255,255,.97);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid #e5eaf1;box-shadow:0 8px 24px rgba(21,29,54,.07)}
        .medlife-global-wrap{width:min(1320px,calc(100% - 28px));min-height:72px;margin:auto;display:flex;align-items:center;gap:16px}
        .medlife-global-brand{flex:0 0 auto;display:flex;align-items:center;text-decoration:none;margin-inline-end:2px}
        .medlife-global-brand img{height:48px;width:auto;display:block;object-fit:contain}
        .medlife-global-nav{flex:1 1 auto;display:flex;align-items:stretch;justify-content:center;gap:2px;min-width:0;min-height:72px}
        .medlife-global-nav a{position:relative;display:flex;align-items:center;gap:6px;padding:0 9px;color:#151d36;text-decoration:none;font:800 11.5px Cairo,sans-serif;white-space:nowrap;transition:color .2s ease,background .2s ease}
        .medlife-global-nav a i{font-size:11px;opacity:.72;transition:transform .2s ease,opacity .2s ease}
        .medlife-global-nav a::after{content:"";position:absolute;left:9px;right:9px;bottom:9px;height:3px;border-radius:999px;background:#ff2a54;transform:scaleX(0);transform-origin:center;transition:transform .22s ease}
        .medlife-global-nav a:hover{color:#ff2a54;background:#fff7f9;border-radius:10px}
        .medlife-global-nav a:hover i{opacity:1;transform:translateY(-1px)}
        .medlife-global-nav a.active{color:#ff2a54}
        .medlife-global-nav a.active i{opacity:1}
        .medlife-global-nav a.active::after{transform:scaleX(1)}
        .medlife-global-actions{display:flex;flex:0 0 auto;align-items:center;gap:7px}
        .medlife-global-actions a{display:inline-flex;align-items:center;gap:6px;border:1px solid #dde4ed;border-radius:11px;padding:8px 10px;color:#151d36;background:#fff;text-decoration:none;font:800 10.5px Cairo,sans-serif;white-space:nowrap;transition:.2s ease}
        .medlife-global-actions a:hover{transform:translateY(-1px);border-color:#ff2a54;color:#ff2a54;box-shadow:0 8px 18px rgba(21,29,54,.07)}
        .medlife-global-actions .join{background:#ff2a54;border-color:#ff2a54;color:#fff;box-shadow:0 7px 16px rgba(255,42,84,.18)}
        .medlife-global-actions .join:hover{color:#fff;background:#ea234a;border-color:#ea234a}
        .medlife-global-menu{display:none;align-items:center;gap:7px;border:1px solid #dde4ed;background:#f7f9fc;color:#151d36;border-radius:11px;padding:9px 12px;font:800 12px Cairo,sans-serif;cursor:pointer}
        .medlife-global-mobile{border-top:1px solid #e8edf3;background:#fff;box-shadow:0 10px 20px rgba(21,29,54,.06)}
        .medlife-global-mobile a{display:flex;align-items:center;gap:10px;padding:12px 18px;border-bottom:1px solid #eef2f7;color:#151d36;text-decoration:none;font:800 13px Cairo,sans-serif}
        .medlife-global-mobile a i{width:18px;text-align:center;opacity:.7}
        .medlife-global-mobile a.active{color:#ff2a54;background:#fff7f9;border-inline-start:3px solid #ff2a54}
        .medlife-global-mobile .mobile-join{color:#fff;background:#ff2a54;border-inline-start:0;justify-content:center;margin:10px 14px;border-radius:12px;border-bottom:0}
        @media(max-width:1240px){.medlife-global-nav a{padding-inline:7px;font-size:11px}.medlife-global-nav a span{max-width:92px;overflow:hidden;text-overflow:ellipsis}.medlife-global-actions a span{display:none}.medlife-global-actions a{padding:9px 11px}}
        @media(max-width:1050px){.medlife-global-nav,.medlife-global-actions{display:none}.medlife-global-menu{display:inline-flex;margin-inline-start:auto}.medlife-global-wrap{min-height:64px}.medlife-global-brand img{height:44px}}
        @media(max-width:430px){.medlife-global-wrap{width:min(100% - 18px,1320px)}.medlife-global-brand img{height:40px}.medlife-global-menu{padding:8px 10px}}
        @media(prefers-reduced-motion:reduce){.medlife-global-nav a,.medlife-global-nav a i,.medlife-global-nav a::after,.medlife-global-actions a{transition:none}}
      `;
      document.head.appendChild(style);
    }

    const menu = header.querySelector('.medlife-global-menu');
    const mobile = header.querySelector('.medlife-global-mobile');
    menu.addEventListener('click', () => {
      const open = mobile.hidden;
      mobile.hidden = !open;
      menu.setAttribute('aria-expanded', String(open));
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobile.hidden = true;
      menu.setAttribute('aria-expanded', 'false');
    }));

    if (home && 'IntersectionObserver' in window) {
      const sections = [
        ['about', 'about'],
        ['programs', 'programs'],
        ['homepageGallery', 'gallery'],
        ['social', 'contact']
      ];
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.dataset.navKey);
        else if (!location.hash) setActive('home');
      }, { rootMargin: '-22% 0px -60% 0px', threshold: [0, .2, .4, .6] });
      sections.forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el) { el.dataset.navKey = key; observer.observe(el); }
      });
    }
  }

  window.addEventListener('hashchange', () => setActive(activeKey()));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
