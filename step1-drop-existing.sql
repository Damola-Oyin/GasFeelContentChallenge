-- STEP 1: DROP EXISTING TABLES AND FUNCTIONS
-- Run this first to clean up existing objects

-- Drop existing functions first (to avoid conflicts)
DROP FUNCTION IF EXISTS add_points_transaction(UUID, INTEGER, VARCHAR, VARCHAR, INTEGER, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS add_points_transaction_with_ref(UUID, INTEGER, VARCHAR, VARCHAR, INTEGER, UUID, TIMESTAMP WITH TIME ZONE);

-- Drop the score_changes table (after backing up data)
DROP TABLE IF EXISTS score_changes;

-- Drop point_transactions table if it exists (in case of previous failed migration)
DROP TABLE IF EXISTS point_transactions;

-- Verify cleanup
SELECT 'Cleanup completed successfully!' as status;
