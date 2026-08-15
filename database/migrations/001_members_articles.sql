PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- =========================================================
-- MEDLIFE D1 MIGRATION 001
-- Members + Articles
--
-- This migration is intended for a fresh D1 database OR for
-- the current members table already used by the project.
-- Existing legacy member columns are intentionally preserved.
-- =========================================================

CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    mother_name TEXT,
    national_id TEXT,
    email TEXT,
    phone TEXT,
    gender TEXT,
    education_level TEXT,
    study_year TEXT,
    resident_specialty TEXT,
    residency_year TEXT,
    residency_hospital TEXT,
    university TEXT,
    address TEXT,
    governorate TEXT,
    medlife_role TEXT,
    cell TEXT,
    field_location TEXT,
    join_date TEXT,
    volunteer_certificate TEXT NOT NULL DEFAULT 'no',
    membership_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_national_id_unique
ON members(national_id)
WHERE national_id IS NOT NULL AND national_id <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_membership_number_unique
ON members(membership_number)
WHERE membership_number IS NOT NULL AND membership_number <> '';

CREATE INDEX IF NOT EXISTS idx_members_full_name ON members(full_name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_governorate ON members(governorate);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(medlife_role);
CREATE INDEX IF NOT EXISTS idx_members_cell ON members(cell);
CREATE INDEX IF NOT EXISTS idx_members_field_location ON members(field_location);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_join_date ON members(join_date);

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
    status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_member_id) REFERENCES members(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_member_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);

CREATE TRIGGER IF NOT EXISTS trg_members_updated_at
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
    UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_articles_updated_at
AFTER UPDATE ON articles
FOR EACH ROW
BEGIN
    UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

COMMIT;
