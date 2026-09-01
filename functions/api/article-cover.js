const NAVY = '#151D36';
const NAVY_2 = '#213B59';
const BLUE = '#5B97B7';
const PALE_BLUE = '#EAF3F7';
const RED = '#C53952';
const CREAM = '#FAF8F4';
const WHITE = '#FFFFFF';
const BORDER = '#DCE6EC';

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

function wrapArabic(text, maxChars = 27, maxLines = 3) {
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
    return { accent: '#A26F88', soft: '#F2EAF0', type: 'women' };
  }
  if (key.includes('طفل') || key.includes('أطفال') || key.includes('طب الأطفال')) {
    return { accent: '#5D9FB0', soft: '#E9F4F6', type: 'child' };
  }
  if (key.includes('قلب') || key.includes('cardio')) {
    return { accent: '#BE586D', soft: '#F5E9ED', type: 'heart' };
  }
  if (key.includes('صدر') || key.includes('تنفس') || key.includes('رئة')) {
    return { accent: '#6B9FBA', soft: '#EAF3F7', type: 'lungs' };
  }
  if (key.includes('طوارئ') || key.includes('إسعاف') || key.includes('emergency')) {
    return { accent: '#D37B67', soft: '#F7ECE8', type: 'emergency' };
  }
  if (key.includes('بحث') || key.includes('تشخيص') || key.includes('تحاليل') || key.includes('diagn')) {
    return { accent: '#607DA5', soft: '#EBEFF6', type: 'research' };
  }
  if (key.includes('تعليم') || key.includes('تثقيف') || key.includes('education')) {
    return { accent: '#8779A5', soft: '#F0EDF6', type: 'education' };
  }
  return { accent: BLUE, soft: PALE_BLUE, type: 'medical' };
}

function motif(theme, seed) {
  const a = (seed % 20) - 10;
  const stroke = `fill="none" stroke="${theme.accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"`;

  if (theme.type === 'women') {
    return `<g transform="translate(1275 486) rotate(${a})"><circle r="192" fill="${theme.soft}"/><circle r="158" ${stroke} opacity=".78"/><path d="M0-116c-76 0-122 58-122 126 0 72 63 101 122 136 59-35 122-64 122-136 0-68-46-126-122-126z" ${stroke}/><path d="M0-88v114M-48-22h96M-30 69c14 12 46 12 60 0" ${stroke} opacity=".80"/></g>`;
  }

  if (theme.type === 'child') {
    return `<g transform="translate(1275 486) rotate(${a})"><circle r="192" fill="${theme.soft}"/><circle cx="-66" cy="-42" r="48" ${stroke}/><circle cx="66" cy="-42" r="48" ${stroke}/><path d="M-142 100c22-66 93-77 142 0 49-77 120-66 142 0" ${stroke}/><path d="M-30-136q30-36 60 0" ${stroke} opacity=".76"/></g>`;
  }

  if (theme.type === 'heart') {
    return `<g transform="translate(1275 486) rotate(${a})"><circle r="194" fill="${theme.soft}"/><path d="M0 156C-38 119-148 53-148-36c0-58 38-99 88-99 31 0 50 15 60 43 10-28 29-43 60-43 50 0 88 41 88 99 0 89-110 155-148 192z" ${stroke}/><path d="M-110 8h39l25-40 31 96 27-52h66" ${stroke} opacity=".82"/></g>`;
  }

  if (theme.type === 'lungs') {
    return `<g transform="translate(1275 486) rotate(${a})"><circle r="194" fill="${theme.soft}"/><path d="M0-144v290M-14-62C-110-104-160-31-160 54c0 69 47 116 103 83 34-20 45-52 43-91zM14-62C110-104 160-31 160 54c0 69-47 116-103 83-34-20-45-52-43-91z" ${stroke}/><path d="M0-100l-61 52M0-100l61 52" ${stroke} opacity=".70"/></g>`;
  }

  if (theme.type === 'emergency') {
    return `<g transform="translate(1275 486) rotate(${a})"><circle r="192" fill="${theme.soft}"/><rect x="-122" y="-122" width="244" height="244" rx="52" ${stroke}/><path d="M0-73v146M-73 0h146" stroke="${theme.accent}" stroke-width="24" stroke-linecap="round"/></g>`;
  }

  if (theme.type === 'research') {
    return `<g transform="translate(1275 486) rotate(${a})"><circle r="192" fill="${theme.soft}"/><circle r="118" ${stroke}/><circle r="56" ${stroke} opacity=".62"/><path d="M84 84l102 102" ${stroke}/><path d="M-78 12h34l23-48 28 96 28-48h54" ${stroke} opacity=".72"/></g>`;
  }

  if (theme.type === 'education') {
    return `<g transform="translate(1275 486) rotate(${a})"><circle r="192" fill="${theme.soft}"/><path d="M-136-74q86-43 136 11v162q-50-43-136-12zM136-74Q50-117 0-63v162q50-43 136-12z" ${stroke}/><path d="M0-54v151" ${stroke} opacity=".66"/><path d="M-91-36h46M91-36H45M-91 12h46M91 12H45" ${stroke} opacity=".52"/></g>`;
  }

  return `<g transform="translate(1275 486) rotate(${a})"><circle r="192" fill="${theme.soft}"/><circle r="126" ${stroke}/><path d="M0-94v188M-94 0h188" stroke="${theme.accent}" stroke-width="20" stroke-linecap="round"/><circle r="158" fill="none" stroke="${theme.accent}" stroke-width="3" opacity=".35"/></g>`;
}

function logo() {
  return `
    <g>
      <rect x="86" y="68" width="300" height="108" rx="54" fill="${WHITE}" stroke="${BORDER}" stroke-width="2"/>
      <image href="/logo.PNG?v=article-cover-v7" x="112" y="79" width="248" height="86" preserveAspectRatio="xMidYMid meet"/>
    </g>`;
}

function svg(article) {
  const title = String(article?.title_ar || 'مقال طبي').trim();
  const category = String(article?.category || 'المكتبة الطبية').trim();
  const theme = themeFor(category);
  const seed = hash(`${article?.id || ''}:${title}:${category}`);
  const lines = wrapArabic(title, 25 + (seed % 3), 3);
  const titleSize = Math.max(45, Math.min(70, 70 - Math.max(0, title.length - 34) * 0.38));
  const titleText = lines
    .map((line, index) => `<tspan x="900" dy="${index ? Math.round(titleSize * 1.18) : 0}">${esc(line)}</tspan>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${CREAM}"/>
      <stop offset="1" stop-color="#EEF3F6"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY_2}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity=".28"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.5" fill="${NAVY}" opacity=".07"/>
    </pattern>
  </defs>

  <rect width="1600" height="900" fill="url(#base)"/>
  <rect x="0" y="0" width="1600" height="900" fill="url(#dots)"/>

  <path d="M920 0H1600V900H1010C1090 790 1120 650 1102 506C1082 344 1018 206 920 0Z" fill="url(#panel)"/>
  <path d="M1010 0H1600V132C1450 177 1310 170 1180 122C1114 98 1058 56 1010 0Z" fill="${BLUE}" opacity=".10"/>
  <path d="M1040 900H1600V758C1448 704 1305 717 1174 790C1118 821 1072 860 1040 900Z" fill="${BLUE}" opacity=".08"/>

  <ellipse cx="1280" cy="466" rx="300" ry="315" fill="url(#halo)"/>
  ${motif(theme, seed)}

  ${logo()}

  <g transform="translate(98 252)">
    <rect width="760" height="392" rx="36" fill="${WHITE}" stroke="${BORDER}" stroke-width="2"/>
    <rect x="0" y="0" width="8" height="392" rx="4" fill="${theme.accent}"/>

    <text x="700" y="74" text-anchor="end" fill="${NAVY}" opacity=".58" font-family="Arial, sans-serif" font-size="21" font-weight="700">${esc(category)}</text>

    <text x="700" y="158" text-anchor="end" fill="${NAVY}" font-family="Arial, sans-serif" font-size="${Math.round(titleSize)}" font-weight="800" direction="rtl" unicode-bidi="plaintext">
      ${titleText}
    </text>

    <rect x="510" y="300" width="190" height="6" rx="3" fill="${theme.accent}"/>
    <rect x="595" y="320" width="105" height="6" rx="3" fill="${NAVY}" opacity=".12"/>
    <text x="700" y="360" text-anchor="end" fill="${NAVY}" opacity=".42" font-family="Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="1.3">MEDLIFE MEDICAL LIBRARY</text>
  </g>

  <g transform="translate(1125 760)">
    <rect width="310" height="58" rx="29" fill="${WHITE}" opacity=".10"/>
    <circle cx="30" cy="29" r="6" fill="${theme.accent}"/>
    <text x="52" y="36" fill="${WHITE}" opacity=".72" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="1.5">HEALTH · KNOWLEDGE · COMMUNITY</text>
  </g>
</svg>`;
}

export async function onRequestGet({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!env.DB || !Number.isInteger(id) || id <= 0) return new Response('Not found', { status: 404 });

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
