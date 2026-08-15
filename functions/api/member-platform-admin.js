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
        if (request.method === "POST" && action === "invite") return await createInvite(request, env);
        return json({success:false,error:"Action not allowed."},405);
    } catch (error) {
        console.error("Member platform admin error:",error);
        return json({success:false,error:"حدث خطأ غير متوقع."},500);
    }
}

async function listMembers(db){
    const rows = await db.prepare(`
        SELECT m.id,m.full_name,m.phone,m.email,m.departments,m.field_city,m.status,m.created_at,
               a.username,a.account_status,a.last_login_at,
               i.expires_at AS invite_expires_at,
               i.used_at AS invite_used_at,
               i.email_sent_at
        FROM members m
        LEFT JOIN member_accounts a ON a.member_id=m.id
        LEFT JOIN member_invites i ON i.id = (
            SELECT id FROM member_invites mi
            WHERE mi.member_id = m.id
            ORDER BY mi.id DESC LIMIT 1
        )
        ORDER BY m.created_at DESC
        LIMIT 1000
    `).all();

    const approved = (rows.results||[]).filter(x=>x.status==='approved');
    const accounts = approved.filter(x=>x.account_status==='active').length;

    return json({
        success:true,
        stats:{
            total:rows.results?.length||0,
            approved:approved.length,
            accounts
        },
        members:rows.results||[]
    });
}

async function createInvite(request, env){
    const body=await request.json();
    const memberId=Number(body.member_id);

    if(!Number.isInteger(memberId)||memberId<=0) {
        return json({success:false,error:"Invalid member ID."},400);
    }

    const member=await env.DB.prepare(`
        SELECT id,full_name,email,status
        FROM members
        WHERE id=?
        LIMIT 1
    `).bind(memberId).first();

    if(!member||member.status!=='approved') {
        return json({success:false,error:"يجب اعتماد المتطوع أولاً."},400);
    }

    if(!member.email) {
        return json({success:false,error:"لا يوجد بريد إلكتروني مسجل لهذا المتطوع."},400);
    }

    const existing=await env.DB.prepare(`
        SELECT id
        FROM member_accounts
        WHERE member_id=?
        LIMIT 1
    `).bind(memberId).first();

    if(existing) {
        return json({success:false,error:"لدى المتطوع حساب بالفعل."},409);
    }

    const raw = bytesToHex(randomBytes(20));
    const hash = await sha256Hex(raw);

    await env.DB.prepare(`
        UPDATE member_invites
        SET used_at=CURRENT_TIMESTAMP
        WHERE member_id=?
          AND used_at IS NULL
    `).bind(memberId).run();

    const inviteResult = await env.DB.prepare(`
        INSERT INTO member_invites (
            member_id,
            invite_code_hash,
            expires_at,
            email_sent_at
        )
        VALUES (?,?,datetime('now','+7 days'),NULL)
    `).bind(memberId,hash).run();

    const inviteId = inviteResult.meta?.last_row_id ?? null;
    const inviteUrl = `https://medlifesy.org/member-register.html?invite=${encodeURIComponent(raw)}`;

    const mailResult = await sendInviteEmail(env, {
        to: member.email,
        fullName: member.full_name,
        inviteCode: raw,
        inviteUrl
    });

    if (!mailResult.success) {
        return json({
            success: false,
            error: mailResult.error || "تعذر إرسال رسالة الدعوة البريدية.",
            invite_created: true,
            invite_code: raw,
            invite_url: inviteUrl,
            member_id: memberId,
            invite_id: inviteId
        }, 502);
    }

    await env.DB.prepare(`
        UPDATE member_invites
        SET email_sent_at=CURRENT_TIMESTAMP
        WHERE id=?
    `).bind(inviteId).run();

    return json({
        success:true,
        member_id:memberId,
        full_name:member.full_name,
        email:member.email,
        invite_sent:true,
        expires_in_days:7
    },201);
}

async function sendInviteEmail(env, { to, fullName, inviteCode, inviteUrl }) {
    const accountId = String(env.CF_ACCOUNT_ID || "").trim();
    const token = String(env.CF_EMAIL_API_TOKEN || "").trim();
    const from = String(env.MEDLIFE_EMAIL_FROM || "members@medlifesy.org").trim();

    if (!accountId || !token) {
        console.error("Cloudflare Email Service secrets are not configured.");
        return {
            success:false,
            error:"لم يتم إعداد خدمة البريد بعد. أضف CF_ACCOUNT_ID و CF_EMAIL_API_TOKEN في Cloudflare."
        };
    }

    const subject = "دعوة الانضمام إلى مجتمع متطوعي MedLife";

    const text = [
        `مرحباً ${fullName}،`,
        "",
        "تم اعتماد طلب انضمامك إلى مجتمع متطوعي MedLife.",
        "يمكنك الآن إنشاء حسابك الشخصي في منصة MedLife Members.",
        "",
        `رمز الدعوة: ${inviteCode}`,
        "صلاحية الرمز: 7 أيام",
        "",
        `رابط إنشاء الحساب: ${inviteUrl}`,
        "",
        "الرجاء عدم مشاركة رمز الدعوة مع أي شخص آخر.",
        "",
        "مع تحيات",
        "مؤسسة ميدلايف الطبية الخيرية التطوعية",
        "MedLife Syria"
    ].join("\n");

    const html = `
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;background:#f5f7fb;font-family:Arial,Tahoma,sans-serif;color:#24323d;direction:rtl;">
<div style="max-width:640px;margin:40px auto;padding:24px;">
  <div style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 14px 35px rgba(21,29,54,.08);">
    <div style="background:linear-gradient(135deg,#151d36,#2b3659);padding:28px;text-align:center;color:#ffffff;">
      <div style="font-size:26px;font-weight:900;">MedLife Syria</div>
      <div style="margin-top:6px;color:#cbd5e1;">دعوة الانضمام إلى مجتمع المتطوعين</div>
    </div>
    <div style="padding:30px;line-height:1.9;">
      <p>مرحباً <strong>${escapeHtml(fullName)}</strong>،</p>
      <p>تم اعتماد طلب انضمامك إلى مجتمع متطوعي <strong>MedLife</strong>، ويمكنك الآن إنشاء حسابك الشخصي.</p>
      <div style="background:#eef4ff;border:1px solid #d9e5ff;border-radius:16px;padding:20px;margin:22px 0;">
        <div style="font-size:13px;color:#64748b;margin-bottom:8px;">رمز الدعوة</div>
        <div style="font-size:24px;font-weight:900;letter-spacing:2px;color:#151d36;direction:ltr;text-align:center;">${escapeHtml(inviteCode)}</div>
        <div style="font-size:12px;color:#64748b;margin-top:10px;text-align:center;">صالح لمدة 7 أيام</div>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="${escapeAttribute(inviteUrl)}" style="display:inline-block;background:#ff2a54;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:12px;font-weight:800;">إنشاء حسابي</a>
      </div>
      <p style="font-size:13px;color:#64748b;">لا تشارك رمز الدعوة مع أي شخص آخر، وإذا لم تطلب هذه الدعوة فتجاهل الرسالة.</p>
      <hr style="border:0;border-top:1px solid #e2e8f0;margin:25px 0;">
      <p style="margin:0;font-weight:800;">مؤسسة ميدلايف الطبية الخيرية التطوعية</p>
      <p style="margin:4px 0 0;color:#64748b;">MedLife Syria</p>
    </div>
  </div>
</div>
</body>
</html>`;

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/email/sending/send`,
        {
            method:"POST",
            headers:{
                "Authorization":`Bearer ${token}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                to,
                from,
                subject,
                text,
                html
            })
        }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
        console.error("Cloudflare Email Service error:", data);
        return {
            success:false,
            error:"تعذر إرسال البريد الإلكتروني. تحقق من إعداد Email Service وبيانات الإرسال."
        };
    }

    return { success:true };
}

async function ensureSchema(db){
    await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS member_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL UNIQUE, username TEXT UNIQUE, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', account_status TEXT NOT NULL DEFAULT 'active', last_login_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS member_invites (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, invite_code_hash TEXT NOT NULL UNIQUE, expires_at DATETIME NOT NULL, used_at DATETIME, email_sent_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
    ]);

    try {
        await db.prepare(`ALTER TABLE member_invites ADD COLUMN email_sent_at DATETIME`).run();
    } catch (_) {
        // Column already exists.
    }
}

async function sha256Hex(value){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return bytesToHex(new Uint8Array(hash));}
function randomBytes(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return a;}
function bytesToHex(a){return [...a].map(b=>b.toString(16).padStart(2,'0')).join('');}
function escapeHtml(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function escapeAttribute(value){return String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"}})}
