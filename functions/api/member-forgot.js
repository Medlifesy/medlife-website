const RESET_MINUTES = 60;
const TOKEN_TABLE = "member_password_reset_v3";
const PBKDF2_ITERATIONS = 120000;

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "OPTIONS") return json({ success: true });

    const db = await findMembersDatabase(env);
    if (!db) {
        return json({ success: false, error: "لم يتم العثور على قاعدة بيانات الأعضاء المرتبطة بالموقع." }, 500);
    }

    try {
        const action = new URL(request.url).searchParams.get("action") || "forgot";

        if (request.method === "POST" && action === "forgot") return await forgot(request, env, db);
        if (request.method === "GET" && action === "validate-reset") return await validateReset(request, db);
        if (request.method === "POST" && action === "reset") return await resetPassword(request, db);

        return json({ success: false, error: "Method or action not allowed." }, 405);
    } catch (error) {
        console.error("member-forgot error:", error);
        return json({ success: false, error: error?.message || "حدث خطأ أثناء تنفيذ العملية." }, 500);
    }
}

async function findMembersDatabase(env) {
    const candidates = [];
    if (env.MEMBERS_DB) candidates.push(env.MEMBERS_DB);
    if (env.DB && env.DB !== env.MEMBERS_DB) candidates.push(env.DB);

    for (const db of candidates) {
        try {
            const table = await db.prepare(`
                SELECT name FROM sqlite_master
                WHERE type='table' AND name='members'
                LIMIT 1
            `).first();
            if (table) return db;
        } catch (error) {
            console.error("member DB detection error:", error);
        }
    }
    return null;
}

async function ensureSchema(db) {
    await db.prepare(`
        CREATE TABLE IF NOT EXISTS ${TOKEN_TABLE} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
}

async function loadMemberByEmail(db, email) {
    const rows = await db.prepare(`SELECT * FROM members LIMIT 2000`).all();
    const members = Array.isArray(rows?.results) ? rows.results : [];

    return members.find(member => {
        const primary = String(member?.email || "").trim().toLowerCase();
        const account = String(member?.account_email || "").trim().toLowerCase();
        return primary === email || account === email;
    }) || null;
}

async function forgot(request, env, db) {
    const generic = "إذا كان البريد الإلكتروني مرتبطاً بحساب MedLife، فسيصلك رابط لإعادة تعيين كلمة المرور خلال دقائق.";

    if (!env.RESEND_API_KEY) {
        return json({ success: false, error: "مفتاح البريد الإلكتروني غير مهيأ في Cloudflare." }, 500);
    }

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return json({ success: false, error: "يرجى إدخال بريد إلكتروني صالح." }, 400);
    }

    await ensureSchema(db);

    const member = await loadMemberByEmail(db, email);

    if (!member) return json({ success: true, message: generic });

    const memberId = Number(member.id);
    const status = String(member.status || "").toLowerCase();
    const accountStatus = String(member.account_status || "").toLowerCase();

    if (!Number.isInteger(memberId) || memberId <= 0) {
        return json({ success: false, error: "سجل العضو غير صالح في قاعدة البيانات." }, 500);
    }

    if (!(status === "active" || status === "approved")) return json({ success: true, message: generic });
    if (["blocked", "suspended", "disabled", "rejected"].includes(accountStatus)) return json({ success: true, message: generic });

    // Generate and send a fresh message on every request.
    const token = randomToken();
    const tokenHash = await sha256Hex(token);
    const emailAddress = String(member.email || member.account_email || email).trim().toLowerCase();
    const resetUrl = `https://medlifesy.org/reset-password.html?token=${encodeURIComponent(token)}`;

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
                to: [emailAddress],
                subject: "إعادة تعيين كلمة مرور MedLife",
                html: buildResetEmail(member.full_name || "عضو MedLife", resetUrl)
            })
        });

        result = await response.json().catch(() => ({}));
    } catch (error) {
        console.error("RESET RESEND REQUEST ERROR:", error);
        return json({ success: false, error: "تعذر الاتصال بخدمة البريد لإرسال رابط إعادة التعيين." }, 502);
    }

    if (!response.ok) {
        console.error("Resend reset error:", result);
        const detail = typeof result?.message === "string" ? result.message : "رفضت خدمة البريد الطلب.";
        return json({ success: false, error: `فشل إرسال البريد: ${detail}` }, 502);
    }

    // Only after Resend accepts the message do we save the token.
    try {
        await db.prepare(`
            UPDATE ${TOKEN_TABLE}
            SET used_at = CURRENT_TIMESTAMP
            WHERE member_id = ? AND used_at IS NULL
        `).bind(memberId).run();

        await db.prepare(`
            INSERT INTO ${TOKEN_TABLE}(member_id, token_hash, expires_at)
            VALUES(?, ?, datetime('now', '+${RESET_MINUTES} minutes'))
        `).bind(memberId, tokenHash).run();
    } catch (error) {
        console.error("RESET DB TOKEN SAVE ERROR:", error);
        return json({ success: false, error: "تم إرسال البريد لكن تعذر حفظ رمز إعادة التعيين. يرجى طلب رابط جديد." }, 500);
    }

    return json({ success: true, message: generic, email_id: result?.id || null });
}

async function validateReset(request, db) {
    await ensureSchema(db);
    const token = new URL(request.url).searchParams.get("token") || "";
    if (!token) return json({ success: true, valid: false });

    const tokenHash = await sha256Hex(token);
    const row = await db.prepare(`
        SELECT id FROM ${TOKEN_TABLE}
        WHERE token_hash = ?
          AND used_at IS NULL
          AND datetime(expires_at) > datetime('now')
        LIMIT 1
    `).bind(tokenHash).first();

    return json({ success: true, valid: Boolean(row) });
}

async function resetPassword(request, db) {
    await ensureSchema(db);
    const body = await request.json();
    const token = String(body.token || "").trim();
    const password = String(body.password || "");

    if (!token || password.length < 10) {
        return json({ success: false, error: "رابط إعادة التعيين غير صالح أو كلمة المرور قصيرة جداً." }, 400);
    }

    const tokenHash = await sha256Hex(token);
    const resetRow = await db.prepare(`
        SELECT id, member_id
        FROM ${TOKEN_TABLE}
        WHERE token_hash = ?
          AND used_at IS NULL
          AND datetime(expires_at) > datetime('now')
        LIMIT 1
    `).bind(tokenHash).first();

    if (!resetRow) return json({ success: false, error: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية." }, 400);

    const salt = randomBytes(16);
    const hash = await hashPassword(password, salt, PBKDF2_ITERATIONS);
    const storedPassword = `pbkdf2$sha256$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${hash}`;

    await db.prepare(`
        UPDATE members
        SET password_hash = ?,
            account_status = CASE WHEN account_status IS NULL OR account_status = '' THEN 'active' ELSE account_status END,
            account_email = CASE WHEN account_email IS NULL OR account_email = '' THEN email ELSE account_email END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).bind(storedPassword, resetRow.member_id).run();

    await db.prepare(`UPDATE ${TOKEN_TABLE} SET used_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(resetRow.id).run();

    try {
        await db.prepare(`DELETE FROM member_sessions_v2 WHERE member_id = ?`).bind(resetRow.member_id).run();
    } catch (error) {
        console.warn("member_sessions_v2 cleanup skipped:", error);
    }

    return json({ success: true, message: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول." });
}

async function hashPassword(password, salt, iterations) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name:"PBKDF2", salt, iterations, hash:"SHA-256" }, key, 256);
    return bytesToHex(new Uint8Array(bits));
}

function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function randomToken() {
    return bytesToHex(randomBytes(32));
}

async function sha256Hex(value) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return bytesToHex(new Uint8Array(digest));
}

function bytesToHex(bytes) {
    return [...bytes].map(byte => byte.toString(16).padStart(2,"0")).join("");
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/\"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function buildResetEmail(name, resetUrl) {
    return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f7f9fc;font-family:Arial,Tahoma,sans-serif;color:#1e293b"><div style="max-width:620px;margin:35px auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:30px"><div style="text-align:center"><h2 style="color:#151d36;margin-bottom:10px">MedLife Syria</h2><p style="color:#64748b">إعادة تعيين كلمة مرور حساب الأعضاء</p></div><p>مرحباً ${escapeHtml(name)},</p><p>تم طلب إعادة تعيين كلمة المرور لحسابك في منصة متطوعي MedLife. إذا كنت أنت من طلب ذلك، اضغط على الزر التالي:</p><p style="text-align:center;margin:30px 0"><a href="${resetUrl}" style="display:inline-block;background:#ff2a54;color:#fff;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:700">إعادة تعيين كلمة المرور</a></p><p style="color:#64748b;font-size:13px">الرابط صالح لمدة ساعة واحدة ويُستخدم مرة واحدة فقط.</p><p style="color:#64748b;font-size:13px">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.</p><hr style="border:0;border-top:1px solid #e2e8f0;margin:25px 0"><p style="color:#94a3b8;font-size:12px;text-align:center">MedLife Syria · بالعمل التطوعي نصنع الأثر.</p></div></body></html>`;
}

function json(data,status=200){
    return new Response(JSON.stringify(data),{
        status,
        headers:{
            "Content-Type":"application/json; charset=UTF-8",
            "Cache-Control":"no-store",
            "Access-Control-Allow-Origin":"*",
            "Access-Control-Allow-Headers":"Content-Type",
            "Access-Control-Allow-Methods":"GET,POST,OPTIONS"
        }
    });
}
