const READER_ASSET = "/article-reader-v8.html";

function jsonArticle(row){
  if(!row) return null;
  return {
    id: row.id,
    title_ar: row.title_ar,
    title_en: row.title_en,
    excerpt_ar: row.excerpt_ar,
    excerpt_en: row.excerpt_en,
    content_ar: row.content_ar,
    content_en: row.content_en,
    author_name: row.author_name,
    category: row.category,
    image_url: row.image_url,
    slug: row.slug,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export async function onRequestGet(context) {
  const slug = String(context.params.slug || "").trim();
  if (!slug || slug.includes("/") || slug === "." || slug === "..") {
    return new Response("Not found", { status: 404 });
  }

  if(!context.env.DB){
    return new Response("Article service unavailable", { status: 502 });
  }

  try {
    // Resolve the canonical slug directly from the MedLife article database.
    // This keeps Arabic/Unicode slugs reliable and avoids path-encoding issues
    // when calling the external article worker.
    const article = await context.env.DB
      .prepare("SELECT * FROM articles WHERE slug = ? AND status = 'published' LIMIT 1")
      .bind(slug)
      .first();

    if (!article) return new Response("Not found", { status: 404 });

    const assetResponse = await context.env.ASSETS.fetch(new URL(READER_ASSET, context.request.url));
    if (!assetResponse.ok) return assetResponse;

    const html = await assetResponse.text();
    const safeSlug = JSON.stringify(slug);
    const safeArticle = JSON.stringify(jsonArticle(article));
    const bootstrap = `<script>(function(){const article=${safeArticle};window.__MEDLIFE_ARTICLE__=article;window.__MEDLIFE_ARTICLE_ROUTE__=${safeSlug};})();</script>`;
    const patched = html.replace(/<head>/i, `<head>${bootstrap}`);
    const canonical = new URL(`/articles/${encodeURIComponent(article.slug || slug)}`, context.request.url).href;

    return new Response(patched, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=UTF-8",
        "cache-control": "no-store",
        "link": `<${canonical}>; rel="canonical"`,
        "x-medlife-article-renderer": "article-reader-v8",
        "x-medlife-article-route": article.slug || slug,
      },
    });
  } catch(error) {
    console.error('Public article route error:', error);
    return new Response("Article service unavailable", { status: 502 });
  }
}
