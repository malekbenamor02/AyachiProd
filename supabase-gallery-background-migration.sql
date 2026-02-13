-- Per-gallery background image for the client password/access screen.
-- When set, clients see this image behind the password form; when NULL, background is white.
ALTER TABLE galleries
  ADD COLUMN IF NOT EXISTS client_access_background_url TEXT DEFAULT NULL;

COMMENT ON COLUMN galleries.client_access_background_url IS 'Optional image URL for client access (password) screen background. NULL = white default.';
