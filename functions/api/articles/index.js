/* =========================================================
   MEDLIFE ARTICLES API

   Public:
   GET  /api/articles
   POST /api/articles

   Articles admin (requires ARTICLES_ADMIN_KEY or ADMIN_PASSWORD):
   GET    /api/articles?admin=1
   PUT    /api/articles
   DELETE /api/articles?id=123

   DB = articles database
   MEMBERS_DB = member database
========================================================= */

export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") return json({ success: true });

    if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);

    try {
        if (method === "GET") {
            const url = new URL(request.url);
            const isAdmin = url.searchParams.get("admin") === "1";

            if (isAdmin) {
                const auth = await isAdminAuthorized(request, env);
                if (!auth.ok) return json({ success: false, error: auth.error }, auth.status);
                return await listAllArticles(env.DB);
            }

            return await listPublishedArticles(env.DB);
        }

        if (method === "POST") {
            if (!env.MEMBERS_DB) {
                return json({
                    success: false,
                    error: "Database binding 'MEMBERS_DB' is not configured."
                }, 500);
            }

            return await createArticle(request, env.DB, env.MEMBERS_DB);
        }

        if (method === "PUT" || method === "DELETE") {
            const auth = await isAdminAuthorized(request, env);
            if (!auth.ok) return json({ success: false, error: auth.error }, auth.status);

            return method === "PUT"
                ? await updateArticle(request, env.DB)
                : await deleteArticle(request, env.DB);
        }

        return json({ success: false, error: "Method not allowed." }, 405);
    } catch (error) {
        console.error("Articles API error:", error);
        return json({
            success: false,
            error: "تعذر تنفيذ طلب المقالات حالياً."
        }, 500);
    }
}

/* =========================================================
   PUBLIC ARTICLES

   Important:
   Older versions of the database may contain duplicate rows.
   The public API therefore de-duplicates published articles by
   normalized Arabic/English title before returning them.
   This prevents the same article from appearing twice on:
     - homepage
     - articles page
     - any other public consumer of /api/articles
========================================================= */
async function listPublishedArticles(db) {
    const result = await db.prepare(`
        SELECT
            id,
            title_ar,
            title_en,
            excerpt_ar,
            excerpt_en,
            author_member_id,
            author_name,
            author_email,
            category,
            image_url,
            status,
            rejection_reason,
            published_at,
            created_at,
            updated_at
        FROM articles
        WHERE status = 'published'
        ORDER BY COALESCE(published_at, created_at) DESC, id DESC
    `).all();

    const rows = result.results || [];
    const seen = new Set();
    const articles = [];

    for (const article of rows) {
        const ar = normalizeTitle(article.title_ar);
        const en = normalizeTitle(article.title_en);
        const key = ar || en;

        // Never collapse an article with no usable title.
        if (!key) {
            articles.push(article);
            continue;
        }

        if (seen.has(key)) continue;
        seen.add(key);
        articles.push(article);
    }

    return json({
        success: true,
        articles,
        count: articles.length
    });
}

async function listAllArticles(db) {
    const result = await db.prepare(`
        SELECT
            id,
            title_ar,
            title_en,
            content_ar,
            content_en,
            excerpt_ar,
            excerpt_en,
            author_member_id,
            author_name,
            author_email,
            category,
            image_url,
            status,
            rejection_reason,
            published_at,
            created_at,
            updated_at
        FROM articles
        ORDER BY
            CASE status
                WHEN 'pending' THEN 0
                WHEN 'draft' THEN 1
                WHEN 'published' THEN 2
                WHEN 'rejected' THEN 3
                ELSE 4
            END,
            datetime(created_at) DESC,
            id DESC
    `).all();

    const articles = result.results || [];

    return json({
        success: true,
        articles,
        summary: {
            total: articles.length,
            pending: articles.filter(a => a.status === "pending").length,
            published: articles.filter(a => a.status === "published").length,
            rejected: articles.filter(a => a.status === "rejected").length,
            draft: articles.filter(a => a.status === "draft").length
        }
    });
}

async function createArticle(request, articlesDb, membersDb) {
    const body = await request.json();

    const titleAr = clean(body.title_ar, 500);
    const titleEn = clean(body.title_en, 500);
    const contentAr = clean(body.content_ar, 100000);
    const contentEn = clean(body.content_en, 100000);
    const excerptAr = clean(body.excerpt_ar, 2000);
    const excerptEn = clean(body.excerpt_en, 2000);
    const authorName = clean(body.author_name, 200);
    const authorEmail = clean(body.author_email, 200);
    const category = clean(body.category, 100);
    const imageUrl = clean(body.image_url, 2000);
    const memberId = Number(body.author_member_id);

    if (!titleAr || !contentAr || !authorName) {
        return json({
            success: false,
            error: "العنوان العربي والمحتوى العربي واسم الكاتب حقول مطلوبة."
        }, 400);
    }

    /* Prevent creating another published/pending article with the same title. */
    const duplicate = await articlesDb.prepare(`
        SELECT id, status
        FROM articles
        WHERE lower(trim(title_ar)) = lower(trim(?))
          AND status IN ('published', 'pending', 'draft')
        ORDER BY id DESC
        LIMIT 1
    `).bind(titleAr).first();

    if (duplicate) {
        return json({
            success: false,
            error: "يوجد مقال آخر بالعنوان نفسه بالفعل.",
            duplicate_id: duplicate.id,
            duplicate_status: duplicate.status
        }, 409);
    }

    let authorMemberId = null;

    if (Number.isInteger(memberId) && memberId > 0) {
        const member = await membersDb.prepare(`
            SELECT id, full_name, email, status
            FROM members
            WHERE id = ?
            LIMIT 1
        `).bind(memberId).first();

        if (!member) {
            return json({
                success: false,
                error: "عضو MedLife غير موجود."
            }, 400);
        }

        authorMemberId = member.id;
    }

    const result = await articlesDb.prepare(`
        INSERT INTO articles(
            title_ar,
            title_en,
            content_ar,
            content_en,
            excerpt_ar,
            excerpt_en,
            author_member_id,
            author_name,
            author_email,
            category,
            image_url,
            status,
            created_at,
            updated_at
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    `).bind(
        titleAr,
        titleEn,
        contentAr,
        contentEn,
        excerptAr,
        excerptEn,
        authorMemberId,
        authorName,
        authorEmail,
        category,
        imageUrl
    ).run();

    return json({
        success: true,
        message: "تم إرسال المقال للمراجعة بنجاح.",
        id: result.meta?.last_row_id ?? null,
        status: "pending"
    }, 201);
}

async function updateArticle(request, db) {
    const body = await request.json();

    const id = Number(body.id);
    const status = clean(body.status, 30);
    const rejectionReason = clean(body.rejection_reason, 2000);

    if (!Number.isInteger(id) || id <= 0) {
        return json({
            success: false,
            error: "معرّف المقال غير صالح."
        }, 400);
    }

    if (!["draft", "pending", "published", "rejected"].includes(status)) {
        return json({
            success: false,
            error: "حالة المقال غير صالحة."
        }, 400);
    }

    const article = await db.prepare(`
        SELECT * FROM articles WHERE id = ? LIMIT 1
    `).bind(id).first();

    if (!article) {
        return json({
            success: false,
            error: "المقال غير موجود."
        }, 404);
    }

    if (status === "rejected" && !rejectionReason) {
        return json({
            success: false,
            error: "يرجى كتابة سبب رفض المقال."
        }, 400);
    }

    const titleAr = clean(body.title_ar ?? article.title_ar, 500);
    const titleEn = clean(body.title_en ?? article.title_en, 500);
    const contentAr = clean(body.content_ar ?? article.content_ar, 100000);
    const contentEn = clean(body.content_en ?? article.content_en, 100000);
    const excerptAr = clean(body.excerpt_ar ?? article.excerpt_ar, 2000);
    const excerptEn = clean(body.excerpt_en ?? article.excerpt_en, 2000);
    const authorName = clean(body.author_name ?? article.author_name, 200);
    const category = clean(body.category ?? article.category, 100);
    const imageUrl = clean(body.image_url ?? article.image_url, 2000);

    if (!titleAr || !contentAr || !authorName) {
        return json({
            success: false,
            error: "العنوان العربي والمحتوى العربي واسم الكاتب حقول مطلوبة."
        }, 400);
    }

    /* Prevent publishing an edited article under a title already used by another article. */
    if (status !== "rejected") {
        const duplicate = await db.prepare(`
            SELECT id
            FROM articles
            WHERE id <> ?
              AND lower(trim(title_ar)) = lower(trim(?))
              AND status IN ('published', 'pending', 'draft')
            ORDER BY id DESC
            LIMIT 1
        `).bind(id, titleAr).first();

        if (duplicate) {
            return json({
                success: false,
                error: "يوجد مقال آخر بالعنوان نفسه بالفعل.",
                duplicate_id: duplicate.id
            }, 409);
        }
    }

    const publishedAt = status === "published"
        ? (article.published_at || new Date().toISOString())
        : null;

    await db.prepare(`
        UPDATE articles SET
            title_ar = ?,
            title_en = ?,
            content_ar = ?,
            content_en = ?,
            excerpt_ar = ?,
            excerpt_en = ?,
            author_name = ?,
            category = ?,
            image_url = ?,
            status = ?,
            rejection_reason = ?,
            published_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).bind(
        titleAr,
        titleEn,
        contentAr,
        contentEn,
        excerptAr,
        excerptEn,
        authorName,
        category,
        imageUrl,
        status,
        status === "rejected" ? rejectionReason : null,
        publishedAt,
        id
    ).run();

    return json({
        success: true,
        message: status === "published"
            ? "تم حفظ التعديلات ونشر المقال."
            : status === "rejected"
                ? "تم رفض المقال وحفظ سبب الرفض."
                : "تم حفظ تعديلات المقال.",
        id,
        status
    });
}

async function deleteArticle(request, db) {
    const id = Number(new URL(request.url).searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
        return json({
            success: false,
            error: "معرّف المقال غير صالح."
        }, 400);
    }

    const result = await db.prepare(`
        DELETE FROM articles WHERE id = ?
    `).bind(id).run();

    if (!result.meta?.changes) {
        return json({
            success: false,
            error: "المقال غير موجود."
        }, 404);
    }

    return json({
        success: true,
        message: "تم حذف المقال بنجاح.",
        id
    });
}

async function isAdminAuthorized(request, env) {
    const expected = env.ARTICLES_ADMIN_KEY || env.ADMIN_PASSWORD;

    if (!expected) {
        return {
            ok: false,
            status: 500,
            error: "إعدادات المشرف غير مكتملة على Cloudflare (ARTICLES_ADMIN_KEY)."
        };
    }

    const header = request.headers.get("Authorization") || "";
    const match = header.match(/^Bearer\s+(.+)$/i);

    if (!match) {
        return {
            ok: false,
            status: 401,
            error: "غير مصرح بالدخول إلى إدارة المقالات."
        };
    }

    const supplied = match[1].trim();

    if (!supplied || supplied.length > 500 || expected.length > 500) {
        return {
            ok: false,
            status: 401,
            error: "غير مصرح بالدخول إلى إدارة المقالات."
        };
    }

    const encoder = new TextEncoder();

    const [a, b] = await Promise.all([
        crypto.subtle.digest("SHA-256", encoder.encode(supplied)),
        crypto.subtle.digest("SHA-256", encoder.encode(expected))
    ]);

    const left = new Uint8Array(a);
    const right = new Uint8Array(b);
    let diff = left.length ^ right.length;

    for (let i = 0; i < Math.min(left.length, right.length); i++) {
        diff |= left[i] ^ right[i];
    }

    return diff === 0
        ? { ok: true, status: 200 }
        : {
            ok: false,
            status: 401,
            error: "غير مصرح بالدخول إلى إدارة المقالات."
        };
}

function normalizeTitle(value) {
    return String(value ?? "")
        .normalize("NFKC")
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .replace(/[إأآٱ]/g, "ا")
        .replace(/[ى]/g, "ي")
        .replace(/[ؤ]/g, "و")
        .replace(/[ئ]/g, "ي")
        .replace(/[ـ]/g, "")
        .replace(/[“”"'`]/g, "")
        .replace(/[،,:؛.!؟?()\[\]{}]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function clean(value, maxLength = 5000) {
    return String(value ?? "").trim().slice(0, maxLength);
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
        }
    });
}
