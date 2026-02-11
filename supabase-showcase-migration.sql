-- Showcase / Marquee section images (homepage horizontal image strip)
-- Admin can add, remove, and reorder these images.

CREATE TABLE IF NOT EXISTS showcase_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_showcase_images_display_order ON showcase_images(display_order);

-- RLS: allow public read, admin write (backend uses service role or admin JWT)
ALTER TABLE showcase_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for homepage)
CREATE POLICY "Showcase images are public read"
  ON showcase_images FOR SELECT
  USING (true);

-- Only backend with service role can insert/update/delete (no policy = only service role)
-- So we don't create INSERT/UPDATE/DELETE policies here; the API uses service key.

COMMENT ON TABLE showcase_images IS 'Images for the homepage marquee/showcase strip; editable by admin.';
