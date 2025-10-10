-- Fix Empty Contest Table
-- Run this in Supabase SQL Editor

-- Check current state
SELECT 'Current contest records:' as info, COUNT(*) as count FROM contest;

-- Insert contest record if none exists
INSERT INTO contest (
    name, 
    status, 
    freeze_public_display, 
    start_at, 
    end_at,
    rules_url
) 
SELECT 
    'GasFeel Content Challenge',
    'live',
    false,
    NOW() - INTERVAL '1 day',  -- Started yesterday
    NOW() + INTERVAL '13 days', -- Ends in 13 days
    NULL
WHERE NOT EXISTS (SELECT 1 FROM contest);

-- Verify the fix
SELECT 'After fix:' as info, COUNT(*) as count FROM contest;
SELECT id, name, status, freeze_public_display, start_at, end_at FROM contest;

