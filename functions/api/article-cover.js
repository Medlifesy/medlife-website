const NAVY = '#12203A';
const CREAM = '#FBFAF8';
const PINK = '#E92850';
const WHITE = '#FFFFFF';

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

function renderCover(title, logoUri) {
  const aria = esc(title || 'MedLife');

  // Deliberately minimal: the article cover contains only the MedLife logo.
  // 1600x900 keeps a true 16:9 ratio for article cards and social previews.
  const logo = logoUri
    ? `<image href="${logoUri}" x="505" y="220" width="590" height="460" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="800" y="470" text-anchor="middle" fill="${NAVY}" font-family="Arial, Tahoma, sans-serif" font-size="74" font-weight="700">MedLife</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${aria}">
  <rect width="1600" height="900" rx="34" fill="${CREAM}"/>

  <rect x="0" y="0" width="1600" height="20" fill="${NAVY}"/>
  <rect x="0" y="880" width="1600" height="20" fill="${PINK}"/>

  ${logo}
</svg>`;
}

export async function onRequestGet({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get('id'));

  if (!env.DB || !Number.isInteger(id) || id <= 0) {
    return new Response('Not found', { status: 404 });
  }

  const article = await env.DB.prepare(
    "SELECT id,title_ar FROM articles WHERE id=? AND status='published' LIMIT 1"
  ).bind(id).first();

  if (!article) {
    return new Response('Not found', { status: 404 });
  }

  const logoUri = await getLogoDataUri(request);

  return new Response(renderCover(article.title_ar, logoUri), {
    headers: {
      'content-type': 'image/svg+xml; charset=UTF-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      'x-content-type-options': 'nosniff'
    }
  });
}
