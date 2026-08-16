(() => {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (window.L) return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function loadCss(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  function initMap() {
    const el = document.getElementById('syriaMap');
    if (!el || !window.L || el.dataset.ready === '1') return;
    el.dataset.ready = '1';

    const map = L.map(el, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true
    }).setView([35.15, 38.25], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const pin = L.divIcon({
      className: '',
      html: '<div class="custom-pin"></div>',
      iconSize: [34, 34],
      iconAnchor: [12, 30],
      popupAnchor: [4, -28]
    });

    L.marker([34.8959, 35.8867], { icon: pin })
      .addTo(map)
      .bindPopup('<div class="popup-title">مؤسسة ميدلايف — طرطوس</div><div class="popup-text">المكتب الرئيسي — المحكمة، خلف شركة الأعلاف</div>')
      .openPopup();

    setTimeout(() => map.invalidateSize(), 250);
  }

  async function start() {
    if (!document.getElementById('syriaMap')) return;
    loadCss('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    try {
      if (!window.L) await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      initMap();
    } catch (_) {
      const el = document.getElementById('syriaMap');
      if (el) {
        el.innerHTML = '<div style="height:100%;display:grid;place-items:center;padding:24px;text-align:center;font-family:Cairo,sans-serif;color:#687587;background:#eef6f8;border-radius:18px">خريطة سوريا غير متاحة مؤقتاً. يمكنك التواصل معنا مباشرة عبر بيانات الاتصال الموجودة بجانب الخريطة.</div>';
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
