export async function onRequest(context) {
  // Keep the Pages middleware intentionally minimal and fail-safe.
  // Static pages and API routes are served normally without HTML rewriting.
  return context.next();
}
