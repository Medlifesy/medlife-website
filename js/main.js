/* =========================================================
   MEDLIFE SYRIA
   Main JavaScript
   Version 1.0
========================================================= */

"use strict";

/* =========================================================
   1. DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ====================================================== */

    const body = document.body;

    const languageBtn = document.getElementById("languageBtn");

    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    const loginBtn = document.getElementById("loginBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");

    const loginModal = document.getElementById("loginModal");
    const closeLogin = document.getElementById("closeLogin");
    const closeLogin2 = document.getElementById("closeLogin2");

    const volunteerModal = document.getElementById("volunteerModal");
    const closeVolunteer = document.getElementById("closeVolunteer");

    const volunteerBtn = document.getElementById("volunteerBtn");

    const aiOpenBtn = document.getElementById("aiOpenBtn");
    const aiCloseBtn = document.getElementById("aiCloseBtn");
    const aiOverlay = document.getElementById("aiOverlay");

    const aiForm = document.getElementById("aiForm");
    const aiInput = document.getElementById("aiInput");
    const aiMessages = document.getElementById("aiMessages");

    const aiSuggestions =
        document.querySelectorAll(".ai-suggestions button");

    const mobileLinks =
        document.querySelectorAll("[data-mobile-link]");

    const volunteerTriggers =
        document.querySelectorAll("[data-volunteer-trigger]");

    const revealElements =
        document.querySelectorAll(".reveal");


    /* =====================================================
       2. LANGUAGE SYSTEM
    ====================================================== */

    let currentLanguage =
        localStorage.getItem("medlife-language") || "ar";


    function updateLanguage() {

        const isArabic = currentLanguage === "ar";

        /* HTML direction */

        document.documentElement.lang =
            isArabic ? "ar" : "en";

        document.documentElement.dir =
            isArabic ? "rtl" : "ltr";


        /* Body language class */

        body.classList.toggle(
            "language-ar",
            isArabic
        );

        body.classList.toggle(
            "language-en",
            !isArabic
        );


        /* Change all translated elements */

        const translatedElements =
            document.querySelectorAll("[data-ar][data-en]");


        translatedElements.forEach(element => {

            const translation =
                isArabic
                    ? element.dataset.ar
                    : element.dataset.en;

            if (translation !== undefined) {

                element.textContent = translation;

            }

        });


        /* Update placeholders */

        const placeholderElements =
            document.querySelectorAll(
                "[data-placeholder-ar][data-placeholder-en]"
            );


        placeholderElements.forEach(element => {

            element.placeholder =
                isArabic
                    ? element.dataset.placeholderAr
                    : element.dataset.placeholderEn;

        });


        /* Language button */

        if (languageBtn) {

            languageBtn.textContent =
                isArabic ? "EN" : "ع";

            languageBtn.setAttribute(
                "aria-label",
                isArabic
                    ? "Switch to English"
                    : "التبديل إلى العربية"
            );

        }


        /* Document title */

        document.title = isArabic
            ? "MedLife Syria | مؤسسة ميدلايف الطبية الخيرية التطوعية"
            : "MedLife Syria | Voluntary Medical Charity Organization";

    }


    function toggleLanguage() {

        currentLanguage =
            currentLanguage === "ar"
                ? "en"
                : "ar";

        localStorage.setItem(
            "medlife-language",
            currentLanguage
        );

        updateLanguage();

    }


    if (languageBtn) {

        languageBtn.addEventListener(
            "click",
            toggleLanguage
        );

    }


    /* =====================================================
       3. MOBILE MENU
    ====================================================== */

    function openMobileMenu() {

        if (!mobileMenu || !menuToggle) return;

        mobileMenu.classList.add("active");

        menuToggle.classList.add("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            currentLanguage === "ar"
                ? "إغلاق القائمة"
                : "Close menu"
        );

        body.classList.add("menu-open");

    }


    function closeMobileMenu() {

        if (!mobileMenu || !menuToggle) return;

        mobileMenu.classList.remove("active");

        menuToggle.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            currentLanguage === "ar"
                ? "فتح القائمة"
                : "Open menu"
        );

        body.classList.remove("menu-open");

    }


    function toggleMobileMenu() {

        if (!mobileMenu) return;

        if (mobileMenu.classList.contains("active")) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }

    }


    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            toggleMobileMenu
        );

    }


    /* Close menu after clicking link */

    mobileLinks.forEach(link => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );

    });


    /* =====================================================
       4. MODAL SYSTEM
    ====================================================== */

    function openModal(modal) {

        if (!modal) return;

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        body.classList.add("modal-open");

    }


    function closeModal(modal) {

        if (!modal) return;

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        body.classList.remove("modal-open");

    }


    /* =====================================================
       5. LOGIN MODAL
    ====================================================== */

    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            () => openModal(loginModal)
        );

    }


    if (mobileLoginBtn) {

        mobileLoginBtn.addEventListener(
            "click",
            () => {

                closeMobileMenu();

                openModal(loginModal);

            }
        );

    }


    if (closeLogin) {

        closeLogin.addEventListener(
            "click",
            () => closeModal(loginModal)
        );

    }


    if (closeLogin2) {

        closeLogin2.addEventListener(
            "click",
            () => closeModal(loginModal)
        );

    }


    /* =====================================================
       6. VOLUNTEER MODAL
    ====================================================== */

    volunteerTriggers.forEach(trigger => {

        trigger.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeMobileMenu();

                openModal(volunteerModal);

            }
        );

    });


    if (volunteerBtn) {

        volunteerBtn.addEventListener(
            "click",
            () => closeModal(volunteerModal)
        );

    }


    if (closeVolunteer) {

        closeVolunteer.addEventListener(
            "click",
            () => closeModal(volunteerModal)
        );

    }


    /* =====================================================
       7. CLOSE MODAL BY BACKDROP
    ====================================================== */

    [loginModal, volunteerModal].forEach(modal => {

        if (!modal) return;

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

                    closeModal(modal);

                }

            }
        );

    });


    /* =====================================================
       8. MEDLIFE AI
    ====================================================== */

    function openAI() {

        if (!aiOverlay) return;

        aiOverlay.classList.add("active");

        aiOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        body.classList.add("ai-open");

        setTimeout(() => {

            if (aiInput) {

                aiInput.focus();

            }

        }, 250);

    }


    function closeAI() {

        if (!aiOverlay) return;

        aiOverlay.classList.remove("active");

        aiOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        body.classList.remove("ai-open");

    }


    if (aiOpenBtn) {

        aiOpenBtn.addEventListener(
            "click",
            openAI
        );

    }


    if (aiCloseBtn) {

        aiCloseBtn.addEventListener(
            "click",
            closeAI
        );

    }


    /* Close AI when clicking outside panel */

    if (aiOverlay) {

        aiOverlay.addEventListener(
            "click",
            event => {

                if (event.target === aiOverlay) {

                    closeAI();

                }

            }
        );

    }


    /* =====================================================
       9. AI MESSAGE SYSTEM
    ====================================================== */

    function addUserMessage(text) {

        if (!aiMessages || !text.trim()) return;

        const message =
            document.createElement("div");

        message.className =
            "ai-message ai-user";


        message.innerHTML = `

            <div class="ai-message-content">

                <p></p>

            </div>

        `;


        message.querySelector("p").textContent =
            text;


        aiMessages.appendChild(message);

        scrollAIToBottom();

    }


    function addBotMessage(text) {

        if (!aiMessages) return;

        const message =
            document.createElement("div");

        message.className =
            "ai-message ai-bot";


        message.innerHTML = `

            <div class="ai-message-avatar">

                <img
                    src="logo.PNG"
                    alt="MedLife">

            </div>

            <div class="ai-message-content">

                <p></p>

            </div>

        `;


        message.querySelector("p").textContent =
            text;


        aiMessages.appendChild(message);

        scrollAIToBottom();

    }


    function addTypingMessage() {

        if (!aiMessages) return null;

        const typing =
            document.createElement("div");

        typing.className =
            "ai-message ai-bot ai-typing";


        typing.innerHTML = `

            <div class="ai-message-avatar">

                <img
                    src="logo.PNG"
                    alt="MedLife">

            </div>

            <div class="ai-message-content">

                <div class="typing-dots">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>

        `;


        aiMessages.appendChild(typing);

        scrollAIToBottom();

        return typing;

    }


    function scrollAIToBottom() {

        if (!aiMessages) return;

        aiMessages.scrollTo({

            top: aiMessages.scrollHeight,

            behavior: "smooth"

        });

    }


    /* =====================================================
       10. BASIC MEDLIFE AI KNOWLEDGE
    ====================================================== */

    function getAIResponse(question) {

        const q =
            question
                .toLowerCase()
                .trim();


        if (
            q.includes("من هي ميدلايف") ||
            q.includes("ما هي ميدلايف") ||
            q.includes("medlife")
        ) {

            return currentLanguage === "ar"

                ? "ميدلايف هي مؤسسة طبية خيرية تطوعية تأسست عام 2019، وتعمل في مجالات الصحة، التوعية، التعليم والتدريب، المبادرات الإنسانية، التقنية والابتكار وتمكين الشباب."

                : "MedLife is a voluntary medical charity organization founded in 2019. It works in health, awareness, education and training, humanitarian initiatives, technology, innovation, and youth empowerment.";

        }


        if (
            q.includes("تطوع") ||
            q.includes("متطوع") ||
            q.includes("volunteer")
        ) {

            return currentLanguage === "ar"

                ? "حالياً لا توجد فرص تطوع مفتوحة. يمكنك متابعة منصات ميدلايف الرسمية لمعرفة الفرص الجديدة عند الإعلان عنها."

                : "There are currently no open volunteer opportunities. Follow MedLife's official platforms for future announcements.";

        }


        if (
            q.includes("مجالات") ||
            q.includes("عمل ميدلايف") ||
            q.includes("areas") ||
            q.includes("programs")
        ) {

            return currentLanguage === "ar"

                ? "تشمل مجالات عمل ميدلايف الخدمات والاستشارات الطبية، التوعية الصحية، التعليم والتدريب، المبادرات الإنسانية، التقنية والابتكار، وتمكين الشباب."

                : "MedLife works in medical services and consultation, health awareness, education and training, humanitarian initiatives, technology and innovation, and youth empowerment.";

        }


        if (
            q.includes("مقال") ||
            q.includes("articles")
        ) {

            return currentLanguage === "ar"

                ? "يعمل فريق ميدلايف على تطوير مساحة للمقالات الطبية والتوعوية التي يشارك في إعدادها أعضاء ومتطوعو المؤسسة."

                : "MedLife is developing a knowledge space for medical and awareness articles created by members and volunteers.";

        }


        if (
            q.includes("استشار") ||
            q.includes("consult")
        ) {

            return currentLanguage === "ar"

                ? "يمكنك الوصول إلى خدمة الاستشارات الطبية عبر بوت ميدلايف على Telegram من خلال قسم الاستشارات في الموقع."

                : "You can access MedLife's medical consultation service through the MedLife Telegram bot via the Consultation section.";

        }


        if (
            q.includes("2019") ||
            q.includes("تأسست") ||
            q.includes("founded")
        ) {

            return currentLanguage === "ar"

                ? "بدأت ميدلايف عام 2019 كمبادرة تطوعية طبية، وحصلت على الترخيص الرسمي عام 2023."

                : "MedLife started in 2019 as a voluntary medical initiative and received official registration in 2023.";

        }


        return currentLanguage === "ar"

            ? "شكراً لسؤالك 🌿 يمكنك أن تسألني عن ميدلايف، مجالات عملنا، التطوع، المبادرات، المقالات أو الاستشارات الطبية."

            : "Thank you for your question 🌿 You can ask me about MedLife, our areas of work, volunteering, initiatives, articles, or medical consultation.";

    }


    /* =====================================================
       11. AI SEND MESSAGE
    ====================================================== */

    async function sendAIMessage(text) {

        if (!text || !text.trim()) return;

        const cleanText =
            text.trim();


        addUserMessage(cleanText);

        if (aiInput) {

            aiInput.value = "";

        }


        const typing =
            addTypingMessage();


        await new Promise(resolve => {

            setTimeout(
                resolve,
                700
            );

        });


        if (typing) {

            typing.remove();

        }


        const response =
            getAIResponse(cleanText);


        addBotMessage(response);

    }


    /* =====================================================
       12. AI FORM
    ====================================================== */

    if (aiForm) {

        aiForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                if (!aiInput) return;

                sendAIMessage(
                    aiInput.value
                );

            }
        );

    }


    /* =====================================================
       13. AI ENTER KEY
    ====================================================== */

    if (aiInput) {

        aiInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    if (aiForm) {

                        aiForm.requestSubmit();

                    }

                }

            }
        );

    }


    /* =====================================================
       14. AI SUGGESTIONS
    ====================================================== */

    aiSuggestions.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    currentLanguage === "ar"

                        ? button.dataset.questionAr

                        : button.dataset.questionEn;


                sendAIMessage(question);

            }
        );

    });


    /* =====================================================
       15. AUTO RESIZE AI TEXTAREA
    ====================================================== */

    if (aiInput) {

        aiInput.addEventListener(
            "input",
            () => {

                aiInput.style.height =
                    "auto";

                aiInput.style.height =
                    Math.min(
                        aiInput.scrollHeight,
                        130
                    ) + "px";

            }
        );

    }


    /* =====================================================
       16. SCROLL REVEAL
    ====================================================== */

    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            revealObserver.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(element => {

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add(
                "visible"
            );

        });

    }


    /* =====================================================
       17. HEADER SCROLL EFFECT
    ====================================================== */

    const header =
        document.querySelector(
            ".site-header"
        );


    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 30) {

            header.classList.add(
                "scrolled"
            );

        } else {

            header.classList.remove(
                "scrolled"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );


    updateHeader();


    /* =====================================================
       18. CLOSE EVERYTHING WITH ESCAPE
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;


            closeMobileMenu();

            closeModal(loginModal);

            closeModal(volunteerModal);

            closeAI();

        }
    );


    /* =====================================================
       19. PREVENT BODY SCROLL WHEN OVERLAYS ARE OPEN
    ====================================================== */

    function updateBodyLock() {

        const modalOpen =
            loginModal?.classList.contains("active") ||
            volunteerModal?.classList.contains("active");

        const aiOpen =
            aiOverlay?.classList.contains("active");

        const menuOpen =
            mobileMenu?.classList.contains("active");


        if (
            modalOpen ||
            aiOpen ||
            menuOpen
        ) {

            body.classList.add(
                "no-scroll"
            );

        } else {

            body.classList.remove(
                "no-scroll"
            );

        }

    }


    /* =====================================================
       20. OBSERVE OVERLAY STATES
    ====================================================== */

    const stateObserver =
        new MutationObserver(
            updateBodyLock
        );


    [
        loginModal,
        volunteerModal,
        aiOverlay,
        mobileMenu
    ].forEach(element => {

        if (!element) return;

        stateObserver.observe(
            element,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );

    });


    /* =====================================================
       21. SMOOTH ANCHOR SCROLL
    ====================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) return;


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) return;


                event.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });


                closeMobileMenu();

            }
        );

    });


    /* =====================================================
       22. INITIALIZATION
    ====================================================== */

    updateLanguage();

    updateHeader();

    updateBodyLock();


    /* =====================================================
       23. CONSOLE MESSAGE
    ====================================================== */

    console.log(
        "%cMedLife Syria",
        "font-size: 20px; font-weight: bold;"
    );

    console.log(
        "MedLife website initialized successfully."
    );

});
