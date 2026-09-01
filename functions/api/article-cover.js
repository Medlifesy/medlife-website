const NAVY = '#151D36';
const NAVY_2 = '#1F2A49';
const RED = '#B21F45';
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

function wrapArabic(text, maxChars, maxLines = 3) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines.length ? lines : ['مقال طبي'];
}

function themeFor(category) {
  const key = String(category || '').toLowerCase();
  if (key.includes('مرأة') || key.includes('نسائية') || key.includes('نساء') || key.includes('تنظيم الأسرة')) {
    return { accent: '#D45A78', type: 'women', label: 'WOMEN’S HEALTH' };
  }
  if (key.includes('طفل') || key.includes('أطفال') || key.includes('طب الأطفال')) {
    return { accent: '#67B9B1', type: 'child', label: 'PEDIATRICS' };
  }
  if (key.includes('قلب') || key.includes('cardio')) {
    return { accent: '#E26C78', type: 'heart', label: 'CARDIOLOGY' };
  }
  if (key.includes('رئة') || key.includes('تنفس') || key.includes('صدر')) {
    return { accent: '#78A9D8', type: 'lungs', label: 'RESPIRATORY HEALTH' };
  }
  if (key.includes('طوارئ') || key.includes('إسعاف') || key.includes('emergency')) {
    return { accent: '#EF8B69', type: 'emergency', label: 'EMERGENCY CARE' };
  }
  if (key.includes('بحث') || key.includes('تشخيص') || key.includes('تحاليل') || key.includes('diagn')) {
    return { accent: '#6C97DC', type: 'diagnostics', label: 'DIAGNOSTICS & RESEARCH' };
  }
  if (key.includes('تعليم') || key.includes('تثقيف') || key.includes('education')) {
    return { accent: '#9D7AB8', type: 'education', label: 'MEDICAL EDUCATION' };
  }
  return { accent: RED, type: 'medical', label: 'MEDLIFE MEDICAL LIBRARY' };
}

function motif(theme, seed) {
  const r = (seed % 28) - 14;
  const stroke = `fill="none" stroke="${theme.accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"`;
  const centerX = 1200;
  const centerY = 430;

  if (theme.type === 'women') return `
    <g transform="translate(${centerX} ${centerY}) rotate(${r})">
      <circle r="205" fill="${theme.accent}" opacity=".07"/>
      <circle r="168" ${stroke} opacity=".22"/>
      <path d="M0-116c-84 0-139 59-139 139 0 75 62 122 139 151 77-29 139-76 139-151 0-80-55-139-139-139Z" ${stroke}/>
      <path d="M0-79v112M-46-24h92M-25 68c17 15 33 15 50 0" ${stroke} opacity=".82"/>
    </g>`;

  if (theme.type === 'child') return `
    <g transform="translate(${centerX} ${centerY}) rotate(${r})">
      <circle r="204" fill="${theme.accent}" opacity=".07"/>
      <circle cx="-63" cy="-48" r="45" ${stroke}/>
      <circle cx="63" cy="-48" r="45" ${stroke}/>
      <path d="M-141 92c18-62 109-66 141-6 32-60 123-56 141 6" ${stroke}/>
      <path d="M-18-136q18-27 36 0" ${stroke} opacity=".72"/>
    </g>`;

  if (theme.type === 'heart') return `
    <g transform="translate(${centerX} ${centerY}) rotate(${r})">
      <circle r="210" fill="${theme.accent}" opacity=".07"/>
      <path d="M0 166c-32-34-151-82-151-194 0-61 43-103 98-103 30 0 45 13 53 37 8-24 23-37 53-37 55 0 98 42 98 103 0 112-119 160-151 194Z" ${stroke}/>
      <path d="M-113 5h48l27-53 39 103 29-48h43" ${stroke} opacity=".82"/>
    </g>`;

  if (theme.type === 'lungs') return `
    <g transform="translate(${centerX} ${centerY}) rotate(${r})">
      <circle r="208" fill="${theme.accent}" opacity=".07"/>
      <path d="M0-145v290" ${stroke}/>
      <path d="M-10-62c-83-43-149 13-149 94 0 75 47 125 105 105 39-13 45-51 44-93Z" ${stroke}/>
      <path d="M10-62c83-43 149 13 149 94 0 75-47 125-105 105-39-13-45-51-44-93Z" ${stroke}/>
      <path d="M0-125v60M-67-90l39 43M67-90L28-43" ${stroke} opacity=".65"/>
    </g>`;

  if (theme.type === 'emergency') return `
    <g transform="translate(${centerX} ${centerY}) rotate(${r})">
      <circle r="205" fill="${theme.accent}" opacity=".07"/>
      <rect x="-122" y="-122" width="244" height="244" rx="52" ${stroke}/>
      <path d="M0-73v146M-73 0h146" stroke="${theme.accent}" stroke-width="24" stroke-linecap="round"/>
      <circle r="156" fill="none" stroke="${theme.accent}" stroke-width="3" opacity=".28"/>
    </g>`;

  if (theme.type === 'diagnostics') return `
    <g transform="translate(${centerX} ${centerY}) rotate(${r})">
      <circle r="210" fill="${theme.accent}" opacity=".07"/>
      <circle r="122" ${stroke}/>
      <circle r="61" ${stroke} opacity=".65"/>
      <path d="M87 87l86 86" ${stroke}/>
      <path d="M-84 10h48l25-46 36 92 27-47h42" ${stroke} opacity=".72"/>
    </g>`;

  if (theme.type === 'education') return `
    <g transform="translate(${centerX} ${centerY}) rotate(${r})">
      <circle r="206" fill="${theme.accent}" opacity=".07"/>
      <path d="M-137-74c52-21 101-16 137 25v180c-44-28-88-34-137-13Z" ${stroke}/>
      <path d="M137-74c-52-21-101-16-137 25v180c44-28 88-34 137-13Z" ${stroke}/>
      <path d="M0-46v177M-91-37h45M91-37h-45M-96 12h48M96 12h-48" ${stroke} opacity=".65"/>
    </g>`;

  return `
    <g transform="translate(${centerX} ${centerY}) rotate(${r})">
      <circle r="208" fill="${theme.accent}" opacity=".07"/>
      <circle r="128" ${stroke}/>
      <circle r="161" fill="none" stroke="${theme.accent}" stroke-width="3" opacity=".28"/>
      <path d="M0-94v188M-94 0h188" stroke="${theme.accent}" stroke-width="22" stroke-linecap="round"/>
    </g>`;
}

function medlifeMark() {
  return `
    <g transform="translate(104 68)">
      <rect width="286" height="92" rx="46" fill="${WHITE}" opacity=".97"/>
      <circle cx="48" cy="46" r="28" fill="${RED}"/>
      <path d="M48 27v38M29 46h38" stroke="${WHITE}" stroke-width="7" stroke-linecap="round"/>
      <text x="93" y="57" fill="${NAVY}" font-family="Arial, sans-serif" font-size="31" font-weight="800">MedLife</text>
    </g>`;
}

function svg(article) {
  const title = String(article?.title_ar || 'مقال طبي').trim();
  const category = String(article?.category || 'المكتبة الطبية').trim();
  const theme = themeFor(category);
  const seed = hash(`${article?.id || ''}:${title}:${category}`);
  const lines = wrapArabic(title, 27 + (seed % 4), 3);
  const size = Math.max(42, Math.min(58, 58 - Math.max(0, title.length - 38) * 0.28));
  const titleText = lines.map((line, i) => `<tspan x="760" dy="${i ? Math.round(size * 1.18) : 0}">${esc(line)}</tspan>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset=".62" stop-color="${NAVY_2}"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity=".88"/>
    </linearGradient>
    <radialGradient id="glow" cx="76%" cy="32%" r="65%">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity=".28"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${WHITE}" opacity=".09"/>
    </pattern>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <rect width="1600" height="900" fill="url(#dots)"/>

  <path d="M0 760C270 650 430 700 650 640c190-52 350-135 560-116 147 13 260 61 390 5v371H0Z" fill="${NAVY}" opacity=".36"/>
  <path d="M0 794C255 695 435 736 662 676c206-54 365-130 560-107 150 18 263 57 378 0" fill="none" stroke="${WHITE}" stroke-width="3" opacity=".08"/>

  ${medlifeMark()}

  <g transform="translate(1210 82)">
    <rect width="286" height="50" rx="25" fill="${theme.accent}" opacity=".17"/>
    <circle cx="27" cy="25" r="6" fill="${theme.accent}"/>
    <text x="48" y="32" fill="${WHITE}" font-family="Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="1.2">${esc(theme.label)}</text>
  </g>

  ${motif(theme, seed)}

  <rect x="94" y="246" width="735" height="416" rx="34" fill="${WHITE}" opacity=".06" stroke="${WHITE}" stroke-width="2"/>
  <rect x="94" y="246" width="8" height="416" rx="4" fill="${theme.accent}"/>

  <text x="772" y="318" text-anchor="end" fill="${CREAM}" opacity=".72" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing=".8">${esc(theme.label)}</text>
  <text x="772" y="390" text-anchor="end" fill="${WHITE}" font-family="Arial, sans-serif" font-size="${Math.round(size)}" font-weight="800" direction="rtl">${titleText}</text>

  <rect x="560" y="560" width="212" height="6" rx="3" fill="${theme.accent}" opacity=".9"/>
  <rect x="666" y="580" width="106" height="6" rx="3" fill="${WHITE}" opacity=".2"/>

  <text x="104" y="816" fill="${WHITE}" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="2.2">MEDLIFE MEDICAL LIBRARY</text>
  <text x="1494" y="816" text-anchor="end" fill="${WHITE}" opacity=".38" font-family="Arial, sans-serif" font-size="16" letter-spacing="1.2">HEALTH · KNOWLEDGE · COMMUNITY</text>
</svg>`;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id'));
  if (!env.DB || !Number.isInteger(id) || id <= 0) {
    return new Response('Not found', { status: 404 });
  }

  const article = await env.DB.prepare(
    "SELECT id,title_ar,category,status FROM articles WHERE id=? AND LOWER(TRIM(status))='published' LIMIT 1"
  ).bind(id).first();

  if (!article) return new Response('Not found', { status: 404 });

  return new Response(svg(article), {
    status: 200,
    headers: {
      'content-type': 'image/svg+xml; charset=UTF-8',
      'cache-control': 'public, max-age=300, must-revalidate',
      'x-content-type-options': 'nosniff'
    }
  });
}
