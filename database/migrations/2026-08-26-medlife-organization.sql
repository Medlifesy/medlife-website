-- MedLife Organization: sections, cells, and scoped leadership assignments
CREATE TABLE IF NOT EXISTS medlife_org_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  section_type TEXT NOT NULL DEFAULT 'department' CHECK (section_type IN ('department','field','administration')),
  is_system INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medlife_org_cells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  is_system INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES medlife_org_sections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_medlife_org_cells_section ON medlife_org_cells(section_id);

CREATE TABLE IF NOT EXISTS medlife_org_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  role_key TEXT NOT NULL,
  section_id INTEGER,
  cell_id INTEGER,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES medlife_org_sections(id) ON DELETE SET NULL,
  FOREIGN KEY (cell_id) REFERENCES medlife_org_cells(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_medlife_org_assignments_member ON medlife_org_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_medlife_org_assignments_role ON medlife_org_assignments(role_key);
CREATE INDEX IF NOT EXISTS idx_medlife_org_assignments_cell ON medlife_org_assignments(cell_id);

INSERT OR IGNORE INTO medlife_org_sections(code,name_ar,name_en,section_type,is_system,sort_order) VALUES
('content_writing','كتابة محتوى','Content Writing','department',1,10),
('content_coordination','تنسيق محتوى','Content Coordination','department',1,20),
('design','التصميم','Design','department',1,30),
('montage','المونتاج','Video Editing','department',1,40),
('telegram','قسم التليجرام','Telegram','department',1,50),
('instagram','قسم الانستا','Instagram','department',1,60),
('it','قسم IT','IT','department',1,70),
('medical_consultations','الاستشارات الطبية','Medical Consultations','department',1,80),
('visual_media','الإعلام المرئي','Visual Media','department',1,90),
('university_media','إعلامي ضمن الجامعات','University Media','department',1,100),
('voice_over','Voice Over','Voice Over','department',1,110),
('field','القسم الميداني','Field Teams','field',1,120),
('general_administration','الإدارة العامة','General Administration','administration',1,130);

INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'plasma_cell',id,'Plasma Cell','Plasma Cell',1,10 FROM medlife_org_sections WHERE code='content_writing';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'neuron_cell',id,'Neuron Cell','Neuron Cell',1,20 FROM medlife_org_sections WHERE code='content_writing';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'astrocyte_cell',id,'Astrocyte Cell','Astrocyte Cell',1,30 FROM medlife_org_sections WHERE code='content_writing';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'leukocyte_cell',id,'Leukocyte Cell','Leukocyte Cell',1,40 FROM medlife_org_sections WHERE code='content_writing';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'stem_cells',id,'Stem Cells','Stem Cells',1,50 FROM medlife_org_sections WHERE code='content_writing';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'red_blood_cell',id,'Red Blood Cell','Red Blood Cell',1,60 FROM medlife_org_sections WHERE code='content_writing';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'heart_cell',id,'Heart Cell','Heart Cell',1,70 FROM medlife_org_sections WHERE code='content_writing';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'medical_blog',id,'المدونة الطبية','Medical Blog',1,80 FROM medlife_org_sections WHERE code='content_writing';

INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'tartous',id,'MedLife طرطوس','MedLife Tartous',1,10 FROM medlife_org_sections WHERE code='field';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'damascus',id,'MedLife دمشق','MedLife Damascus',1,20 FROM medlife_org_sections WHERE code='field';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'aleppo',id,'MedLife حلب','MedLife Aleppo',1,30 FROM medlife_org_sections WHERE code='field';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'hasakeh',id,'MedLife الحسكة','MedLife Hasakeh',1,40 FROM medlife_org_sections WHERE code='field';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'homs',id,'MedLife حمص','MedLife Homs',1,50 FROM medlife_org_sections WHERE code='field';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'latakia',id,'MedLife اللاذقية','MedLife Latakia',1,60 FROM medlife_org_sections WHERE code='field';
INSERT OR IGNORE INTO medlife_org_cells(code,section_id,name_ar,name_en,is_system,sort_order)
SELECT 'baniyas',id,'MedLife بانياس','MedLife Baniyas',1,70 FROM medlife_org_sections WHERE code='field';
