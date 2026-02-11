-- Section categories (admin can add; sections select from list)
-- Date as month + year for each section

-- Categories list (e.g. Wedding, Fashion, Portrait)
CREATE TABLE IF NOT EXISTS section_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_section_categories_order ON section_categories(display_order);

ALTER TABLE section_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Section categories public read"
  ON section_categories FOR SELECT USING (true);

COMMENT ON TABLE section_categories IS 'Categories for homepage sections; admin can add, sections select one.';

-- Add category_id and month/year to sections (keep category/year for backward compat)
ALTER TABLE homepage_sections
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES section_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS section_month INTEGER CHECK (section_month >= 1 AND section_month <= 12),
  ADD COLUMN IF NOT EXISTS section_year INTEGER;

CREATE INDEX IF NOT EXISTS idx_homepage_sections_category ON homepage_sections(category_id);
