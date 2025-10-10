-- Fix Contest Table Issue
-- This script ensures the contest table exists and has data

-- Step 1: Create contest table if it doesn't exist
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

-- Step 2: Insert default contest record if none exists
INSERT INTO contest (name, status, freeze_public_display, start_at, end_at, rules_url)
SELECT 
    'GasFeel Content Challenge',
    'live',
    false,
    NOW(),
    NOW() + INTERVAL '14 days',
    NULL
WHERE NOT EXISTS (SELECT 1 FROM contest);

-- Step 3: Verify the fix
DO $$
DECLARE
    contest_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO contest_count FROM contest;
    RAISE NOTICE '✅ Contest table created/verified successfully!';
    RAISE NOTICE '📊 Contest table has % record(s)', contest_count;
    
    IF contest_count = 0 THEN
        RAISE EXCEPTION 'Contest table exists but has no records. Please check the INSERT statement.';
    END IF;
END $$;

-- Step 4: Display contest details
SELECT 
    id,
    name,
    status,
    freeze_public_display,
    start_at,
    end_at,
    created_at
FROM contest;


