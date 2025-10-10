# ⚠️ Immediate Fixes Needed

## 🔴 Critical Issue: Contest Table Missing

Your database is missing the `contest` table, which is causing:
- ❌ CSR page cannot add points
- ❌ Admin page cannot view contest information  
- ❌ Freeze/Unfreeze button not working

### ✅ Fix: Run this SQL in Supabase SQL Editor

**File:** `fix-contest-table.sql`

```sql
-- Create contest table
CREATE TABLE IF NOT EXISTS contest (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'GasFeel Content Challenge',
    status VARCHAR(50) NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'verification', 'final')),
    freeze_public_display BOOLEAN NOT NULL DEFAULT false,
    end_at TIMESTAMP WITH TIME ZONE,
    start_at TIMESTAMP WITH TIME ZONE,
    rules_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default contest record
INSERT INTO contest (name, status, freeze_public_display, start_at, end_at)
SELECT 
    'GasFeel Content Challenge',
    'live',
    false,
    NOW(),
    NOW() + INTERVAL '14 days',
    NULL
WHERE NOT EXISTS (SELECT 1 FROM contest);
```

---

## ✅ Code Changes Made

### 1. **Leaderboard Now Shows All Contestants**
- Removed limit of 100 contestants
- Zero-point contestants appear at bottom
- Added statistics showing total contestants
- Added "New" badges for zero-point contestants

### 2. **Fixed AI Submissions API Schema Mismatch**
Updated all AI submission APIs to use correct column names:
- `delta` (not `points_awarded`)
- `server_received_at` (not `submitted_at`)
- `decided_by_user_id` (not `admin_notes`)
- `decided_at` (new field)
- Removed `submission_url` (column doesn't exist in your schema)

**Files Updated:**
- `/api/admin/submissions/route.ts` ✅
- `/api/admin/submissions/update/route.ts` ✅
- `/api/admin/submissions/bulk/route.ts` ✅
- `/api/ai/submit-content/route.ts` ✅

---

## 📋 Steps to Fix Everything

### Step 1: Fix Database (Do this first!)
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the contents of `fix-contest-table.sql`
4. Verify by running `check-database.sql`

### Step 2: Test CSR Page
1. Go to `/csr/login`
2. Login with CSR credentials
3. Try adding 100 points to a contestant
4. Should work now! ✅

### Step 3: Test Admin Page
1. Go to `/admin/login`
2. Login with admin credentials
3. Check if contest information displays
4. Try freeze/unfreeze button
5. Should work now! ✅

### Step 4: Test Leaderboard
1. Go to homepage `/`
2. Should see all contestants
3. Statistics card should show totals
4. Search should work for all contestants
5. Should work! ✅

---

## 🧪 Verification Checklist

After running the SQL fix, verify:

- [ ] Contest table exists and has 1 record
- [ ] CSR page loads without errors
- [ ] Admin page loads without errors
- [ ] Can add points on CSR page
- [ ] Can see contest status on Admin page
- [ ] Freeze/Unfreeze button works
- [ ] Leaderboard shows all contestants
- [ ] Zero-point contestants appear at bottom
- [ ] Search works for all contestants

---

## 📝 Next Steps After Fix

1. **Test the complete workflow:**
   - Create AI contestant
   - Submit AI content
   - View submission in admin
   - Approve/reject submission
   - Verify points added

2. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix database sync issues and show all contestants on leaderboard"
   git push
   ```

3. **Deploy to Vercel:**
   - Changes will auto-deploy on push
   - Verify production works correctly

---

## ❓ Questions

1. **Where should we store the submission URL for AI submissions?**
   - Current schema doesn't have a field for it
   - Options:
     - Add `content_url` column to `ai_submissions` table
     - Store in a separate table
     - Don't store it (just notify admin)

2. **Do you want to add an `admin_notes` column?**
   - Useful for admins to add notes about submissions
   - Current schema uses `decided_by_user_id` instead

Let me know once you've run the SQL fix and we can test everything!

