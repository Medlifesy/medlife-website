export async function onRequestGet(context) {
    const OWNER = "Medlifesy";
    const REPOSITORY = "medlife-website";
    const BRANCH = "main";
    const IMAGE_FOLDER = "images";
    const GITHUB_URL = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/git/trees/${BRANCH}?recursive=1`;

    const categorize = (name = "") => {
        const n = name.toLowerCase();
        if (/training|course|lecture|workshop|education|تدريب|دورة|كورس|محاضرة|تعليم/.test(n)) return "training";
        if (/health|medical|screen|screening|doctor|clinic|medicine|طب|صحة|طبي|عيادة|فحص|سكر|ضغط/.test(n)) return "health";
        if (/ramadan|eid|child|children|hospital|gift|food|aid|human|رمضان|عيد|طفل|أطفال|مشفى|هدايا|سلة|إنساني/.test(n)) return "humanitarian";
        return "community";
    };

    try {
        const response = await fetch(GITHUB_URL, {
            headers: {
                "Accept": "application/vnd.github+json",
                "User-Agent": "MedLife-Website",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        });
        if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data.tree)) throw new Error("Invalid GitHub tree response.");

        const allowed = /\.(jpe?g|png|webp|gif|avif)$/i;
        const images = data.tree.filter(item => {
            if (!item || item.type !== "blob") return false;
            const path = String(item.path || "");
            if (!path.startsWith(`${IMAGE_FOLDER}/`)) return false;
            if (path.startsWith(`${IMAGE_FOLDER}/logo/`)) return false;
            const fileName = path.split("/").pop() || "";
            if (/^logo\.(png|jpe?g|webp|gif)$/i.test(fileName)) return false;
            return allowed.test(path);
        }).map(item => {
            const encodedPath = item.path.split("/").map(part => encodeURIComponent(part)).join("/");
            const name = item.path.split("/").pop();
            return {
                name,
                path: item.path,
                category: categorize(name),
                url: `https://raw.githubusercontent.com/${OWNER}/${REPOSITORY}/${BRANCH}/${encodedPath}`
            };
        });

        images.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: "base" }));

        return new Response(JSON.stringify({ success: true, count: images.length, images }), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Cache-Control": "public, max-age=300"
            }
        });
    } catch (error) {
        console.error("MedLife Gallery Error:", error);
        return new Response(JSON.stringify({ success: false, count: 0, images: [], error: "Unable to load gallery." }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }
}
