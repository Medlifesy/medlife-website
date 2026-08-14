PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title_ar TEXT NOT NULL,
    title_en TEXT,

    excerpt_ar TEXT,
    excerpt_en TEXT,

    content_ar TEXT NOT NULL,
    content_en TEXT,

    category TEXT NOT NULL DEFAULT 'health-awareness',

    author_name TEXT NOT NULL,
    author_email TEXT,

    image_url TEXT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),

    rejection_reason TEXT,

    reviewed_by TEXT,
    reviewed_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    slug TEXT UNIQUE
);


CREATE INDEX IF NOT EXISTS idx_articles_status
ON articles(status);


CREATE INDEX IF NOT EXISTS idx_articles_created_at
ON articles(created_at);


CREATE INDEX IF NOT EXISTS idx_articles_slug
ON articles(slug);
