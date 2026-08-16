const RESET_MINUTES = 60;
const COOLDOWN_MINUTES = 5;

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "OPTIONS") return json({ success: true });
    if (request.method !== "POST") return json({ success: false, error: "Method not allowed." }, 405);
    if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);
    if (!env.RESEND_API_KEY) return json({ success: false, error: "خدمة البريد غير مهيأة حالياً." }, 500);

    const generic = "إذا كان البريد الإلكتروني مرتبطاً بحساب MedLife، فسيصلك رابط لإعادة تعيين كلمة المرور خلال دقائق.";

    try {
        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return json({ success: false, error: "يرجى إدخال بريد إلكتروني صالح." }, 400);
        }

        const db = env.DB;

        await ensureSchema(db);
        await ensureAccountsTable(db);

        const member = await db.prepare(`
            SELECT
                m.id AS member_id,
                m.full_name,
                m.email,
                m.status,
                m.password_hash AS legacy_password_hash,
                a.id AS account_id,
                a.account_status
            FROM members m
            LEFT JOIN member_accounts a ON a.member_id = m.id
            WHERE lower(COALESCE(m.email,'')) = ?
            LIMIT 1
        `).bind(email).first();

        if (!member || !(member.status === "active" || member.status === "approved")) {
            return json({ success: true, message: generic });
        }

        let accountId = member.account_id;

        // Legacy member: create the missing account record so password reset can work.
        if (!accountId) {
            const username = await createUniqueUsername(db, email, member.member_id);
            const legacy = parseLegacyPasswordHash(member.legacy_password_hash);

            if (!legacy) {
                return json({ success: true, message: generic });
            }

            const result = await db.prepare(`
                INSERT INTO member_accounts(
                    member_id,
                    username,
                    password_hash,
                    password_salt,
                    role,
                    account_status
                )
                VALUES (?, ?, ?, ?, 'member', 'active')
            `).bind(
                member.member_id,
                username,
                legacy.hash,
                bytesToBase64(legacy.salt)
            ).run();

            accountId = result.meta?.last_row_id || null;

            await db.prepare(`
                INSERT OR IGNORE INTO member_profiles(member_id, display_name)
                VALUES(?, ?)
            `).bind(
                member.member_id,
                member.full_name || "عضو MedLife"
            ).run();
        }

        if (!accountId) {
            return json({ success: true, message: generic });
        }

        if (member.account_status && member.account_status !== "active") {
            return json({ success: true, message: generic });
        }

        const recent = await db.prepare(`
            SELECT id
            FROM member_password_reset_tokens
            WHERE account_id = ?
              AND used_at IS NULL
              AND datetime(created_at) > datetime('now', ?)
            LIMIT 1
        `).bind(
            accountId,
            `-${COOLDOWN_MINUTES} minutes`
        ).first();

        if (recent) {
            return json({ success: true, message: generic });
        }

        await db.prepare(`
            UPDATE member_password_reset_tokens
            SET used_at = CURRENT_TIMESTAMP
            WHERE account_id = ? AND used_at IS NULL
        `).bind(accountId).run();

        const token = randomToken();
        const tokenHash = await sha256Hex(token);

        await db.prepare(`
            INSERT INTO member_password_reset_tokens(
                account_id,
                token_hash,
                expires_at
            )
            VALUES(?, ?, datetime('now', '+60 minutes'))
        `).bind(accountId, tokenHash).run();

        const resetUrl =
            `https://medlifesy.org/reset-password.html?token=${encodeURIComponent(token)}`;

        const html = buildResetEmail(
            member.full_name || "عضو MedLife",
            resetUrl
        );

        const response = await fetch(
            "https://api.resend.com/emails",
            {
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
            }
        );

        const result =
            await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error("Resend password reset error:", result);
            return json(
                {
                    success: false,
                    error: "تعذر إرسال رسالة إعادة تعيين كلمة المرور حالياً."
                },
                502
            );
        }

        return json({
            success: true,
            message: generic
        });

    } catch (error) {
        console.error("Member forgot-password error:", error);

        return json(
            {
                success: false,
                error: "تعذر تنفيذ طلب إعادة تعيين كلمة المرور حالياً."
            },
            500
        );
    }
}

async function ensureAccountsTable(db) {
    await db.prepare(`
        CREATE TABLE IF NOT EXISTS member_accounts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL UNIQUE,
            username TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'member',
            account_status TEXT NOT NULL DEFAULT 'active',
            last_login_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
}

async function ensureSchema(db) {
    await db.prepare(`
        CREATE TABLE IF NOT EXISTS member_password_reset_tokens(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    await db.prepare(`
        CREATE TABLE IF NOT EXISTS member_profiles(
            member_id INTEGER PRIMARY KEY,
            display_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            cover_url TEXT,
            skills TEXT,
            social_links TEXT,
            privacy TEXT DEFAULT 'members',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
}

async function createUniqueUsername(db, email, memberId) {
    let base = String(email || "member")
        .split("@")[0]
        .replace(/[^a-z0-9._-]/gi, "-")
        .toLowerCase()
        .slice(0, 25);

    if (base.length < 4) base = `member${memberId}`;

    let username = base;
    let counter = 1;

    while (
        await db.prepare(
            `SELECT id FROM member_accounts WHERE username=? LIMIT 1`
        ).bind(username).first()
    ) {
        username = `${base.slice(0, 30)}-${counter++}`;
    }

    return username.slice(0, 40);
}

function parseLegacyPasswordHash(stored) {
    const parts = String(stored || "").split("$");

    if (
        parts.length !== 5 ||
        parts[0] !== "pbkdf2" ||
        parts[1] !== "sha256"
    ) {
        return null;
    }

    const iterations = Number(parts[2]);

    if (!Number.isInteger(iterations) || iterations < 10000) {
        return null;
    }

    if (
        !/^[0-9a-f]+$/i.test(parts[3]) ||
        !/^[0-9a-f]+$/i.test(parts[4])
    ) {
        return null;
    }

    return {
        iterations,
        salt: hexToBytes(parts[3]),
        hash: parts[4].toLowerCase()
    };
}

function randomToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return [...bytes]
        .map(b => b.toString(16).padStart(2, "0"))
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
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(
            hex.slice(i * 2, i * 2 + 2),
            16
        );
    }

    return bytes;
}

function bytesToBase64(bytes) {
    let binary = "";

    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
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
