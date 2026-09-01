const NAVY = '#12203A';
const NAVY_2 = '#1B3152';
const CREAM = '#FBFAF8';
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

function toBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function getLogoDataUri(request) {
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

function renderCover(logoUri) {
  const logo = logoUri
    ? `<image href="${logoUri}" x="520" y="255" width="560" height="390" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="800" y="468" text-anchor="middle" fill="${NAVY}" font-family="Arial, Tahoma, sans-serif" font-size="72" font-weight="700">MedLife</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="MedLife">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="0.58" stop-color="${NAVY_2}"/>
      <stop offset="1" stop-color="#0C1A2D"/>
    </linearGradient>
    <radialGradient id="pinkGlow" cx="85%" cy="22%" r="42%">
      <stop offset="0" stop-color="${PINK}" stop-opacity=".34"/>
      <stop offset="1" stop-color="${PINK}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blueGlow" cx="8%" cy="88%" r="46%">
      <stop offset="0" stop-color="${BLUE}" stop-opacity=".24"/>
      <stop offset="1" stop-color="${BLUE}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="38"/></filter>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#pinkGlow)"/>
  <rect width="1600" height="900" fill="url(#blueGlow)"/>

  <circle cx="1335" cy="190" r="150" fill="${PINK}" opacity=".10" filter="url(#blur)"/>
  <circle cx="270" cy="735" r="170" fill="${BLUE}" opacity=".08" filter="url(#blur)"/>

  <g fill="none" stroke-linecap="round">
    <path d="M-80 700C180 600 375 620 550 720s350 145 690 18 560-135 610-112" stroke="${BLUE}" stroke-width="2" opacity=".24"/>
    <path d="M-110 748C160 643 375 665 560 765s346 128 672-3 520-150 600-126" stroke="${BLUE}" stroke-width="1" opacity=".16"/>
    <path d="M980 94c190 28 342 105 482 228" stroke="${PINK}" stroke-width="3" opacity=".32"/>
    <path d="M1040 56c145 30 294 102 412 199" stroke="${PINK}" stroke-width="1" opacity=".18"/>
  </g>

  <g transform="translate(800 450)">
    <circle r="250" fill="${CREAM}" opacity=".035"/>
    <circle r="215" fill="none" stroke="${CREAM}" stroke-width="1" opacity=".09"/>
    <circle r="185" fill="none" stroke="${PINK}" stroke-width="2" opacity=".23" stroke-dasharray="3 16"/>
  </g>

  <rect x="0" y="0" width="1600" height="12" fill="${PINK}" opacity=".9"/>
  <rect x="0" y="888" width="1600" height="12" fill="${BLUE}" opacity=".55"/>

  <g>
    <rect x="500" y="240" width="600" height="420" rx="48" fill="${CREAM}" opacity=".06" stroke="${CREAM}" stroke-width="1" stroke-opacity=".13"/>
    ${logo}
  </g>
</svg>`;
}

export async function onRequestGet({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get('id'));

  if (!env.DB || !Number.isInteger(id) || id <= 0) {
    return new Response('Not found', { status: 404 });
  }

  const article = await env.DB.prepare(
    "SELECT id FROM articles WHERE id=? AND status='published' LIMIT 1"
  ).bind(id).first();

  if (!article) {
    return new Response('Not found', { status: 404 });
  }

  const logoUri = await getLogoDataUri(request);

  return new Response(renderCover(logoUri), {
    headers: {
      'content-type': 'image/svg+xml; charset=UTF-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      'x-content-type-options': 'nosniff'
    }
  });
}
