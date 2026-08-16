const SESSION_COOKIE = "medlife_member_session";
const SESSION_DAYS = 30;
const ITERATIONS = 120000;

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "OPTIONS") return json({ success: true });
    if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);

    const action = new URL(request.url).searchParams.get("action") || "me";

    try {
        await ensureSchema(env.DB);

        if (request.method === "POST" && action === "login") return login(request, env.DB);
        if (request.method === "POST" && action === "logout") return logout(request, env.DB);
        if (request.method === "GET" && action === "me") return me(request, env.DB);

        return json({ success: false, error: "Method or action not allowed." }, 405);
    } catch (error) {
        console.error("MedLife member session error:", error);
        return json({ success: false, error: "تعذر تنفيذ عملية تسجيل الدخول حالياً." }, 500);
    }
}

async function login(request, db) {
    const body = await request.json();
    const identifier = clean(body.identifier || body.username || body.email, 120).toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) {
        return json({ success: false, error: "يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور." }, 400);
    }

    const member = await db.prepare(`
        SELECT
            m.id,m.full_name,m.email,m.status,
            m.password_hash AS legacy_password_hash,
            a.id AS account_id,a.username,a.password_hash AS account_password_hash,
            a.password_salt,a.account_status,a.role
        FROM members m
        LEFT JOIN member_accounts a ON a.member_id=m.id
        WHERE lower(COALESCE(m.email,''))=? OR lower(COALESCE(a.username,''))=?
        ORDER BY CASE WHEN a.id IS NOT NULL THEN 0 ELSE 1 END
        LIMIT 1
    `).bind(identifier, identifier).first();

    if (!member) return json({ success: false, error: "البريد الإلكتروني أو اسم المستخدم غير موجود في قاعدة MedLife." }, 401);
    if (!(member.status === "active" || member.status === "approved")) {
        return json({ success: false, error: "عضويتك موجودة في النظام، لكنها لم تُعتمد بعد من الإدارة." }, 403);
    }

    let valid = false;

    if (member.account_id && member.account_status === "active" && member.account_password_hash && member.password_salt) {
        valid = await verifyCurrentPassword(password, member.account_password_hash, member.password_salt);
    }

    if (!valid && member.legacy_password_hash) {
        valid = await verifyLegacyPassword(password, member.legacy_password_hash);
    }

    if (!valid) return json({ success: false, error: "كلمة المرور غير صحيحة." }, 401);

    let accountId = member.account_id;

    if (!accountId) {
        const username = await createUsername(db, member.email, member.id);
        const legacy = parseLegacyHash(member.legacy_password_hash);
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

        const result = await db.prepare(`
            INSERT INTO member_accounts(member_id,username,password_hash,password_salt,role,account_status)
            VALUES(?,?,?,?, 'member','active')
        `).bind(member.id, username, passwordHash, passwordSalt).run();

        accountId = result.meta?.last_row_id || null;
        await db.prepare(`INSERT OR IGNORE INTO member_profiles(member_id,display_name) VALUES(?,?)`).bind(member.id, member.full_name || "عضو MedLife").run();
    }

    await db.prepare(`UPDATE member_accounts SET account_status='active',last_login_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(accountId).run();

    const rawToken = bytesToHex(randomBytes(32));
    const tokenHash = await sha256Hex(rawToken);

    await db.prepare(`INSERT INTO member_auth_sessions(token_hash,account_id,expires_at) VALUES(?,?,datetime('now','+30 days'))`).bind(tokenHash, accountId).run();

    const response = json({ success: true, message: "تم تسجيل الدخول بنجاح.", member: await getMemberHome(db, member.id) });
    const headers = new Headers(response.headers);
    headers.set("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(rawToken)}; Max-Age=${SESSION_DAYS * 86400}; Path=/; HttpOnly; Secure; SameSite=Lax`);

    return new Response(response.body, { status: response.status, headers });
}

async function logout(request, db) {
    const token = getCookie(request, SESSION_COOKIE);
    if (token) await db.prepare(`DELETE FROM member_auth_sessions WHERE token_hash=?`).bind(await sha256Hex(token)).run();
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "no-store",
            "Set-Cookie": `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`
        }
    });
}

async function me(request, db) {
    const token = getCookie(request, SESSION_COOKIE);
    if (!token) return json({ success: false, authenticated: false }, 401);

    const tokenHash = await sha256Hex(token);
    const account = await db.prepare(`
        SELECT a.*,m.full_name,m.status AS member_status
        FROM member_auth_sessions s
        JOIN member_accounts a ON a.id=s.account_id
        JOIN members m ON m.id=a.member_id
        WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now') AND a.account_status='active'
        LIMIT 1
    `).bind(tokenHash).first();

    if (!account || !(account.member_status === "active" || account.member_status === "approved")) {
        return json({ success: false, authenticated: false }, 401);
    }

    await db.prepare(`UPDATE member_auth_sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?`).bind(tokenHash).run();
    return json({ success: true, authenticated: true, member: await getMemberHome(db, account.member_id) });
}

async function ensureSchema(db) {
    await db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts(id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL UNIQUE,username TEXT UNIQUE,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'member',account_status TEXT NOT NULL DEFAULT 'active',last_login_at DATETIME,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS member_auth_sessions(id INTEGER PRIMARY KEY AUTOINCREMENT,token_hash TEXT NOT NULL UNIQUE,account_id INTEGER NOT NULL,expires_at DATETIME NOT NULL,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS member_profiles(member_id INTEGER PRIMARY KEY,display_name TEXT,bio TEXT,avatar_url TEXT,cover_url TEXT,skills TEXT,social_links TEXT,privacy TEXT DEFAULT 'members',updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function verifyCurrentPassword(password, storedHash, storedSalt) {
    try { return timingSafeEqual(await hashPassword(password, base64ToBytes(storedSalt)), storedHash); } catch { return false; }
}

async function verifyLegacyPassword(password, stored) {
    const parsed = parseLegacyHash(stored);
    if (!parsed) return false;
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: parsed.salt, iterations: parsed.iterations, hash: "SHA-256" }, material, 256);
    return timingSafeEqual(bytesToHex(new Uint8Array(bits)), parsed.hash);
}

function parseLegacyHash(stored) {
    const parts = String(stored || "").split("$");
    if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") return null;
    const iterations = Number(parts[2]);
    if (!Number.isInteger(iterations) || iterations < 10000) return null;
    if (!/^[0-9a-f]+$/i.test(parts[3]) || !/^[0-9a-f]+$/i.test(parts[4])) return null;
    return { iterations, salt: hexToBytes(parts[3]), hash: parts[4].toLowerCase() };
}

async function createUsername(db, email, memberId) {
    let base = String(email || "member").split("@")[0].replace(/[^a-z0-9._-]/gi, "-").toLowerCase().slice(0, 25);
    if (base.length < 4) base = `member${memberId}`;
    let username = base;
    let counter = 1;
    while (await db.prepare(`SELECT id FROM member_accounts WHERE username=? LIMIT 1`).bind(username).first()) username = `${base.slice(0,30)}-${counter++}`;
    return username.slice(0, 40);
}

async function hashPassword(password, salt) {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, material, 256);
    return bytesToHex(new Uint8Array(bits));
}

async function sha256Hex(value) {
    return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

async function getMemberHome(db, memberId) {
    const member = await db.prepare(`
        SELECT m.id,m.membership_number,m.full_name,m.mother_name,m.email,m.phone,m.gender,
               m.education_level,m.study_year,m.university,m.resident_specialty,m.residency_year,
               m.residency_hospital,m.address,m.governorate,m.medlife_role,m.cell,m.field_location,
               m.join_date,m.volunteer_certificate,m.status,
               p.display_name,p.bio,p.avatar_url,p.cover_url,p.skills,p.social_links,p.privacy,
               a.username,a.role,a.account_status
        FROM members m
        LEFT JOIN member_profiles p ON p.member_id=m.id
        LEFT JOIN member_accounts a ON a.member_id=m.id
        WHERE m.id=? LIMIT 1
    `).bind(memberId).first();
    if (!member) return null;
    member.skills = safeJson(member.skills, []);
    member.social_links = safeJson(member.social_links, {});
    return member;
}

function getCookie(request, name) {
    const raw = request.headers.get("Cookie") || "";
    for (const part of raw.split(";")) {
        const item = part.trim();
        if (item.startsWith(name + "=")) return decodeURIComponent(item.slice(name.length + 1));
    }
    return null;
}

function randomBytes(length) { const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return bytes; }
function bytesToHex(bytes) { return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join(""); }
function bytesToBase64(bytes) { let binary=""; bytes.forEach(byte => binary += String.fromCharCode(byte)); return btoa(binary); }
function base64ToBytes(value) { const binary=atob(value); return Uint8Array.from(binary,char=>char.charCodeAt(0)); }
function hexToBytes(hex) { const bytes=new Uint8Array(hex.length/2); for(let i=0;i<bytes.length;i++) bytes[i]=parseInt(hex.slice(i*2,i*2+2),16); return bytes; }
function timingSafeEqual(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function clean(value,max){return String(value??"").trim().slice(0,max);}
function safeJson(value,fallback){try{return value?JSON.parse(value):fallback}catch{return fallback}}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"}})}
