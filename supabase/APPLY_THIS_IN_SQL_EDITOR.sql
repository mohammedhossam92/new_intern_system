-- ============================================
-- Combined Migration: Add Student Profile Fields
-- Execute this entire script in Supabase SQL Editor
-- ============================================

-- PART 1: Add new columns to users table
-- ============================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS class_year VARCHAR(50),
ADD COLUMN IF NOT EXISTS working_days VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration_status VARCHAR(50) DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS current_period_start_date DATE,
ADD COLUMN IF NOT EXISTS current_period_end_date DATE;

-- Add check constraint for period dates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'current_period_dates_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT current_period_dates_check
    CHECK (
      current_period_start_date IS NULL
      OR current_period_end_date IS NULL
      OR current_period_start_date <= current_period_end_date
    );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_registration_status ON users(registration_status);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_class_year ON users(class_year);


-- PART 2: Populate test student account with sample data
-- ============================================

DO $$
DECLARE
  student_id UUID;
BEGIN
  SELECT id INTO student_id FROM auth.users WHERE email = 'student@test.com';

  IF student_id IS NOT NULL THEN
    UPDATE public.users
    SET
      city = 'Cairo',
      class_year = '4th Year',
      working_days = 'Sunday, Monday, Wednesday, Thursday',
      registration_status = 'Active',
      current_period_start_date = '2024-09-01',
      current_period_end_date = '2024-12-31'
    WHERE id = student_id;

    RAISE NOTICE 'Successfully updated test student profile with new fields';
  ELSE
    RAISE NOTICE 'Test student account not found - skipping data population';
  END IF;
END $$;

-- Verify the changes
SELECT
  id,
  first_name,
  last_name,
  city,
  class_year,
  working_days,
  registration_status,
  current_period_start_date,
  current_period_end_date
FROM users
WHERE email = 'student@test.com';
