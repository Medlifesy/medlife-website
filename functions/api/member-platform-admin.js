const SESSION_ADMIN_HEADER = "Authorization";

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === "OPTIONS") return json({success:true});
    if (!env.MEMBERS_DB) return json({success:false,error:"Database binding 'MEMBERS_DB' is not configured."},500);
    if (!env.ADMIN_KEY) return json({success:false,error:"Admin secret 'ADMIN_KEY' is not configured."},500);

    const auth=request.headers.get(SESSION_ADMIN_HEADER)||"";
    const match=auth.match(/^Bearer\s+(.+)$/i);
    if(!match||!(await safeEqual(match[1].trim(),env.ADMIN_KEY))) return json({success:false,error:"غير مصرح."},401);

    const db=env.MEMBERS_DB;
    await ensureSchema(db);
    const url=new URL(request.url);
    const action=url.searchParams.get("action")||"list";
    try{
        if(request.method==="GET"&&action==="list")return await listMembers(db);
        if(request.method==="POST"&&action==="invite")return await createInvite(request,env,db);
        return json({success:false,error:"Action not allowed."},405);
    }catch(error){console.error("Member platform admin error:",error);return json({success:false,error:"حدث خطأ غير متوقع."},500)}
}

async function listMembers(db){
    const rows=await db.prepare(`SELECT m.id,m.membership_number,m.full_name,m.email,m.phone,m.governorate,m.medlife_role,m.cell,m.field_location,m.status,m.created_at,a.username,a.account_status,a.last_login_at,i.expires_at AS invite_expires_at,i.used_at AS invite_used_at,i.email_sent_at FROM members m LEFT JOIN member_accounts a ON a.member_id=m.id LEFT JOIN member_invites i ON i.id=(SELECT id FROM member_invites mi WHERE mi.member_id=m.id ORDER BY mi.id DESC LIMIT 1) ORDER BY datetime(m.created_at) DESC LIMIT 1000`).all();
    const members=rows.results||[];
    const active=members.filter(x=>x.status==='active');
    return json({success:true,stats:{total:members.length,active:active.length,accounts:active.filter(x=>x.account_status==='active').length},members});
}

async function createInvite(request,env,db){
    const body=await request.json();
    const memberId=Number(body.member_id);
    if(!Number.isInteger(memberId)||memberId<=0)return json({success:false,error:"معرّف العضو غير صالح."},400);

    const member=await db.prepare(`SELECT id,full_name,email,status,membership_number FROM members WHERE id=? LIMIT 1`).bind(memberId).first();
    if(!member||member.status!=='active')return json({success:false,error:"يجب قبول العضو وتفعيل عضويته أولاً."},400);
    if(!member.email)return json({success:false,error:"لا يوجد بريد إلكتروني مسجل لهذا العضو."},400);
    if(await db.prepare(`SELECT id FROM member_accounts WHERE member_id=? LIMIT 1`).bind(memberId).first())return json({success:false,error:"لدى العضو حساب بالفعل."},409);

    await db.prepare(`UPDATE member_invites SET used_at=CURRENT_TIMESTAMP WHERE member_id=? AND used_at IS NULL`).bind(memberId).run();
    const raw=bytesToHex(randomBytes(20));
    const hash=await sha256Hex(raw);
    const result=await db.prepare(`INSERT INTO member_invites(member_id,invite_code_hash,expires_at,email_sent_at) VALUES(?,?,datetime('now','+7 days'),NULL)`).bind(memberId,hash).run();
    const inviteId=result.meta?.last_row_id??null;
    const origin=new URL(request.url).origin;
    const inviteUrl=`${origin}/members.html?invite=${encodeURIComponent(raw)}`;

    let emailSent=false;
    if(env.CF_ACCOUNT_ID&&env.CF_EMAIL_API_TOKEN){
        const mail=await sendInviteEmail(env,{to:member.email,fullName:member.full_name,inviteCode:raw,inviteUrl});
        if(mail.success){emailSent=true;await db.prepare(`UPDATE member_invites SET email_sent_at=CURRENT_TIMESTAMP WHERE id=?`).bind(inviteId).run()}
    }

    return json({success:true,member_id:memberId,full_name:member.full_name,email:member.email,membership_number:member.membership_number,invite_sent:emailSent,invite_code:raw,invite_url:inviteUrl,expires_in_days:7,message:emailSent?"تم إرسال دعوة الحساب إلى البريد الإلكتروني.":"تم إنشاء دعوة الحساب. خدمة البريد غير مفعلة حالياً؛ استخدم رابط الدعوة الظاهر في لوحة الإدارة."},201);
}

async function sendInviteEmail(env,{to,fullName,inviteCode,inviteUrl}){
    const accountId=String(env.CF_ACCOUNT_ID||'').trim(),token=String(env.CF_EMAIL_API_TOKEN||'').trim(),from=String(env.MEDLIFE_EMAIL_FROM||'members@medlifesy.org').trim();
    const subject="دعوة إنشاء حساب MedLife Members";
    const text=`مرحباً ${fullName}،\n\nتم اعتماد عضويتك في MedLife. يمكنك إنشاء حسابك من الرابط التالي:\n${inviteUrl}\n\nرمز الدعوة: ${inviteCode}\nصلاحية الرمز: 7 أيام\n\nMedLife Syria`;
    const html=`<div dir="rtl" style="font-family:Arial,sans-serif;max-width:620px;margin:30px auto;padding:28px;background:#fff;border:1px solid #e2e8f0;border-radius:18px"><h2 style="color:#151d36">MedLife Syria</h2><p>مرحباً <strong>${escapeHtml(fullName)}</strong>،</p><p>تم اعتماد عضويتك ويمكنك الآن إنشاء حسابك في مجتمع متطوعي MedLife.</p><div style="background:#eef4ff;padding:18px;border-radius:14px;text-align:center"><strong style="font-size:22px">${escapeHtml(inviteCode)}</strong><br><small>صالح لمدة 7 أيام</small></div><p style="text-align:center;margin:25px"><a href="${escapeAttribute(inviteUrl)}" style="background:#ff2a54;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold">إنشاء حسابي</a></p></div>`;
    try{
        const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/email/sending/send`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({to,from,subject,text,html})});
        const data=await response.json().catch(()=>null);
        return {success:!!response.ok&&!!data?.success};
    }catch(error){console.error('Email send error',error);return {success:false}}
}

async function ensureSchema(db){await db.batch([
 db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts(id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL UNIQUE,username TEXT UNIQUE,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'member',account_status TEXT NOT NULL DEFAULT 'active',last_login_at DATETIME,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
 db.prepare(`CREATE TABLE IF NOT EXISTS member_invites(id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL,invite_code_hash TEXT NOT NULL UNIQUE,expires_at DATETIME NOT NULL,used_at DATETIME,email_sent_at DATETIME,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
 db.prepare(`CREATE INDEX IF NOT EXISTS idx_member_invites_member ON member_invites(member_id)`)
])}
async function safeEqual(a,b){if(!a||!b||a.length>500||b.length>500)return false;const enc=new TextEncoder();const[x,y]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);const A=new Uint8Array(x),B=new Uint8Array(y);let d=A.length^B.length;for(let i=0;i<Math.min(A.length,B.length);i++)d|=A[i]^B[i];return d===0}
async function sha256Hex(v){return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))))}function randomBytes(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return a}function bytesToHex(a){return[...a].map(b=>b.toString(16).padStart(2,'0')).join('')}function escapeHtml(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;')}function escapeAttribute(v){return escapeHtml(v)}function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'}})}
