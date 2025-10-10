-- STEP 2: CREATE NEW TABLES AND FUNCTIONS
-- Run this after step1-drop-existing.sql

-- Step 1: Create point_transactions table
CREATE TABLE point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contestant_id UUID NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL CHECK (source IN ('csr', 'ai_submission_approval', 'ai_submission_bulk_approval')),
    source_ref_id UUID REFERENCES ai_submissions(id) ON DELETE SET NULL,
    delta INTEGER NOT NULL CHECK (delta > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by_user_id VARCHAR(255) NOT NULL,
    previous_points INTEGER NOT NULL,
    new_points INTEGER NOT NULL CHECK (new_points = previous_points + delta)
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_point_transactions_contestant_id ON point_transactions(contestant_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX idx_point_transactions_source ON point_transactions(source);

-- Step 3: Create the add_points_transaction stored procedure
CREATE OR REPLACE FUNCTION add_points_transaction(
    contestant_id_param UUID,
    points_delta INTEGER,
    source_param VARCHAR(50),
    applied_by_user_id_param VARCHAR(255),
    new_points INTEGER,
    new_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS VOID AS $$
DECLARE
    current_contestant_points INTEGER;
    previous_points INTEGER;
BEGIN
    -- Get current points for the contestant
    SELECT current_points INTO current_contestant_points
    FROM contestants 
    WHERE id = contestant_id_param;
    
    -- Calculate previous points
    previous_points := current_contestant_points;
    
    -- Validate the new_points calculation
    IF new_points != (previous_points + points_delta) THEN
        RAISE EXCEPTION 'Invalid points calculation: new_points (%) should equal previous_points (%) + delta (%)', 
            new_points, previous_points, points_delta;
    END IF;
    
    -- Update contestant points
    UPDATE contestants 
    SET 
        current_points = new_points,
        first_reached_current_points_at = CASE 
            WHEN current_points < new_points THEN new_timestamp
            ELSE first_reached_current_points_at
        END,
        updated_at = NOW()
    WHERE id = contestant_id_param;
    
    -- Create audit record in point_transactions
    INSERT INTO point_transactions (
        contestant_id,
        source,
        delta,
        created_at,
        applied_by_user_id,
        previous_points,
        new_points
    ) VALUES (
        contestant_id_param,
        source_param,
        points_delta,
        new_timestamp,
        applied_by_user_id_param,
        previous_points,
        new_points
    );
    
    -- Verify the update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contestant with id % not found', contestant_id_param;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a function for AI submissions with source_ref_id
CREATE OR REPLACE FUNCTION add_points_transaction_with_ref(
    contestant_id_param UUID,
    points_delta INTEGER,
    source_param VARCHAR(50),
    applied_by_user_id_param VARCHAR(255),
    new_points INTEGER,
    source_ref_id_param UUID DEFAULT NULL,
    new_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS VOID AS $$
DECLARE
    current_contestant_points INTEGER;
    previous_points INTEGER;
BEGIN
    -- Get current points for the contestant
    SELECT current_points INTO current_contestant_points
    FROM contestants 
    WHERE id = contestant_id_param;
    
    -- Calculate previous points
    previous_points := current_contestant_points;
    
    -- Validate the new_points calculation
    IF new_points != (previous_points + points_delta) THEN
        RAISE EXCEPTION 'Invalid points calculation: new_points (%) should equal previous_points (%) + delta (%)', 
            new_points, previous_points, points_delta;
    END IF;
    
    -- Update contestant points
    UPDATE contestants 
    SET 
        current_points = new_points,
        first_reached_current_points_at = CASE 
            WHEN current_points < new_points THEN new_timestamp
            ELSE first_reached_current_points_at
        END,
        updated_at = NOW()
    WHERE id = contestant_id_param;
    
    -- Create audit record in point_transactions
    INSERT INTO point_transactions (
        contestant_id,
        source,
        source_ref_id,
        delta,
        created_at,
        applied_by_user_id,
        previous_points,
        new_points
    ) VALUES (
        contestant_id_param,
        source_param,
        source_ref_id_param,
        points_delta,
        new_timestamp,
        applied_by_user_id_param,
        previous_points,
        new_points
    );
    
    -- Verify the update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contestant with id % not found', contestant_id_param;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Step 5: Add comments for documentation
COMMENT ON TABLE point_transactions IS 'Audit trail for all point changes in the contest system';
COMMENT ON FUNCTION add_points_transaction IS 'Atomic transaction to add points to a contestant and create audit record';
COMMENT ON FUNCTION add_points_transaction_with_ref IS 'Atomic transaction to add points to a contestant with optional AI submission reference';

-- Step 6: Verify the creation
DO $$
BEGIN
    RAISE NOTICE 'Creation completed successfully!';
    RAISE NOTICE 'Created point_transactions table';
    RAISE NOTICE 'Created add_points_transaction stored procedures';
END $$;
