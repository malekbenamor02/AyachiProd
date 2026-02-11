-- ============================================
-- Aziz Ayachi Gallery Management System
-- Complete Database Migration Script
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Users table (Admin users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Galleries table
CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Media files table
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video')),
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  thumbnail_url VARCHAR(500),
  upload_status VARCHAR(50) DEFAULT 'completed' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,
  metadata JSONB
);

-- Gallery access tokens table
CREATE TABLE IF NOT EXISTS gallery_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  qr_code_data TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0
);

-- Upload sessions table (for chunked uploads)
CREATE TABLE IF NOT EXISTS upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  total_chunks INTEGER NOT NULL,
  uploaded_chunks INTEGER DEFAULT 0,
  r2_upload_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Activity logs table (optional, for tracking)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  gallery_id UUID REFERENCES galleries(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Galleries indexes
CREATE INDEX IF NOT EXISTS idx_galleries_created_by ON galleries(created_by);
CREATE INDEX IF NOT EXISTS idx_galleries_created_at ON galleries(created_at);
CREATE INDEX IF NOT EXISTS idx_galleries_is_active ON galleries(is_active);

-- Media files indexes
CREATE INDEX IF NOT EXISTS idx_media_files_gallery_id ON media_files(gallery_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_upload_status ON media_files(upload_status);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_at ON media_files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_media_files_display_order ON media_files(gallery_id, display_order);

-- Gallery access tokens indexes
CREATE INDEX IF NOT EXISTS idx_tokens_gallery_id ON gallery_access_tokens(gallery_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON gallery_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_is_active ON gallery_access_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON gallery_access_tokens(expires_at);

-- Upload sessions indexes
CREATE INDEX IF NOT EXISTS idx_upload_sessions_gallery_id ON upload_sessions(gallery_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON upload_sessions(status);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_gallery_id ON activity_logs(gallery_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================
-- 3. CREATE FUNCTIONS
-- ============================================

-- Function: Update gallery access count
CREATE OR REPLACE FUNCTION increment_gallery_access(gallery_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE galleries
  SET 
    access_count = access_count + 1,
    last_accessed = NOW()
  WHERE id = gallery_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function: Get gallery statistics
CREATE OR REPLACE FUNCTION get_gallery_stats(gallery_uuid UUID)
RETURNS TABLE (
  file_count BIGINT,
  total_size BIGINT,
  image_count BIGINT,
  video_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as file_count,
    COALESCE(SUM(file_size), 0)::BIGINT as total_size,
    COUNT(*) FILTER (WHERE file_type = 'image')::BIGINT as image_count,
    COUNT(*) FILTER (WHERE file_type = 'video')::BIGINT as video_count
  FROM media_files
  WHERE gallery_id = gallery_uuid
    AND upload_status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE TRIGGERS
-- ============================================

-- Auto-update updated_at for users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for galleries
CREATE TRIGGER update_galleries_updated_at
  BEFORE UPDATE ON galleries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. CREATE VIEWS
-- ============================================

-- Gallery statistics view
CREATE OR REPLACE VIEW gallery_statistics AS
SELECT 
  g.id,
  g.name,
  g.client_name,
  COUNT(mf.id) as file_count,
  COALESCE(SUM(mf.file_size), 0) as total_size,
  g.access_count,
  g.last_accessed,
  g.created_at
FROM galleries g
LEFT JOIN media_files mf ON g.id = mf.gallery_id AND mf.upload_status = 'completed'
WHERE g.is_active = true
GROUP BY g.id, g.name, g.client_name, g.access_count, g.last_accessed, g.created_at;

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Note: Users table uses Supabase Auth, so RLS is handled by Supabase
-- We'll create policies for admin access via service role key

-- Policy: Admins can manage all galleries (via service role)
-- Note: This is handled by backend JWT validation, but we add RLS for extra security
CREATE POLICY "Service role can manage galleries"
  ON galleries FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage media_files"
  ON media_files FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage tokens"
  ON gallery_access_tokens FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 7. INSERT INITIAL DATA (OPTIONAL)
-- ============================================

-- Create admin user (you'll need to create this user in Supabase Auth first)
-- Then link it to the users table
-- Example (replace with your actual user ID from Supabase Auth):
-- INSERT INTO users (id, email, full_name, role)
-- VALUES (
--   'YOUR_SUPABASE_AUTH_USER_ID_HERE',
--   'admin@ayachiprod.com',
--   'Aziz Ayachi',
--   'admin'
-- );

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Next steps:
-- 1. Create admin user in Supabase Auth (Authentication → Users)
-- 2. Link user to users table (see comment above)
-- 3. Test the API endpoints
-- ============================================
