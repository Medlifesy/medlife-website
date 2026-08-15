const ADMIN_KEY = "MEMBERS_ADMIN_KEY";

export async function onRequest(context) {
    const { request, env } = context;
    if (!env.DB) return json({ success:false, error:"Database binding 'DB' is not configured." },500);
    if (request.method === "OPTIONS") return json({success:true});
    const supplied = request.headers.get("X-Admin-Key") || new URL(request.url).searchParams.get("key") || "";
    if (!env[ADMIN_KEY] || supplied !== env[ADMIN_KEY]) return json({success:false,error:"غير مصرح."},401);

    await ensureSchema(env.DB);
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "list";

    try {
        if (request.method === "GET" && action === "list") return await listMembers(env.DB);
        if (request.method === "POST" && action === "invite") return await createInvite(request, env.DB);
        return json({success:false,error:"Action not allowed."},405);
    } catch (error) {
        console.error("Member platform admin error:",error);
        return json({success:false,error:"حدث خطأ غير متوقع."},500);
    }
}

async function listMembers(db){
    const rows = await db.prepare(`
        SELECT m.id,m.full_name,m.phone,m.email,m.departments,m.field_city,m.status,m.created_at,
               a.username,a.account_status,a.last_login_at
        FROM members m LEFT JOIN member_accounts a ON a.member_id=m.id
        ORDER BY m.created_at DESC
        LIMIT 1000
    `).all();
    const approved = (rows.results||[]).filter(x=>x.status==='approved');
    const accounts = approved.filter(x=>x.account_status==='active').length;
    return json({success:true,stats:{total:rows.results?.length||0,approved:approved.length,accounts},members:rows.results||[]});
}

async function createInvite(request,db){
    const body=await request.json();
    const memberId=Number(body.member_id);
    if(!Number.isInteger(memberId)||memberId<=0) return json({success:false,error:"Invalid member ID."},400);
    const member=await db.prepare(`SELECT id,full_name,status FROM members WHERE id=? LIMIT 1`).bind(memberId).first();
    if(!member||member.status!=='approved') return json({success:false,error:"يجب اعتماد المتطوع أولاً."},400);
    const existing=await db.prepare(`SELECT id FROM member_accounts WHERE member_id=? LIMIT 1`).bind(memberId).first();
    if(existing) return json({success:false,error:"لدى المتطوع حساب بالفعل."},409);
    const raw = bytesToHex(randomBytes(20));
    const hash = await sha256Hex(raw);
    await db.prepare(`UPDATE member_invites SET used_at=CURRENT_TIMESTAMP WHERE member_id=? AND used_at IS NULL`).bind(memberId).run();
    await db.prepare(`INSERT INTO member_invites (member_id,invite_code_hash,expires_at) VALUES (?,?,datetime('now','+7 days'))`).bind(memberId,hash).run();
    return json({success:true,member_id:memberId,full_name:member.full_name,invite_code:raw,expires_in_days:7},201);
}

async function ensureSchema(db){
    await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL UNIQUE, username TEXT UNIQUE, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', account_status TEXT NOT NULL DEFAULT 'active', last_login_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_invites (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, invite_code_hash TEXT NOT NULL UNIQUE, expires_at DATETIME NOT NULL, used_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
    ]);
}
async function sha256Hex(value){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return bytesToHex(new Uint8Array(hash));}
function randomBytes(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return a;}
function bytesToHex(a){return [...a].map(b=>b.toString(16).padStart(2,'0')).join('');}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"}})}
