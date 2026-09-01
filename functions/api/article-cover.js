const NAVY = '#151D36';
const NAVY_2 = '#1E2948';
const RED = '#B21F45';
const BURGUNDY = '#7B1738';
const CREAM = '#FFF9F3';
const WHITE = '#FFFFFF';

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function hash(value) {
  let h = 2166136261;
  for (const ch of String(value ?? '')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapArabic(text, maxChars = 25, maxLines = 3) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = candidate;
    }
  }

  if (lines.length < maxLines && line) lines.push(line);
  return lines.length ? lines : ['مقال طبي'];
}

function categoryTheme(category) {
  const key = String(category || '').toLowerCase();

  if (key.includes('مرأة') || key.includes('نسائية') || key.includes('نساء') || key.includes('تنظيم الأسرة')) {
    return { accent: '#D45A78', label: 'WOMEN’S HEALTH', type: 'women' };
  }
  if (key.includes('طفل') || key.includes('أطفال') || key.includes('طب الأطفال')) {
    return { accent: '#63B6B2', label: 'PEDIATRICS', type: 'child' };
  }
  if (key.includes('قلب') || key.includes('cardio')) {
    return { accent: '#E06A76', label: 'CARDIOLOGY', type: 'heart' };
  }
  if (key.includes('صدر') || key.includes('تنفس') || key.includes('رئة')) {
    return { accent: '#76A9D6', label: 'RESPIRATORY HEALTH', type: 'lungs' };
  }
  if (key.includes('طوارئ') || key.includes('إسعاف') || key.includes('emergency')) {
    return { accent: '#F08A68', label: 'EMERGENCY CARE', type: 'emergency' };
  }
  if (key.includes('بحث') || key.includes('تشخيص') || key.includes('تحاليل') || key.includes('diagn')) {
    return { accent: '#6B94D6', label: 'DIAGNOSTICS & RESEARCH', type: 'diagnostics' };
  }
  if (key.includes('تعليم') || key.includes('تثقيف') || key.includes('medical education')) {
    return { accent: '#9E7AB7', label: 'MEDICAL EDUCATION', type: 'education' };
  }
  return { accent: RED, label: 'MEDLIFE MEDICAL LIBRARY', type: 'medical' };
}

function motif(theme, seed) {
  const rotation = seed % 360;
  const shift = 60 + (seed % 70);
  const common = `fill="none" stroke="${theme.accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity=".95"`;

  if (theme.type === 'women') {
    return `
      <g transform="translate(1170 420) rotate(${rotation - 8})">
        <circle r="178" fill="${theme.accent}" opacity=".10"/>
        <circle r="146" ${common} opacity=".35"/>
        <path d="M0 -118 C-92 -118 -140 -18 -140 72 C-140 148 -71 192 0 212 C71 192 140 148 140 72 C140 -18 92 -118 0 -118Z" ${common}/>
        <path d="M0 -86 V82 M-50 -2 H50 M-28 82 C-18 112 18 112 28 82" ${common} opacity=".8"/>
        <circle cx="0" cy="142" r="12" fill="${theme.accent}"/>
      </g>`;
  }

  if (theme.type === 'child') {
    return `
      <g transform="translate(1170 420) rotate(${rotation - 10})">
        <circle r="182" fill="${theme.accent}" opacity=".09"/>
        <circle cx="-62" cy="-42" r="46" ${common}/>
        <circle cx="64" cy="-42" r="46" ${common}/>
        <path d="M-135 92 C-118 30 -8 30 0 92" ${common}/>
        <path d="M0 92 C8 30 118 30 135 92" ${common}/>
        <path d="M-26 -135 Q0 -172 26 -135" ${common} opacity=".75"/>
      </g>`;
  }

  if (theme.type === 'heart') {
    return `
      <g transform="translate(1170 420) rotate(${rotation - 14})">
        <circle r="190" fill="${theme.accent}" opacity=".09"/>
        <path d="M0 156 C-32 120 -140 54 -140 -35 C-140 -92 -104 -126 -57 -126 C-26 -126 -8 -111 0 -85 C8 -111 26 -126 57 -126 C104 -126 140 -92 140 -35 C140 54 32 120 0 156Z" ${common}/>
        <path d="M-104 2 H-60 L-34 -40 L2 54 L31 8 H104" ${common} opacity=".82"/>
      </g>`;
  }

  if (theme.type === 'lungs') {
    return `
      <g transform="translate(1170 420) rotate(${rotation - 12})">
        <circle r="188" fill="${theme.accent}" opacity=".09"/>
        <path d="M0 -138 V148" ${common}/>
        <path d="M-8 -64 C-88 -92 -146 -44 -146 42 C-146 115 -92 150 -34 125 C-14 116 -7 88 -8 56Z" ${common}/>
        <path d="M8 -64 C88 -92 146 -44 146 42 C146 115 92 150 34 125 C14 116 7 88 8 56Z" ${common}/>
        <path d="M0 -124 V-8 M-66 -82 L-28 -38 M66 -82 L28 -38" ${common} opacity=".7"/>
      </g>`;
  }

  if (theme.type === 'emergency') {
    return `
      <g transform="translate(1170 420) rotate(${rotation})">
        <circle r="182" fill="${theme.accent}" opacity=".10"/>
        <rect x="-122" y="-122" width="244" height="244" rx="54" ${common}/>
        <path d="M0 -72 V72 M-72 0 H72" stroke="${theme.accent}" stroke-width="24" stroke-linecap="round"/>
        <path d="M-176 0 H-142 M176 0 H142 M0 -176 V-142 M0 176 V142" ${common} opacity=".55"/>
      </g>`;
  }

  if (theme.type === 'diagnostics') {
    return `
      <g transform="translate(1170 420) rotate(${rotation - 18})">
        <circle r="188" fill="${theme.accent}" opacity=".08"/>
        <circle r="118" ${common}/>
        <circle cx="0" cy="0" r="60" ${common} opacity=".72"/>
        <path d="M88 88 L170 170" ${common}/>
        <path d="M-76 -14 L-28 -14 L-4 -60 L34 72 L56 18 H100" ${common} opacity=".72"/>
      </g>`;
  }

  if (theme.type === 'education') {
    return `
      <g transform="translate(1170 420) rotate(${rotation - 7})">
        <circle r="184" fill="${theme.accent}" opacity=".08"/>
        <path d="M-128 -72 Q-34 -112 0 -50 V128 Q-34 90 -128 110Z" ${common}/>
        <path d="M128 -72 Q34 -112 0 -50 V128 Q34 90 128 110Z" ${common}/>
        <path d="M0 -42 V126" ${common} opacity=".7"/>
        <path d="M-82 -48 H-24 M82 -48 H24 M-88 2 H-28 M88 2 H28" ${common} opacity=".62"/>
      </g>`;
  }

  return `
    <g transform="translate(1170 420) rotate(${rotation - 15})">
      <circle r="184" fill="${theme.accent}" opacity=".08"/>
      <circle r="126" ${common}/>
      <path d="M0 -94 V94 M-94 0 H94" stroke="${theme.accent}" stroke-width="20" stroke-linecap="round"/>
      <circle r="154" fill="none" stroke="${theme.accent}" stroke-width="3" opacity=".35"/>
      <path d="M-164 -108 L-116 -156 M164 -108 L116 -156 M-164 108 L-116 156 M164 108 L116 156" ${common} opacity=".45"/>
    </g>`;
}

function makeLogo() {
  return `
    <g>
      <rect x="82" y="66" width="250" height="88" rx="44" fill="${WHITE}" opacity=".97"/>
      <image href="/logo.PNG" x="103" y="78" width="208" height="64" preserveAspectRatio="xMidYMid meet"/>
    </g>`;
}

function svg(article) {
  const title = String(article?.title_ar || 'مقال طبي').trim();
  const category = String(article?.category || 'المكتبة الطبية').trim();
  const theme = categoryTheme(category);
  const seed = hash(`${article?.id || ''}:${title}:${category}`);
  const gradientAngle = 0.2 + ((seed % 30) / 100);
  const lineShift = 40 + (seed % 90);
  const lines = wrapArabic(title, 25 + (seed % 5), 3);
  const titleSize = clamp(54 - Math.max(0, title.length - 44) * 0.26, 42, 54);
  const titleText = lines.map((line, index) => `<tspan x="1420" dy="${index ? Math.round(titleSize * 1.22) : 0}">${esc(line)}</tspan>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="0.56" stop-color="${NAVY_2}"/>
      <stop offset="1" stop-color="${BURGUNDY}"/>
    </linearGradient>
    <radialGradient id="orb" cx="72%" cy="38%" r="62%">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity=".28"/>
      <stop offset="0.6" stop-color="${theme.accent}" stop-opacity=".08"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${WHITE}" stop-opacity=".04"/>
      <stop offset="1" stop-color="${WHITE}" stop-opacity=".12"/>
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${WHITE}" stroke-width="1" opacity=".05"/>
    </pattern>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#orb)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>

  <g opacity=".26" filter="url(#blur)">
    <circle cx="1320" cy="210" r="118" fill="${theme.accent}"/>
    <circle cx="1070" cy="710" r="160" fill="${RED}"/>
  </g>

  <path d="M0 762 C210 680 330 710 530 650 C746 584 856 592 1044 522 C1212 460 1400 432 1600 486 V900 H0Z" fill="${NAVY}" opacity=".34"/>
  <path d="M0 786 C230 704 386 732 580 690 C776 648 900 622 1092 564 C1272 510 1428 492 1600 522" fill="none" stroke="${WHITE}" stroke-width="3" opacity=".08"/>

  ${makeLogo()}

  <g transform="translate(1390 168)">
    <rect x="-142" y="0" width="284" height="48" rx="24" fill="${theme.accent}" opacity=".18"/>
    <circle cx="-104" cy="24" r="7" fill="${theme.accent}"/>
    <text x="-84" y="31" fill="${WHITE}" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="1.4">${esc(theme.label)}</text>
  </g>

  <g transform="translate(${lineShift} 0) rotate(${gradientAngle * 12})" opacity=".18">
    <path d="M1160 72 L1510 422" stroke="${WHITE}" stroke-width="3"/>
    <path d="M1260 42 L1560 342" stroke="${WHITE}" stroke-width="2"/>
  </g>

  ${motif(theme, seed)}

  <rect x="92" y="226" width="720" height="424" rx="38" fill="url(#card)" stroke="${WHITE}" stroke-width="2" opacity=".92"/>
  <rect x="92" y="226" width="8" height="424" rx="4" fill="${theme.accent}"/>

  <text x="760" y="318" text-anchor="end" fill="${CREAM}" opacity=".74" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="1">${esc(theme.label)}</text>

  <text x="760" y="386" text-anchor="end" fill="${WHITE}" font-family="Arial, sans-serif" font-size="${Math.round(titleSize)}" font-weight="800" direction="rtl" unicode-bidi="plaintext">
    ${titleText}
  </text>

  <rect x="560" y="548" width="200" height="6" rx="3" fill="${theme.accent}" opacity=".88"/>
  <rect x="648" y="566" width="112" height="6" rx="3" fill="${WHITE}" opacity=".24"/>

  <g transform="translate(96 760)">
    <rect x="0" y="0" width="334" height="74" rx="37" fill="${WHITE}" opacity=".07"/>
    <text x="40" y="32" fill="${WHITE}" font-family="Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="2">MEDLIFE</text>
    <text x="40" y="56" fill="${CREAM}" opacity=".65" font-family="Arial, sans-serif" font-size="15" font-weight="600" letter-spacing="1.2">MEDICAL LIBRARY</text>
  </g>

  <text x="1508" y="846" text-anchor="end" fill="${WHITE}" opacity=".38" font-family="Arial, sans-serif" font-size="17">HEALTH · KNOWLEDGE · COMMUNITY</text>
</svg>`;
}

export async function onRequestGet({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!env.DB || !Number.isInteger(id) || id <= 0) {
    return new Response('Not found', { status: 404 });
  }

  const article = await env.DB.prepare(
    "SELECT id,title_ar,category,status FROM articles WHERE id=? AND status='published' LIMIT 1"
  ).bind(id).first();

  if (!article) return new Response('Not found', { status: 404 });

  return new Response(svg(article), {
    status: 200,
    headers: {
      'content-type': 'image/svg+xml; charset=UTF-8',
      'cache-control': 'public, max-age=3600, must-revalidate',
      'x-content-type-options': 'nosniff'
    }
  });
}
