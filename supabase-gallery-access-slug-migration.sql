-- One permanent QR/link per gallery. No regeneration; old links invalid.
-- Run in Supabase SQL Editor.

-- Add unique access slug (set when gallery is created or on first QR load)
ALTER TABLE galleries
  ADD COLUMN IF NOT EXISTS access_slug TEXT UNIQUE;

-- Index for fast lookup on client authenticate
CREATE UNIQUE INDEX IF NOT EXISTS idx_galleries_access_slug ON galleries(access_slug) WHERE access_slug IS NOT NULL;

COMMENT ON COLUMN galleries.access_slug IS 'Single permanent slug for gallery access URL/QR; never regenerated.';
