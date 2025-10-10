-- Check Database State
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check contest table
SELECT 
    '1. CONTEST TABLE' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contest')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

SELECT 'Contest records:' as info, COUNT(*) as count FROM contest;

-- 2. Check point_transactions table
SELECT 
    '2. POINT_TRANSACTIONS TABLE' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

SELECT 'Point transaction records:' as info, COUNT(*) as count FROM point_transactions;

-- 3. Check add_points_transaction function
SELECT 
    '3. ADD_POINTS_TRANSACTION FUNCTION' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'add_points_transaction'
        )
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- 4. Check ai_submissions columns
SELECT 
    '4. AI_SUBMISSIONS COLUMNS' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'ai_submissions'
ORDER BY ordinal_position;

-- 5. Check contestants table
SELECT 
    '5. CONTESTANTS TABLE' as check_type,
    COUNT(*) as total_contestants,
    COUNT(CASE WHEN current_points > 0 THEN 1 END) as with_points,
    COUNT(CASE WHEN current_points = 0 THEN 1 END) as zero_points
FROM contestants;

-- 6. Check if contest has data
SELECT 
    '6. CONTEST DATA' as check_type,
    id,
    name,
    status,
    freeze_public_display
FROM contest
LIMIT 1;


