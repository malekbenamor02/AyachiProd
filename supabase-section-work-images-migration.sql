-- Work images under each section (shown below the poster on the work detail page)
-- Admin can add, remove, and reorder per section.

CREATE TABLE IF NOT EXISTS section_work_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_section_work_images_section ON section_work_images(section_id);
CREATE INDEX IF NOT EXISTS idx_section_work_images_order ON section_work_images(section_id, display_order);

ALTER TABLE section_work_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Section work images public read"
  ON section_work_images FOR SELECT USING (true);

COMMENT ON TABLE section_work_images IS 'Images shown below the poster on work detail; one section has many work images.';
