CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,

    author_name TEXT NOT NULL,
    author_role TEXT,

    category TEXT DEFAULT 'Medical',

    image_url TEXT,

    status TEXT NOT NULL DEFAULT 'pending',

    rejection_reason TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_articles_status
ON articles(status);

CREATE INDEX IF NOT EXISTS idx_articles_created_at
ON articles(created_at);
