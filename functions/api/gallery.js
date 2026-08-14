/**
 * =========================================================
 * MedLife Dynamic Gallery API
 * =========================================================
 *
 * Endpoint:
 * GET /api/gallery
 *
 * Source:
 * GitHub repository -> images/
 *
 * The API automatically finds image files inside:
 *
 * /images/
 *
 * No image filenames need to be written in index.html.
 * =========================================================
 */


export async function onRequestGet(context) {

    /*
     * =======================================================
     * GITHUB REPOSITORY SETTINGS
     * =======================================================
     */

    const OWNER =
        "Medlifesy";

    const REPOSITORY =
        "medlife-website";

    const BRANCH =
        "main";

    const IMAGE_FOLDER =
        "images";


    /*
     * GitHub Contents API URL
     */

    const githubUrl =
        `https://api.github.com/repos/${OWNER}/${REPOSITORY}/contents/${IMAGE_FOLDER}?ref=${BRANCH}`;


    try {

        /*
         * ===================================================
         * REQUEST GITHUB
         * ===================================================
         */

        const response =
            await fetch(
                githubUrl,
                {
                    method: "GET",

                    headers: {

                        "Accept":
                            "application/vnd.github+json",

                        "User-Agent":
                            "MedLife-Website",

                        /*
                         * Ask GitHub for the latest
                         * API version.
                         */
                        "X-GitHub-Api-Version":
                            "2022-11-28"
                    }
                }
            );


        /*
         * ===================================================
         * CHECK RESPONSE
         * ===================================================
         */

        if (!response.ok) {

            console.error(
                "GitHub Gallery API Error:",
                response.status,
                response.statusText
            );


            return jsonResponse(
                {
                    success: false,

                    error:
                        "Unable to load gallery images."
                },

                500
            );
        }


        /*
         * ===================================================
         * PARSE FILE LIST
         * ===================================================
         */

        const files =
            await response.json();


        if (
            !Array.isArray(files)
        ) {

            return jsonResponse(
                {
                    success: false,

                    error:
                        "Invalid gallery data."
                },

                500
            );
        }


        /*
         * ===================================================
         * ALLOWED IMAGE FORMATS
         * ===================================================
         */

        const allowedExtensions = [

            ".jpg",

            ".jpeg",

            ".png",

            ".webp",

            ".gif",

            ".avif"

        ];


        /*
         * ===================================================
         * FILTER IMAGE FILES
         * ===================================================
         */

        const imageFiles =
            files
                .filter(file => {

                    /*
                     * Only actual files.
                     */
                    if (
                        !file ||
                        file.type !== "file"
                    ) {

                        return false;
                    }


                    /*
                     * Get lowercase filename.
                     */
                    const name =
                        String(
                            file.name || ""
                        ).toLowerCase();


                    /*
                     * Check image extension.
                     */
                    return allowedExtensions.some(
                        extension =>
                            name.endsWith(
                                extension
                            )
                    );

                });


        /*
         * ===================================================
         * BUILD IMAGE DATA
         * ===================================================
         */

        const images =
            imageFiles.map(
                file => {

                    /*
                     * Raw GitHub URL.
                     *
                     * encodeURIComponent() protects
                     * filenames containing spaces or
                     * special characters.
                     */

                    const encodedFileName =
                        encodeURIComponent(
                            file.name
                        );


                    const imageUrl =
                        `https://raw.githubusercontent.com/${OWNER}/${REPOSITORY}/${BRANCH}/${IMAGE_FOLDER}/${encodedFileName}`;


                    return {

                        name:
                            file.name,

                        path:
                            file.path,

                        url:
                            imageUrl

                    };

                }
            );


        /*
         * ===================================================
         * SORT IMAGES
         * ===================================================
         *
         * Newest/latest-looking files first based on
         * GitHub file name.
         *
         * This is only alphabetical ordering, because
         * GitHub does not provide upload dates in the
         * Contents API response.
         */

        images.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                )
        );


        /*
         * ===================================================
         * RESPONSE
         * ===================================================
         */

        return jsonResponse({

            success:
                true,

            count:
                images.length,

            images:
                images

        });


    } catch (error) {

        /*
         * ===================================================
         * ERROR HANDLING
         * ===================================================
         */

        console.error(
            "MedLife Gallery Function Error:",
            error
        );


        return jsonResponse(

            {
                success:
                    false,

                error:
                    "Gallery service is temporarily unavailable."
            },

            500

        );
    }
}


/**
 * =========================================================
 * JSON RESPONSE HELPER
 * =========================================================
 */

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

                /*
                 * Cache response for 5 minutes.
                 *
                 * This reduces requests to GitHub.
                 */
                "Cache-Control":
                    "public, max-age=300"

            }

        }

    );
}
