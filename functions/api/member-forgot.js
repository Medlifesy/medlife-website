const RESET_MINUTES = 60;
const COOLDOWN_MINUTES = 5;
const TOKEN_TABLE = "member_password_reset_v2";

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "OPTIONS") {
        return json({ success: true });
    }

    if (request.method !== "POST") {
        return json({ success: false, error: "Method not allowed." }, 405);
    }

    if (!env.DB) {
        return json({ success: false, error: "قاعدة البيانات غير مهيأة في Cloudflare." }, 500);
    }

    if (!env.RESEND_API_KEY) {
        return json({ success: false, error: "مفتاح البريد الإلكتروني غير مهيأ في Cloudflare." }, 500);
    }

    const generic = "إذا كان البريد الإلكتروني مرتبطاً بحساب MedLife، فسيصلك رابط لإعادة تعيين كلمة المرور خلال دقائق.";

    try {
        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return json({ success: false, error: "يرجى إدخال بريد إلكتروني صالح." }, 400);
        }

        const db = env.DB;

        try {
            await ensureSchema(db);
        } catch (error) {
            console.error("RESET DB SCHEMA ERROR:", error);
            return json({ success: false, error: "حدث خطأ في تجهيز قاعدة البيانات لإعادة التعيين." }, 500);
        }

        let member;

        try {
            member = await db.prepare(`
                SELECT id AS member_id, full_name, email, status
                FROM members
                WHERE lower(COALESCE(email,'')) = ?
                LIMIT 1
            `).bind(email).first();
        } catch (error) {
            console.error("RESET DB MEMBER QUERY ERROR:", error);
            return json({ success: false, error: "حدث خطأ أثناء البحث عن البريد في قاعدة بيانات الأعضاء." }, 500);
        }

        if (!member || !(member.status === "active" || member.status === "approved")) {
            return json({ success: true, message: generic });
        }

        let recent;

        try {
            recent = await db.prepare(`
                SELECT id
                FROM ${TOKEN_TABLE}
                WHERE member_id = ?
                  AND used_at IS NULL
                  AND datetime(created_at) > datetime('now', ?)
                LIMIT 1
            `).bind(member.member_id, `-${COOLDOWN_MINUTES} minutes`).first();
        } catch (error) {
            console.error("RESET DB COOLDOWN QUERY ERROR:", error);
            return json({ success: false, error: "حدث خطأ أثناء فحص طلبات إعادة التعيين السابقة." }, 500);
        }

        if (recent) {
            return json({ success: true, message: generic });
        }

        try {
            await db.prepare(`
                UPDATE ${TOKEN_TABLE}
                SET used_at = CURRENT_TIMESTAMP
                WHERE member_id = ? AND used_at IS NULL
            `).bind(member.member_id).run();
        } catch (error) {
            console.error("RESET DB INVALIDATE ERROR:", error);
            return json({ success: false, error: "حدث خطأ أثناء تجهيز رمز إعادة التعيين." }, 500);
        }

        const token = randomToken();
        const tokenHash = await sha256Hex(token);

        try {
            await db.prepare(`
                INSERT INTO ${TOKEN_TABLE}(member_id, token_hash, expires_at)
                VALUES(?, ?, datetime('now', '+60 minutes'))
            `).bind(member.member_id, tokenHash).run();
        } catch (error) {
            console.error("RESET DB INSERT ERROR:", error);
            return json({ success: false, error: "حدث خطأ أثناء إنشاء رمز إعادة التعيين في قاعدة البيانات." }, 500);
        }

        const resetUrl = `https://medlifesy.org/reset-password.html?token=${encodeURIComponent(token)}`;
        const html = buildResetEmail(member.full_name || "عضو MedLife", resetUrl);

        let response;
        let result;

        try {
            response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: "MedLife Syria <noreply@medlifesy.org>",
                    to: [email],
                    subject: "إعادة تعيين كلمة مرور MedLife",
                    html
                })
            });

            result = await response.json().catch(() => ({}));
        } catch (error) {
            console.error("RESET RESEND REQUEST ERROR:", error);
            return json({ success: false, error: "تعذر الاتصال بخدمة البريد لإرسال رابط إعادة التعيين." }, 502);
        }

        if (!response.ok) {
            console.error("RESET RESEND API ERROR:", result);
            const detail = typeof result?.message === "string" ? result.message : "رفضت خدمة البريد الطلب.";
            return json({ success: false, error: `فشل إرسال البريد: ${detail}` }, 502);
        }

        return json({
            success: true,
            message: generic
        });

    } catch (error) {
        console.error("RESET UNEXPECTED ERROR:", error);
        return json({ success: false, error: "حدث خطأ غير متوقع أثناء طلب إعادة تعيين كلمة المرور." }, 500);
    }
}

async function ensureSchema(db) {
    await db.prepare(`
        CREATE TABLE IF NOT EXISTS ${TOKEN_TABLE}(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
}

function randomToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value) {
    const bytes = new Uint8Array(
        await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(value)
        )
    );

    return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function buildResetEmail(name, resetUrl) {
    return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f7f9fc;font-family:Arial,Tahoma,sans-serif;color:#1e293b"><div style="max-width:620px;margin:35px auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:30px"><div style="text-align:center"><h2 style="color:#151d36;margin-bottom:10px">MedLife Syria</h2><p style="color:#64748b">إعادة تعيين كلمة مرور حساب الأعضاء</p></div><p>مرحباً ${escapeHtml(name)},</p><p>تم طلب إعادة تعيين كلمة المرور لحسابك في منصة متطوعي MedLife. إذا كنت أنت من طلب ذلك، اضغط على الزر التالي:</p><p style="text-align:center;margin:30px 0"><a href="${resetUrl}" style="display:inline-block;background:#ff2a54;color:#fff;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:700">إعادة تعيين كلمة المرور</a></p><p style="color:#64748b;font-size:13px">الرابط صالح لمدة ساعة واحدة ويُستخدم مرة واحدة فقط.</p><p style="color:#64748b;font-size:13px">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.</p><hr style="border:0;border-top:1px solid #e2e8f0;margin:25px 0"><p style="color:#94a3b8;font-size:12px;text-align:center">MedLife Syria · بالعمل التطوعي نصنع الأثر.</p></div></body></html>`;
}

function json(data, status = 200) {
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
