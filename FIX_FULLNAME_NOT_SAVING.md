# Fix: Full Name Not Saving in Student Profile

## Problem
When editing the student profile and changing the full name, clicking "Save" did not update the full name in the database.

## Root Causes

### 1. StudentProfile Component Not Calling updateProfile
The `handleSave()` function in `StudentProfile.tsx` was only logging data to console but not actually calling the `updateProfile()` function from AuthContext.

**Before:**
```typescript
const handleSave = () => {
  console.log('Saving profile data:', formData);
  setHasBeenSaved(true);
  setIsEditing(false);
};
```

### 2. updateProfile Not Handling fullName
The `updateProfile()` function in `AuthContext.tsx` was not splitting `fullName` into `first_name` and `last_name` for the database.

**Before:**
```typescript
const dbData: Record<string, unknown> = {};
if (userData.firstName !== undefined) dbData.first_name = userData.firstName;
if (userData.lastName !== undefined) dbData.last_name = userData.lastName;
// fullName was never handled!
```

## Solutions Implemented

### Fix 1: StudentProfile Now Calls updateProfile

**File:** `src/components/dashboard/StudentProfile.tsx`

**Changes:**
1. Added `updateProfile` to the destructured values from `useAuth()`
2. Made `handleSave` async and call `updateProfile()` with all form data
3. Added error handling with user feedback

**After:**
```typescript
const { user, updateProfile } = useAuth();

const handleSave = async () => {
  const success = await updateProfile({
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.mobile,
    mobile: formData.mobile,
    university: formData.university,
    city: formData.city,
    registrationStatus: formData.registrationStatus,
    classYear: formData.classYear,
    workingDays: formData.workingDays,
    currentPeriodStartDate: formData.currentPeriodStartDate,
    currentPeriodEndDate: formData.currentPeriodEndDate,
  });

  if (success) {
    console.log('Profile updated successfully');
    setHasBeenSaved(true);
    setIsEditing(false);
  } else {
    console.error('Failed to update profile');
    alert('Failed to update profile. Please try again.');
  }
};
```

### Fix 2: updateProfile Now Handles fullName Properly

**File:** `src/contexts/AuthContext.tsx`

**Changes:**
When `fullName` is provided without explicit `firstName` and `lastName`, the function now:
1. Splits the full name on whitespace
2. Takes the first word as `firstName`
3. Takes remaining words as `lastName`
4. Saves both to the database as `first_name` and `last_name`

**After:**
```typescript
const dbData: Record<string, unknown> = {};

// Handle fullName: if only fullName is provided, split it into firstName and lastName
if (userData.fullName && !userData.firstName && !userData.lastName) {
  const parts = userData.fullName.trim().split(/\s+/);
  dbData.first_name = parts[0] || '';
  dbData.last_name = parts.slice(1).join(' ') || '';
} else {
  // Otherwise use firstName and lastName directly if provided
  if (userData.firstName !== undefined) dbData.first_name = userData.firstName;
  if (userData.lastName !== undefined) dbData.last_name = userData.lastName;
}
```

### Bonus Fix: Admin Role Check

Fixed the role comparison to use `'Admin'` (capital A) instead of `'admin'` to match the UserRole type definition.

**Before:** `const isAdmin = user?.role === 'admin' || false;`
**After:** `const isAdmin = user?.role === 'Admin' || false;`

## How It Works Now

1. User edits "Full Name" field in StudentProfile
2. User clicks "Save Changes"
3. `handleSave()` calls `updateProfile()` with `fullName: "John Doe"`
4. `updateProfile()` detects only `fullName` is provided
5. Splits "John Doe" into:
   - `first_name: "John"`
   - `last_name: "Doe"`
6. Saves to database
7. Updates local state
8. UI reflects the change immediately
9. After page refresh, the updated name persists

## Testing

### Test Case 1: Change Full Name
1. Log in as student
2. Go to Profile
3. Click "Edit Profile"
4. Change "Full Name" from "Sarah Johnson" to "Emily Smith"
5. Click "Save Changes"
6. ✅ Name should update immediately
7. Refresh the page
8. ✅ Name should still be "Emily Smith"

### Test Case 2: Change Other Fields
1. Edit city, class year, working days, etc.
2. Click "Save Changes"
3. ✅ All fields should save correctly

### Test Case 3: Database Verification
Check the database after saving:
```sql
SELECT first_name, last_name, city, class_year
FROM users
WHERE email = 'student@test.com';
```

Should show:
- `first_name`: Emily
- `last_name`: Smith
- `city`: (your updated value)
- `class_year`: (your updated value)

## Files Modified

1. ✅ `src/contexts/AuthContext.tsx`
   - Enhanced `updateProfile()` to handle fullName splitting

2. ✅ `src/components/dashboard/StudentProfile.tsx`
   - Made `handleSave()` async and call `updateProfile()`
   - Added error handling
   - Fixed admin role check
   - Added updateProfile to useAuth destructure

## No Database Changes Required

This fix only required code changes. No database migrations needed since the `first_name` and `last_name` columns already exist.

## Future Enhancements

Consider adding:
- Loading spinner during save operation
- Success toast notification instead of console.log
- Better error messages with specific failure reasons
- Validation for full name format (at least first name required)
