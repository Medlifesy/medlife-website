/* =========================================================
   MEDLIFE SYRIA
   MAIN JAVASCRIPT
   Compatible with the final index.html
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       1. LANGUAGE SYSTEM
    ====================================================== */

    const languageBtn = document.getElementById("languageBtn");

    let currentLanguage = localStorage.getItem("medlifeLanguage") || "ar";

    function updateLanguage() {

        const elements = document.querySelectorAll("[data-ar][data-en]");

        elements.forEach((element) => {

            const arabicText = element.getAttribute("data-ar");
            const englishText = element.getAttribute("data-en");

            if (currentLanguage === "ar") {
                element.textContent = arabicText;
            } else {
                element.textContent = englishText;
            }

        });


        /* Page direction */

        document.documentElement.lang = currentLanguage;

        document.documentElement.dir =
            currentLanguage === "ar" ? "rtl" : "ltr";


        /* Language button */

        if (languageBtn) {
            languageBtn.textContent =
                currentLanguage === "ar" ? "EN" : "AR";
        }


        /* Textarea placeholder */

        const aiInput = document.getElementById("aiInput");

        if (aiInput) {

            const placeholder =
                currentLanguage === "ar"
                    ? aiInput.getAttribute("data-placeholder-ar")
                    : aiInput.getAttribute("data-placeholder-en");

            if (placeholder) {
                aiInput.placeholder = placeholder;
            }

        }


        localStorage.setItem(
            "medlifeLanguage",
            currentLanguage
        );

    }


    if (languageBtn) {

        languageBtn.addEventListener("click", () => {

            currentLanguage =
                currentLanguage === "ar" ? "en" : "ar";

            updateLanguage();

        });

    }


    updateLanguage();



    /* =====================================================
       2. MOBILE MENU
    ====================================================== */

    const menuToggle =
        document.getElementById("menuToggle");

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (menuToggle && mobileMenu) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                mobileMenu.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );


            const icon =
                menuToggle.querySelector("i");

            if (icon) {

                icon.classList.toggle(
                    "fa-bars",
                    !isOpen
                );

                icon.classList.toggle(
                    "fa-xmark",
                    isOpen
                );

            }

        });


        /* Close menu after clicking a link */

        const mobileLinks =
            mobileMenu.querySelectorAll(
                "[data-mobile-link]"
            );

        mobileLinks.forEach((link) => {

            link.addEventListener("click", () => {

                mobileMenu.classList.remove("active");

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

            });

        });

    }



    /* =====================================================
       3. LOGIN MODAL
    ====================================================== */

    const loginModal =
        document.getElementById("loginModal");

    const loginBtn =
        document.getElementById("loginBtn");

    const mobileLoginBtn =
        document.getElementById("mobileLoginBtn");

    const closeLogin =
        document.getElementById("closeLogin");

    const closeLogin2 =
        document.getElementById("closeLogin2");


    function openModal(modal) {

        if (!modal) return;

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal(modal) {

        if (!modal) return;

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


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

                if (mobileMenu) {
                    mobileMenu.classList.remove(
                        "active"
                    );
                }

                if (menuToggle) {
                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }

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
       4. VOLUNTEER MODAL
    ====================================================== */

    const volunteerModal =
        document.getElementById("volunteerModal");

    const closeVolunteer =
        document.getElementById("closeVolunteer");

    const volunteerBtn =
        document.getElementById("volunteerBtn");


    const volunteerTriggers =
        document.querySelectorAll(
            "[data-volunteer-trigger]"
        );


    volunteerTriggers.forEach((trigger) => {

        trigger.addEventListener("click", (event) => {

            event.preventDefault();

            if (mobileMenu) {
                mobileMenu.classList.remove(
                    "active"
                );
            }

            if (menuToggle) {

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

            openModal(volunteerModal);

        });

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
       5. CLOSE MODALS WHEN CLICKING OUTSIDE
    ====================================================== */

    document.querySelectorAll(".modal").forEach((modal) => {

        modal.addEventListener("click", (event) => {

            if (event.target === modal) {
                closeModal(modal);
            }

        });

    });



    /* =====================================================
       6. ESCAPE KEY
    ====================================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") return;


        if (loginModal) {
            closeModal(loginModal);
        }


        if (volunteerModal) {
            closeModal(volunteerModal);
        }


        closeAI();

    });



    /* =====================================================
       7. AI PANEL
    ====================================================== */

    const aiOpenBtn =
        document.getElementById("aiOpenBtn");

    const aiCloseBtn =
        document.getElementById("aiCloseBtn");

    const aiOverlay =
        document.getElementById("aiOverlay");

    const aiForm =
        document.getElementById("aiForm");

    const aiInput =
        document.getElementById("aiInput");

    const aiMessages =
        document.getElementById("aiMessages");


    function openAI() {

        if (!aiOverlay) return;

        aiOverlay.classList.add("active");

        aiOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "ai-open"
        );


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

        document.body.classList.remove(
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


    /* Close AI by clicking overlay */

    if (aiOverlay) {

        aiOverlay.addEventListener(
            "click",
            (event) => {

                if (event.target === aiOverlay) {
                    closeAI();
                }

            }
        );

    }



    /* =====================================================
       8. AI CHAT HELPERS
    ====================================================== */

    function addUserMessage(text) {

        if (!aiMessages) return;


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

        if (paragraph) {
            paragraph.textContent = text;
        }


        aiMessages.appendChild(message);

        scrollAIMessages();

    }


    function addBotMessage(text) {

        if (!aiMessages) return;


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

        if (paragraph) {
            paragraph.textContent = text;
        }


        aiMessages.appendChild(message);

        scrollAIMessages();

    }


    function scrollAIMessages() {

        if (!aiMessages) return;

        aiMessages.scrollTo({
            top: aiMessages.scrollHeight,
            behavior: "smooth"
        });

    }



    /* =====================================================
       9. SIMPLE MEDLIFE AI KNOWLEDGE
    ====================================================== */

    function getAIResponse(question) {

        const q =
            question
                .toLowerCase()
                .trim();


        if (
            q.includes("ما هي ميدلايف") ||
            q.includes("ما هي مؤسسة ميدلايف") ||
            q.includes("medlife") ||
            q.includes("what is medlife")
        ) {

            return currentLanguage === "ar"

                ? "ميدلايف هي مؤسسة طبية خيرية تطوعية تأسست عام 2019، وتعمل في مجالات الصحة والتوعية والتعليم والتدريب والمبادرات الإنسانية والابتكار وتمكين الشباب."

                : "MedLife is a voluntary medical charity organization founded in 2019, working in health, awareness, education, humanitarian initiatives, innovation, and youth empowerment.";

        }


        if (
            q.includes("تطوع") ||
            q.includes("متطوع") ||
            q.includes("volunteer")
        ) {

            return currentLanguage === "ar"

                ? "حالياً لا توجد فرص تطوع مفتوحة. يمكنك متابعة منصات ميدلايف الرسمية لمعرفة فرص الانضمام الجديدة عند الإعلان عنها."

                : "There are currently no open volunteer opportunities. Follow MedLife's official platforms for future opportunities.";

        }


        if (
            q.includes("مجالات") ||
            q.includes("ماذا تفعل") ||
            q.includes("مجال عمل") ||
            q.includes("areas of work") ||
            q.includes("what do you do")
        ) {

            return currentLanguage === "ar"

                ? "تعمل ميدلايف في عدة مجالات، منها الخدمات والاستشارات الطبية، التوعية الصحية، التعليم والتدريب، المبادرات الإنسانية، التقنية والابتكار، وتمكين الشباب."

                : "MedLife works across medical services and consultation, health awareness, education and training, humanitarian initiatives, technology and innovation, and youth empowerment.";

        }


        if (
            q.includes("استشارة") ||
            q.includes("طبي") ||
            q.includes("medical consultation") ||
            q.includes("consultation")
        ) {

            return currentLanguage === "ar"

                ? "للاستشارات الطبية يمكنك التواصل مباشرة مع بوت ميدلايف على Telegram عبر @Medlife2024bot."

                : "For medical consultation, you can contact the MedLife Telegram bot at @Medlife2024bot.";

        }


        if (
            q.includes("2019") ||
            q.includes("متى تأسست") ||
            q.includes("founded")
        ) {

            return currentLanguage === "ar"

                ? "بدأت رحلة ميدلايف عام 2019 كمبادرة تطوعية طبية، ثم حصلت المؤسسة على الترخيص الرسمي عام 2023."

                : "MedLife started in 2019 as a medical volunteer initiative and received official registration in 2023.";

        }


        return currentLanguage === "ar"

            ? "شكراً لسؤالك! أنا MedLife AI حالياً أستطيع مساعدتك بالمعلومات العامة عن ميدلايف، برامجها، مبادراتها، التطوع والاستشارات الطبية."

            : "Thank you for your question! MedLife AI can currently help with general information about MedLife, its programs, initiatives, volunteering, and medical consultation.";

    }



    /* =====================================================
       10. AI FORM
    ====================================================== */

    if (aiForm && aiInput) {

        aiForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const question =
                    aiInput.value.trim();


                if (!question) return;


                addUserMessage(question);


                aiInput.value = "";


                setTimeout(() => {

                    const response =
                        getAIResponse(question);

                    addBotMessage(response);

                }, 500);

            }
        );


        /* Enter = send
           Shift + Enter = new line */

        aiInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    aiForm.requestSubmit();

                }

            }
        );

    }



    /* =====================================================
       11. AI SUGGESTION BUTTONS
    ====================================================== */

    const aiSuggestions =
        document.querySelectorAll(
            ".ai-suggestions button"
        );


    aiSuggestions.forEach((button) => {

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


                if (!question) return;


                openAI();


                if (aiInput) {

                    aiInput.value =
                        question;

                    aiForm?.requestSubmit();

                }

            }
        );

    });



    /* =====================================================
       12. SCROLL REVEAL
    ====================================================== */

    const revealElements =
        document.querySelectorAll(".reveal");


    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

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


        revealElements.forEach((element) => {

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach((element) => {

            element.classList.add("visible");

        });

    }



    /* =====================================================
       13. HEADER SCROLL EFFECT
    ====================================================== */

    const header =
        document.querySelector(".site-header");


    function handleHeaderScroll() {

        if (!header) return;


        if (window.scrollY > 30) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }


    window.addEventListener(
        "scroll",
        handleHeaderScroll,
        {
            passive: true
        }
    );


    handleHeaderScroll();



    /* =====================================================
       14. SMOOTH SCROLL
    ====================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

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


                    if (!target) return;


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });



    /* =====================================================
       15. ACTIVE NAVIGATION
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
        sections.length &&
        navLinks.length &&
        "IntersectionObserver" in window
    ) {

        const navObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        navLinks.forEach((link) => {

                            link.classList.remove(
                                "active"
                            );

                        });


                        const activeLink =
                            document.querySelector(
                                `.nav-links a[href="#${entry.target.id}"]`
                            );


                        if (activeLink) {

                            activeLink.classList.add(
                                "active"
                            );

                        }

                    });

                },
                {
                    rootMargin:
                        "-35% 0px -55% 0px"
                }
            );


        sections.forEach((section) => {

            navObserver.observe(section);

        });

    }



    /* =====================================================
       16. AI TEXTAREA AUTO HEIGHT
    ====================================================== */

    if (aiInput) {

        aiInput.addEventListener(
            "input",
            () => {

                aiInput.style.height = "auto";

                aiInput.style.height =
                    Math.min(
                        aiInput.scrollHeight,
                        120
                    ) + "px";

            }
        );

    }



    /* =====================================================
       17. PREVENT IMAGE DRAGGING
    ====================================================== */

    document
        .querySelectorAll("img")
        .forEach((image) => {

            image.setAttribute(
                "draggable",
                "false"
            );

        });



    /* =====================================================
       18. FINAL INITIALIZATION
    ====================================================== */

    console.log(
        "%cMedLife Syria",
        "font-size:20px;font-weight:bold;"
    );

    console.log(
        "MedLife website initialized successfully."
    );

});
