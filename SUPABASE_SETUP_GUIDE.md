# 🚀 Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. **Go to Supabase**: Visit [https://supabase.com](https://supabase.com)
2. **Sign up/Login**: Create an account or sign in
3. **Create New Project**:
   - Click "New Project"
   - Choose your organization
   - **Project Name**: `gasfeel-content-challenge`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - Click "Create new project"

4. **Wait for Setup**: This takes 1-2 minutes

## Step 2: Get Your Credentials

Once your project is ready:

1. **Go to Project Settings**:
   - Click the gear icon (⚙️) in the left sidebar
   - Click "API"

2. **Copy Your Credentials**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **API Key (anon public)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update Environment Variables

Edit your `.env.local` file with your actual credentials:

```bash
# Replace with your actual Supabase values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Database Schema

1. **Go to SQL Editor**:
   - In your Supabase dashboard, click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run the Setup Script**:
   - Copy the entire contents of `supabase-setup.sql`
   - Paste it into the SQL editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify Tables Created**:
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `contest`
     - `contestants`
     - `ai_submissions`
     - `score_changes`

## Step 5: Test the Connection

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the pages**:
   - **Public Leaderboard**: http://localhost:3000
   - **CSR Demo**: http://localhost:3000/csr/demo
   - **Admin Portal**: http://localhost:3000/admin-portal

3. **Check for errors**:
   - Look at the browser console for any connection errors
   - Check the terminal for server errors

## Step 6: Verify Data

1. **Check Leaderboard**: You should see 10 sample contestants
2. **Test Search**: Try searching for "JohnA1B2"
3. **Check Admin Portal**: Should show 3 sample AI submissions
4. **Test CSR Demo**: Try adding points to a contestant

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:
   - Double-check your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
   - Make sure there are no extra spaces or quotes

2. **"Failed to fetch" errors**:
   - Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Check if your Supabase project is still building (wait a few minutes)

3. **"Table doesn't exist" errors**:
   - Make sure you ran the complete `supabase-setup.sql` script
   - Check the Table Editor to see which tables were created

4. **CORS errors**:
   - This shouldn't happen with Supabase, but if it does, check your URL format

### Getting Help:

- Check the browser's Network tab for failed requests
- Look at the Supabase dashboard logs
- Verify your environment variables are loaded correctly

## Next Steps After Setup

Once your database is connected:

1. **Test all functionality**:
   - Public leaderboard with real data
   - CSR add points functionality
   - Admin submissions management

2. **Customize data**:
   - Update contest dates in the `contest` table
   - Add your real contestants
   - Configure contest rules

3. **Set up authentication** (optional):
   - Enable Google OAuth in Supabase
   - Configure admin and CSR user roles

## Database Schema Overview

### Tables Created:

- **`contest`**: Contest information (dates, status, freeze settings)
- **`contestants`**: Contestant data (ID, points, contact info)
- **`ai_submissions`**: AI submission tracking (status, approval)
- **`score_changes`**: Audit trail for all point changes

### Functions Created:

- **`add_points_transaction`**: Atomic point addition with audit trail

### Sample Data:

- 1 contest (GasFeel Content Challenge)
- 10 sample contestants with various point totals
- 3 sample AI submissions (pending, approved, rejected)

Your database is now ready for production use! 🎉
