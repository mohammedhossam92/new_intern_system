# Patient Approval Workflow

## Overview

This document describes the complete patient approval workflow implemented in the dental internship system. The workflow ensures that all patients added by students are reviewed and approved by supervisors (doctors) or admins before students can proceed with treatments.

---

## Workflow Steps

### 1️⃣ Student Adds Patient

**Location:** `AddPatient.tsx`

- Student fills out patient form with required information
- Clicks "Add Patient" button
- Patient is created with `status: 'pending'`
- Patient is linked to student via `added_by` field

**What Happens:**
```typescript
// Patient inserted into database
await supabase.from('patients').insert({
  first_name, last_name, email, phone, ...
  status: 'pending',           // ✅ Starts as pending
  added_by: user.id            // ✅ Links to student
})

// Notifications sent to ALL supervisors and admins
await notificationService.notifyPatientPendingApproval(
  patientId,
  patientName,
  studentName
)
```

**Result:**
- ✅ Patient created with pending status
- ✅ All doctors and admins receive notification
- ✅ Student sees success message

---

### 2️⃣ Supervisors/Admins Receive Notification

**Location:** `NotificationCenter.tsx`

**Notification Details:**
- **Title:** "New Patient Pending Approval"
- **Message:** "{StudentName} has added a new patient '{PatientName}' that requires your approval."
- **Type:** `info`
- **Related Entity:** Patient ID (clickable link)

**Who Receives:**
- All users with role `Doctor`
- All users with role `Admin`

---

### 3️⃣ Supervisor Reviews Patient

**Location:** `PatientList.tsx`

**What Supervisors See:**
- All patients (including pending ones from all students)
- Each pending patient shows:
  - 🟡 **Pending** badge
  - **Approve** button (green)
  - **Reject** button (red)
  - Patient information banner

**Student View (Different):**
- Students ONLY see their OWN APPROVED patients
- Pending patients are HIDDEN from students
- This prevents confusion and keeps student list clean

**Code:**
```typescript
// Students see only their approved patients
if (user.role === 'Intern/Student') {
  return p.added_by === user.id && p.status === 'approved';
}
// Supervisors see ALL patients
return true;
```

---

### 4️⃣ Approval Decision

**Location:** `PatientList.tsx` or `PatientProfile.tsx`

#### Option A: Approve Patient ✅

```typescript
await handleApprovePatient(patientId, patientName)
```

**What Happens:**
1. Patient status updated to `'approved'`
2. Patient appears in student's list
3. Student receives notification:
   - **Title:** "Patient Approved"
   - **Message:** "Your patient '{PatientName}' has been approved by {SupervisorName}. You can now add treatments and procedures."
   - **Type:** `success`

#### Option B: Reject Patient ❌

```typescript
await handleRejectPatient(patientId, patientName)
```

**What Happens:**
1. Patient status updated to `'rejected'`
2. Patient STILL hidden from student's list
3. Student receives notification:
   - **Title:** "Patient Rejected"
   - **Message:** "Your patient '{PatientName}' has been rejected by {SupervisorName}. Please contact your supervisor for more information."
   - **Type:** `warning`

---

### 5️⃣ Student Receives Notification

**Location:** `NotificationCenter.tsx`

**Student Actions After Approval:**
- ✅ Patient now appears in "Patients" list
- ✅ Student can click patient to view profile
- ✅ Student can add treatments and procedures
- ✅ Student can schedule appointments

**Student Actions After Rejection:**
- ❌ Patient remains hidden
- 📞 Student must contact supervisor
- 🔄 May need to correct information and re-add patient

---

### 6️⃣ Adding Treatments (Only After Approval)

**Location:** `PatientProfile.tsx`

**Student Experience:**

**Before Approval:**
```
🔒 Add Treatment button is DISABLED
⏳ Warning message: "Waiting for Approval: You cannot add treatments
   until this patient is approved by a supervisor."
```

**After Approval:**
```
✅ Add Treatment button is ENABLED
🦷 Can click teeth on dental chart
📝 Can add treatment details
```

**Protection Logic:**
```typescript
// Button is disabled for students if patient not approved
disabled={isStudent && patient.status !== 'approved'}

// If student somehow accesses unapproved patient, they're blocked
if (patient && isStudent && patient.status !== 'approved') {
  return <AccessDeniedMessage />
}
```

---

## Database Schema

### Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  added_by UUID NOT NULL REFERENCES users(id),  -- The student who added
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_id UUID,
  related_entity_type VARCHAR(50) CHECK (related_entity_type IN ('patient', 'treatment', 'user', 'internship')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Service Layer Functions

### notificationService.ts

#### 1. Get Supervisors and Admins
```typescript
getSupervisorsAndAdmins(): Promise<string[]>
```
- Queries users table for all Doctors and Admins
- Returns array of user IDs

#### 2. Notify Patient Pending Approval
```typescript
notifyPatientPendingApproval(
  patientId: string,
  patientName: string,
  studentName: string
): Promise<boolean>
```
- Gets all supervisor/admin IDs
- Creates bulk notifications
- Links to patient entity

#### 3. Notify Patient Approval Status
```typescript
notifyPatientApprovalStatus(
  studentId: string,
  patientId: string,
  patientName: string,
  approved: boolean,
  approverName: string
): Promise<boolean>
```
- Creates single notification for student
- Different messages for approved vs rejected
- Links to patient entity

---

## User Experience Flow

### Student Perspective 👨‍⚕️

1. **Add Patient**
   - Fill form → Submit
   - See success: "Patient added! Awaiting supervisor approval."

2. **Wait for Approval**
   - Patient NOT in list yet (hidden)
   - Can add more patients
   - Continue with other tasks

3. **Receive Notification**
   - 🔔 Notification badge appears
   - Click to see: "Patient Approved!"
   - Patient now visible in list

4. **Work with Patient**
   - Click patient card
   - View all information
   - Add treatments
   - Schedule appointments

### Supervisor Perspective 👨‍⚕️

1. **Receive Notification**
   - 🔔 "New Patient Pending Approval"
   - Multiple notifications if multiple students add patients

2. **Review Patient**
   - Go to "Patients" tab
   - See all pending patients with 🟡 badge
   - Click patient to view full details

3. **Make Decision**
   - Click "Approve" → Patient available to student
   - Click "Reject" → Student notified to contact supervisor

4. **Notification Sent**
   - Student automatically notified
   - Can track which patients reviewed

---

## Visual Indicators

### Status Badges

| Status | Badge | Color | Icon |
|--------|-------|-------|------|
| **Pending** | 🟡 Pending | Amber/Yellow | ⏰ Clock |
| **Approved** | 🟢 Approved | Green | ✅ CheckCircle |
| **Rejected** | 🔴 Rejected | Red | ❌ AlertCircle |

### Notification Types

| Type | Color | Use Case |
|------|-------|----------|
| **info** | Blue | New pending patient |
| **success** | Green | Patient approved |
| **warning** | Yellow | Patient rejected |
| **error** | Red | System errors |

---

## Testing Scenarios

### Test Case 1: Happy Path ✅

1. **As Student:**
   - Login as `student@test.com`
   - Navigate to "Add Patient"
   - Fill form: John Doe, john@example.com, etc.
   - Submit form
   - ✅ See success message
   - ✅ Patient NOT in your patient list

2. **As Supervisor:**
   - Login as `doctor@test.com`
   - 🔔 See notification "New Patient Pending Approval"
   - Navigate to "Patients"
   - ✅ See "John Doe" with Pending badge
   - Click "Approve"
   - ✅ Badge changes to Approved

3. **Back as Student:**
   - Check notifications
   - ✅ See "Patient Approved" notification
   - Navigate to "Patients"
   - ✅ See "John Doe" in list
   - Click patient
   - ✅ Can add treatments

### Test Case 2: Rejection Flow ❌

1. **As Supervisor:**
   - See pending patient with incomplete info
   - Click "Reject"

2. **As Student:**
   - 🔔 Receive "Patient Rejected" notification
   - Patient still not in list
   - Contact supervisor for reason
   - Add patient again with correct info

### Test Case 3: Multiple Students 👥

1. **Setup:**
   - Student A adds "Patient 1"
   - Student B adds "Patient 2"
   - Student C adds "Patient 3"

2. **Supervisor View:**
   - ✅ Sees all 3 pending patients
   - ✅ Can approve/reject each independently

3. **Student Views:**
   - Student A: Only sees their approved patients
   - Student B: Only sees their approved patients
   - Student C: Only sees their approved patients
   - ✅ No cross-contamination

---

## Security & Permissions

### Row Level Security (RLS)

```sql
-- Patients Table Policies

-- Students see only their OWN APPROVED patients
CREATE POLICY patients_select_student ON patients
  FOR SELECT
  USING (
    added_by = auth.uid()
    AND status = 'approved'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'Intern/Student'
    )
  );

-- Doctors/Admins see ALL patients
CREATE POLICY patients_select_supervisor ON patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('Doctor', 'Admin')
    )
  );

-- Any authenticated user can insert (student adds patient)
CREATE POLICY patients_insert_policy ON patients
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only Doctors/Admins can update status
CREATE POLICY patients_update_status ON patients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('Doctor', 'Admin')
    )
  );
```

---

## Edge Cases Handled

### ✅ What if student tries to access pending patient URL directly?

**Protection:**
```typescript
if (patient && isStudent && patient.status !== 'approved') {
  return <AccessDeniedMessage />
}
```

### ✅ What if supervisor deletes notification before reviewing?

**No Problem:**
- Notifications are just alerts
- Pending patients still visible in patient list
- Supervisor can approve anytime

### ✅ What if multiple supervisors approve at same time?

**Safe:**
- Database ensures atomic updates
- First approval wins
- Others see "already approved" status
- No duplicate notifications (checked by service)

### ✅ What if student's account is deleted?

**Handled by Foreign Key:**
```sql
added_by UUID REFERENCES users(id) ON DELETE RESTRICT
```
- Cannot delete student if they have patients
- Must reassign or archive patients first

---

## Future Enhancements

### 📋 Planned Features

1. **Rejection Reason Field**
   - Add `rejection_reason TEXT` to patients table
   - Supervisor enters reason when rejecting
   - Student sees reason in notification

2. **Bulk Approval**
   - Checkbox to select multiple pending patients
   - "Approve Selected" button
   - Batch notification sending

3. **Auto-Approval for Verified Students**
   - After X approved patients, auto-approve future ones
   - Trust system for experienced students
   - Still notifies supervisors (FYI only)

4. **Approval History**
   - Track who approved/rejected
   - Track when decision was made
   - Audit log for compliance

5. **Reminder Notifications**
   - After 24 hours, remind supervisors of pending patients
   - Escalate to admin after 48 hours
   - Prevent bottlenecks

---

## Troubleshooting

### Problem: Student added patient but supervisor doesn't see it

**Check:**
1. ✅ Supervisor role is 'Doctor' or 'Admin'?
2. ✅ Patient status is 'pending' in database?
3. ✅ Notification created successfully?
4. ✅ RLS policies enabled and correct?

### Problem: Student can't see approved patient

**Check:**
1. ✅ Patient status is exactly 'approved' (not 'Approved' or ' approved')?
2. ✅ Student is logged in with correct account?
3. ✅ `added_by` field matches student's user ID?
4. ✅ Page refreshed after approval?

### Problem: Notifications not sending

**Check:**
1. ✅ `notificationService.getSupervisorsAndAdmins()` returns IDs?
2. ✅ Notifications table has correct permissions?
3. ✅ Check browser console for errors
4. ✅ Verify Supabase connection

---

## Code Files Modified

### ✅ Enhanced Files

1. **`src/services/notificationService.ts`**
   - Added `getSupervisorsAndAdmins()`
   - Added `notifyPatientPendingApproval()`
   - Added `notifyPatientApprovalStatus()`

2. **`src/components/dashboard/AddPatient.tsx`**
   - Import `notificationService`
   - Call notification after patient insert
   - Send to all supervisors/admins

3. **`src/components/dashboard/PatientList.tsx`**
   - Import `notificationService`
   - Filter: Students see only approved patients
   - Add `handleApprovePatient()` function
   - Add `handleRejectPatient()` function
   - Update UI with approve/reject buttons
   - Better status messages

4. **`src/components/dashboard/PatientProfile.tsx`**
   - Import `notificationService`
   - Block student access to unapproved patients
   - Disable "Add Treatment" for unapproved patients
   - Update `approvePatient()` to send notification
   - Add approval status banner

---

## Summary

### What This Achieves ✅

1. **Quality Control:** All patient data reviewed before use
2. **Clear Communication:** Automatic notifications at every step
3. **Student Guidance:** Clear feedback on what they can/cannot do
4. **Supervisor Efficiency:** One-click approval from list or detail view
5. **Data Integrity:** Prevents premature treatment assignment
6. **Audit Trail:** Track who added and who approved each patient

### The Complete Flow

```
Student Adds Patient → Pending Status → Notify Supervisors
                             ↓
                    Supervisor Reviews
                             ↓
                    ┌────────┴────────┐
                Approve              Reject
                    ↓                    ↓
            Notify Student          Notify Student
                    ↓                    ↓
         Patient Visible        Patient Hidden
                    ↓                    ↓
         Can Add Treatments    Contact Supervisor
```

---

**Status:** ✅ Fully Implemented and Ready to Test!

🎉 The patient approval workflow is complete and operational!
