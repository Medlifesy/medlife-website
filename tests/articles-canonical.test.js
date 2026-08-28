// Lightweight regression checks for the public article URL contract.
// The public URL is handled by the dynamic /articles/[slug] route and rendered
// through article-reader-v5 without changing the browser URL.
const fs = require('node:fs');

const redirects = fs.readFileSync('_redirects', 'utf8');
const route = fs.readFileSync('functions/articles/[slug].js', 'utf8');
const reader = fs.readFileSync('article-reader-v5.html', 'utf8');

if (/^\/articles\/(?!\*)\S+\s+\/article-reader-v5\.html/im.test(redirects)) {
  throw new Error('Article-specific redirect/rewrite detected');
}

if (/^\/articles\/\*\s+\/article-reader-v5\.html/im.test(redirects)) {
  throw new Error('Legacy global article rewrite must not own canonical routing');
}

if (!route.includes('context.params.slug')) {
  throw new Error('Missing dynamic /articles/[slug] route');
}

if (!route.includes('/article-reader-v5.html')) {
  throw new Error('Dynamic article route must render the shared Article Reader');
}

if (!route.includes('window.__MEDLIFE_ARTICLE_ROUTE__')) {
  throw new Error('Article route slug is not passed to the shared renderer');
}

if (!route.includes('medlife-ai-gateway.broad-frog-3978.workers.dev')) {
  throw new Error('Public article route is not connected to MedLife AI Gateway');
}

if (!route.includes('rel="canonical"')) {
  throw new Error('Dynamic article route is missing canonical metadata');
}

if (/location\.replace\([^)]*article-reader-v5/i.test(route)) {
  throw new Error('Dynamic article route must never redirect users to the reader');
}

if (!reader.includes("const pathSlug=decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')")) {
  throw new Error('Article Reader does not read the canonical slug from the route');
}

if (/history\.replaceState\([^)]*\/articles\//i.test(reader)) {
  throw new Error('Article Reader must never rewrite the public canonical URL');
}

console.log('Article canonical routing contract: OK');
