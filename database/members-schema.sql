-- =========================================================
-- MEDLIFE MEMBERS DATABASE
-- Database: medlife-db
-- Binding: MEMBERS_DB
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
    medlife_role TEXT NOT NULL CHECK (medlife_role IN ('volunteer','supervisor','general_supervisor','assistant_supervisor')),
    cell TEXT NOT NULL CHECK (cell IN ('plasma_cell','neuron_cell','astrocyte_cell','leukocyte_cell','heart_cell','red_blood_cell','blog','design','video_editing','visual_media','instagram','telegram','administration','voice_over','coordination','university_media','field','consultations')),
    field_location TEXT,
    join_date TEXT NOT NULL,
    volunteer_certificate TEXT NOT NULL DEFAULT 'no' CHECK (volunteer_certificate IN ('yes','no')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','inactive')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

CREATE TRIGGER IF NOT EXISTS members_updated_at
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
    UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
