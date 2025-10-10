# Sign In Testing Checklist

## Quick Testing Guide for Email/Mobile Login

### ✅ Pre-Testing Setup
- [ ] Ensure at least one test user has both email and phone number in database
- [ ] Verify phone number format is: 01XXXXXXXXX (11 digits)
- [ ] Have test credentials ready

### 📋 Test Scenarios

#### 1. Email Login ✉️
```
Credentials:
Email: [your-test-email]
Password: [your-password]

Steps:
1. Go to /signin
2. Enter email in "Email or Mobile Number" field
3. Enter password
4. Click "Sign In"

Expected Result: ✅ Successful login → Dashboard
```
**Status**: [ ] Pass  [ ] Fail

---

#### 2. Mobile Login 📱
```
Credentials:
Mobile: 01234567890 (or your test mobile)
Password: [same password as email login]

Steps:
1. Go to /signin
2. Enter mobile number in "Email or Mobile Number" field
3. Enter password
4. Click "Sign In"

Expected Result: ✅ Successful login → Dashboard
```
**Status**: [ ] Pass  [ ] Fail

---

#### 3. Mobile with Spaces
```
Mobile: 01 234 567 890 (with spaces)
Password: [your-password]

Expected Result: ✅ Spaces removed, successful login
```
**Status**: [ ] Pass  [ ] Fail

---

#### 4. Invalid Mobile Format
```
Test Input: 0123456789 (10 digits - missing one)
Password: [your-password]

Expected Result: ❌ Error message displayed
```
**Status**: [ ] Pass  [ ] Fail

---

#### 5. Mobile Not in Database
```
Mobile: 01999999999 (not registered)
Password: any-password

Expected Result: ❌ "Invalid email/mobile or password"
```
**Status**: [ ] Pass  [ ] Fail

---

#### 6. Wrong Password
```
Email or Mobile: [valid credential]
Password: wrong-password

Expected Result: ❌ "Invalid email/mobile or password"
```
**Status**: [ ] Pass  [ ] Fail

---

#### 7. Session Persistence (30 Days)
```
Steps:
1. Sign in with email or mobile
2. Verify you're logged in (see dashboard)
3. Close browser completely
4. Wait 30 seconds
5. Reopen browser
6. Go directly to /dashboard

Expected Result: ✅ Still logged in, dashboard loads without redirect
```
**Status**: [ ] Pass  [ ] Fail

---

#### 8. Session After Browser Restart
```
Steps:
1. Sign in
2. Close ALL browser windows
3. Reopen browser (new session)
4. Navigate to app URL

Expected Result: ✅ Still logged in
```
**Status**: [ ] Pass  [ ] Fail

---

#### 9. Different Browser (Same Device)
```
Steps:
1. Sign in using Chrome
2. Open Firefox (or different browser)
3. Navigate to app URL

Expected Result: ⚠️ NOT logged in (sessions are browser-specific)
```
**Status**: [ ] Pass  [ ] Fail

---

#### 10. Sign Out
```
Steps:
1. Sign in
2. Click profile/user menu
3. Click "Sign Out"
4. Try to access /dashboard

Expected Result: ✅ Redirected to /signin
```
**Status**: [ ] Pass  [ ] Fail

---

### 🔍 Additional Checks

#### UI Verification
- [ ] Label says "Email or Mobile Number" (not just "Email")
- [ ] Placeholder text mentions mobile format: "01XXXXXXXXX"
- [ ] Helper text displays: "You can sign in with either your email address or mobile number"
- [ ] Error messages are clear and helpful

#### Console Checks
```javascript
// Open browser DevTools > Console
// After signing in, check:
localStorage.getItem('dental-system-auth')
// Should return: session data (long encrypted string)

// Check Supabase connection log:
// Should see: "[Supabase] Connected to Supabase backend with Realtime enabled and 30-day session persistence"
```
- [ ] Session data exists in localStorage
- [ ] Console shows Supabase connection message
- [ ] No error messages in console

#### Network Tab Checks
```
Open DevTools > Network tab
Sign in and verify:
1. POST request to /auth/v1/token
2. Response includes access_token and refresh_token
3. No 401 or 403 errors
```
- [ ] Authentication request succeeds (200 OK)
- [ ] Tokens received in response
- [ ] No authentication errors

---

### 🐛 Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "No account found with this mobile" | Phone not in database | Check users table, ensure phone field populated |
| Session doesn't persist | Browser clearing cookies | Check browser settings, disable "Clear on exit" |
| Can't log in on mobile device | Session device-specific | Expected behavior - sign in on each device |
| Login works but dashboard empty | Data fetch issues | Check network tab, verify API calls succeed |
| Type error on login | Form field name mismatch | Verify `emailOrMobile` used consistently |

---

### 📊 Test Summary

**Date**: ___________
**Tester**: ___________

**Results**:
- Total Tests: 10
- Passed: ___
- Failed: ___
- Blocked: ___

**Overall Status**: [ ] All Pass  [ ] Some Failures  [ ] Major Issues

**Notes**:
```
[Add any observations, issues, or comments here]
```

---

### 🚀 Production Deployment Checklist

Before deploying to production:
- [ ] All tests passed
- [ ] Database has phone numbers for existing users
- [ ] Supabase project settings verified
- [ ] Session storage working correctly
- [ ] Error messages are user-friendly
- [ ] Mobile number format validation working
- [ ] Documentation updated
- [ ] Team trained on new login options

---

**Quick Test Command** (for developers):
```javascript
// Test in browser console after opening signin page
document.querySelector('input[name="emailOrMobile"]').value = '01234567890';
document.querySelector('input[name="password"]').value = 'your-password';
document.querySelector('form').requestSubmit();
```
