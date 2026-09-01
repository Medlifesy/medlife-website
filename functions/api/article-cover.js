const FALLBACK = '#eef1f5';
const NAVY = '#151d36';
const RED = '#b21f45';
const BURGUNDY = '#7b1738';
const CREAM = '#fffaf5';

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function hash(value) {
  let h = 0;
  for (const ch of String(value ?? '')) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function wrap(text, max = 30, lines = 3) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  const out = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      out.push(line);
      line = word;
      if (out.length === lines - 1) break;
    } else line = next;
  }
  if (out.length < lines && line) out.push(line);
  return out;
}

function icon(category) {
  const key = String(category || '').toLowerCase();
  if (key.includes('مرأة') || key.includes('نسائية')) {
    return '<circle cx="700" cy="290" r="108" fill="#fff" opacity=".12"/><path d="M700 206c-52 0-94 42-94 94 0 42 27 77 65 89v48h58v-48c38-12 65-47 65-89 0-52-42-94-94-94z" fill="none" stroke="#fff" stroke-width="13" opacity=".9"/><path d="M700 223v96m-48-48h96" stroke="#fff" stroke-width="13" stroke-linecap="round" opacity=".95"/>';
  }
  if (key.includes('أطفال') || key.includes('طفل') || key.includes('طب أطفال')) {
    return '<circle cx="700" cy="285" r="108" fill="#fff" opacity=".12"/><circle cx="665" cy="270" r="38" fill="none" stroke="#fff" stroke-width="12"/><circle cx="735" cy="270" r="38" fill="none" stroke="#fff" stroke-width="12"/><path d="M617 355c14-39 101-39 116 0m-55-83h44" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>';
  }
  if (key.includes('قلب') || key.includes('cardio')) {
    return '<circle cx="700" cy="285" r="108" fill="#fff" opacity=".12"/><path d="M700 375S605 320 605 253c0-31 23-54 53-54 19 0 34 10 42 25 8-15 23-25 42-25 30 0 53 23 53 54 0 67-95 122-95 122z" fill="none" stroke="#fff" stroke-width="13"/>';
  }
  if (key.includes('تنفس') || key.includes('صدر') || key.includes('رئة')) {
    return '<circle cx="700" cy="285" r="108" fill="#fff" opacity=".12"/><path d="M700 210v150M694 244c-55-41-93 5-93 56 0 45 37 61 82 52m24-108c55-41 93 5 93 56 0 45-37 61-82 52" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/>';
  }
  return '<circle cx="700" cy="285" r="108" fill="#fff" opacity=".12"/><path d="M700 208v154M623 285h154" stroke="#fff" stroke-width="24" stroke-linecap="round"/><circle cx="700" cy="285" r="126" fill="none" stroke="#fff" stroke-width="4" opacity=".3"/>';
}

function svg(article) {
  const title = String(article?.title_ar || 'مقال طبي').trim();
  const category = String(article?.category || 'المكتبة الطبية').trim();
  const h = hash(`${article?.id || ''}:${title}:${category}`);
  const palettes = [
    ['#151d36', '#b21f45'],
    ['#202a4a', '#8c2348'],
    ['#18243c', '#9f3150'],
    ['#26304c', '#7b1738']
  ];
  const [a, b] = palettes[h % palettes.length];
  const lines = wrap(title, 28, 3);
  const titleText = lines.map((line, i) => `<tspan x="104" dy="${i ? 62 : 0}">${esc(line)}</tspan>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/>
    <stop offset="1" stop-color="${b}"/>
  </linearGradient>
  <radialGradient id="glow" cx="80%" cy="25%" r="65%">
    <stop offset="0" stop-color="#fff" stop-opacity=".20"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="1600" height="900" fill="url(#bg)"/>
<rect width="1600" height="900" fill="url(#glow)"/>
<circle cx="1400" cy="760" r="310" fill="#fff" opacity=".045"/>
<circle cx="1480" cy="690" r="210" fill="none" stroke="#fff" stroke-width="3" opacity=".10"/>
<circle cx="1220" cy="120" r="180" fill="#fff" opacity=".035"/>
${icon(category)}
<rect x="84" y="82" width="210" height="44" rx="22" fill="#fff" opacity=".12"/>
<text x="189" y="111" fill="#fff" font-family="Arial, sans-serif" font-size="22" font-weight="700" text-anchor="middle">MEDLIFE</text>
<text x="104" y="190" fill="#fff" opacity=".82" font-family="Arial, sans-serif" font-size="24" font-weight="600">${esc(category)}</text>
<text x="104" y="355" fill="#fff" font-family="Arial, sans-serif" font-size="54" font-weight="800" direction="rtl">${titleText}</text>
<text x="104" y="650" fill="#fff" opacity=".78" font-family="Arial, sans-serif" font-size="24">MEDICAL LIBRARY · HEALTH EDUCATION</text>
<rect x="104" y="706" width="220" height="7" rx="3.5" fill="#fff" opacity=".65"/>
<rect x="104" y="726" width="120" height="7" rx="3.5" fill="#fff" opacity=".30"/>
</svg>`;
}

export async function onRequestGet({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!env.DB || !Number.isInteger(id) || id <= 0) {
    return new Response('Not found', { status: 404 });
  }
  const article = await env.DB.prepare("SELECT id,title_ar,category,status FROM articles WHERE id=? AND status='published' LIMIT 1").bind(id).first();
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
