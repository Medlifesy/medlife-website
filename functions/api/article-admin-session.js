import { authenticateAdmin } from './_admin-auth.js';

const COOKIE='medlife_articles_session';
const DAYS=7;
const enc=new TextEncoder();

function bytesToHex(bytes){return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');}
function hexToBytes(hex){if(!/^[0-9a-f]+$/i.test(hex)||hex.length%2)throw new Error('Invalid hex');const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++)out[i]=parseInt(hex.slice(i*2,i*2+2),16);return out;}
function equal(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0;}
async function hashToken(token){return bytesToHex(await crypto.subtle.digest('SHA-256',enc.encode(token)));}
function randomToken(){return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));}
async function verifyPassword(password,stored){const p=String(stored||'').split('$');if(p.length!==5||p[0]!=='pbkdf2'||p[1]!=='sha256')return false;const iterations=Number(p[2]);if(!Number.isInteger(iterations)||iterations<10000||iterations>1000000)return false;try{const salt=hexToBytes(p[3]),expected=hexToBytes(p[4]);const key=await crypto.subtle.importKey('raw',enc.encode(password),{name:'PBKDF2'},false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);return equal(new Uint8Array(bits),expected);}catch{return false;}}
function getCookie(request,name){const raw=request.headers.get('Cookie')||'';for(const part of raw.split(';')){const p=part.trim();if(p.startsWith(name+'='))return decodeURIComponent(p.slice(name.length+1));}return null;}
function cookie(name,value,maxAge){return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;}
export function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store',...extra}});}

async function ensureArticleSessionSchema(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS article_admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    member_id INTEGER,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function authenticateArticleAdmin(request,db){
  if(!db)return null;
  try{
    await ensureArticleSessionSchema(db);

    // A valid main /admin session is authoritative. This keeps the public
    // administration dashboard and Article Studio on one login flow.
    const mainAdmin=await authenticateAdmin(request,db);
    if(mainAdmin){
      return {account_id:mainAdmin.member_id,member_id:mainAdmin.member_id,username:mainAdmin.account_email||mainAdmin.email||String(mainAdmin.member_id),role:'admin',display_name:mainAdmin.full_name||mainAdmin.account_email||mainAdmin.email||String(mainAdmin.member_id),avatar_url:null};
    }

    // Direct Article Studio sessions use their own table so they never depend
    // on the legacy member_sessions schema used by the rest of the site.
    const token=getCookie(request,COOKIE);
    if(token){
      const hash=await hashToken(token);
      const row=await db.prepare(`SELECT a.id account_id,a.member_id,a.username,a.role,a.account_status,p.display_name,p.avatar_url
        FROM article_admin_sessions s
        JOIN member_accounts a ON a.id=s.account_id
        LEFT JOIN member_profiles p ON p.member_id=a.member_id
        WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now') LIMIT 1`).bind(hash).first();
      if(row&&row.account_status==='active'){
        const role=String(row.role||'').toLowerCase();
        if(['admin','editor','reviewer'].includes(role)){
          await db.prepare('UPDATE article_admin_sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?').bind(hash).run();
          return row;
        }
      }
    }
    return null;
  }catch(e){console.error('article auth session error:',e);return null;}
}

export async function onRequest({request,env}){
  if(!env.DB)return json({success:false,error:"Database binding 'DB' is not configured."},500);
  const db=env.DB;
  try{
    await ensureArticleSessionSchema(db);
    const action=new URL(request.url).searchParams.get('action')||'me';

    if(request.method==='POST'&&action==='login'){
      const body=await request.json().catch(()=>({}));
      const identifier=String(body.identifier||body.username||'').trim().toLowerCase();
      const password=String(body.password||'');
      if(!identifier||!password)return json({success:false,error:'يرجى إدخال اسم المستخدم وكلمة المرور.'},400);

      const account=await db.prepare(`SELECT a.id,a.member_id,a.username,a.password_hash,a.password_salt,a.role,a.account_status,p.display_name,p.avatar_url
        FROM member_accounts a LEFT JOIN member_profiles p ON p.member_id=a.member_id
        WHERE lower(a.username)=? LIMIT 1`).bind(identifier).first();
      if(!account||account.account_status!=='active')return json({success:false,error:'بيانات الدخول غير صحيحة أو الحساب غير مفعل.'},401);
      const role=String(account.role||'').toLowerCase();
      if(!['admin','editor','reviewer'].includes(role))return json({success:false,error:'هذا الحساب لا يملك صلاحية إدارة المقالات.'},403);
      if(!(await verifyPassword(password,account.password_hash)))return json({success:false,error:'بيانات الدخول غير صحيحة.'},401);

      const token=randomToken();
      await db.prepare(`DELETE FROM article_admin_sessions WHERE account_id=? OR datetime(expires_at)<=datetime('now')`).bind(account.id).run();
      await db.prepare(`INSERT INTO article_admin_sessions(account_id,member_id,token_hash,expires_at,created_at,last_seen_at)
        VALUES(?,?,?,datetime('now','+7 days'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(account.id,account.member_id,await hashToken(token)).run();
      await db.prepare('UPDATE member_accounts SET last_login_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(account.id).run();

      const response=json({success:true,admin:{account_id:account.id,member_id:account.member_id,username:account.username,role,display_name:account.display_name||account.username,avatar_url:account.avatar_url||null}});
      const headers=new Headers(response.headers);
      headers.set('Set-Cookie',cookie(COOKIE,token,DAYS*86400));
      return new Response(response.body,{status:response.status,headers});
    }

    if(request.method==='POST'&&action==='logout'){
      const token=getCookie(request,COOKIE);
      if(token)await db.prepare('DELETE FROM article_admin_sessions WHERE token_hash=?').bind(await hashToken(token)).run();
      const response=json({success:true});
      const headers=new Headers(response.headers);
      headers.set('Set-Cookie',cookie(COOKIE,'',0));
      return new Response(response.body,{status:response.status,headers});
    }

    if(request.method==='GET'&&action==='me'){
      const admin=await authenticateArticleAdmin(request,db);
      if(!admin)return json({success:false,authenticated:false},401);
      return json({success:true,authenticated:true,admin:{account_id:admin.account_id,member_id:admin.member_id,username:admin.username,role:admin.role,display_name:admin.display_name||admin.username,avatar_url:admin.avatar_url||null}});
    }

    return json({success:false,error:'Method or action not allowed.'},405);
  }catch(error){
    console.error('article-admin-session error:',error);
    return json({success:false,error:'تعذر تنفيذ جلسة إدارة المقالات.'},500);
  }
}
