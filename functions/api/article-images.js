import { authenticateArticleAdmin, json } from './article-admin-session.js';

const MAX_IMAGES = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const REPO = 'Medlifesy/medlife-website';
const BRANCH = 'main';
const FOLDER = 'uploads/articles';

function safeName(name='image') {
  const ext = (name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const allowed = ['jpg','jpeg','png','webp','gif','avif'];
  return allowed.includes(ext) ? ext : 'jpg';
}
function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i=0; i<bytes.length; i+=chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i+chunk, bytes.length)));
  return btoa(binary);
}
function randomId() { return crypto.randomUUID().replace(/-/g, '').slice(0, 20); }
function clean(value,max){return String(value??'').trim().slice(0,max)}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({ success:false, error:"Database binding 'DB' is not configured." }, 500);
    const token = env.GITHUB_CONTENTS_TOKEN;
    if (!token) return json({ success:false, error:'تخزين الصور غير مهيأ. أضف GITHUB_CONTENTS_TOKEN كـ Secret/Variable متاح للـPages Functions.' }, 500);

    // Admins/editors may upload normally. Public article writers may also upload,
    // but the upload is deliberately constrained and is never published by itself.
    const admin = await authenticateArticleAdmin(request, env.DB);
    const form = await request.formData();
    const title = clean(form.get('title_ar'), 180);
    const author = clean(form.get('author_name'), 120);
    if (!admin && (!title || !author)) return json({success:false,error:'يرجى إدخال عنوان المقال واسم الكاتب قبل رفع الصور.'},400);

    const files = form.getAll('images').filter(x => x && typeof x.arrayBuffer === 'function');
    if (!files.length) return json({ success:false, error:'لم يتم اختيار أي صورة.' }, 400);
    if (files.length > MAX_IMAGES) return json({ success:false, error:'يمكن رفع 5 صور كحد أقصى للمقالة.' }, 400);

    const results = [];
    for (const file of files) {
      if (!String(file.type || '').startsWith('image/')) return json({ success:false, error:`الملف ${file.name || ''} ليس صورة.` }, 400);
      if (file.size > MAX_BYTES) return json({ success:false, error:`الصورة ${file.name || ''} أكبر من 8MB.` }, 400);
      const ext = safeName(file.name);
      const path = `${FOLDER}/${new Date().toISOString().slice(0,10)}/${randomId()}.${ext}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
      const r = await fetch(url, {
        method:'PUT',
        headers:{
          'Authorization':`Bearer ${token}`,
          'Accept':'application/vnd.github+json',
          'X-GitHub-Api-Version':'2022-11-28',
          'Content-Type':'application/json',
          'User-Agent':'MedLife-Article-Submission'
        },
        body:JSON.stringify({message:`content: upload article image ${path.split('/').pop()}`,content:bytesToBase64(bytes),branch:BRANCH})
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok) {
        console.error('GitHub image upload failed:', r.status, data);
        return json({success:false,error:'تعذر رفع الصور إلى GitHub. تحقق من صلاحيات GITHUB_CONTENTS_TOKEN.'},502);
      }
      results.push({name:file.name || path.split('/').pop(),path,url:`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`,size:file.size,type:file.type});
    }
    return json({success:true,storage:'github',images:results,uploaded_by:admin?.username||author});
  } catch (error) {
    console.error('article-images error:', error);
    return json({success:false,error:'تعذر رفع الصور إلى GitHub حالياً.'},500);
  }
}
