-- Test Database State
-- Run this to check what tables and columns exist

-- Check if contest table exists and has data
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contest')
        THEN 'contest table EXISTS'
        ELSE 'contest table does NOT exist'
    END as contest_table_status;

SELECT COUNT(*) as contest_records FROM contest;

-- Check ai_submissions table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_submissions' 
ORDER BY ordinal_position;

-- Check contestants table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contestants' 
ORDER BY ordinal_position;

-- Check if point_transactions table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions')
        THEN 'point_transactions table EXISTS'
        ELSE 'point_transactions table does NOT exist'
    END as point_transactions_status;

-- Check if stored procedure exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'add_points_transaction'
        )
        THEN 'add_points_transaction function EXISTS'
        ELSE 'add_points_transaction function does NOT exist'
    END as stored_procedure_status;

