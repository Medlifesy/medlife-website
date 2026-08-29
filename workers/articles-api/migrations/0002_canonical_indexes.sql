-- MedLife Articles: canonical URL indexes
-- The slug and canonical_path columns already exist in the live D1 database.
-- This migration makes their uniqueness explicit and repeatable.
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug_unique ON articles(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_canonical_path_unique ON articles(canonical_path);
