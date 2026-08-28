// Lightweight regression checks for the public article URL contract.
// These checks intentionally inspect routing/configuration text rather than a browser runtime.
const fs = require('node:fs');
const redirects = fs.readFileSync('_redirects', 'utf8');

if (!redirects.includes('/articles/* /article-reader-v5.html?slug=:splat 200')) {
  throw new Error('Missing canonical article rewrite');
}

if (/^\/articles\/(?!\*)\S+\s+\/article-reader-v5\.html/im.test(redirects)) {
  throw new Error('Article-specific redirect/rewrite detected');
}

if (/\/article-reader-v5(?:\.html)?(?:[?#]|\s|$)/i.test(redirects.replace('/articles/* /article-reader-v5.html?slug=:splat 200', ''))) {
  throw new Error('Unexpected public reader route detected');
}

console.log('Article canonical routing contract: OK');
