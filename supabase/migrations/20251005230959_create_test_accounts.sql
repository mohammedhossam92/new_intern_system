/*
  # Create Test Accounts

  Creates three authentication accounts with user profiles:
  
  1. Test Student Account
     - Email: student@test.com
     - Password: student123
     - Role: Intern/Student
  
  2. Test Supervisor Doctor Account
     - Email: doctor@test.com
     - Password: doctor123
     - Role: Doctor
  
  3. Super Admin Account
     - Email: mohammedhossam5000@gmail.com
     - Password: admin123
     - Role: Admin
*/

-- Create test student user
DO $$
DECLARE
  student_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'student@test.com',
    crypt('student123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO student_user_id;

  INSERT INTO public.users (
    id,
    first_name,
    last_name,
    email,
    phone,
    role,
    university,
    graduation_year,
    bio
  ) VALUES (
    student_user_id,
    'Test',
    'Student',
    'student@test.com',
    '+1234567890',
    'Intern/Student',
    'Dental University',
    2025,
    'Test student account for development and testing'
  );
END $$;

-- Create test doctor user
DO $$
DECLARE
  doctor_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'doctor@test.com',
    crypt('doctor123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO doctor_user_id;

  INSERT INTO public.users (
    id,
    first_name,
    last_name,
    email,
    phone,
    role,
    university,
    specialization,
    bio
  ) VALUES (
    doctor_user_id,
    'Dr. Test',
    'Supervisor',
    'doctor@test.com',
    '+1234567891',
    'Doctor',
    'Dental Medical Center',
    'Orthodontics',
    'Test supervisor doctor account for development and testing'
  );
END $$;

-- Create super admin user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'mohammedhossam5000@gmail.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO admin_user_id;

  INSERT INTO public.users (
    id,
    first_name,
    last_name,
    email,
    phone,
    role,
    university,
    bio
  ) VALUES (
    admin_user_id,
    'Mohammed',
    'Hossam',
    'mohammedhossam5000@gmail.com',
    '+1234567892',
    'Admin',
    'System Administrator',
    'Super Admin - Full system access'
  );
END $$;