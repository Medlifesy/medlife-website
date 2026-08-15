PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- =========================================================
-- MEDLIFE DATABASE
-- Cloudflare D1 / SQLite
-- =========================================================

-- =========================================================
-- 1. MEMBERS
-- =========================================================

CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    membership_number TEXT UNIQUE,

    full_name TEXT NOT NULL,
    mother_name TEXT NOT NULL,
    national_id TEXT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),

    education_level TEXT NOT NULL,
    study_year TEXT,
    university TEXT,

    resident_specialty TEXT,
    residency_year TEXT,
    residency_hospital TEXT,

    address TEXT,
    governorate TEXT NOT NULL,

    medlife_role TEXT NOT NULL CHECK (
        medlife_role IN (
            'volunteer',
            'supervisor',
            'general_supervisor',
            'assistant_supervisor'
        )
    ),

    cell TEXT NOT NULL CHECK (
        cell IN (
            'plasma_cell',
            'neuron_cell',
            'astrocyte_cell',
            'leukocyte_cell',
            'heart_cell',
            'red_blood_cell',
            'blog',
            'design',
            'video_editing',
            'visual_media',
            'instagram',
            'telegram',
            'administration',
            'voice_over',
            'coordination',
            'university_media',
            'field'
        )
    ),

    field_location TEXT,

    join_date TEXT NOT NULL,

    volunteer_certificate TEXT NOT NULL DEFAULT 'no'
        CHECK (volunteer_certificate IN ('yes', 'no')),

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        (cell = 'field' AND field_location IS NOT NULL)
        OR
        (cell != 'field')
    )
);

CREATE INDEX IF NOT EXISTS idx_members_full_name ON members(full_name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_governorate ON members(governorate);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(medlife_role);
CREATE INDEX IF NOT EXISTS idx_members_cell ON members(cell);
CREATE INDEX IF NOT EXISTS idx_members_field_location ON members(field_location);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_join_date ON members(join_date);

-- =========================================================
-- 2. ARTICLES
-- =========================================================

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title_ar TEXT NOT NULL,
    title_en TEXT,

    content_ar TEXT NOT NULL,
    content_en TEXT,

    excerpt_ar TEXT,
    excerpt_en TEXT,

    author_member_id INTEGER,
    author_name TEXT NOT NULL,
    author_email TEXT,

    category TEXT,
    image_url TEXT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'published', 'rejected')),

    rejection_reason TEXT,
    published_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (author_member_id)
        REFERENCES members(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_member_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);

-- =========================================================
-- AUTOMATIC updated_at
-- =========================================================

CREATE TRIGGER IF NOT EXISTS trg_members_updated_at
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
    UPDATE members
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_articles_updated_at
AFTER UPDATE ON articles
FOR EACH ROW
BEGIN
    UPDATE articles
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;

COMMIT;
