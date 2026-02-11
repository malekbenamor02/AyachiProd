-- Book sessions: clients request a session; admin approves/declines and sees calendar
-- Categories use existing section_categories (Wedding, Fashion, Portrait, etc.)

CREATE TABLE IF NOT EXISTS book_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES section_categories(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  session_time TIME, -- optional time of day
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'declined')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_sessions_status ON book_sessions(status);
CREATE INDEX IF NOT EXISTS idx_book_sessions_session_date ON book_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_book_sessions_created_at ON book_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_book_sessions_category ON book_sessions(category_id);

ALTER TABLE book_sessions ENABLE ROW LEVEL SECURITY;

-- Public can insert (submit booking form)
CREATE POLICY "Anyone can create book session"
  ON book_sessions FOR INSERT
  WITH CHECK (true);

-- Public cannot read others' bookings
-- Admin read/update via service role or authenticated admin (handled in API with Supabase service key)
CREATE POLICY "No public read on book_sessions"
  ON book_sessions FOR SELECT
  USING (false);

-- Allow service role / backend to do everything (API uses service key)
-- If you use Supabase Auth for admin, add:
-- CREATE POLICY "Admin can read all book_sessions"
--   ON book_sessions FOR SELECT USING (
--     EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin','super_admin'))
--   );
-- CREATE POLICY "Admin can update book_sessions"
--   ON book_sessions FOR UPDATE USING (
--     EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin','super_admin'))
--   );

-- For now: RLS blocks direct client access; your API uses service key (bypasses RLS) for admin list/update.
-- If your API uses anon key + auth, add the admin policies above and remove "No public read".

COMMENT ON TABLE book_sessions IS 'Client session booking requests; admin approves/declines and views in calendar.';
