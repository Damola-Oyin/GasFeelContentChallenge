-- Debug Contest Table Issues

-- 1. Check if contest table exists and has data
SELECT 
    'Table exists:' as check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contest')
        THEN 'YES'
        ELSE 'NO'
    END as result;

-- 2. Count records in contest table
SELECT 
    'Record count:' as check,
    COUNT(*) as result
FROM contest;

-- 3. Show all contest records
SELECT 
    'Contest data:' as check,
    id,
    name,
    status,
    freeze_public_display,
    start_at,
    end_at,
    created_at
FROM contest;

-- 4. Check if there are any NULL values causing issues
SELECT 
    'NULL checks:' as check,
    COUNT(CASE WHEN id IS NULL THEN 1 END) as null_ids,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status,
    COUNT(CASE WHEN name IS NULL THEN 1 END) as null_names
FROM contest;

