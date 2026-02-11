# Database Schema
## Aziz Ayachi Gallery Management System

### Database: Supabase (PostgreSQL)

---

## Tables Overview

1. **users** - Admin users (Supabase Auth handles authentication)
2. **galleries** - Client galleries
3. **media_files** - Uploaded images/videos metadata
4. **gallery_access_tokens** - JWT tokens for client access
5. **statistics** - Usage and activity tracking (optional)

---

## Table Definitions

### 1. users

Stores admin user information. Supabase Auth handles authentication, but we store additional profile data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Relationships:**
- One-to-many with `galleries` (admin creates galleries)

---

### 2. galleries

Stores client gallery information.

```sql
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hashed password
  description TEXT,
  event_date DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_galleries_created_by ON galleries(created_by);
CREATE INDEX idx_galleries_created_at ON galleries(created_at);
CREATE INDEX idx_galleries_is_active ON galleries(is_active);
```

**Relationships:**
- Many-to-one with `users` (created_by)
- One-to-many with `media_files`
- One-to-many with `gallery_access_tokens`

**Fields:**
- `name`: Gallery name (e.g., "Wedding Collection - John & Jane")
- `client_name`: Client's name
- `client_email`: Client's email (optional)
- `password_hash`: Hashed password for gallery access
- `event_date`: Date of the event/photoshoot
- `access_count`: Number of times gallery was accessed
- `last_accessed`: Last access timestamp

---

### 3. media_files

Stores metadata for uploaded images and videos.

```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- R2 object key/path
  file_url VARCHAR(500) NOT NULL, -- CDN URL
  file_type VARCHAR(50) NOT NULL, -- 'image' or 'video'
  mime_type VARCHAR(100) NOT NULL, -- e.g., 'image/jpeg', 'video/mp4'
  file_size BIGINT NOT NULL, -- Size in bytes
  width INTEGER, -- For images/videos
  height INTEGER, -- For images/videos
  duration INTEGER, -- For videos (seconds)
  thumbnail_url VARCHAR(500), -- Thumbnail CDN URL (for videos)
  upload_status VARCHAR(50) DEFAULT 'completed' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  display_order INTEGER DEFAULT 0, -- For custom ordering
  metadata JSONB -- Additional metadata (EXIF data, etc.)
);

-- Indexes
CREATE INDEX idx_media_files_gallery_id ON media_files(gallery_id);
CREATE INDEX idx_media_files_file_type ON media_files(file_type);
CREATE INDEX idx_media_files_upload_status ON media_files(upload_status);
CREATE INDEX idx_media_files_uploaded_at ON media_files(uploaded_at);
CREATE INDEX idx_media_files_display_order ON media_files(gallery_id, display_order);
```

**Relationships:**
- Many-to-one with `galleries`
- Many-to-one with `users` (uploaded_by)

**Fields:**
- `file_path`: Cloudflare R2 object key (e.g., "galleries/{gallery_id}/{filename}")
- `file_url`: Full CDN URL for accessing the file
- `upload_status`: Tracks chunked upload progress
- `display_order`: Allows custom ordering of files in gallery
- `metadata`: JSONB for storing EXIF data, video codec info, etc.

---

### 4. gallery_access_tokens

Stores JWT tokens and QR code data for client gallery access.

```sql
CREATE TABLE gallery_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL, -- JWT token string
  qr_code_data TEXT, -- QR code image data (base64) or URL
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_tokens_gallery_id ON gallery_access_tokens(gallery_id);
CREATE INDEX idx_tokens_token ON gallery_access_tokens(token);
CREATE INDEX idx_tokens_is_active ON gallery_access_tokens(is_active);
CREATE INDEX idx_tokens_expires_at ON gallery_access_tokens(expires_at);
```

**Relationships:**
- Many-to-one with `galleries`

**Fields:**
- `token`: The JWT token string used for authentication
- `qr_code_data`: Base64 encoded QR code image or URL to QR code
- `expires_at`: Token expiration (optional, can be null for permanent tokens)
- `usage_count`: Track how many times token was used

---

### 5. upload_sessions (Optional)

Tracks chunked upload sessions for large files.

```sql
CREATE TABLE upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  total_chunks INTEGER NOT NULL,
  uploaded_chunks INTEGER DEFAULT 0,
  r2_upload_id VARCHAR(255), -- Cloudflare R2 multipart upload ID
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_upload_sessions_gallery_id ON upload_sessions(gallery_id);
CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);
```

**Purpose:** Tracks multipart/chunked uploads for large files to Cloudflare R2.

---

### 6. activity_logs (Optional)

Tracks user activity for statistics and auditing.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  gallery_id UUID REFERENCES galleries(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'upload', 'delete', 'view', 'download', etc.
  resource_type VARCHAR(50), -- 'gallery', 'media_file', 'user'
  resource_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_gallery_id ON activity_logs(gallery_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

---

## Views (Optional)

### gallery_statistics

```sql
CREATE VIEW gallery_statistics AS
SELECT 
  g.id,
  g.name,
  g.client_name,
  COUNT(mf.id) as file_count,
  SUM(mf.file_size) as total_size,
  g.access_count,
  g.last_accessed,
  g.created_at
FROM galleries g
LEFT JOIN media_files mf ON g.id = mf.gallery_id
WHERE g.is_active = true
GROUP BY g.id;
```

---

## Row Level Security (RLS) Policies

### Supabase RLS for Security

```sql
-- Enable RLS on all tables
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_access_tokens ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage all galleries"
  ON galleries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
      AND users.is_active = true
    )
  );

-- Clients can only view their own gallery (via token)
-- This is handled by JWT validation in the backend, not RLS
```

**Note:** Since we're using JWT tokens for client access, RLS policies are primarily for admin access via Supabase Auth.

---

## Database Functions

### Function: Update gallery access count

```sql
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
```

### Function: Get gallery statistics

```sql
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
```

---

## Migration Scripts

### Initial Migration

```sql
-- Run in order:
-- 1. Create users table
-- 2. Create galleries table
-- 3. Create media_files table
-- 4. Create gallery_access_tokens table
-- 5. Create upload_sessions table (optional)
-- 6. Create activity_logs table (optional)
-- 7. Create indexes
-- 8. Create views
-- 9. Create functions
-- 10. Enable RLS and create policies
```

---

## Data Types Reference

- **UUID**: For all primary keys and foreign keys
- **VARCHAR(n)**: For strings with known max length
- **TEXT**: For longer text fields (descriptions, etc.)
- **BIGINT**: For file sizes (bytes)
- **INTEGER**: For counts, dimensions, etc.
- **BOOLEAN**: For flags (is_active, etc.)
- **TIMESTAMP WITH TIME ZONE**: For all timestamps
- **JSONB**: For flexible metadata storage
- **DATE**: For event dates

---

## Notes

1. **Soft Deletes**: Consider adding `deleted_at` timestamp for soft deletes instead of hard deletes
2. **Archiving**: Old galleries can be archived (is_active = false) instead of deleted
3. **File Cleanup**: Implement cleanup job to remove orphaned files from R2
4. **Backups**: Supabase handles automatic backups, but consider additional backups for critical data
5. **Performance**: Monitor query performance and add indexes as needed

---

**Last Updated:** 2026  
**Version:** 1.0
