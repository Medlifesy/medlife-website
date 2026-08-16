const SESSION_COOKIE = "medlife_member_session";
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 120000;

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === "OPTIONS") return json({ success: true });

    const db = await findMembersDatabase(env);
    if (!db) return json({ success: false, error: "لم يتم العثور على قاعدة بيانات الأعضاء المرتبطة بالموقع." }, 500);

    const action = new URL(request.url).searchParams.get("action") || "me";

    try {
        if (request.method === "POST" && action === "login") return await login(request, db);
        if (request.method === "POST" && action === "logout") return await logout(request, db);
        if (request.method === "GET" && action === "me") return await me(request, db);
        return json({ success: false, error: "Method or action not allowed." }, 405);
    } catch (error) {
        console.error("member-session error:", error);
        return json({ success: false, error: "حدث خطأ أثناء تنفيذ تسجيل الدخول." }, 500);
    }
}

async function findMembersDatabase(env) {
    const candidates = [];
    if (env.MEMBERS_DB) candidates.push(env.MEMBERS_DB);
    if (env.DB && env.DB !== env.MEMBERS_DB) candidates.push(env.DB);

    for (const db of candidates) {
        try {
            const table = await db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='members' LIMIT 1`).first();
            if (table) return db;
        } catch (error) {
            console.error("member DB detection error:", error);
        }
    }

    return null;
}

async function login(request, db) {
    const body = await request.json();
    const identifier = String(body.identifier || body.username || body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) {
        return json({ success:false, error:"يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور." },400);
    }

    const member = await db.prepare(`
        SELECT id,membership_number,full_name,email,account_email,password_hash,account_status,status,member_code,
               medlife_role,cell,field_location,governorate,join_date,volunteer_certificate
        FROM members
        WHERE lower(COALESCE(account_email,''))=?
           OR lower(COALESCE(email,''))=?
           OR lower(COALESCE(member_code,''))=?
        LIMIT 1
    `).bind(identifier,identifier,identifier).first();

    if (!member) return json({success:false, error:"بيانات الدخول غير صحيحة."},401);
    if (!(member.status === "active" || member.status === "approved")) return json({success:false, error:"عضويتك لم تُعتمد بعد من الإدارة."},403);
    if (member.account_status && member.account_status !== "active") return json({success:false, error:"حسابك غير مفعل حالياً."},403);

    const stored = parseStoredPassword(member.password_hash);
    if (!stored) return json({success:false, error:"لم يتم إنشاء كلمة مرور لهذا الحساب بعد. استخدم رمز الدعوة لإنشاء الحساب."},401);

    const candidate = await hashPassword(password, stored.salt, stored.iterations);
    if (!timingSafeEqual(candidate,stored.hash)) return json({success:false, error:"بيانات الدخول غير صحيحة."},401);

    return withCookie(json({success:true,member:await getMember(db,member.id)}), await createSession(db, member.id));
}

async function me(request,db){
    const memberId = await authenticatedMemberId(request,db);
    if(!memberId) return json({success:false,authenticated:false},401);
    return json({success:true,authenticated:true,member:await getMember(db,memberId)});
}

async function logout(request,db){
    const token=getCookie(request,SESSION_COOKIE);
    if(token){
        await ensureSchema(db);
        await db.prepare(`DELETE FROM member_sessions_v2 WHERE token_hash=?`).bind(await sha256Hex(token)).run();
    }
    const response=json({success:true});
    const h=new Headers(response.headers);
    h.set("Set-Cookie",`${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`);
    return new Response(response.body,{status:response.status,headers:h});
}

async function ensureSchema(db){
    await db.prepare(`CREATE TABLE IF NOT EXISTS member_sessions_v2(id TEXT PRIMARY KEY,token_hash TEXT NOT NULL UNIQUE,member_id INTEGER NOT NULL,expires_at DATETIME NOT NULL,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function createSession(db,memberId){
    await ensureSchema(db);
    const token=randomToken();
    await db.prepare(`INSERT INTO member_sessions_v2(id,token_hash,member_id,expires_at) VALUES(?,?,?,datetime('now','+30 days'))`).bind(token,await sha256Hex(token),memberId).run();
    return token;
}

async function authenticatedMemberId(request,db){
    const token=getCookie(request,SESSION_COOKIE);
    if(!token) return null;
    await ensureSchema(db);
    const hash=await sha256Hex(token);
    const row=await db.prepare(`SELECT member_id FROM member_sessions_v2 WHERE token_hash=? AND datetime(expires_at)>datetime('now') LIMIT 1`).bind(hash).first();
    if(!row) return null;
    await db.prepare(`UPDATE member_sessions_v2 SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?`).bind(hash).run();
    return row.member_id;
}

async function getMember(db,id){
    return await db.prepare(`SELECT id,membership_number,full_name,mother_name,national_id,email,account_email,phone,gender,education_level,study_year,university,resident_specialty,residency_year,residency_hospital,address,governorate,medlife_role,cell,field_location,join_date,volunteer_certificate,status,account_status,member_code FROM members WHERE id=? LIMIT 1`).bind(id).first();
}

function parseStoredPassword(stored){
    const parts=String(stored||"").split("$");
    if(parts.length!==5||parts[0]!=="pbkdf2"||parts[1]!=="sha256") return null;
    const iterations=Number(parts[2]);
    if(!Number.isInteger(iterations)||iterations<10000||!/^[0-9a-f]+$/i.test(parts[3])||!/^[0-9a-f]+$/i.test(parts[4])) return null;
    return {iterations,salt:hexToBytes(parts[3]),hash:parts[4].toLowerCase()};
}

async function hashPassword(password,salt,iterations=PBKDF2_ITERATIONS){
    const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
    const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations,hash:"SHA-256"},key,256);
    return bytesToHex(new Uint8Array(bits));
}

function randomToken(){const b=new Uint8Array(32);crypto.getRandomValues(b);return bytesToHex(b)}
async function sha256Hex(v){return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v))))}
function bytesToHex(b){return [...b].map(x=>x.toString(16).padStart(2,"0")).join("")}
function hexToBytes(h){const b=new Uint8Array(h.length/2);for(let i=0;i<b.length;i++)b[i]=parseInt(h.slice(i*2,i*2+2),16);return b}
function timingSafeEqual(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
function getCookie(request,name){const raw=request.headers.get("Cookie")||"";for(const p of raw.split(";")){const x=p.trim();if(x.startsWith(name+"="))return decodeURIComponent(x.slice(name.length+1));}return null}
function withCookie(response,token){const h=new Headers(response.headers);h.set("Set-Cookie",`${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${SESSION_DAYS*86400}; Path=/; HttpOnly; Secure; SameSite=Lax`);return new Response(response.body,{status:response.status,headers:h})}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"}})}
