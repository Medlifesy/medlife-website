```javascript
/**
 * MedLife AI Image Generator
 *
 * Endpoint:
 * POST /api/generate-image
 *
 * Request:
 * {
 *   prompt: "...",
 *   placement: "cover",
 *   purpose: "..."
 * }
 *
 * Uses:
 * OPENAI_API_KEY
 */

export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        /* =====================================================
           VALIDATION
        ===================================================== */

        if (!env.OPENAI_API_KEY) {

            return jsonResponse(
                {
                    success: false,
                    error:
                        "OPENAI_API_KEY is not configured."
                },
                500
            );
        }


        const body =
            await request.json();


        const prompt =
            typeof body.prompt === "string"
                ? body.prompt.trim()
                : "";


        const placement =
            typeof body.placement === "string"
                ? body.placement.trim()
                : "section";


        const purpose =
            typeof body.purpose === "string"
                ? body.purpose.trim()
                : "Medical illustration";


        if (!prompt) {

            return jsonResponse(
                {
                    success: false,
                    error:
                        "Image prompt is required."
                },
                400
            );
        }


        /* =====================================================
           MEDLIFE IMAGE STYLE
        ===================================================== */

        const finalPrompt = [
            "Create a professional medical editorial illustration",
            "for the MedLife Syria medical knowledge website.",
            "",
            "The image must be medically educational,",
            "accurate in visual concept, clean and modern,",
            "calm and professional, and suitable for a",
            "trusted medical charity website.",
            "",
            "Do not show gore.",
            "Do not show identifiable real people.",
            "Do not include logos.",
            "Do not include watermarks.",
            "Do not include unnecessary text.",
            "",
            "Use a modern medical illustration style",
            "with clear anatomy or concepts, balanced",
            "composition, professional lighting,",
            "and a clean background.",
            "",
            "Image placement:",
            placement,
            "",
            "Image purpose:",
            purpose,
            "",
            "Specific visual brief:",
            prompt,
            "",
            "Do not add captions, article titles, hospital names,",
            "organization names, or watermarks inside the image."
        ].join("\n");


        /* =====================================================
           OPENAI IMAGE GENERATION
        ===================================================== */

        const openAIResponse =
            await fetch(
                "https://api.openai.com/v1/images/generations",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${env.OPENAI_API_KEY}`

                    },

                    body: JSON.stringify({

                        model:
                            "gpt-image-1",

                        prompt:
                            finalPrompt,

                        size:
                            "1536x1024",

                        quality:
                            "medium",

                        output_format:
                            "png"

                    })

                }
            );


        const result =
            await openAIResponse.json();


        /* =====================================================
           OPENAI ERROR
        ===================================================== */

        if (!openAIResponse.ok) {

            console.error(
                "OpenAI image generation error:",
                result
            );

            return jsonResponse(
                {
                    success: false,
                    error:
                        "The image generation service returned an error."
                },
                502
            );
        }


        /* =====================================================
           EXTRACT IMAGE
        ===================================================== */

        const generated =
            Array.isArray(result.data)
                ? result.data[0]
                : null;


        const base64 =
            generated &&
            typeof generated.b64_json === "string"
                ? generated.b64_json
                : "";


        if (!base64) {

            console.error(
                "OpenAI returned no image data:",
                result
            );

            return jsonResponse(
                {
                    success: false,
                    error:
                        "No image was returned."
                },
                502
            );
        }


        /* =====================================================
           SUCCESS
        ===================================================== */

        return jsonResponse({

            success:
                true,

            image: {

                placement:
                    placement,

                purpose:
                    purpose,

                mime_type:
                    "image/png",

                b64_json:
                    base64

            }

        });

    } catch (error) {

        console.error(
            "MedLife image generation error:",
            error
        );

        return jsonResponse(
            {
                success: false,
                error:
                    error?.message ||
                    "Internal server error."
            },
            500
        );
    }
}


/* =========================================================
   JSON RESPONSE
========================================================= */

function jsonResponse(
    data,
    status = 200
) {

    return new Response(

        JSON.stringify(
            data
        ),

        {

            status:
                status,

            headers: {

                "Content-Type":
                    "application/json; charset=UTF-8",

                "Cache-Control":
                    "no-store"

            }

        }

    );
}
```
