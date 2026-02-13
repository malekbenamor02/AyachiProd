-- Per-gallery custom message shown to client after password, before gallery (optional).
ALTER TABLE galleries
  ADD COLUMN IF NOT EXISTS client_access_intro_message TEXT DEFAULT NULL;

COMMENT ON COLUMN galleries.client_access_intro_message IS 'Optional message shown on white transition page after password, before gallery. Admin can pick a preset or write custom.';
