/* =========================================================
   MEDLIFE HOMEPAGE ENHANCEMENTS
   Single support + feedback section only
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    ensureStyles();
    ensureSupportAndFeedback();
});

function ensureStyles() {
    if (document.getElementById("medlifeHomeEnhancementsStyles")) return;

    const style = document.createElement("style");
    style.id = "medlifeHomeEnhancementsStyles";
    style.textContent = `
        .ml-home-enhancements{padding:70px 20px;background:#F7F9FC}
        .ml-home-wrap{width:min(1180px,100%);margin:auto}
        .ml-home-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:22px}
        .ml-home-card{background:#fff;border:1px solid #E2E8F0;border-radius:24px;padding:30px;box-shadow:0 18px 45px rgba(21,29,54,.08)}
        .ml-home-badge{display:inline-flex;align-items:center;gap:8px;background:#FFF0F3;color:#FF2A54;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:900}
        .ml-home-card h2{margin:15px 0 8px;color:#151D36;font-size:25px;line-height:1.4}
        .ml-home-card > p{color:#64748B;font-size:13px;line-height:1.9;margin-bottom:20px}
        .ml-support-methods{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .ml-support-method{padding:16px;border:1px solid #E2E8F0;border-radius:16px;background:#F8FAFC}
        .ml-support-method strong{display:block;color:#151D36;margin-bottom:5px}
        .ml-support-method span{display:block;color:#334155;font-size:13px;line-height:1.8;word-break:break-word}
        .ml-support-message{margin-top:18px;padding:16px;border-radius:16px;background:linear-gradient(135deg,#151D36,#2B3659);color:#fff;text-align:center;font-weight:800}
        .ml-feedback-form{display:grid;gap:12px}
        .ml-feedback-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .ml-feedback-form input,.ml-feedback-form select,.ml-feedback-form textarea{width:100%;border:1px solid #E2E8F0;border-radius:13px;padding:13px 14px;font-family:inherit;font-size:14px;background:#FBFCFE;outline:none}
        .ml-feedback-form textarea{min-height:135px;resize:vertical}
        .ml-feedback-button{border:0;border-radius:13px;padding:13px 18px;background:#FF2A54;color:#fff;font-family:inherit;font-weight:900;cursor:pointer}
        .ml-feedback-button:disabled{opacity:.65;cursor:wait}
        .ml-feedback-status{display:none;padding:11px 13px;border-radius:12px;font-size:13px}.ml-feedback-status.show{display:block}.ml-feedback-status.success{background:#ECFDF5;color:#047857}.ml-feedback-status.error{background:#FFF1F2;color:#B42318}
        @media(max-width:850px){.ml-home-grid{grid-template-columns:1fr}}
        @media(max-width:550px){.ml-feedback-row,.ml-support-methods{grid-template-columns:1fr}.ml-home-enhancements{padding:55px 14px}.ml-home-card{padding:22px}}
    `;

    document.head.appendChild(style);
}

function ensureSupportAndFeedback() {
    if (document.getElementById("medlifeHomeSupportFeedback")) return;

    const footer = document.querySelector("footer");
    if (!footer) return;

    const section = document.createElement("section");
    section.id = "medlifeHomeSupportFeedback";
    section.className = "ml-home-enhancements";

    section.innerHTML = `
        <div class="ml-home-wrap">
            <div class="ml-home-grid">
                <div class="ml-home-card">
                    <span class="ml-home-badge"><i class="fa-solid fa-heart"></i> ادعمونا</span>
                    <h2>ساهموا معنا في صنع الأثر</h2>
                    <p>مساهمتكم معنا ستحدث فرقًا كبيرًا وتترك أثرًا لا يُنسى.</p>
                    <div class="ml-support-methods">
                        <div class="ml-support-method">
                            <strong>شركة الهرم</strong>
                            <span>مؤسسة ميدلايف الطبية الخيرية التطوعية<br>0998942124</span>
                        </div>
                        <div class="ml-support-method">
                            <strong>سيرياتيل كاش</strong>
                            <span>رمز 00497549</span>
                        </div>
                        <div class="ml-support-method">
                            <strong>MTN كاش</strong>
                            <span>رمز 4524-0602-1501-8298</span>
                        </div>
                        <div class="ml-support-method">
                            <strong>بنك الشرق</strong>
                            <span>رقم الحساب 5557977</span>
                        </div>
                    </div>
                    <div class="ml-support-message">مساهمتكم معنا ستحدث فرقًا كبيرًا وتترك أثرًا لا يُنسى ❤️</div>
                </div>

                <div class="ml-home-card">
                    <span class="ml-home-badge"><i class="fa-regular fa-message"></i> صوتكم يهمنا</span>
                    <h2>شكوى أو ملاحظة</h2>
                    <p>شاركنا رأيك أو ملاحظتك أو شكواك، وسنعمل على متابعتها.</p>
                    <form class="ml-feedback-form" id="medlifeHomepageFeedbackForm">
                        <div class="ml-feedback-row">
                            <input id="mlHomeFeedbackName" type="text" placeholder="الاسم">
                            <input id="mlHomeFeedbackPhone" type="tel" placeholder="رقم الهاتف">
                        </div>
                        <input id="mlHomeFeedbackEmail" type="email" placeholder="البريد الإلكتروني (اختياري)">
                        <select id="mlHomeFeedbackType">
                            <option value="complaint">شكوى</option>
                            <option value="feedback" selected>ملاحظة / اقتراح</option>
                            <option value="thanks">رسالة شكر</option>
                        </select>
                        <textarea id="mlHomeFeedbackMessage" required placeholder="اكتب رسالتك هنا..."></textarea>
                        <button class="ml-feedback-button" id="mlHomeFeedbackSubmit" type="submit">إرسال الرسالة</button>
                        <div class="ml-feedback-status" id="mlHomeFeedbackStatus"></div>
                    </form>
                </div>
            </div>
        </div>
    `;

    footer.parentNode.insertBefore(section, footer);

    const form = document.getElementById("medlifeHomepageFeedbackForm");
    form.addEventListener("submit", submitHomepageFeedback);
}

async function submitHomepageFeedback(event) {
    event.preventDefault();

    const submit = document.getElementById("mlHomeFeedbackSubmit");
    const status = document.getElementById("mlHomeFeedbackStatus");

    submit.disabled = true;
    submit.textContent = "جاري الإرسال...";
    status.className = "ml-feedback-status";

    try {
        const response = await fetch("/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                type: document.getElementById("mlHomeFeedbackType").value,
                name: document.getElementById("mlHomeFeedbackName").value.trim(),
                phone: document.getElementById("mlHomeFeedbackPhone").value.trim(),
                email: document.getElementById("mlHomeFeedbackEmail").value.trim(),
                message: document.getElementById("mlHomeFeedbackMessage").value.trim()
            })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || "تعذر إرسال الرسالة.");
        }

        status.className = "ml-feedback-status show success";
        status.textContent = "تم استلام رسالتكم بنجاح، شكراً لتواصلكم معنا.";
        document.getElementById("medlifeHomepageFeedbackForm").reset();
    } catch (error) {
        status.className = "ml-feedback-status show error";
        status.textContent = error.message || "تعذر إرسال الرسالة حالياً.";
    } finally {
        submit.disabled = false;
        submit.textContent = "إرسال الرسالة";
    }
}
