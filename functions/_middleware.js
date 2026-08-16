export async function onRequest(context) {
  // Keep the static website completely transparent.
  // Do not rewrite HTML pages or inject scripts at the middleware layer.
  // Each page loads its own scripts explicitly, which prevents routing
  // and navigation failures on Cloudflare Pages.
  return context.next();
}
