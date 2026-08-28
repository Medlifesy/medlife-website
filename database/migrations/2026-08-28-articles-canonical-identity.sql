-- MedLife Articles Canonical Identity
-- Persist the public identity of every article in the Articles Data Layer.
-- Existing articles keep stable article-{id} slugs so their current public URLs remain unchanged.

ALTER TABLE articles ADD COLUMN slug TEXT;
ALTER TABLE articles ADD COLUMN canonical_path TEXT;

UPDATE articles
SET slug = 'article-' || id,
    canonical_path = '/articles/article-' || id
WHERE slug IS NULL OR trim(slug) = '' OR canonical_path IS NULL OR trim(canonical_path) = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug_unique ON articles(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_canonical_path_unique ON articles(canonical_path);
CREATE INDEX IF NOT EXISTS idx_articles_published_slug ON articles(status, slug);
