export async function onRequest(context) {
    const { request, env } = context;

    // Make sure the D1 binding exists
    if (!env.DB) {
        return jsonResponse(
            {
                success: false,
                error: "Database binding 'DB' is not configured."
            },
            500
        );
    }

    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    try {
        // =====================================================
        // GET /api/articles
        // Get published articles
        //
        // GET /api/articles?id=1
        // Get one article
        // =====================================================

        if (method === "GET") {
            const id = url.searchParams.get("id");
            const admin = url.searchParams.get("admin") === "1";

            if (id) {
                const article = await env.DB
                    .prepare(
                        admin
                            ? `SELECT * FROM articles WHERE id = ? LIMIT 1`
                            : `SELECT * FROM articles WHERE id = ? AND status = 'published' LIMIT 1`
                    )
                    .bind(id)
                    .first();

                if (!article) {
                    return jsonResponse(
                        {
                            success: false,
                            error: "Article not found."
                        },
                        404
                    );
                }

                return jsonResponse({
                    success: true,
                    article
                });
            }

            const query = admin
                ? `
                    SELECT *
                    FROM articles
                    ORDER BY created_at DESC
                `
                : `
                    SELECT id,
                           title_ar,
                           title_en,
                           excerpt_ar,
                           excerpt_en,
                           author_name,
                           category,
                           image_url,
                           status,
                           created_at,
                           updated_at
                    FROM articles
                    WHERE status = 'published'
                    ORDER BY created_at DESC
                `;

            const result = await env.DB
                .prepare(query)
                .all();

            return jsonResponse({
                success: true,
                articles: result.results || []
            });
        }

        // =====================================================
        // POST /api/articles
        // Create new article
        // =====================================================

        if (method === "POST") {
            const body = await request.json();

            const title_ar = cleanText(body.title_ar);
            const title_en = cleanText(body.title_en);

            const excerpt_ar = cleanText(body.excerpt_ar);
            const excerpt_en = cleanText(body.excerpt_en);

            const content_ar = String(body.content_ar || "").trim();
            const content_en = String(body.content_en || "").trim();

            const author_name = cleanText(body.author_name);
            const author_email = cleanText(body.author_email);

            const category = cleanText(body.category);
            const image_url = cleanText(body.image_url);

            const status =
                normalizeStatus(body.status) || "pending";

            const rejection_reason =
                cleanText(body.rejection_reason);

            if (!title_ar) {
                return jsonResponse(
                    {
                        success: false,
                        error: "Arabic title is required."
                    },
                    400
                );
            }

            if (!content_ar) {
                return jsonResponse(
                    {
                        success: false,
                        error: "Arabic article content is required."
                    },
                    400
                );
            }

            if (!author_name) {
                return jsonResponse(
                    {
                        success: false,
                        error: "Author name is required."
                    },
                    400
                );
            }

            const result = await env.DB
                .prepare(
                    `
                    INSERT INTO articles (
                        title_ar,
                        title_en,
                        excerpt_ar,
                        excerpt_en,
                        content_ar,
                        content_en,
                        author_name,
                        author_email,
                        category,
                        image_url,
                        status,
                        rejection_reason,
                        created_at,
                        updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `
                )
                .bind(
                    title_ar,
                    title_en,
                    excerpt_ar,
                    excerpt_en,
                    content_ar,
                    content_en,
                    author_name,
                    author_email,
                    category,
                    image_url,
                    status,
                    rejection_reason
                )
                .run();

            return jsonResponse(
                {
                    success: true,
                    message: "Article created successfully.",
                    id: result.meta?.last_row_id ?? null
                },
                201
            );
        }

        // =====================================================
        // PUT /api/articles
        // Update article
        // =====================================================

        if (method === "PUT") {
            const body = await request.json();

            const id = Number(body.id);

            if (!Number.isInteger(id) || id <= 0) {
                return jsonResponse(
                    {
                        success: false,
                        error: "Valid article ID is required."
                    },
                    400
                );
            }

            const fields = [];
            const values = [];

            const allowedFields = [
                "title_ar",
                "title_en",
                "excerpt_ar",
                "excerpt_en",
                "content_ar",
                "content_en",
                "author_name",
                "author_email",
                "category",
                "image_url",
                "status",
                "rejection_reason"
            ];

            for (const field of allowedFields) {
                if (Object.prototype.hasOwnProperty.call(body, field)) {
                    fields.push(`${field} = ?`);

                    if (
                        field === "content_ar" ||
                        field === "content_en"
                    ) {
                        values.push(
                            String(body[field] || "").trim()
                        );
                    } else if (field === "status") {
                        values.push(
                            normalizeStatus(body[field]) || "pending"
                        );
                    } else {
                        values.push(
                            cleanText(body[field])
                        );
                    }
                }
            }

            if (!fields.length) {
                return jsonResponse(
                    {
                        success: false,
                        error: "No fields to update."
                    },
                    400
                );
            }

            fields.push(
                "updated_at = CURRENT_TIMESTAMP"
            );

            values.push(id);

            const result = await env.DB
                .prepare(
                    `
                    UPDATE articles
                    SET ${fields.join(", ")}
                    WHERE id = ?
                    `
                )
                .bind(...values)
                .run();

            if (!result.meta?.changes) {
                return jsonResponse(
                    {
                        success: false,
                        error: "Article not found."
                    },
                    404
                );
            }

            return jsonResponse({
                success: true,
                message: "Article updated successfully."
            });
        }

        // =====================================================
        // DELETE /api/articles?id=1
        // Delete article
        // =====================================================

        if (method === "DELETE") {
            const id = url.searchParams.get("id");

            if (!id) {
                return jsonResponse(
                    {
                        success: false,
                        error: "Article ID is required."
                    },
                    400
                );
            }

            const result = await env.DB
                .prepare(
                    `
                    DELETE FROM articles
                    WHERE id = ?
                    `
                )
                .bind(id)
                .run();

            if (!result.meta?.changes) {
                return jsonResponse(
                    {
                        success: false,
                        error: "Article not found."
                    },
                    404
                );
            }

            return jsonResponse({
                success: true,
                message: "Article deleted successfully."
            });
        }

        return jsonResponse(
            {
                success: false,
                error: "Method not allowed."
            },
            405
        );

    } catch (error) {

        console.error("Articles API error:", error);

        return jsonResponse(
            {
                success: false,
                error: "Internal server error.",
                details: error?.message || "Unknown error"
            },
            500
        );
    }
}


// =========================================================
// HELPERS
// =========================================================

function cleanText(value) {
    return String(value ?? "").trim();
}


function normalizeStatus(value) {

    const status = String(value ?? "")
        .trim()
        .toLowerCase();

    const allowed = [
        "pending",
        "published",
        "rejected",
        "draft"
    ];

    return allowed.includes(status)
        ? status
        : null;
}


function jsonResponse(data, status = 200) {

    return new Response(
        JSON.stringify(data, null, 2),
        {
            status,
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Cache-Control": "no-store",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
            }
        }
    );
}
