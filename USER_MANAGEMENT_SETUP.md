# User Management Setup Guide (Option 3)

This guide shows you how to set up the admin interface for managing users without requiring them to sign in with Google first.

## Step 1: Set Up Enhanced Authentication

1. **Go to your Supabase project** → SQL Editor

2. **Run the enhanced authentication setup**:
   ```sql
   -- Copy and paste the entire content of auth-setup-enhanced.sql
   ```

3. **Replace the example emails** with your actual admin emails:
   ```sql
   -- Replace these with your actual admin emails
   INSERT INTO user_profiles (email, full_name, role) VALUES
   ('your-admin-email@gmail.com', 'Your Name', 'admin'),
   ('another-admin@example.com', 'Another Admin', 'admin'),
   ('csr1@example.com', 'CSR One', 'csr'),
   ('csr2@example.com', 'CSR Two', 'csr')
   ON CONFLICT (email) DO UPDATE SET
     role = EXCLUDED.role,
     full_name = EXCLUDED.full_name;
   ```

## Step 2: Start Your Development Server

```bash
npm run dev
```

## Step 3: Access the User Management Interface

1. **Sign in as an admin** (you'll need to use Google OAuth with one of the emails you added)

2. **Navigate to the user management page**:
   ```
   http://localhost:3000/admin/manage-users
   ```

## Step 4: Add More Users

### Via Web Interface (Recommended):
1. **Enter the email address** of the person you want to add
2. **Select their role**:
   - `public`: Regular user (can only view leaderboard)
   - `csr`: Customer Service Representative (can add points)
   - `admin`: Administrator (can manage everything)
3. **Click "Add User"**

### Via SQL (Alternative):
```sql
INSERT INTO user_profiles (email, full_name, role) VALUES
('new-user@example.com', 'New User Name', 'admin');
```

## Step 5: Users Can Now Sign In

Once you've added users via the interface:

1. **Users visit**: `http://localhost:3000/auth/sign-in`
2. **They sign in with Google** using their pre-registered email
3. **They're automatically granted** the correct permissions based on their role

## Managing Users

### Change User Roles:
- Use the dropdown in the user management interface
- Or update via SQL:
  ```sql
  UPDATE user_profiles 
  SET role = 'admin' 
  WHERE email = 'user@example.com';
  ```

### Deactivate Users:
```sql
UPDATE user_profiles 
SET is_active = false 
WHERE email = 'user@example.com';
```

## Benefits of This Approach

✅ **No Google sign-in required first** - Add users in advance  
✅ **Easy web interface** - No SQL knowledge needed  
✅ **Bulk user management** - Add multiple users quickly  
✅ **Role-based access** - Automatically assign permissions  
✅ **Automatic linking** - Users are connected when they sign in  

## Troubleshooting

### "User already exists" error:
- The email is already in the system
- Use the interface to change their role instead

### "Permission denied" error:
- Make sure you're signed in as an admin
- Check that your email has admin role in the database

### Users can't sign in:
- Verify their email is in `user_profiles` table
- Check that `is_active = true`
- Ensure they're using the exact email address you registered

## Security Notes

- Only admins can access the user management interface
- All user operations are logged
- Users can only be promoted by existing admins
- The system prevents privilege escalation

