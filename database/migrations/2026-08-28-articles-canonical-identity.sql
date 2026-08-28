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

-- New rows always receive a canonical identity even if an older client omits it.
CREATE TRIGGER IF NOT EXISTS articles_canonical_identity_after_insert
AFTER INSERT ON articles
FOR EACH ROW
WHEN NEW.slug IS NULL OR trim(NEW.slug) = '' OR NEW.canonical_path IS NULL OR trim(NEW.canonical_path) = ''
BEGIN
  UPDATE articles
  SET slug = CASE WHEN NEW.slug IS NULL OR trim(NEW.slug) = '' THEN 'article-' || NEW.id ELSE NEW.slug END,
      canonical_path = CASE WHEN NEW.canonical_path IS NULL OR trim(NEW.canonical_path) = '' THEN '/articles/' || CASE WHEN NEW.slug IS NULL OR trim(NEW.slug) = '' THEN 'article-' || NEW.id ELSE NEW.slug END ELSE NEW.canonical_path END
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS articles_canonical_path_after_update
AFTER UPDATE OF slug, canonical_path ON articles
FOR EACH ROW
WHEN NEW.slug IS NOT NULL AND trim(NEW.slug) <> '' AND NEW.canonical_path <> '/articles/' || NEW.slug
BEGIN
  UPDATE articles SET canonical_path = '/articles/' || NEW.slug WHERE id = NEW.id;
END;
