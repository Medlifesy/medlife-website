document.addEventListener("DOMContentLoaded", () => {
    addMembershipSection();
});

function addMembershipSection() {
    if (document.getElementById("medlifeJoinSection")) return;

    const footer = document.querySelector("footer");
    if (!footer) return;

    const section = document.createElement("section");
    section.id = "medlifeJoinSection";
    section.innerHTML = `
        <style>
            #medlifeJoinSection{padding:80px 20px;background:linear-gradient(135deg,#151D36,#202944);color:#fff}
            #medlifeJoinSection .ml-join-wrap{width:min(1180px,100%);margin:auto;display:grid;grid-template-columns:1.05fr .95fr;gap:28px;align-items:center}
            #medlifeJoinSection .ml-join-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 13px;border-radius:999px;background:rgba(255,42,84,.14);color:#ff8ca4;font-size:12px;font-weight:900}
            #medlifeJoinSection h2{margin:14px 0 10px;font-size:clamp(30px,4vw,44px);line-height:1.3}
            #medlifeJoinSection p{margin:0 0 22px;color:#CBD5E1;line-height:1.95;font-size:15px}
            #medlifeJoinSection .ml-join-pills{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 25px}
            #medlifeJoinSection .ml-join-pill{padding:8px 11px;border-radius:10px;background:rgba(255,255,255,.07);color:#E2E8F0;font-size:11px;font-weight:800}
            #medlifeJoinSection .ml-join-card{background:#fff;color:#1E293B;border-radius:24px;padding:28px;box-shadow:0 25px 60px rgba(0,0,0,.22)}
            #medlifeJoinSection .ml-join-card h3{margin:0 0 8px;color:#151D36;font-size:22px}
            #medlifeJoinSection .ml-join-card p{color:#64748B;font-size:13px;margin-bottom:18px}
            #medlifeJoinSection .ml-join-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px 18px;border-radius:13px;background:#FF2A54;color:#fff;font-weight:900;text-decoration:none}
            #medlifeJoinSection .ml-join-btn:hover{background:#E51E46}
            #medlifeJoinSection .ml-join-note{margin-top:12px;font-size:11px;color:#94A3B8!important;margin-bottom:0!important}
            @media(max-width:850px){#medlifeJoinSection .ml-join-wrap{grid-template-columns:1fr}}
        </style>
        <div class="ml-join-wrap">
            <div>
                <span class="ml-join-badge"><i class="fa-solid fa-people-group"></i> انضم إلى فريق MedLife</span>
                <h2>مهارتك يمكن أن تصنع أثراً حقيقياً</h2>
                <p>نرحب بالأشخاص الذين يريدون المساهمة في العمل الطبي والإنساني والتوعوي. اختر المجال الذي يناسبك، وأرسل طلب الانضمام، وسيراجعه فريقنا قبل التواصل معك.</p>
                <div class="ml-join-pills">
                    <span class="ml-join-pill">كتابة محتوى طبي</span>
                    <span class="ml-join-pill">تصميم</span>
                    <span class="ml-join-pill">مونتاج</span>
                    <span class="ml-join-pill">إعلام مرئي</span>
                    <span class="ml-join-pill">ميداني</span>
                    <span class="ml-join-pill">سوشيل ميديا</span>
                    <span class="ml-join-pill">إعلامي جامعات</span>
                </div>
            </div>
            <div class="ml-join-card">
                <h3>جاهز تنضم إلنا؟ ❤️</h3>
                <p>عبّي معلوماتك من خلال نموذج الانضمام، وسنراجع طلبك ونضيفه إلى قاعدة بيانات المتطوعين.</p>
                <a class="ml-join-btn" href="join-us.html"><i class="fa-solid fa-arrow-left"></i> تقديم طلب الانضمام</a>
                <p class="ml-join-note">المشاركة التطوعية تخضع للمراجعة والتنسيق حسب حاجة الفريق.</p>
            </div>
        </div>
    `;

    footer.parentNode.insertBefore(section, footer);
}
