/* =========================================================
   MEDLIFE ARTICLES — Public Articles Page
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const articlesContainer = document.getElementById("articlesContainer");
    const articlesLoading = document.getElementById("articlesLoading");
    const articlesEmpty = document.getElementById("articlesEmpty");
    const articlesError = document.getElementById("articlesError");
    const searchInput = document.getElementById("articleSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const ARTICLES_API = "https://medlife-ai-gateway.broad-frog-3978.workers.dev/api/articles";

    addSubmissionCTA();

    // Legacy static entries are retained only as a temporary fallback.
    // Public URLs are canonical /articles/<slug> paths, never renderer URLs.
    const staticArticles = [
        {id:"tension-headache",title_ar:"صداع التوتر: رحلتك نحو الراحة",title_en:"Tension-Type Headache: Your Journey to Relief",excerpt_ar:"تعرف على صداع التوتر، أسبابه وأعراضه وعلامات الخطر والعلاج المتكامل وطرق الوقاية.",author_name:"الصيدلانية دلع باسل العباس",category:"توعية صحية",image_url:"",status:"published",created_at:"2026-08-14T00:00:00",url:"/articles/tension-headache",icon:"fa-head-side-virus",source:"static"},
        {id:"endometriosis-endotest-endosure",title_ar:"الاختبارات التشخيصية الحديثة وغير الباضعة للانتباذ البطاني الرحمي",title_en:"Modern Non-Invasive Diagnostic Tests for Endometriosis",excerpt_ar:"Global Journal Club يناقش Endotest وEndoSure، مع قراءة نقدية للدليل العلمي والدقة التشخيصية والفائدة السريرية.",author_name:"د. أمين نحاس",category:"Global Journal Club",image_url:"",status:"published",created_at:"2026-08-14T00:00:00",url:"/articles/endometriosis-endotest-endosure",icon:"fa-microscope",source:"static"}
    ];

    let articles = [];
    loadArticles();

    function addSubmissionCTA(){const hero=document.querySelector(".hero-content");if(!hero||document.getElementById("submitArticleCTA"))return;const wrapper=document.createElement("div");wrapper.id="submitArticleCTA";wrapper.style.cssText="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:24px";wrapper.innerHTML=`<a href="/submit-article" style="display:inline-flex;align-items:center;gap:9px;padding:12px 20px;border-radius:13px;background:#FF2A54;color:#fff;font-weight:800;text-decoration:none"><i class="fa-solid fa-pen-to-square"></i> أرسل مقالتك للنشر</a>`;hero.appendChild(wrapper)}
    function slugify(value){return String(value||"").normalize("NFKC").toLowerCase().trim().replace(/[\u064B-\u065F\u0670]/g,"").replace(/[إأآٱ]/g,"ا").replace(/[ى]/g,"ي").replace(/[ؤ]/g,"و").replace(/[ئ]/g,"ي").replace(/[ـ]/g,"").replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"").slice(0,90)}
    async function loadArticles(){
        showLoading();
        articles=[...staticArticles];
        populateCategories();
        renderArticles();
        try{
            const response=await fetch(ARTICLES_API,{method:"GET",headers:{Accept:"application/json"},cache:"no-store"});
            if(!response.ok)throw new Error(`Articles Gateway returned ${response.status}`);
            const data=await response.json();
            if(!data.success||!Array.isArray(data.articles))throw new Error(data.error||"Unable to load articles.");
            const remoteArticles=data.articles.filter(a=>String(a.status||"").toLowerCase()==="published").map(a=>({...a,source:"gateway",slug:slugify(a.slug||a.title_ar||a.title_en||a.id)}));
            const remoteBySlug=new Map(remoteArticles.map(a=>[String(a.slug),a]));
            const fallbackOnly=staticArticles.filter(a=>!remoteBySlug.has(String(a.id))&&!remoteBySlug.has(String(a.url||"").split("/").pop()));
            articles=[...remoteArticles,...fallbackOnly];
            populateCategories();
            renderArticles();
        }catch(error){console.warn("MedLife Articles Gateway unavailable; showing fallback articles:",error)}
    }
    function renderArticles(){if(!articlesContainer)return;const search=searchInput?searchInput.value.trim().toLowerCase():"";const category=categoryFilter?categoryFilter.value:"all";const filtered=articles.filter(a=>{if(category!=="all"&&String(a.category||"")!==category)return false;if(!search)return true;const title=String(a.title_ar||a.title_en||"").toLowerCase(),excerpt=String(a.excerpt_ar||a.excerpt_en||"").toLowerCase(),author=String(a.author_name||"").toLowerCase();return title.includes(search)||excerpt.includes(search)||author.includes(search)});hideLoading();if(articlesEmpty)articlesEmpty.style.display=filtered.length===0?"block":"none";articlesContainer.innerHTML=filtered.map(createArticleCard).join("")}
    function createArticleCard(a){const title=escapeHTML(a.title_ar||a.title_en||"بدون عنوان"),excerpt=escapeHTML(a.excerpt_ar||a.excerpt_en||"اضغط لقراءة المقال كاملاً."),category=escapeHTML(a.category||"Medical Knowledge"),author=escapeHTML(a.author_name||"MedLife"),date=formatDate(a.created_at),image=a.image_url?escapeAttribute(a.image_url):"";
        const slug=String(a.slug||a.url?.split("/").filter(Boolean).pop()||slugify(a.title_ar||a.title_en||a.id));
        const url=`/articles/${encodeURIComponent(slug)}`;
        const icon=escapeAttribute(a.icon||"fa-book-medical");const imageHTML=image?`<img src="${image}" alt="${title}" loading="lazy">`:`<div class="article-placeholder"><i class="fa-solid ${icon}"></i></div>`;return `<article class="public-article-card"><a href="${url}" class="article-image" aria-label="${title}">${imageHTML}</a><div class="public-article-content"><div class="public-article-category">${category}</div><h3><a href="${url}">${title}</a></h3><p>${excerpt}</p><div class="public-article-meta"><span><i class="fa-solid fa-user"></i>${author}</span><span><i class="fa-regular fa-calendar"></i>${date}</span></div><a href="${url}" class="public-article-link">اقرأ المقال <i class="fa-solid fa-arrow-left"></i></a></div></article>`}
    function populateCategories(){if(!categoryFilter)return;const categories=[...new Set(articles.map(a=>String(a.category||"").trim()).filter(Boolean))];categoryFilter.innerHTML=`<option value="all">جميع التصنيفات</option>${categories.map(c=>`<option value="${escapeAttribute(c)}">${escapeHTML(c)}</option>`).join("")}`}
    if(searchInput)searchInput.addEventListener("input",renderArticles);if(categoryFilter)categoryFilter.addEventListener("change",renderArticles);
    function showLoading(){if(articlesLoading)articlesLoading.style.display="flex";if(articlesEmpty)articlesEmpty.style.display="none";if(articlesError)articlesError.style.display="none"}function hideLoading(){if(articlesLoading)articlesLoading.style.display="none"}function formatDate(v){if(!v)return"";const d=new Date(v);if(Number.isNaN(d.getTime()))return"";return d.toLocaleDateString("ar-SY",{year:"numeric",month:"long",day:"numeric"})}function escapeHTML(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}function escapeAttribute(v){return String(v??"").replace(/&/g,"&amp;").replace(/\"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
});
