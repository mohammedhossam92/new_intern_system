-- ============================================================================
-- FIX: Standardize Phone Numbers for Mobile Login
-- ============================================================================
-- This script converts phone numbers to the correct Egyptian format (01XXXXXXXXX)
-- so users can log in with their mobile numbers.
--
-- PROBLEM: Phone numbers stored as +201056897521
-- SOLUTION: Convert to 01056897521 (remove +20, keep 0 prefix)
-- ============================================================================

-- STEP 1: Check current phone numbers BEFORE changes
SELECT
    first_name || ' ' || last_name AS user_name,
    email,
    phone AS current_phone,
    role
FROM users
ORDER BY role;

-- ============================================================================
-- STEP 2: FIX Egyptian phone numbers (+20 format → 01 format)
-- ============================================================================

-- Convert +201056897521 to 01056897521
UPDATE users
SET phone = '0' || SUBSTRING(phone FROM 4)
WHERE phone LIKE '+20%';

-- ============================================================================
-- STEP 3: Clean up any remaining formatting characters
-- ============================================================================

-- Remove dashes, spaces, and other non-digit characters (except leading +)
UPDATE users
SET phone = REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
WHERE phone ~ '[^0-9+]' OR phone LIKE '%-%' OR phone LIKE '% %';

-- ============================================================================
-- STEP 4: Verify the changes - Check updated phone numbers
-- ============================================================================

SELECT
    first_name || ' ' || last_name AS user_name,
    email,
    phone AS updated_phone,
    role,
    CASE
        WHEN phone ~ '^01[0-9]{9}$' THEN '✅ CORRECT - Egyptian format'
        WHEN phone ~ '^\+20[0-9]{10}$' THEN '⚠️ Still has +20 prefix'
        WHEN phone ~ '^[0-9]{10}$' THEN '⚠️ Missing 0 prefix (10 digits)'
        WHEN phone IS NULL THEN '⚠️ NULL phone'
        ELSE '❌ Invalid format'
    END AS validation_status
FROM users
ORDER BY role;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- Before:
--   Student: +201056897521
--   Doctor: +1-555-0456
--   Admin: +1234567892
--
-- After:
--   Student: 01056897521  ✅ Can log in with this!
--   Doctor: 15550456      (US number, won't work with Egyptian login)
--   Admin: 1234567892     (US number, won't work with Egyptian login)
-- ============================================================================

-- ============================================================================
-- OPTIONAL: If you want to set specific phone numbers manually
-- ============================================================================

-- Example: Update student phone to a known Egyptian number
-- UPDATE users
-- SET phone = '01234567890'
-- WHERE email = 'student@test.com';

-- Example: Update doctor phone
-- UPDATE users
-- SET phone = '01123456789'
-- WHERE email = 'doctor@test.com';

-- Example: Update admin phone
-- UPDATE users
-- SET phone = '01012345678'
-- WHERE email = 'mohammedhossam5000@gmail.com';

-- ============================================================================
-- TESTING: Try these mobile numbers to log in
-- ============================================================================
-- After running this script, you should be able to log in with:
-- Student: 01056897521 (converted from +201056897521)
--
-- For Doctor and Admin, you'll need to set Egyptian phone numbers manually
-- because they currently have US format numbers.
-- ============================================================================
