export async function onRequest(context) {
  // Let Cloudflare Pages resolve the clean URL to the existing static HTML asset.
  // Do not fetch the .html path manually: Pages may normalize .html back to
  // the clean URL, which can create a redirect loop.
  return context.next();
}
