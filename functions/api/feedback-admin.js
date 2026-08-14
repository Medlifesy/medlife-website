export async function onRequest(context) {
    const { request, env } = context;

    const method = request.method.toUpperCase();

    if (method === "OPTIONS") {
        return jsonResponse({ success: true });
    }

    const adminKey = env.FEEDBACK_ADMIN_KEY;

    if (!adminKey) {
        return jsonResponse({
            success: false,
            error: "Feedback admin key is not configured."
        }, 500);
    }

    const suppliedKey = getAdminKey(request);

    if (!suppliedKey || !safeEqual(suppliedKey, adminKey)) {
        return jsonResponse({
            success: false,
            error: "Unauthorized."
        }, 401);
    }

    if (!env.DB) {
        return jsonResponse({
            success: false,
            error: "Database binding 'DB' is not configured."
        }, 500);
    }

    try {
        await ensureFeedbackTable(env.DB);

        if (method === "GET") {
            const url = new URL(request.url);
            const status = (url.searchParams.get("status") || "all").trim();
            const type = (url.searchParams.get("type") || "all").trim();

            let query = `
                SELECT id, type, name, email, phone, message,
                       status, created_at, updated_at
                FROM feedback
            `;

            const conditions = [];
            const values = [];

            if (status !== "all") {
                conditions.push("status = ?");
                values.push(status);
            }

            if (type !== "all") {
                conditions.push("type = ?");
                values.push(type);
            }

            if (conditions.length) {
                query += ` WHERE ${conditions.join(" AND ")}`;
            }

            query += " ORDER BY created_at DESC";

            const result = await env.DB
                .prepare(query)
                .bind(...values)
                .all();

            const summary = await env.DB.prepare(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_count,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count
                FROM feedback
            `).first();

            return jsonResponse({
                success: true,
                feedback: result.results || [],
                summary: summary || {
                    total: 0,
                    new_count: 0,
                    in_progress_count: 0,
                    resolved_count: 0
                }
            });
        }

        if (method === "PATCH") {
            const body = await request.json();
            const id = Number(body.id);
            const status = String(body.status || "").trim();

            const allowed = ["new", "in_progress", "resolved"];

            if (!Number.isInteger(id) || id <= 0) {
                return jsonResponse({
                    success: false,
                    error: "Valid feedback ID is required."
                }, 400);
            }

            if (!allowed.includes(status)) {
                return jsonResponse({
                    success: false,
                    error: "Invalid feedback status."
                }, 400);
            }

            const result = await env.DB.prepare(`
                UPDATE feedback
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(status, id).run();

            if (!result.meta?.changes) {
                return jsonResponse({
                    success: false,
                    error: "Feedback entry not found."
                }, 404);
            }

            return jsonResponse({
                success: true,
                message: "Feedback status updated."
            });
        }

        if (method === "DELETE") {
            const url = new URL(request.url);
            const id = Number(url.searchParams.get("id"));

            if (!Number.isInteger(id) || id <= 0) {
                return jsonResponse({
                    success: false,
                    error: "Valid feedback ID is required."
                }, 400);
            }

            const result = await env.DB.prepare(`
                DELETE FROM feedback WHERE id = ?
            `).bind(id).run();

            if (!result.meta?.changes) {
                return jsonResponse({
                    success: false,
                    error: "Feedback entry not found."
                }, 404);
            }

            return jsonResponse({
                success: true,
                message: "Feedback deleted."
            });
        }

        return jsonResponse({
            success: false,
            error: "Method not allowed."
        }, 405);

    } catch (error) {
        console.error("Feedback admin API error:", error);

        return jsonResponse({
            success: false,
            error: error?.message || "Internal server error."
        }, 500);
    }
}

function getAdminKey(request) {
    const auth = request.headers.get("Authorization") || "";

    if (auth.startsWith("Bearer ")) {
        return auth.slice(7).trim();
    }

    return "";
}

function safeEqual(a, b) {
    if (typeof a !== "string" || typeof b !== "string") {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    let result = 0;

    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

async function ensureFeedbackTable(db) {
    await db.prepare(`
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL DEFAULT 'feedback',
            name TEXT,
            email TEXT,
            phone TEXT,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    const columns = await db.prepare(`PRAGMA table_info(feedback)`).all();
    const names = new Set((columns.results || []).map(row => row.name));

    if (!names.has("status")) {
        await db.prepare(`ALTER TABLE feedback ADD COLUMN status TEXT NOT NULL DEFAULT 'new'`).run();
    }

    if (!names.has("updated_at")) {
        await db.prepare(`ALTER TABLE feedback ADD COLUMN updated_at DATETIME`).run();
        await db.prepare(`UPDATE feedback SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL`).run();
    }
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS"
        }
    });
}
