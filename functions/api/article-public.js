export async function onRequest({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=60, s-maxage=300'
  };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'GET') return json({ success: false, error: 'Method not allowed.' }, 405, cors);
  if (!env.DB) return json({ success: false, error: 'Database unavailable.' }, 500);

  try {
    await ensureCanonicalColumns(env.DB);
    const url = new URL(request.url);
    const rawId = url.searchParams.get('id');
    const rawSlug = url.searchParams.get('slug');
    const id = Number(rawId);
    const slug = normalizeSlug(rawSlug);

    let article = null;
    if (Number.isInteger(id) && id > 0) {
      article = await env.DB.prepare(`
        SELECT id,title_ar,title_en,content_ar,content_en,excerpt_ar,excerpt_en,
               author_member_id,author_name,author_email,category,image_url,status,
               slug,canonical_path,published_at,created_at,updated_at
        FROM articles WHERE id=? AND status='published' LIMIT 1
      `).bind(id).first();
    } else if (slug) {
      article = await env.DB.prepare(`
        SELECT id,title_ar,title_en,content_ar,content_en,excerpt_ar,excerpt_en,
               author_member_id,author_name,author_email,category,image_url,status,
               slug,canonical_path,published_at,created_at,updated_at
        FROM articles WHERE slug=? AND status='published' LIMIT 1
      `).bind(slug).first();
    }

    if (!article) return json({ success: false, error: 'المقال غير موجود أو غير منشور.' }, 404, cors);

    const canonicalSlug = normalizeSlug(article.slug) || `article-${article.id}`;
    const canonicalPath = `/articles/${canonicalSlug}`;
    if (article.slug !== canonicalSlug || article.canonical_path !== canonicalPath) {
      await env.DB.prepare(`UPDATE articles SET slug=?,canonical_path=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(canonicalSlug, canonicalPath, article.id).run();
      article.slug = canonicalSlug;
      article.canonical_path = canonicalPath;
    }

    return json({
      success: true,
      article: {
        ...article,
        title: article.title_ar || article.title_en || '',
        content: article.content_ar || article.content_en || '',
        excerpt: article.excerpt_ar || article.excerpt_en || '',
        public_url: canonicalPath,
        canonical_url: canonicalPath
      }
    }, 200, cors);
  } catch (error) {
    console.error('Public article API error:', error);
    return json({ success: false, error: 'تعذر تحميل المقال.' }, 500, cors);
  }
}

async function ensureCanonicalColumns(db) {
  const info = await db.prepare('PRAGMA table_info(articles)').all();
  const names = new Set((info.results || []).map((row) => row.name));
  if (!names.has('slug')) await db.prepare('ALTER TABLE articles ADD COLUMN slug TEXT').run();
  if (!names.has('canonical_path')) await db.prepare('ALTER TABLE articles ADD COLUMN canonical_path TEXT').run();
  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug) WHERE slug IS NOT NULL').run();
}

function normalizeSlug(value) {
  const raw = String(value ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!raw || raw.includes('/') || raw.includes('..') || raw.includes('\\')) return '';
  return raw.replace(/[^a-z0-9\u0600-\u06ff\u0750-\u077f-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 120);
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra }
  });
}
