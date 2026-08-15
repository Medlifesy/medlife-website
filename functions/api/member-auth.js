const SESSION_COOKIE = "medlife_member_session";
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 120000;

export async function onRequest(context) {
    const { request, env } = context;
    if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);
    if (request.method === "OPTIONS") return json({ success: true });

    await ensureSchema(env.DB);

    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "me";

    try {
        if (request.method === "POST" && action === "register") {
            return await register(request, env);
        }
        if (request.method === "POST" && action === "login") {
            return await login(request, env);
        }
        if (request.method === "POST" && action === "logout") {
            return await logout(request, env);
        }
        if (request.method === "GET" && action === "me") {
            return await me(request, env);
        }

        return json({ success: false, error: "Method or action not allowed." }, 405);
    } catch (error) {
        console.error("Member auth error:", error);
        return json({ success: false, error: "حدث خطأ غير متوقع." }, 500);
    }
}

async function register(request, env) {
    const body = await request.json();
    const inviteCode = clean(body.invite_code, 120);
    const username = clean(body.username, 40).toLowerCase();
    const password = String(body.password || "");

    if (!inviteCode || !username || password.length < 10) {
        return json({ success: false, error: "يرجى إدخال رمز الدعوة واسم المستخدم وكلمة مرور لا تقل عن 10 محارف." }, 400);
    }
    if (!/^[a-z0-9._-]{4,40}$/.test(username)) {
        return json({ success: false, error: "اسم المستخدم يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام و . _ - فقط." }, 400);
    }

    const inviteHash = await sha256Hex(inviteCode);
    const invite = await env.DB.prepare(`
        SELECT i.*, m.full_name, m.status AS member_status
        FROM member_invites i
        JOIN members m ON m.id = i.member_id
        WHERE i.invite_code_hash = ?
          AND i.used_at IS NULL
          AND datetime(i.expires_at) > datetime('now')
        LIMIT 1
    `).bind(inviteHash).first();

    if (!invite || invite.member_status !== "approved") {
        return json({ success: false, error: "رمز الدعوة غير صالح أو منتهي أو أن العضوية لم تُعتمد بعد." }, 400);
    }

    const existingUsername = await env.DB.prepare(`SELECT id FROM member_accounts WHERE username = ? LIMIT 1`).bind(username).first();
    if (existingUsername) return json({ success: false, error: "اسم المستخدم مستخدم مسبقاً." }, 409);

    const accountExists = await env.DB.prepare(`SELECT id FROM member_accounts WHERE member_id = ? LIMIT 1`).bind(invite.member_id).first();
    if (accountExists) return json({ success: false, error: "تم إنشاء حساب لهذا المتطوع مسبقاً." }, 409);

    const salt = randomBytes(16);
    const passwordHash = await hashPassword(password, salt);

    const result = await env.DB.prepare(`
        INSERT INTO member_accounts (member_id, username, password_hash, password_salt, role, account_status)
        VALUES (?, ?, ?, ?, 'member', 'active')
    `).bind(
        invite.member_id,
        username,
        passwordHash,
        bytesToBase64(salt)
    ).run();

    await env.DB.prepare(`INSERT OR IGNORE INTO member_profiles (member_id, display_name) VALUES (?, ?)`).bind(invite.member_id, invite.full_name).run();
    await env.DB.prepare(`UPDATE member_invites SET used_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(invite.id).run();

    const session = await createSession(env.DB, result.meta.last_row_id);
    return withCookie(json({
        success: true,
        message: "تم إنشاء حسابك بنجاح.",
        member: await getMemberHome(env.DB, invite.member_id)
    }), session);
}

async function login(request, env) {
    const body = await request.json();
    const username = clean(body.username, 40).toLowerCase();
    const password = String(body.password || "");

    const account = await env.DB.prepare(`
        SELECT a.*, m.full_name, m.status AS member_status
        FROM member_accounts a
        JOIN members m ON m.id = a.member_id
        WHERE a.username = ?
        LIMIT 1
    `).bind(username).first();

    if (!account || account.account_status !== "active" || account.member_status !== "approved") {
        return json({ success: false, error: "بيانات الدخول غير صحيحة أو الحساب غير مفعل." }, 401);
    }

    const salt = base64ToBytes(account.password_salt);
    const candidate = await hashPassword(password, salt);
    if (!timingSafeEqual(candidate, account.password_hash)) {
        return json({ success: false, error: "بيانات الدخول غير صحيحة." }, 401);
    }

    await env.DB.prepare(`UPDATE member_accounts SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(account.id).run();
    const session = await createSession(env.DB, account.id);

    return withCookie(json({
        success: true,
        member: await getMemberHome(env.DB, account.member_id)
    }), session);
}

async function logout(request, env) {
    const cookies = parseCookies(request.headers.get("Cookie") || "");
    const token = cookies[SESSION_COOKIE];
    if (token) await env.DB.prepare(`DELETE FROM member_sessions WHERE id = ?`).bind(token).run();
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "no-store",
            "Set-Cookie": `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`
        }
    });
}

async function me(request, env) {
    const account = await authenticatedAccount(request, env.DB);
    if (!account) return json({ success: false, authenticated: false }, 401);
    return json({ success: true, authenticated: true, member: await getMemberHome(env.DB, account.member_id) });
}

async function authenticatedAccount(request, db) {
    const cookies = parseCookies(request.headers.get("Cookie") || "");
    const token = cookies[SESSION_COOKIE];
    if (!token) return null;
    const account = await db.prepare(`
        SELECT a.*, m.full_name, m.status AS member_status
        FROM member_sessions s
        JOIN member_accounts a ON a.id = s.account_id
        JOIN members m ON m.id = a.member_id
        WHERE s.id = ?
          AND datetime(s.expires_at) > datetime('now')
          AND a.account_status = 'active'
          AND m.status = 'approved'
        LIMIT 1
    `).bind(token).first();
    if (account) await db.prepare(`UPDATE member_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(token).run();
    return account || null;
}

async function createSession(db, accountId) {
    const id = bytesToHex(randomBytes(32));
    await db.prepare(`INSERT INTO member_sessions (id, account_id, expires_at) VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'))`).bind(id, accountId).run();
    return id;
}

async function getMemberHome(db, memberId) {
    const member = await db.prepare(`
        SELECT m.id, m.full_name, m.email, m.profession, m.university, m.departments, m.field_city, m.status,
               p.display_name, p.bio, p.avatar_url, p.cover_url, p.skills, p.social_links, p.privacy,
               a.username, a.role, a.account_status
        FROM members m
        LEFT JOIN member_profiles p ON p.member_id = m.id
        LEFT JOIN member_accounts a ON a.member_id = m.id
        WHERE m.id = ?
        LIMIT 1
    `).bind(memberId).first();

    if (!member) return null;
    member.departments = safeJson(member.departments, []);
    member.skills = safeJson(member.skills, []);
    return member;
}

async function ensureSchema(db) {
    await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL UNIQUE, username TEXT UNIQUE, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', account_status TEXT NOT NULL DEFAULT 'active', last_login_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_sessions (id TEXT PRIMARY KEY, account_id INTEGER NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_profiles (member_id INTEGER PRIMARY KEY, display_name TEXT, bio TEXT, avatar_url TEXT, cover_url TEXT, profession TEXT, university TEXT, city TEXT, skills TEXT, social_links TEXT, privacy TEXT DEFAULT 'members', updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_achievements (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, achievement_date TEXT, credential_url TEXT, image_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, content TEXT NOT NULL, image_url TEXT, status TEXT DEFAULT 'published', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, member_id INTEGER NOT NULL, content TEXT NOT NULL, status TEXT DEFAULT 'published', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_likes (post_id INTEGER NOT NULL, member_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (post_id, member_id))`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_invites (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, invite_code_hash TEXT NOT NULL UNIQUE, expires_at DATETIME NOT NULL, used_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE INDEX IF NOT EXISTS idx_member_sessions_expires ON member_sessions(expires_at)`),
        db.prepare(`CREATE INDEX IF NOT EXISTS idx_member_posts_created ON member_posts(created_at DESC)`),
        db.prepare(`CREATE INDEX IF NOT EXISTS idx_member_comments_post ON member_comments(post_id, created_at)`)
    ]);
}

async function hashPassword(password, saltBytes) {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" }, material, 256);
    return bytesToHex(new Uint8Array(bits));
}

async function sha256Hex(value) {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return bytesToHex(new Uint8Array(hash));
}

function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}
function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}
function bytesToHex(bytes) { return [...bytes].map(b => b.toString(16).padStart(2, "0")).join(""); }
function bytesToBase64(bytes) { let s = ""; bytes.forEach(b => s += String.fromCharCode(b)); return btoa(s); }
function base64ToBytes(value) { const s = atob(value); return Uint8Array.from(s, c => c.charCodeAt(0)); }
function clean(value, max) { return String(value ?? "").trim().slice(0, max); }
function safeJson(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function parseCookies(value) { const out = {}; for (const part of value.split(/;\s*/)) { const i = part.indexOf("="); if (i > 0) out[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1)); } return out; }
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" } }); }
function withCookie(response, token) { const headers = new Headers(response.headers); headers.set("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${SESSION_DAYS * 86400}; Path=/; HttpOnly; Secure; SameSite=Lax`); return new Response(response.body, { status: response.status, headers }); }
