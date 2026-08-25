-- MedLife Editorial Studio: structured references + immutable revision history
CREATE TABLE IF NOT EXISTS article_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    organization TEXT,
    reference_type TEXT,
    year INTEGER,
    url TEXT,
    doi TEXT,
    citation_text TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0,
    verified_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verified_status IN ('unverified','verified','needs_review','broken')),
    verification_note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_article_references_article ON article_references(article_id);
CREATE INDEX IF NOT EXISTS idx_article_references_status ON article_references(verified_status);

CREATE TABLE IF NOT EXISTS article_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    editor_account_id INTEGER,
    editor_role TEXT,
    revision_type TEXT NOT NULL DEFAULT 'manual',
    title_ar TEXT,
    title_en TEXT,
    excerpt_ar TEXT,
    excerpt_en TEXT,
    content_ar TEXT,
    content_en TEXT,
    change_summary TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_article_revisions_article ON article_revisions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_revisions_created ON article_revisions(created_at);
