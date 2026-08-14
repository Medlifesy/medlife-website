/* =========================================================
   MEDLIFE — ARTICLE SUBMISSION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("articleSubmitForm");

    const message =
        document.getElementById("submitMessage");


    if (!form) return;


    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        const submitButton =
            form.querySelector("button[type='submit']");


        submitButton.disabled = true;

        submitButton.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i>
             جاري الإرسال...`;


        const formData =
            new FormData(form);


        const data = {

            author_name:
                formData.get("author_name"),

            author_email:
                formData.get("author_email"),

            title_ar:
                formData.get("title_ar"),

            title_en:
                formData.get("title_en"),

            category:
                formData.get("category"),

            excerpt_ar:
                formData.get("excerpt_ar"),

            excerpt_en:
                formData.get("excerpt_en"),

            content_ar:
                formData.get("content_ar"),

            content_en:
                formData.get("content_en"),

            image_url:
                formData.get("image_url") || null
        };


        try {

            const response =
                await fetch("/api/articles", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)
                });


            const result =
                await response.json();


            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
                    "حدث خطأ أثناء إرسال المقال."
                );
            }


            message.className =
                "submit-message success";


            message.textContent =
                "تم إرسال المقال بنجاح! المقال الآن بانتظار مراجعة فريق ميدلايف.";


            form.reset();


        } catch (error) {

            console.error(error);


            message.className =
                "submit-message error";


            message.textContent =
                error.message ||
                "تعذر إرسال المقال. حاول مرة أخرى.";

        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                `<i class="fa-solid fa-paper-plane"></i>
                 إرسال المقال للمراجعة`;
        }

    });

});
