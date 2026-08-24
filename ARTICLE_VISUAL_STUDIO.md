# MedLife Article Visual Studio

The article admin visual workflow is intentionally **no-storage by default**.

- AI analyzes the article and suggests image placements.
- Wikimedia Commons results are used as remote image sources; only the image URL and attribution text are added to the article.
- The legacy GitHub image-upload controls are hidden on the enhanced admin page.
- A lightweight SVG illustration can be generated directly in the browser as a data URL. It is not uploaded to the repository.

External AI image generation is not treated as permanently free. Current hosted generators may require authentication, credits, or quotas. The UI therefore keeps a zero-storage open-image fallback instead of silently uploading generated media.
