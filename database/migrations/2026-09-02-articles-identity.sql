-- MedLife Articles Identity
-- Adds a stable unique internal code for every article.
-- Existing article URLs/slugs are preserved.

ALTER TABLE articles ADD COLUMN article_code TEXT;

UPDATE articles
SET article_code = 'ML-ART-' || printf('%08d', id)
WHERE article_code IS NULL OR trim(article_code) = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_article_code_unique
ON articles(article_code);

CREATE TRIGGER IF NOT EXISTS articles_article_code_after_insert
AFTER INSERT ON articles
FOR EACH ROW
WHEN NEW.article_code IS NULL OR trim(NEW.article_code) = ''
BEGIN
  UPDATE articles
  SET article_code = 'ML-ART-' || printf('%08d', NEW.id)
  WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_articles_article_code_lookup
ON articles(article_code);
