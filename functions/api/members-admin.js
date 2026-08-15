/* =========================================================
   MEDLIFE MEMBERS ADMIN API
   GET    /api/members-admin
   PATCH  /api/members-admin
   DELETE /api/members-admin?id=...

   Protected with MEMBERS_ADMIN_KEY.
   All member records are stored in MEMBERS_DB.
========================================================= */

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

    if (!env.MEMBERS_DB) {
        return jsonResponse({ success: false, error: "Database binding 'MEMBERS_DB' is not configured." }, 500);
    }

    try {
        if (method === "GET") return await listMembers(request, env.MEMBERS_DB);
        if (method === "PATCH") return await updateMember(request, env.MEMBERS_DB);
        if (method === "DELETE") return await deleteMember(request, env.MEMBERS_DB);

        return jsonResponse({ success: false, error: "Method not allowed." }, 405);
    } catch (error) {
        console.error("Members admin API error:", error);
        return jsonResponse({
            success: false,
            error: error?.message || "Internal server error."
        }, 500);
    }
}

async function listMembers(request, db) {
    const url = new URL(request.url);
    const status = clean(url.searchParams.get("status"), 30) || "all";
    const cell = clean(url.searchParams.get("cell"), 80) || "all";
    const governorate = clean(url.searchParams.get("governorate"), 100) || "all";
    const fieldLocation = clean(url.searchParams.get("field_location"), 100) || "all";

    let query = `
        SELECT
            id,
            membership_number,
            full_name,
            mother_name,
            national_id,
            email,
            phone,
            gender,
            education_level,
            study_year,
            resident_specialty,
            residency_year,
            residency_hospital,
            university,
            address,
            governorate,
            medlife_role,
            cell,
            field_location,
            join_date,
            volunteer_certificate,
            status,
            created_at,
            updated_at
        FROM members
    `;

    const conditions = [];
    const values = [];

    if (status !== "all") {
        conditions.push("status = ?");
        values.push(status);
    }

    if (cell !== "all") {
        conditions.push("cell = ?");
        values.push(cell);
    }

    if (governorate !== "all") {
        conditions.push("governorate = ?");
        values.push(governorate);
    }

    if (fieldLocation !== "all") {
        conditions.push("field_location = ?");
        values.push(fieldLocation);
    }

    if (conditions.length) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC";

    const result = await db.prepare(query).bind(...values).all();
    const members = result.results || [];

    const summary = await db.prepare(`
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
            SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended_count,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_count
        FROM members
    `).first();

    return jsonResponse({
        success: true,
        members,
        summary: summary || {
            total: 0,
            pending_count: 0,
            active_count: 0,
            suspended_count: 0,
            inactive_count: 0
        }
    });
}

async function updateMember(request, db) {
    const body = await request.json();
    const id = Number(body.id);
    const status = clean(body.status, 30);

    if (!Number.isInteger(id) || id <= 0) {
        return jsonResponse({ success: false, error: "Valid member ID is required." }, 400);
    }

    const allowed = ["pending", "active", "suspended", "inactive"];

    if (!allowed.includes(status)) {
        return jsonResponse({ success: false, error: "Invalid member status." }, 400);
    }

    const rejectionReason = clean(body.rejection_reason, 3000);
    let membershipNumber = null;

    if (status === "active") {
        const current = await db.prepare(`
            SELECT id, membership_number
            FROM members
            WHERE id = ?
            LIMIT 1
        `).bind(id).first();

        if (!current) {
            return jsonResponse({ success: false, error: "Member not found." }, 404);
        }

        membershipNumber = current.membership_number;

        if (!membershipNumber) {
            membershipNumber = await nextMembershipNumber(db);
        }
    }

    const result = await db.prepare(`
        UPDATE members
        SET
            status = ?,
            membership_number = COALESCE(?, membership_number),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).bind(
        status,
        membershipNumber,
        id
    ).run();

    if (!result.meta?.changes) {
        return jsonResponse({ success: false, error: "Member not found." }, 404);
    }

    return jsonResponse({
        success: true,
        message: "تم تحديث حالة العضو بنجاح.",
        membership_number: membershipNumber,
        rejection_reason: rejectionReason || null
    });
}

async function deleteMember(request, db) {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
        return jsonResponse({ success: false, error: "Valid member ID is required." }, 400);
    }

    const result = await db.prepare(`DELETE FROM members WHERE id = ?`).bind(id).run();

    if (!result.meta?.changes) {
        return jsonResponse({ success: false, error: "Member not found." }, 404);
    }

    return jsonResponse({ success: true, message: "تم حذف سجل العضو." });
}

async function nextMembershipNumber(db) {
    const row = await db.prepare(`
        SELECT membership_number
        FROM members
        WHERE membership_number LIKE 'ML-%'
        ORDER BY id DESC
        LIMIT 1
    `).first();

    const match = String(row?.membership_number || "").match(/^ML-(\d+)$/);
    const next = match ? Number(match[1]) + 1 : 1;

    return `ML-${String(next).padStart(6, "0")}`;
}

function getAdminKey(request) {
    const auth = request.headers.get("Authorization") || "";
    if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
    return request.headers.get("X-Admin-Key")?.trim() || "";
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
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Key",
            "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS"
        }
    });
}
