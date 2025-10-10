/*
  # Make Email Optional in Users Table

  This migration makes the email field optional to support users who don't have
  or don't want to provide an email address during registration.

  Changes:
  1. Remove NOT NULL constraint from users.email
  2. Keep UNIQUE constraint (emails must still be unique when provided)
  3. Allow NULL or empty string values

  Note: This supports the new signup form validation where email is optional.
*/

-- Make email optional (remove NOT NULL constraint but keep UNIQUE)
ALTER TABLE users
ALTER COLUMN email DROP NOT NULL;

-- Add a comment to document this change
COMMENT ON COLUMN users.email IS 'Optional email address. Must be unique if provided.';
