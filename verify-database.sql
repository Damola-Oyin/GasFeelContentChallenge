-- Verify Database State - Run this to check what's missing

-- Check if contest table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contest')
        THEN '✅ Contest table EXISTS'
        ELSE '❌ Contest table MISSING'
    END as contest_table_status;

-- Check contest records
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contest')
        THEN CONCAT('Contest table has ', COUNT(*), ' record(s)')
        ELSE 'Contest table does not exist'
    END as contest_records
FROM contest;

-- Check all required tables
SELECT 'Required Tables Check:' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('contestants', 'point_transactions', 'contest', 'ai_submissions', 'user_profiles')
        THEN '✅ EXISTS'
        ELSE '❓ UNKNOWN'
    END as status
FROM information_schema.tables 
WHERE table_name IN ('contestants', 'point_transactions', 'contest', 'ai_submissions', 'user_profiles')
ORDER BY table_name;

-- Check contestants count
SELECT 
    'Contestants:' as table_name,
    COUNT(*) as count
FROM contestants;

-- Check point_transactions count  
SELECT 
    'Point Transactions:' as table_name,
    COUNT(*) as count
FROM point_transactions;

