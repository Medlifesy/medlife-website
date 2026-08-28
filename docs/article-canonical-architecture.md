# MedLife Articles Canonical Architecture

## Contract

- Public article URL: `/articles/{slug}`
- `article-reader-v5.html` is an internal renderer only.
- Articles API is the source of truth for article identity and content.
- Every article exposes `id`, `slug`, `status`, `canonical_path`, `title`, `content`, `references`, `created_at`, `updated_at`, and `published_at`.
- Public links must use `canonical_path` (or `/articles/${slug}` when constructing a link).
- No article-specific redirects are permitted.

## Routing

`/articles/{slug}` is internally rewritten to the renderer without changing the browser URL. The renderer reads the slug from the rewritten path/query and requests the Articles API by slug.

## Publish

Admin publish must persist a stable slug and canonical path before changing status to `published`, then return the canonical public URL. `article-reader-v5` must never be persisted as `public_url` or `canonical_url`.

## Preview

Preview uses the same renderer and rendering contract as published articles. Only the article lifecycle state differs (`draft` versus `published`).
