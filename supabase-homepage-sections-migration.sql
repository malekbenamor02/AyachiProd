-- Homepage project sections (Wedding Collection, Fashion Editorial, etc.)
-- Admin can add, edit, remove, and reorder. Images stored in R2.

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT '',
  year VARCHAR(20) NOT NULL DEFAULT '',
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_display_order ON homepage_sections(display_order);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Public read for homepage
CREATE POLICY "Homepage sections are public read"
  ON homepage_sections FOR SELECT
  USING (true);

COMMENT ON TABLE homepage_sections IS 'Homepage project/collection blocks; editable by admin.';
