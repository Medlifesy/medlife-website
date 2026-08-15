export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === "OPTIONS") return json({ success: true });
    if (!env.MEMBERS_DB) return json({ success: false, error: "Database binding 'MEMBERS_DB' is not configured." }, 500);
    const db = env.MEMBERS_DB;
    await ensureSchema(db);
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "feed";
    const account = await authenticatedAccount(request, db);
    if (!account) return json({ success: false, error: "يجب تسجيل الدخول أولاً." }, 401);
    try {
        if (request.method === "GET" && action === "feed") return await feed(db, url);
        if (request.method === "GET" && action === "profile") return await profile(db, url, account);
        if (request.method === "GET" && action === "achievements") return await achievements(db, url, account);
        if (request.method === "POST" && action === "profile") return await saveProfile(request, db, account);
        if (request.method === "POST" && action === "achievement") return await addAchievement(request, db, account);
        if (request.method === "POST" && action === "post") return await addPost(request, db, account);
        if (request.method === "POST" && action === "comment") return await addComment(request, db, account);
        if (request.method === "POST" && action === "like") return await toggleLike(request, db, account);
        if (request.method === "DELETE" && action === "post") return await deleteOwnPost(request, db, account);
        return json({ success: false, error: "Action not allowed." }, 405);
    } catch (error) {
        console.error("Community API error:", error);
        return json({ success: false, error: "حدث خطأ غير متوقع." }, 500);
    }
}

async function feed(db, url) {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 20), 1), 50);
    const rows = await db.prepare(`SELECT p.id,p.member_id,p.content,p.image_url,p.created_at,COALESCE(pr.display_name,m.full_name) AS author_name,COALESCE(pr.avatar_url,'') AS avatar_url,(SELECT COUNT(*) FROM member_likes l WHERE l.post_id=p.id) AS likes_count,(SELECT COUNT(*) FROM member_comments c WHERE c.post_id=p.id AND c.status='published') AS comments_count FROM member_posts p JOIN members m ON m.id=p.member_id LEFT JOIN member_profiles pr ON pr.member_id=p.member_id WHERE p.status='published' AND m.status='active' ORDER BY p.created_at DESC LIMIT ?`).bind(limit).all();
    const posts = rows.results || [];
    for (const post of posts) {
        const c = await db.prepare(`SELECT c.id,c.content,c.created_at,c.member_id,COALESCE(pr.display_name,m.full_name) AS author_name,COALESCE(pr.avatar_url,'') AS avatar_url FROM member_comments c JOIN members m ON m.id=c.member_id LEFT JOIN member_profiles pr ON pr.member_id=c.member_id WHERE c.post_id=? AND c.status='published' ORDER BY c.created_at ASC LIMIT 50`).bind(post.id).all();
        post.comments = c.results || [];
    }
    return json({ success: true, posts });
}

async function profile(db, url, account) {
    const memberId = Number(url.searchParams.get("member_id") || account.member_id);
    const member = await db.prepare(`SELECT m.id,m.membership_number,m.full_name,m.email,m.medlife_role,m.cell,m.governorate,p.display_name,p.bio,p.avatar_url,p.cover_url,p.skills,p.social_links,p.privacy FROM members m LEFT JOIN member_profiles p ON p.member_id=m.id WHERE m.id=? AND m.status='active' LIMIT 1`).bind(memberId).first();
    if (!member) return json({ success: false, error: "Profile not found." }, 404);
    if (member.privacy === 'private' && memberId !== account.member_id && account.role === 'member') return json({ success: true, profile: { id: member.id, display_name: member.display_name || member.full_name, medlife_role: member.medlife_role, cell: member.cell, governorate: member.governorate } });
    member.skills = safeJson(member.skills, []);
    member.social_links = safeJson(member.social_links, {});
    return json({ success: true, profile: member });
}

async function achievements(db, url, account) {
    const memberId = Number(url.searchParams.get("member_id") || account.member_id);
    if (memberId !== account.member_id && account.role === 'member') return json({ success: false, error: "غير مصرح." }, 403);
    const rows = await db.prepare(`SELECT * FROM member_achievements WHERE member_id=? ORDER BY achievement_date DESC,created_at DESC`).bind(memberId).all();
    return json({ success: true, achievements: rows.results || [] });
}

async function saveProfile(request, db, account) {
    const body = await request.json();
    const displayName = clean(body.display_name, 150) || account.full_name;
    const bio = clean(body.bio, 1200), avatarUrl = clean(body.avatar_url, 1000), coverUrl = clean(body.cover_url, 1000);
    const skills = Array.isArray(body.skills) ? body.skills.map(x => clean(x, 80)).filter(Boolean).slice(0, 30) : [];
    const socialLinks = body.social_links && typeof body.social_links === 'object' ? body.social_links : {};
    const privacy = body.privacy === 'private' ? 'private' : 'members';
    await db.prepare(`INSERT INTO member_profiles(member_id,display_name,bio,avatar_url,cover_url,skills,social_links,privacy,updated_at) VALUES(?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(member_id) DO UPDATE SET display_name=excluded.display_name,bio=excluded.bio,avatar_url=excluded.avatar_url,cover_url=excluded.cover_url,skills=excluded.skills,social_links=excluded.social_links,privacy=excluded.privacy,updated_at=CURRENT_TIMESTAMP`).bind(account.member_id, displayName, bio, avatarUrl, coverUrl, JSON.stringify(skills), JSON.stringify(socialLinks), privacy).run();
    return json({ success: true, message: "تم تحديث الملف الشخصي." });
}

async function addAchievement(request, db, account) { const body = await request.json(); const title = clean(body.title, 200); if (!title) return json({ success: false, error: "عنوان الإنجاز مطلوب." }, 400); const result = await db.prepare(`INSERT INTO member_achievements(member_id,title,description,achievement_date,credential_url,image_url) VALUES(?,?,?,?,?,?)`).bind(account.member_id, title, clean(body.description, 2500), clean(body.achievement_date, 30), clean(body.credential_url, 1000), clean(body.image_url, 1000)).run(); return json({ success: true, id: result.meta?.last_row_id ?? null }, 201); }
async function addPost(request, db, account) { const body = await request.json(); const content = clean(body.content, 5000); if (!content) return json({ success: false, error: "محتوى المنشور مطلوب." }, 400); const result = await db.prepare(`INSERT INTO member_posts(member_id,content,image_url,status) VALUES(?,?,?,'published')`).bind(account.member_id, content, clean(body.image_url, 1500)).run(); return json({ success: true, id: result.meta?.last_row_id ?? null }, 201); }
async function addComment(request, db, account) { const body = await request.json(); const postId = Number(body.post_id), content = clean(body.content, 2000); if (!Number.isInteger(postId) || postId <= 0 || !content) return json({ success: false, error: "بيانات التعليق غير صحيحة." }, 400); const post = await db.prepare(`SELECT id FROM member_posts WHERE id=? AND status='published'`).bind(postId).first(); if (!post) return json({ success: false, error: "المنشور غير موجود." }, 404); const result = await db.prepare(`INSERT INTO member_comments(post_id,member_id,content) VALUES(?,?,?)`).bind(postId, account.member_id, content).run(); return json({ success: true, id: result.meta?.last_row_id ?? null }, 201); }
async function toggleLike(request, db, account) { const postId = Number((await request.json()).post_id); if (!Number.isInteger(postId) || postId <= 0) return json({ success: false, error: "Invalid post." }, 400); const existing = await db.prepare(`SELECT post_id FROM member_likes WHERE post_id=? AND member_id=?`).bind(postId, account.member_id).first(); if (existing) { await db.prepare(`DELETE FROM member_likes WHERE post_id=? AND member_id=?`).bind(postId, account.member_id).run(); return json({ success: true, liked: false }); } await db.prepare(`INSERT INTO member_likes(post_id,member_id) VALUES(?,?)`).bind(postId, account.member_id).run(); return json({ success: true, liked: true }); }
async function deleteOwnPost(request, db, account) { const id = Number(new URL(request.url).searchParams.get("id")); if (!Number.isInteger(id) || id <= 0) return json({ success: false, error: "Invalid post." }, 400); const r = await db.prepare(`UPDATE member_posts SET status='deleted',updated_at=CURRENT_TIMESTAMP WHERE id=? AND member_id=?`).bind(id, account.member_id).run(); return r.meta?.changes ? json({ success: true }) : json({ success: false, error: "المنشور غير موجود." }, 404); }

async function authenticatedAccount(request, db) {
    const cookies = parseCookies(request.headers.get("Cookie") || "");
    const token = cookies["medlife_member_session"];
    if (!token) return null;
    return await db.prepare(`SELECT a.*,m.full_name,m.status AS member_status FROM member_sessions s JOIN member_accounts a ON a.id=s.account_id JOIN members m ON m.id=a.member_id WHERE s.id=? AND datetime(s.expires_at)>datetime('now') AND a.account_status='active' AND m.status='active' LIMIT 1`).bind(token).first();
}

async function ensureSchema(db) { await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts(id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL UNIQUE,username TEXT UNIQUE,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'member',account_status TEXT NOT NULL DEFAULT 'active',last_login_at DATETIME,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_sessions(id TEXT PRIMARY KEY,account_id INTEGER NOT NULL,expires_at DATETIME NOT NULL,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_profiles(member_id INTEGER PRIMARY KEY,display_name TEXT,bio TEXT,avatar_url TEXT,cover_url TEXT,skills TEXT,social_links TEXT,privacy TEXT DEFAULT 'members',updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_achievements(id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL,title TEXT NOT NULL,description TEXT,achievement_date TEXT,credential_url TEXT,image_url TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_posts(id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL,content TEXT NOT NULL,image_url TEXT,status TEXT DEFAULT 'published',created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_comments(id INTEGER PRIMARY KEY AUTOINCREMENT,post_id INTEGER NOT NULL,member_id INTEGER NOT NULL,content TEXT NOT NULL,status TEXT DEFAULT 'published',created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_likes(post_id INTEGER NOT NULL,member_id INTEGER NOT NULL,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(post_id,member_id))`)
]); }
function clean(v, m) { return String(v ?? '').trim().slice(0, m); }
function safeJson(v, f) { try { return v ? JSON.parse(v) : f; } catch { return f; } }
function parseCookies(v) { const o = {}; for (const p of v.split(/;\s*/)) { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1)); } return o; }
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS' } }); }
