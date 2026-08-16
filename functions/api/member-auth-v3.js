const SESSION_COOKIE = "medlife_member_session";
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 120000;
const RESET_COOLDOWN_MINUTES = 5;

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === "OPTIONS") return json({ success: true });
    if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);

    const action = new URL(request.url).searchParams.get("action") || "me";
    try {
        if (request.method === "POST" && action === "register") return await register(request, env.DB);
        if (request.method === "POST" && action === "login") return await login(request, env.DB);
        if (request.method === "POST" && action === "forgot") return await forgot(request, env);
        if (request.method === "GET" && action === "validate-reset") return await validateReset(request, env.DB);
        if (request.method === "POST" && action === "reset") return await reset(request, env.DB);
        if (request.method === "POST" && action === "logout") return await logout(request, env.DB);
        if (request.method === "GET" && action === "me") return await me(request, env.DB);
        return json({ success: false, error: "Method or action not allowed." }, 405);
    } catch (error) {
        console.error("member-auth-v3 error:", error);
        return json({ success: false, error: "حدث خطأ أثناء تنفيذ العملية." }, 500);
    }
}

async function register(request, db) {
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
    const invite = await db.prepare(`
        SELECT i.id AS invite_id, i.member_id, m.full_name, m.email, m.account_email,
               m.status, m.account_status, m.member_code, m.password_hash
        FROM member_invites i
        JOIN members m ON m.id=i.member_id
        WHERE i.invite_code_hash=?
          AND i.used_at IS NULL
          AND datetime(i.expires_at)>datetime('now')
        LIMIT 1
    `).bind(inviteHash).first();

    if (!invite || !isApprovedStatus(invite.status)) {
        return json({ success:false, error:"رمز الدعوة غير صالح أو منتهي أو أن العضوية لم تُعتمد بعد." }, 400);
    }

    if (invite.password_hash || invite.account_status === "active") {
        return json({ success:false, error:"تم إنشاء حساب لهذا العضو مسبقاً." }, 409);
    }

    const usernameExists = await db.prepare(`
        SELECT id FROM members
        WHERE lower(COALESCE(member_code,''))=lower(?) AND id<>?
        LIMIT 1
    `).bind(username, invite.member_id).first();

    if (usernameExists) {
        return json({ success:false, error:"اسم المستخدم مستخدم مسبقاً." }, 409);
    }

    const salt = randomBytes(16);
    const hash = await hashPassword(password, salt);
    const email = clean(invite.account_email || invite.email, 200).toLowerCase();

    await db.prepare(`
        UPDATE members
        SET account_email=?, password_hash=?, account_status='active', member_code=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
    `).bind(email || null, formatPasswordHash(salt, hash), username, invite.member_id).run();

    await db.prepare(`UPDATE member_invites SET used_at=CURRENT_TIMESTAMP WHERE id=?`).bind(invite.invite_id).run();

    return withCookie(
        json({ success:true, message:"تم إنشاء حسابك بنجاح.", member:await getMember(db, invite.member_id) }),
        await createSession(db, invite.member_id)
    );
}

async function login(request, db) {
    const body = await request.json();
    const identifier = clean(body.identifier || body.username || body.email, 200).toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) {
        return json({ success:false, error:"يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور." }, 400);
    }

    const member = await findMemberByIdentifier(db, identifier);
    if (!member) return json({ success:false, error:"بيانات الدخول غير صحيحة." }, 401);
    if (!isApprovedStatus(member.status)) return json({ success:false, error:"عضويتك موجودة في النظام لكنها لم تُعتمد بعد من الإدارة." }, 403);
    if (member.account_status && member.account_status !== "active") return json({ success:false, error:"حسابك غير مفعل حالياً." }, 403);

    const stored = parseStoredPassword(member.password_hash);
    if (!stored) return json({ success:false, error:"لم يتم إنشاء كلمة مرور لهذا الحساب بعد. استخدم رمز الدعوة لإنشاء الحساب." }, 401);

    const candidate = await hashPassword(password, stored.salt, stored.iterations);
    if (!timingSafeEqual(candidate, stored.hash)) return json({ success:false, error:"بيانات الدخول غير صحيحة." }, 401);

    return withCookie(
        json({ success:true, member:await getMember(db, member.id) }),
        await createSession(db, member.id)
    );
}

async function forgot(request, env) {
    const generic = "إذا كان البريد الإلكتروني مرتبطاً بحساب MedLife، فسيصلك رابط لإعادة تعيين كلمة المرور خلال دقائق.";
    if (!env.RESEND_API_KEY) return json({ success:false, error:"خدمة البريد غير مهيأة حالياً." }, 500);

    const body = await request.json();
    const email = clean(body.email, 200).toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ success:false, error:"يرجى إدخال بريد إلكتروني صالح." }, 400);

    const member = await env.DB.prepare(`
        SELECT id, full_name, email, account_email, status, account_status, password_hash
        FROM members
        WHERE lower(COALESCE(account_email,''))=? OR lower(COALESCE(email,''))=?
        LIMIT 1
    `).bind(email, email).first();

    if (!member || !isApprovedStatus(member.status) || (member.account_status && member.account_status !== "active")) {
        return json({ success:true, message:generic });
    }

    const recent = await env.DB.prepare(`
        SELECT id FROM member_password_reset_v3
        WHERE member_id=? AND used_at IS NULL
          AND datetime(created_at)>datetime('now',?)
        LIMIT 1
    `).bind(member.id, `-${RESET_COOLDOWN_MINUTES} minutes`).first();

    if (recent) return json({ success:true, message:generic });

    await env.DB.prepare(`
        UPDATE member_password_reset_v3 SET used_at=CURRENT_TIMESTAMP
        WHERE member_id=? AND used_at IS NULL
    `).bind(member.id).run();

    const token = randomToken();
    const tokenHash = await sha256Hex(token);

    await env.DB.prepare(`
        INSERT INTO member_password_reset_v3(member_id,token_hash,expires_at)
        VALUES(?,?,datetime('now','+60 minutes'))
    `).bind(member.id, tokenHash).run();

    const resetUrl = `https://medlifesy.org/reset-password.html?token=${encodeURIComponent(token)}`;
    const response = await sendEmail(
        env.RESEND_API_KEY,
        clean(member.account_email || member.email, 200).toLowerCase(),
        "إعادة تعيين كلمة مرور MedLife",
        buildResetEmail(member.full_name || "عضو MedLife", resetUrl)
    );

    if (!response.ok) {
        console.error("Resend error:", response.data);
        return json({ success:false, error:"تعذر إرسال رسالة إعادة تعيين كلمة المرور حالياً." }, 502);
    }

    return json({ success:true, message:generic });
}

async function validateReset(request, db) {
    const token = new URL(request.url).searchParams.get("token") || "";
    if (!token) return json({ success:false, valid:false }, 400);
    const row = await db.prepare(`
        SELECT id FROM member_password_reset_v3
        WHERE token_hash=? AND used_at IS NULL AND datetime(expires_at)>datetime('now')
        LIMIT 1
    `).bind(await sha256Hex(token)).first();
    return json({ success:true, valid:!!row });
}

async function reset(request, db) {
    const body = await request.json();
    const token = clean(body.token, 200);
    const password = String(body.password || "");
    if (!token || password.length < 10) return json({ success:false, error:"رابط إعادة التعيين غير صالح أو كلمة المرور قصيرة جداً." }, 400);

    const row = await db.prepare(`
        SELECT id, member_id FROM member_password_reset_v3
        WHERE token_hash=? AND used_at IS NULL AND datetime(expires_at)>datetime('now')
        LIMIT 1
    `).bind(await sha256Hex(token)).first();

    if (!row) return json({ success:false, error:"رابط إعادة التعيين غير صالح أو منتهي الصلاحية." }, 400);

    const salt = randomBytes(16);
    const hash = await hashPassword(password, salt);
    const stored = formatPasswordHash(salt, hash);

    await db.batch([
        db.prepare(`UPDATE members SET password_hash=?, account_status='active', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(stored, row.member_id),
        db.prepare(`UPDATE member_password_reset_v3 SET used_at=CURRENT_TIMESTAMP WHERE id=?`).bind(row.id),
        db.prepare(`DELETE FROM member_sessions_v2 WHERE member_id=?`).bind(row.member_id)
    ]);

    return json({ success:true, message:"تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول." });
}

async function logout(request, db) {
    const token = getCookie(request, SESSION_COOKIE);
    if (token) await db.prepare(`DELETE FROM member_sessions_v2 WHERE token_hash=?`).bind(await sha256Hex(token)).run();
    return clearCookie(json({ success:true }));
}

async function me(request, db) {
    const id = await authenticatedMemberId(request, db);
    if (!id) return json({ success:false, authenticated:false }, 401);
    return json({ success:true, authenticated:true, member:await getMember(db, id) });
}

async function ensureSchema(db) {
    await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS member_sessions_v2(id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, member_id INTEGER NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_password_reset_v3(id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at DATETIME NOT NULL, used_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
    ]);
}

async function findMemberByIdentifier(db, identifier) {
    return await db.prepare(`
        SELECT id,membership_number,full_name,email,account_email,password_hash,account_status,status,member_code,
               medlife_role,cell,field_location,governorate,join_date,volunteer_certificate
        FROM members
        WHERE lower(COALESCE(account_email,''))=?
           OR lower(COALESCE(email,''))=?
           OR lower(COALESCE(member_code,''))=?
        LIMIT 1
    `).bind(identifier,identifier,identifier).first();
}

async function getMember(db, id) {
    return await db.prepare(`
        SELECT id,membership_number,full_name,mother_name,national_id,email,account_email,phone,gender,
               education_level,study_year,university,resident_specialty,residency_year,residency_hospital,
               address,governorate,medlife_role,cell,field_location,join_date,volunteer_certificate,
               status,account_status,member_code
        FROM members WHERE id=? LIMIT 1
    `).bind(id).first();
}

async function createSession(db, memberId) {
    const token = randomToken();
    await db.prepare(`
        INSERT INTO member_sessions_v2(id,token_hash,member_id,expires_at)
        VALUES(?,?,?,datetime('now','+30 days'))
    `).bind(token, await sha256Hex(token), memberId).run();
    return token;
}

async function authenticatedMemberId(request, db) {
    const token = getCookie(request, SESSION_COOKIE);
    if (!token) return null;
    const hash = await sha256Hex(token);
    const row = await db.prepare(`
        SELECT s.member_id FROM member_sessions_v2 s
        JOIN members m ON m.id=s.member_id
        WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now')
          AND (m.account_status IS NULL OR m.account_status='active')
          AND (m.status='active' OR m.status='approved')
        LIMIT 1
    `).bind(hash).first();
    if (!row) return null;
    await db.prepare(`UPDATE member_sessions_v2 SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?`).bind(hash).run();
    return row.member_id;
}

async function sendEmail(apiKey,to,subject,html) {
    const response = await fetch("https://api.resend.com/emails",{
        method:"POST",
        headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
        body:JSON.stringify({from:"MedLife Syria <noreply@medlifesy.org>",to:[to],subject,html})
    });
    return { ok:response.ok, data:await response.json().catch(()=>({})) };
}

function buildResetEmail(name,url) {
    return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f7f9fc;font-family:Arial,Tahoma,sans-serif;color:#1e293b"><div style="max-width:620px;margin:35px auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:30px"><div style="text-align:center"><h2 style="color:#151d36">MedLife Syria</h2><p style="color:#64748b">إعادة تعيين كلمة مرور حساب الأعضاء</p></div><p>مرحباً ${escapeHtml(name)},</p><p>تم طلب إعادة تعيين كلمة المرور لحسابك في منصة متطوعي MedLife.</p><p style="text-align:center;margin:30px 0"><a href="${url}" style="display:inline-block;background:#ff2a54;color:#fff;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:700">إعادة تعيين كلمة المرور</a></p><p style="color:#64748b;font-size:13px">الرابط صالح لمدة ساعة واحدة ويُستخدم مرة واحدة فقط.</p><p style="color:#64748b;font-size:13px">إذا لم تطلب إعادة التعيين، تجاهل الرسالة.</p><hr style="border:0;border-top:1px solid #e2e8f0;margin:25px 0"><p style="color:#94a3b8;font-size:12px;text-align:center">MedLife Syria · بالعمل التطوعي نصنع الأثر.</p></div></body></html>`;
}

function parseStoredPassword(stored) {
    const parts=String(stored||"").split("$");
    if(parts.length!==5||parts[0]!=="pbkdf2"||parts[1]!=="sha256") return null;
    const iterations=Number(parts[2]);
    if(!Number.isInteger(iterations)||iterations<10000||!/^[0-9a-f]+$/i.test(parts[3])||!/^[0-9a-f]+$/i.test(parts[4])) return null;
    return {iterations,salt:hexToBytes(parts[3]),hash:parts[4].toLowerCase()};
}

async function hashPassword(password,salt,iterations=PBKDF2_ITERATIONS) {
    const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
    const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations,hash:"SHA-256"},key,256);
    return bytesToHex(new Uint8Array(bits));
}

function formatPasswordHash(salt,hash){return `pbkdf2$sha256$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${hash}`;}
function randomToken(){const b=new Uint8Array(32);crypto.getRandomValues(b);return bytesToHex(b);}
async function sha256Hex(v){return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v))));}
function bytesToHex(b){return [...b].map(x=>x.toString(16).padStart(2,"0")).join("");}
function hexToBytes(h){const b=new Uint8Array(h.length/2);for(let i=0;i<b.length;i++)b[i]=parseInt(h.slice(i*2,i*2+2),16);return b;}
function timingSafeEqual(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
function clean(v,m){return String(v??"").trim().slice(0,m);}
function isApprovedStatus(v){return v==="active"||v==="approved";}
function getCookie(request,name){const raw=request.headers.get("Cookie")||"";for(const p of raw.split(";")){const x=p.trim();if(x.startsWith(name+"="))return decodeURIComponent(x.slice(name.length+1));}return null;}
function withCookie(response,token){const h=new Headers(response.headers);h.set("Set-Cookie",`${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${SESSION_DAYS*86400}; Path=/; HttpOnly; Secure; SameSite=Lax`);return new Response(response.body,{status:response.status,headers:h});}
function clearCookie(response){const h=new Headers(response.headers);h.set("Set-Cookie",`${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`);return new Response(response.body,{status:response.status,headers:h});}
function escapeHtml(v){return String(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"}});}
