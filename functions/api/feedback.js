export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.DB) {
        return jsonResponse({
            success: false,
            error: "Database binding 'DB' is not configured."
        }, 500);
    }

    try {
        const body = await request.json();

        const type = clean(body.type || "feedback");
        const name = clean(body.name);
        const email = clean(body.email);
        const phone = clean(body.phone);
        const message = clean(body.message);

        if (!message) {
            return jsonResponse({
                success: false,
                error: "Message is required."
            }, 400);
        }

        if (message.length > 5000) {
            return jsonResponse({
                success: false,
                error: "Message is too long."
            }, 400);
        }

        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL DEFAULT 'feedback',
                name TEXT,
                email TEXT,
                phone TEXT,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        const result = await env.DB.prepare(`
            INSERT INTO feedback (type, name, email, phone, message)
            VALUES (?, ?, ?, ?, ?)
        `).bind(
            type,
            name,
            email,
            phone,
            message
        ).run();

        return jsonResponse({
            success: true,
            message: "تم استلام رسالتكم بنجاح.",
            id: result.meta?.last_row_id ?? null
        }, 201);

    } catch (error) {
        console.error("Feedback API error:", error);

        return jsonResponse({
            success: false,
            error: "تعذر إرسال الرسالة حالياً."
        }, 500);
    }
}

function clean(value) {
    return String(value ?? "").trim().slice(0, 5000);
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
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
