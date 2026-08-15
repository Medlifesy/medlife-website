PRAGMA foreign_keys = ON;

-- Existing D1 databases created from migration 001 already have a flexible
-- members table. These ALTER statements make the authentication fields
-- explicit and idempotent for deployments that do not run application setup.
ALTER TABLE members ADD COLUMN account_email TEXT;
ALTER TABLE members ADD COLUMN password_hash TEXT;
ALTER TABLE members ADD COLUMN account_status TEXT DEFAULT 'pending';
ALTER TABLE members ADD COLUMN member_code TEXT;
ALTER TABLE members ADD COLUMN employment_status TEXT;
ALTER TABLE members ADD COLUMN consultation_specialty TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_account_email_unique
ON members(account_email)
WHERE account_email IS NOT NULL AND account_email <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_member_code_unique
ON members(member_code)
WHERE member_code IS NOT NULL AND member_code <> '';

CREATE TABLE IF NOT EXISTS new_member_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    mother_name TEXT NOT NULL,
    national_id TEXT NOT NULL UNIQUE,
    gender TEXT NOT NULL,
    email TEXT NOT NULL,
    account_password_hash TEXT NOT NULL,
    phone TEXT NOT NULL,
    governorate TEXT NOT NULL,
    address TEXT,
    academic_status TEXT NOT NULL,
    university TEXT,
    faculty TEXT,
    study_year TEXT,
    graduation_year TEXT,
    profession TEXT,
    workplace TEXT,
    resident_specialty TEXT,
    residency_year TEXT,
    residency_hospital TEXT,
    doctor_graduation_year TEXT,
    doctor_specialty TEXT,
    doctor_workplace TEXT,
    specialty TEXT,
    specialist_graduation_year TEXT,
    specialist_workplace TEXT,
    interest TEXT NOT NULL,
    motivation TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_new_member_applications_status
ON new_member_applications(status);
CREATE INDEX IF NOT EXISTS idx_new_member_applications_email
ON new_member_applications(email);
