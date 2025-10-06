/*
  # Populate Student Profile Fields for Test Account

  Adds realistic data for the new student profile fields to the test student account.
*/

-- Update test student account with new profile fields
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
  END IF;
END $$;
