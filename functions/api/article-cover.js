const NAVY = '#12203A';
const NAVY_2 = '#1A3152';
const CREAM = '#FBFAF8';
const WHITE = '#FFFFFF';
const PINK = '#E92850';
const BLUE = '#78A8C2';

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

function wrapArabic(text, maxChars = 31, maxLines = 3) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return ['مقال طبي'];

  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = candidate;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines && words.join(' ') !== lines.join(' ')) {
    const joined = lines[maxLines - 1];
    lines[maxLines - 1] = `${joined}…`;
  }
  return lines.length ? lines : ['مقال طبي'];
}

function themeFor(category) {
  const key = String(category || '').toLowerCase();
  if (key.includes('مرأة') || key.includes('نسائية') || key.includes('نساء') || key.includes('تنظيم الأسرة')) {
    return { accent: '#E58AA3', type: 'women', label: 'صحة المرأة' };
  }
  if (key.includes('طفل') || key.includes('أطفال') || key.includes('طب الأطفال')) {
    return { accent: '#82B9CF', type: 'child', label: 'صحة الطفل' };
  }
  if (key.includes('قلب') || key.includes('cardio')) {
    return { accent: '#F07A92', type: 'heart', label: 'صحة القلب' };
  }
  if (key.includes('صدر') || key.includes('تنفس') || key.includes('رئة')) {
    return { accent: '#7EB5D1', type: 'lungs', label: 'الجهاز التنفسي' };
  }
  if (key.includes('طوارئ') || key.includes('إسعاف') || key.includes('emergency')) {
    return { accent: '#F29A72', type: 'emergency', label: 'الطوارئ والإسعاف' };
  }
  if (key.includes('بحث') || key.includes('تشخيص') || key.includes('تحاليل') || key.includes('diagn')) {
    return { accent: '#8BB1D7', type: 'research', label: 'التشخيص والبحث الطبي' };
  }
  if (key.includes('تعليم') || key.includes('تثقيف') || key.includes('education')) {
    return { accent: '#9A8BC6', type: 'education', label: 'التعليم والتثقيف الطبي' };
  }
  return { accent: BLUE, type: 'medical', label: 'المكتبة الطبية' };
}

function motif(theme, seed) {
  const a = theme.accent;
  const angle = (seed % 12) - 6;
  const line = `fill="none" stroke="${a}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"`;

  if (theme.type === 'women') {
    return `<g transform="translate(1320 472) rotate(${angle})" opacity=".92">
      <circle r="190" fill="${a}" opacity=".08"/>
      <circle r="154" ${line} opacity=".26"/>
      <path d="M0-122c-67 0-108 49-108 111 0 73 63 100 108 140 45-40 108-67 108-140 0-62-41-111-108-111z" ${line}/>
      <path d="M0-88v119M-46-18h92M-27 73c9 10 45 10 54 0" ${line} opacity=".85"/>
    </g>`;
  }
  if (theme.type === 'child') {
    return `<g transform="translate(1320 472) rotate(${angle})" opacity=".92">
      <circle r="188" fill="${a}" opacity=".08"/>
      <circle cx="-61" cy="-48" r="43" ${line}/>
      <circle cx="61" cy="-48" r="43" ${line}/>
      <path d="M-133 91c17-51 78-66 133 0 55-66 116-51 133 0" ${line}/>
      <path d="M-24-130q24-31 48 0" ${line} opacity=".8"/>
    </g>`;
  }
  if (theme.type === 'heart') {
    return `<g transform="translate(1320 472) rotate(${angle})" opacity=".92">
      <circle r="190" fill="${a}" opacity=".08"/>
      <path d="M0 151C-30 117-141 53-141-31c0-57 37-94 83-94 30 0 48 14 58 40 10-26 28-40 58-40 46 0 83 37 83 94 0 84-111 148-141 182z" ${line}/>
      <path d="M-101 2h31l24-38 28 91 24-52h61" ${line}/>
    </g>`;
  }
  if (theme.type === 'lungs') {
    return `<g transform="translate(1320 472) rotate(${angle})" opacity=".92">
      <circle r="188" fill="${a}" opacity=".08"/>
      <path d="M0-138v274M-11-58C-98-93-146-31-146 47c0 63 42 107 93 82 31-15 42-49 42-87zM11-58C98-93 146-31 146 47c0 63-42 107-93 82-31-15-42-49-42-87z" ${line}/>
      <path d="M0-92-52-48M0-92l52 44" ${line} opacity=".75"/>
    </g>`;
  }
  if (theme.type === 'emergency') {
    return `<g transform="translate(1320 472) rotate(${angle})" opacity=".92">
      <circle r="190" fill="${a}" opacity=".08"/>
      <rect x="-125" y="-125" width="250" height="250" rx="56" ${line}/>
      <path d="M0-72v144M-72 0h144" stroke="${a}" stroke-width="22" stroke-linecap="round"/>
    </g>`;
  }
  if (theme.type === 'research') {
    return `<g transform="translate(1320 472) rotate(${angle})" opacity=".92">
      <circle r="188" fill="${a}" opacity=".08"/>
      <circle r="112" ${line}/>
      <circle r="52" ${line} opacity=".6"/>
      <path d="M82 82l102 102" ${line}/>
      <path d="M-84 12h34l22-45 29 92 26-47h59" ${line} opacity=".72"/>
    </g>`;
  }
  if (theme.type === 'education') {
    return `<g transform="translate(1320 472) rotate(${angle})" opacity=".92">
      <circle r="188" fill="${a}" opacity=".08"/>
      <path d="M-137-74q83-43 137 9v158q-54-42-137-9zM137-74Q54-117 0-65v158q54-42 137-9z" ${line}/>
      <path d="M0-57v145" ${line} opacity=".7"/>
      <path d="M-92-31h50M92-31H42M-92 16h47M92 16H43" ${line} opacity=".5"/>
    </g>`;
  }
  return `<g transform="translate(1320 472) rotate(${angle})" opacity=".92">
    <circle r="188" fill="${a}" opacity=".08"/>
    <circle r="127" ${line}/>
    <path d="M0-90v180M-90 0h180" stroke="${a}" stroke-width="18" stroke-linecap="round"/>
    <circle r="158" fill="none" stroke="${a}" stroke-width="2" opacity=".35" stroke-dasharray="3 14"/>
  </g>`;
}

function toBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function logoDataUri(request) {
  try {
    const logoUrl = new URL('/logo.PNG', request.url);
    const response = await fetch(logoUrl.toString(), {
      cf: { cacheTtl: 86400, cacheEverything: true }
    });
    if (!response.ok) return '';
    const bytes = new Uint8Array(await response.arrayBuffer());
    return `data:image/png;base64,${toBase64(bytes)}`;
  } catch {
    return '';
  }
}

function logoBlock(dataUri) {
  if (!dataUri) {
    return `<g transform="translate(800 78)">
      <rect x="-188" y="0" width="376" height="96" rx="48" fill="${CREAM}"/>
      <text x="0" y="63" text-anchor="middle" fill="${NAVY}" font-family="Tahoma, Arial, sans-serif" font-size="34" font-weight="800">MedLife</text>
    </g>`;
  }
  return `<g transform="translate(800 78)">
    <rect x="-214" y="0" width="428" height="104" rx="52" fill="${CREAM}"/>
    <image href="${dataUri}" x="-184" y="12" width="368" height="80" preserveAspectRatio="xMidYMid meet"/>
  </g>`;
}

function svg(article, logoUri) {
  const title = String(article?.title_ar || 'مقال طبي').trim();
  const category = String(article?.category || 'المكتبة الطبية').trim();
  const theme = themeFor(category);
  const seed = hash(`${article?.id || ''}:${title}:${category}`);
  const lines = wrapArabic(title, 31 + (seed % 5), 3);

  let titleSize = 62;
  if (title.length > 65) titleSize = 56;
  if (title.length > 90) titleSize = 50;
  if (title.length > 115) titleSize = 46;

  const titleY = 370 - ((lines.length - 1) * 34);
  const titleText = lines
    .map((line, index) => `<tspan x="800" dy="${index === 0 ? 0 : Math.round(titleSize * 1.22)}">${esc(line)}</tspan>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="0.62" stop-color="${NAVY_2}"/>
      <stop offset="1" stop-color="#0D1B31"/>
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="34%" r="58%">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity=".25"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${WHITE}" stop-opacity=".11"/>
      <stop offset="1" stop-color="${WHITE}" stop-opacity=".035"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="34"/></filter>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>

  <circle cx="1385" cy="205" r="205" fill="${theme.accent}" opacity=".055" filter="url(#blur)"/>
  <circle cx="270" cy="790" r="170" fill="${BLUE}" opacity=".045" filter="url(#blur)"/>

  <path d="M0 770C275 680 500 747 730 671c228-75 410-159 870-94V900H0Z" fill="#091427" opacity=".36"/>

  <g opacity=".12">
    <path d="M0 214H1600M0 286H1600M0 358H1600M0 430H1600M0 502H1600M0 574H1600M0 646H1600" stroke="${WHITE}" stroke-width="1"/>
  </g>

  ${logoBlock(logoUri)}

  <g transform="translate(800 203)">
    <rect x="-250" y="0" width="500" height="54" rx="27" fill="${theme.accent}" opacity=".14" stroke="${theme.accent}" stroke-width="1" stroke-opacity=".38"/>
    <text x="0" y="36" text-anchor="middle" fill="${CREAM}" opacity=".9" font-family="Tahoma, Arial, sans-serif" font-size="22" font-weight="700" direction="rtl">${esc(theme.label)}</text>
  </g>

  <g transform="translate(800 270)">
    <rect x="-560" y="0" width="1120" height="330" rx="50" fill="url(#panel)" stroke="${WHITE}" stroke-width="1" stroke-opacity=".12"/>
    <rect x="-8" y="-18" width="16" height="368" rx="8" fill="${PINK}" opacity=".92"/>
    <text x="0" y="${titleY}" text-anchor="middle" fill="${WHITE}" font-family="Tahoma, Arial, sans-serif" font-size="${titleSize}" font-weight="800" direction="rtl">
      ${titleText}
    </text>
    <rect x="-108" y="250" width="216" height="4" rx="2" fill="${theme.accent}" opacity=".9"/>
    <text x="0" y="292" text-anchor="middle" fill="${CREAM}" opacity=".56" font-family="Tahoma, Arial, sans-serif" font-size="17">MEDLIFE MEDICAL LIBRARY</text>
  </g>

  ${motif(theme, seed)}

  <g opacity=".74">
    <circle cx="1320" cy="472" r="245" fill="none" stroke="${WHITE}" stroke-width="1" opacity=".16"/>
    <circle cx="1320" cy="472" r="282" fill="none" stroke="${theme.accent}" stroke-width="2" opacity=".10" stroke-dasharray="4 18"/>
  </g>

  <g transform="translate(800 782)">
    <circle cx="-140" cy="0" r="4" fill="${PINK}"/>
    <text x="-120" y="7" fill="${CREAM}" opacity=".46" font-family="Arial, sans-serif" font-size="15" letter-spacing="2">HEALTH · KNOWLEDGE · COMMUNITY</text>
  </g>
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

  const logoUri = await logoDataUri(request);
  return new Response(svg(article, logoUri), {
    headers: {
      'content-type': 'image/svg+xml; charset=UTF-8',
      'cache-control': 'public, max-age=3600, must-revalidate',
      'x-content-type-options': 'nosniff'
    }
  });
}
