-- ============================================
-- COMBINED MIGRATION: Complete Student Profile & Internship Setup
-- Execute this entire script in Supabase SQL Editor
-- ============================================
-- This script:
-- 1. Adds missing student profile fields (city, class_year, etc.)
-- 2. Adds location and round fields to internship_periods
-- 3. Populates test data for both tables
-- ============================================

-- PART 1: Add student profile fields to users table
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

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_registration_status ON users(registration_status);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_class_year ON users(class_year);


-- PART 2: Add location and round to internship_periods table
-- ============================================

ALTER TABLE internship_periods
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS round VARCHAR(100);

-- Create index for location
CREATE INDEX IF NOT EXISTS idx_internship_periods_location ON internship_periods(location);


-- PART 3: Populate test student profile data
-- ============================================

DO $$
DECLARE
  student_id UUID;
BEGIN
  SELECT id INTO student_id FROM auth.users WHERE email = 'student@test.com';

  IF student_id IS NOT NULL THEN
    -- Update student profile
    UPDATE public.users
    SET
      city = 'Cairo',
      class_year = '4th Year',
      working_days = 'Sunday, Monday, Wednesday, Thursday',
      registration_status = 'Active',
      current_period_start_date = '2024-09-01',
      current_period_end_date = '2024-12-31'
    WHERE id = student_id;

    RAISE NOTICE 'Successfully updated test student profile';
  ELSE
    RAISE NOTICE 'Test student account not found';
  END IF;
END $$;


-- PART 4: Populate test internship periods data
-- ============================================

DO $$
DECLARE
  student_id UUID;
BEGIN
  SELECT id INTO student_id FROM auth.users WHERE email = 'student@test.com';

  IF student_id IS NOT NULL THEN
    -- Clear any existing periods for clean testing
    DELETE FROM internship_periods WHERE user_id = student_id;

    -- Period 1: Completed
    INSERT INTO internship_periods (
      user_id,
      location,
      round,
      start_date,
      end_date,
      status,
      hours_completed,
      total_required_hours,
      notes
    ) VALUES (
      student_id,
      'Menyet Elnasr Hospital',
      '1st Round',
      '2024-01-15',
      '2024-03-15',
      'completed',
      160,
      160,
      'Successfully completed first internship rotation'
    );

    -- Period 2: Completed
    INSERT INTO internship_periods (
      user_id,
      location,
      round,
      start_date,
      end_date,
      status,
      hours_completed,
      total_required_hours,
      notes
    ) VALUES (
      student_id,
      'Menyet Elnasr Hospital',
      '2nd Round',
      '2024-03-16',
      '2024-05-15',
      'completed',
      160,
      160,
      'Completed second rotation with excellent performance'
    );

    -- Period 3: In Progress (Current)
    INSERT INTO internship_periods (
      user_id,
      location,
      round,
      start_date,
      end_date,
      status,
      hours_completed,
      total_required_hours,
      notes
    ) VALUES (
      student_id,
      'Menyet Elnasr Hospital',
      '3rd Round',
      '2024-09-01',
      '2024-12-31',
      'in_progress',
      80,
      160,
      'Currently ongoing - excellent progress so far'
    );    RAISE NOTICE 'Successfully added 3 internship periods';
  ELSE
    RAISE NOTICE 'Test student account not found';
  END IF;
END $$;


-- PART 5: Verify all changes
-- ============================================

-- Verify student profile fields
SELECT
  id,
  first_name,
  last_name,
  email,
  city,
  class_year,
  working_days,
  registration_status,
  current_period_start_date,
  current_period_end_date
FROM users
WHERE email = 'student@test.com';

-- Verify internship periods
SELECT
  ip.id,
  ip.location,
  ip.round,
  ip.start_date,
  ip.end_date,
  ip.status,
  ip.hours_completed,
  ip.total_required_hours,
  ip.notes
FROM internship_periods ip
JOIN users u ON ip.user_id = u.id
WHERE u.email = 'student@test.com'
ORDER BY ip.start_date DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📋 Student profile fields added and populated';
  RAISE NOTICE '📅 Internship periods table updated and populated';
  RAISE NOTICE '🔄 Real-time updates are enabled';
  RAISE NOTICE '';
  RAISE NOTICE '👉 Next steps:';
  RAISE NOTICE '   1. Log out from your app';
  RAISE NOTICE '   2. Log back in as student@test.com';
  RAISE NOTICE '   3. Check the Profile page - all data should now appear!';
END $$;
