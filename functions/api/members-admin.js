export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") {
        return jsonResponse({ success: true });
    }

    const adminKey = env.MEMBERS_ADMIN_KEY;

    if (!adminKey) {
        return jsonResponse({ success: false, error: "Members admin key is not configured." }, 500);
    }

    const suppliedKey = getAdminKey(request);

    if (!suppliedKey || !safeEqual(suppliedKey, adminKey)) {
        return jsonResponse({ success: false, error: "Unauthorized." }, 401);
    }

    if (!env.DB) {
        return jsonResponse({ success: false, error: "Database binding 'DB' is not configured." }, 500);
    }

    try {
        await ensureMembersTable(env.DB);

        if (method === "GET") {
            const url = new URL(request.url);
            const status = (url.searchParams.get("status") || "all").trim();
            const department = (url.searchParams.get("department") || "all").trim();
            const city = (url.searchParams.get("city") || "all").trim();

            let query = `
                SELECT id, full_name, phone, email, profession, university,
                       departments, field_city, experience, motivation,
                       availability, social_links, status, rejection_reason,
                       created_at, updated_at
                FROM members
            `;

            const conditions = [];
            const values = [];

            if (status !== "all") {
                conditions.push("status = ?");
                values.push(status);
            }

            if (city !== "all") {
                conditions.push("field_city = ?");
                values.push(city);
            }

            if (conditions.length) {
                query += ` WHERE ${conditions.join(" AND ")}`;
            }

            query += " ORDER BY created_at DESC";

            const result = await env.DB.prepare(query).bind(...values).all();
            let members = result.results || [];

            if (department !== "all") {
                members = members.filter(member => {
                    try {
                        const departments = JSON.parse(member.departments || "[]");
                        return Array.isArray(departments) && departments.includes(department);
                    } catch {
                        return false;
                    }
                });
            }

            const summary = await env.DB.prepare(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
                    SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS accepted_count,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
                FROM members
            `).first();

            return jsonResponse({
                success: true,
                members,
                summary: summary || { total: 0, pending_count: 0, accepted_count: 0, rejected_count: 0 }
            });
        }

        if (method === "PATCH") {
            const body = await request.json();
            const id = Number(body.id);
            const status = String(body.status || "").trim();
            const rejectionReason = clean(body.rejection_reason, 3000);
            const allowed = ["pending", "accepted", "rejected"];

            if (!Number.isInteger(id) || id <= 0) {
                return jsonResponse({ success: false, error: "Valid member ID is required." }, 400);
            }

            if (!allowed.includes(status)) {
                return jsonResponse({ success: false, error: "Invalid member status." }, 400);
            }

            const result = await env.DB.prepare(`
                UPDATE members
                SET status = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(status, rejectionReason, id).run();

            if (!result.meta?.changes) {
                return jsonResponse({ success: false, error: "Member application not found." }, 404);
            }

            return jsonResponse({ success: true, message: "Member application updated." });
        }

        if (method === "DELETE") {
            const url = new URL(request.url);
            const id = Number(url.searchParams.get("id"));

            if (!Number.isInteger(id) || id <= 0) {
                return jsonResponse({ success: false, error: "Valid member ID is required." }, 400);
            }

            const result = await env.DB.prepare(`DELETE FROM members WHERE id = ?`).bind(id).run();

            if (!result.meta?.changes) {
                return jsonResponse({ success: false, error: "Member application not found." }, 404);
            }

            return jsonResponse({ success: true, message: "Member application deleted." });
        }

        return jsonResponse({ success: false, error: "Method not allowed." }, 405);

    } catch (error) {
        console.error("Members admin API error:", error);
        return jsonResponse({ success: false, error: error?.message || "Internal server error." }, 500);
    }
}

function ensureMembersTable(db) {
    return db.prepare(`
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            profession TEXT,
            university TEXT,
            departments TEXT NOT NULL,
            field_city TEXT,
            experience TEXT,
            motivation TEXT,
            availability TEXT,
            social_links TEXT,
            consent INTEGER NOT NULL DEFAULT 1,
            status TEXT NOT NULL DEFAULT 'pending',
            rejection_reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
}

function getAdminKey(request) {
    const auth = request.headers.get("Authorization") || "";
    return auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
}

function safeEqual(a, b) {
    if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return result === 0;
}

function clean(value, maxLength = 5000) {
    return String(value ?? "").trim().slice(0, maxLength);
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
