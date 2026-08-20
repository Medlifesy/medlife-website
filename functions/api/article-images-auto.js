import { authenticateArticleAdmin, json } from './article-admin-session.js';

const MAX_IMAGES = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const REPO = 'Medlifesy/medlife-website';
const BRANCH = 'main';
const FOLDER = 'uploads/articles';

function extFromUrl(url='') {
  const m = String(url).match(/\.([a-z0-9]{2,5})(?:\?|$)/i);
  const ext = (m?.[1] || 'jpg').toLowerCase();
  return ['jpg','jpeg','png','webp','gif'].includes(ext) ? ext : 'jpg';
}
function bytesToBase64(bytes) {
  let binary = '';
  for (let i=0; i<bytes.length; i+=0x8000) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i+0x8000, bytes.length)));
  return btoa(binary);
}
function id() { return crypto.randomUUID().replaceAll('-','').slice(0,20); }

async function searchCommons(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action','query');
  url.searchParams.set('generator','search');
  url.searchParams.set('gsrsearch',`${query} filetype:bitmap`);
  url.searchParams.set('gsrnamespace','6');
  url.searchParams.set('gsrlimit','5');
  url.searchParams.set('prop','imageinfo');
  url.searchParams.set('iiprop','url|extmetadata');
  url.searchParams.set('iiurlwidth','1400');
  url.searchParams.set('format','json');
  const r = await fetch(url, { headers:{'User-Agent':'MedLife/1.0 (medlifesy.org article editor)'} });
  if (!r.ok) throw new Error('Wikimedia search failed');
  const d = await r.json();
  return Object.values(d.query?.pages || {}).map(p => {
    const info = p.imageinfo?.[0] || {};
    const meta = info.extmetadata || {};
    const license = String(meta.LicenseShortName?.value || meta.License?.value || '').trim();
    const title = String(meta.ObjectName?.value || p.title || '').replace(/<[^>]*>/g,'').trim();
    const artist = String(meta.Artist?.value || '').replace(/<[^>]*>/g,'').trim();
    return {title, url:info.thumburl || info.url, source_url:`https://commons.wikimedia.org/wiki/${encodeURIComponent(String(p.title||'').replaceAll(' ','_'))}`, license, artist};
  }).filter(x => x.url && /^(CC|Public domain|PD|CC0|GFDL)/i.test(x.license));
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({success:false,error:"Database binding 'DB' is not configured."},500);
    const admin = await authenticateArticleAdmin(request, env.DB);
    if (!admin || !['admin','editor'].includes(String(admin.role).toLowerCase())) return json({success:false,error:'لا تملك صلاحية استخدام البحث التلقائي للصور.'},403);
    const token = env.GITHUB_CONTENTS_TOKEN;
    if (!token) return json({success:false,error:'تخزين الصور على GitHub غير مهيأ. أضف Secret باسم GITHUB_CONTENTS_TOKEN إلى Cloudflare.'},500);
    const body = await request.json().catch(()=>({}));
    const queries = Array.isArray(body.queries) ? body.queries.slice(0,MAX_IMAGES) : [];
    if (!queries.length) return json({success:false,error:'لم تصل كلمات بحث للصور.'},400);

    const results=[];
    for (const item of queries) {
      const q = typeof item === 'string' ? item : String(item.query || item.prompt || item.description || '').trim();
      if (!q) continue;
      let candidates=[];
      try { candidates = await searchCommons(q); } catch { continue; }
      const pick = candidates[0];
      if (!pick) continue;
      const img = await fetch(pick.url, {headers:{'User-Agent':'MedLife/1.0 (medlifesy.org article editor)'}});
      if (!img.ok) continue;
      const bytes = new Uint8Array(await img.arrayBuffer());
      if (!bytes.length || bytes.length > MAX_BYTES) continue;
      const type = img.headers.get('content-type') || 'image/jpeg';
      const ext = extFromUrl(pick.url);
      const path = `${FOLDER}/${new Date().toISOString().slice(0,10)}/ai-${id()}.${ext}`;
      const gh = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`,{
        method:'PUT',headers:{'Authorization':`Bearer ${token}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
        body:JSON.stringify({message:`content: add AI-selected article image ${path.split('/').pop()}`,content:bytesToBase64(bytes),branch:BRANCH})
      });
      if (!gh.ok) continue;
      results.push({url:`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`,name:pick.title||'MedLife article image',source_url:pick.source_url,license:pick.license,artist:pick.artist,query:q,alt:pick.title||q,placement:item.placement||'داخل المقال'});
    }
    return json({success:true,images:results,storage:'github',count:results.length});
  } catch (e) {
    console.error('article-images-auto',e);
    return json({success:false,error:'تعذر البحث عن الصور ورفعها حالياً.'},500);
  }
}
