-- Enhanced Authentication Setup SQL
-- Allows pre-creating admin users without requiring Google sign-in first

-- Create user profiles table for role management
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'csr', 'public')) DEFAULT 'public',
  is_active BOOLEAN NOT NULL DEFAULT true,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Make this optional
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to find existing profile by email
  UPDATE public.user_profiles 
  SET auth_user_id = NEW.id,
      full_name = COALESCE(full_name, NEW.raw_user_meta_data->>'full_name')
  WHERE email = NEW.email;
  
  -- If no existing profile found, create a new one
  IF NOT FOUND THEN
    INSERT INTO public.user_profiles (auth_user_id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      'public' -- Default role
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pre-create admin users (you can add their emails here)
INSERT INTO user_profiles (email, full_name, role) VALUES
('admin1@example.com', 'Admin One', 'admin'),
('admin2@example.com', 'Admin Two', 'admin'),
('csr1@example.com', 'CSR One', 'csr'),
('csr2@example.com', 'CSR Two', 'csr')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles 
    WHERE email = user_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' FROM user_profiles 
    WHERE email = user_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is CSR
CREATE OR REPLACE FUNCTION public.is_csr(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'csr') FROM user_profiles 
    WHERE email = user_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

