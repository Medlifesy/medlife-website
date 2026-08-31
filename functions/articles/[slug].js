const READER_ASSET = "/article-reader-v6.html";
const ARTICLES_WORKER = "https://medlife-articles-api.broad-frog-3978.workers.dev/public/articles";

export async function onRequestGet(context) {
  const slug = String(context.params.slug || "").trim();
  if (!slug || slug.includes("/") || slug === "." || slug === "..") return new Response("Not found", { status: 404 });

  const direct = await fetch(`${ARTICLES_WORKER}/${encodeURIComponent(slug)}`, { headers: { Accept: "application/json" } });
  if (direct.status === 404) return new Response("Not found", { status: 404 });
  if (!direct.ok) return new Response("Article service unavailable", { status: 502 });
  const article = await direct.json();
  if (!article || article.status !== "published") return new Response("Not found", { status: 404 });

  const assetResponse = await context.env.ASSETS.fetch(new URL(READER_ASSET, context.request.url));
  if (!assetResponse.ok) return assetResponse;

  const html = await assetResponse.text();
  const safeSlug = JSON.stringify(slug);
  const safeArticle = JSON.stringify({
    id: article.id,
    title_ar: article.title_ar,
    title_en: article.title_en,
    excerpt_ar: article.excerpt_ar,
    excerpt_en: article.excerpt_en,
    content_ar: article.content_ar,
    content_en: article.content_en,
    author_name: article.author_name,
    category: article.category,
    image_url: article.image_url,
    slug: article.slug,
    published_at: article.published_at,
    created_at: article.created_at,
    updated_at: article.updated_at
  });

  const bootstrap = `<script>(function(){const article=${safeArticle};window.__MEDLIFE_ARTICLE__=article;window.__MEDLIFE_ARTICLE_ROUTE__=${safeSlug};})();</script>`;
  const patched = html.replace(/<head>/i, `<head>${bootstrap}`);
  const canonical = new URL(`/articles/${encodeURIComponent(article.slug || slug)}`, context.request.url).href;

  return new Response(patched, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store",
      "link": `<${canonical}>; rel="canonical"`,
      "x-medlife-article-renderer": "article-reader-v6-d1",
      "x-medlife-article-route": article.slug || slug,
    },
  });
}
