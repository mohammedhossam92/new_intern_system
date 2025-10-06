-- ============================================
-- Add location and round to internship_periods
-- ============================================

-- Add location and round columns to internship_periods table
ALTER TABLE internship_periods
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS round VARCHAR(100);

-- Update existing records with default location if any exist
UPDATE internship_periods
SET location = 'Not specified'
WHERE location IS NULL;

-- Create index for location
CREATE INDEX IF NOT EXISTS idx_internship_periods_location ON internship_periods(location);

-- Insert sample internship periods for test student
DO $$
DECLARE
  student_id UUID;
BEGIN
  SELECT id INTO student_id FROM auth.users WHERE email = 'student@test.com';

  IF student_id IS NOT NULL THEN
    -- Clear any existing periods for this student (for clean testing)
    DELETE FROM internship_periods WHERE user_id = student_id;

    -- Insert Period 1: Completed
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

    -- Insert Period 2: Completed
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

    -- Insert Period 3: In Progress
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
    );

    RAISE NOTICE 'Successfully added 3 internship periods for test student';
  ELSE
    RAISE NOTICE 'Test student account not found - skipping internship data';
  END IF;
END $$;

-- Verify the changes
SELECT
  ip.id,
  u.first_name,
  u.last_name,
  ip.location,
  ip.round,
  ip.start_date,
  ip.end_date,
  ip.status,
  ip.hours_completed,
  ip.total_required_hours
FROM internship_periods ip
JOIN users u ON ip.user_id = u.id
WHERE u.email = 'student@test.com'
ORDER BY ip.start_date DESC;
