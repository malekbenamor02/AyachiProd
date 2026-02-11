-- Link Supabase Auth User to Database
-- Run this in Supabase SQL Editor

-- Your User ID from the error message:
-- 536e07de-46da-4de0-8688-3e3dfa055e69

-- Your Email:
-- fmalekbenamorf@gmail.com

INSERT INTO users (id, email, full_name, role)
VALUES (
  '536e07de-46da-4de0-8688-3e3dfa055e69',
  'fmalekbenamorf@gmail.com',
  'Aziz Ayachi',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Verify the user was created
SELECT * FROM users WHERE id = '536e07de-46da-4de0-8688-3e3dfa055e69';
