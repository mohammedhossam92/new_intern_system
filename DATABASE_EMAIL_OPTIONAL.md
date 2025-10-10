# Database Schema Changes for Optional Email

## Issue Identified
The signup form validation now allows email to be **optional**, but the database schema has email as **NOT NULL**, causing a mismatch that would result in signup failures.

## Current Database Schema (BEFORE)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,  -- ❌ Problem: NOT NULL
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('Intern/Student', 'Doctor', 'Admin')),
  ...
);
```

**Problem**:
- Email field is marked as `NOT NULL UNIQUE`
- Signup form sends empty string `""` when email is not provided
- Database will reject empty strings or NULL values

## Updated Database Schema (AFTER)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,  -- ✅ Fixed: Optional (NULL allowed)
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('Intern/Student', 'Doctor', 'Admin')),
  ...
);
```

**Solution**:
- Removed `NOT NULL` constraint from email column
- Kept `UNIQUE` constraint (emails must still be unique when provided)
- Allows NULL values and empty strings

## Migration File Created

### File: `supabase/migrations/20251010000000_make_email_optional.sql`

```sql
-- Make email optional (remove NOT NULL constraint but keep UNIQUE)
ALTER TABLE users
ALTER COLUMN email DROP NOT NULL;

-- Add a comment to document this change
COMMENT ON COLUMN users.email IS 'Optional email address. Must be unique if provided.';
```

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)
```bash
# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the migration SQL:
   ```sql
   ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
   COMMENT ON COLUMN users.email IS 'Optional email address. Must be unique if provided.';
   ```
4. Click **Run** to execute

### Option 3: Manual SQL Execution
If you're using a local PostgreSQL database:
```bash
psql -U your_username -d your_database -f supabase/migrations/20251010000000_make_email_optional.sql
```

## Impact Analysis

### ✅ What Will Work
1. **Users with email**: Can sign up with email (email will be stored)
2. **Users without email**: Can sign up without email (email will be NULL or empty string)
3. **Unique constraint**: Still enforced - no duplicate emails allowed
4. **Existing users**: Not affected - their emails remain unchanged

### ⚠️ Potential Issues to Watch

#### Issue 1: Empty String vs NULL
**Problem**: The signup form sends empty string `""` instead of `NULL` when email is not provided.

**Solution Options**:
1. **Frontend fix** (Recommended): Modify signup to send `null` instead of empty string
2. **Backend fix**: Add a trigger to convert empty strings to NULL
3. **Leave as-is**: Accept empty strings (PostgreSQL allows this)

**Recommendation**: Leave as-is for now, but consider adding backend validation.

#### Issue 2: Supabase Auth Integration
**Problem**: Supabase Auth might require email for authentication.

**Check**: Verify if your authentication method requires email:
- If using **email/password auth**: Email is required by Supabase Auth
- If using **magic link**: Email is required
- If using **phone auth**: Email is optional ✅
- If using **OAuth**: Email may come from provider

**Your Current Setup**: Based on the signup form collecting phone numbers (mobile), you might need to ensure Supabase is configured for phone authentication.

#### Issue 3: Existing Code Dependencies
**Areas to Check**:
1. **Email notifications**: Code that sends emails should handle NULL/empty email
2. **User search**: Queries filtering by email should handle NULL values
3. **Profile display**: UI should gracefully show "No email provided" or similar

## Related Code Changes

### SignUp.tsx - Email Handling
```typescript
// Current implementation sends empty string
email: formData.email || '', // ✅ Works with updated schema

// Alternative (better practice)
email: formData.email || null, // Sends NULL instead of empty string
```

### AuthContext - Signup Function
Check if the signup function in `AuthContext.tsx` handles optional email correctly:
```typescript
// Should handle both NULL and empty string
interface User {
  firstName: string;
  lastName: string;
  email: string | null; // Allow null
  phone: string;
  role: UserRole;
  // ...
}
```

## Testing Checklist

After applying the migration, test the following scenarios:

### Test 1: Signup Without Email
- [ ] Open signup form
- [ ] Fill all required fields EXCEPT email (leave empty)
- [ ] Submit form
- [ ] **Expected**: User created successfully
- [ ] **Verify**: User record in database has NULL or empty string for email

### Test 2: Signup With Email
- [ ] Open signup form
- [ ] Fill all fields INCLUDING email
- [ ] Submit form
- [ ] **Expected**: User created successfully with email
- [ ] **Verify**: User record has correct email stored

### Test 3: Duplicate Email Prevention
- [ ] Create user with email "test@example.com"
- [ ] Try to create another user with same email
- [ ] **Expected**: Error - "Email already exists"
- [ ] **Verify**: UNIQUE constraint still working

### Test 4: Multiple Users Without Email
- [ ] Create user A without email
- [ ] Create user B without email
- [ ] **Expected**: Both users created successfully
- [ ] **Verify**: Multiple NULL/empty emails allowed

### Test 5: Existing Users Not Affected
- [ ] Query existing users with emails
- [ ] **Verify**: All existing emails still present
- [ ] **Verify**: No data loss occurred

## Rollback Plan

If you need to revert this change:

```sql
-- WARNING: This will fail if any users have NULL email
-- First, you must update NULL emails to valid values

-- Step 1: Update NULL emails to placeholder values
UPDATE users
SET email = 'user_' || id || '@placeholder.local'
WHERE email IS NULL OR email = '';

-- Step 2: Re-add NOT NULL constraint
ALTER TABLE users
ALTER COLUMN email SET NOT NULL;
```

## Files Modified

1. ✅ `supabase/migrations/20251010000000_make_email_optional.sql` - New migration file
2. ✅ `supabase_schema.sql` - Updated documentation schema (line 11)
3. 📄 `DATABASE_EMAIL_OPTIONAL.md` - This documentation file

## Additional Recommendations

### 1. Update User Type Interface
Ensure TypeScript types reflect optional email:

```typescript
// src/types/supabase.ts or similar
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null; // Make optional
  phone: string;
  role: UserRole;
  // ...
}
```

### 2. Add Email Validation When Provided
Even though email is optional, validate format when it IS provided:

```typescript
const validateEmail = (email: string): string | undefined => {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address';
  }
  return undefined;
};
```

### 3. Handle Email Display in UI
```typescript
// In profile components
const displayEmail = user.email || 'No email provided';
```

### 4. Configure Supabase Authentication
If using phone authentication, ensure Supabase project settings have:
- Phone authentication enabled
- SMS provider configured
- Email authentication optional

## Summary

✅ **Migration created**: `20251010000000_make_email_optional.sql`
✅ **Schema updated**: `supabase_schema.sql`
📋 **Action required**: Apply migration to database
⚠️ **Testing required**: Verify signup works with and without email
💡 **Consider**: Sending `null` instead of empty string for better data consistency

---
**Date**: October 10, 2025
**Related**: [Signup Validation Implementation](./SIGNUP_VALIDATION_IMPLEMENTATION.md)
