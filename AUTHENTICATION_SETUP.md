# 🔐 Authentication Setup Guide

## Step 1: Configure Google OAuth in Supabase

1. **Go to Supabase Dashboard**:
   - Navigate to your project: https://supabase.com/dashboard/project/your-project-id
   - Go to **Authentication** → **Providers**

2. **Enable Google Provider**:
   - Find "Google" in the providers list
   - Click **Enable**

3. **Get Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Application type: **Web application**
   - Name: `GasFeel Content Challenge`
   - Authorized redirect URIs: `https://rlumhxiqdqbebrxiescf.supabase.co/auth/v1/callback`

4. **Configure Supabase**:
   - Copy your Google Client ID and Client Secret
   - Paste them in Supabase Google provider settings
   - Save the configuration

## Step 2: Update Environment Variables

Update your `.env.local` file with your Google OAuth credentials:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Supabase Configuration (already set)
NEXT_PUBLIC_SUPABASE_URL=https://rlumhxiqdqbebrxiescf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Set Up Database Schema

Run the authentication setup SQL in your Supabase SQL Editor:

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the contents** of `auth-setup.sql`
3. **Paste and run** the SQL script

This will create:
- `user_profiles` table for role management
- Automatic user profile creation on signup
- Role checking functions
- Proper RLS policies

## Step 4: Set Up Admin Users

After running the SQL setup:

1. **Sign in with Google** using your admin email
2. **Go to SQL Editor** and run:
   ```sql
   -- Replace 'your-admin-email@gmail.com' with your actual email
   UPDATE user_profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@gmail.com';
   ```

3. **Set up CSR users**:
   ```sql
   -- Replace with actual CSR emails
   UPDATE user_profiles 
   SET role = 'csr' 
   WHERE email IN ('csr1@example.com', 'csr2@example.com');
   ```

## Alternative: Pre-create Admin Users (No Google Sign-in Required)

If you want to add admin users without requiring them to sign in with Google first, you can use the enhanced setup:

### Option A: Enhanced SQL Setup
1. **Run the enhanced setup** instead of the regular setup:
   ```bash
   # Copy the enhanced SQL to Supabase SQL Editor
   cat auth-setup-enhanced.sql
   ```

2. **Pre-create admin users**:
   ```sql
   -- Add your admin emails here (replace with actual emails)
   INSERT INTO user_profiles (email, full_name, role) VALUES
   ('admin1@example.com', 'Admin One', 'admin'),
   ('admin2@example.com', 'Admin Two', 'admin'),
   ('csr1@example.com', 'CSR One', 'csr'),
   ('csr2@example.com', 'CSR Two', 'csr')
   ON CONFLICT (email) DO UPDATE SET
     role = EXCLUDED.role,
     full_name = EXCLUDED.full_name;
   ```

### Option B: Admin Interface (Easiest)
1. **Access the user management page**:
   ```
   http://localhost:3000/admin/manage-users
   ```

2. **Add users via the web interface**:
   - Enter their email address
   - Select their role (admin, CSR, or public)
   - Click "Add User"

3. **Users can then sign in with Google** using their pre-registered email address.

**Benefits of these alternatives:**
- ✅ No need for users to sign in first
- ✅ You can pre-register all admins/CSRs
- ✅ Users are automatically linked when they sign in
- ✅ Easy to manage via web interface

## Step 5: Test Authentication

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the flow**:
   - Visit `http://localhost:3000`
   - Click "Sign In with Google"
   - Complete Google OAuth flow
   - You should be redirected back to the leaderboard

3. **Test protected routes**:
   - **CSR Portal**: `http://localhost:3000/csr` (requires CSR or Admin role)
   - **Admin Portal**: `http://localhost:3000/admin` (requires Admin role)

## Step 6: User Management

### **Admin Features**:
- View all users: `GET /api/admin/users`
- Update user roles: `PATCH /api/admin/users`
- Manage user permissions

### **Role Hierarchy**:
- **Admin**: Full access to everything
- **CSR**: Access to CSR portal and add points
- **Public**: Only leaderboard access

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**:
   - Check that your redirect URI in Google Console matches exactly
   - Should be: `https://your-project-id.supabase.co/auth/v1/callback`

2. **"User profile not found"**:
   - Make sure you ran the `auth-setup.sql` script
   - Check that the trigger was created properly

3. **"Access denied"**:
   - Verify your user role in the `user_profiles` table
   - Make sure `is_active = true`

4. **Google OAuth not working**:
   - Verify your Client ID and Secret are correct
   - Check that Google+ API is enabled
   - Ensure redirect URI is properly configured

### Getting Help:

- Check Supabase Auth logs in your dashboard
- Verify environment variables are loaded correctly
- Test with a simple Google sign-in first

## Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Role-based access control** with proper permissions
✅ **Automatic user profile creation** on signup
✅ **Secure session management** via Supabase Auth
✅ **Protected API routes** with role verification
✅ **Audit trail** for all user actions

Your authentication system is now production-ready! 🎉
