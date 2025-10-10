-- Create Contest Table - Run this in Supabase SQL Editor

-- Step 1: Create the contest table
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

-- Step 2: Clear any existing records and insert fresh one
DELETE FROM contest;

INSERT INTO contest (
    name, 
    status, 
    freeze_public_display, 
    start_at, 
    end_at,
    rules_url
) VALUES (
    'GasFeel Content Challenge',
    'live',
    false,
    NOW(),
    NOW() + INTERVAL '14 days',
    NULL
);

-- Step 3: Verify the table was created and has data
SELECT 
    'Contest table created successfully!' as message,
    COUNT(*) as record_count
FROM contest;

-- Step 4: Show the contest details
SELECT 
    id,
    name,
    status,
    freeze_public_display,
    start_at,
    end_at,
    created_at
FROM contest;

