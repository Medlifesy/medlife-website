-- =========================================================
-- MedLife Members Platform
-- Designed for ~700+ volunteers and future growth
-- Existing table: members
-- Existing volunteers remain in members as applications/records.
-- Account creation should happen only after admin approval.
-- =========================================================

PRAGMA foreign_keys = ON;

-- =========================================================
-- MEMBER ACCOUNTS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    is_active INTEGER NOT NULL DEFAULT 0,
    email_verified INTEGER NOT NULL DEFAULT 0,
    last_login_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_accounts_email
ON member_accounts(email);

CREATE INDEX IF NOT EXISTS idx_member_accounts_member_id
ON member_accounts(member_id);

-- =========================================================
-- LOGIN SESSIONS
-- Store only hashed session tokens, never raw tokens.
-- =========================================================

CREATE TABLE IF NOT EXISTS member_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME,
    FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_sessions_token_hash
ON member_sessions(token_hash);

CREATE INDEX IF NOT EXISTS idx_member_sessions_expires_at
ON member_sessions(expires_at);

-- =========================================================
-- MEMBER PROFILE
-- Public-facing volunteer portfolio/profile.
-- =========================================================

CREATE TABLE IF NOT EXISTS member_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL UNIQUE,
    username TEXT UNIQUE COLLATE NOCASE,
    display_name TEXT NOT NULL,
    headline TEXT,
    bio TEXT,
    profile_image_url TEXT,
    cover_image_url TEXT,
    profession TEXT,
    university TEXT,
    graduation_year INTEGER,
    city TEXT,
    skills TEXT,
    phone_visibility TEXT NOT NULL DEFAULT 'private',
    email_visibility TEXT NOT NULL DEFAULT 'private',
    profile_visibility TEXT NOT NULL DEFAULT 'public',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_profiles_username
ON member_profiles(username);

CREATE INDEX IF NOT EXISTS idx_member_profiles_city
ON member_profiles(city);

-- =========================================================
-- MEMBER LINKS / PORTFOLIO LINKS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_links_member_id
ON member_links(member_id);

-- =========================================================
-- ACHIEVEMENTS / CERTIFICATES / CONTRIBUTIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    achievement_date DATE,
    organization TEXT,
    certificate_url TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES member_accounts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_member_achievements_member_id
ON member_achievements(member_id);

CREATE INDEX IF NOT EXISTS idx_member_achievements_status
ON member_achievements(status);

-- =========================================================
-- SOCIAL POSTS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'members',
    status TEXT NOT NULL DEFAULT 'published',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_posts_member_id
ON member_posts(member_id);

CREATE INDEX IF NOT EXISTS idx_member_posts_created_at
ON member_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_posts_status
ON member_posts(status);

-- =========================================================
-- COMMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES member_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_comments_post_id
ON member_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_member_comments_member_id
ON member_comments(member_id);

-- =========================================================
-- LIKES
-- One like per member per post.
-- =========================================================

CREATE TABLE IF NOT EXISTS member_post_likes (
    post_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, member_id),
    FOREIGN KEY (post_id) REFERENCES member_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_post_likes_member_id
ON member_post_likes(member_id);

-- =========================================================
-- OPTIONAL FOLLOWS
-- Lets volunteers follow other volunteers later.
-- =========================================================

CREATE TABLE IF NOT EXISTS member_follows (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id),
    FOREIGN KEY (follower_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_follows_following
ON member_follows(following_id);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    related_post_id INTEGER,
    related_comment_id INTEGER,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (related_post_id) REFERENCES member_posts(id) ON DELETE SET NULL,
    FOREIGN KEY (related_comment_id) REFERENCES member_comments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_member_notifications_member_id
ON member_notifications(member_id, is_read, created_at DESC);

-- =========================================================
-- MODERATION / REPORTS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_member_id INTEGER NOT NULL,
    reported_member_id INTEGER,
    post_id INTEGER,
    comment_id INTEGER,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    resolved_by INTEGER,
    resolved_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_member_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (post_id) REFERENCES member_posts(id) ON DELETE SET NULL,
    FOREIGN KEY (comment_id) REFERENCES member_comments(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES member_accounts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_member_reports_status
ON member_reports(status, created_at DESC);

-- =========================================================
-- AUDIT LOG
-- Useful for admin/security actions.
-- =========================================================

CREATE TABLE IF NOT EXISTS member_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id INTEGER,
    metadata TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_member_audit_log_created_at
ON member_audit_log(created_at DESC);

-- =========================================================
-- CLEANUP INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_members_status
ON members(status);

CREATE INDEX IF NOT EXISTS idx_members_created_at
ON members(created_at DESC);
