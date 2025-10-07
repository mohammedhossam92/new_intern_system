# Patient Approval System - Visual Guide

## 🎨 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        DENTAL INTERNSHIP SYSTEM                   │
│                      Patient Approval Workflow                    │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│    👨‍⚕️ STUDENT      │     │   👨‍⚕️ SUPERVISOR    │     │   🗄️  DATABASE      │
│  (Intern/Student)   │     │  (Doctor/Admin)     │     │   (Supabase)        │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                           │                             │
         │                           │                             │
         │  1. Add Patient           │                             │
         │  ──────────────────────────────────────────────────────>│
         │     status: 'pending'     │                             │
         │                           │                             │
         │                           │  2. Notification Created    │
         │                           │<────────────────────────────│
         │                           │  "New Patient Pending"      │
         │                           │                             │
         │  3. Patient HIDDEN        │                             │
         │  (filtered out)           │                             │
         │                           │                             │
         │                           │  4. Reviews Patient         │
         │                           │  Can view full details      │
         │                           │                             │
         │                           │  5. Clicks Approve/Reject   │
         │                           │  ──────────────────────────>│
         │                           │     Update status           │
         │                           │                             │
         │  6. Notification Received │                             │
         │<─────────────────────────────────────────────────────────│
         │  "Patient Approved"       │                             │
         │                           │                             │
         │  7. Patient NOW VISIBLE   │                             │
         │  Can add treatments       │                             │
         │                           │                             │
```

---

## 🗂️ Database Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      PATIENTS TABLE                          │
├──────────────┬──────────────────────────────────────────────┤
│ id           │ UUID (Primary Key)                           │
│ first_name   │ VARCHAR(100)                                 │
│ last_name    │ VARCHAR(100)                                 │
│ email        │ VARCHAR(255)                                 │
│ phone        │ VARCHAR(20)                                  │
│ status       │ 'pending' | 'approved' | 'rejected'  ← KEY! │
│ added_by     │ UUID (FK → users.id) [The Student]   ← KEY! │
│ created_at   │ TIMESTAMP                                    │
└──────────────┴──────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   NOTIFICATIONS TABLE                        │
├──────────────┬──────────────────────────────────────────────┤
│ id           │ UUID (Primary Key)                           │
│ user_id      │ UUID (FK → users.id) [Who receives] ← KEY!  │
│ title        │ VARCHAR(255)                                 │
│ message      │ TEXT                                         │
│ type         │ 'info' | 'success' | 'warning' | 'error'    │
│ is_read      │ BOOLEAN (default: false)                     │
│ related_...  │ UUID (patient_id)                    ← KEY! │
│ created_at   │ TIMESTAMP                                    │
└──────────────┴──────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        USERS TABLE                           │
├──────────────┬──────────────────────────────────────────────┤
│ id           │ UUID (Primary Key)                           │
│ email        │ VARCHAR(255)                                 │
│ first_name   │ VARCHAR(100)                                 │
│ last_name    │ VARCHAR(100)                                 │
│ role         │ 'Intern/Student' | 'Doctor' | 'Admin' ← KEY!│
└──────────────┴──────────────────────────────────────────────┘
```

---

## 🔄 State Transitions

```
┌─────────────────────────────────────────────────────────────────┐
│                    Patient Status Flow                          │
└─────────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │   PENDING    │  ← Initial state
                        │   🟡 Yellow  │     (Student adds patient)
                        └──────┬───────┘
                               │
                    ┌──────────┴──────────┐
                    │  Supervisor Reviews │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                                 │
              ▼                                 ▼
      ┌──────────────┐                 ┌──────────────┐
      │   APPROVED   │                 │   REJECTED   │
      │   🟢 Green   │                 │   🔴 Red     │
      └──────────────┘                 └──────────────┘
              │                                 │
              │                                 │
      ┌───────▼────────┐              ┌────────▼──────┐
      │ Visible to     │              │ Hidden from   │
      │ Student        │              │ Student       │
      │                │              │               │
      │ Can add        │              │ Must contact  │
      │ treatments     │              │ supervisor    │
      └────────────────┘              └───────────────┘
```

---

## 👥 User Views Comparison

### 📋 Student View (Intern/Student Role)

#### Before Approval:
```
┌─────────────────────────────────────────────────────┐
│ 📊 Dashboard                                 🔔 (1) │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Patients Tab                                       │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │  No patients found                            │ │
│  │  👤                                           │ │
│  │  You haven't added any patients yet           │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Note: Just added "John Doe" but it's hidden      │
│        until supervisor approves ⏳               │
└─────────────────────────────────────────────────────┘
```

#### After Approval:
```
┌─────────────────────────────────────────────────────┐
│ 📊 Dashboard                                 🔔 (1) │
├─────────────────────────────────────────────────────┤
│  🔔 Patient Approved ✅                             │
│  Your patient "John Doe" has been approved!         │
│                                                     │
│  Patients Tab                                       │
│  ┌───────────────────────────────────────────────┐ │
│  │ 👤 John Doe              🟢 Approved          │ │
│  │ Age 25 • 0 treatments                         │ │
│  │ ✉️  john@example.com                          │ │
│  │ 📞 +1234567890                                │ │
│  │                                               │ │
│  │ [Click to view and add treatments]      →    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ✅ Now you can add treatments! 🦷                 │
└─────────────────────────────────────────────────────┘
```

### 👨‍⚕️ Supervisor View (Doctor/Admin Role)

```
┌─────────────────────────────────────────────────────┐
│ 📊 Dashboard                                 🔔 (3) │
├─────────────────────────────────────────────────────┤
│  🔔 New Patient Pending Approval ℹ️                 │
│  Ahmed Hassan added "John Doe"                      │
│                                                     │
│  Patients Tab                                       │
│  ┌───────────────────────────────────────────────┐ │
│  │ 👤 John Doe         🟡 Pending                │ │
│  │ Age 25 • 0 treatments                         │ │
│  │ ✉️  john@example.com                          │ │
│  │ 📞 +1234567890                                │ │
│  │ Added by: Ahmed Hassan                        │ │
│  │                                               │ │
│  │ [✅ Approve]  [❌ Reject]              →      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  │ 👤 Jane Smith       🟢 Approved               │ │
│  │ Age 30 • 3 treatments                         │ │
│  │ Already reviewed                        →      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  📋 Review patient info and make decision           │
└─────────────────────────────────────────────────────┘
```

---

## 🔔 Notification Flow

### Type 1: New Patient Notification (To Supervisors)
```
┌────────────────────────────────────────────┐
│ 🔵 New Patient Pending Approval           │
│ ───────────────────────────────────────── │
│ Ahmed Hassan has added a new patient       │
│ "John Doe" that requires your approval.    │
│                                            │
│ 🔗 View Patient                            │
│                                            │
│ Type: info | Unread | Just now            │
└────────────────────────────────────────────┘

Sent to:
  • All users with role = 'Doctor'
  • All users with role = 'Admin'

Trigger:
  • Student submits "Add Patient" form
```

### Type 2: Approval Notification (To Student)
```
┌────────────────────────────────────────────┐
│ ✅ Patient Approved                        │
│ ───────────────────────────────────────── │
│ Your patient "John Doe" has been approved  │
│ by Dr. Mohammed. You can now add           │
│ treatments and procedures.                 │
│                                            │
│ 🔗 View Patient                            │
│                                            │
│ Type: success | Unread | 2 min ago        │
└────────────────────────────────────────────┘

Sent to:
  • The student who added the patient (added_by)

Trigger:
  • Supervisor clicks "Approve" button
```

### Type 3: Rejection Notification (To Student)
```
┌────────────────────────────────────────────┐
│ ⚠️  Patient Rejected                       │
│ ───────────────────────────────────────── │
│ Your patient "John Doe" has been rejected  │
│ by Dr. Mohammed. Please contact your       │
│ supervisor for more information.           │
│                                            │
│ 🔗 View Patient                            │
│                                            │
│ Type: warning | Unread | 5 min ago        │
└────────────────────────────────────────────┘

Sent to:
  • The student who added the patient (added_by)

Trigger:
  • Supervisor clicks "Reject" button
```

---

## 🎨 UI Components

### Status Badges

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 🟡 Pending      │  │ 🟢 Approved     │  │ 🔴 Rejected     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
  Yellow/Amber          Green                 Red
  Clock icon ⏰        CheckCircle ✅        AlertCircle ❌
```

### Action Buttons

```
Supervisor View - Pending Patient:
┌─────────────┐  ┌─────────────┐
│ ✅ Approve  │  │ ❌ Reject   │
│   (Green)   │  │    (Red)    │
└─────────────┘  └─────────────┘

Student View - Pending Patient:
┌───────────────────────────────────────┐
│ ⏳ Waiting for Approval               │
│ You'll be notified once approved      │
└───────────────────────────────────────┘

Student View - Approved Patient:
┌─────────────┐  ┌───────────────┐
│ View Patient│  │ Add Treatment │
│  (Enabled)  │  │   (Enabled)   │
└─────────────┘  └───────────────┘
```

### Info Banners

```
Student - Pending Patient:
┌──────────────────────────────────────────────────┐
│ ⏳ Waiting for Approval                          │
│ You cannot add treatments until this patient is  │
│ approved by a supervisor. You'll receive a       │
│ notification once approved.                      │
└──────────────────────────────────────────────────┘

Supervisor - Pending Patient:
┌──────────────────────────────────────────────────┐
│ 📋 Patient Pending Approval                      │
│ This patient was added by a student and requires │
│ approval before they can add treatments. Review  │
│ the patient information below.                   │
│                                                  │
│ [✅ Approve Patient]                             │
└──────────────────────────────────────────────────┘

Student - Rejected Patient:
┌──────────────────────────────────────────────────┐
│ ❌ This patient was rejected. Please contact     │
│ your supervisor for details.                     │
└──────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      ADD PATIENT FLOW                          │
└────────────────────────────────────────────────────────────────┘

Student Action:                         Database Changes:
┌─────────────────┐                    ┌──────────────────────┐
│ Fill Patient    │                    │                      │
│ Form            │                    │                      │
└────────┬────────┘                    │                      │
         │                             │                      │
         ▼                             │                      │
┌─────────────────┐                    │                      │
│ Click "Add      │                    │                      │
│ Patient" Button │                    │                      │
└────────┬────────┘                    │                      │
         │                             │                      │
         ▼                             ▼                      │
┌─────────────────┐     INSERT    ┌──────────────────────┐   │
│ Validation OK   │───────────────>│ patients table       │   │
│                 │                │ status: 'pending'    │   │
└─────────────────┘                │ added_by: student_id │   │
                                   └──────────┬───────────┘   │
                                              │               │
                                              ▼               │
                                   ┌──────────────────────┐   │
                                   │ Get Supervisors      │   │
                                   │ (role = Doctor/Admin)│   │
                                   └──────────┬───────────┘   │
                                              │               │
                                              ▼               │
                                   ┌──────────────────────┐   │
                                   │ notifications table  │   │
                                   │ INSERT (bulk)        │   │
                                   │ - Doctor 1           │   │
                                   │ - Doctor 2           │   │
                                   │ - Admin 1            │   │
                                   └──────────────────────┘   │
                                                              │
┌─────────────────────────────────────────────────────────────┘
│                    APPROVAL FLOW
└─────────────────────────────────────────────────────────────┐

Supervisor Action:                      Database Changes:      │
┌─────────────────┐                    ┌──────────────────┐   │
│ View Pending    │                    │                  │   │
│ Patient List    │                    │                  │   │
└────────┬────────┘                    │                  │   │
         │                             │                  │   │
         ▼                             │                  │   │
┌─────────────────┐                    │                  │   │
│ Click Patient   │                    │                  │   │
│ (Review Info)   │                    │                  │   │
└────────┬────────┘                    │                  │   │
         │                             │                  │   │
         ▼                             ▼                  │   │
┌─────────────────┐     UPDATE    ┌──────────────────┐   │   │
│ Click "Approve" │───────────────>│ patients table   │   │   │
│ or "Reject"     │                │ SET status =     │   │   │
└─────────────────┘                │ 'approved' or    │   │   │
                                   │ 'rejected'       │   │   │
                                   └──────────┬───────┘   │   │
                                              │           │   │
                                              ▼           │   │
                                   ┌──────────────────┐   │   │
                                   │ Get added_by     │   │   │
                                   │ (student_id)     │   │   │
                                   └──────────┬───────┘   │   │
                                              │           │   │
                                              ▼           │   │
                                   ┌──────────────────┐   │   │
                                   │ notifications    │   │   │
                                   │ INSERT (single)  │   │   │
                                   │ - To student     │   │   │
                                   │ "Approved/       │   │   │
                                   │  Rejected"       │   │   │
                                   └──────────────────┘   │   │
                                                          │   │
┌─────────────────────────────────────────────────────────┘   │
│                  STUDENT RECEIVES RESULT                     │
└──────────────────────────────────────────────────────────────┘

Student View:
┌─────────────────┐
│ Bell Icon Shows │
│ New Notification│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click Bell      │
│ Read Notification│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ If Approved:    │
│ Patient now     │
│ visible in list │
│                 │
│ If Rejected:    │
│ Patient still   │
│ hidden          │
└─────────────────┘
```

---

## 🎭 Use Case Scenarios

### Scenario 1: Happy Path ✅
```
1. Student Ahmed logs in
2. Goes to "Add Patient" → Fills form for "John Doe"
3. Submits form
4. System creates patient with status='pending'
5. System sends notification to Dr. Mohammed (supervisor)
6. Ahmed checks "Patients" tab → Empty (patient hidden)

7. Dr. Mohammed logs in
8. Sees notification: "Ahmed added John Doe"
9. Clicks notification → Views patient details
10. Reviews information → Clicks "Approve"
11. System updates patient status='approved'
12. System sends notification to Ahmed

13. Ahmed receives notification: "Patient Approved"
14. Ahmed checks "Patients" tab → Sees John Doe
15. Ahmed clicks John Doe → Opens profile
16. Ahmed clicks "Add Treatment" → Works!
17. ✅ SUCCESS
```

### Scenario 2: Rejection Path ❌
```
1-5. Same as Scenario 1

6. Dr. Mohammed reviews John Doe
7. Notices incomplete medical history
8. Clicks "Reject" button
9. System updates status='rejected'
10. System sends notification to Ahmed

11. Ahmed receives notification: "Patient Rejected"
12. Ahmed checks "Patients" tab → Still empty
13. Ahmed contacts Dr. Mohammed
14. Dr. Mohammed explains what's needed
15. Ahmed adds new patient with complete info
16. New approval cycle starts
```

### Scenario 3: Multiple Students 👥
```
Morning:
  • Ahmed adds "John Doe" → pending
  • Sara adds "Jane Smith" → pending
  • Omar adds "Bob Johnson" → pending

Afternoon:
  • Dr. Mohammed sees 3 notifications
  • Reviews all 3 patients
  • Approves John Doe and Jane Smith
  • Rejects Bob Johnson (incomplete)

Result:
  • Ahmed: Sees John Doe (approved)
  • Sara: Sees Jane Smith (approved)
  • Omar: Sees nothing (rejected)
  • Each student only sees their own approved patients
```

---

## 🔒 Security & Permissions

```
┌──────────────────────────────────────────────────────────┐
│                 ROW LEVEL SECURITY (RLS)                  │
└──────────────────────────────────────────────────────────┘

PATIENTS TABLE:

Policy 1: SELECT (Students)
┌────────────────────────────────────────────────────┐
│ Allow if:                                          │
│   • User is the one who added the patient          │
│     (added_by = current_user_id)                   │
│   AND                                              │
│   • Patient status is 'approved'                   │
└────────────────────────────────────────────────────┘

Policy 2: SELECT (Supervisors)
┌────────────────────────────────────────────────────┐
│ Allow if:                                          │
│   • User role is 'Doctor' OR 'Admin'              │
│   (No status restriction - see all patients)      │
└────────────────────────────────────────────────────┘

Policy 3: INSERT (All Authenticated)
┌────────────────────────────────────────────────────┐
│ Allow if:                                          │
│   • User is authenticated (any role)              │
└────────────────────────────────────────────────────┘

Policy 4: UPDATE (Supervisors Only)
┌────────────────────────────────────────────────────┐
│ Allow if:                                          │
│   • User role is 'Doctor' OR 'Admin'              │
│   (Only supervisors can change status)            │
└────────────────────────────────────────────────────┘

NOTIFICATIONS TABLE:

Policy: SELECT
┌────────────────────────────────────────────────────┐
│ Allow if:                                          │
│   • Notification.user_id = current_user_id        │
│   (Users only see their own notifications)        │
└────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Desktop View
```
┌──────────────────────────────────────────────────────────┐
│ 📊 Dashboard                              🔔 (2) 👤     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────┬────────┬────────┬────────┐                 │
│  │Overview│Patients│Treatm..│Schedule│                 │
│  └────────┴────────┴────────┴────────┘                 │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 👤 John Doe           🟡 Pending                │   │
│  │ Age 25 • 0 treatments                           │   │
│  │ ✉️ john@example.com  📞 +1234567890             │   │
│  │                                                 │   │
│  │ [✅ Approve]  [❌ Reject]                →      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌─────────────────────┐
│ 📊  🔔(2)  👤      │
├─────────────────────┤
│ Patients            │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ 👤 John Doe    │ │
│ │ 🟡 Pending     │ │
│ │                │ │
│ │ Age 25         │ │
│ │ john@ex...     │ │
│ │                │ │
│ │ [✅ Approve]   │ │
│ │ [❌ Reject]    │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 👤 Jane Smith  │ │
│ │ 🟢 Approved    │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## ✅ Checklist for Testing

### Pre-Testing
- [ ] Database migration applied
- [ ] Test accounts created (student, doctor, admin)
- [ ] Supabase connection working
- [ ] Notifications table populated

### Student Flow
- [ ] Can add patient
- [ ] Patient not visible after adding (pending)
- [ ] Can see notification when approved
- [ ] Patient visible after approval
- [ ] Can add treatments to approved patient
- [ ] Cannot add treatments to pending patient
- [ ] Receives rejection notification
- [ ] Rejected patient not visible

### Supervisor Flow
- [ ] Receives notification when student adds patient
- [ ] Can see all pending patients
- [ ] Can view patient details
- [ ] Approve button works
- [ ] Reject button works
- [ ] Can see patients from all students
- [ ] Cannot see other supervisors' notifications

### Notifications
- [ ] Created when patient added
- [ ] Sent to all supervisors
- [ ] Created when patient approved
- [ ] Sent to correct student
- [ ] Created when patient rejected
- [ ] Bell icon shows count
- [ ] Clicking notification opens patient

---

**This visual guide complements the other documentation files:**
- `PATIENT_APPROVAL_WORKFLOW.md` - Complete technical workflow
- `PATIENT_APPROVAL_QUICK_TEST.md` - Step-by-step testing
- `IMPLEMENTATION_SUMMARY.md` - Code changes summary
