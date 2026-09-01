const NAVY = '#151D36';
const BLUE = '#2D5F8B';
const SKY = '#78AFC8';
const RED = '#B21F45';
const CREAM = '#FBF7F2';
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
    return { accent: '#C96A83', type: 'women', label: 'صحة المرأة' };
  }
  if (key.includes('طفل') || key.includes('أطفال') || key.includes('طب الأطفال')) {
    return { accent: '#58A6B8', type: 'child', label: 'صحة الطفل' };
  }
  if (key.includes('قلب') || key.includes('cardio')) {
    return { accent: '#D66072', type: 'heart', label: 'صحة القلب' };
  }
  if (key.includes('صدر') || key.includes('تنفس') || key.includes('رئة')) {
    return { accent: '#6FA8C6', type: 'lungs', label: 'الجهاز التنفسي' };
  }
  if (key.includes('طوارئ') || key.includes('إسعاف') || key.includes('emergency')) {
    return { accent: '#E9826A', type: 'emergency', label: 'الطوارئ والإسعاف' };
  }
  if (key.includes('بحث') || key.includes('تشخيص') || key.includes('تحاليل') || key.includes('diagn')) {
    return { accent: '#628FC4', type: 'research', label: 'التشخيص والبحث الطبي' };
  }
  if (key.includes('تعليم') || key.includes('تثقيف') || key.includes('education')) {
    return { accent: '#8977B4', type: 'education', label: 'التعليم والتثقيف الطبي' };
  }
  return { accent: SKY, type: 'medical', label: 'المكتبة الطبية' };
}

function motif(theme, seed) {
  const angle = (seed % 22) - 11;
  const common = `fill="none" stroke="${theme.accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"`;
  if (theme.type === 'women') {
    return `<g transform="translate(1260 490) rotate(${angle})"><circle r="170" fill="${theme.accent}" opacity=".10"/><circle r="142" ${common} opacity=".30"/><path d="M0-118c-70 0-110 54-110 116 0 78 70 102 110 138 40-36 110-60 110-138 0-62-40-116-110-116z" ${common}/><path d="M0-86v126M-48-22h96M-30 74c10 12 50 12 60 0" ${common}/></g>`;
  }
  if (theme.type === 'child') {
    return `<g transform="translate(1260 490) rotate(${angle})"><circle r="170" fill="${theme.accent}" opacity=".10"/><circle cx="-62" cy="-45" r="45" ${common}/><circle cx="62" cy="-45" r="45" ${common}/><path d="M-132 88c18-55 82-66 132 0 50-66 114-55 132 0" ${common}/><path d="M-24-132q24-32 48 0" ${common} opacity=".70"/></g>`;
  }
  if (theme.type === 'heart') {
    return `<g transform="translate(1260 490) rotate(${angle})"><circle r="176" fill="${theme.accent}" opacity=".10"/><path d="M0 152C-34 116-142 52-142-34c0-58 38-95 85-95 30 0 47 14 57 41 10-27 27-41 57-41 47 0 85 37 85 95 0 86-108 150-142 186z" ${common}/><path d="M-98 6h34l24-40 32 94 24-52h62" ${common}/></g>`;
  }
  if (theme.type === 'lungs') {
    return `<g transform="translate(1260 490) rotate(${angle})"><circle r="176" fill="${theme.accent}" opacity=".10"/><path d="M0-138v276M-10-58C-104-98-150-30-150 50c0 66 44 110 98 80 30-16 42-48 42-86zM10-58c94-40 140 28 140 108 0 66-44 110-98 80-30-16-42-48-42-86z" ${common}/><path d="M0-92-56-44M0-92l56 48" ${common} opacity=".70"/></g>`;
  }
  if (theme.type === 'emergency') {
    return `<g transform="translate(1260 490) rotate(${angle})"><circle r="170" fill="${theme.accent}" opacity=".10"/><rect x="-122" y="-122" width="244" height="244" rx="52" ${common}/><path d="M0-70v140M-70 0h140" stroke="${theme.accent}" stroke-width="24"/></g>`;
  }
  if (theme.type === 'research') {
    return `<g transform="translate(1260 490) rotate(${angle})"><circle r="172" fill="${theme.accent}" opacity=".10"/><circle r="110" ${common}/><circle r="54" ${common} opacity=".65"/><path d="M78 78l100 100" ${common}/><path d="M-78 10h34l22-46 28 92 28-46h54" ${common} opacity=".70"/></g>`;
  }
  if (theme.type === 'education') {
    return `<g transform="translate(1260 490) rotate(${angle})"><circle r="172" fill="${theme.accent}" opacity=".10"/><path d="M-132-70q82-42 132 10v154q-50-42-132-12zM132-70Q50-112 0-60v154q50-42 132-12z" ${common}/><path d="M0-52v144" ${common} opacity=".68"/><path d="M-88-36h48M88-36H40M-88 10h46M88 10H42" ${common} opacity=".55"/></g>`;
  }
  return `<g transform="translate(1260 490) rotate(${angle})"><circle r="172" fill="${theme.accent}" opacity=".10"/><circle r="118" ${common}/><path d="M0-88v176M-88 0h176" stroke="${theme.accent}" stroke-width="20"/><circle r="148" fill="none" stroke="${theme.accent}" stroke-width="3" opacity=".32"/></g>`;
}

function logo() {
  return `<g><rect x="84" y="64" width="300" height="98" rx="49" fill="${WHITE}" opacity=".98"/><image href="https://www.medlifesy.org/logo.PNG" x="108" y="76" width="252" height="74" preserveAspectRatio="xMidYMid meet"/></g>`;
}

function svg(article) {
  const title = String(article?.title_ar || 'مقال طبي').trim();
  const category = String(article?.category || 'المكتبة الطبية').trim();
  const theme = themeFor(category);
  const seed = hash(`${article?.id || ''}:${title}:${category}`);
  const lines = wrapArabic(title, 26 + (seed % 4), 3);
  const titleSize = Math.max(42, Math.min(58, 58 - Math.max(0, title.length - 36) * 0.24));
  const titleText = lines.map((line, i) => `<tspan x="870" dy="${i ? Math.round(titleSize * 1.18) : 0}">${esc(line)}</tspan>`).join('');
  const dotCount = 10 + (seed % 7);
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const x = 980 + ((seed + i * 83) % 480);
    const y = 110 + ((seed + i * 47) % 680);
    const r = 2 + ((seed + i) % 4);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${theme.accent}" opacity=".24"/>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="0.58" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="#19344F"/>
    </linearGradient>
    <radialGradient id="light" cx="78%" cy="36%" r="60%">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity=".30"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${WHITE}" stop-opacity=".13"/>
      <stop offset="1" stop-color="${WHITE}" stop-opacity=".035"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="28"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#light)"/>
  <g opacity=".7">${dots}</g>
  <g opacity=".18" filter="url(#soft)"><circle cx="1380" cy="170" r="140" fill="${theme.accent}"/><circle cx="1030" cy="760" r="150" fill="${RED}"/></g>
  <path d="M0 770C250 680 430 742 660 666c220-74 390-176 620-116 160 42 220 28 320 0V900H0Z" fill="#0F1B30" opacity=".28"/>
  ${logo()}
  <g transform="translate(104 218)">
    <rect width="730" height="448" rx="38" fill="url(#glass)" stroke="${WHITE}" stroke-width="2" opacity=".95"/>
    <rect width="8" height="448" rx="4" fill="${theme.accent}"/>
    <text x="682" y="80" text-anchor="end" fill="${CREAM}" opacity=".78" font-family="Arial, sans-serif" font-size="21" font-weight="700">${esc(theme.label)}</text>
    <text x="682" y="166" text-anchor="end" fill="${WHITE}" font-family="Arial, sans-serif" font-size="${Math.round(titleSize)}" font-weight="800" direction="rtl" unicode-bidi="plaintext">${titleText}</text>
    <rect x="470" y="342" width="212" height="6" rx="3" fill="${theme.accent}"/>
    <rect x="566" y="361" width="116" height="6" rx="3" fill="${WHITE}" opacity=".24"/>
    <text x="682" y="410" text-anchor="end" fill="${CREAM}" opacity=".58" font-family="Arial, sans-serif" font-size="16" letter-spacing="2">MEDLIFE MEDICAL LIBRARY</text>
  </g>
  ${motif(theme, seed)}
  <g opacity=".50">
    <circle cx="1260" cy="490" r="222" fill="none" stroke="${WHITE}" stroke-width="1"/>
    <circle cx="1260" cy="490" r="250" fill="none" stroke="${theme.accent}" stroke-width="2" opacity=".25" stroke-dasharray="3 14"/>
  </g>
  <text x="1510" y="840" text-anchor="end" fill="${WHITE}" opacity=".42" font-family="Arial, sans-serif" font-size="17" letter-spacing="2">HEALTH · KNOWLEDGE · COMMUNITY</text>
</svg>`;
}

export async function onRequestGet({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!env.DB || !Number.isInteger(id) || id <= 0) return new Response('Not found', { status: 404 });
  const article = await env.DB.prepare("SELECT id,title_ar,category,status FROM articles WHERE id=? AND status='published' LIMIT 1").bind(id).first();
  if (!article) return new Response('Not found', { status: 404 });
  return new Response(svg(article), {
    headers: {
      'content-type': 'image/svg+xml; charset=UTF-8',
      'cache-control': 'public, max-age=3600, must-revalidate',
      'x-content-type-options': 'nosniff'
    }
  });
}
