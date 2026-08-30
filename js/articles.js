/* =========================================================
   MEDLIFE ARTICLES — Public Articles Page
   Single source: dedicated Articles Worker / D1
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const articlesContainer = document.getElementById("articlesContainer");
    const articlesLoading = document.getElementById("articlesLoading");
    const articlesEmpty = document.getElementById("articlesEmpty");
    const articlesError = document.getElementById("articlesError");
    const searchInput = document.getElementById("articleSearch");
    const ARTICLES_API = "https://medlife-articles-api.broad-frog-3978.workers.dev/public/articles";

    // Legacy static entries remain available only until their D1 equivalents exist.
    const staticArticles = [
        {id:"tension-headache",title_ar:"صداع التوتر: رحلتك نحو الراحة",title_en:"Tension-Type Headache: Your Journey to Relief",excerpt_ar:"تعرف على صداع التوتر، أسبابه وأعراضه وعلامات الخطر والعلاج المتكامل وطرق الوقاية.",author_name:"الصيدلانية دلع باسل العباس",category:"توعية صحية",image_url:"",status:"published",created_at:"2026-08-14T00:00:00",legacy_url:"/articles/tension-headache.html",icon:"fa-head-side-virus",source:"static"},
        {id:"endometriosis-endotest-endosure",title_ar:"الاختبارات التشخيصية الحديثة وغير الباضعة للانتباذ البطاني الرحمي",title_en:"Modern Non-Invasive Diagnostic Tests for Endometriosis",excerpt_ar:"Global Journal Club يناقش Endotest وEndoSure، مع قراءة نقدية للدليل العلمي والدقة التشخيصية والفائدة السريرية.",author_name:"د. أمين نحاس",category:"Global Journal Club",image_url:"",status:"published",created_at:"2026-08-14T00:00:00",legacy_url:"/articles/endometriosis-endotest-endosure.html",icon:"fa-microscope",source:"static"},
        {id:"family-planning-conscious-choice",title_ar:"وسائل تنظيم الأسرة: التخطيط الواعي لحياة أسرية متوازنة",title_en:"Family Planning Methods: Informed Planning for a Balanced Family Life",excerpt_ar:"دليل حول وسائل تنظيم الأسرة الهرمونية وغير الهرمونية ومزايا وعيوب كل وسيلة.",author_name:"الممرضة صفا علاء الدين الحكيم",category:"توعية صحية",image_url:"/images/family-planning-cover.jpg",status:"published",created_at:"2026-08-26T00:00:00",legacy_url:"/family-planning.html",icon:"fa-people-roof",source:"static"}
    ];

    let articles = [];
    loadArticles();

    function slugify(value){
        return String(value||"").normalize("NFKC").toLowerCase().trim()
            .replace(/[\u064B-\u065F\u0670]/g,"")
            .replace(/[إأآٱ]/g,"ا").replace(/[ى]/g,"ي").replace(/[ؤ]/g,"و").replace(/[ئ]/g,"ي")
            .replace(/[ـ]/g,"").replace(/[^\p{L}\p{N}]+/gu,"-")
            .replace(/^-+|-+$/g,"").slice(0,90);
    }

    async function loadArticles(){
        showLoading();
        articles=[...staticArticles];
        renderArticles();
        try{
            const response=await fetch(ARTICLES_API,{method:"GET",headers:{Accept:"application/json"},cache:"no-store"});
            if(!response.ok)throw new Error(`Articles API returned ${response.status}`);
            const data=await response.json();
            const remoteList=Array.isArray(data)?data:data?.articles;
            if(!Array.isArray(remoteList))throw new Error(data?.error||"Unable to load articles.");
            const remoteArticles=remoteList
                .filter(a=>String(a?.status||"").toLowerCase()==="published")
                .map(a=>({...a,source:"d1",slug:slugify(a.slug||a.title_ar||a.title_en||a.id)}));
            const remoteKeys=new Set();
            remoteArticles.forEach(a=>{
                remoteKeys.add(String(a.id));
                remoteKeys.add(String(a.slug||""));
                remoteKeys.add(String(a.canonical_path||"").split("/").filter(Boolean).pop());
            });
            const fallbackOnly=staticArticles.filter(a=>
                !remoteKeys.has(String(a.id)) &&
                !remoteKeys.has(String(a.legacy_url||"").split("/").pop().replace(/\.html$/,""))
            );
            articles=[...remoteArticles,...fallbackOnly];
            renderArticles();
        }catch(error){
            console.warn("MedLife Articles API unavailable; showing fallback articles:",error);
        }
    }

    function renderArticles(){
        if(!articlesContainer)return;
        const search=searchInput?searchInput.value.trim().toLowerCase():"";
        const filtered=articles.filter(a=>{
            if(!search)return true;
            const title=String(a.title_ar||a.title_en||"").toLowerCase();
            const excerpt=String(a.excerpt_ar||a.excerpt_en||"").toLowerCase();
            const author=String(a.author_name||"").toLowerCase();
            return title.includes(search)||excerpt.includes(search)||author.includes(search);
        });
        hideLoading();
        if(articlesEmpty)articlesEmpty.style.display=filtered.length===0?"block":"none";
        if(articlesError)articlesError.style.display="none";
        articlesContainer.innerHTML=filtered.map(createArticleCard).join("");
    }

    function createArticleCard(a){
        const title=escapeHTML(a.title_ar||a.title_en||"بدون عنوان");
        const excerpt=escapeHTML(a.excerpt_ar||a.excerpt_en||"اضغط لقراءة المقال كاملاً.");
        const category=escapeHTML(a.category||"Medical Knowledge");
        const author=escapeHTML(a.author_name||"MedLife");
        const date=formatDate(a.created_at);
        const image=a.image_url?escapeAttribute(a.image_url):"";
        const slug=String(a.slug||a.url?.split("/").filter(Boolean).pop()||slugify(a.title_ar||a.title_en||a.id));
        const url=a.source==="d1"?`/articles/${encodeURIComponent(slug)}`:(a.legacy_url||`/articles/${encodeURIComponent(slug)}`);
        const icon=escapeAttribute(a.icon||"fa-book-medical");
        const imageHTML=image?`<img src="${image}" alt="${title}" loading="lazy">`:`<div class="article-placeholder"><i class="fa-solid ${icon}"></i></div>`;
        return `<article class="public-article-card"><a href="${url}" class="article-image" aria-label="${title}">${imageHTML}</a><div class="public-article-content"><div class="public-article-category">${category}</div><h3><a href="${url}">${title}</a></h3><p>${excerpt}</p><div class="public-article-meta"><span><i class="fa-solid fa-user"></i>${author}</span><span><i class="fa-regular fa-calendar"></i>${date}</span></div><a href="${url}" class="public-article-link">اقرأ المقال <i class="fa-solid fa-arrow-left"></i></a></div></article>`;
    }

    if(searchInput)searchInput.addEventListener("input",renderArticles);

    function showLoading(){
        if(articlesLoading)articlesLoading.style.display="flex";
        if(articlesEmpty)articlesEmpty.style.display="none";
        if(articlesError)articlesError.style.display="none";
    }
    function hideLoading(){if(articlesLoading)articlesLoading.style.display="none";}
    function formatDate(v){
        if(!v)return"";
        const d=new Date(v);
        if(Number.isNaN(d.getTime()))return"";
        return d.toLocaleDateString("ar-SY",{year:"numeric",month:"long",day:"numeric"});
    }
    function escapeHTML(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");}
    function escapeAttribute(v){return String(v??"").replace(/&/g,"&amp;").replace(/\"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
});
