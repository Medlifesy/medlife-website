import { authenticateArticleAdmin } from './article-admin-session.js';

const DATA_SOURCE_ID = '6fdacc1d-7b08-4a25-8e85-4cbeff40bc25';
const NOTION_VERSION = '2025-09-03';
const PAGE_SIZE = 100;
const CELL_COOKIE = 'medlife_content_center_session';
const SESSION_DAYS = 7;
const ITERATIONS = 120000;
const enc = new TextEncoder();

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store, no-cache, must-revalidate, max-age=0', ...extra } });
}
function bytesToHex(bytes) { return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join(''); }
function hexToBytes(hex) { if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2) throw new Error('Invalid hex'); const out = new Uint8Array(hex.length / 2); for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16); return out; }
function equal(a, b) { if (a.length !== b.length) return false; let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]; return diff === 0; }
async function sha256(value) { return bytesToHex(await crypto.subtle.digest('SHA-256', enc.encode(value))); }
async function hashPassword(password) { const salt = crypto.getRandomValues(new Uint8Array(16)); const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']); const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256); return `pbkdf2$sha256$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(bits)}`; }
async function verifyPassword(password, stored) { const p = String(stored || '').split('$'); if (p.length !== 5 || p[0] !== 'pbkdf2' || p[1] !== 'sha256') return false; const iterations = Number(p[2]); if (!Number.isInteger(iterations) || iterations < 10000 || iterations > 1000000) return false; try { const salt = hexToBytes(p[3]); const expected = hexToBytes(p[4]); const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']); const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256); return equal(new Uint8Array(bits), expected); } catch { return false; } }
function getCookie(request, name) { const raw = request.headers.get('Cookie') || ''; for (const part of raw.split(';')) { const p = part.trim(); if (p.startsWith(name + '=')) return decodeURIComponent(p.slice(name.length + 1)); } return null; }
function setCookie(name, value, maxAge) { return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`; }
async function ensureTables(db) { await db.prepare(`CREATE TABLE IF NOT EXISTS content_center_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT,cell_name TEXT NOT NULL UNIQUE,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run(); await db.prepare(`CREATE TABLE IF NOT EXISTS content_center_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT,account_id INTEGER NOT NULL,token_hash TEXT NOT NULL UNIQUE,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run(); }
async function currentCell(request, db) { const token = getCookie(request, CELL_COOKIE); if (!token) return null; const row = await db.prepare(`SELECT a.id,a.cell_name,a.username,a.active FROM content_center_sessions s JOIN content_center_accounts a ON a.id=s.account_id WHERE s.token_hash=?1 AND datetime(s.expires_at)>datetime('now') AND a.active=1 LIMIT 1`).bind(await sha256(token)).first(); if (!row) return null; await db.prepare('UPDATE content_center_sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?1').bind(await sha256(token)).run(); return row; }
function textProperty(property) { if (!property) return ''; if (property.type === 'title') return (property.title ?? []).map(x => x?.plain_text ?? '').join('').trim(); if (property.type === 'rich_text') return (property.rich_text ?? []).map(x => x?.plain_text ?? '').join('').trim(); if (property.type === 'url') return String(property.url ?? '').trim(); if (property.type === 'number') return property.number == null ? '' : String(property.number); if (property.type === 'select') return property.select?.name ?? ''; if (property.type === 'status') return property.status?.name ?? ''; if (property.type === 'people') return (property.people ?? []).map(x => x?.name ?? '').filter(Boolean).join('، '); return ''; }
function dateProperty(property) { return property?.date?.start ?? ''; }
function mapPage(page) { const p = page?.properties ?? {}; return { id: page.id, url: page.url ?? null, title: textProperty(p['عنوان المحتوى']), cell: textProperty(p['الخلية']), unit: textProperty(p['القسم / الوحدة']), status: textProperty(p['الحالة']), priority: textProperty(p['الأولوية']), author: textProperty(p['الكاتب']), cellManager: textProperty(p['مسؤول الخلية']), due: dateProperty(p['تاريخ التسليم الفعلي']), publish: dateProperty(p['تاريخ النشر']), updated: page.last_edited_time ?? '', published: p['تم النشر']?.checkbox === true, designUrl: textProperty(p['رابط التصميم']) || null, publishedUrl: textProperty(p['رابط المنشور']) || null }; }
async function notionQuery(env, body = {}) { if (!env.NOTION_API_TOKEN) throw new Error('NOTION_API_TOKEN is not configured'); const response = await fetch(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`, { method: 'POST', headers: { Authorization: `Bearer ${env.NOTION_API_TOKEN}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' }, body: JSON.stringify({ page_size: PAGE_SIZE, ...body }) }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload?.message || payload?.code || `Notion API returned ${response.status}`); return payload; }
async function isAdmin(request, db) { return Boolean(await authenticateArticleAdmin(request, db)); }

export async function onRequest({ request, env }) {
  const url = new URL(request.url); const action = url.searchParams.get('action') || 'me';
  if (!env.DB) return json({ success: false, error: "Database binding 'DB' is not configured." }, 500);
  const db = env.DB;
  try { await ensureTables(db); } catch (error) { console.error('content center table init', error); return json({ success: false, error: 'تعذر تهيئة قاعدة مركز المحتوى.' }, 500); }

  if (action === 'login' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})); const identifier = String(body.identifier || body.username || '').trim().toLowerCase(); const password = String(body.password || '');
    if (!identifier || !password) return json({ success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور.' }, 400);
    const account = await db.prepare(`SELECT id,cell_name,username,password_hash,active FROM content_center_accounts WHERE lower(username)=?1 LIMIT 1`).bind(identifier).first();
    if (!account || !account.active || !(await verifyPassword(password, account.password_hash))) return json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, 401);
    const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32))); await db.prepare(`DELETE FROM content_center_sessions WHERE account_id=?1 AND datetime(expires_at)<=datetime('now')`).bind(account.id).run(); await db.prepare(`INSERT INTO content_center_sessions(account_id,token_hash,expires_at,created_at,last_seen_at) VALUES(?1,?2,datetime('now','+7 days'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(account.id, await sha256(token)).run();
    return json({ success: true, identity: { type: 'cell', cell: account.cell_name, username: account.username } }, 200, { 'Set-Cookie': setCookie(CELL_COOKIE, token, SESSION_DAYS * 86400) });
  }

  if (action === 'logout' && request.method === 'POST') {
    const token = getCookie(request, CELL_COOKIE); if (token) await db.prepare('DELETE FROM content_center_sessions WHERE token_hash=?1').bind(await sha256(token)).run(); return json({ success: true }, 200, { 'Set-Cookie': setCookie(CELL_COOKIE, '', 0) });
  }

  if (action === 'me' && request.method === 'GET') {
    const admin = await authenticateArticleAdmin(request, db); if (admin) return json({ success: true, authenticated: true, identity: { type: 'admin', label: admin.display_name || admin.username || 'الإدارة' } });
    const cell = await currentCell(request, db); if (cell) return json({ success: true, authenticated: true, identity: { type: 'cell', cell: cell.cell_name, username: cell.username } });
    return json({ success: true, authenticated: false }, 401);
  }

  if (action === 'accounts' && request.method === 'GET') {
    if (!(await isAdmin(request, db))) return json({ success: false, error: 'Unauthorized' }, 401); const rows = await db.prepare(`SELECT id,cell_name,username,active,created_at,updated_at FROM content_center_accounts ORDER BY cell_name`).all(); return json({ success: true, accounts: rows.results ?? [] });
  }

  if (action === 'account-create' && request.method === 'POST') {
    if (!(await isAdmin(request, db))) return json({ success: false, error: 'Unauthorized' }, 401); const body = await request.json().catch(() => ({})); const cellName = String(body.cell_name || '').trim(); const username = String(body.username || '').trim().toLowerCase(); const password = String(body.password || '');
    if (!cellName || !username || password.length < 8) return json({ success: false, error: 'أدخل اسم الخلية واسم المستخدم وكلمة مرور من 8 محارف على الأقل.' }, 400);
    const passwordHash = await hashPassword(password);
    try { await db.prepare(`INSERT INTO content_center_accounts(cell_name,username,password_hash,active,created_at,updated_at) VALUES(?1,?2,?3,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(cell_name) DO UPDATE SET username=excluded.username,password_hash=excluded.password_hash,active=1,updated_at=CURRENT_TIMESTAMP`).bind(cellName, username, passwordHash).run(); } catch (error) { return json({ success: false, error: 'اسم المستخدم مستخدم مسبقًا لخلية أخرى.' }, 409); }
    return json({ success: true, cell_name: cellName, username });
  }

  if (action === 'account-toggle' && request.method === 'POST') {
    if (!(await isAdmin(request, db))) return json({ success: false, error: 'Unauthorized' }, 401); const body = await request.json().catch(() => ({})); const id = Number(body.id); const active = body.active === true ? 1 : 0; if (!Number.isInteger(id)) return json({ success: false, error: 'Invalid account.' }, 400); await db.prepare('UPDATE content_center_accounts SET active=?1,updated_at=CURRENT_TIMESTAMP WHERE id=?2').bind(active, id).run(); return json({ success: true });
  }

  if (action !== 'list' || request.method !== 'GET') return json({ success: false, error: 'Unsupported action or method.' }, 405);

  const admin = await authenticateArticleAdmin(request, db); let cellScope = '';
  if (!admin) { const cell = await currentCell(request, db); if (!cell) return json({ success: false, authenticated: false, error: 'يجب تسجيل الدخول إلى مركز المحتوى.' }, 401); cellScope = cell.cell_name; }

  const requestedCell = url.searchParams.get('cell')?.trim() || ''; const status = url.searchParams.get('status')?.trim() || ''; const body = {}; const filters = [];
  if (cellScope) filters.push({ property: 'الخلية', select: { equals: cellScope } }); else if (requestedCell) filters.push({ property: 'الخلية', select: { equals: requestedCell } });
  if (status) filters.push({ property: 'الحالة', select: { equals: status } });
  if (filters.length === 1) body.filter = filters[0]; if (filters.length > 1) body.filter = { and: filters }; body.sorts = [{ timestamp: 'last_edited_time', direction: 'descending' }];
  try { const payload = await notionQuery(env, body); return json({ success: true, identity: admin ? { type: 'admin', label: admin.display_name || admin.username || 'الإدارة' } : { type: 'cell', cell: cellScope, username: null }, items: (payload.results ?? []).map(mapPage), hasMore: Boolean(payload.has_more), nextCursor: payload.next_cursor ?? null }); }
  catch (error) { console.error('content-center notion error', error); return json({ success: false, error: error instanceof Error ? error.message : 'تعذر تحميل بيانات Notion.' }, 502); }
}
