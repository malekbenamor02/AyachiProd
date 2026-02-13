-- Site-wide settings (key-value). Used e.g. for client access background image URL.
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value)
VALUES ('client_access_background_url', '')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Service role can update site_settings"
  ON site_settings FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE site_settings IS 'Site-wide key-value settings (e.g. client access background URL).';
