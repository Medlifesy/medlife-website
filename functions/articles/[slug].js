const READER_ASSET = "/article-reader-v5.html";
const ARTICLES_GATEWAY = "https://medlife-ai-gateway.broad-frog-3978.workers.dev";

export async function onRequestGet(context) {
  const slug = String(context.params.slug || "").trim();
  if (!slug || slug.includes("/") || slug === "." || slug === "..") return new Response("Not found", { status: 404 });

  const assetResponse = await context.env.ASSETS.fetch(new URL(READER_ASSET, context.request.url));
  if (!assetResponse.ok) return assetResponse;

  const html = await assetResponse.text();
  const safeSlug = JSON.stringify(slug);
  const safeGateway = JSON.stringify(ARTICLES_GATEWAY);
  const bootstrap = `<script>(function(){const s=${safeSlug},gateway=${safeGateway};const Native=window.URLSearchParams;window.URLSearchParams=function(init){const p=new Native(init);if(init===location.search&&!p.get('slug'))p.set('slug',s);return p;};window.URLSearchParams.prototype=Native.prototype;const nativeFetch=window.fetch.bind(window);window.fetch=function(input,init){try{const raw=typeof input==='string'?input:(input&&input.url)||'';const u=new URL(raw,location.href);if(u.origin===location.origin&&(u.pathname==='/api/articles'||u.pathname.startsWith('/api/articles/')||u.pathname==='/api/article-public')){const target=new URL(gateway+u.pathname+u.search);return nativeFetch(target.toString(),init);}}catch(e){}return nativeFetch(input,init);};const nativeReplace=history.replaceState.bind(history);history.replaceState=function(state,title,url){try{if(url){const u=new URL(url,location.href);if(u.pathname.startsWith('/articles/'))return nativeReplace(state,title,'/articles/'+encodeURIComponent(s));}}catch(e){}return nativeReplace(state,title,url);};window.__MEDLIFE_ARTICLE_ROUTE__=s;})();</script>`;
  const patched = html.replace(/<head>/i, `<head>${bootstrap}`);
  const canonical = new URL(`/articles/${encodeURIComponent(slug)}`, context.request.url).href;

  return new Response(patched, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "public, max-age=60, s-maxage=300",
      "link": `<${canonical}>; rel="canonical"`,
      "x-medlife-article-renderer": "article-reader-v5",
      "x-medlife-article-route": slug,
    },
  });
}
