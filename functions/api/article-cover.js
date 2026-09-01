const NAVY = '#12203A';
const NAVY_2 = '#182A49';
const CREAM = '#FBFAF8';
const PINK = '#E92850';
const SOFT_BLUE = '#8FB7CF';
const WHITE = '#FFFFFF';
const INK = '#0B1426';

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

function wrapArabic(text, maxChars = 25, maxLines = 3) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
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
  if (line && lines.length < maxLines) lines.push(line);
  return lines.length ? lines : ['مقال طبي'];
}

function themeFor(category) {
  const key = String(category || '').toLowerCase();
  if (key.includes('مرأة') || key.includes('نسائية') || key.includes('نساء') || key.includes('تنظيم الأسرة')) {
    return { accent: '#D96A86', type: 'women', label: 'صحة المرأة' };
  }
  if (key.includes('طفل') || key.includes('أطفال') || key.includes('طب الأطفال')) {
    return { accent: '#6BAFC6', type: 'child', label: 'صحة الطفل' };
  }
  if (key.includes('قلب') || key.includes('cardio')) {
    return { accent: '#E26979', type: 'heart', label: 'صحة القلب' };
  }
  if (key.includes('صدر') || key.includes('تنفس') || key.includes('رئة')) {
    return { accent: '#72A9C6', type: 'lungs', label: 'الجهاز التنفسي' };
  }
  if (key.includes('طوارئ') || key.includes('إسعاف') || key.includes('emergency')) {
    return { accent: '#F07C67', type: 'emergency', label: 'الطوارئ والإسعاف' };
  }
  if (key.includes('بحث') || key.includes('تشخيص') || key.includes('تحاليل') || key.includes('diagn')) {
    return { accent: '#7399C9', type: 'research', label: 'التشخيص والبحث الطبي' };
  }
  if (key.includes('تعليم') || key.includes('تثقيف') || key.includes('education')) {
    return { accent: '#9A8CC1', type: 'education', label: 'التعليم والتثقيف الطبي' };
  }
  return { accent: SOFT_BLUE, type: 'medical', label: 'المكتبة الطبية' };
}

function motif(theme, seed) {
  const flip = (seed & 1) ? 1 : -1;
  const common = `fill="none" stroke="${theme.accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"`;

  if (theme.type === 'women') {
    return `<g transform="translate(1315 485) scale(${flip} 1)" opacity=".92">
      <circle r="176" fill="${theme.accent}" opacity=".08"/>
      <circle r="144" ${common} opacity=".55"/>
      <path d="M0-118c-72 0-112 56-112 118 0 78 72 104 112 140 40-36 112-62 112-140 0-62-40-118-112-118z" ${common}/>
      <path d="M0-82v132M-48-24h96M-26 76c12 13 40 13 52 0" ${common}/>
      <circle cx="0" cy="0" r="194" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".16"/>
    </g>`;
  }

  if (theme.type === 'child') {
    return `<g transform="translate(1315 485) scale(${flip} 1)" opacity=".92">
      <circle r="176" fill="${theme.accent}" opacity=".08"/>
      <circle cx="-62" cy="-42" r="45" ${common}/>
      <circle cx="62" cy="-42" r="45" ${common}/>
      <path d="M-136 94c22-56 82-70 136 0 54-70 114-56 136 0" ${common}/>
      <path d="M-24-132q24-30 48 0" ${common} opacity=".75"/>
      <circle cx="0" cy="0" r="194" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".16"/>
    </g>`;
  }

  if (theme.type === 'heart') {
    return `<g transform="translate(1315 485) scale(${flip} 1)" opacity=".92">
      <circle r="176" fill="${theme.accent}" opacity=".08"/>
      <path d="M0 150C-34 116-144 50-144-36c0-58 40-96 86-96 30 0 48 15 58 42 10-27 28-42 58-42 46 0 86 38 86 96 0 86-110 152-144 188z" ${common}/>
      <path d="M-101 8h36l23-40 30 92 25-52h63" ${common}/>
      <circle cx="0" cy="0" r="194" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".16"/>
    </g>`;
  }

  if (theme.type === 'lungs') {
    return `<g transform="translate(1315 485) scale(${flip} 1)" opacity=".92">
      <circle r="176" fill="${theme.accent}" opacity=".08"/>
      <path d="M0-142v284M-12-56C-104-96-150-26-150 54c0 64 45 108 98 78 30-18 40-49 40-86zM12-56c92-40 150 30 150 110 0 64-45 108-98 78-30-18-40-49-40-86z" ${common}/>
      <path d="M0-92-58-43M0-92l58 49" ${common} opacity=".76"/>
      <circle cx="0" cy="0" r="194" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".16"/>
    </g>`;
  }

  if (theme.type === 'emergency') {
    return `<g transform="translate(1315 485) scale(${flip} 1)" opacity=".92">
      <circle r="176" fill="${theme.accent}" opacity=".08"/>
      <rect x="-126" y="-126" width="252" height="252" rx="58" ${common}/>
      <path d="M0-74v148M-74 0h148" stroke="${theme.accent}" stroke-width="22" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="194" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".16"/>
    </g>`;
  }

  if (theme.type === 'research') {
    return `<g transform="translate(1315 485) scale(${flip} 1)" opacity=".92">
      <circle r="176" fill="${theme.accent}" opacity=".08"/>
      <circle r="104" ${common}/>
      <circle r="48" ${common} opacity=".68"/>
      <path d="M74 74l112 112" ${common}/>
      <path d="M-82 10h38l22-48 30 96 27-48h62" ${common} opacity=".74"/>
      <circle cx="0" cy="0" r="194" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".16"/>
    </g>`;
  }

  if (theme.type === 'education') {
    return `<g transform="translate(1315 485) scale(${flip} 1)" opacity=".92">
      <circle r="176" fill="${theme.accent}" opacity=".08"/>
      <path d="M-138-72q82-40 138 10v160q-54-44-138-12zM138-72Q56-112 0-62v160q54-44 138-12z" ${common}/>
      <path d="M0-54v150" ${common} opacity=".72"/>
      <path d="M-92-34h48M92-34H44M-92 14h52M92 14H40" ${common} opacity=".56"/>
      <circle cx="0" cy="0" r="194" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".16"/>
    </g>`;
  }

  return `<g transform="translate(1315 485) scale(${flip} 1)" opacity=".92">
    <circle r="176" fill="${theme.accent}" opacity=".08"/>
    <circle r="112" ${common}/>
    <path d="M0-86v172M-86 0h172" stroke="${theme.accent}" stroke-width="18" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="194" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".16"/>
  </g>`;
}

function particles(theme, seed) {
  return Array.from({ length: 14 }, (_, i) => {
    const x = 930 + ((seed + i * 137) % 570);
    const y = 130 + ((seed + i * 61) % 620);
    const r = 1.8 + ((seed + i * 3) % 3);
    const opacity = 0.14 + (((seed + i) % 5) * 0.035);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${theme.accent}" opacity="${opacity.toFixed(2)}"/>`;
  }).join('');
}

function logoMarkup() {
  return `<g>
    <rect x="610" y="58" width="380" height="118" rx="59" fill="${WHITE}" opacity=".98"/>
    <image href="/logo.PNG" x="650" y="68" width="300" height="98" preserveAspectRatio="xMidYMid meet"/>
  </g>`;
}

function svg(article) {
  const title = String(article?.title_ar || 'مقال طبي').trim();
  const category = String(article?.category || 'المكتبة الطبية').trim();
  const theme = themeFor(category);
  const seed = hash(`${article?.id || ''}:${title}:${category}`);
  const lines = wrapArabic(title, 24 + (seed % 3), 3);
  const titleSize = title.length > 74 ? 48 : title.length > 52 ? 54 : 60;
  const titleStartY = lines.length === 1 ? 500 : lines.length === 2 ? 456 : 410;
  const titleText = lines.map((line, i) => {
    const dy = i === 0 ? 0 : Math.round(titleSize * 1.13);
    return `<tspan x="800" dy="${dy}">${esc(line)}</tspan>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="0.55" stop-color="${NAVY_2}"/>
      <stop offset="1" stop-color="#254C63"/>
    </linearGradient>
    <radialGradient id="halo" cx="82%" cy="50%" r="55%">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity=".22"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="34"/></filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#06101E" flood-opacity=".28"/>
    </filter>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#halo)"/>

  <g opacity=".17">
    <circle cx="1295" cy="115" r="210" fill="${theme.accent}" filter="url(#blur)"/>
    <circle cx="1440" cy="790" r="170" fill="${SOFT_BLUE}" filter="url(#blur)"/>
  </g>

  <g opacity=".45">${particles(theme, seed)}</g>

  <g opacity=".10" stroke="${WHITE}" fill="none">
    <path d="M0 710C230 630 380 725 610 640c210-78 402-92 624-10 150 56 252 56 366 8" stroke-width="2"/>
    <path d="M0 770C240 690 395 785 620 704c225-80 395-98 620-15 160 60 250 56 360 20" stroke-width="1"/>
  </g>

  ${logoMarkup()}

  <g filter="url(#shadow)">
    <rect x="190" y="276" width="1220" height="360" rx="56" fill="#FFFFFF" fill-opacity=".055" stroke="#FFFFFF" stroke-opacity=".15"/>
  </g>

  <rect x="430" y="310" width="740" height="8" rx="4" fill="${theme.accent}" opacity=".92"/>

  <text x="800" y="372" text-anchor="middle" fill="${CREAM}" opacity=".78" font-family="Arial, Tahoma, sans-serif" font-size="23" font-weight="700" letter-spacing="1.2" direction="rtl">${esc(theme.label)}</text>

  <text x="800" y="${titleStartY}" text-anchor="middle" fill="${WHITE}" font-family="Arial, Tahoma, sans-serif" font-size="${titleSize}" font-weight="700" direction="rtl" unicode-bidi="bidi-override" textLength="0">
    ${titleText}
  </text>

  <g transform="translate(800 704)">
    <rect x="-184" y="-31" width="368" height="62" rx="31" fill="${WHITE}" fill-opacity=".075" stroke="${WHITE}" stroke-opacity=".12"/>
    <circle cx="-142" cy="0" r="8" fill="${PINK}"/>
    <circle cx="-112" cy="0" r="5" fill="${SOFT_BLUE}" opacity=".82"/>
    <text x="150" y="8" text-anchor="end" fill="${CREAM}" opacity=".76" font-family="Arial, Tahoma, sans-serif" font-size="17" font-weight="600" direction="ltr">MEDLIFE MEDICAL LIBRARY</text>
  </g>

  ${motif(theme, seed)}

  <text x="800" y="824" text-anchor="middle" fill="${WHITE}" opacity=".34" font-family="Arial, Tahoma, sans-serif" font-size="16" letter-spacing="2" direction="ltr">HEALTH · KNOWLEDGE · COMMUNITY</text>
</svg>`;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id'));
  if (!env.DB || !Number.isInteger(id) || id <= 0) {
    return new Response('Not found', { status: 404 });
  }

  const article = await env.DB
    .prepare("SELECT id,title_ar,category,status FROM articles WHERE id=? AND LOWER(TRIM(status))='published' LIMIT 1")
    .bind(id)
    .first();

  if (!article) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(svg(article), {
    headers: {
      'content-type': 'image/svg+xml; charset=UTF-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      'x-content-type-options': 'nosniff'
    }
  });
}
