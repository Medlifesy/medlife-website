/* =========================================================
   MEDLIFE ARTICLES API
   /api/articles

   GET  -> public published articles
   POST -> create article submission
========================================================= */

export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") {
        return json({ success: true });
    }

    if (!env.DB) {
        return json({
            success: false,
            error: "Database binding 'DB' is not configured."
        }, 500);
    }

    try {
        if (method === "GET") {
            return await listPublishedArticles(env.DB);
        }

        if (method === "POST") {
            return await createArticle(request, env.DB);
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

async function listPublishedArticles(db) {
    const result = await db.prepare(`
        SELECT
            a.id,
            a.title_ar,
            a.title_en,
            a.excerpt_ar,
            a.excerpt_en,
            a.author_member_id,
            a.author_name,
            a.category,
            a.image_url,
            a.status,
            a.published_at,
            a.created_at,
            a.updated_at
        FROM articles a
        WHERE a.status = 'published'
        ORDER BY COALESCE(a.published_at, a.created_at) DESC
    `).all();

    return json({
        success: true,
        articles: result.results || []
    });
}

async function createArticle(request, db) {
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

    let authorMemberId = null;

    if (Number.isInteger(memberId) && memberId > 0) {
        const member = await db.prepare(`
            SELECT id, full_name, email, status
            FROM members
            WHERE id = ?
            LIMIT 1
        `).bind(memberId).first();

        if (!member) {
            return json({ success: false, error: "عضو MedLife غير موجود." }, 400);
        }

        authorMemberId = member.id;
    }

    const result = await db.prepare(`
        INSERT INTO articles (
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
    });
}
