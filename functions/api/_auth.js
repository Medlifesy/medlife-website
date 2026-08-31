/* MEDLIFE AUTH HELPERS
   Passwords are stored as PBKDF2 hashes, never plaintext.
   Sessions are stored in D1 and identified by a random opaque cookie token.

   Password format:
   pbkdf2$sha256$<iterations>$<salt-hex>$<hash-hex>
*/
const ITERATIONS = 100000;
const enc = new TextEncoder();
function bytesToHex(bytes){return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');}
function hexToBytes(hex){if(!/^[0-9a-f]+$/i.test(hex)||hex.length%2)throw new Error('Invalid hex value');const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++)out[i]=parseInt(hex.slice(i*2,i*2+2),16);return out;}
function constantTimeEqual(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;}
export async function hashPassword(password){const salt=crypto.getRandomValues(new Uint8Array(16));const key=await crypto.subtle.importKey('raw',enc.encode(password),{name:'PBKDF2'},false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},key,256);return `pbkdf2$sha256$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(bits)}`;}
export async function verifyPassword(password,stored){const parts=String(stored||'').split('$');if(parts.length!==5||parts[0]!=='pbkdf2'||parts[1]!=='sha256')return false;const iterations=Number(parts[2]);if(!Number.isInteger(iterations)||iterations<10000||iterations>1000000)return false;try{const salt=hexToBytes(parts[3]),expected=hexToBytes(parts[4]);const key=await crypto.subtle.importKey('raw',enc.encode(password),{name:'PBKDF2'},false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);return constantTimeEqual(new Uint8Array(bits),expected);}catch{return false;}}
export async function hashToken(token){return bytesToHex(await crypto.subtle.digest('SHA-256',enc.encode(token)));}
export function randomToken(){return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));}
export async function ensureAuthTables(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT,member_id INTEGER NOT NULL,token_hash TEXT NOT NULL UNIQUE,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  const r=await db.prepare('PRAGMA table_info(members)').all();
  const have=new Set((r.results||[]).map(x=>x.name));
  const cols={status:'TEXT',account_email:'TEXT',password_hash:'TEXT',account_status:'TEXT',member_code:'TEXT',medlife_role:'TEXT'};
  for(const [name,type] of Object.entries(cols)){
    if(!have.has(name)) await db.prepare(`ALTER TABLE members ADD COLUMN ${name} ${type}`).run();
  }
  await db.prepare("UPDATE members SET status='active' WHERE status IS NULL OR trim(status)=''").run();
  await db.prepare("UPDATE members SET account_status='active' WHERE account_status IS NULL OR trim(account_status)=''").run();
}
export function cookie(name,value,maxAge){return `${name}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;}
export function getCookie(request,name){const raw=request.headers.get('Cookie')||'';for(const part of raw.split(';')){const p=part.trim();if(p.startsWith(name+'='))return decodeURIComponent(p.slice(name.length+1));}return null;}
export function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store',...extra}});}
