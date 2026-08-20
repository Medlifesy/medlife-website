export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    const path = new URL(context.request.url).pathname.toLowerCase();
    if (/\/(admin|admin-members|articles-admin|support-admin|support-applications-admin)\.html$/.test(path)) {
      if (path.endsWith('/articles-admin.html')) {
        let html = await response.text();
        const scripts = ['/article-ai-studio.js?v=20260820-3','/article-ai-admin-enhanced.js?v=20260820-3'];
        const missing = scripts.filter(src => !html.includes(src.split('?')[0]));
        const marker = missing.map(src => `<script src="${src}" defer></script>`).join('');
        html = html.includes('</body>') ? html.replace('</body>', `${marker}</body>`) : `${html}${marker}`;
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
        return new Response(html,{status:response.status,statusText:response.statusText,headers});
      }
      return response;
    }

    let html = await response.text();
    const scripts = ['/site-nav.js','/site-polish.js'];
    if (path === '/' || path === '/index.html') scripts.push('/homepage-gallery.js','/homepage-redesign.js','/homepage-story.js');
    if (path.endsWith('/contact.html')) scripts.push('/contact-map.js');
    if (path.endsWith('/support.html')) scripts.push('/support-page.js');
    if (path.endsWith('/support-request.html')) scripts.push('/support-request.js');

    const missing = scripts.filter(src => !html.includes(src));
    const marker = missing.map(src => `<script src="${src}" defer></script>`).join('');

    if (path.endsWith('/contact.html') && !html.includes('medlife-real-syria-map')) {
      const mapBlock = `
<section id="medlife-real-syria-map" style="max-width:1180px;margin:28px auto 70px;padding:0 18px;">
  <div style="background:#fff;border:1px solid #e7edf3;border-radius:28px;padding:24px;box-shadow:0 18px 55px rgba(21,36,61,.08);">
    <div style="text-align:center;margin-bottom:18px;">
      <div style="display:inline-block;padding:7px 13px;border-radius:999px;background:#fff1f4;color:#e51f45;font:800 12px Cairo,Arial,sans-serif;">ميدلايف في سوريا</div>
      <h2 style="margin:10px 0 7px;color:#12203a;font:800 28px/1.6 Cairo,Arial,sans-serif;">خريطة حضور ميدلايف في سوريا</h2>
      <p style="margin:0;color:#687587;font:500 13px/2 Cairo,Arial,sans-serif;">خريطة حقيقية تتيح لك استكشاف موقع سوريا ومناطق حضور ميدلايف.</p>
    </div>
    <div style="position:relative;overflow:hidden;border-radius:20px;border:1px solid #dfe8ef;background:#e8f3f7;">
      <iframe title="خريطة سوريا" aria-label="خريطة سوريا" src="https://www.openstreetmap.org/export/embed.html?bbox=35.55%2C32.85%2C42.55%2C37.45&layer=mapnik&marker=34.8959%2C35.8867" style="width:100%;height:560px;border:0;display:block;" loading="eager" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div style="position:absolute;right:14px;top:14px;background:rgba(255,255,255,.94);padding:9px 12px;border-radius:12px;box-shadow:0 8px 25px rgba(21,36,61,.12);font:800 11px Cairo,Arial,sans-serif;color:#12203a;">مقر ميدلايف — طرطوس</div>
    </div>
    <div style="text-align:center;margin-top:9px;color:#8a96a5;font:500 10px/1.8 Cairo,Arial,sans-serif;">الخريطة © OpenStreetMap contributors</div>
  </div>
</section>`;
      html = html.includes('</body>') ? html.replace('</body>', `${mapBlock}</body>`) : `${html}${mapBlock}`;
    }

    if (!missing.length && !path.endsWith('/contact.html')) return response;

    const updated = html.includes('</body>') ? html.replace('</body>', `${marker}</body>`) : `${html}${marker}`;
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
    return new Response(updated,{status:response.status,statusText:response.statusText,headers});
  } catch (error) {
    if (response) return response;
    return new Response('Service unavailable',{status:503});
  }
}
