/**
 * MedLife Gallery API
 *
 * Reads all image files from:
 * https://github.com/Medlifesy/medlife-website/tree/main/images
 *
 * Endpoint:
 * GET /api/gallery
 */

export async function onRequestGet(context) {

    const repoOwner = "Medlifesy";
    const repoName = "medlife-website";
    const branch = "main";
    const imageFolder = "images";

    const githubApiUrl =
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imageFolder}?ref=${branch}`;


    try {

        const response = await fetch(
            githubApiUrl,
            {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "MedLife-Website"
                }
            }
        );


        if (!response.ok) {

            console.error(
                "GitHub API error:",
                response.status,
                response.statusText
            );

            return jsonResponse(
                {
                    success: false,
                    error: "Unable to read gallery images."
                },
                500
            );
        }


        const files = await response.json();


        if (!Array.isArray(files)) {

            return jsonResponse(
                {
                    success: false,
                    error: "Invalid gallery response."
                },
                500
            );
        }


        /*
         * Supported image formats.
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
         * Keep only files that are images.
         */
        const images = files
            .filter(file => {

                if (
                    !file ||
                    file.type !== "file"
                ) {
                    return false;
                }


                const fileName =
                    String(
                        file.name || ""
                    ).toLowerCase();


                return allowedExtensions.some(
                    extension =>
                        fileName.endsWith(
                            extension
                        )
                );
            })
            .map(file => {

                return {
                    name: file.name,

                    url:
                        `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${imageFolder}/${encodeURIComponent(file.name)}`,

                    path:
                        file.path
                };
            });


        return jsonResponse({
            success: true,

            count:
                images.length,

            images:
                images
        });


    } catch (error) {

        console.error(
            "Gallery function error:",
            error
        );


        return jsonResponse(
            {
                success: false,
                error: "Gallery service unavailable."
            },
            500
        );
    }
}


/**
 * JSON response helper
 */
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
                 * Cache the gallery for a few minutes.
                 * This prevents excessive GitHub API requests.
                 */
                "Cache-Control":
                    "public, max-age=300"
            }
        }
    );
}
