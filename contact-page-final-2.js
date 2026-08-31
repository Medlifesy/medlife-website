(() => {
  'use strict';
  const ID = 'medlife-contact-final-2';
  const BRAND = '/logo.PNG?v=20260831-contact-final';
  if (document.getElementById(ID)) return;

  const style = document.createElement('style');
  style.id = ID;
  style.textContent = `
    /* Final MedLife Contact refinement */
    #medlife-contact-v8 {
      background: #fffaf7 !important;
      color: #10182f !important;
    }

    #medlife-contact-v8 .mc8-hero {
      background: #fffaf7 !important;
      border: 0 !important;
      padding: 46px 18px 34px !important;
    }

    #medlife-contact-v8 .mc8-wrap {
      width: min(900px, 100%) !important;
      background: #fff !important;
      border: 1px solid #ece5e1 !important;
      border-radius: 30px !important;
      box-shadow: 0 16px 44px rgba(16, 24, 47, .055) !important;
      padding: 34px 36px 30px !important;
      overflow: hidden !important;
    }

    /* no decorative top line */
    #medlife-contact-v8 .mc8-wrap:before { display: none !important; }
    #medlife-contact-v8 .mc8-wrap:after {
      background: #fff1f4 !important;
      width: 190px !important;
      height: 190px !important;
      right: -90px !important;
      top: -96px !important;
    }

    /* Logo: filled circle, minimal empty margin */
    #medlife-contact-v8 .mc8-logo {
      width: 132px !important;
      height: 132px !important;
      padding: 0 !important;
      border: 3px solid #e92850 !important;
      background: #fff !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      box-shadow: 0 12px 28px rgba(16,24,47,.08) !important;
      animation: medlifeContactFloat 4.6s ease-in-out infinite !important;
    }
    #medlife-contact-v8 .mc8-logo img {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      object-fit: cover !important;
      transform: scale(1.08) !important;
      border-radius: 50% !important;
      display: block !important;
    }
    @keyframes medlifeContactFloat {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    #medlife-contact-v8 .mc8-kicker {
      background: #fff3f5 !important;
      color: #e92850 !important;
      border-color: #f0d7de !important;
    }
    #medlife-contact-v8 h1 {
      font-size: clamp(34px, 4.6vw, 48px) !important;
      margin: 10px 0 6px !important;
      color: #10182f !important;
    }
    #medlife-contact-v8 h1 span { color: #e92850 !important; }
    #medlife-contact-v8 .mc8-hero p {
      color: #727887 !important;
      max-width: 620px !important;
      font-size: 13px !important;
    }

    #medlife-contact-v8 .mc8-content {
      width: min(1120px, calc(100% - 32px)) !important;
      padding: 40px 0 72px !important;
    }
    #medlife-contact-v8 .mc8-title { margin-bottom: 24px !important; }
    #medlife-contact-v8 .mc8-title h2 {
      font-size: 28px !important;
      color: #10182f !important;
    }
    #medlife-contact-v8 .mc8-title p { color: #727887 !important; }

    /* Desktop: institution contact left, map right */
    #medlife-contact-v8 .mc8-main {
      grid-template-columns: minmax(0,1.1fr) minmax(300px,.9fr) !important;
      gap: 28px !important;
      align-items: start !important;
    }
    #medlife-contact-v8 .mc8-contact-card { grid-column: 1 !important; grid-row: 1 !important; }
    #medlife-contact-v8 .mc8-map-card { grid-column: 2 !important; grid-row: 1 !important; }

    #medlife-contact-v8 .mc8-card {
      background: #fff !important;
      border: 1px solid #eae3df !important;
      border-radius: 22px !important;
      box-shadow: 0 10px 30px rgba(16,24,47,.045) !important;
      padding: 23px !important;
    }

    #medlife-contact-v8 .mc8-card-head img {
      width: 40px !important;
      height: 40px !important;
      padding: 1px !important;
      border: 2px solid #e92850 !important;
      background: #fff !important;
      border-radius: 50% !important;
      object-fit: cover !important;
    }
    #medlife-contact-v8 .mc8-card-head h3 {
      font-size: 18px !important;
      color: #10182f !important;
    }
    #medlife-contact-v8 .mc8-contact-card .mc8-card-head h3 {
      font-size: 20px !important;
    }

    /* Clear, visible section label */
    #medlife-contact-v8 .mc10-contact-label {
      display: inline-block;
      margin: 0 0 13px;
      padding: 5px 10px;
      border-radius: 999px;
      background: #fff3f5;
      border: 1px solid #f0d7de;
      color: #e92850;
      font: 900 10px Cairo, Arial, sans-serif;
    }

    #medlife-contact-v8 .mc8-map {
      height: 350px !important;
      border-radius: 16px !important;
      border: 1px solid #e5ded9 !important;
    }
    #medlife-contact-v8 .mc8-map .leaflet-tile-pane { filter: none !important; }

    /* Comfortable Location pin */
    #medlife-contact-v8 .mc8-pin-wrap {
      background: transparent !important;
      border: 0 !important;
    }
    #medlife-contact-v8 .mc8-pin {
      width: 34px !important;
      height: 44px !important;
      background: #e92850 !important;
      border: 3px solid #fff !important;
      border-radius: 50% 50% 50% 0 !important;
      transform: rotate(-45deg) !important;
      box-shadow: 0 7px 15px rgba(16,24,47,.22) !important;
      padding: 0 !important;
      display: grid !important;
      place-items: center !important;
    }
    #medlife-contact-v8 .mc8-pin img {
      width: 16px !important;
      height: 16px !important;
      padding: 2px !important;
      background: #fff !important;
      border-radius: 50% !important;
      object-fit: cover !important;
      transform: rotate(45deg) !important;
      display: block !important;
    }
    #medlife-contact-v8 .mc8-pin:before {
      content: none !important;
      display: none !important;
    }

    /* Province selector: quiet and institutional */
    #medlife-contact-v8 .mc8-team-list {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 7px !important;
      margin-top: 11px !important;
    }
    #medlife-contact-v8 .mc8-team-list button {
      min-height: 43px !important;
      padding: 7px 8px !important;
      border: 1px solid #e9e2df !important;
      border-radius: 10px !important;
      background: #fff !important;
      color: #10182f !important;
      font: 800 10px Cairo, Arial, sans-serif !important;
    }
    #medlife-contact-v8 .mc8-team-list button:before {
      width: 6px !important;
      height: 6px !important;
      margin: 0 auto 4px !important;
      background: #e92850 !important;
    }
    #medlife-contact-v8 .mc8-team-list button:hover,
    #medlife-contact-v8 .mc8-team-list button.active {
      border-color: #e92850 !important;
      color: #e92850 !important;
      transform: none !important;
      background: #fff9fa !important;
    }

    #medlife-contact-v8 .mc8-item a[href^="tel:"],
    #medlife-contact-v8 .mc8-item a[href^="mailto:"] {
      direction: ltr !important;
      unicode-bidi: plaintext !important;
      text-align: right !important;
    }

    /* Forum block */
    #medlife-contact-v8 .mc10-forum-title {
      display: block;
      margin-bottom: 5px;
      color: #10182f;
      font: 900 17px Cairo, Arial, sans-serif;
    }
    #medlife-contact-v8 .mc10-forum-copy {
      color: #697282;
      font: 500 10px/1.8 Cairo, Arial, sans-serif;
    }
    #medlife-contact-v8 .mc10-forum-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 18px;
      margin-top: 13px;
    }
    #medlife-contact-v8 .mc10-forum-detail {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding-top: 9px;
      border-top: 1px solid #f0dce1;
    }
    #medlife-contact-v8 .mc10-forum-detail i { color:#e92850; width:17px; padding-top:3px; }
    #medlife-contact-v8 .mc10-forum-detail strong { display:block; font:900 10px Cairo,Arial,sans-serif; color:#10182f; }
    #medlife-contact-v8 .mc10-forum-detail span,
    #medlife-contact-v8 .mc10-forum-detail a {
      display:block; margin-top:2px; color:#697282; font:500 10px/1.7 Cairo,Arial,sans-serif; text-decoration:none;
    }
    #medlife-contact-v8 .mc10-forum-detail a { direction:ltr; unicode-bidi:plaintext; text-align:right; }
    #medlife-contact-v8 .mc10-forum-social { display:flex;flex-wrap:wrap;gap:7px;margin-top:13px; }
    #medlife-contact-v8 .mc10-forum-social a {
      display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border-radius:10px;
      border:1px solid #eadfe1;background:#fff;color:#10182f;text-decoration:none;font:900 10px Cairo,Arial,sans-serif;
    }
    #medlife-contact-v8 .mc10-forum-social a:hover { border-color:#e92850;color:#e92850; }

    #medlife-contact-v8 .mc8-lower {
      grid-template-columns: 1fr 1fr !important;
      gap: 20px !important;
      margin-top: 24px !important;
    }
    #medlife-contact-v8 .mc8-lower-card {
      background:#fff !important;
      border:1px solid #eae3df !important;
      border-radius:18px !important;
      box-shadow:0 8px 24px rgba(16,24,47,.035) !important;
      padding:20px !important;
    }

    #medlife-contact-v8 .mc8-quote {
      margin-top:30px !important;
      padding:20px 10px !important;
      color:#737b89 !important;
      font-size:12px !important;
      border-top:1px solid #eadfdc !important;
    }

    @media (max-width:900px) {
      #medlife-contact-v8 .mc8-main { grid-template-columns:1fr !important; }
      #medlife-contact-v8 .mc8-contact-card,
      #medlife-contact-v8 .mc8-map-card { grid-column:1 !important; grid-row:auto !important; }
      #medlife-contact-v8 .mc8-contact-card { order:1; }
      #medlife-contact-v8 .mc8-map-card { order:2; }
    }
    @media (max-width:640px) {
      #medlife-contact-v8 .mc8-hero { padding:24px 12px 22px !important; }
      #medlife-contact-v8 .mc8-wrap { padding:27px 16px 24px !important; border-radius:21px !important; }
      #medlife-contact-v8 .mc8-logo { width:116px !important; height:116px !important; }
      #medlife-contact-v8 .mc8-content { width:calc(100% - 20px) !important; padding:28px 0 50px !important; }
      #medlife-contact-v8 .mc8-card { padding:17px !important; border-radius:18px !important; }
      #medlife-contact-v8 .mc8-map { height:315px !important; }
      #medlife-contact-v8 .mc8-lower { grid-template-columns:1fr !important; }
      #medlife-contact-v8 .mc10-forum-details { grid-template-columns:1fr !important; }
    }
    @media (prefers-reduced-motion:reduce) {
      #medlife-contact-v8 .mc8-logo { animation:none !important; }
    }
  `;
  document.head.appendChild(style);

  function enhanceContent() {
    const page = document.getElementById('medlife-contact-v8');
    if (!page) return false;

    const contactHead = page.querySelector('.mc8-contact-card .mc8-card-head');
    if (contactHead && !contactHead.parentElement.querySelector('.mc10-contact-label')) {
      const label = document.createElement('div');
      label.className = 'mc10-contact-label';
      label.textContent = 'معلومات التواصل مع ميدلايف';
      contactHead.parentElement.insertBefore(label, contactHead);
    }

    const forum = page.querySelector('.mc8-forum');
    if (forum && forum.dataset.final2 !== '1') {
      forum.dataset.final2 = '1';
      forum.innerHTML = `
        <span class="mc10-forum-title">منتدى ميدلايف — طرطوس</span>
        <div class="mc10-forum-copy">مساحة للتعلم والتدريب والأنشطة والفعاليات.</div>
        <div class="mc10-forum-details">
          <div class="mc10-forum-detail"><i class="fa-solid fa-location-dot"></i><div><strong>العنوان</strong><span>الجمعية — خلف مستوصف السل — جنوب الفقاسة، طرطوس</span></div></div>
          <div class="mc10-forum-detail"><i class="fa-solid fa-phone"></i><div><strong>الهاتف</strong><a href="tel:+963182220555">+963 182 220 555</a></div></div>
          <div class="mc10-forum-detail"><i class="fa-solid fa-mobile-screen-button"></i><div><strong>الموبايل</strong><a href="tel:+963989913713">+963 989 913 713</a></div></div>
          <div class="mc10-forum-detail"><i class="fa-solid fa-envelope"></i><div><strong>البريد الإلكتروني</strong><a href="mailto:Forum@medlifesy.org">Forum@medlifesy.org</a></div></div>
        </div>
        <div class="mc10-forum-social">
          <a href="/forum-v3.html"><i class="fa-solid fa-arrow-up-right-from-square"></i> زيارة المنتدى</a>
          <a href="https://www.facebook.com/Medlifesyforum" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook"></i> Facebook المنتدى</a>
        </div>`;
    }

    page.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]').forEach(a => {
      a.setAttribute('dir', 'ltr');
      a.style.direction = 'ltr';
      a.style.unicodeBidi = 'plaintext';
    });

    page.querySelectorAll('.mc8-pin img').forEach(img => {
      img.src = BRAND;
      img.alt = 'MedLife';
    });
    return true;
  }

  function patchMapIconWhenAvailable() {
    const pins = document.querySelectorAll('#medlife-contact-v8 .mc8-pin');
    pins.forEach(pin => {
      const img = pin.querySelector('img');
      if (img && img.src !== location.origin + BRAND) img.src = BRAND;
    });
  }

  function init() {
    if (!enhanceContent()) {
      setTimeout(init, 120);
      return;
    }
    patchMapIconWhenAvailable();
    setTimeout(patchMapIconWhenAvailable, 500);
    setTimeout(patchMapIconWhenAvailable, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
