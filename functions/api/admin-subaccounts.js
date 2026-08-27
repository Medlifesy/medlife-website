import { authenticateArticleAdmin } from './article-admin-session.js';
import { hashPassword, verifyPassword, hashToken, randomToken, getCookie, cookie, json } from './_auth.js';

const COOKIE='medlife_subadmin_session';
const DAYS=7;
const PERMISSIONS=['members','articles','teams','telegram','data'];

async function ensure(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_subaccounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    permissions_json TEXT NOT NULL DEFAULT '[]',
    full_admin INTEGER NOT NULL DEFAULT 0,
    account_status TEXT NOT NULL DEFAULT 'active',
    linked_member_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_subsessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

async function requirePrimary(request,db){
  const admin=await authenticateArticleAdmin(request,db);
  if(!admin) return null;
  const role=String(admin.role||'').toLowerCase();
  return role==='admin' ? admin : null;
}

function normalizePermissions(input,fullAdmin){
  if(fullAdmin) return PERMISSIONS;
  const list=Array.isArray(input)?input.map(String).filter(x=>PERMISSIONS.includes(x)):[];
  return [...new Set(list)];
}

async function authenticateSub(request,db){
  const token=getCookie(request,COOKIE);
  if(!token)return null;
  const hash=await hashToken(token);
  const row=await db.prepare(`SELECT id,full_name,username,email,permissions_json,full_admin,account_status FROM admin_subaccounts a JOIN admin_subsessions s ON s.account_id=a.id WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now') LIMIT 1`).bind(hash).first();
  if(!row||row.account_status!=='active')return null;
  await db.prepare('UPDATE admin_subsessions SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?').bind(hash).run();
  return {...row,permissions:JSON.parse(row.permissions_json||'[]')};
}

export async function onRequest({request,env}){
  if(!env.DB)return json({success:false,error:"Database binding 'DB' is not configured."},500);
  const db=env.DB;
  try{
    await ensure(db);
    const action=new URL(request.url).searchParams.get('action')||'list';

    if(request.method==='GET'&&action==='me'){
      const sub=await authenticateSub(request,db);
      if(!sub)return json({success:false,authenticated:false},401);
      return json({success:true,authenticated:true,admin:{...sub,role:sub.full_admin?'admin':'custom'}});
    }

    if(request.method==='POST'&&action==='logout'){
      const token=getCookie(request,COOKIE);
      if(token)await db.prepare('DELETE FROM admin_subsessions WHERE token_hash=?').bind(await hashToken(token)).run();
      return new Response(JSON.stringify({success:true}),{status:200,headers:{'Content-Type':'application/json','Set-Cookie':cookie(COOKIE,'',0)}});
    }

    const primary=await requirePrimary(request,db);
    if(!primary)return json({success:false,error:'صلاحية المدير الكامل مطلوبة.'},403);

    if(request.method==='GET'&&action==='list'){
      const rows=await db.prepare(`SELECT id,full_name,username,email,permissions_json,full_admin,account_status,linked_member_id,created_at,last_login_at FROM admin_subaccounts ORDER BY created_at DESC`).all();
      return json({success:true,accounts:(rows.results||[]).map(r=>({...r,permissions:JSON.parse(r.permissions_json||'[]')}))});
    }

    if(request.method==='POST'&&action==='create'){
      const body=await request.json().catch(()=>({}));
      const fullName=String(body.fullName||'').trim();
      const username=String(body.username||'').trim().toLowerCase();
      const email=String(body.email||'').trim().toLowerCase()||null;
      const password=String(body.password||'');
      const fullAdmin=Boolean(body.fullAdmin);
      const permissions=normalizePermissions(body.permissions,fullAdmin);
      if(fullName.length<2)return json({success:false,error:'الاسم الكامل مطلوب.'},400);
      if(!/^[a-z0-9._-]{3,40}$/.test(username))return json({success:false,error:'اسم المستخدم يجب أن يكون 3-40 محرفاً إنجليزياً.'},400);
      if(password.length<12)return json({success:false,error:'كلمة المرور يجب أن تكون 12 محرفاً على الأقل.'},400);
      if(!fullAdmin&&!permissions.length)return json({success:false,error:'اختر صلاحية واحدة على الأقل.'},400);
      const exists=await db.prepare('SELECT id FROM admin_subaccounts WHERE lower(username)=? LIMIT 1').bind(username).first();
      if(exists)return json({success:false,error:'اسم المستخدم مستخدم مسبقاً.'},409);
      const passwordHash=await hashPassword(password);
      await db.prepare(`INSERT INTO admin_subaccounts(full_name,username,email,password_hash,permissions_json,full_admin) VALUES(?,?,?,?,?,?)`).bind(fullName,username,email,passwordHash,JSON.stringify(permissions),fullAdmin?1:0).run();
      return json({success:true,message:'تم إنشاء الحساب الإداري بنجاح.'},201);
    }

    if(request.method==='POST'&&action==='toggle'){
      const body=await request.json().catch(()=>({}));
      const id=Number(body.id);
      if(!Number.isInteger(id)||id<1)return json({success:false,error:'معرّف الحساب غير صالح.'},400);
      const row=await db.prepare('SELECT account_status FROM admin_subaccounts WHERE id=?').bind(id).first();
      if(!row)return json({success:false,error:'الحساب غير موجود.'},404);
      const next=row.account_status==='active'?'disabled':'active';
      await db.prepare('UPDATE admin_subaccounts SET account_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(next,id).run();
      return json({success:true,account_status:next});
    }

    return json({success:false,error:'Method or action not allowed.'},405);
  }catch(error){
    console.error('admin-subaccounts error:',error);
    return json({success:false,error:'تعذر تنفيذ إدارة الحسابات الإدارية.'},500);
  }
}

export async function loginSubaccount(request,db){
  const body=await request.json().catch(()=>({}));
  const username=String(body.identifier||body.username||'').trim().toLowerCase();
  const password=String(body.password||'');
  if(!username||!password)return json({success:false,error:'يرجى إدخال اسم المستخدم وكلمة المرور.'},400);
  const account=await db.prepare('SELECT * FROM admin_subaccounts WHERE lower(username)=? LIMIT 1').bind(username).first();
  if(!account||account.account_status!=='active')return json({success:false,error:'بيانات الدخول غير صحيحة أو الحساب غير مفعل.'},401);
  if(!(await verifyPassword(password,account.password_hash)))return json({success:false,error:'بيانات الدخول غير صحيحة.'},401);
  const token=randomToken();
  await db.prepare('DELETE FROM admin_subsessions WHERE account_id=?').bind(account.id).run();
  await db.prepare(`INSERT INTO admin_subsessions(account_id,token_hash,expires_at) VALUES(?,?,datetime('now','+7 days'))`).bind(account.id,await hashToken(token)).run();
  await db.prepare('UPDATE admin_subaccounts SET last_login_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(account.id).run();
  const response=json({success:true,admin:{id:account.id,username:account.username,full_name:account.full_name,email:account.email||null,role:account.full_admin?'admin':'custom',full_admin:Boolean(account.full_admin),permissions:JSON.parse(account.permissions_json||'[]')}});
  const headers=new Headers(response.headers);headers.set('Set-Cookie',cookie(COOKIE,token,DAYS*86400));
  return new Response(response.body,{status:response.status,headers});
}
