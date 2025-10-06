-- GasFeel Content Challenge Database Setup
-- Run this in your Supabase SQL Editor

-- Contest table
CREATE TABLE contest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('live', 'verification', 'final')) DEFAULT 'live',
  last_published_at TIMESTAMPTZ,
  freeze_public_display BOOLEAN NOT NULL DEFAULT FALSE,
  rules_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contestants table
CREATE TABLE contestants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  phone_whatsapp TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  department TEXT,
  student_email TEXT UNIQUE,
  current_points INT NOT NULL DEFAULT 0 CHECK (current_points >= 0),
  first_reached_current_points_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Submissions table
CREATE TABLE ai_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contestant_id UUID NOT NULL REFERENCES contestants(id) ON DELETE RESTRICT,
  delta INT NOT NULL CHECK (delta > 0),
  server_received_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'ineligible_late')) DEFAULT 'pending',
  decided_by_user_id TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Score Changes table (append-only ledger)
CREATE TABLE score_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contestant_id UUID NOT NULL REFERENCES contestants(id) ON DELETE RESTRICT,
  source TEXT NOT NULL CHECK (source IN ('csr', 'ai')),
  source_ref_id UUID REFERENCES ai_submissions(id) ON DELETE SET NULL,
  delta INT NOT NULL CHECK (delta > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_by_user_id TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_contestants_external_id ON contestants(external_id);
CREATE INDEX idx_contestants_phone_whatsapp ON contestants(phone_whatsapp);
CREATE INDEX idx_leaderboard_order ON contestants(current_points DESC, first_reached_current_points_at ASC);
CREATE INDEX idx_ai_submissions_contestant_id ON ai_submissions(contestant_id);
CREATE INDEX idx_ai_submissions_status ON ai_submissions(status);
CREATE INDEX idx_ai_submissions_server_received_at ON ai_submissions(server_received_at);
CREATE INDEX idx_score_changes_contestant_id ON score_changes(contestant_id);
CREATE INDEX idx_score_changes_created_at ON score_changes(created_at DESC);

-- Insert sample contest
INSERT INTO contest (name, start_at, end_at, status) 
VALUES ('GasFeel Content Challenge', '2024-01-01T10:00:00.000Z', '2024-12-31T23:59:59.000Z', 'live');

-- Insert sample contestants
INSERT INTO contestants (external_id, phone_whatsapp, first_name, current_points) VALUES
('JohnA1B2', '+2348012345678', 'John Doe', 245),
('JaneC3D4', '+2348012345679', 'Jane Smith', 238),
('BobE5F6', '+2348012345680', 'Bob Johnson', 231),
('AliceG7H8', '+2348012345681', 'Alice Brown', 225),
('CharlieI9J0', '+2348012345682', 'Charlie Wilson', 220),
('DianaK1L2', '+2348012345683', 'Diana Prince', 215),
('EthanM3N4', '+2348012345684', 'Ethan Hunt', 210),
('FionaO5P6', '+2348012345685', 'Fiona Green', 205),
('GeorgeQ7R8', '+2348012345686', 'George Lucas', 200),
('HannahS9T0', '+2348012345687', 'Hannah Montana', 195);

-- Insert sample AI submissions
INSERT INTO ai_submissions (contestant_id, delta, server_received_at, status) 
SELECT 
  c.id,
  10,
  NOW() - INTERVAL '1 day',
  CASE 
    WHEN c.external_id = 'JohnA1B2' THEN 'pending'
    WHEN c.external_id = 'JaneC3D4' THEN 'approved'
    WHEN c.external_id = 'BobE5F6' THEN 'rejected'
    ELSE 'pending'
  END
FROM contestants c 
WHERE c.external_id IN ('JohnA1B2', 'JaneC3D4', 'BobE5F6');

-- Create transaction function for adding points
CREATE OR REPLACE FUNCTION add_points_transaction(
  contestant_id_param UUID,
  points_delta INTEGER,
  source_param TEXT,
  applied_by_user_id_param TEXT,
  new_points INTEGER,
  new_timestamp TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  -- Insert into score_changes ledger
  INSERT INTO score_changes (
    contestant_id,
    source,
    delta,
    created_at,
    applied_by_user_id
  ) VALUES (
    contestant_id_param,
    source_param,
    points_delta,
    new_timestamp,
    applied_by_user_id_param
  );

  -- Update contestant points and timestamp
  UPDATE contestants SET
    current_points = new_points,
    first_reached_current_points_at = new_timestamp,
    updated_at = now()
  WHERE id = contestant_id_param;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_changes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to contestants (for leaderboard)
CREATE POLICY "Allow public read access to contestants" ON contestants
  FOR SELECT USING (true);

-- Create policies for public read access to contest
CREATE POLICY "Allow public read access to contest" ON contest
  FOR SELECT USING (true);

-- Create policies for admin access to ai_submissions
CREATE POLICY "Allow admin access to ai_submissions" ON ai_submissions
  FOR ALL USING (true);

-- Create policies for admin access to score_changes
CREATE POLICY "Allow admin access to score_changes" ON score_changes
  FOR ALL USING (true);
