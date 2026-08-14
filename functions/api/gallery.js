export async function onRequestGet(context) {

    const OWNER = "Medlifesy";
    const REPOSITORY = "medlife-website";
    const BRANCH = "main";

    const IMAGE_FOLDER = "images";

    const GITHUB_URL =
        `https://api.github.com/repos/${OWNER}/${REPOSITORY}/git/trees/${BRANCH}?recursive=1`;

    try {

        const response = await fetch(
            GITHUB_URL,
            {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "MedLife-Website",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `GitHub API returned ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data.tree)) {
            throw new Error(
                "Invalid GitHub tree response."
            );
        }

        const allowedExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif",
            ".avif"
        ];

        const images = data.tree
            .filter(item => {

                if (!item || item.type !== "blob") {
                    return false;
                }

                const path =
                    String(item.path || "");

                /*
                 * Must be inside images/
                 */
                if (
                    !path.startsWith(
                        `${IMAGE_FOLDER}/`
                    )
                ) {
                    return false;
                }

                /*
                 * Never include anything inside:
                 * images/logo/
                 */
                if (
                    path.startsWith(
                        `${IMAGE_FOLDER}/logo/`
                    )
                ) {
                    return false;
                }

                /*
                 * Never include files containing
                 * "logo" as filename.
                 */
                const fileName =
                    path
                        .split("/")
                        .pop()
                        .toLowerCase();

                if (
                    fileName === "logo.png" ||
                    fileName === "logo.jpg" ||
                    fileName === "logo.jpeg" ||
                    fileName === "logo.webp" ||
                    fileName === "logo.gif"
                ) {
                    return false;
                }

                /*
                 * Check extension.
                 */
                return allowedExtensions.some(
                    extension =>
                        path.toLowerCase().endsWith(
                            extension
                        )
                );

            })
            .map(item => {

                const encodedPath =
                    item.path
                        .split("/")
                        .map(
                            part =>
                                encodeURIComponent(part)
                        )
                        .join("/");

                return {
                    name:
                        item.path
                            .split("/")
                            .pop(),

                    path:
                        item.path,

                    url:
                        `https://raw.githubusercontent.com/${OWNER}/${REPOSITORY}/${BRANCH}/${encodedPath}`
                };

            });

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

        return new Response(
            JSON.stringify({
                success: true,
                count: images.length,
                images: images
            }),
            {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/json; charset=UTF-8",

                    "Cache-Control":
                        "public, max-age=300"
                }
            }
        );

    } catch (error) {

        console.error(
            "MedLife Gallery Error:",
            error
        );

        return new Response(
            JSON.stringify({
                success: false,
                count: 0,
                images: [],
                error:
                    "Unable to load gallery."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json; charset=UTF-8"
                }
            }
        );
    }
}
