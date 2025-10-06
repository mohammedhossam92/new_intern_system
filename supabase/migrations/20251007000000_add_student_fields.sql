/*
  # Add Student Profile Fields

  Adds additional fields to the users table for student profiles:
  - city: Student's city location
  - class_year: Student's current class/year
  - working_days: Student's working schedule
  - registration_status: Registration status (Active, Inactive, etc.)
  - current_period_start_date: Current internship period start
  - current_period_end_date: Current internship period end
*/

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS class_year VARCHAR(50),
ADD COLUMN IF NOT EXISTS working_days VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration_status VARCHAR(50) DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS current_period_start_date DATE,
ADD COLUMN IF NOT EXISTS current_period_end_date DATE;

-- Add check constraint for period dates
ALTER TABLE users
ADD CONSTRAINT current_period_dates_check
CHECK (
  current_period_start_date IS NULL
  OR current_period_end_date IS NULL
  OR current_period_start_date <= current_period_end_date
);

-- Create index for filtering by registration status
CREATE INDEX IF NOT EXISTS idx_users_registration_status ON users(registration_status);

-- Create index for filtering by city
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);

-- Create index for filtering by class year
CREATE INDEX IF NOT EXISTS idx_users_class_year ON users(class_year);
