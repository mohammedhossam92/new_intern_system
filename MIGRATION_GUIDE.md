# Database Schema Update Guide

## Issue
The student profile fields (city, class_year, working_days, registration_status, current_period_start_date, current_period_end_date) were not showing because these columns don't exist in the database yet.

## Solution
Two new migration files have been created to add these fields to your database.

## How to Apply the Migrations

### Option 1: Using Supabase SQL Editor (Recommended for Hosted Projects)

1. Go to your Supabase Dashboard: https://app.supabase.com/project/uxvlygqhpupgzsarunrs
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20251007000000_add_student_fields.sql`
5. Click **Run** to execute the migration
6. Create another **New Query**
7. Copy and paste the contents of `supabase/migrations/20251007000001_populate_test_student_fields.sql`
8. Click **Run** to execute this migration

### Option 2: Using Supabase CLI (If you have it installed)

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link your project
supabase link --project-ref uxvlygqhpupgzsarunrs

# Push the migrations to your hosted database
supabase db push
```

## What These Migrations Do

### Migration 1: Add Student Fields
- Adds 6 new columns to the `users` table:
  - `city` - Student's city location
  - `class_year` - Student's current year/class
  - `working_days` - Student's working schedule
  - `registration_status` - Registration status (defaults to 'Active')
  - `current_period_start_date` - Current internship period start date
  - `current_period_end_date` - Current internship period end date
- Adds appropriate indexes for performance
- Adds constraint to ensure start date is before end date

### Migration 2: Populate Test Student Data
- Updates the test student account (student@test.com) with sample data:
  - City: Cairo
  - Class Year: 4th Year
  - Working Days: Sunday, Monday, Wednesday, Thursday
  - Registration Status: Active
  - Current Period: 2024-09-01 to 2024-12-31

## After Applying Migrations

Once the migrations are applied, the AuthContext will automatically:
1. Fetch these new fields when a student logs in
2. Display them in the StudentProfile component
3. Allow students to update them through the profile editor

## Verification

After running the migrations, test by:
1. Logging out if you're currently logged in
2. Log in as the test student (student@test.com)
3. Navigate to the Profile page
4. You should now see all the fields populated with data
