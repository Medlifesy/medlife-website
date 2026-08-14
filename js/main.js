/* =========================================================
   MEDLIFE SYRIA
   MAIN JAVASCRIPT
   Version: 1.0
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GLOBAL STATE
    ====================================================== */

    let currentLanguage = "ar";


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const body = document.body;

    const languageBtn = document.getElementById("languageBtn");

    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    const mobileLinks = document.querySelectorAll("[data-mobile-link]");

    const loginBtn = document.getElementById("loginBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");

    const loginModal = document.getElementById("loginModal");
    const closeLogin = document.getElementById("closeLogin");
    const closeLogin2 = document.getElementById("closeLogin2");

    const volunteerModal = document.getElementById("volunteerModal");
    const closeVolunteer = document.getElementById("closeVolunteer");

    const volunteerBtn = document.getElementById("volunteerBtn");

    const volunteerTriggers =
        document.querySelectorAll("[data-volunteer-trigger]");

    const aiOpenBtn = document.getElementById("aiOpenBtn");
    const aiCloseBtn = document.getElementById("aiCloseBtn");

    const aiOverlay = document.getElementById("aiOverlay");
    const aiPanel = document.querySelector(".ai-panel");

    const aiForm = document.getElementById("aiForm");
    const aiInput = document.getElementById("aiInput");
    const aiMessages = document.getElementById("aiMessages");

    const aiSuggestions =
        document.querySelectorAll(".ai-suggestions button");


    /* =====================================================
       LANGUAGE SYSTEM
    ====================================================== */

    function updateLanguage(language) {

        currentLanguage = language;

        /*
         * Change document direction
         */

        if (language === "ar") {

            document.documentElement.lang = "ar";
            document.documentElement.dir = "rtl";

            body.classList.remove("english");

            if (languageBtn) {
                languageBtn.textContent = "EN";
            }

        } else {

            document.documentElement.lang = "en";
            document.documentElement.dir = "ltr";

            body.classList.add("english");

            if (languageBtn) {
                languageBtn.textContent = "AR";
            }
        }


        /*
         * Update all translated elements
         */

        const translatedElements =
            document.querySelectorAll("[data-ar][data-en]");

        translatedElements.forEach(element => {

            const text =
                language === "ar"
                    ? element.getAttribute("data-ar")
                    : element.getAttribute("data-en");

            if (text !== null) {

                /*
                 * Keep HTML elements intact when possible.
                 * Most translated elements contain plain text.
                 */

                element.textContent = text;
            }

        });


        /*
         * Update placeholders
         */

        const placeholderElements =
            document.querySelectorAll(
                "[data-placeholder-ar][data-placeholder-en]"
            );

        placeholderElements.forEach(element => {

            const placeholder =
                language === "ar"
                    ? element.getAttribute("data-placeholder-ar")
                    : element.getAttribute("data-placeholder-en");

            element.placeholder = placeholder;
        });


        /*
         * Update accessibility labels
         */

        if (aiInput) {

            aiInput.setAttribute(
                "aria-label",
                language === "ar"
                    ? "اكتب سؤالك"
                    : "Type your question"
            );
        }


        /*
         * Save language preference
         */

        try {

            localStorage.setItem(
                "medlife-language",
                language
            );

        } catch (error) {

            console.warn(
                "Could not save language preference."
            );
        }
    }


    /*
     * Language button
     */

    if (languageBtn) {

        languageBtn.addEventListener("click", () => {

            const newLanguage =
                currentLanguage === "ar"
                    ? "en"
                    : "ar";

            updateLanguage(newLanguage);

        });
    }


    /*
     * Load saved language
     */

    try {

        const savedLanguage =
            localStorage.getItem("medlife-language");

        if (savedLanguage === "en") {

            updateLanguage("en");

        } else {

            updateLanguage("ar");
        }

    } catch (error) {

        updateLanguage("ar");
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

            icon.classList.remove("fa-bars");

            icon.classList.add("fa-xmark");
        }

        body.classList.add("menu-open");
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

            icon.classList.remove("fa-xmark");

            icon.classList.add("fa-bars");
        }

        body.classList.remove("menu-open");
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


    /*
     * Close mobile menu after clicking a link
     */

    mobileLinks.forEach(link => {

        link.addEventListener("click", () => {

            closeMobileMenu();

        });

    });


    /*
     * Close menu when resizing to desktop
     */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {

            closeMobileMenu();

        }

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

        body.classList.add("modal-open");
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

        /*
         * Only remove modal-open if
         * no other modal is visible.
         */

        const activeModals =
            document.querySelectorAll(
                ".modal.active"
            );

        if (activeModals.length === 0) {

            body.classList.remove("modal-open");

        }
    }


    /* =====================================================
       LOGIN MODAL
    ====================================================== */

    if (loginBtn) {

        loginBtn.addEventListener("click", () => {

            openModal(loginModal);

        });

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
            () => {

                closeModal(loginModal);

            }
        );

    }


    if (closeLogin2) {

        closeLogin2.addEventListener(
            "click",
            () => {

                closeModal(loginModal);

            }
        );

    }


    /* =====================================================
       VOLUNTEER MODAL
    ====================================================== */

    volunteerTriggers.forEach(trigger => {

        trigger.addEventListener(
            "click",
            event => {

                /*
                 * Prevent anchor from jumping
                 * if it is a link.
                 */

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
            () => {

                closeModal(volunteerModal);

            }
        );

    }


    /* =====================================================
       CLOSE MODALS WHEN CLICKING OUTSIDE
    ====================================================== */

    document.querySelectorAll(".modal").forEach(modal => {

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
       ESC KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }


            /*
             * Close login modal
             */

            if (
                loginModal &&
                loginModal.classList.contains("active")
            ) {

                closeModal(loginModal);

            }


            /*
             * Close volunteer modal
             */

            if (
                volunteerModal &&
                volunteerModal.classList.contains("active")
            ) {

                closeModal(volunteerModal);

            }


            /*
             * Close AI
             */

            if (
                aiOverlay &&
                aiOverlay.classList.contains("active")
            ) {

                closeAI();

            }


            /*
             * Close mobile menu
             */

            closeMobileMenu();

        }
    );


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

        body.classList.add("ai-open");

        /*
         * Small delay improves focus behaviour
         */

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


    /*
     * Click outside AI panel
     */

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
       AI CHAT
    ====================================================== */

    function addUserMessage(message) {

        if (!aiMessages) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ai-message ai-user";


        wrapper.innerHTML = `

            <div class="ai-message-content">

                <p></p>

            </div>

        `;


        const paragraph =
            wrapper.querySelector("p");

        paragraph.textContent = message;


        aiMessages.appendChild(wrapper);

        scrollAIToBottom();
    }


    function addBotMessage(message) {

        if (!aiMessages) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ai-message ai-bot";


        wrapper.innerHTML = `

            <div class="ai-message-avatar">

                <img
                    src="logo.PNG"
                    alt="MedLife">

            </div>

            <div class="ai-message-content">

                <p></p>

            </div>

        `;


        const paragraph =
            wrapper.querySelector("p");

        paragraph.textContent = message;


        aiMessages.appendChild(wrapper);

        scrollAIToBottom();
    }


    function addTypingMessage() {

        if (!aiMessages) {
            return null;
        }

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ai-message ai-bot ai-typing";


        wrapper.innerHTML = `

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


        aiMessages.appendChild(wrapper);

        scrollAIToBottom();

        return wrapper;
    }


    function scrollAIToBottom() {

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

    function generateAIResponse(question) {

        const q =
            question
                .toLowerCase()
                .trim();


        /*
         * Arabic responses
         */

        if (currentLanguage === "ar") {


            if (
                q.includes("ما هي ميدلايف") ||
                q.includes("مين ميدلايف") ||
                q.includes("ميدلايف")
            ) {

                return `
ميدلايف هي مؤسسة طبية خيرية تطوعية انطلقت عام 2019، وتركز على الصحة والتوعية والتعليم والتدريب والمبادرات الإنسانية والعمل المجتمعي والابتكار.

تعمل ميدلايف من خلال شبكة من المتطوعين والكوادر الطبية والشباب في عدد من المحافظات السورية.

رسالتنا بسيطة:
بالعمل التطوعي نصنع الأثر ❤️
                `.trim();

            }


            if (
                q.includes("تطوع") ||
                q.includes("متطوع")
            ) {

                return `
حالياً لا توجد فرص تطوع مفتوحة في ميدلايف.

لكن يتم الإعلان عن فرص التطوع الجديدة عبر منصات ميدلايف الرسمية عند توفرها.

إذا كنت مهتماً، تابع صفحاتنا الرسمية وابقَ على اطلاع.
                `.trim();

            }


            if (
                q.includes("مجالات") ||
                q.includes("ماذا تفعل") ||
                q.includes("شو بتعمل")
            ) {

                return `
تعمل ميدلايف في عدة مجالات، أهمها:

• الخدمات والاستشارات الطبية
• التوعية الصحية
• التعليم والتدريب
• المبادرات الإنسانية
• التقنية والابتكار
• تمكين الشباب

والهدف هو تحويل المعرفة والطاقة التطوعية إلى أثر حقيقي في المجتمع.
                `.trim();

            }


            if (
                q.includes("متى تأسست") ||
                q.includes("تأسست") ||
                q.includes("2019")
            ) {

                return `
انطلقت ميدلايف عام 2019 كمبادرة تطوعية طبية، ثم تطورت تدريجياً حتى أصبحت مؤسسة طبية خيرية تطوعية.

وفي عام 2023 حصلت المؤسسة على الترخيص الرسمي.
                `.trim();

            }


            if (
                q.includes("استشارة") ||
                q.includes("طبيب") ||
                q.includes("مرض")
            ) {

                return `
إذا كان لديك سؤال طبي، يمكنك استخدام خدمة الاستشارات الطبية التابعة لميدلايف عبر Telegram.

اضغط على قسم "الاستشارات الطبية" في الموقع للوصول إلى بوت الاستشارات.

⚠️ MedLife AI نفسه لا يقدم تشخيصاً طبياً ولا يحل محل الطبيب.
                `.trim();

            }


            return `
شكراً لسؤالك! 👋

أنا MedLife AI وأستطيع مساعدتك بالمعلومات العامة عن:

• ميدلايف
• برامجنا ومجالات عملنا
• التطوع
• المبادرات
• الاستشارات الطبية
• المقالات والمعرفة الطبية

جرّب أن تسألني مثلاً:
"ما هي ميدلايف؟"
أو
"كيف يمكنني التطوع؟"
            `.trim();

        }


        /*
         * English responses
         */

        if (
            q.includes("what is medlife") ||
            q.includes("medlife")
        ) {

            return `
MedLife is a voluntary medical charity organization founded in 2019.

It focuses on health, awareness, education and training, humanitarian initiatives, community work, youth empowerment, technology, and innovation.

Through volunteerism, MedLife aims to turn knowledge and ideas into meaningful community impact.
            `.trim();

        }


        if (
            q.includes("volunteer") ||
            q.includes("join")
        ) {

            return `
There are currently no open volunteer opportunities at MedLife.

New opportunities will be announced through MedLife's official platforms when available.

Stay connected and follow our official channels.
            `.trim();

        }


        if (
            q.includes("areas") ||
            q.includes("work") ||
            q.includes("programs")
        ) {

            return `
MedLife works across several areas:

• Medical services and consultation
• Health awareness
• Education and training
• Humanitarian initiatives
• Technology and innovation
• Youth empowerment

Our goal is to transform knowledge and volunteer energy into meaningful community impact.
            `.trim();

        }


        if (
            q.includes("founded") ||
            q.includes("2019") ||
            q.includes("established")
        ) {

            return `
MedLife started in 2019 as a voluntary medical initiative.

In 2023, the organization obtained official registration and continued its work through a more structured institutional framework.
            `.trim();

        }


        if (
            q.includes("medical") ||
            q.includes("doctor") ||
            q.includes("consultation")
        ) {

            return `
If you have a medical question, you can use MedLife's medical consultation service through Telegram.

Please use the Medical Consultation section on the website to access the consultation bot.

⚠️ MedLife AI does not provide diagnosis and does not replace professional medical advice.
            `.trim();

        }


        return `
Thank you for your question! 👋

I can help you with general information about:

• MedLife
• Our programs
• Volunteering
• Initiatives
• Medical consultation
• Articles and medical knowledge

Try asking:
"What is MedLife?"
or
"How can I volunteer?"
        `.trim();

    }


    /* =====================================================
       AI SEND MESSAGE
    ====================================================== */

    async function sendAIMessage(message) {

        if (!message) {
            return;
        }

        addUserMessage(message);


        /*
         * Clear input
         */

        if (aiInput) {

            aiInput.value = "";

            aiInput.style.height = "auto";

        }


        /*
         * Show typing indicator
         */

        const typing =
            addTypingMessage();


        /*
         * Simulate short AI response delay
         */

        await new Promise(resolve => {

            setTimeout(
                resolve,
                650
            );

        });


        /*
         * Remove typing indicator
         */

        if (typing) {

            typing.remove();

        }


        /*
         * Generate response
         */

        const response =
            generateAIResponse(message);


        addBotMessage(response);

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

                const message =
                    aiInput.value.trim();


                if (!message) {

                    aiInput.focus();

                    return;
                }


                sendAIMessage(message);

            }
        );

    }


    /* =====================================================
       AI SUGGESTIONS
    ====================================================== */

    aiSuggestions.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const message =
                    currentLanguage === "ar"
                        ? button.getAttribute(
                            "data-question-ar"
                        )
                        : button.getAttribute(
                            "data-question-en"
                        );

                if (!message) {
                    return;
                }

                sendAIMessage(message);

            }
        );

    });


    /* =====================================================
       AUTO RESIZE AI TEXTAREA
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


        /*
         * Enter = send
         * Shift + Enter = new line
         */

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
        document.querySelectorAll(".reveal");


    if ("IntersectionObserver" in window) {

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
                    threshold: 0.12
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


                /*
                 * Do not override modal
                 * trigger links.
                 */

                if (
                    link.hasAttribute(
                        "data-volunteer-trigger"
                    )
                ) {

                    return;

                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


    /* =====================================================
       HEADER SCROLL EFFECT
    ====================================================== */

    const header =
        document.querySelector(
            ".site-header"
        );


    function updateHeader() {

        if (!header) {
            return;
        }

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
       PREVENT BODY SCROLL WHEN OVERLAYS ARE OPEN
    ====================================================== */

    function updateBodyLock() {

        const modalOpen =
            document.querySelector(
                ".modal.active"
            );

        const aiOpen =
            aiOverlay &&
            aiOverlay.classList.contains(
                "active"
            );

        const menuOpen =
            mobileMenu &&
            mobileMenu.classList.contains(
                "active"
            );


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


    /*
     * Observe class changes
     */

    const overlayObserver =
        new MutationObserver(
            updateBodyLock
        );


    if (loginModal) {

        overlayObserver.observe(
            loginModal,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );

    }


    if (volunteerModal) {

        overlayObserver.observe(
            volunteerModal,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );

    }


    if (aiOverlay) {

        overlayObserver.observe(
            aiOverlay,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );

    }


    if (mobileMenu) {

        overlayObserver.observe(
            mobileMenu,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );

    }


    /* =====================================================
       EXTERNAL LINKS
    ====================================================== */

    document.querySelectorAll(
        'a[target="_blank"]'
    ).forEach(link => {

        link.setAttribute(
            "rel",
            "noopener noreferrer"
        );

    });


    /* =====================================================
       ACTIVE NAVIGATION
    ====================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            '.nav-links a[href^="#"]'
        );


    if (
        "IntersectionObserver" in window &&
        sections.length &&
        navLinks.length
    ) {

        const sectionObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

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

                        }

                    });

                },
                {
                    rootMargin:
                        "-35% 0px -55% 0px"
                }
            );


        sections.forEach(section => {

            sectionObserver.observe(
                section
            );

        });

    }


    /* =====================================================
       LOG
    ====================================================== */

    console.log(
        "%cMedLife Syria%c — Website initialized successfully.",
        "font-weight:bold;font-size:16px;",
        "font-size:14px;"
    );

});
