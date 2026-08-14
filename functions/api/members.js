export async function onRequest(context) {
    const { request, env } = context;

    if (!env.DB) {
        return jsonResponse({ success: false, error: "Database binding 'DB' is not configured." }, 500);
    }

    if (request.method === "OPTIONS") {
        return jsonResponse({ success: true });
    }

    if (request.method !== "POST") {
        return jsonResponse({ success: false, error: "Method not allowed." }, 405);
    }

    try {
        const body = await request.json();

        const fullName = clean(body.full_name, 150);
        const phone = clean(body.phone, 40);
        const email = clean(body.email, 150);
        const profession = clean(body.profession, 150);
        const university = clean(body.university, 200);
        const fieldCity = clean(body.field_city, 60);
        const experience = clean(body.experience, 5000);
        const motivation = clean(body.motivation, 5000);
        const availability = clean(body.availability, 100);
        const socialLinks = clean(body.social_links, 1000);
        const consent = body.consent === true;
        const departments = Array.isArray(body.departments)
            ? body.departments.map(item => clean(item, 80)).filter(Boolean)
            : [];

        const allowedDepartments = [
            "كتابة محتوى طبي",
            "تصميم",
            "مونتاج",
            "إعلام مرئي",
            "ميداني",
            "سوشيل ميديا",
            "إعلامي جامعات"
        ];

        const allowedCities = [
            "طرطوس",
            "اللاذقية",
            "دمشق",
            "حلب",
            "الحسكة",
            "حمص"
        ];

        const invalidDepartments = departments.filter(item => !allowedDepartments.includes(item));

        if (invalidDepartments.length) {
            return jsonResponse({ success: false, error: "يوجد اختصاص غير صالح." }, 400);
        }

        if (!fullName || !phone || !departments.length || !consent) {
            return jsonResponse({
                success: false,
                error: "يرجى تعبئة الاسم والهاتف واختيار مجال واحد على الأقل والموافقة على معالجة البيانات."
            }, 400);
        }

        if (departments.includes("ميداني") && !allowedCities.includes(fieldCity)) {
            return jsonResponse({
                success: false,
                error: "يرجى اختيار محافظة للعمل الميداني."
            }, 400);
        }

        await ensureMembersTable(env.DB);

        const result = await env.DB.prepare(`
            INSERT INTO members (
                full_name,
                phone,
                email,
                profession,
                university,
                departments,
                field_city,
                experience,
                motivation,
                availability,
                social_links,
                consent,
                status,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
            fullName,
            phone,
            email,
            profession,
            university,
            JSON.stringify(departments),
            fieldCity,
            experience,
            motivation,
            availability,
            socialLinks,
            1
        ).run();

        return jsonResponse({
            success: true,
            message: "تم استلام طلب الانضمام بنجاح. ستتم مراجعته من فريق MedLife.",
            id: result.meta?.last_row_id ?? null
        }, 201);

    } catch (error) {
        console.error("Members API error:", error);
        return jsonResponse({ success: false, error: "تعذر إرسال طلب الانضمام حالياً." }, 500);
    }
}

async function ensureMembersTable(db) {
    await db.prepare(`
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
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
    });
}
