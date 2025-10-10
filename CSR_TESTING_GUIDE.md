# 🧪 CSR Portal Testing Guide

## Overview
This guide will help you test all CSR (Customer Service Representative) functionalities for the GasFeel Content Challenge platform.

---

## 🔐 CSR Login Credentials

### Default Credentials (if no .env.local exists):
**CSR Account 1:**
- Email: `csr1@example.com`
- Password: `csr123`

**CSR Account 2:**
- Email: `csr2@example.com`
- Password: `csr456`

**Admin Accounts (can also access CSR portal):**
- Email: `admin1@example.com` / Password: `admin123`
- Email: `admin2@example.com` / Password: `admin456`

> **Note:** If you have a `.env.local` file, use the credentials stored there instead:
> - `CSR_EMAIL_1` / `CSR_PASSWORD_1`
> - `CSR_EMAIL_2` / `CSR_PASSWORD_2`

---

## 📝 Pre-Testing Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Verify Supabase Connection
- Ensure your Supabase database is running
- Check that the `contest` table has a valid entry
- Verify the `contestants` table has test data

### 3. Check Contest Status
- Open your Supabase dashboard
- Go to Table Editor → `contest`
- Verify:
  - `status` = `'live'`
  - `end_at` is in the future (not past)
  - `start_at` is in the past (or current time)

---

## 🧪 Test Scenarios

### **Test 1: CSR Login Flow**

#### Steps:
1. Navigate to: `http://localhost:3000/csr/login`
2. Enter CSR credentials:
   - Email: `csr1@example.com`
   - Password: `csr123`
3. Click "Access CSR Portal"

#### Expected Results:
✅ Login successful  
✅ Redirected to `/csr` dashboard  
✅ See header with "CSR Add Points" title  
✅ See contest status banner  
✅ See logout button  

#### Failure Cases to Test:
- ❌ Wrong email → Error: "Invalid email or password"
- ❌ Wrong password → Error: "Invalid email or password"
- ❌ Empty fields → Form validation prevents submission

---

### **Test 2: CSR Dashboard Access (Protected Route)**

#### Steps:
1. Without logging in, try to access: `http://localhost:3000/csr`
2. You should be redirected to login page

#### Expected Results:
✅ Redirected to `/csr/login`  
✅ See "Access Restricted" message  

#### After Login:
1. Login with CSR credentials
2. Access `/csr` directly
3. Should see dashboard without redirect

---

### **Test 3: Add Points - Valid Contestant**

#### Steps:
1. Login to CSR portal
2. Enter a valid contestant ID (e.g., from your leaderboard)
3. Wait for validation (auto-validates after 500ms)
4. Review the preview card showing:
   - Contestant ID
   - Current points
   - Next points (current + 10)
5. Click "Add Points"
6. Confirm in the dialog
7. Wait for success message

#### Expected Results:
✅ Contestant validated successfully  
✅ Preview shows correct current points  
✅ Preview shows correct next points (+100)  
✅ Confirmation dialog appears  
✅ Success message: "100 points added to [ID] successfully!"  
✅ Form resets (contestant ID cleared)  
✅ Points visible on leaderboard after refresh  

---

### **Test 4: Add Points - Invalid Contestant**

#### Steps:
1. Login to CSR portal
2. Enter an invalid contestant ID (e.g., "INVALID123")
3. Wait for validation

#### Expected Results:
✅ Error message: "Contestant ID not found. Please check and try again."  
✅ "Add Points" button is disabled  
✅ No preview card shown  

---

### **Test 5: Add Points - Various ID Formats**

Test these contestant ID formats:

| Input Format | Should Work? | Notes |
|-------------|-------------|-------|
| `JohnA1B2` | ✅ Yes | Mixed case - converts to uppercase |
| `johna1b2` | ✅ Yes | Lowercase - converts to uppercase |
| `JOHNA1B2` | ✅ Yes | Uppercase |
| `John` | ❌ No | Too short (minimum 5 characters) |
| `J123` | ❌ No | Too short |
| `MaryB3C4` | ✅ Yes | Different name format |

#### Steps for each:
1. Enter the ID in the input field
2. Observe validation behavior
3. Check if preview appears

---

### **Test 6: Contest Status Validation**

#### Test 6A: Before Contest Start
1. In Supabase, set `contest.start_at` to a future date
2. Refresh CSR portal
3. Try to add points

**Expected Results:**
✅ Error message: "Challenge has not started yet."  
✅ Input field disabled  
✅ Button disabled  

#### Test 6B: After Contest End
1. In Supabase, set `contest.end_at` to a past date
2. Refresh CSR portal
3. Try to add points

**Expected Results:**
✅ Warning: "Challenge deadline passed. Point additions are disabled."  
✅ Input field disabled  
✅ Button disabled  
✅ Error on submit: "Challenge deadline has passed..."  

#### Test 6C: Contest Not Live
1. In Supabase, set `contest.status` to `'verification'` or `'final'`
2. Refresh CSR portal
3. Try to add points

**Expected Results:**
✅ Error: "Contest is not in live mode"  

---

### **Test 7: Real-Time Leaderboard Updates**

#### Steps:
1. Open two browser windows side-by-side:
   - Window 1: CSR Portal (`http://localhost:3000/csr`)
   - Window 2: Public Leaderboard (`http://localhost:3000`)
2. In CSR portal, add 100 points to a contestant
3. Watch the public leaderboard

#### Expected Results:
✅ Leaderboard updates within 2 seconds (SSE refresh)  
✅ Contestant's points increase by 100  
✅ Rank updates if applicable  
✅ "Live" indicator shows green dot  

---

### **Test 8: Session Management**

#### Test 8A: Logout
1. Login to CSR portal
2. Click "Logout" button
3. Verify redirect to login page
4. Try to access `/csr` again

**Expected Results:**
✅ Logged out successfully  
✅ Redirected to `/csr/login`  
✅ Cannot access protected routes  

#### Test 8B: Token Expiration
1. Login to CSR portal
2. Open browser DevTools → Application → Local Storage
3. Check for `auth_token`
4. Delete the token
5. Try to add points

**Expected Results:**
✅ Error: "No valid authorization header" or 401 error  

---

### **Test 9: Multiple Point Additions**

#### Steps:
1. Login to CSR portal
2. Add 100 points to contestant "JohnA1B2"
3. Wait for success message
4. Immediately add another 100 points to same contestant
5. Add 100 points to a different contestant "MaryB3C4"

#### Expected Results:
✅ First addition: JohnA1B2 gets +100 points  
✅ Second addition: JohnA1B2 gets another +100 points (total +200)  
✅ Third addition: MaryB3C4 gets +100 points  
✅ All updates reflected on leaderboard  

---

### **Test 10: Error Handling**

#### Test 10A: Network Error
1. Disconnect from internet
2. Try to add points

**Expected Results:**
✅ Error message displayed  
✅ Button re-enabled after error  

#### Test 10B: Database Error
1. Stop Supabase or break connection
2. Try to add points

**Expected Results:**
✅ Error message: "Failed to add points"  
✅ Form remains usable  

---

## 🎨 UI/UX Testing

### Mobile Responsiveness
1. Open DevTools → Toggle device toolbar
2. Test on different screen sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

#### Expected Results:
✅ All elements are visible and accessible  
✅ No horizontal scrolling  
✅ Buttons are tap-friendly (min 44px height)  
✅ Text is readable  
✅ Forms are easy to fill out  

### Visual Polish
- ✅ Glass-morphism effects visible
- ✅ Smooth transitions and animations
- ✅ Loading spinners during validation
- ✅ Success/error messages are prominent
- ✅ Confirmation dialog is centered and clear

---

## 🐛 Common Issues & Solutions

### Issue 1: "No contest found in database"
**Solution:** 
```sql
-- Check if contest exists in Supabase
SELECT * FROM contest;

-- If empty, insert a contest
INSERT INTO contest (name, status, start_at, end_at)
VALUES ('FUNAAB Content Challenge', 'live', NOW(), NOW() + INTERVAL '14 days');
```

### Issue 2: "Contestant ID not found"
**Solution:**
```sql
-- Check if contestants exist
SELECT * FROM contestants LIMIT 10;

-- Add a test contestant
INSERT INTO contestants (external_id, current_points, first_reached_current_points_at)
VALUES ('JOHNA1B2', 0, NOW());
```

### Issue 3: Login fails with valid credentials
**Solution:**
- Check browser console for errors
- Verify JWT_SECRET is set in environment
- Clear browser cache and localStorage
- Restart dev server

### Issue 4: Points not updating on leaderboard
**Solution:**
- Check SSE connection (green "Live" indicator)
- Refresh the page manually
- Check browser console for SSE errors
- Verify database update in Supabase

---

## 📊 Testing Checklist

### Pre-Launch Checklist
- [ ] CSR login works with all credentials
- [ ] Protected routes redirect when not logged in
- [ ] Valid contestant IDs are accepted
- [ ] Invalid contestant IDs are rejected
- [ ] Contest timing validation works
- [ ] Points are added correctly (exactly 10)
- [ ] Leaderboard updates in real-time
- [ ] Logout works properly
- [ ] Mobile responsive on all devices
- [ ] Error messages are clear and helpful
- [ ] Success messages display correctly
- [ ] Confirmation dialog works
- [ ] Cannot add points after contest ends
- [ ] Cannot add points before contest starts

---

## 🔍 Database Verification

After each point addition, verify in Supabase:

### Check `contestants` table:
```sql
SELECT external_id, current_points, first_reached_current_points_at, updated_at
FROM contestants
WHERE external_id = 'JOHNA1B2';
```

**Expected:**
- `current_points` increased by 100
- `first_reached_current_points_at` updated to current timestamp
- `updated_at` updated to current timestamp

---

## 🎯 Success Criteria

The CSR portal is production-ready when:

✅ All test scenarios pass  
✅ No console errors during normal operation  
✅ Mobile experience is smooth and responsive  
✅ Error messages are user-friendly  
✅ Points are added accurately and consistently  
✅ Leaderboard updates reflect changes within 2 seconds  
✅ Security: Cannot bypass authentication  
✅ Performance: Page loads quickly (<2s)  

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase connection in Network tab
3. Check database logs in Supabase dashboard
4. Review API responses in Network tab
5. Test with different browsers (Chrome, Firefox, Safari)

---

**Happy Testing! 🚀**

