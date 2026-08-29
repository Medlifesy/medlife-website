(() => {
  const login = document.getElementById('login');
  if (!login) return;

  login.style.maxWidth = '560px';
  login.style.margin = '42px auto';
  login.style.padding = '28px';

  const logo = document.createElement('img');
  logo.src = '/logo.PNG';
  logo.alt = 'MedLife';
  logo.style.cssText = 'display:block;width:96px;height:96px;object-fit:contain;margin:0 auto 14px;border-radius:20px';
  login.insertBefore(logo, login.firstChild);

  const title = login.querySelector('h2');
  if (title) title.textContent = 'تسجيل الدخول إلى مركز المحتوى';

  const intro = login.querySelector('.muted');
  if (intro) intro.innerHTML = 'منصة MedLife الرسمية لإدارة ومتابعة رحلة المحتوى الرقمي من الفكرة والكتابة، مروراً بالمراجعة الطبية والتنسيق والتصميم، وصولاً إلى النشر.';

  const notice = document.createElement('div');
  notice.style.cssText = 'margin:18px 0 4px;padding:13px 14px;border:1px solid #e5eaf1;border-radius:12px;background:#f8fafc;color:#66748b;font-size:10px;line-height:1.9;text-align:right';
  notice.innerHTML = '<strong style="color:#12203a">🔒 منصة داخلية</strong><br>هذه المنصة مخصصة لأعضاء فرق المحتوى والمشرفين المخولين في مؤسسة ميدلايف. يتم تحديد المحتوى والصلاحيات وفقاً للحساب المستخدم.';
  login.appendChild(notice);

  const app = document.getElementById('app');
  if (app) app.style.display = 'none';
})();
