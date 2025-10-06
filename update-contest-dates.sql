-- Update contest dates to be current and live
-- Run this in your Supabase SQL Editor

UPDATE contest 
SET 
  start_at = NOW() - INTERVAL '1 day',
  end_at = NOW() + INTERVAL '30 days',
  status = 'live',
  freeze_public_display = false,
  updated_at = NOW()
WHERE name = 'GasFeel Content Challenge';

-- Verify the update
SELECT 
  name,
  start_at,
  end_at,
  status,
  freeze_public_display,
  NOW() as current_time,
  (end_at > NOW()) as is_live
FROM contest;

