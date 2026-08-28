const READER_ASSET = "/article-reader-v5.html";

export async function onRequestGet(context) {
  const slug = String(context.params.slug || "").trim();
  if (!slug || slug.includes("/") || slug === "." || slug === "..") {
    return new Response("Not found", { status: 404 });
  }

  const assetResponse = await context.env.ASSETS.fetch(
    new URL(READER_ASSET, context.request.url),
  );
  if (!assetResponse.ok) return assetResponse;

  const html = await assetResponse.text();
  const bootstrap = `<script>window.__MEDLIFE_ARTICLE_ROUTE__=${JSON.stringify(slug)};</script>`;
  const patched = html.replace(/<head>/i, `<head>${bootstrap}`);
  const canonical = new URL(`/articles/${encodeURIComponent(slug)}`, context.request.url).href;

  return new Response(patched, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "public, max-age=60, s-maxage=300",
      link: `<${canonical}>; rel="canonical"`,
    },
  });
}
