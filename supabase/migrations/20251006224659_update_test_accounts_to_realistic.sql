/*
  # Update Test Accounts to Realistic Data

  This migration updates the test student and doctor accounts with more realistic information
  while keeping the super admin account unchanged.
  
  Changes:
  - Student account: Updated to realistic student information
  - Doctor account: Updated to realistic supervisor doctor information
  - Admin account: No changes (mohammedhossam5000@gmail.com remains)
*/

-- Update student account with realistic information
DO $$
DECLARE
  student_id UUID;
BEGIN
  SELECT id INTO student_id FROM auth.users WHERE email = 'student@test.com';
  
  IF student_id IS NOT NULL THEN
    UPDATE public.users
    SET
      first_name = 'Sarah',
      last_name = 'Johnson',
      phone = '+1-555-0123',
      university = 'Cairo University Faculty of Dentistry',
      graduation_year = 2026,
      bio = 'Fourth-year dental student specializing in restorative dentistry and endodontics. Passionate about patient care and learning advanced clinical techniques.'
    WHERE id = student_id;
  END IF;
END $$;

-- Update doctor account with realistic information
DO $$
DECLARE
  doctor_id UUID;
BEGIN
  SELECT id INTO doctor_id FROM auth.users WHERE email = 'doctor@test.com';
  
  IF doctor_id IS NOT NULL THEN
    UPDATE public.users
    SET
      first_name = 'Ahmed',
      last_name = 'Hassan',
      phone = '+1-555-0456',
      university = 'Cairo University Faculty of Dentistry',
      specialization = 'Prosthodontics and Implantology',
      bio = 'Experienced clinical supervisor with over 12 years of practice. Specialized in prosthodontics, dental implants, and aesthetic dentistry. Dedicated to mentoring the next generation of dental professionals.'
    WHERE id = doctor_id;
  END IF;
END $$;