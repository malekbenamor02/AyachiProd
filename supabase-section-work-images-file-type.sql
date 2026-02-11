-- Add file_type for work items (image, video, or file) so we can render correctly
ALTER TABLE section_work_images
  ADD COLUMN IF NOT EXISTS file_type VARCHAR(20) DEFAULT 'image';
