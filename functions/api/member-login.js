const SESSION_COOKIE = "medlife_member_session";
const SESSION_DAYS = 30;
const ITERATIONS = 120000;

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

    try {
        const body = await request.json();
        const identifier = String(
            body.identifier || body.username || body.email || ""
        ).trim().toLowerCase();
        const password = String(body.password || "");

        if (!identifier || !password) {
            return json({
                success: false,
                error: "يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور."
            }, 400);
        }

        await ensureTables(env.DB);

        const member = await env.DB.prepare(`
            SELECT
                m.id,
                m.full_name,
                m.email,
                m.status,
                m.password_hash AS legacy_password_hash,
                a.id AS account_id,
                a.username,
                a.password_hash AS account_password_hash,
                a.password_salt,
                a.account_status,
                a.role
            FROM members m
            LEFT JOIN member_accounts a
                ON a.member_id = m.id
            WHERE lower(COALESCE(m.email, '')) = ?
               OR lower(COALESCE(a.username, '')) = ?
            ORDER BY CASE WHEN a.id IS NOT NULL THEN 0 ELSE 1 END
            LIMIT 1
        `).bind(identifier, identifier).first();

        if (!member) {
            return json({
                success: false,
                error: "البريد الإلكتروني أو اسم المستخدم غير موجود في قاعدة MedLife."
            }, 401);
        }

        if (!isApproved(member.status)) {
            return json({
                success: false,
                error: "عضويتك موجودة في النظام، لكنها لم تُعتمد بعد من الإدارة."
            }, 403);
        }

        let valid = false;

        if (
            member.account_id &&
            member.account_status === "active" &&
            member.account_password_hash &&
            member.password_salt
        ) {
            valid = await verifyCurrentPassword(
                password,
                member.account_password_hash,
                member.password_salt
            );
        }

        if (!valid && member.legacy_password_hash) {
            valid = await verifyLegacyPassword(
                password,
                member.legacy_password_hash
            );
        }

        if (!valid) {
            return json({
                success: false,
                error: "كلمة المرور غير صحيحة."
            }, 401);
        }

        let accountId = member.account_id;

        if (!accountId) {
            const username = await createUsername(
                env.DB,
                member.email,
                member.id
            );

            const legacy = parseLegacyHash(
                member.legacy_password_hash
            );

            let passwordHash;
            let passwordSalt;

            if (legacy) {
                passwordHash = legacy.hash;
                passwordSalt = bytesToBase64(legacy.salt);
            } else {
                const salt = randomBytes(16);
                passwordHash = await hashPassword(password, salt);
                passwordSalt = bytesToBase64(salt);
            }

            const result = await env.DB.prepare(`
                INSERT INTO member_accounts (
                    member_id,
                    username,
                    password_hash,
                    password_salt,
                    role,
                    account_status
                )
                VALUES (?, ?, ?, ?, 'member', 'active')
            `).bind(
                member.id,
                username,
                passwordHash,
                passwordSalt
            ).run();

            accountId = result.meta?.last_row_id;

            await env.DB.prepare(`
                INSERT OR IGNORE INTO member_profiles (
                    member_id,
                    display_name
                ) VALUES (?, ?)
            `).bind(
                member.id,
                member.full_name || "عضو MedLife"
            ).run();
        }

        await env.DB.prepare(`
            UPDATE member_accounts
            SET account_status='active',
                last_login_at=CURRENT_TIMESTAMP,
                updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        `).bind(accountId).run();

        const sessionId = bytesToHex(randomBytes(32));

        await env.DB.prepare(`
            INSERT INTO member_sessions (
                id,
                account_id,
                expires_at
            ) VALUES (
                ?,
                ?,
                datetime('now', '+30 days')
            )
        `).bind(sessionId, accountId).run();

        const response = json({
            success: true,
            message: "تم تسجيل الدخول بنجاح.",
            member: {
                id: member.id,
                full_name: member.full_name,
                email: member.email
            }
        });

        const headers = new Headers(response.headers);
        headers.set(
            "Set-Cookie",
            `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Max-Age=${SESSION_DAYS * 86400}; Path=/; HttpOnly; Secure; SameSite=Lax`
        );

        return new Response(response.body, {
            status: response.status,
            headers
        });

    } catch (error) {
        console.error("MedLife member login error:", error);

        return json({
            success: false,
            error: "تعذر تسجيل الدخول حالياً. يرجى المحاولة مرة أخرى."
        }, 500);
    }
}

async function ensureTables(db) {
    await db.prepare(`
        CREATE TABLE IF NOT EXISTS member_accounts (
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

    await db.prepare(`
        CREATE TABLE IF NOT EXISTS member_sessions (
            id TEXT PRIMARY KEY,
            account_id INTEGER NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    await db.prepare(`
        CREATE TABLE IF NOT EXISTS member_profiles (
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

function isApproved(status) {
    return status === "active" || status === "approved";
}

async function verifyCurrentPassword(password, storedHash, storedSalt) {
    try {
        const salt = base64ToBytes(storedSalt);
        const actual = await hashPassword(password, salt);
        return timingSafeEqual(actual, storedHash);
    } catch {
        return false;
    }
}

async function verifyLegacyPassword(password, stored) {
    const parsed = parseLegacyHash(stored);

    if (!parsed) {
        return false;
    }

    const material = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt: parsed.salt,
        iterations: parsed.iterations,
        hash: "SHA-256"
    }, material, 256);

    return timingSafeEqual(
        bytesToHex(new Uint8Array(bits)),
        parsed.hash
    );
}

function parseLegacyHash(stored) {
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

async function createUsername(db, email, memberId) {
    let base = String(email || "member")
        .split("@")[0]
        .replace(/[^a-z0-9._-]/gi, "-")
        .toLowerCase()
        .slice(0, 25);

    if (base.length < 4) {
        base = `member${memberId}`;
    }

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

async function hashPassword(password, salt) {
    const material = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: ITERATIONS,
        hash: "SHA-256"
    }, material, 256);

    return bytesToHex(new Uint8Array(bits));
}

function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;

    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return diff === 0;
}

function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function bytesToHex(bytes) {
    return [...bytes]
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

function bytesToBase64(bytes) {
    let binary = "";

    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}

function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, char => char.charCodeAt(0));
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

function json(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Cache-Control": "no-store",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            }
        }
    );
}
