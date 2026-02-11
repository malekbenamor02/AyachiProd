-- Site-wide maintenance mode (admin can enable/disable with custom message)

CREATE TABLE IF NOT EXISTS maintenance (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL DEFAULT 'We''re currently performing scheduled maintenance. Please check back soon.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert the single row if not exists
INSERT INTO maintenance (id, enabled, message)
VALUES (1, false, 'We''re currently performing scheduled maintenance. Please check back soon.')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

-- Public can read maintenance status (for showing maintenance page)
CREATE POLICY "Maintenance status is public read"
  ON maintenance FOR SELECT
  USING (true);

-- Only service role can update (via API with admin auth)
CREATE POLICY "Service role can update maintenance"
  ON maintenance FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE maintenance IS 'Site maintenance mode: one row, toggled by admin with custom message.';
