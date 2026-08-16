const RESET_MINUTES = 60;
const COOLDOWN_MINUTES = 5;

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "OPTIONS") {
        return json({ success: true });
    }

    if (request.method !== "POST") {
        return json({ success: false, error: "Method not allowed." }, 405);
    }

    if (!env.DB) {
        return json({
            success: false,
            error: "Database binding 'DB' is not configured."
        }, 500);
    }

    if (!env.RESEND_API_KEY) {
        return json({
            success: false,
            error: "خدمة البريد غير مهيأة حالياً."
        }, 500);
    }

    const genericMessage =
        "إذا كان البريد الإلكتروني مرتبطاً بحساب MedLife، فسيصلك رابط لإعادة تعيين كلمة المرور خلال دقائق.";

    try {
        const body = await request.json();
        const email = String(body.email || "")
            .trim()
            .toLowerCase();

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return json({
                success: false,
                error: "يرجى إدخال بريد إلكتروني صالح."
            }, 400);
        }

        const db = env.DB;

        await ensureResetTable(db);

        /*
         * IMPORTANT:
         * Password reset is intentionally based only on the
         * existing members table. It does not depend on
         * member_accounts, so legacy members can recover access.
         */
        const member = await db.prepare(`
            SELECT
                id,
                full_name,
                email,
                status
            FROM members
            WHERE lower(COALESCE(email, '')) = ?
            LIMIT 1
        `).bind(email).first();

        if (!member || !isApproved(member.status)) {
            return json({
                success: true,
                message: genericMessage
            });
        }

        const recent = await db.prepare(`
            SELECT id
            FROM member_password_reset_requests
            WHERE member_id = ?
              AND used_at IS NULL
              AND datetime(created_at) > datetime('now', ?)
            LIMIT 1
        `).bind(
            member.id,
            `-${COOLDOWN_MINUTES} minutes`
        ).first();

        if (recent) {
            return json({
                success: true,
                message: genericMessage
            });
        }

        await db.prepare(`
            UPDATE member_password_reset_requests
            SET used_at = CURRENT_TIMESTAMP
            WHERE member_id = ?
              AND used_at IS NULL
        `).bind(member.id).run();

        const token = randomToken();
        const tokenHash = await sha256Hex(token);

        await db.prepare(`
            INSERT INTO member_password_reset_requests(
                member_id,
                token_hash,
                expires_at
            )
            VALUES(
                ?,
                ?,
                datetime('now', '+60 minutes')
            )
        `).bind(
            member.id,
            tokenHash
        ).run();

        const resetUrl =
            `https://medlifesy.org/reset-password.html?token=${encodeURIComponent(token)}`;

        const html = buildResetEmail(
            member.full_name || "عضو MedLife",
            resetUrl
        );

        const resendResponse = await fetch(
            "https://api.resend.com/emails",
            {
                method: "POST",
                headers: {
                    "Authorization":
                        `Bearer ${env.RESEND_API_KEY}`,
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    from:
                        "MedLife Syria <noreply@medlifesy.org>",
                    to: [email],
                    subject:
                        "إعادة تعيين كلمة مرور MedLife",
                    html
                })
            }
        );

        const resendResult =
            await resendResponse.json().catch(() => ({}));

        if (!resendResponse.ok) {
            console.error(
                "Resend password reset error:",
                resendResult
            );

            return json({
                success: false,
                error:
                    "تعذر إرسال رسالة إعادة تعيين كلمة المرور حالياً."
            }, 502);
        }

        return json({
            success: true,
            message: genericMessage
        });

    } catch (error) {
        console.error(
            "Member forgot-password error:",
            error
        );

        return json({
            success: false,
            error:
                "تعذر تنفيذ طلب إعادة تعيين كلمة المرور حالياً."
        }, 500);
    }
}

async function ensureResetTable(db) {
    await db.prepare(`
        CREATE TABLE IF NOT EXISTS member_password_reset_requests(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
}

function isApproved(status) {
    return status === "active" || status === "approved";
}

function randomToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);

    return [...bytes]
        .map(byte =>
            byte.toString(16).padStart(2, "0")
        )
        .join("");
}

async function sha256Hex(value) {
    const bytes = new Uint8Array(
        await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(value)
        )
    );

    return [...bytes]
        .map(byte =>
            byte.toString(16).padStart(2, "0")
        )
        .join("");
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
    return `<!doctype html>
<html lang="ar" dir="rtl">
<body style="margin:0;background:#f7f9fc;font-family:Arial,Tahoma,sans-serif;color:#1e293b">
<div style="max-width:620px;margin:35px auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:30px">
    <div style="text-align:center">
        <h2 style="color:#151d36;margin-bottom:10px">MedLife Syria</h2>
        <p style="color:#64748b">إعادة تعيين كلمة مرور حساب الأعضاء</p>
    </div>

    <p>مرحباً ${escapeHtml(name)},</p>

    <p>
        تم طلب إعادة تعيين كلمة المرور لحسابك في منصة متطوعي MedLife.
        إذا كنت أنت من طلب ذلك، اضغط على الزر التالي:
    </p>

    <p style="text-align:center;margin:30px 0">
        <a href="${resetUrl}"
           style="display:inline-block;background:#ff2a54;color:#fff;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:700">
            إعادة تعيين كلمة المرور
        </a>
    </p>

    <p style="color:#64748b;font-size:13px">
        الرابط صالح لمدة ساعة واحدة ويُستخدم مرة واحدة فقط.
    </p>

    <p style="color:#64748b;font-size:13px">
        إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.
    </p>

    <hr style="border:0;border-top:1px solid #e2e8f0;margin:25px 0">

    <p style="color:#94a3b8;font-size:12px;text-align:center">
        MedLife Syria · بالعمل التطوعي نصنع الأثر.
    </p>
</div>
</body>
</html>`;
}

function json(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type":
                    "application/json; charset=UTF-8",
                "Cache-Control":
                    "no-store",
                "Access-Control-Allow-Origin":
                    "*",
                "Access-Control-Allow-Headers":
                    "Content-Type",
                "Access-Control-Allow-Methods":
                    "POST, OPTIONS"
            }
        }
    );
}
