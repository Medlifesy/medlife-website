/* MEDLIFE AUTH HELPERS
   Passwords are stored as PBKDF2 hashes, never plaintext.
   Sessions are stored in D1 and identified by a random opaque cookie token.
*/
const ITERATIONS = 100000;
const enc = new TextEncoder();

function bytesToHex(bytes){return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('')}
function hexToBytes(hex){const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++)out[i]=parseInt(hex.slice(i*2,i*2+2),16);return out}

export async function hashPassword(password){
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.importKey('raw',enc.encode(password),{name:'PBKDF2'},false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},key,256);
  return `pbkdf2$sha256$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(bits)}`;
}

export async function verifyPassword(password,stored){
  const parts=String(stored||'').split('$');
  if(parts.length!==5||parts[0]!=='pbkdf2'||parts[1]!=='sha256')return false;
  const iterations=Number(parts[2]);
  if(!Number.isInteger(iterations)||iterations<10000)return false;
  const key=await crypto.subtle.importKey('raw',enc.encode(password),{name:'PBKDF2'},false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:hexToBytes(parts[3]),iterations,hash:'SHA-256'},key,256);
  const actual=new Uint8Array(bits),expected=hexToBytes(parts[4]);
  return actual.length===expected.length && crypto.subtle.timingSafeEqual(actual,expected);
}

export async function hashToken(token){
  const digest=await crypto.subtle.digest('SHA-256',enc.encode(token));
  return bytesToHex(digest);
}

export function randomToken(){
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

export async function ensureAuthTables(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  const r=await db.prepare('PRAGMA table_info(members)').all();
  const have=new Set((r.results||[]).map(x=>x.name));
  const cols={account_email:'TEXT',password_hash:'TEXT',account_status:'TEXT',member_code:'TEXT'};
  for(const [name,type] of Object.entries(cols))if(!have.has(name))await db.prepare(`ALTER TABLE members ADD COLUMN ${name} ${type}`).run();
}

export function cookie(name,value,maxAge){return `${name}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`}
export function getCookie(request,name){const raw=request.headers.get('Cookie')||'';const match=raw.match(new RegExp('(?:^|;\\s*)'+name.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'=([^;]*)'));return match?decodeURIComponent(match[1]):null}
export function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store',...extra}})}
