# Database Migration: score_changes → point_transactions

## Overview
This migration replaces the `score_changes` table with `point_transactions` and creates the missing `add_points_transaction` stored procedure.

## Steps to Run Migration

### 1. **Backup Your Database** (IMPORTANT!)
```sql
-- Create backup of score_changes table before migration
CREATE TABLE score_changes_backup AS SELECT * FROM score_changes;
```

### 2. **Run the Migration Script**
Execute the SQL file in your Supabase SQL editor:
```bash
# Copy and paste the contents of migrate-score-changes-to-point-transactions.sql
# into your Supabase SQL editor and run it
```

### 3. **Verify Migration Success**
```sql
-- Check that point_transactions table was created with data
SELECT COUNT(*) FROM point_transactions;

-- Verify contestants table still has correct data
SELECT external_id, current_points FROM contestants LIMIT 5;

-- Test the stored procedure
SELECT add_points_transaction(
    'your-contestant-uuid-here'::UUID,
    10,
    'csr',
    'test@example.com',
    110
);
```

## What This Migration Does

✅ **Creates `point_transactions` table** with proper structure  
✅ **Migrates all data** from `score_changes` to `point_transactions`  
✅ **Calculates `previous_points` and `new_points`** for audit trail  
✅ **Drops `score_changes` table** after successful migration  
✅ **Creates `add_points_transaction` stored procedure**  
✅ **Creates `add_points_transaction_with_ref` for AI submissions**  
✅ **Adds proper indexes** for performance  
✅ **Updates TypeScript types** to match new structure  

## Rollback Plan (if needed)
```sql
-- If you need to rollback, restore from backup
DROP TABLE IF EXISTS point_transactions;
CREATE TABLE score_changes AS SELECT * FROM score_changes_backup;
DROP TABLE score_changes_backup;
```

## After Migration
Your CSR add-points and Admin approval functionality will work correctly with the new `point_transactions` table and `add_points_transaction` stored procedure.
