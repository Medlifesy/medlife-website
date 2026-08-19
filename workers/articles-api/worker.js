// Cloudflare Worker — Articles API (D1: medlife-articles)
//
// ── PUBLIC (no auth) ──────────────────────────────────────────
//   GET  /public/articles        -> published articles only
//   GET  /public/articles/:slug  -> single published article by slug
//
// ── ADMIN (requires Authorization: Bearer <ADMIN_API_KEY>) ─────
//   GET    /articles             -> list all (optional ?status=draft|published)
//   GET    /articles/:id
//   POST   /articles
//   PUT    /articles/:id
//   DELETE /articles/:id
//   PATCH  /articles/:id/status  { "status": "draft" | "published" }
//
// Auth secret is set via: wrangler secret put ADMIN_API_KEY
// (never hardcode it here or in wrangler.toml)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isAuthorized(request, env) {
  if (!env.ADMIN_API_KEY) {
    // Fail closed: if no key is configured, admin routes are unusable
    // rather than silently open.
    return false;
  }
  const auth = request.headers.get("Authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return match[1] === env.ADMIN_API_KEY;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    try {
      // ── PUBLIC ROUTES ────────────────────────────────────────
      if (parts[0] === "public" && parts[1] === "articles") {
        if (request.method !== "GET") {
          return json({ error: "Method not allowed" }, 405);
        }

        // /public/articles
        if (parts.length === 2) {
          const { results } = await env.DB.prepare(
            "SELECT id, title, slug, excerpt, author, category, created_at, updated_at FROM articles WHERE status = 'published' ORDER BY created_at DESC"
          ).all();
          return json(results);
        }

        // /public/articles/:slug
        if (parts.length === 3) {
          const slug = parts[2];
          const article = await env.DB.prepare(
            "SELECT id, title, slug, content, excerpt, author, category, created_at, updated_at FROM articles WHERE slug = ? AND status = 'published'"
          )
            .bind(slug)
            .first();
          if (!article) return json({ error: "Article not found" }, 404);
          return json(article);
        }

        return json({ error: "Not found" }, 404);
      }

      // ── ADMIN ROUTES ─────────────────────────────────────────
      if (parts[0] === "articles") {
        if (!isAuthorized(request, env)) {
          return json({ error: "Unauthorized" }, 401);
        }

        // /articles
        if (parts.length === 1) {
          if (request.method === "GET") {
            const status = url.searchParams.get("status");
            const stmt = status
              ? env.DB.prepare(
                  "SELECT * FROM articles WHERE status = ? ORDER BY created_at DESC"
                ).bind(status)
              : env.DB.prepare("SELECT * FROM articles ORDER BY created_at DESC");
            const { results } = await stmt.all();
            return json(results);
          }

          if (request.method === "POST") {
            const body = await request.json();
            const {
              title,
              content,
              excerpt = null,
              author = null,
              category = null,
              status = "draft",
            } = body;

            if (!title || !content) {
              return json({ error: "title and content are required" }, 400);
            }
            if (!["draft", "published"].includes(status)) {
              return json({ error: "invalid status" }, 400);
            }

            const slug = body.slug ? slugify(body.slug) : slugify(title);

            const result = await env.DB.prepare(
              `INSERT INTO articles (title, slug, content, excerpt, author, category, status)
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(title, slug, content, excerpt, author, category, status)
              .run();

            const created = await env.DB.prepare(
              "SELECT * FROM articles WHERE id = ?"
            )
              .bind(result.meta.last_row_id)
              .first();

            return json(created, 201);
          }
        }

        // /articles/:id
        if (parts.length === 2) {
          const id = parts[1];

          if (request.method === "GET") {
            const article = await env.DB.prepare(
              "SELECT * FROM articles WHERE id = ?"
            )
              .bind(id)
              .first();
            if (!article) return json({ error: "Article not found" }, 404);
            return json(article);
          }

          if (request.method === "PUT") {
            const body = await request.json();
            const existing = await env.DB.prepare(
              "SELECT * FROM articles WHERE id = ?"
            )
              .bind(id)
              .first();
            if (!existing) return json({ error: "Article not found" }, 404);

            const title = body.title ?? existing.title;
            const content = body.content ?? existing.content;
            const excerpt = body.excerpt ?? existing.excerpt;
            const author = body.author ?? existing.author;
            const category = body.category ?? existing.category;
            const status = body.status ?? existing.status;
            const slug = body.slug ? slugify(body.slug) : existing.slug;

            if (!["draft", "published"].includes(status)) {
              return json({ error: "invalid status" }, 400);
            }

            await env.DB.prepare(
              `UPDATE articles
               SET title = ?, slug = ?, content = ?, excerpt = ?, author = ?, category = ?, status = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`
            )
              .bind(title, slug, content, excerpt, author, category, status, id)
              .run();

            const updated = await env.DB.prepare(
              "SELECT * FROM articles WHERE id = ?"
            )
              .bind(id)
              .first();
            return json(updated);
          }

          if (request.method === "DELETE") {
            const existing = await env.DB.prepare(
              "SELECT id FROM articles WHERE id = ?"
            )
              .bind(id)
              .first();
            if (!existing) return json({ error: "Article not found" }, 404);

            await env.DB.prepare("DELETE FROM articles WHERE id = ?")
              .bind(id)
              .run();
            return json({ success: true, id });
          }
        }

        // /articles/:id/status
        if (parts.length === 3 && parts[2] === "status") {
          const id = parts[1];

          if (request.method === "PATCH") {
            const body = await request.json();
            if (!["draft", "published"].includes(body.status)) {
              return json(
                { error: "status must be 'draft' or 'published'" },
                400
              );
            }

            const existing = await env.DB.prepare(
              "SELECT id FROM articles WHERE id = ?"
            )
              .bind(id)
              .first();
            if (!existing) return json({ error: "Article not found" }, 404);

            await env.DB.prepare(
              "UPDATE articles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            )
              .bind(body.status, id)
              .run();

            const updated = await env.DB.prepare(
              "SELECT * FROM articles WHERE id = ?"
            )
              .bind(id)
              .first();
            return json(updated);
          }
        }

        return json({ error: "Method not allowed" }, 405);
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
