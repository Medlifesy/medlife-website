-- =========================================================
-- MEDLIFE ARTICLES - DUPLICATE CLEANUP
-- Date: 2026-08-16
--
-- Purpose:
--   Remove duplicate article rows while keeping the newest row
--   for each normalized Arabic title, then prevent future exact
--   title duplicates at database level.
--
-- IMPORTANT:
--   Run this migration once against the production
--   medlife-articles D1 database.
-- =========================================================

BEGIN TRANSACTION;

-- Keep the newest row (highest id) for duplicate titles.
DELETE FROM articles
WHERE id NOT IN (
    SELECT MAX(id)
    FROM articles
    WHERE title_ar IS NOT NULL
      AND trim(title_ar) <> ''
    GROUP BY lower(trim(title_ar))
)
AND title_ar IS NOT NULL
AND trim(title_ar) <> '';

-- Prevent future duplicate Arabic article titles.
CREATE UNIQUE INDEX IF NOT EXISTS uq_articles_title_ar
ON articles(lower(trim(title_ar)));

COMMIT;
