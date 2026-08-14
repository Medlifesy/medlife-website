/* =========================================================
   MEDLIFE SYRIA
   Main JavaScript
   Version: 1.0
========================================================= */

"use strict";


/* =========================================================
   DOM READY
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

    const mobileLinks =
        document.querySelectorAll("[data-mobile-link]");

    const volunteerTriggers =
        document.querySelectorAll("[data-volunteer-trigger]");

    const languageElements =
        document.querySelectorAll("[data-ar][data-en]");

    const aiSuggestionButtons =
        document.querySelectorAll(".ai-suggestions button");


    /* =====================================================
       LANGUAGE
    ====================================================== */

    let currentLanguage =
        localStorage.getItem("medlifeLanguage") || "ar";


    function updateLanguage() {

        const isArabic = currentLanguage === "ar";

        document.documentElement.lang =
            isArabic ? "ar" : "en";

        document.documentElement.dir =
            isArabic ? "rtl" : "ltr";


        /* ---------------------------------------------
           TEXT CONTENT
        --------------------------------------------- */

        languageElements.forEach(element => {

            const arabicText =
                element.getAttribute("data-ar");

            const englishText =
                element.getAttribute("data-en");

            if (!arabicText || !englishText) {
                return;
            }

            element.textContent =
                isArabic ? arabicText : englishText;

        });


        /* ---------------------------------------------
           LANGUAGE BUTTON
        --------------------------------------------- */

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


        /* ---------------------------------------------
           AI INPUT PLACEHOLDER
        --------------------------------------------- */

        if (aiInput) {

            const placeholderArabic =
                aiInput.getAttribute("data-placeholder-ar");

            const placeholderEnglish =
                aiInput.getAttribute("data-placeholder-en");

            aiInput.placeholder =
                isArabic
                    ? placeholderArabic
                    : placeholderEnglish;

        }


        /* ---------------------------------------------
           SAVE LANGUAGE
        --------------------------------------------- */

        localStorage.setItem(
            "medlifeLanguage",
            currentLanguage
        );

    }


    if (languageBtn) {

        languageBtn.addEventListener("click", () => {

            currentLanguage =
                currentLanguage === "ar"
                    ? "en"
                    : "ar";

            updateLanguage();

        });

    }


    /* =====================================================
       MOBILE MENU
    ====================================================== */

    function openMobileMenu() {

        if (!mobileMenu || !menuToggle) {
            return;
        }

        mobileMenu.classList.add("active");

        menuToggle.classList.add("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        const icon =
            menuToggle.querySelector("i");

        if (icon) {

            icon.classList.remove(
                "fa-bars"
            );

            icon.classList.add(
                "fa-xmark"
            );

        }

    }


    function closeMobileMenu() {

        if (!mobileMenu || !menuToggle) {
            return;
        }

        mobileMenu.classList.remove("active");

        menuToggle.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        const icon =
            menuToggle.querySelector("i");

        if (icon) {

            icon.classList.remove(
                "fa-xmark"
            );

            icon.classList.add(
                "fa-bars"
            );

        }

    }


    function toggleMobileMenu() {

        if (!mobileMenu) {
            return;
        }

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


    mobileLinks.forEach(link => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );

    });


    /* =====================================================
       MODAL SYSTEM
    ====================================================== */

    function openModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        body.classList.add(
            "modal-open"
        );

    }


    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            !document.querySelector(
                ".modal.active"
            )
        ) {

            body.classList.remove(
                "modal-open"
            );

        }

    }


    /* =====================================================
       LOGIN MODAL
    ====================================================== */

    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            () => {

                closeMobileMenu();

                openModal(loginModal);

            }
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
       VOLUNTEER MODAL
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
            () => {

                openModal(volunteerModal);

            }
        );

    }


    if (closeVolunteer) {

        closeVolunteer.addEventListener(
            "click",
            () => closeModal(volunteerModal)
        );

    }


    /* =====================================================
       CLOSE MODAL BY CLICKING OUTSIDE
    ====================================================== */

    [loginModal, volunteerModal].forEach(modal => {

        if (!modal) {
            return;
        }

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
       MEDLIFE AI
    ====================================================== */

    function openAI() {

        if (!aiOverlay) {
            return;
        }

        aiOverlay.classList.add("active");

        aiOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        body.classList.add(
            "ai-open"
        );


        setTimeout(() => {

            if (aiInput) {
                aiInput.focus();
            }

        }, 250);

    }


    function closeAI() {

        if (!aiOverlay) {
            return;
        }

        aiOverlay.classList.remove(
            "active"
        );

        aiOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        body.classList.remove(
            "ai-open"
        );

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


    /* =====================================================
       CLOSE AI WHEN CLICKING OVERLAY
    ====================================================== */

    if (aiOverlay) {

        aiOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target === aiOverlay
                ) {

                    closeAI();

                }

            }
        );

    }


    /* =====================================================
       AI MESSAGE SYSTEM
    ====================================================== */

    function addUserMessage(text) {

        if (!aiMessages || !text) {
            return;
        }

        const message =
            document.createElement("div");

        message.className =
            "ai-message ai-user";

        message.innerHTML = `
            <div class="ai-message-content">
                <p></p>
            </div>
        `;

        const paragraph =
            message.querySelector("p");

        paragraph.textContent = text;

        aiMessages.appendChild(message);

        scrollAIMessages();

    }


    function addBotMessage(text) {

        if (!aiMessages || !text) {
            return;
        }

        const message =
            document.createElement("div");

        message.className =
            "ai-message ai-bot";

        message.innerHTML = `
            <div class="ai-message-avatar">
                <img src="logo.PNG" alt="MedLife">
            </div>

            <div class="ai-message-content">
                <p></p>
            </div>
        `;

        const paragraph =
            message.querySelector("p");

        paragraph.textContent = text;

        aiMessages.appendChild(message);

        scrollAIMessages();

    }


    function addTypingIndicator() {

        if (!aiMessages) {
            return null;
        }

        const typing =
            document.createElement("div");

        typing.className =
            "ai-message ai-bot ai-typing";

        typing.innerHTML = `
            <div class="ai-message-avatar">
                <img src="logo.PNG" alt="MedLife">
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

        scrollAIMessages();

        return typing;

    }


    function scrollAIMessages() {

        if (!aiMessages) {
            return;
        }

        aiMessages.scrollTo({
            top: aiMessages.scrollHeight,
            behavior: "smooth"
        });

    }


    /* =====================================================
       BASIC MEDLIFE AI KNOWLEDGE
    ====================================================== */

    function getAIResponse(question) {

        const normalized =
            question
                .toLowerCase()
                .trim();


        if (
            normalized.includes("من هي ميدلايف") ||
            normalized.includes("ما هي ميدلايف") ||
            normalized.includes("what is medlife") ||
            normalized.includes("medlife")
        ) {

            return currentLanguage === "ar"

                ? "ميدلايف هي مؤسسة طبية خيرية تطوعية انطلقت عام 2019، وتعمل في مجالات الصحة والتوعية والتعليم والتدريب والمبادرات الإنسانية والتقنية وتمكين الشباب. حصلت المؤسسة على الترخيص الرسمي عام 2023."

                : "MedLife is a voluntary medical charity organization founded in 2019. It works across health, awareness, education, training, humanitarian initiatives, technology, and youth empowerment. The organization obtained official registration in 2023.";

        }


        if (
            normalized.includes("تطوع") ||
            normalized.includes("متطوع") ||
            normalized.includes("volunteer")
        ) {

            return currentLanguage === "ar"

                ? "حالياً لا توجد فرص تطوع مفتوحة في ميدلايف. عند توفر فرص جديدة سيتم الإعلان عنها عبر المنصات الرسمية للمؤسسة."

                : "There are currently no open volunteer opportunities at MedLife. New opportunities will be announced through MedLife's official platforms.";

        }


        if (
            normalized.includes("مجالات") ||
            normalized.includes("ماذا تفعل") ||
            normalized.includes("areas") ||
            normalized.includes("programs") ||
            normalized.includes("what do you do")
        ) {

            return currentLanguage === "ar"

                ? "تشمل مجالات عمل ميدلايف الخدمات والاستشارات الطبية، التوعية الصحية، التعليم والتدريب، المبادرات الإنسانية، التقنية والابتكار، وتمكين الشباب."

                : "MedLife works across medical services and consultation, health awareness, education and training, humanitarian initiatives, technology and innovation, and youth empowerment.";

        }


        if (
            normalized.includes("2019") ||
            normalized.includes("تأسست") ||
            normalized.includes("founded")
        ) {

            return currentLanguage === "ar"

                ? "انطلقت ميدلايف عام 2019 كمبادرة تطوعية طبية، ثم تطورت تدريجياً حتى حصلت على الترخيص الرسمي عام 2023."

                : "MedLife started in 2019 as a voluntary medical initiative and gradually developed into an officially registered organization in 2023.";

        }


        if (
            normalized.includes("استشارة") ||
            normalized.includes("طبية") ||
            normalized.includes("consultation") ||
            normalized.includes("medical")
        ) {

            return currentLanguage === "ar"

                ? "للاستشارات الطبية يمكنك استخدام بوت ميدلايف على Telegram عبر @Medlife2024bot. تذكّر أن MedLife AI نفسه لا يحل محل الطبيب أو الاستشارة الطبية المتخصصة."

                : "For medical consultation, you can use MedLife's Telegram bot at @Medlife2024bot. Please remember that MedLife AI itself does not replace a doctor or professional medical advice.";

        }


        if (
            normalized.includes("مقال") ||
            normalized.includes("مقالات") ||
            normalized.includes("article") ||
            normalized.includes("articles")
        ) {

            return currentLanguage === "ar"

                ? "نعمل على تطوير مساحة للمقالات الطبية والتوعوية التي يكتبها أعضاء ومتطوعو ميدلايف."

                : "We are developing a space for medical and awareness articles written by MedLife members and volunteers.";

        }


        if (
            normalized.includes("طرطوس") ||
            normalized.includes("tartous") ||
            normalized.includes("headquarters")
        ) {

            return currentLanguage === "ar"

                ? "المقر الرئيسي لميدلايف موجود في طرطوس — سوريا."

                : "MedLife's headquarters are in Tartous, Syria.";

        }


        return currentLanguage === "ar"

            ? "شكراً لسؤالك ❤️ يمكنني مساعدتك بالمعلومات المتعلقة بميدلايف، مثل من نحن، مجالات العمل، التطوع، المبادرات، المقالات والاستشارات الطبية."

            : "Thank you for your question ❤️ I can help with information about MedLife, including who we are, our areas of work, volunteering, initiatives, articles, and medical consultation.";

    }


    /* =====================================================
       AI FORM
    ====================================================== */

    if (aiForm) {

        aiForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                if (!aiInput) {
                    return;
                }

                const question =
                    aiInput.value.trim();

                if (!question) {
                    return;
                }


                addUserMessage(question);

                aiInput.value = "";

                autoResizeTextarea();


                const typing =
                    addTypingIndicator();


                setTimeout(() => {

                    if (typing) {
                        typing.remove();
                    }

                    const response =
                        getAIResponse(question);

                    addBotMessage(response);

                }, 700);

            }
        );

    }


    /* =====================================================
       AI QUICK QUESTIONS
    ====================================================== */

    aiSuggestionButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    currentLanguage === "ar"

                        ? button.getAttribute(
                            "data-question-ar"
                        )

                        : button.getAttribute(
                            "data-question-en"
                        );

                if (!question) {
                    return;
                }

                if (aiInput) {

                    aiInput.value =
                        question;

                    autoResizeTextarea();

                    aiInput.focus();

                }

            }
        );

    });


    /* =====================================================
       AI TEXTAREA AUTO RESIZE
    ====================================================== */

    function autoResizeTextarea() {

        if (!aiInput) {
            return;
        }

        aiInput.style.height = "auto";

        aiInput.style.height =
            Math.min(
                aiInput.scrollHeight,
                130
            ) + "px";

    }


    if (aiInput) {

        aiInput.addEventListener(
            "input",
            autoResizeTextarea
        );


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
       SCROLL REVEAL
    ====================================================== */

    const revealElements =
        document.querySelectorAll(
            ".reveal"
        );


    if (
        "IntersectionObserver"
        in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -40px 0px"
                }
            );


        revealElements.forEach(element => {

            observer.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add(
                "visible"
            );

        });

    }


    /* =====================================================
       SMOOTH SCROLL
    ====================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(anchor => {

            anchor.addEventListener(
                "click",
                event => {

                    const targetId =
                        anchor.getAttribute(
                            "href"
                        );

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    closeMobileMenu();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });


    /* =====================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            closeMobileMenu();

            closeModal(loginModal);

            closeModal(volunteerModal);

            closeAI();

        }
    );


    /* =====================================================
       BODY SCROLL CONTROL
    ====================================================== */

    function updateBodyScroll() {

        const modalOpen =
            document.querySelector(
                ".modal.active"
            );

        const aiIsOpen =
            aiOverlay &&
            aiOverlay.classList.contains(
                "active"
            );

        if (
            modalOpen ||
            aiIsOpen
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
       HANDLE WINDOW RESIZE
    ====================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 768
            ) {

                closeMobileMenu();

            }

            updateBodyScroll();

        }
    );


    /* =====================================================
       ACTIVE NAVIGATION
    ====================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            ".nav-links a"
        );


    if (
        "IntersectionObserver"
        in window
    ) {

        const sectionObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        const id =
                            entry.target.id;

                        navLinks.forEach(link => {

                            link.classList.remove(
                                "active"
                            );

                            if (
                                link.getAttribute(
                                    "href"
                                ) === `#${id}`
                            ) {

                                link.classList.add(
                                    "active"
                                );

                            }

                        });

                    });

                },
                {
                    threshold: 0.25,
                    rootMargin: "-20% 0px -60% 0px"
                }
            );


        sections.forEach(section => {

            sectionObserver.observe(
                section
            );

        });

    }


    /* =====================================================
       HEADER SCROLL EFFECT
    ====================================================== */

    const header =
        document.querySelector(
            ".site-header"
        );


    if (header) {

        const handleHeaderScroll = () => {

            if (
                window.scrollY > 30
            ) {

                header.classList.add(
                    "scrolled"
                );

            } else {

                header.classList.remove(
                    "scrolled"
                );

            }

        };


        window.addEventListener(
            "scroll",
            handleHeaderScroll,
            {
                passive: true
            }
        );


        handleHeaderScroll();

    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    updateLanguage();

    updateBodyScroll();


    /* =====================================================
       CONSOLE
    ====================================================== */

    console.log(
        "%cMedLife Syria",
        "font-size:22px;font-weight:bold;"
    );

    console.log(
        "%cWe save life, we are med.life",
        "font-size:13px;"
    );

});
