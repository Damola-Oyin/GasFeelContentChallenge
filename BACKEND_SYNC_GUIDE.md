# Backend Sync Guide

## 🔴 Current Issues

### 1. **Contest Table Missing**
**Error:** `Cannot coerce the result to a single JSON object`

**Impact:**
- CSR cannot add points
- Admin cannot view contest information
- Contest freeze/unfreeze not working

**Fix:** Run `fix-contest-table.sql` in Supabase SQL Editor

---

### 2. **AI Submissions Table Schema Mismatch**
**Error:** `column ai_submissions.submission_url does not exist`

**Current Schema (from database.types.ts):**
```typescript
interface AiSubmission {
  id: string
  contestant_id: string
  delta: number
  server_received_at: string
  status: 'pending' | 'approved' | 'rejected' | 'ineligible_late'
  decided_by_user_id?: string
  decided_at?: string
  created_at: string
  updated_at: string
}
```

**APIs are trying to use:**
- `submission_url` (doesn't exist)
- `submitted_at` (should be `server_received_at`)
- `points_awarded` (doesn't exist, should be `delta`)
- `admin_notes` (doesn't exist)

**Impact:**
- Admin cannot view AI submissions
- AI content submission API may fail

---

## ✅ What We Need to Fix

### Option 1: Update APIs to Match Database Schema (Recommended)
Change the APIs to use the correct column names that exist in the database.

### Option 2: Alter Database Schema
Add the missing columns to the `ai_submissions` table.

---

## 🛠️ Immediate Fixes

### Step 1: Fix Contest Table
```sql
-- Run this in Supabase SQL Editor
-- File: fix-contest-table.sql
```

### Step 2: Update AI Submissions API
The admin submissions API needs to use the correct column names:
- `server_received_at` instead of `submitted_at`
- `delta` instead of `points_awarded`
- Remove `submission_url` and `admin_notes` from SELECT

### Step 3: Update AI Submit Content API
The AI submit content API needs to:
- Use `delta` instead of `points_awarded`
- Use `server_received_at` instead of `submitted_at`
- Remove `submission_url` from INSERT

---

## 📋 Verification Steps

1. **Check Database State:**
   ```bash
   # Run check-database.sql in Supabase SQL Editor
   ```

2. **Verify Tables Exist:**
   - ✅ `contestants` table
   - ✅ `point_transactions` table
   - ❓ `contest` table
   - ❓ `ai_submissions` table (correct schema)
   - ❓ `user_profiles` table

3. **Verify Functions Exist:**
   - ✅ `add_points_transaction` stored procedure

---

## 🎯 Next Steps

1. Run `fix-contest-table.sql` in Supabase SQL Editor
2. Update AI submission APIs to match actual database schema
3. Test CSR add points functionality
4. Test Admin contest controls
5. Test AI submission workflow

---

## 📞 Questions to Answer

1. **Does the `ai_submissions` table have a `content_url` or `submission_url` column?**
   - If not, where should we store the submission URL?

2. **Should we add `admin_notes` column to `ai_submissions`?**
   - Useful for admin to add notes about why submission was rejected/approved

3. **Should we rename `delta` to `points_awarded` for clarity?**
   - Makes the column name more descriptive


