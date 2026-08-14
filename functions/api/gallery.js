/**
 * =========================================================
 * MedLife Dynamic Gallery API
 * =========================================================
 *
 * Endpoint:
 * GET /api/gallery
 *
 * Searches recursively inside:
 *
 * /images/
 *
 * It automatically finds images inside:
 *
 * images/
 * images/articles/
 * images/campaigns/
 * images/projects/
 * images/team/
 * etc.
 *
 * No image filenames need to be added to index.html.
 * =========================================================
 */

export async function onRequestGet(context) {

    const OWNER = "Medlifesy";
    const REPOSITORY = "medlife-website";
    const BRANCH = "main";
    const IMAGE_FOLDER = "images";


    /*
     * GitHub Git Trees API
     *
     * recursive=1 means:
     * search inside all subfolders.
     */

    const githubUrl =
        `https://api.github.com/repos/${OWNER}/${REPOSITORY}/git/trees/${BRANCH}?recursive=1`;


    try {

        /* =====================================================
           REQUEST GITHUB
        ===================================================== */

        const response = await fetch(
            githubUrl,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/vnd.github+json",

                    "User-Agent":
                        "MedLife-Website",

                    "X-GitHub-Api-Version":
                        "2022-11-28"
                }
            }
        );


        if (!response.ok) {

            console.error(
                "GitHub Tree API error:",
                response.status,
                response.statusText
            );

            return jsonResponse(
                {
                    success: false,
                    error:
                        "Unable to read MedLife gallery."
                },
                500
            );
        }


        const data =
            await response.json();


        if (
            !Array.isArray(data.tree)
        ) {

            return jsonResponse(
                {
                    success: false,
                    error:
                        "Invalid GitHub tree response."
                },
                500
            );
        }


        /* =====================================================
           ALLOWED IMAGE FORMATS
        ===================================================== */

        const allowedExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif",
            ".avif"
        ];


        /* =====================================================
           FIND ALL IMAGES INSIDE /images/
        ===================================================== */

        const images =
            data.tree
                .filter(item => {

                    /*
                     * Must be a file.
                     */
                    if (
                        !item ||
                        item.type !== "blob"
                    ) {
                        return false;
                    }


                    /*
                     * Must be inside images/
                     */
                    if (
                        !item.path.startsWith(
                            `${IMAGE_FOLDER}/`
                        )
                    ) {
                        return false;
                    }


                    /*
                     * Check extension.
                     */
                    const fileName =
                        item.path.toLowerCase();


                    return allowedExtensions.some(
                        extension =>
                            fileName.endsWith(
                                extension
                            )
                    );

                })
                .map(item => {

                    /*
                     * Example:
                     *
                     * images/campaigns/photo.jpg
                     *
                     * becomes:
                     *
                     * https://raw.githubusercontent.com/
                     * Medlifesy/medlife-website/main/
                     * images/campaigns/photo.jpg
                     *
                     */

                    const encodedPath =
                        item.path
                            .split("/")
                            .map(
                                part =>
                                    encodeURIComponent(
                                        part
                                    )
                            )
                            .join("/");


                    const imageUrl =
                        `https://raw.githubusercontent.com/${OWNER}/${REPOSITORY}/${BRANCH}/${encodedPath}`;


                    return {

                        name:
                            item.path
                                .split("/")
                                .pop(),

                        path:
                            item.path,

                        url:
                            imageUrl

                    };

                });


        /* =====================================================
           SORT
        ===================================================== */

        images.sort(
            (a, b) =>
                a.path.localeCompare(
                    b.path,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                )
        );


        /* =====================================================
           RESPONSE
        ===================================================== */

        return jsonResponse({

            success:
                true,

            count:
                images.length,

            images:
                images

        });


    } catch (error) {

        console.error(
            "MedLife Gallery Function Error:",
            error
        );


        return jsonResponse(
            {
                success: false,

                error:
                    "Gallery service is temporarily unavailable."
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
        JSON.stringify(data),
        {
            status: status,

            headers: {

                "Content-Type":
                    "application/json; charset=UTF-8",

                /*
                 * Cache for 5 minutes.
                 */
                "Cache-Control":
                    "public, max-age=300"
            }
        }
    );
}
